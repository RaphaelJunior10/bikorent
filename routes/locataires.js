const express = require('express');
const router = express.Router();
const { firestoreUtils, COLLECTIONS, authUtils } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');
const billingService = require('../services/billingService');
const dataService = require('../services/dataService');
const { checkPagePermissions } = require('../middleware/billingMiddleware');

// Données des locataires (structure JSON facilement modifiable)
/*let locatairesData = {
    locataires: [
        {
            id: 1,
            nom: "Marie DuboisR",
            email: "marie.dubois@email.com",
            telephone: "06 12 34 56 78",
            propriete: "Appartement T3 - Rue de la Paix",
            loyer: 600,
            dateEntree: "2023-01-15",
            statut: "current",
            moisImpayes: 2,
            montantDu: 1200,
            dernierPaiement: "2024-01-15",
            prochainPaiement: "2024-03-15",
            photo: null
        },
        {
            id: 2,
            nom: "Jean Martin",
            email: "jean.martin@email.com",
            telephone: "06 98 76 54 32",
            propriete: "Studio - Avenue Victor Hugo",
            loyer: 650,
            dateEntree: "2023-03-01",
            statut: "overdue",
            moisImpayes: 1,
            montantDu: 650,
            dernierPaiement: "2024-01-01",
            prochainPaiement: "2024-02-01",
            photo: null
        },
        {
            id: 3,
            nom: "Sophie Bernard",
            email: "sophie.bernard@email.com",
            telephone: "06 45 67 89 12",
            propriete: "Maison T4 - Boulevard Central",
            loyer: 900,
            dateEntree: "2022-09-01",
            statut: "overdue",
            moisImpayes: 3,
            montantDu: 1800,
            dernierPaiement: "2023-12-01",
            prochainPaiement: "2024-01-01",
            photo: null
        },
        {
            id: 4,
            nom: "Pierre Durand",
            email: "pierre.durand@email.com",
            telephone: "06 23 45 67 89",
            propriete: "Appartement T2 - Rue des Fleurs",
            loyer: 550,
            dateEntree: "2023-06-01",
            statut: "current",
            moisImpayes: 0,
            montantDu: 0,
            dernierPaiement: "2024-02-01",
            prochainPaiement: "2024-03-01",
            photo: null
        },
        {
            id: 5,
            nom: "Claire Moreau",
            email: "claire.moreau@email.com",
            telephone: "06 78 90 12 34",
            propriete: "Studio - Avenue de la République",
            loyer: 480,
            dateEntree: "2023-08-01",
            statut: "current",
            moisImpayes: 0,
            montantDu: 0,
            dernierPaiement: "2024-02-01",
            prochainPaiement: "2024-03-01",
            photo: null
        },
        {
            id: 6,
            nom: "Thomas Leroy",
            email: "thomas.leroy@email.com",
            telephone: "06 56 78 90 12",
            propriete: "Appartement T3 - Rue du Commerce",
            loyer: 720,
            dateEntree: "2023-04-15",
            statut: "upcoming",
            moisImpayes: 0,
            montantDu: 720,
            dernierPaiement: "2024-01-15",
            prochainPaiement: "2024-02-15",
            photo: null
        }
    ],
    proprietes: [
        "Appartement T3 - Rue de la Paix",
        "Studio - Avenue Victor Hugo",
        "Maison T4 - Boulevard Central",
        "Appartement T2 - Rue des Fleurs",
        "Studio - Avenue de la République",
        "Appartement T3 - Rue du Commerce"
    ],
    stats: {
        total: 6,
        aJour: 3,
        enRetard: 2,
        aVenir: 1,
        montantDu: 4370
    }
};
*/
// Page des locataires
router.get('/', checkPagePermissions, async (req, res) => {
    let ownerId = req.session.user.id; // ID du propriétaire connecté
    let firebaseOwner = null;
    let locatairesData = null;
    // Récupération des données depuis Firebase si activé
    if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
        try {
            // Récupérer toutes les propriétés du propriétaire
            const firebaseProperties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                { type: 'where', field: 'ownerId', operator: '==', value: ownerId },
                { type: 'where', field: 'isDeleted', operator: '==', value: false }
            ]);
            
            // Récupérer tous les utilisateurs (locataires)
            const firebaseUsers = await firestoreUtils.getAll(COLLECTIONS.USERS);

            //Recuperation de l'utilisateur propriétaire
            firebaseOwner = await firestoreUtils.getById(COLLECTIONS.USERS, ownerId);
            
            // Récupérer tous les paiements
            const firebasePayments = await firestoreUtils.getAll(COLLECTIONS.PAYMENTS);
            
            console.log(`📊 Données récupérées: ${firebaseProperties.length} propriétés, ${firebaseUsers.length} utilisateurs, ${firebasePayments.length} paiements`);
            
            // Debug: Afficher la structure d'un utilisateur
            if (firebaseUsers.length > 0) {
                console.log('🔍 Structure d\'un utilisateur:', JSON.stringify(firebaseUsers[0], null, 2));
            }
            
            // Debug: Afficher la structure d'une propriété
            if (firebaseProperties.length > 0) {
                console.log('🔍 Structure d\'une propriété:', JSON.stringify(firebaseProperties[0], null, 2));
            }
            
            // Transformer les données Firebase en format attendu par l'interface
            const locataires = [];
            const proprietes = [];
            
            // Traiter chaque propriété pour trouver les locataires
            firebaseProperties.forEach(property => {
                if (property.tenant && property.tenant.userId) {
                    // Trouver l'utilisateur correspondant
                    const user = firebaseUsers.find(u => u.id === property.tenant.userId);
                    if (user) {
                        console.log(`👤 Traitement du locataire: ${user.profile.firstName} ${user.profile.lastName}`);
                        const entryDate = (property.tenant !== null) ? property.tenant.entryDate : new Date();
                        // Trouver les paiements de ce locataire
                        const userPayments = firebasePayments.filter(p => p.userId === user.id & p.date >= entryDate);
                        
                        
                        // Calculer les statistiques de paiement
                        const dernierPaiement = userPayments.length > 0 
                            ? userPayments.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
                            : null;
                        
                        // Calculer le montant dû et les mois impayés
                        const today = new Date();
                        const monthsDiff = Math.floor((today - new Date(entryDate)) / (1000 * 60 * 60 * 24 * 30));
                        const expectedPayments = monthsDiff + 1;
                        const totalPayments = userPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                        const unpaidMonths = monthsDiff - (totalPayments / (property.monthlyRent || 0));
                        const actualPayments = Math.floor(unpaidMonths);
                        const moisImpayes = Math.ceil(unpaidMonths) || 0;
                        const montantDu = Math.floor(unpaidMonths * (property.monthlyRent || 0)) || 0;

                        console.log(user.profile.firstName, monthsDiff, entryDate, totalPayments, unpaidMonths, actualPayments, moisImpayes, montantDu);
                        
                        
                        // Déterminer le statut
                        let statut = "current";
                        if (moisImpayes > 0) {
                            statut = "overdue";
                        } else {
                            statut = "current";
                        } /*else {
                            statut = "upcoming";
                        }*/
                        
                        // Calculer la date du prochain paiement
                        const lastPaymentDate = dernierPaiement ? new Date(dernierPaiement) : new Date(entryDate);
                        const nextPaymentDate = new Date(lastPaymentDate);
                        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                        
                        locataires.push({
                            id: user.id,
                            nom: `${user.profile.firstName} ${user.profile.lastName}`,
                            email: user.profile.email,
                            telephone: user.profile.phone || "Non renseigné",
                            propriete: property.name,
                            loyer: property.monthlyRent,
                            dateEntree: property.tenant.entryDate,
                            statut: statut,
                            moisImpayes: moisImpayes,
                            montantDu: montantDu,
                            dernierPaiement: dernierPaiement,
                            prochainPaiement: nextPaymentDate.toISOString().split('T')[0],
                            photo: user.profile.photo || null
                        });
                        
                        proprietes.push(property.name);
                    }
                }
            });
            
            // Calculer les statistiques
            const stats = {
                total: locataires.length,
                aJour: locataires.filter(l => l.statut === "current").length,
                enRetard: locataires.filter(l => l.statut === "overdue").length,
                aVenir: locataires.filter(l => l.statut === "upcoming").length,
                montantDu: locataires.reduce((sum, l) => sum + l.montantDu, 0)
            };
            
            // Mettre à jour les données
            locatairesData = {
                locataires: locataires,
                proprietes: proprietes,
                stats: stats
            };
            
            console.log(`✅ ${locataires.length} locataires récupérés depuis Firebase pour le propriétaire ${ownerId}`);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des locataires depuis Firebase:', error);
            console.log('🔄 Utilisation des données statiques par défaut');
            // En cas d'erreur, on garde les données statiques par défaut
        }
    } else {
        console.log('🔄 Firebase désactivé ou non initialisé - utilisation des données statiques');
    }
    
    // Récupérer les permissions de facturation
    const userBillingPlan = await billingService.getUserBillingPlan(req.session.user.id);
    const pagePermissions = req.pagePermissions || {};
    
    res.render('locataires', {
        title: 'Locataires - BikoRent',
        pageTitle: 'Locataires',
        currentPage: 'locataires',
        pageClass: 'locataires-page',
        user: {
            name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Utilisateur',
            role: req.session.user ? req.session.user.role : 'Propriétaire'
        },
        locatairesData: locatairesData,
        userBillingPlan: userBillingPlan,
        pagePermissions: pagePermissions
    });
});

// Route pour retirer un locataire d'une propriété
router.post('/remove-tenant', async (req, res) => {
    try {
        const { tenantId, propertyName } = req.body;
        
        if (!tenantId || !propertyName) {
            return res.status(400).json({
                success: false,
                message: 'ID du locataire et nom de la propriété requis'
            });
        }

        let ownerId = req.session.user.id; // ID du propriétaire connecté
        
        // Vérifier si Firebase est activé
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            try {
                // Récupérer la propriété par nom
                const properties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                    { type: 'where', field: 'name', operator: '==', value: propertyName },
                    { type: 'where', field: 'ownerId', operator: '==', value: ownerId },
                    { type: 'where', field: 'isDeleted', operator: '==', value: false }
                ]);

                if (properties.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Propriété non trouvée ou vous n\'êtes pas le propriétaire'
                    });
                }

                const property = properties[0];

                // Vérifier que la propriété a bien ce locataire
                if (!property.tenant || property.tenant.userId !== tenantId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ce locataire n\'est pas associé à cette propriété'
                    });
                }

                // Mettre à jour la propriété en retirant le locataire (tenant = null)
                const updateData = {
                    tenant: null,
                    status: 'vacant',
                    updatedAt: new Date()
                };

                await firestoreUtils.update(COLLECTIONS.PROPERTIES, property.id, updateData);

                console.log(`✅ Locataire ${tenantId} retiré de la propriété ${propertyName} par le propriétaire ${ownerId}`);

                //On recupere le nombre de propriétés louées
                const propertiesCount = await dataService.getTenants(ownerId);
                //On recupere le plan de facturation
                const user = await dataService.getUser(ownerId);
                //On enregistre dans user_billing
                const userBilling = await dataService.getPlanChange(ownerId);
                userBilling.facturations.push({
                    planId: user.facturation?.planId,
                    propertyCount: propertiesCount,
                    date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
                });
                await dataService.updateUserBillingPlan2(ownerId, userBilling);
                return res.json({
                    success: true,
                    message: `Locataire retiré avec succès de la propriété "${propertyName}"`
                });

            } catch (error) {
                console.error('❌ Erreur lors du retrait du locataire depuis Firebase:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors du retrait du locataire'
                });
            }
        } else {
            // Mode données statiques - pour le développement
            console.log('🔄 Mode données statiques - retrait du locataire simulé');
            
            // Dans le mode statique, on ne peut pas vraiment retirer le locataire
            // mais on peut simuler la réponse
            return res.json({
                success: true,
                message: `Locataire retiré avec succès de la propriété "${propertyName}" (mode simulation)`
            });
        }

    } catch (error) {
        console.error('❌ Erreur générale lors du retrait du locataire:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Route pour récupérer les propriétés libres
router.get('/available-properties', async (req, res) => {
    try {
        let ownerId = req.session.user.id; // ID du propriétaire connecté
        
        // Vérifier si Firebase est activé
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            try {
                // Récupérer toutes les propriétés du propriétaire qui sont libres
                const properties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                    { type: 'where', field: 'ownerId', operator: '==', value: ownerId },
                    { type: 'where', field: 'isDeleted', operator: '==', value: false },
                    { type: 'where', field: 'status', operator: '==', value: 'vacant' }
                ]);

                // Filtrer les propriétés qui n'ont pas de locataire
                const availableProperties = properties.filter(property => !property.tenant || property.tenant === null);

                console.log(`✅ ${availableProperties.length} propriétés libres trouvées pour le propriétaire ${ownerId}`);

                return res.json({
                    success: true,
                    properties: availableProperties.map(property => ({
                        id: property.id,
                        name: property.name,
                        monthlyRent: property.monthlyRent,
                        type: property.type,
                        address: property.address
                    }))
                });

            } catch (error) {
                console.error('❌ Erreur lors de la récupération des propriétés libres depuis Firebase:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des propriétés libres'
                });
            }
        } else {
            // Mode données statiques - pour le développement
            console.log('🔄 Mode données statiques - propriétés libres simulées');
            
            // Simuler des propriétés libres
            const mockProperties = [
                {
                    id: 'mock1',
                    name: 'Appartement T2 - Rue des Lilas',
                    monthlyRent: 750,
                    type: 'Appartement',
                    address: '123 Rue des Lilas, 75012 Paris'
                },
                {
                    id: 'mock2',
                    name: 'Studio - Avenue de la République',
                    monthlyRent: 550,
                    type: 'Studio',
                    address: '456 Avenue de la République, 75011 Paris'
                }
            ];

            return res.json({
                success: true,
                properties: mockProperties
            });
        }

    } catch (error) {
        console.error('❌ Erreur générale lors de la récupération des propriétés libres:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

// Route pour ajouter un nouveau locataire
router.post('/add-tenant', async (req, res) => {
    try {
        const {
            prenom,
            nom,
            email,
            telephone,
            propertyId,
            monthlyRent,
            entryDate,
            emploi,
            lieuTravail,
            adresse,
            bio,
            photo
        } = req.body;

        // Validation des champs obligatoires
        if (!prenom || !nom || !email || !telephone || !propertyId || !entryDate) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs obligatoires doivent être remplis'
            });
        }

        let ownerId = req.session.user.id; // ID du propriétaire connecté

        // Vérifier si Firebase est activé
        if (isFirebaseEnabled() && firestoreUtils.isInitialized() && authUtils.isInitialized()) {
            try {
                // Vérifier que la propriété appartient au propriétaire et est libre
                const property = await firestoreUtils.getById(COLLECTIONS.PROPERTIES, propertyId);
                
                if (!property) {
                    return res.status(404).json({
                        success: false,
                        message: 'Propriété non trouvée'
                    });
                }

                if (property.ownerId !== ownerId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'êtes pas le propriétaire de cette propriété'
                    });
                }

                if (property.tenant !== null && property.tenant !== undefined) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cette propriété est déjà louée'
                    });
                }

                // 1. Créer l'utilisateur dans l'authentification Firebase
                const displayName = `${prenom} ${nom}`;
                const defaultPassword = 'Bkr12345678';
                
                console.log(`🔐 Création de l'utilisateur dans l'authentification Firebase: ${email}`);
                const authUser = await authUtils.createUser(email, defaultPassword, displayName);

                //Creer l'utilisateur dans Mobidyc
                const userMobId = await dataService.addUserToMobidyc({
                    nom: prenom,
                    prenom: nom,
                    mail: email,
                    mdp: defaultPassword,
                    tel: [telephone],
                });

                if(!userMobId){
                    return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'utilisateur dans Mobidyc' });
                }
                console.log('💾 Utilisateur créé dans Mobidyc:', userMobId);
                //Creer le service dans Mobidyc
                const serviceMobData = await dataService.addServiceToMobidyc({
                    nom: 'BikoRent-'+firstName+'-'+lastName,
                    uid: userMobId,
                });

                if(!serviceMobData){
                    return res.status(500).json({ success: false, error: 'Erreur lors de la création du service dans Mobidyc' });
                }
                console.log('💾 Service créé dans Mobidyc:', serviceMobData);
                
                // 2. Créer le document utilisateur dans Firestore avec l'UID de l'authentification
                const newUserData = {
                    id: authUser.uid, // Utiliser l'UID de l'authentification comme ID
                    type: 'tenant',
                    profile: {
                        firstName: prenom,
                        lastName: nom,
                        email: email,
                        phone: telephone,
                        profession: emploi || null,
                        workplace: lieuTravail || null,
                        address: adresse || null,
                        bio: bio || null,
                        photo: photo || null
                    },
                    tenant: {
                        monthlyRent: monthlyRent,
                        entryDate: entryDate,
                        hasDebt: false,
                        debtAmount: 0,
                        unpaidMonths: 0
                    },
                    authUid: authUser.uid, // Stocker l'UID de l'authentification
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    mobidyc: {
                        userId: userMobId,
                        userApikey: '',
                        serviceId: serviceMobData.sid,
                        serviceApikey: serviceMobData.apikey
                    }
                };

                // Ajouter l'utilisateur à la collection USERS avec l'ID spécifique
                const newUser = await firestoreUtils.add(COLLECTIONS.USERS, newUserData, authUser.uid);

                // 3. Mettre à jour la propriété avec le nouveau locataire
                const propertyUpdateData = {
                    tenant: {
                        userId: authUser.uid, // Utiliser l'UID de l'authentification
                        entryDate: entryDate,
                    },
                    status: 'rented',
                    updatedAt: new Date()
                };

                await firestoreUtils.update(COLLECTIONS.PROPERTIES, propertyId, propertyUpdateData);

                console.log(`✅ Nouveau locataire créé: ${prenom} ${nom} (Auth UID: ${authUser.uid}) pour la propriété ${propertyId}`);
                //On recupere le nombre de propriétés louées
                const propertiesCount = await dataService.getTenants(ownerId);
                //On recupere le plan de facturation
                const user = await dataService.getUser(ownerId);
                //On enregistre dans user_billing
                const userBilling = await dataService.getPlanChange(ownerId);
                userBilling.facturations.push({
                    planId: user.facturation?.planId,
                    propertyCount: propertiesCount,
                    date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
                });
                await dataService.updateUserBillingPlan2(ownerId, userBilling);
                return res.json({
                    success: true,
                    message: `Locataire ${prenom} ${nom} créé avec succès et associé à la propriété. Mot de passe temporaire: ${defaultPassword}`,
                    tenantId: authUser.uid,
                    propertyId: propertyId,
                    temporaryPassword: defaultPassword
                });

            } catch (error) {
                console.error('❌ Erreur lors de la création du locataire depuis Firebase:', error);
                
                // Gestion spécifique des erreurs d'authentification
                if (error.code === 'auth/email-already-exists') {
                    return res.status(400).json({
                        success: false,
                        message: 'Un utilisateur avec cette adresse email existe déjà dans le système'
                    });
                } else if (error.code === 'auth/invalid-email') {
                    return res.status(400).json({
                        success: false,
                        message: 'Adresse email invalide'
                    });
                } else if (error.code === 'auth/weak-password') {
                    return res.status(400).json({
                        success: false,
                        message: 'Mot de passe trop faible'
                    });
                } else if (error.code === 'auth/operation-not-allowed') {
                    return res.status(500).json({
                        success: false,
                        message: 'Création d\'utilisateur non autorisée. Vérifiez la configuration Firebase'
                    });
                }
                
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création du locataire'
                });
            }
        } else {
            // Mode données statiques - pour le développement
            console.log('🔄 Mode données statiques - création de locataire simulée');
            
            return res.json({
                success: true,
                message: `Locataire ${prenom} ${nom} créé avec succès (mode simulation)`,
                tenantId: 'mock_tenant_id',
                propertyId: propertyId
            });
        }

    } catch (error) {
        console.error('❌ Erreur générale lors de la création du locataire:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
});

module.exports = router; 