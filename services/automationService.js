const { getFirestore, initializeFirebase } = require('../config/firebase-admin');
const dataService = require('./dataService');

/**
 * Service pour gérer les automatisations utilisateur
 */
class AutomationService {
    /**
     * Récupérer toutes les automatisations disponibles
     */
    async getAllAutomations() {
        try {
            const db = getFirestore();
            const snapshot = await db.collection('automations').get();
            
            const automations = [];
            snapshot.forEach(doc => {
                automations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return automations;
        } catch (error) {
            console.error('❌ Erreur récupération automatisations:', error);
            return [];
        }
    }

    /**
     * Récupérer les automatisations d'un utilisateur
     * @param {string} userId - ID de l'utilisateur
     */
    async getUserAutomations(userId) {
        try {
            const db = getFirestore();
            if (!db) {
                console.error('❌ Impossible d\'obtenir l\'instance Firestore');
                return { userId: userId, automations: {} };
            }

            const docRef = db.collection('user_automations').doc(userId);
            const doc = await docRef.get();
            console.log('doc', doc.data());
            if (doc.exists) {
                return doc.data();
            } else {
                // Créer le document avec les paramètres par défaut
                const defaultSettings = await this.createDefaultUserAutomations(userId);
                return defaultSettings;
            }
        } catch (error) {
            console.error('❌ Erreur récupération automatisations utilisateur:', error);
            console.error('Stack trace:', error.stack);
            return { userId: userId, automations: {} };
        }
    }

    /**
     * Créer les paramètres par défaut pour un nouvel utilisateur
     * @param {string} userId - ID de l'utilisateur
     */
    async createDefaultUserAutomations(userId) {
        try {
            const db = getFirestore();
            const allAutomations = await this.getAllAutomations();

            const userAutomations = {
                userId: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                automations: {}
            };

            // Initialiser chaque automatisation avec ses paramètres par défaut
            allAutomations.forEach(automation => {
                userAutomations.automations[automation.id] = {
                    isActive: false,
                    settings: {}
                };

                // Initialiser les paramètres avec les valeurs par défaut
                if (automation.settings) {
                    Object.keys(automation.settings).forEach(key => {
                        userAutomations.automations[automation.id].settings[key] = 
                            automation.settings[key].default;
                    });
                }
            });

            // Sauvegarder dans Firebase
            await db.collection('user_automations').doc(userId).set(userAutomations);
            console.log('✅ Automatisations utilisateur créées:', userId);

            return userAutomations;
        } catch (error) {
            console.error('❌ Erreur création automatisations utilisateur:', error);
            return { userId: userId, automations: {} };
        }
    }

    /**
     * Activer/désactiver une automatisation pour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} automationId - ID de l'automatisation
     * @param {boolean} isActive - État actif/inactif
     */
    async toggleAutomation(userId, automationId, isActive) {
        try {
            const db = getFirestore();
            const docRef = db.collection('user_automations').doc(userId);
            
            await docRef.update({
                updatedAt: new Date(),
                [`automations.${automationId}.isActive`]: isActive
            }, { merge: true });

            console.log(`✅ Automatisation ${automationId} ${isActive ? 'activée' : 'désactivée'} pour ${userId}`);

            return {
                success: true,
                message: isActive ? 'Automatisation activée' : 'Automatisation désactivée'
            };
        } catch (error) {
            console.error('❌ Erreur toggle automatisation:', error);
            return {
                success: false,
                message: 'Erreur lors de la mise à jour'
            };
        }
    }

    /**
     * Mettre à jour les paramètres d'une automatisation
     * @param {string} userId - ID de l'utilisateur
     * @param {string} automationId - ID de l'automatisation
     * @param {object} settings - Nouveaux paramètres
     */
    async updateAutomationSettings(userId, automationId, settings) {
        try {
            const db = getFirestore();
            const docRef = db.collection('user_automations').doc(userId);
            
            await docRef.set({
                updatedAt: new Date(),
                [`automations.${automationId}.settings`]: settings
            }, { merge: true });

            console.log(`✅ Paramètres mis à jour pour ${automationId}`);

            return {
                success: true,
                message: 'Paramètres mis à jour avec succès'
            };
        } catch (error) {
            console.error('❌ Erreur mise à jour paramètres:', error);
            return {
                success: false,
                message: 'Erreur lors de la mise à jour des paramètres'
            };
        }
    }

    /**
     * Vérifier si une automatisation est active pour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} automationId - ID de l'automatisation
     */
    async isAutomationActive(userId, automationId) {
        try {
            const userAutomations = await this.getUserAutomations(userId);
            console.log('userAutomations', userAutomations);
            
            return userAutomations.automations?.[automationId]?.isActive || false;
        } catch (error) {
            console.error('❌ Erreur vérification automatisation:', error);
            return false;
        }
    }

    /**
     * Récupérer les paramètres d'une automatisation pour un utilisateur
     * @param {string} userId - ID de l'utilisateur
     * @param {string} automationId - ID de l'automatisation
     */
    async getAutomationSettings(userId, automationId) {
        try {
            const userAutomations = await this.getUserAutomations(userId);
            return userAutomations.automations?.[automationId]?.settings || {};
        } catch (error) {
            console.error('❌ Erreur récupération paramètres:', error);
            return {};
        }
    }

    /**
     * Vérifier les retards de paiement et envoyer des notifications
     * Appelée périodiquement pour tous les utilisateurs ayant activé l'automatisation
     */
    async checkUnpaidRentNotifications() {
        try {
            console.log('🔔 Vérification des retards de paiement...');

            // S'assurer que Firebase est initialisé
            try {
                initializeFirebase();
                console.log('✅ Firebase Admin SDK vérifié/initialisé');
            } catch (firebaseError) {
                console.log('⚠️ Firebase déjà initialisé ou erreur:', firebaseError.message);
            }

            // Récupérer tous les utilisateurs
            const users = await dataService.getUsers();
            console.log(`📊 ${users.length} utilisateurs trouvés`);

            // Filtrer les utilisateurs avec l'automatisation active
            for (const user of users) {
                try {
                    // Vérifier si l'automatisation unpaid-rent-notification est active
                    const userAutomations = await this.getUserAutomations(user.id);
                    const isActive = userAutomations.automations?.['unpaid-rent-notification']?.isActive;

                    if (!isActive) {
                        continue; // Passer à l'utilisateur suivant
                    }

                    console.log(`⚡ Vérification pour l'utilisateur ${user.id} (${user.profile?.email}) ${isActive}`);

                    // Récupérer toutes les propriétés de l'utilisateur
                    const properties = await dataService.getProperties(user.id);
                    console.log(`🏠 ${properties.length} propriétés trouvées pour ${user.id}`);

                    // Liste des locataires en retard
                    const latePayments = [];

                    // Pour chaque propriété
                    for (const property of properties) {
                        // Vérifier si la propriété a un locataire
                        if (!property.tenant || !property.tenant.userId) {
                            continue;
                        }

                        // Récupérer les informations du locataire
                        const tenant = await dataService.getUserById(property.tenant.userId);
                        if (!tenant) {
                            continue;
                        }

                        // Vérifier les paiements
                        const paymentStatus = await this.checkPropertyPaymentStatus(property, tenant);
                        
                        if (paymentStatus.isLate) {
                            latePayments.push({
                                tenantFirstName: tenant.profile?.firstName || 'N/A',
                                tenantLastName: tenant.profile?.lastName || 'N/A',
                                propertyName: property.name,
                                paidLastMonth: paymentStatus.paidLastMonth,
                                totalDue: paymentStatus.totalDue
                            });
                        }
                    }

                    // Si des retards sont détectés, envoyer un email
                    if (latePayments.length > 0) {
                        console.log(`📧 Envoi de notification pour ${latePayments.length} locataire(s) en retard`);
                        await this.sendUnpaidRentNotification(user, latePayments);
                    } else {
                        console.log(`✅ Aucun retard de paiement pour l'utilisateur ${user.id}`);
                    }

                } catch (userError) {
                    console.error(`❌ Erreur lors du traitement de l'utilisateur ${user.id}:`, userError);
                    // Continuer avec les autres utilisateurs
                }
            }

            console.log('✅ Vérification des retards de paiement terminée');

        } catch (error) {
            console.error('❌ Erreur lors de la vérification des retards de paiement:', error);
            throw error;
        }
    }

    /**
     * Vérifier le statut de paiement d'une propriété
     * @param {object} property - La propriété à vérifier
     * @param {object} tenant - Le locataire
     * @returns {object} - Statut du paiement
     */
    async checkPropertyPaymentStatus(property, tenant) {
        try {
            // Date du mois précédent
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            // Récupérer tous les paiements de la propriété
            const allPayments = await dataService.getPayments(property.ownerId);
            const propertyPayments = allPayments.filter(p => p.propertyId === property.id);

            // Vérifier s'il existe un paiement dans le mois précédent
            const lastMonthPayment = propertyPayments.find(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= lastMonth && paymentDate < currentMonth && payment.status === 'paid';
            });
            //console.log('property', property.id, lastMonthPayment);
            const paidLastMonth = lastMonthPayment ? true : false;
            // Si paiement trouvé le mois dernier, tout va bien
            /*if (lastMonthPayment) {
                return {
                    isLate: false,
                    paidLastMonth: true,
                    totalDue: 0
                };
            }*/

            // Pas de paiement le mois dernier, vérifier le total depuis l'entryDate
            const entryDate = new Date(property.tenant.entryDate || tenant.tenant?.entryDate);
            
            // Calculer le nombre de mois depuis l'entryDate
            const monthsSinceEntry = Math.floor((now - entryDate) / (1000 * 60 * 60 * 24 * 30));
            
            // Calculer le montant total dû
            const totalExpected = property.monthlyRent * Math.max(0, monthsSinceEntry);

            // Calculer le total payé depuis l'entryDate
            const totalPaid = propertyPayments
                .filter(payment => {
                    const paymentDate = new Date(payment.date);
                    return paymentDate >= entryDate && payment.status === 'paid';
                })
                .reduce((sum, payment) => sum + (payment.amount || 0), 0);

            // Le locataire est en retard si le total payé est insuffisant
            const isLate = totalPaid < totalExpected;
            const totalDue = Math.max(0, totalExpected - totalPaid);
            //console.log('property', property.id, totalPaid, totalExpected, totalDue, entryDate, monthsSinceEntry);
            
            return {
                isLate: isLate,
                paidLastMonth: paidLastMonth,
                totalDue: totalDue
            };

        } catch (error) {
            console.error('❌ Erreur lors de la vérification du statut de paiement:', error);
            return {
                isLate: false,
                paidLastMonth: false,
                totalDue: 0
            };
        }
    }

    /**
     * Envoyer une notification de retard de paiement
     * @param {object} user - L'utilisateur propriétaire
     * @param {array} latePayments - Liste des locataires en retard
     */
    async sendUnpaidRentNotification(user, latePayments) {
        try {
            const userEmail = user.profile?.email || user.email;
            
            if (!userEmail) {
                console.error('❌ Pas d\'email pour l\'utilisateur', user.id);
                return;
            }

            // Construire le tableau HTML
            const tableRows = latePayments.map(payment => `
                <tr style="border-bottom: 1px solid #e0e0e0;">
                    <td style="padding: 12px; text-align: left;">${payment.tenantFirstName} ${payment.tenantLastName}</td>
                    <td style="padding: 12px; text-align: left;">${payment.propertyName}</td>
                    <td style="padding: 12px; text-align: center;">
                        <span style="color: ${payment.paidLastMonth ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${payment.paidLastMonth ? 'Oui' : 'Non'}
                        </span>
                    </td>
                    <td style="padding: 12px; text-align: right; font-weight: bold;">${payment.totalDue.toFixed(2)}  xaf</td>
                </tr>
            `).join('');

            const message = `
                Recevez ci-dessous la liste des locataires n'ayant pas effectué de règlement de loyer le mois dernier ou étant en retard de paiement de leur redevance mensuelle:
                <br><br>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background-color: #4184f3; color: white;">
                            <th style="padding: 12px; text-align: left; font-weight: bold;">Locataire</th>
                            <th style="padding: 12px; text-align: left; font-weight: bold;">Propriété</th>
                            <th style="padding: 12px; text-align: center; font-weight: bold;">Mois dernier</th>
                            <th style="padding: 12px; text-align: right; font-weight: bold;">Montant dû</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;

            // Envoyer l'email
            await dataService.sendMail(
                userEmail,
                'Locataire en retard',
                '/paiements',
                message
            );

            console.log(`✅ Email envoyé à ${userEmail} pour ${latePayments.length} locataire(s) en retard`);

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la notification:', error);
            throw error;
        }
    }

    /**
     * Vérifier les expirations de bail et envoyer des notifications 30 jours avant
     * Appelée périodiquement pour tous les utilisateurs ayant activé l'automatisation
     */
    async checkLeaseExpiryReminders() {
        try {
            console.log('📅 Vérification des expirations de bail...');

            // S'assurer que Firebase est initialisé
            try {
                initializeFirebase();
                console.log('✅ Firebase Admin SDK vérifié/initialisé');
            } catch (firebaseError) {
                console.log('⚠️ Firebase déjà initialisé ou erreur:', firebaseError.message);
            }

            // Récupérer tous les utilisateurs
            const users = await dataService.getUsers();
            console.log(`📊 ${users.length} utilisateurs trouvés`);

            // Date dans exactement 30 jours
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 30);
            targetDate.setHours(0, 0, 0, 0);

            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            console.log(`🎯 Recherche d'expirations de bail pour le ${targetDate.toLocaleDateString()}`);

            // Filtrer les utilisateurs avec l'automatisation active
            for (const user of users) {
                try {
                    // Vérifier si l'automatisation lease-expiry-reminder est active
                    const userAutomations = await this.getUserAutomations(user.id);
                    const isActive = userAutomations.automations?.['lease-expiry-reminder']?.isActive;

                    if (!isActive) {
                        continue; // Passer à l'utilisateur suivant
                    }

                    console.log(`⚡ Vérification pour l'utilisateur ${user.id} (${user.profile?.email}) ${isActive}`);

                    // Récupérer toutes les propriétés de l'utilisateur
                    const properties = await dataService.getProperties(user.id);
                    console.log(`🏠 ${properties.length} propriétés trouvées pour ${user.id}`);

                    // Récupérer tous les événements de calendrier
                    const db = getFirestore();
                    const eventsSnapshot = await db.collection('calendarEvents')
                        .where('userId', '==', user.id)
                        .get();

                    const allEvents = [];
                    eventsSnapshot.forEach(doc => {
                        allEvents.push({ id: doc.id, ...doc.data() });
                    });

                    console.log(`📆 ${allEvents.length} événements trouvés pour ${user.id}`);

                    // Pour chaque propriété
                    for (const property of properties) {
                        // Chercher un événement d'expiration pour cette propriété
                        const expirationEvents = allEvents.filter(event => {
                            if (event.propertyId !== property.id) return false;
                            
                            // Vérifier le type d'événement
                            const isExpirationType = event.eventType === 'expiration' || 
                                                    event.eventType === 'expiration_bail';
                            
                            if (!isExpirationType) return false;

                            // Vérifier la date
                            let eventDate;
                            if (event.start && typeof event.start === 'object' && event.start.seconds) {
                                eventDate = new Date(event.start.seconds * 1000);
                            } else if (event.start) {
                                eventDate = new Date(event.start);
                            } else {
                                return false;
                            }

                            eventDate.setHours(0, 0, 0, 0);

                            // Vérifier si l'événement est dans exactement 30 jours
                            return eventDate.getTime() === targetDate.getTime();
                        });

                        if (expirationEvents.length > 0) {
                            console.log(`🔔 Expiration de bail détectée pour la propriété ${property.name}`);

                            // Récupérer l'email du propriétaire
                            const ownerEmail = user.profile?.email || user.email;

                            // Récupérer l'email du locataire si présent
                            let tenantEmail = null;
                            if (property.tenant && property.tenant.userId) {
                                const tenant = await dataService.getUserById(property.tenant.userId);
                                tenantEmail = tenant?.profile?.email || tenant?.email;
                            }

                            // Envoyer les notifications
                            await this.sendLeaseExpiryNotification(
                                ownerEmail,
                                tenantEmail,
                                property,
                                targetDate
                            );
                        }
                    }

                } catch (userError) {
                    console.error(`❌ Erreur lors du traitement de l'utilisateur ${user.id}:`, userError);
                    // Continuer avec les autres utilisateurs
                }
            }

            console.log('✅ Vérification des expirations de bail terminée');

        } catch (error) {
            console.error('❌ Erreur lors de la vérification des expirations de bail:', error);
            throw error;
        }
    }

    /**
     * Envoyer une notification d'expiration de bail
     * @param {string} ownerEmail - Email du propriétaire
     * @param {string} tenantEmail - Email du locataire
     * @param {object} property - La propriété concernée
     * @param {Date} expirationDate - Date d'expiration
     */
    async sendLeaseExpiryNotification(ownerEmail, tenantEmail, property, expirationDate) {
        try {
            const propertyName = property.name || 'Propriété';
            const formattedDate = expirationDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            const message = `
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Le bail de la propriété <strong>${propertyName}</strong> arrive à expiration dans exactement 30 jours.
                    </p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4184f3;">
                        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">
                            📍 Informations sur la propriété
                        </h3>
                        <p style="margin: 5px 0; color: #555;"><strong>Nom:</strong> ${propertyName}</p>
                        ${property.address ? `<p style="margin: 5px 0; color: #555;"><strong>Adresse:</strong> ${property.address}</p>` : ''}
                        <p style="margin: 5px 0; color: #555;"><strong>Date d'expiration:</strong> ${formattedDate}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <p style="margin: 0; color: #856404; font-weight: 500;">
                            ⏰ Il est temps de planifier le renouvellement du bail ou le départ du locataire.
                        </p>
                    </div>
                </div>
            `;

            // Envoyer l'email au propriétaire
            if (ownerEmail) {
                await dataService.sendMail(
                    ownerEmail,
                    'Expiration de bail à venir',
                    '/calendrier',
                    message
                );
                console.log(`✅ Email d'expiration envoyé au propriétaire: ${ownerEmail}`);
            }

            // Envoyer l'email au locataire
            if (tenantEmail) {
                await dataService.sendMail(
                    tenantEmail,
                    'Expiration de bail à venir',
                    '/paiement',
                    message
                );
                console.log(`✅ Email d'expiration envoyé au locataire: ${tenantEmail}`);
            }

            if (!ownerEmail && !tenantEmail) {
                console.error('❌ Aucun email disponible pour la propriété', property.id);
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi de la notification d\'expiration:', error);
            throw error;
        }
    }
}

module.exports = new AutomationService();
