const express = require('express');
const router = express.Router();
const { firestoreUtils } = require('../config/firebase');
const dataService = require('../services/dataService');

// Fonction helper pour vérifier le plan utilisateur
async function checkUserPlan(req, res, next) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.facturation?.planId || 'basique';
        if (userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        next();
    } catch (error) {
        console.error('❌ Erreur vérification plan:', error);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
}

// Page principale du calendrier
router.get('/', async (req, res) => {
    try {
        // Vérifier si l'utilisateur est connecté
        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.redirect('/auth/login');
        }

        // Vérifier si l'utilisateur a un plan Entreprise
        const userPlan = user.facturation?.planId || 'basique';
        console.log(`🔍 Plan utilisateur: ${userPlan}`);
        
        if (userPlan !== 'enterprise') {
            console.log('❌ Accès refusé - Plan insuffisant');
            return res.render('upgrade-required', {
                title: 'Accès refusé - BikoRent',
                currentPage: 'calendrier',
                pageTitle: 'Accès refusé',
                isAuthenticated: true,
                user: req.session.user,
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }
        
        console.log('✅ Accès accordé - plan entreprise détecté');

        // Récupérer les propriétés de l'utilisateur pour les événements
        const properties = await getPropertiesFromDatabase();
        const userProperties = properties.filter(property => 
            property.ownerId === req.session.user.id || 
            property.tenantId === req.session.user.id
        );

        // Récupérer les événements existants
        let events = await getCalendarEvents(req.session.user.id);
        
        // Ajouter les événements automatiques basés sur les propriétés et paiements réels
        const automaticEvents = await generateAutomaticEvents(userProperties, req.session.user.id);
        events = [...events, ...automaticEvents];
        
        // Ajouter les événements basés sur les paiements réels
        const paymentEvents = await generatePaymentEvents(req.session.user.id);
        events = [...events, ...paymentEvents];

        res.render('calendrier', {
            title: 'Calendrier - BikoRent',
            currentPage: 'calendrier',
            pageTitle: 'Calendrier',
            properties: userProperties,
            events: events,
            isAuthenticated: !!req.session.user,
            user: req.session.user
        });

    } catch (error) {
        console.error('Erreur lors du chargement du calendrier:', error);
        res.status(500).render('error', {
            title: 'Erreur - BikoRent',
            message: 'Une erreur est survenue lors du chargement du calendrier.',
            layout: false
        });
    }
});

// API pour créer un nouvel événement
router.post('/api/events', checkUserPlan, async (req, res) => {
    try {

        const { title, description, start, end, propertyId, eventType, location } = req.body;

        // Validation des données
        if (!title || !start || !end || !eventType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Titre, dates et type d\'événement requis' 
            });
        }

        const eventData = {
            //id: generateEventId(),
            title: title,
            description: description || '',
            start: new Date(start),
            end: new Date(end),
            propertyId: propertyId || null,
            eventType: eventType, // 'visite', 'paiement', 'expiration', 'custom'
            location: location || '',
            userId: req.session.user.id,
            createdAt: new Date(),
            googleCalendarId: null // Sera rempli lors de la synchronisation
        };

        // Sauvegarder l'événement
        await saveCalendarEvent(eventData);

        // Synchroniser avec Google Calendar si configuré
        if (req.session.user.googleCalendarConnected) {
            const googleEventId = await syncWithGoogleCalendar(eventData, req.session.user);
            eventData.googleCalendarId = googleEventId;
            await updateCalendarEvent(eventData.id, { googleCalendarId: googleEventId });
        }

        res.json({ 
            success: true, 
            event: eventData,
            message: 'Événement créé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la création de l\'événement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création de l\'événement' 
        });
    }
});

// API pour récupérer les événements d'une période
router.get('/api/events', checkUserPlan, async (req, res) => {
    try {

        const { start, end, propertyId } = req.query;
        
        // Récupérer les événements de calendrier de base
        let events = await getCalendarEvents(req.session.user.id, {
            start: start ? new Date(start) : null,
            end: end ? new Date(end) : null,
            propertyId: propertyId || null
        });

        // Récupérer les propriétés de l'utilisateur pour les événements automatiques
        const allProperties = await firestoreUtils.getAll('properties');
        const userProperties = allProperties.filter(property => 
            property.ownerId === req.session.user.id || property.userId === req.session.user.id
        );

        // Ajouter les événements automatiques basés sur les propriétés
        const automaticEvents = await generateAutomaticEvents(userProperties, req.session.user.id);
        events = [...events, ...automaticEvents];

        // Ajouter les événements basés sur les paiements réels
        const paymentEvents = await generatePaymentEvents(req.session.user.id);
        events = [...events, ...paymentEvents];

        // Déduplication des événements basée sur l'ID
        const uniqueEvents = [];
        const seenIds = new Set();
        
        for (const event of events) {
            if (!seenIds.has(event.id)) {
                seenIds.add(event.id);
                uniqueEvents.push(event);
            } else {
                console.log(`⚠️ Événement dupliqué détecté et supprimé: ${event.id} - ${event.title}`);
            }
        }

        console.log(`📊 API /events: ${uniqueEvents.length} événements uniques retournés (${automaticEvents.length} automatiques, ${paymentEvents.length} paiements)`);

        res.json(uniqueEvents);

    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la récupération des événements' 
        });
    }
});

// API pour mettre à jour un événement
router.put('/api/events/:id', checkUserPlan, async (req, res) => {
    try {

        const eventId = req.params.id;
        const updates = req.body;

        // Vérifier que l'événement appartient à l'utilisateur
        const existingEvent = await getCalendarEventById(eventId);
        if (!existingEvent || existingEvent.userId !== req.session.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Événement non trouvé ou non autorisé' 
            });
        }

        // Mettre à jour l'événement
        const updatedEvent = await updateCalendarEvent(eventId, updates);

        // Synchroniser avec Google Calendar si nécessaire
        if (req.session.user.googleCalendarConnected && existingEvent.googleCalendarId) {
            await updateGoogleCalendarEvent(existingEvent.googleCalendarId, updates);
        }

        res.json({ 
            success: true, 
            event: updatedEvent,
            message: 'Événement mis à jour avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de l\'événement' 
        });
    }
});

// API pour supprimer un événement
router.delete('/api/events/:id', checkUserPlan, async (req, res) => {
    try {

        const eventId = req.params.id;

        // Vérifier que l'événement appartient à l'utilisateur
        const existingEvent = await getCalendarEventById(eventId);
        if (!existingEvent || existingEvent.userId !== req.session.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: 'Événement non trouvé ou non autorisé' 
            });
        }

        // Supprimer de Google Calendar si nécessaire
        if (req.session.user.googleCalendarConnected && existingEvent.googleCalendarId) {
            await deleteGoogleCalendarEvent(existingEvent.googleCalendarId);
        }

        // Supprimer l'événement
        await deleteCalendarEvent(eventId);

        res.json({ 
            success: true, 
            message: 'Événement supprimé avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la suppression de l\'événement' 
        });
    }
});

// API temporaire pour configurer le plan entreprise (à supprimer en production)
router.post('/api/setup-enterprise', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        const userId = req.session.user.id;
        
        // Vérifier si Firebase est initialisé
        if (!firestoreUtils.isInitialized()) {
            return res.json({ 
                success: true, 
                message: 'Mode test - plan entreprise automatiquement activé',
                plan: { plan: 'entreprise', status: 'active' }
            });
        }

        // Créer ou mettre à jour le plan entreprise
        const existingPlans = await firestoreUtils.getAll('billingPlans');
        const existingPlan = existingPlans.find(plan => plan.userId === userId);
        
        if (existingPlan) {
            // Mettre à jour le plan existant
            const updatedPlan = {
                ...existingPlan,
                plan: 'entreprise',
                status: 'active',
                updatedAt: new Date(),
                features: {
                    calendar: true,
                    advancedReports: true,
                    prioritySupport: true,
                    unlimitedProperties: true
                }
            };
            
            await firestoreUtils.update('billingPlans', existingPlan.id, updatedPlan);
        } else {
            // Créer un nouveau plan
            const newPlan = {
                userId: userId,
                userEmail: req.session.user.email,
                plan: 'entreprise',
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
                price: 290,
                currency: 'EUR',
                features: {
                    calendar: true,
                    advancedReports: true,
                    prioritySupport: true,
                    unlimitedProperties: true
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await firestoreUtils.add('billingPlans', newPlan);
        }

        res.json({ 
            success: true, 
            message: 'Plan entreprise configuré avec succès',
            plan: { plan: 'entreprise', status: 'active' }
        });

    } catch (error) {
        console.error('Erreur lors de la configuration du plan entreprise:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la configuration du plan entreprise' 
        });
    }
});

// API pour ajouter un événement automatique (appelé depuis d'autres routes)
router.post('/api/add-automatic-event', async (req, res) => {
    try {
        const { userId, eventType, propertyId, title, description, eventDate } = req.body;

        if (!userId || !eventType || !title) {
            return res.status(400).json({ 
                success: false, 
                message: 'Paramètres requis manquants' 
            });
        }

        const eventData = {
            id: generateEventId(),
            title: title,
            description: description || '',
            start: new Date(eventDate || Date.now()),
            end: new Date(Date.now() + 60 * 60 * 1000), // 1 heure plus tard
            propertyId: propertyId || null,
            eventType: eventType,
            location: '',
            userId: userId,
            createdAt: new Date(),
            isAutomatic: true,
            googleCalendarId: null
        };

        // Sauvegarder l'événement automatique
        await saveCalendarEvent(eventData);

        res.json({ 
            success: true, 
            event: eventData,
            message: 'Événement automatique ajouté avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement automatique:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'ajout de l\'événement automatique' 
        });
    }
});

// API pour vérifier l'authentification Google
router.get('/api/check-google-auth', checkUserPlan, async (req, res) => {
    try {

        // Vérifier si l'utilisateur a des tokens Google stockés
        const user = await firestoreUtils.getById('users', req.session.user.id);
        
        if (user && user.googleTokens && user.googleTokens.access_token) {
            // Vérifier si le token est encore valide (optionnel)
            res.json({ 
                success: true, 
                authenticated: true,
                message: 'Utilisateur authentifié avec Google'
            });
        } else {
            res.json({ 
                success: true, 
                authenticated: false,
                message: 'Utilisateur non authentifié avec Google'
            });
        }

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification Google:', error);
        res.status(500).json({ 
            success: false, 
            authenticated: false,
            message: 'Erreur lors de la vérification de l\'authentification Google' 
        });
    }
});

// API pour synchroniser avec Google Calendar
router.post('/api/sync-google', checkUserPlan, async (req, res) => {
    try {

        // Vérifier si l'utilisateur est authentifié avec Google
        const user = await firestoreUtils.getById('users', req.session.user.id);
        
        if (!user || !user.googleTokens || !user.googleTokens.access_token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Vous devez d\'abord vous connecter avec Google pour synchroniser votre calendrier' 
            });
        }

        // Synchroniser tous les événements avec Google Calendar
        const events = await getCalendarEvents(req.session.user.id);
        const syncResults = [];

        for (const event of events) {
            try {
                const googleEventId = await syncWithGoogleCalendar(event, req.session.user);
                if (googleEventId) {
                    await updateCalendarEvent(event.id, { googleCalendarId: googleEventId });
                    syncResults.push({ eventId: event.id, success: true });
                }
            } catch (error) {
                console.error(`Erreur sync pour l'événement ${event.id}:`, error);
                syncResults.push({ eventId: event.id, success: false, error: error.message });
            }
        }

        res.json({ 
            success: true, 
            results: syncResults,
            message: 'Synchronisation terminée'
        });

    } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la synchronisation avec Google Calendar' 
        });
    }
});

// Fonctions utilitaires pour la gestion des événements

async function generatePaymentEvents(userId) {
    const paymentEvents = [];
    
    try {
        console.log('💰 Calcul des échéances de loyer basées sur les dates d\'entrée des locataires...');
        
        if (!firestoreUtils.isInitialized()) {
            console.log('❌ Firebase non initialisé - aucun événement de paiement généré');
            return paymentEvents;
        }
        
        // Récupérer toutes les collections pour debug
        console.log('🔍 Débogage des collections Firebase...');
        
        const [payments, properties, users] = await Promise.all([
            //firestoreUtils.getAll('tenants').catch(err => { console.log('❌ Erreur collection tenants:', err.message); return []; }),
            firestoreUtils.getAll('payments').catch(err => { console.log('❌ Erreur collection payments:', err.message); return []; }),
            firestoreUtils.getAll('properties').catch(err => { console.log('❌ Erreur collection properties:', err.message); return []; }),
            firestoreUtils.getAll('users').catch(err => { console.log('❌ Erreur collection users:', err.message); return []; })
        ]);
        const userProperties = properties.filter(property => property.ownerId === userId || property.userId === userId);
        const tenantUserIds = userProperties.filter(property => property.tenant).map(property => property.tenant.userId);
        const tenants = users.filter(user => tenantUserIds.includes(user.userId));
        
        const properieIds = userProperties.map(property => property.id);
        const userPayments = payments.filter(payment => properieIds.includes(payment.propertyId));
        
        // Debug des structures de données
        /*if (tenants.length > 0) {
            console.log('📋 Structure du premier locataire:', JSON.stringify(tenants[0], null, 2));
        }
        if (payments.length > 0) {
            console.log('💰 Structure du premier paiement:', JSON.stringify(payments[0], null, 2));
        }
        if (properties.length > 0) {
            console.log('🏠 Structure de la première propriété:', JSON.stringify(properties[0], null, 2));
        }*/
        
        // Filtrer les locataires de l'utilisateur
        /*let userTenants = [];
        
        console.log(`👤 ${userTenants.length} locataires pour l'utilisateur ${userId}`);
        
        // Si pas de locataires, essayer d'utiliser les propriétés avec des locataires
        if (userTenants.length === 0 && properties.length > 0) {
            //console.log('🔄 Aucun locataire trouvé, utilisation des propriétés avec locataires...');
            userTenants = properties.filter(property => 
                (property.ownerId) &&
                (property.tenant || property.status === 'rented')
            ).map(property => ({
                id: property.tenant.userId,
                propertyId: property.id,
                propertyName: property.name || property.title,
                propertyAddress: property.address || property.location,
                ownerId: property.ownerId || userId,
                loyer: property.rent || property.monthlyRent,
                monthlyRent: property.rent || property.monthlyRent,
                dateEntree: property.tenant.entryDate || property.entryDate || new Date().toISOString().split('T')[0],
                entryDate: property.tenant.entryDate || property.entryDate || new Date().toISOString().split('T')[0]
            }));
            console.log(`🏠 ${userTenants.length} propriétés avec locataires trouvées`);
        }*/        
        // Calculer les échéances pour chaque locataire basées sur sa date d'entrée
        

        /*for(property of userProperties) {
            const entryDate = new Date(property.entryDate || new Date().toISOString().split('T')[0]);
            const createdDate = new Date(property.createdAt || new Date().toISOString().split('T')[0]);
            const createdMonth = createdDate.getMonth();
            const createdYear = createdDate.getFullYear();
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const monthsSinceCreated = (currentYear - createdYear) * 12 + (currentMonth - createdMonth);
            const tenant = users.find(user => user.userId === property.tenant.userId);
            for(let i = 0; i < monthsSinceCreated; i++) {
                const dueDate = new Date(createdYear, createdMonth + i, 1);
                const dueDateEnd = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
                const paymentEvent = {
                    id: `rent_due_${property.id}_${dueDate.getFullYear()}_${dueDate.getMonth()}`,
                    title: `Échéance loyer - ${property.name || property.title}`,
                    description: `Échéance loyer: ${property.rent || property.monthlyRent || 0} xaf`,
                    start: dueDate,
                    end: dueDateEnd,
                    propertyId: property.id,
                    eventType: 'paiement',
                    location: property.address || property.location || '',
                    userId: userId,
                    isAutomatic: true,
                    googleCalendarId: null,
                    tenantId: property.tenant.userId,
                    tenantName: tenant.name || tenant.firstName + ' ' + tenant.lastName,
                    entryDate: entryDate.toISOString()
                };
                paymentEvents.push(paymentEvent);
                console.log(`  💳 ${dueDate.toLocaleDateString()}: ${property.rent || property.monthlyRent || 0} xaf - paiement`);
            }
         }
        */
        //Echéances de loyer reçus
        for(payment of userPayments) {
            const dueDate = new Date(payment.date || payment.createdAt);
            const dueDateEnd = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
            const property = properties.find(property => property.id === payment.propertyId);
            const tenant = users.find(user => user.id === payment.userId);
            console.log('payment', payment);
            const paymentEvent = {
                id: `rent_due_${property.id}_${dueDate.getFullYear()}_${dueDate.getMonth()}`,
                title: `Échéance loyer - ${property.name || property.title}`,
                description: `Échéance loyer: ${property.rent || property.monthlyRent || 0} xaf`,
                start: dueDate,
                end: dueDateEnd,
                propertyId: property.id,
                eventType: 'paiement_reçu',
                location: property.address || property.location || '',
                userId: payment.userId,
                isAutomatic: true,
                googleCalendarId: null,
                tenantId: payment.userId,
                tenantName: tenant.profile.firstName + ' ' + tenant.profile.lastName,
            };
            paymentEvents.push(paymentEvent);
            console.log(`  💳 ${dueDate.toLocaleDateString()}: ${property.rent || property.monthlyRent || 0} xaf - paiement`);
            
        }
        
        console.log(`✅ ${paymentEvents.length} échéances de loyer calculées`);
        
        // Debug final
        if (paymentEvents.length === 0) {
            console.log('⚠️ Aucune échéance générée. Vérifiez:');
            console.log('  - Les collections tenants/payments existent-elles ?');
            console.log('  - Y a-t-il des locataires pour cet utilisateur ?');
            console.log('  - Les propriétés ont-elles des locataires ?');
            console.log('  - Les dates d\'entrée sont-elles valides ?');
        } else {
            console.log('🎉 Échéances générées avec succès:');
            paymentEvents.slice(0, 3).forEach(event => {
                console.log(`  📅 ${event.start.toLocaleDateString()}: ${event.title} (${event.eventType})`);
            });
            if (paymentEvents.length > 3) {
                console.log(`  ... et ${paymentEvents.length - 3} autres échéances`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du calcul des échéances de loyer:', error);
    }
    
    return paymentEvents;
}


async function generateAutomaticEvents(properties, userId) {
    const automaticEvents = [];
    
    console.log('🔍 Récupération des événements automatiques depuis la base de données...');
    
    if (!firestoreUtils.isInitialized()) {
        console.log('❌ Firebase non initialisé - aucun événement automatique généré');
        return automaticEvents;
    }
    
    try {
        // Récupérer les événements de calendrier réels depuis Firebase
        const calendarEvents = await firestoreUtils.getAll('calendarEvents');
        console.log(`📊 ${calendarEvents.length} événements de calendrier trouvés dans la base de données`);
        
        // Filtrer les événements de l'utilisateur
        const userEvents = calendarEvents.filter(event => 
            event.userId === userId || event.ownerId === userId
        );
        
        console.log(`👤 ${userEvents.length} événements pour l'utilisateur ${userId}`);
        
        // Convertir les événements réels en format calendrier
        userEvents.forEach(event => {
            // Convertir les dates Firebase Timestamp en Date JavaScript
            let startDate, endDate;
            
            if (event.start && typeof event.start === 'object' && event.start.seconds) {
                // Format Firebase Timestamp
                startDate = new Date(event.start.seconds * 1000);
            } else if (event.start) {
                // Format ISO string ou autre
                startDate = new Date(event.start);
            } else if (event.date) {
                // Fallback sur event.date
                startDate = new Date(event.date);
            } else {
                console.log(`⚠️ Aucune date de début trouvée pour l'événement ${event.id}, ignoré`);
                return;
            }
            
            if (event.end && typeof event.end === 'object' && event.end.seconds) {
                // Format Firebase Timestamp
                endDate = new Date(event.end.seconds * 1000);
            } else if (event.end) {
                // Format ISO string ou autre
                endDate = new Date(event.end);
            } else {
                // Par défaut, fin de journée
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            }
            
            // Vérifier que les dates sont valides
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.log(`⚠️ Date invalide pour l'événement ${event.id}, ignoré`);
                return;
            }
            
            const calendarEvent = {
                id: event.id,
                title: event.title,
                description: event.description || '',
                start: startDate,
                end: endDate,
                propertyId: event.propertyId || null,
                eventType: event.eventType || event.type || 'custom',
                location: event.location || '',
                userId: userId,
                isAutomatic: event.isAutomatic || false,
                googleCalendarId: event.googleCalendarId || null
            };
            
            automaticEvents.push(calendarEvent);
            console.log(`  📅 Événement réel: ${calendarEvent.title} - ${startDate.toLocaleDateString()}`);
        });
        
        console.log(`✅ ${automaticEvents.length} événements automatiques réels récupérés`);
        
        // Générer des événements automatiques basés sur les propriétés
        console.log('🏠 Génération d\'événements automatiques basés sur les propriétés...');
        
        for (const property of properties) {
            console.log(`📋 Traitement de la propriété: ${property.name || property.title || property.id}`);
            
            // Événement de création de propriété
            if (property.createdAt) {
                const creationDate = new Date(property.createdAt);
                if (!isNaN(creationDate.getTime())) {
                    automaticEvents.push({
                        id: `property_creation_${property.id}`,
                        title: `Propriété créée - ${property.name || property.title || 'Nouvelle propriété'}`,
                        description: `Propriété ajoutée au portfolio`,
                        start: creationDate,
                        end: new Date(creationDate.getTime() + 24 * 60 * 60 * 1000),
                        propertyId: property.id,
                        eventType: 'creation_propriete',
                        location: property.address || '',
                        userId: userId,
                        isAutomatic: true,
                        googleCalendarId: null
                    });
                    console.log(`  ✅ Création: ${creationDate.toLocaleDateString()}`);
                }
            }
            
            // Événement de visite planifiée (si la propriété est libre)
            if (property.status === 'available' || property.status === 'libre') {
                // Générer une visite planifiée avec une date fixe basée sur l'ID de la propriété
                const visitDate = new Date();
                const dayOffset = (property.id.charCodeAt(0) + property.id.length) % 7; // Date basée sur l'ID
                visitDate.setDate(visitDate.getDate() + dayOffset + 1);
                visitDate.setHours(14, 0, 0, 0); // 14h00
                
                automaticEvents.push({
                    id: `visit_planned_${property.id}_fixed`,
                    title: `Visite planifiée - ${property.name || property.title || 'Propriété'}`,
                    description: `Visite de la propriété programmée`,
                    start: visitDate,
                    end: new Date(visitDate.getTime() + 2 * 60 * 60 * 1000), // 2 heures
                    propertyId: property.id,
                    eventType: 'visite_planifie',
                    location: property.address || '',
                    userId: userId,
                    isAutomatic: true,
                    googleCalendarId: null
                });
                console.log(`  🏠 Visite: ${visitDate.toLocaleDateString()}`);
            }
            
            // Événement de maintenance (pour les propriétés occupées)
            if (property.status === 'rented' || property.status === 'occupied') {
                // Générer un événement de maintenance avec une date fixe basée sur l'ID de la propriété
                const maintenanceDate = new Date();
                const dayOffset = (property.id.charCodeAt(0) + property.id.length) % 30; // Date basée sur l'ID
                maintenanceDate.setDate(maintenanceDate.getDate() + dayOffset + 1);
                maintenanceDate.setHours(10, 0, 0, 0); // 10h00
                
                automaticEvents.push({
                    id: `maintenance_${property.id}_fixed`,
                    title: `Maintenance - ${property.name || property.title || 'Propriété'}`,
                    description: `Vérification et maintenance de la propriété`,
                    start: maintenanceDate,
                    end: new Date(maintenanceDate.getTime() + 4 * 60 * 60 * 1000), // 4 heures
                    propertyId: property.id,
                    eventType: 'maintenance',
                    location: property.address || '',
                    userId: userId,
                    isAutomatic: true,
                    googleCalendarId: null
                });
                console.log(`  🔧 Maintenance: ${maintenanceDate.toLocaleDateString()}`);
            }
            
            // Événement d'expiration de bail (si un locataire est présent)
            if (property.tenant && property.tenant.leaseEnd) {
                const leaseEndDate = new Date(property.tenant.leaseEnd);
                if (!isNaN(leaseEndDate.getTime())) {
                    automaticEvents.push({
                        id: `lease_expiry_${property.id}`,
                        title: `Expiration bail - ${property.name || property.title || 'Propriété'}`,
                        description: `Fin de contrat de location`,
                        start: leaseEndDate,
                        end: new Date(leaseEndDate.getTime() + 24 * 60 * 60 * 1000),
                        propertyId: property.id,
                        eventType: 'expiration_bail',
                        location: property.address || '',
                        userId: userId,
                        isAutomatic: true,
                        googleCalendarId: null,
                        tenantId: property.tenant.userId || property.tenant.id
                    });
                    console.log(`  📄 Expiration bail: ${leaseEndDate.toLocaleDateString()}`);
                }
            }
        }
        
        console.log(`✅ ${automaticEvents.length} événements automatiques générés (${automaticEvents.length - properties.length} de la DB + ${properties.length} générés)`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des événements automatiques:', error);
    }
    
    return automaticEvents;
}

async function getUserBillingPlan(userId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            // Pour les tests, retourner un plan entreprise
            console.log('Firebase non initialisé - mode test: plan entreprise');
            return { plan: 'entreprise', status: 'active' };
        }

        const billingPlans = await firestoreUtils.getAll('billingPlans');
        console.log('Plans de facturation trouvés:', billingPlans.length);
        
        const userPlan = billingPlans.find(plan => plan.userId === userId);
        console.log('Plan utilisateur trouvé:', userPlan);
        
        if (userPlan) {
            return userPlan;
        }
        
        // Si aucun plan trouvé, vérifier si l'utilisateur a des propriétés (indicateur d'usage)
        // En attendant la mise en place complète du système de facturation
        const properties = await firestoreUtils.getAll('properties');
        const userProperties = properties.filter(property => 
            property.ownerId === userId || property.tenantId === userId
        );
        
        if (userProperties.length > 0) {
            console.log('Utilisateur avec propriétés détecté - accès entreprise temporaire');
            return { plan: 'entreprise', status: 'active' };
        }
        
        return { plan: 'gratuit', status: 'active' };
    } catch (error) {
        console.error('Erreur lors de la récupération du plan:', error);
        // En cas d'erreur, permettre l'accès temporairement
        return { plan: 'entreprise', status: 'active' };
    }
}

async function getPropertiesFromDatabase() {
    try {
        if (!firestoreUtils.isInitialized()) {
            return getMockProperties();
        }

        const properties = await firestoreUtils.getAll('properties');
        return properties.map(property => ({
            id: property.id,
            title: property.name || `Propriété ${property.id}`,
            address: property.address || 'Adresse non spécifiée',
            city: property.city || 'Ville non spécifiée',
            ownerId: property.ownerId || null,
            tenantId: property.tenantId || null,
            rent: property.rent || property.monthlyRent || 0
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des propriétés:', error);
        return getMockProperties();
    }
}

async function getCalendarEvents(userId, filters = {}) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return getMockCalendarEvents(userId, filters);
        }

        let events = await firestoreUtils.getAll('calendarEvents');
        
        // Filtrer par utilisateur
        events = events.filter(event => event.userId === userId);
        
        // Appliquer les filtres
        if (filters.start) {
            events = events.filter(event => {
                let eventStart;
                if (event.start && typeof event.start === 'object' && event.start.seconds) {
                    eventStart = new Date(event.start.seconds * 1000);
                } else if (event.start) {
                    eventStart = new Date(event.start);
                } else {
                    return false;
                }
                return eventStart >= filters.start;
            });
        }
        if (filters.end) {
            events = events.filter(event => {
                let eventEnd;
                if (event.end && typeof event.end === 'object' && event.end.seconds) {
                    eventEnd = new Date(event.end.seconds * 1000);
                } else if (event.end) {
                    eventEnd = new Date(event.end);
                } else {
                    return false;
                }
                return eventEnd <= filters.end;
            });
        }
        if (filters.propertyId) {
            events = events.filter(event => event.propertyId === filters.propertyId);
        }

        return events.map(event => {
            // Convertir les dates Firebase Timestamp en Date JavaScript
            let startDate, endDate;
            
            if (event.start && typeof event.start === 'object' && event.start.seconds) {
                // Format Firebase Timestamp
                startDate = new Date(event.start.seconds * 1000);
            } else if (event.start) {
                // Format ISO string ou autre
                startDate = new Date(event.start);
            } else {
                startDate = new Date();
            }
            
            if (event.end && typeof event.end === 'object' && event.end.seconds) {
                // Format Firebase Timestamp
                endDate = new Date(event.end.seconds * 1000);
            } else if (event.end) {
                // Format ISO string ou autre
                endDate = new Date(event.end);
            } else {
                // Par défaut, fin de journée
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
            }
            
            return {
                id: event.id,
                title: event.title,
                description: event.description || '',
                start: startDate,
                end: endDate,
                propertyId: event.propertyId || null,
                eventType: event.eventType || 'custom',
                location: event.location || '',
                googleCalendarId: event.googleCalendarId || null
            };
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        return getMockCalendarEvents(userId, filters);
    }
}

async function saveCalendarEvent(eventData) {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Mode test: événement sauvegardé:', eventData);
            return eventData;
        }

        await firestoreUtils.add('calendarEvents', eventData);
        return eventData;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'événement:', error);
        throw error;
    }
}

async function getCalendarEventById(eventId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            const mockEvents = getMockCalendarEvents();
            return mockEvents.find(event => event.id === eventId);
        }

        const events = await firestoreUtils.getAll('calendarEvents');
        return events.find(event => event.id === eventId);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement:', error);
        return null;
    }
}

async function updateCalendarEvent(eventId, updates) {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Mode test: événement mis à jour:', eventId, updates);
            return { id: eventId, ...updates };
        }

        await firestoreUtils.update('calendarEvents', eventId, updates);
        return { id: eventId, ...updates };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        throw error;
    }
}

async function deleteCalendarEvent(eventId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Mode test: événement supprimé:', eventId);
            return true;
        }

        await firestoreUtils.delete('calendarEvents', eventId);
        console.log('Événement supprimé:', eventId);
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}

// Fonctions pour l'intégration Google Calendar (à implémenter plus tard)
async function syncWithGoogleCalendar(eventData, user) {
    // TODO: Implémenter l'intégration Google Calendar API
    console.log('Sync avec Google Calendar:', eventData);
    return `google_event_${Date.now()}`;
}

async function updateGoogleCalendarEvent(googleEventId, updates) {
    // TODO: Implémenter la mise à jour Google Calendar API
    console.log('Mise à jour Google Calendar:', googleEventId, updates);
}

async function deleteGoogleCalendarEvent(googleEventId) {
    // TODO: Implémenter la suppression Google Calendar API
    console.log('Suppression Google Calendar:', googleEventId);
}

// Données de test
function getMockProperties() {
    return [
        {
            id: '1',
            title: 'Appartement T3 moderne',
            address: '123 Rue de la Paix, Paris 15ème',
            location: '123 Rue de la Paix, Paris 15ème',
            city: 'Paris',
            ownerId: 'user1',
            tenantId: 'user2',
            rent: 1200,
            monthlyRent: 1200,
            occupied: true
        },
        {
            id: '2',
            title: 'Studio cosy',
            address: '456 Avenue des Champs, Lyon 2ème',
            location: '456 Avenue des Champs, Lyon 2ème',
            city: 'Lyon',
            ownerId: 'user1',
            tenantId: 'user3',
            rent: 650,
            monthlyRent: 650,
            occupied: true
        },
        {
            id: '3',
            title: 'Maison T4 avec jardin',
            address: '789 Boulevard de la République, Marseille',
            location: '789 Boulevard de la République, Marseille',
            city: 'Marseille',
            ownerId: 'user1',
            tenantId: 'user4',
            rent: 1500,
            monthlyRent: 1500,
            occupied: true
        }
    ];
}


function getMockCalendarEvents(userId, filters = {}) {
    const events = [
        {
            id: 'event1',
            title: 'Visite propriété - Appartement T3',
            description: 'Visite prévue pour un locataire potentiel',
            start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
            end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 heure plus tard
            propertyId: '1',
            eventType: 'visite',
            location: '123 Rue de la Paix, Paris 15ème',
            userId: userId,
            googleCalendarId: null
        },
        {
            id: 'event2',
            title: 'Échéance loyer - Studio cosy',
            description: 'Paiement du loyer mensuel',
            start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
            end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            propertyId: '2',
            eventType: 'paiement',
            location: '',
            userId: userId,
            googleCalendarId: null
        },
        {
            id: 'event3',
            title: 'Expiration bail - Appartement T3',
            description: 'Fin du bail locatif - renouvellement ou départ',
            start: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Dans 30 jours
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            propertyId: '1',
            eventType: 'expiration',
            location: '',
            userId: userId,
            googleCalendarId: null
        }
    ];

    // Appliquer les filtres
    let filteredEvents = events.filter(event => event.userId === userId);
    
    if (filters.start) {
        filteredEvents = filteredEvents.filter(event => new Date(event.start) >= filters.start);
    }
    if (filters.end) {
        filteredEvents = filteredEvents.filter(event => new Date(event.end) <= filters.end);
    }
    if (filters.propertyId) {
        filteredEvents = filteredEvents.filter(event => event.propertyId === filters.propertyId);
    }

    return filteredEvents;
}

function generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = router;
