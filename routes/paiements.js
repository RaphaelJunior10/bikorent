const express = require('express');
const router = express.Router();
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');
const dataService = require('../services/dataService');
const billingService = require('../services/billingService');
const { checkPagePermissions } = require('../middleware/billingMiddleware');

// Données du calendrier de paiement (structure JSON facilement modifiable)
const calendarData = {
    proprietaire: {
        paiements: [
            {
                locataire: "Marie Dubois",
                propriete: "Appartement T3 - Rue de la Paix",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 600 },
                    { mois: "Fév 2024", statut: "payé", montant: 600 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 600 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 600 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 600 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 600 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 600 },
                    { mois: "Août 2024", statut: "à-venir", montant: 600 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 600 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 600 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 600 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 600 }
                ]
            },
            {
                locataire: "Jean Martin",
                propriete: "Studio - Avenue Victor Hugo",
                paiements: [
                    { mois: "Jan 2024", statut: "en-retard", montant: 650 },
                    { mois: "Fév 2024", statut: "payé", montant: 650 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 650 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 650 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 650 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 650 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 650 },
                    { mois: "Août 2024", statut: "à-venir", montant: 650 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 650 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 650 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 650 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 650 }
                ]
            },
            {
                locataire: "Sophie Bernard",
                propriete: "Maison T4 - Boulevard Central",
                paiements: [
                    { mois: "Jan 2024", statut: "en-retard", montant: 900 },
                    { mois: "Fév 2024", statut: "en-retard", montant: 900 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 900 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 900 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 900 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 900 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 900 },
                    { mois: "Août 2024", statut: "à-venir", montant: 900 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 900 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 900 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 900 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 900 }
                ]
            },
            {
                locataire: "Pierre Durand",
                propriete: "Appartement T2 - Rue des Fleurs",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 550 },
                    { mois: "Fév 2024", statut: "payé", montant: 550 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 550 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 550 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 550 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 550 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 550 },
                    { mois: "Août 2024", statut: "à-venir", montant: 550 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 550 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 550 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 550 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 550 }
                ]
            },
            {
                locataire: "Claire Moreau",
                propriete: "Studio - Avenue de la République",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 480 },
                    { mois: "Fév 2024", statut: "payé", montant: 480 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 480 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 480 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 480 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 480 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 480 },
                    { mois: "Août 2024", statut: "à-venir", montant: 480 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 480 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 480 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 480 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 480 }
                ]
            },
            {
                locataire: "Thomas Leroy",
                propriete: "Appartement T3 - Rue du Commerce",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 720 },
                    { mois: "Fév 2024", statut: "à-venir", montant: 720 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 720 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 720 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 720 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 720 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 720 },
                    { mois: "Août 2024", statut: "à-venir", montant: 720 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 720 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 720 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 720 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 720 }
                ]
            }
        ]
    },
    locataire: {
        paiements: [
            {
                locataire: "Vous",
                propriete: "Appartement T3 - Rue de la Paix",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 600 },
                    { mois: "Fév 2024", statut: "payé", montant: 600 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 600 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 600 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 600 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 600 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 600 },
                    { mois: "Août 2024", statut: "à-venir", montant: 600 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 600 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 600 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 600 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 600 }
                ]
            },
            {
                locataire: "Vous",
                propriete: "Studio - Avenue Victor Hugo",
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 650 },
                    { mois: "Fév 2024", statut: "à-venir", montant: 650 },
                    { mois: "Mar 2024", statut: "à-venir", montant: 650 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 650 },
                    { mois: "Mai 2024", statut: "à-venir", montant: 650 },
                    { mois: "Juin 2024", statut: "à-venir", montant: 650 },
                    { mois: "Juil 2024", statut: "à-venir", montant: 650 },
                    { mois: "Août 2024", statut: "à-venir", montant: 650 },
                    { mois: "Sep 2024", statut: "à-venir", montant: 650 },
                    { mois: "Oct 2024", statut: "à-venir", montant: 650 },
                    { mois: "Nov 2024", statut: "à-venir", montant: 650 },
                    { mois: "Déc 2024", statut: "à-venir", montant: 650 }
                ]
            }
        ]
    }
};

// Générer les données de test pour les paiements
function generatePaiementsData() {
    const proprietairePaiements = [
        {
            id: 1,
            locataire: "Marie Dubois",
            propriete: "Appartement T3 - Rue de la Paix",
            montant: 600,
            datePaiement: "2024-02-01",
            mois: "Février 2024",
            statut: "paid",
            methode: "virement",
            commentaire: "Paiement ponctuel"
        },
        {
            id: 2,
            locataire: "Jean Martin",
            propriete: "Studio - Avenue Victor Hugo",
            montant: 650,
            datePaiement: "2024-02-05",
            mois: "Février 2024",
            statut: "paid",
            methode: "cheque",
            commentaire: "Paiement en retard"
        },
        {
            id: 3,
            locataire: "Sophie Bernard",
            propriete: "Maison T4 - Boulevard Central",
            montant: 900,
            datePaiement: null,
            mois: "Février 2024",
            statut: "overdue",
            methode: null,
            commentaire: "En retard de 2 mois"
        },
        {
            id: 4,
            locataire: "Pierre Durand",
            propriete: "Appartement T2 - Rue des Fleurs",
            montant: 550,
            datePaiement: "2024-02-15",
            mois: "Février 2024",
            statut: "paid",
            methode: "virement",
            commentaire: "Paiement automatique"
        },
        {
            id: 5,
            locataire: "Claire Moreau",
            propriete: "Studio - Avenue de la République",
            montant: 480,
            datePaiement: "2024-02-10",
            mois: "Février 2024",
            statut: "paid",
            methode: "carte",
            commentaire: "Paiement en ligne"
        },
        {
            id: 6,
            locataire: "Thomas Leroy",
            propriete: "Appartement T3 - Rue du Commerce",
            montant: 720,
            datePaiement: null,
            mois: "Février 2024",
            statut: "pending",
            methode: null,
            commentaire: "En attente de paiement"
        }
    ];

    const locatairePaiements = [
        {
            id: 1,
            propriete: "Appartement T3 - Rue de la Paix",
            montant: 600,
            datePaiement: "2024-02-01",
            mois: "Février 2024",
            statut: "paid",
            methode: "virement",
            commentaire: "Paiement ponctuel"
        },
        {
            id: 2,
            propriete: "Studio - Avenue Victor Hugo",
            montant: 650,
            datePaiement: "2024-01-01",
            mois: "Janvier 2024",
            statut: "paid",
            methode: "virement",
            commentaire: "Paiement automatique"
        },
        {
            id: 3,
            propriete: "Appartement T3 - Rue de la Paix",
            montant: 600,
            datePaiement: null,
            mois: "Mars 2024",
            statut: "pending",
            methode: null,
            commentaire: "À payer avant le 5 mars"
        }
    ];

    return {
        proprietaire: {
            paiements: proprietairePaiements,
            locataires: [
                "Marie Dubois",
                "Jean Martin", 
                "Sophie Bernard",
                "Pierre Durand",
                "Claire Moreau",
                "Thomas Leroy"
            ],
            proprietes: [
                "Appartement T3 - Rue de la Paix",
                "Studio - Avenue Victor Hugo",
                "Maison T4 - Boulevard Central",
                "Appartement T2 - Rue des Fleurs",
                "Studio - Avenue de la République",
                "Appartement T3 - Rue du Commerce"
            ],
            mois: [
                "Janvier 2024",
                "Février 2024", 
                "Mars 2024",
                "Avril 2024",
                "Mai 2024",
                "Juin 2024"
            ],
            calendrier: calendarData.proprietaire
        },
        locataire: {
            paiements: locatairePaiements,
            proprietes: [
                "Appartement T3 - Rue de la Paix",
                "Studio - Avenue Victor Hugo"
            ],
            mois: [
                "Janvier 2024",
                "Février 2024", 
                "Mars 2024",
                "Avril 2024",
                "Mai 2024",
                "Juin 2024"
            ],
            calendrier: calendarData.locataire
        }
    };
}

// Page des paiements
router.get('/', checkPagePermissions, async (req, res) => {
    // Récupérer l'utilisateur connecté depuis la session ou l'authentification
    const connectedUserId = req.session.user.id;
    let ownerId = req.session.user.id; // ID du propriétaire connecté
    
    // Initialiser les données par défaut
    let paiementsData = generatePaiementsData();
    
    // Récupération des données depuis Firebase si activé
    if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
        try {
            // Récupérer toutes les propriétés du propriétaire
            const firebasePropertiesAll = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                { type: 'where', field: 'isDeleted', operator: '!=', value: true }
            ]);

            //On recupere les proprietes appartenant au user connecte ainsi que les proprietes qu il loue
            const firebaseProperties = firebasePropertiesAll.filter(p => (p.tenant && p.tenant.userId === connectedUserId) || (p.ownerId === connectedUserId));
            

            // Récupérer tous les utilisateurs (locataires)
            const firebaseUsers = await firestoreUtils.getAll(COLLECTIONS.USERS);
            
            // Récupérer tous les paiements
            const firebasePayments = await firestoreUtils.getAll(COLLECTIONS.PAYMENTS);
            
            console.log(`📊 Données récupérées: ${firebaseProperties.length} propriétés, ${firebaseUsers.length} utilisateurs, ${firebasePayments.length} paiements`);
            
            // Transformer les données Firebase en format attendu par l'interface
            const proprietairePaiements = [];
            const locatairePaiements = [];
            const proprietes = [];
            const locataires = [];
            const entryDates = [];
            const mois = generateMoisList();
            let amountWaited = 0;
            let proprietesDueList = [];
            let locatairesDueList = [];
            
            // Traiter chaque propriété pour construire les données de paiement
            firebaseProperties.forEach(property => {
                if (property.tenant && property.tenant.userId) {
                    // Trouver l'utilisateur correspondant
                    const user = firebaseUsers.find(u => u.id === property.tenant.userId);
                    const entryDate = property.tenant.entryDate;
                    const dateNow = new Date();
                    const monthDiff = fullMonthsBetween(new Date(entryDate), dateNow); //tien compte de la difference des annees
                    //if (user && user.type === 'tenant') {
                        console.log(`💳 Traitement des paiements pour: ${user.profile.firstName} ${user.profile.lastName}`);
                        
                        // Trouver les paiements de ce locataire pour cette propriété
                        const userPayments = firebasePayments.filter(p => p.userId === user.id && p.date >= entryDate && p.propertyId === property.id);
                        const totalPayed = userPayments.map(p => p.amount).reduce((a, b) => a + b, 0);
                        // Ajouter les informations de base
                        proprietes.push(property.name);
                        locataires.push(`${user.profile.firstName} ${user.profile.lastName}`);
                        entryDates.push(entryDate);
                        // Traiter chaque paiement du locataire
                        userPayments.forEach(payment => {
                            const date2 = new Date(payment.date);
                            date2.setUTCDate(1);
                            if (user.id !== connectedUserId) {
                                
                                
                                proprietairePaiements.push({
                                    id: payment.id,
                                    locataire: `${user.profile.firstName} ${user.profile.lastName}`,
                                    propriete: property.name,
                                    montant: payment.amount,
                                    datePaiement: payment.date,
                                    mois: formatMonthYear(new Date(date2)),
                                    statut: payment.status,
                                    methode: payment.method || 'virement',
                                    commentaire: payment.description || 'Paiement de loyer'
                                });
                            }
                            
                            // Ajouter aux paiements locataire (si c'est le locataire connecté)
                            if (user.id === connectedUserId) {
                                
                                locatairePaiements.push({
                                    id: payment.id,
                                    propriete: property.name,
                                    montant: payment.amount,
                                    datePaiement: payment.date,
                                    mois: formatMonthYear(new Date(date2)),
                                    statut: payment.status,
                                    methode: payment.method || 'virement',
                                    commentaire: payment.description || 'Paiement de loyer',
                                    entryDate: entryDate,
                                    monthlyRent: property.monthlyRent
                                });
                            }
                        });
                        const montantDue = property.monthlyRent * monthDiff - totalPayed;
                        //console.log(user.profile.firstName,montantDue, totalPayed, property.monthlyRent, monthDiff, entryDate);
                        
                        if(montantDue > 0){
                            if(user.id != connectedUserId){
                                amountWaited += property.monthlyRent * monthDiff;
                                proprietesDueList.push({
                                    user: `${user.profile.firstName} ${user.profile.lastName}`,
                                    propriete: property.name,
                                    montantPaye: totalPayed,
                                    montantDue: montantDue,
                                    moisDue: Math.ceil(montantDue / property.monthlyRent)
                                });
                            }else {
                                locatairesDueList.push({
                                    user: `${user.profile.firstName} ${user.profile.lastName}`,
                                    propriete: property.name,
                                    montantPaye: totalPayed,
                                    montantDue: montantDue,
                                    moisDue: Math.ceil(montantDue / property.monthlyRent)
                                });
                            }
                        }
                        
                        /*// Ajouter les paiements manquants (à venir/en retard)
                        const calendrierPaiements = generateCalendrierPaiements(property, user, userPayments);
                        
                        // Ajouter aux paiements sans date (à venir/en retard)
                        const today = new Date();
                        const currentMonth = today.getMonth();
                        const currentYear = today.getFullYear();
                        
                        // Vérifier les mois manquants
                        for (let i = 0; i < 12; i++) {
                            const monthDate = new Date(currentYear, currentMonth + i, 1);
                            const moisStr = formatMonthYear(monthDate);
                            
                            const paiementExistant = userPayments.find(p => 
                                formatMonthYear(new Date(p.date)) === moisStr
                            );
                            
                            if (!paiementExistant && i < 6) { // Limiter à 6 mois à venir
                                const statut = i === 0 ? 'pending' : 'future';
                                proprietairePaiements.push({
                                    id: `future-${user.id}-${i}`,
                                    locataire: `${user.profile.firstName} ${user.profile.lastName}`,
                                    propriete: property.name,
                                    montant: property.monthlyRent,
                                    datePaiement: null,
                                    mois: moisStr,
                                    statut: statut,
                                    methode: null,
                                    commentaire: statut === 'pending' ? 'À payer' : 'Paiement à venir'
                                });
                            }
                        }*/
                    //}
                }
            });
            
            // Générer les données du calendrier (logique du dashboard)
            const calendrierData = await generateCalendarDataFromDashboard(firebaseProperties, firebaseUsers, firebasePayments, ownerId);
            
            // Mettre à jour les données
            paiementsData = {
                proprietaire: {
                    paiements: proprietairePaiements,
                    locataires: locataires,
                    proprietes: proprietes,
                    amountWaited: amountWaited,
                    mois: mois,
                    proprietesDueList: proprietesDueList,
                    calendrier: calendrierData.proprietaire
                },
                locataire: {
                    paiements: locatairePaiements,
                    proprietes: firebaseProperties.filter(p => p.tenant && p.tenant.userId === connectedUserId),
                    mois: mois,
                    locatairesDueList: locatairesDueList,
                    calendrier: calendrierData.locataire
                }
            };
            
            console.log(`✅ ${proprietairePaiements.length} paiements récupérés depuis Firebase pour le propriétaire ${ownerId}`);
            console.log(`✅ ${locatairePaiements.length} paiements récupérés depuis Firebase pour le locataire ${connectedUserId}`);
            console.log(`✅ Propriétés du locataire:`, paiementsData.locataire.proprietes);
            console.log(`✅ Calendrier locataire:`, calendrierData.locataire);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des paiements depuis Firebase:', error);
            console.log('🔄 Utilisation des données statiques par défaut');
            // En cas d'erreur, on garde les données statiques par défaut
        }
    } else {
        console.log('🔄 Firebase désactivé ou non initialisé - utilisation des données statiques');
    }
    
    // Récupérer les permissions de facturation
    const userBillingPlan = await billingService.getUserBillingPlan(req.session.user.id);
    const pagePermissions = req.pagePermissions || {};
    
    res.render('paiements', {
        title: 'Paiements - BikoRent',
        pageTitle: 'Paiements',
        currentPage: 'paiements',
        user: {
            name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Admin',
            role: req.session.user ? req.session.user.role : 'Propriétaire'
        },
        paiementsData: paiementsData,
        userBillingPlan: userBillingPlan,
        pagePermissions: pagePermissions
    });
});

// Fonction pour calculer le nombre de mois complets entre deux dates
function fullMonthsBetween(date1, date2) {
    const start = date1 < date2 ? date1 : date2;
    const end   = date1 < date2 ? date2 : date1;
  
    let months = (end.getFullYear() - start.getFullYear()) * 12 +
                 (end.getMonth() - start.getMonth());
  
    /*if (end.getDate() < start.getDate()) {
      months -= 1; // on retire le mois en cours s’il n’est pas complet
    }*/
    return months;
}

// Fonctions utilitaires pour la génération des données
function generateMoisList() {
    const mois = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    for (let i = -2; i < 7; i++) { // 2 mois passés + mois actuel + 6 mois à venir
        const monthDate = new Date(currentYear, currentMonth + i, 1);
        mois.push(formatMonthYear(monthDate));
    }
    
    return mois;
}

function formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function generateCalendrierPaiements(property, user, payments) {
    const calendrier = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, currentMonth + i, 1);
        const moisStr = formatMonthYear(monthDate);
        
        const paiementExistant = payments.find(p => 
            formatMonthYear(new Date(p.date)) === moisStr
        );
        
        let statut = 'à-venir';
        if (paiementExistant) {
            statut = paiementExistant.status === 'completed' ? 'payé' : 'en-retard';
        } else if (i === 0) {
            statut = 'en-retard';
        }
        
        calendrier.push({
            mois: moisStr,
            statut: statut,
            montant: property.monthlyRent
        });
    }
    
    return calendrier;
}

// Fonction pour générer les données du calendrier basée sur la logique du dashboard
async function generateCalendarDataFromDashboard(properties, users, payments, connectedUserId) {
    try {
        console.log('🔄 Génération du calendrier basé sur la logique du dashboard...');
        
        // Identifier l'utilisateur connecté
        const connectedUser = users.find(user => user.id === connectedUserId);
        if (!connectedUser) {
            console.log('⚠️ Utilisateur connecté non trouvé, utilisation des données par défaut');
            return {
                proprietaire: { paiements: [] },
                locataire: { paiements: [] }
            };
        }
        
        // Filtrer les propriétés du propriétaire connecté
        const userProperties = properties.filter(property => property.ownerId === connectedUserId);
        
        // Générer le calendrier pour le propriétaire
        const paymentCalendar = [];
        
        userProperties.forEach(property => {
            if (property.tenant && property.tenant.userId) {
                const tenant = users.find(u => u.id === property.tenant.userId);
                if (tenant) {
                    const entryDate = new Date(property.tenant.entryDate);
                    const tenantPayments = [];
                    
                    // Générer les paiements pour les 12 derniers mois
                    let payed = 0;
                    let lastMonthPayment = null;
                    for (let i = 0; i <= 11; i++) {
                        const date = new Date();
                        date.setDate(1);
                        date.setMonth(date.getMonth() - i);
                        date.setUTCDate(1);
                        
                        if (date > entryDate) {
                            const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                            
                            // Chercher un paiement pour ce mois
                            let monthPayment = null;
                            const monthPaymentList = payments.filter(p => {
                                const paymentDate = new Date(p.date);
                                paymentDate.setUTCDate(1);
                                
                                return p.userId === tenant.id && 
                                    p.propertyId === property.id &&
                                    paymentDate.getMonth() === date.getMonth() && 
                                    paymentDate.getFullYear() === date.getFullYear() 
                            });

                                //montPaymentList est un tableau des paiements du mois en cours de l'utilisateur, on considere qu un user peut faire plusieurs paiements par mois si il le souhaite
                            let paidUsed = 0; //montant payé par le user mais réellement utilisé pour le loyer
                            if(monthPaymentList.length > 0){
                                //Ici, le paiement a bien été effectué pour le mois en cours
                                //On recupere le montant total des paiements deffectue pendant le mois en cours de l'utilisateur
                                const montant = monthPaymentList.map(p => p.amount).reduce((a, b) => a + b, 0);
                                monthPayment = monthPaymentList[monthPaymentList.length - 1];
                                monthPayment.amount = montant;
                                //const monthsPaidDeclared = monthPaymentList.filter(p => p.monthsPaid);
                                //monthsPaid += monthsPaidDeclared.map(p => p.monthsPaid).reduce((a, b) => a + b, 0) - monthsPaidDeclared.length;
                                const paidPlus = montant - property.monthlyRent; 
                                payed += paidPlus > 0 ? paidPlus : 0; //Le surplus entre le montant payé et le loyer mensuel, sera utilisé comme loyer des mois en retard ou a venir
                                lastMonthPayment = monthPaymentList[monthPaymentList.length - 1];
                                paidUsed = property.monthlyRent;
                                if(montant < property.monthlyRent){
                                    console.log('montant < property.monthlyRent');
                                    paidUsed = montant;
                                    monthPayment.status = 'partiel';
                                }
                            }else {
                                //Ici, le paiement n'a pas été effectué pour le mois en cours, on se sert du surplus pour le/les mois précédent en retard 
                                    if(payed > property.monthlyRent){
                                        payed -= property.monthlyRent;
                                        monthPayment = lastMonthPayment;
                                        monthPayment.amount = 0;
                                        monthPayment.status = 'completé';
                                        paidUsed = property.monthlyRent //Permettra de calculer le montant réellement utilisé pour le loyer
                                    }else {
                                        monthPayment = null;
                                    }
                            }
                            
                            tenantPayments.push({
                                mois: monthYear,
                                statut: monthPayment ? (monthPayment.status === 'paid' || monthPayment.status === 'payé' ? 'payé' : monthPayment.status === 'completé' ? 'completé' : monthPayment.status === 'partiel' ? 'partiel' : 'en-retard') : 'en-retard',
                                montant: monthPayment ? monthPayment.amount || 0 : property.monthlyRent || 0,
                                paidUsed: paidUsed
                            });
                        }
                    }
                    //console.log('tenantPayments', tenantPayments);
                    
                        //On calcule le montant réellement utilisé pour le loyer
                    const paidUsedAll = tenantPayments.map(p => p.paidUsed).reduce((a, b) => a + b, 0);
                    //On calcule le montant total des paiements effectués
                    const amountAll = tenantPayments.filter(p => p.statut == 'payé' || p.statut == 'partiel').map(p => p.montant).reduce((a, b) => a + b, 0);
                    //On calcule le nombre de mois en retard ou a venir dont le surplus peut couvrir le loyer
                    let nb = Math.floor((amountAll - paidUsedAll) / property.monthlyRent);
                    //console.log('nb', nb);
                    //console.log('amountAll', amountAll);
                    //console.log('paidUsedAll', paidUsedAll);
                    
                    
                    if(nb > 0){
                        //On parcourt le tableau dans le sens inverse pour marquer dabord les mois les plus anciens qui sont en retard comme payés
                        for(let i = tenantPayments.length - 1; i >= 0; i--) {
                            if(nb == 0) {
                                break;
                            }
                            const payment = tenantPayments[i];
                            if(payment.statut == 'en-retard') {
                                tenantPayments[i].statut = 'completé';
                                tenantPayments[i].montant = 0;
                                nb--;
                            }else if(payment.statut == 'partiel') {
                                tenantPayments[i].statut = 'completé';
                                nb--;
                            }
                        }
                    }
                    
                    paymentCalendar.push({
                        locataire: `${tenant.profile.firstName} ${tenant.profile.lastName}`,
                        propriete: property.name,
                        paiements: tenantPayments
                    });
                }
            }
        });
        
        // Générer le calendrier pour le locataire (si c'est un locataire connecté)
        let userCalendar = { paiements: [] };
        
        // Vérifier si l'utilisateur connecté est un locataire
        // Chercher dans toutes les propriétés si cet utilisateur est locataire quelque part
        const thisUserProperties = properties.filter(p => p.tenant && p.tenant.userId === connectedUserId);
        console.log(`🔍 Recherche de propriétés pour l'utilisateur ${connectedUserId}:`, thisUserProperties.length, 'propriétés trouvées');
        
        if (thisUserProperties.length > 0) {
            console.log('✅ Utilisateur connecté est un locataire, génération du calendrier locataire');
            
            // Traiter toutes les propriétés où l'utilisateur est locataire
            thisUserProperties.forEach(userProperty => {
                const entryDate = new Date(userProperty.tenant.entryDate);
                const userTenantPayments = [];
                let payed = 0;
                let lastMonthPayment = null;
                for (let i = 0; i <= 11; i++) {
                    const date = new Date();
                    date.setDate(1);
                    date.setMonth(date.getMonth() - i);
                    date.setUTCDate(1);
                    //On cherche a identifier ls payements payé puis a marquer paye les autres mois si le montant le permet
                    if (date > entryDate) {
                        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

                        let monthPayment = null;
                        
                        const monthPaymentList = payments.filter(p => {
                            //On ne recupere que les paiements du mois en cours de l'utilisateur
                            const paymentDate = new Date(p.date);
                            paymentDate.setUTCDate(1); //On ramene au 25 pour eviter les erreures de conversion des sates du aux fuseau horaire
                            return p.userId === connectedUserId && 
                            p.propertyId === userProperty.id &&
                            paymentDate.getMonth() === date.getMonth() && 
                            paymentDate.getFullYear() === date.getFullYear();
                        });
                        //montPaymentList est un tableau des paiements du mois en cours de l'utilisateur, on considere qu un user peut faire plusieurs paiements par mois si il le souhaite
                        let paidUsed = 0; //montant payé par le user mais réellement utilisé pour le loyer
                        if(monthPaymentList.length > 0){
                            //Ici, le paiement a bien été effectué pour le mois en cours
                            //On recupere le montant total des paiements deffectue pendant le mois en cours de l'utilisateur
                            const montant = monthPaymentList.map(p => p.amount).reduce((a, b) => a + b, 0);
                            monthPayment = monthPaymentList[monthPaymentList.length - 1];
                            monthPayment.amount = montant;
                            //const monthsPaidDeclared = monthPaymentList.filter(p => p.monthsPaid);
                            //monthsPaid += monthsPaidDeclared.map(p => p.monthsPaid).reduce((a, b) => a + b, 0) - monthsPaidDeclared.length;
                            const paidPlus = montant - userProperty.monthlyRent; 
                            payed += paidPlus > 0 ? paidPlus : 0; //Le surplus entre le montant payé et le loyer mensuel, sera utilisé comme loyer des mois en retard ou a venir
                            lastMonthPayment = monthPaymentList[monthPaymentList.length - 1];
                            paidUsed = userProperty.monthlyRent;
                            if(montant < userProperty.monthlyRent){
                                paidUsed = montant;
                                monthPayment.status = 'partiel';
                            }
                        }else {
                            //Ici, le paiement n'a pas été effectué pour le mois en cours, on se sert du surplus pour le/les mois précédent en retard 
                                if(payed > userProperty.monthlyRent){
                                    payed -= userProperty.monthlyRent;
                                    monthPayment = lastMonthPayment;
                                    monthPayment.amount = 0;
                                    monthPayment.status = 'completé';
                                    paidUsed = userProperty.monthlyRent //Permettra de calculer le montant réellement utilisé pour le loyer
                                }else {
                                    monthPayment = null;
                                }
                        }
                        
                        userTenantPayments.push({
                            mois: monthYear,
                            statut: monthPayment ? (monthPayment.status === 'paid' || monthPayment.status === 'payé' ? 'payé' : monthPayment.status === 'completé' ? 'completé' : monthPayment.status === 'partiel' ? 'partiel' : 'en-retard') : 'en-retard',
                            montant: monthPayment ? monthPayment.amount || 0 : userProperty.monthlyRent || 0,
                            paidUsed: paidUsed
                        });
                    }
                }
                //On calcule le montant réellement utilisé pour le loyer
                const paidUsedAll = userTenantPayments.map(p => p.paidUsed).reduce((a, b) => a + b, 0);
                //On calcule le montant total des paiements effectués
                const amountAll = userTenantPayments.filter(p => p.statut == 'payé' || p.statut == 'partiel').map(p => p.montant).reduce((a, b) => a + b, 0);
                //On calcule le nombre de mois en retard ou a venir dont le surplus peut couvrir le loyer
                let nb = Math.floor((amountAll - paidUsedAll) / userProperty.monthlyRent);
                
                if(nb > 0){
                    //On parcourt le tableau dans le sens inverse pour marquer dabord les mois les plus anciens qui sont en retard comme payés
                    for(let i = userTenantPayments.length - 1; i >= 0; i--) {
                        if(nb == 0) {
                            break;
                        }
                        const payment = userTenantPayments[i];
                        if(payment.statut == 'en-retard') {
                            userTenantPayments[i].statut = 'completé';
                            userTenantPayments[i].montant = 0;
                            nb--;
                        }else if(payment.statut == 'partiel') {
                            userTenantPayments[i].statut = 'completé';
                            nb--;
                        }
                    }
                }
                userCalendar.paiements.push({
                    locataire: 'Vous',
                    propriete: userProperty.name,
                    paiements: userTenantPayments
                });
            });
        } else {
            console.log('⚠️ Utilisateur connecté n\'est pas un locataire ou aucune propriété trouvée');
        }
        
        return {
            proprietaire: {
                paiements: paymentCalendar
            },
            locataire: userCalendar
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération du calendrier:', error);
        return {
            proprietaire: { paiements: [] },
            locataire: { paiements: [] }
        };
    }
}

function generateCalendrierData(proprietes, locataires, paiements, entryDates) {
    /*console.log('proprietes', proprietes);
    console.log('locataires', locataires);
    console.log('paiements', paiements);
    console.log('entryDates', entryDates);*/
    
    const calendrier = {
        proprietaire: {
            paiements: []
        },
        locataire: {
            paiements: []
        }
    };
    
    proprietes.forEach((propriete, index) => {
        const locataire = locataires[index] || 'Locataire';
        const proprietePayments = paiements.filter(p => p.propriete === propriete);
        
        // Générer le calendrier pour cette propriété
        const calendrierPaiements = generateMoisCalendrier(proprietePayments, propriete, entryDates[index]);
        
        calendrier.proprietaire.paiements.push({
            locataire: locataire,
            propriete: propriete,
            paiements: calendrierPaiements
        });
        
        // Si c'est pour la vue locataire, ajouter aussi
        if (index < 2) {
            calendrier.locataire.paiements.push({
                locataire: 'Vous',
                propriete: propriete,
                paiements: calendrierPaiements
            });
        }
    });
    
    return calendrier;
}

function generateMoisCalendrier(paiements, propriete, entryDate) {
    const calendrier = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    //console.log(propriete, today);
    
    /*if(new Date(entryDate) < today) {
        console.log('entryDate', entryDate);
        console.log('today', today);
        
        return calendrier;
    }*/
    
    // Format des mois attendu par le calendrier côté client
    /*const moisFormats = [
        "Jan 2024", "Fév 2024", "Mar 2024", "Avr 2024", "Mai 2024", "Juin 2024",
        "Juil 2024", "Août 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Déc 2024"
    ];*/
    
    /*for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, currentMonth + i, 1);
        const moisStr = moisFormats[i];
        const moisLong = formatMonthYear(monthDate);
        
        const paiementExistant = paiements.find(p => 
            formatMonthYear(new Date(p.datePaiement)) === moisLong
        );
        
        let statut = 'à-venir';
        let montant = 0;
        
        if (paiementExistant) {
            statut = paiementExistant.statut === 'paid' || paiementExistant.statut === 'completed' ? 'payé' : 'en-retard';
            montant = paiementExistant.montant;
        } else if (i === 0) {
            statut = 'en-retard';
            montant = paiementExistant?.montant || 0;
        } else {
            montant = paiementExistant?.montant || 0;
        }
        
        calendrier.push({
            mois: moisStr,
            statut: statut,
            montant: montant
        });
    }*/

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setUTCDate(1);
        date.setMonth(date.getMonth() - i );
        date.setUTCDate(1);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        
        
        const moisLong = formatMonthYear(date);
        const paiementExistant = paiements.find(p => {
            const paymentDate = new Date(p.datePaiement);
                            paymentDate.setUTCDate(1);
            return formatMonthYear(paymentDate) === moisLong
        }
        );
       // console.log('paiementExistant', paiementExistant);
        
        let statut = '';
        let montant = 0;
        
        if(new Date(entryDate) <= date) {
            
            if (paiementExistant) {
                //statut = paiementExistant.statut === 'paid' || paiementExistant.statut === 'completed' ? 'payé' : 'en-retard';
                statut = 'payé';
                montant = paiementExistant.montant;
            } /*else if (i === 0) {
                statut = 'en-retard';
                montant = paiementExistant?.montant || 0;
            }*/ else {
                statut = 'en-retard';
                montant = paiementExistant?.montant || 0;
            }
            
        }/*else {
            return calendrier;
        }*/

        calendrier.push({
            mois: monthYear,
            statut: statut,
            montant: montant
        });

        
        
        

        /*if (date > entryDate) {
            const monthPayment = userPayments.find(p => {
                const paymentDate = new Date(p.date);
                paymentDate.setUTCDate(25);
                return paymentDate.getMonth() === date.getMonth() && 
                    paymentDate.getFullYear() === date.getFullYear();
            });
            
            userTenantPayments.push({
                mois: monthYear,
                statut: monthPayment ? (monthPayment.status === 'payé' ? 'payé' : 'en-retard') : 'en-retard',
                montant: monthPayment ? monthPayment.amount || 0 : userProperty.monthlyRent || 0
            });
        }*/
    }
    
    return calendrier;
}

// Page de paiement pour les locataires
router.get('/paiement', async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté
        const connectedUserId = req.session.user.id;
        
        // Récupérer les données nécessaires depuis Firebase
        let userProperties = [];
        let userDebts = [];
        
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            try {
                // Récupérer toutes les propriétés
                const firebaseProperties = await firestoreUtils.query(COLLECTIONS.PROPERTIES);
                console.log('📋 Propriétés récupérées pour la page de paiement:', firebaseProperties.length);
                console.log('📋 Détails des propriétés:', firebaseProperties.map(p => ({
                    id: p.id,
                    name: p.name,
                    hasTenant: !!p.tenant,
                    tenantUserId: p.tenant?.userId
                })));
                
                // Filtrer les propriétés où l'utilisateur est locataire
                userProperties = firebaseProperties.filter(p => p.tenant && p.tenant.userId === connectedUserId);
                console.log('🏠 Propriétés du locataire trouvées:', userProperties.length);
                
                // Calculer les dettes pour chaque propriété
                userDebts = await calculateUserDebts(connectedUserId, userProperties);
                
                console.log(`✅ ${userProperties.length} propriétés trouvées pour l'utilisateur ${connectedUserId}`);
                console.log('💳 Dettes calculées:', userDebts);
                
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des données:', error);
                // Utiliser des données par défaut en cas d'erreur
                userProperties = [];
                userDebts = [];
            }
        }
        
        // Récupérer les informations complètes de l'utilisateur
        let userInfo = {
            name: 'Utilisateur',
            email: 'email@example.com',
            role: 'Locataire'
        };
        
        try {
            const userData = await dataService.getUser(connectedUserId);
            console.log('🔍 User data retrieved from dataService:', userData);
            
            if (userData) {
                console.log('🔍 User data firstName:', userData.firstName);
                console.log('🔍 User data lastName:', userData.lastName);
                console.log('🔍 User data name:', userData.name);
                console.log('🔍 User data email:', userData.email);
                
                if (userData.profile.firstName && userData.profile.lastName) {
                    userInfo.name = `${userData.profile.firstName} ${userData.profile.lastName}`;
                    console.log('✅ Using firstName + lastName:', userInfo.name);
                } else if (userData.profile.name) {
                    userInfo.name = userData.profile.name;
                    console.log('✅ Using name:', userInfo.name);
                }
                if (userData.profile.email) {
                    userInfo.email = userData.profile.email;
                }
                if (userData.role) {
                    userInfo.role = userData.role;
                }
            }
            console.log('🔍 Final userInfo:', userInfo);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des informations utilisateur:', error);
        }
        
        res.render('paiement', {
            title: 'Effectuer un Paiement - BikoRent',
            pageTitle: 'Effectuer un Paiement',
            currentPage: 'paiement',
            user: userInfo,
            userProperties: userProperties,
            userDebts: userDebts
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du rendu de la page de paiement:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Fonction pour calculer les dettes de l'utilisateur
async function calculateUserDebts(userId, properties) {
    const debts = [];
    
    for (const property of properties) {
        try {
            // Récupérer les paiements de l'utilisateur pour cette propriété
            const payments = await firestoreUtils.query(COLLECTIONS.PAYMENTS, [
                { type: 'where', field: 'userId', operator: '==', value: userId },
                { type: 'where', field: 'propertyId', operator: '==', value: property.id }
            ]);
            
            // Calculer les mois impayés
            const entryDate = new Date(property.tenant.entryDate);
            const today = new Date();
            const monthsDiff = (today - entryDate) / (1000 * 60 * 60 * 24 * 30);
            const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const unpaidMonths = Math.floor(monthsDiff - (totalPayments / (property.monthlyRent || 0))) ;
            //const unpaidMonths = Math.max(0, Math.ceil(monthsDiff - (totalPayments / (property.monthlyRent || 0))));
            console.log('unpaidMonths', unpaidMonths, monthsDiff, totalPayments, property.monthlyRent);
            
            debts.push({
                propertyId: property.id,
                propertyName: property.name,
                monthlyRent: property.monthlyRent,
                unpaidMonths: unpaidMonths,
                totalDebt: unpaidMonths * property.monthlyRent,
                entryDate: property.tenant.entryDate
            });
            
        } catch (error) {
            console.error(`❌ Erreur lors du calcul des dettes pour ${property.name}:`, error);
        }
    }
    
    return debts;
}

// Traitement des paiements
router.post('/process-payment', async (req, res) => {
    try {
        console.log('🔄 Traitement d\'un nouveau paiement...', req.body);
        
        // Récupérer l'utilisateur connecté
        const connectedUserId = req.session.user.id;
        
        // Valider les données reçues
        const {
            propertyId,
            propertyName,
            method,
            monthsToPay,
            monthlyRent,
            totalAmount,
            serviceFees,
            finalTotal,
            timestamp,
            mobidycDetails
        } = req.body;
        console.log('req.body', req.body);
        
        
        
        // Validation des champs obligatoires
        if (!propertyId || !method || !monthsToPay || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Données de paiement incomplètes'
            });
        }

        if(method === 'mobidyc'){
            if(!mobidycDetails.provider || !mobidycDetails.phoneNumber){
                return res.status(400).json({
                    success: false,
                    message: 'Provider ou numéro de téléphone non trouvés, veuillez contacter l\'administrateur'
                });
            }
        }else{
            return res.status(400).json({
                success: false,
                message: 'Méthode de paiement non supportée, veuillez contacter l\'administrateur'
            });
        }
        
        // Vérifier que le nombre de mois est valide
        if (monthsToPay < 1 || monthsToPay > 12) {
            return res.status(400).json({
                success: false,
                message: 'Le nombre de mois doit être entre 1 et 12'
            });
        }
        
        // Vérifier que le montant est valide
        if (totalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Le montant doit être supérieur à 0'
            });
        }
        
        // Vérifier que la propriété existe et appartient au locataire
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            try {
                console.log('🔍 Recherche de la propriété:', propertyId);
                console.log('🔍 Utilisateur connecté:', connectedUserId);
                
                const properties = await firestoreUtils.query(COLLECTIONS.PROPERTIES);
                console.log('📋 Total des propriétés récupérées:', properties.length);
                console.log('📋 IDs des propriétés:', properties.map(p => p.id));
                
                const property = properties.find(p => p.id === propertyId);
                console.log('🏠 Propriété trouvée:', property ? 'OUI' : 'NON');
                
                if (!property) {
                    console.error('❌ Propriété non trouvée avec l\'ID:', propertyId);
                    return res.status(404).json({
                        success: false,
                        message: 'Propriété non trouvée'
                    });
                }
                
                console.log('🏠 Détails de la propriété:', {
                    id: property.id,
                    name: property.name,
                    tenant: property.tenant,
                    hasTenant: !!property.tenant,
                    tenantUserId: property.tenant?.userId
                });
                
                if (!property.tenant || property.tenant.userId !== connectedUserId) {
                    console.error('❌ Utilisateur non autorisé:', {
                        hasTenant: !!property.tenant,
                        tenantUserId: property.tenant?.userId,
                        connectedUserId: connectedUserId
                    });
                    return res.status(403).json({
                        success: false,
                        message: 'Vous n\'êtes pas autorisé à effectuer un paiement pour cette propriété'
                    });
                }

                const trueAmount = property.monthlyRent * monthsToPay;
                if(trueAmount > totalAmount){
                    return res.status(400).json({
                        success: false,
                        message: 'Le montant payé est incorrect, veuillez contacter l\'administrateur'
                    });
                }

                const owner = await dataService.getUser(property.ownerId);
                if(!owner.mobidyc){
                    return res.status(400).json({
                        success: false,
                        message: 'Propriétaire non trouvé, veuillez contacter l\'administrateur'
                    });
                }
                
                const result = await dataService.singlePayement(`TXN_${Date.now()}`, owner.mobidyc.serviceId, totalAmount, mobidycDetails.phoneNumber, owner.mobidyc.serviceApikey);
    
                // Créer le paiement en base de données
                const paymentData = await createPaymentInDatabase({
                    propertyId,
                    propertyName,
                    method,
                    monthsToPay,
                    monthlyRent,
                    totalAmount: result.montant,
                    serviceFees,
                    finalTotal,
                    connectedUserId,
                    paymentDetails: req.body
                });
                
                const user = await dataService.getUser(connectedUserId);
                const email = user.profile.email;

                if(result.montant < totalAmount){
                    await dataService.sendMail(email, 'Paiement partiel', '/paiements', 'Votre paiement pour le loyer de la propriété ' + property.name + ' d\'une somme de ' + totalAmount + ' FCFA n\'a pas été effectué en entier, le montant payé est de ' + result.montant + ' FCFA. Veuillez compléter le paiement en ligne sur votre compte ou contacter l\'administrateur pour compléter le paiement.');
                    return res.status(400).json({
                        success: false,
                        message: 'Le paiement n\'a pas été effectué en entier, veuillez contacter l\'administrateur'
                    });
                }

                //On envoie un email de confirmation de paiement
                //await dataService.sendMail(email, 'Paiement traité avec succès', '/paiements', 'Votre paiement pour le loyer de la propriété ' + property.name + ' d\'une somme de ' + result.montant + ' FCFA a été traité avec succès');

                
                console.log('✅ Paiement créé avec succès:', paymentData);

                //ON verifi si user_automations[userId].automations.accountant-payment-alert.isActive est true
                const userAutomations = await dataService.getUserAutomations(connectedUserId);
                if (userAutomations.automations['accountant-payment-alert'].isActive) {
                    
                    //On envoi un email de confirmation de paiement
                    const msg = 'Un nouveau paiement a été effectué pour la propriété ' + propertyName + '. Connectez-vous à votre compte pour voir les détails.';
                    const msgTenant = 'Vous venez d\'effectuer un paiement pour la propriété ' + propertyName + '. Connectez-vous à votre compte pour voir les détails.';
                    await sendEmail(owner.profile.email, 'Nouveau paiement','/paiements', msg);
                    await sendEmail(user.profile.email, 'Nouveau paiement','/paiements', msgTenant);
                }
                
                res.json({
                    success: true,
                    message: 'Paiement effectué avec succès',
                    paymentId: paymentData.id,
                    reference: paymentData.reference
                });
                
            } catch (error) {
                console.error('❌ Erreur lors de la création du paiement:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création du paiement'
                });
            }
        } else {
            // Mode simulation pour les tests
            console.log('⚠️ Mode simulation - Paiement non enregistré');
            res.json({
                success: true,
                message: 'Paiement simulé avec succès',
                paymentId: 'SIM-' + Date.now(),
                reference: 'SIM-' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du traitement du paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors du traitement du paiement'
        });
    }
});

// Créer un paiement en base de données
async function createPaymentInDatabase(paymentInfo) {
    try {
        console.log('🔄 Création du paiement en base de données...', paymentInfo);
        
        // Vérifier que firestoreUtils est initialisé
        if (!firestoreUtils.isInitialized()) {
            throw new Error('FirestoreUtils n\'est pas initialisé');
        }
        
        // Générer un ID unique pour le paiement
        const paymentId = 'PAY-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        console.log('🆔 ID de paiement généré:', paymentId);
        
        // Créer l'objet paiement
        const paymentData = {
            userId: paymentInfo.connectedUserId,
            propertyId: paymentInfo.propertyId,
            amount: paymentInfo.totalAmount,
            monthsPaid: paymentInfo.monthsToPay,
            method: paymentInfo.method,
            status: 'paid',
            date: new Date().toISOString(),
            reference: generatePaymentReference(paymentInfo.method),
            description: 'Paiement via '+paymentInfo.method+' pour '+paymentInfo.propertyName,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Sauvegarder en base de données
        console.log('💾 Tentative de sauvegarde en base...', {
            collection: COLLECTIONS.PAYMENTS,
            paymentId: paymentId,
            dataKeys: Object.keys(paymentData)
        });
        console.log('paymentData', paymentData);
        
        
        const savedPayment = await firestoreUtils.add(COLLECTIONS.PAYMENTS, paymentData, paymentId);
        
        console.log('✅ Paiement sauvegardé en base:', savedPayment);
        
        // Simuler le traitement du paiement (dans un vrai système, ceci serait fait par l'API de paiement)
        //setTimeout(async () => {
            try {
                // Marquer le paiement comme complété
                await firestoreUtils.update(COLLECTIONS.PAYMENTS, paymentId, {
                    status: 'paid',
                    updatedAt: new Date()
                });
                
                console.log('✅ Paiement marqué comme complété:', paymentId);
            } catch (error) {
                console.error('❌ Erreur lors de la finalisation du paiement:', error);
            }
        //}, 5000); // Simuler un délai de traitement de 5 secondes
        
        return {
            success: true,
            paymentId: paymentId,
            paymentData: paymentData
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du paiement en base:', error);
        throw error;
    }
}

// Générer une référence de paiement
function generatePaymentReference(paymentMethod) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const methodPrefix = paymentMethod.toUpperCase().substr(0, 3);
    
    return `${methodPrefix}-${timestamp}-${random}`;
}

// Route pour traiter un paiement en espèces
router.post('/process-especes-payment', async (req, res) => {
    try {
        const connectedUserId = req.session.user.id;
        //On verifi que le user n est pas null
        if (!connectedUserId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Utilisateur non connecté' 
            });
        }
        console.log('🔍 [DEBUG] Processing cash payment for user:', connectedUserId);
        
        const { 
            propertyId, 
            months, 
            date, 
            commentaire,
        } = req.body;
        const method = 'Espèces';
        const isExternalPayment = false;
        const data = {};
        console.log('🔍 [DEBUG] Cash payment data received:', {
            propertyId,
            months,
            date,
            commentaire,
            method,
            isExternalPayment,
            data
        });
        
        // Validation des données
        if (!propertyId || !months || !date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données de paiement manquantes' 
            });
        }
        
        if (months <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le nombre de mois doit être supérieur à 0' 
            });
        }
        
        // Récupérer la propriété
        
        const property = await dataService.getPropertyById(propertyId);
        if (!property) {
            console.log('❌ [ERROR] Property not found:', propertyId);
            return res.status(404).json({ 
                success: false, 
                message: 'Propriété non trouvée' 
            });
        }
        
        console.log('✅ [DEBUG] Property found:', property);
        
        // Vérifier que l'utilisateur est soit le propriétaire soit le locataire de cette propriété
        const isOwner = property.ownerId === connectedUserId;
        const isTenant = property.tenant && property.tenant.userId === connectedUserId;
        
        // Pour les paiements externes, on autorise toujours
        if (!isExternalPayment && !isOwner && !isTenant) {
            console.log('❌ [ERROR] User not authorized:', {
                connectedUserId,
                propertyOwnerId: property.ownerId,
                propertyTenantId: property.tenant?.userId,
                isOwner,
                isTenant
            });
            return res.status(403).json({ 
                success: false, 
                message: 'Vous n\'êtes pas autorisé à enregistrer ce paiement pour cette propriété' 
            });
        }
        
        console.log('✅ [DEBUG] User authorized:', { isOwner, isTenant });
        
        // Calculer le montant
        const monthlyRent = property.monthlyRent || 0;
        const totalAmount = monthlyRent * months;
        
        // Créer le paiement
        const tenantName = property.tenant ? 
            (property.tenant.name || `${property.tenant.firstName || ''} ${property.tenant.lastName || ''}`.trim()) : 
            'Locataire inconnu';
            
        const paymentInfo = {
            propertyId,
            propertyName: property.name,
            connectedUserId: property.tenant ? property.tenant.userId : null,
            tenantName: tenantName,
            totalAmount: totalAmount,
            monthsToPay: months,
            method: method || 'Espèces',
            date: date,
            data: data,
            commentaire: commentaire || '',
            status: 'paid',
            externalDetails: isExternalPayment ? {
                isExternal: true,
                paymentDate: new Date().toISOString(),
                source: 'external_payment_page'
            } : null
        };
        
        console.log('🔍 [DEBUG] Creating cash payment with info:', paymentInfo);
        
        // Enregistrer le paiement dans la base de données
        const paymentResult = await createPaymentInDatabase(paymentInfo);
        
        if (paymentResult.success) {
            //ON verifi si user_automations[userId].automations.accountant-payment-alert.isActive est true
            const userAutomations = await dataService.getUserAutomations(connectedUserId);
            if (userAutomations.automations['accountant-payment-alert'].isActive) {
                //On recupere l email du user
                const user = await dataService.getUser(connectedUserId);
                const tenant = await dataService.getUser(property.tenant?.userId);
                //On envoi un email de confirmation de paiement
                const msg = 'Vous venez d\'ajouter un paiement en espèces pour la propriété ' + property.name + '. Connectez-vous à votre compte pour voir les détails.';
                await sendEmail(user.profile.email, 'Nouveau paiement','/paiements', msg);
                const msgTenant = 'Mr/Mme ' + user.profile.firstName + ' ' + user.profile.lastName + ' a enregistré en votre nom, un paiement en espèces pour la propriété ' + property.name + '. Connectez-vous à votre compte pour voir les détails.';
                await sendEmail(tenant.profile.email, 'Nouveau paiement','/paiements', msgTenant);
            }
            res.json({ 
                success: true, 
                message: 'Paiement en espèces enregistré avec succès',
                paymentId: paymentResult.paymentId
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de l\'enregistrement du paiement' 
            });
        }
        
    } catch (error) {
        console.error('❌ [ERROR] Error processing cash payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors du traitement du paiement en espèces' 
        });
    }
});

// Route pour récupérer les propriétés disponibles pour le paiement en espèces
router.get('/available-properties', async (req, res) => {
    try {
        const connectedUserId = req.session.user.id;
        
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            // Récupérer toutes les propriétés
            const allProperties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                { type: 'where', field: 'isDeleted', operator: '!=', value: true }
            ]);
            
            console.log(`🔍 [DEBUG] Recherche de propriétés pour l'utilisateur: ${connectedUserId}`);
            console.log(`🔍 [DEBUG] Total des propriétés récupérées: ${allProperties.length}`);
            
            // Filtrer les propriétés selon le rôle de l'utilisateur
            let availableProperties = [];
            let tenantsObject = {};
            
            // Vérifier si l'utilisateur est propriétaire
            const ownerProperties = allProperties.filter(property => property.ownerId === connectedUserId);
            console.log(`🔍 [DEBUG] Propriétés où l'utilisateur est propriétaire: ${ownerProperties.length}`);
            //On recupere les locataires de ces propriétés
            const tenantIds = ownerProperties.filter(property => property.tenant).map(property => property.tenant.userId);
            //On recupere les users
            const tenants = await dataService.getUsersByIds(tenantIds);
            //On les ranges dans un objet: userId: firstName, lastName
            tenantsObject = tenants.reduce((acc, tenant) => {
                acc[tenant.id] = {
                    firstName: tenant.profile.firstName,
                    lastName: tenant.profile.lastName
                };
                return acc;
            }, {});
            if (ownerProperties.length > 0) {
                // L'utilisateur est propriétaire
                availableProperties = ownerProperties
                    .filter(property => property.tenant && property.tenant.userId)
                    .map(property => ({
                        id: property.id,
                        name: property.name,
                        monthlyRent: property.monthlyRent,
                        tenant: property.tenant,
                        ownerId: property.ownerId
                    }));
                console.log(`✅ [DEBUG] Propriétés disponibles pour le propriétaire: ${availableProperties.length}`);
            } /*else {
                // Vérifier si l'utilisateur est locataire
                const tenantProperties = allProperties.filter(property => 
                    property.tenant && property.tenant.userId === connectedUserId
                );
                console.log(`🔍 [DEBUG] Propriétés où l'utilisateur est locataire: ${tenantProperties.length}`);
                
                if (tenantProperties.length > 0) {
                    // L'utilisateur est locataire - retourner ses propriétés pour information
                    availableProperties = tenantProperties.map(property => ({
                        id: property.id,
                        name: property.name,
                        monthlyRent: property.monthlyRent,
                        tenant: property.tenant,
                        ownerId: property.ownerId
                    }));
                    console.log(`✅ [DEBUG] Propriétés du locataire: ${availableProperties.length}`);
                }
            }*/
            
            res.json({
                success: true,
                properties: availableProperties,
                tenantsObject: tenantsObject,
                userRole: ownerProperties.length > 0 ? 'owner' : 'tenant'
            });
        } else {
            // Mode simulation avec des données de test
            const mockProperties = [
                {
                    id: 'prop-1',
                    name: 'Appartement T3 - Rue de la Paix',
                    monthlyRent: 600,
                    tenant: {
                        userId: 'tenant-1',
                        firstName: 'Marie',
                        lastName: 'Dubois'
                    }
                },
                {
                    id: 'prop-2',
                    name: 'Studio - Avenue Victor Hugo',
                    monthlyRent: 650,
                    tenant: {
                        userId: 'tenant-2',
                        firstName: 'Jean',
                        lastName: 'Martin'
                    }
                }
            ];
            
            res.json({
                success: true,
                properties: mockProperties
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des propriétés:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des propriétés',
            error: error.message
        });
    }
});

// Route de debug pour vérifier les données
router.get('/debug-data', async (req, res) => {
    try {
        const connectedUserId = req.session.user.id;
        
        if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
            const properties = await firestoreUtils.query(COLLECTIONS.PROPERTIES);
            const users = await firestoreUtils.query(COLLECTIONS.USERS);
            
            const userProperties = properties.filter(p => p.tenant && p.tenant.userId === connectedUserId);
            
            res.json({
                success: true,
                debug: {
                    connectedUserId: connectedUserId,
                    totalProperties: properties.length,
                    totalUsers: users.length,
                    userProperties: userProperties.length,
                    properties: properties.map(p => ({
                        id: p.id,
                        name: p.name,
                        hasTenant: !!p.tenant,
                        tenantUserId: p.tenant?.userId,
                        ownerId: p.ownerId
                    })),
                    userPropertiesDetails: userProperties.map(p => ({
                        id: p.id,
                        name: p.name,
                        tenant: p.tenant
                    }))
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Firebase non activé ou non initialisé'
            });
        }
    } catch (error) {
        console.error('❌ Erreur debug:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du debug',
            error: error.message
        });
    }
});

// Route pour les paiements externes (sans authentification)
router.get('/paiement-externe/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        console.log('🔗 [EXTERNAL PAYMENT] Demande de paiement externe pour la propriété:', propertyId);

        // Vérifier si Firebase est activé
        if (!isFirebaseEnabled) {
            console.log('❌ [EXTERNAL PAYMENT] Firebase désactivé, utilisation des données de test');
            return res.render('paiementExterne', {
                title: 'Paiement Externe - BikoRent',
                property: {
                    id: propertyId,
                    name: 'Appartement T3 - Rue de la Paix',
                    monthlyRent: 600,
                    tenant: {
                        name: 'Marie Dubois',
                        entryDate: '2023-01-01'
                    }
                },
                paiements: [
                    { mois: "Jan 2024", statut: "payé", montant: 600 },
                    { mois: "Fév 2024", statut: "payé", montant: 600 },
                    { mois: "Mar 2024", statut: "en-retard", montant: 600 },
                    { mois: "Avr 2024", statut: "à-venir", montant: 600 }
                ],
                error: null,
                layout: false
            });
        }

        // Récupérer la propriété depuis Firebase
        //const propertyDoc = await firestoreUtils.getDocument('proprietes', propertyId);
        const propertyDoc = await dataService.getPropertyById(propertyId);
        if (!propertyDoc) {
            console.log('❌ [EXTERNAL PAYMENT] Propriété non trouvée:', propertyId);
            return         res.render('paiementExterne', {
            title: 'Paiement Externe - BikoRent',
            property: null,
            paiements: [],
            error: 'Propriété non trouvée',
            layout: false
        });
        }

        //On verifi si la propriété a un lien de paiement
        if (!propertyDoc.isPaymentLink) {
            return res.render('paiementExterne', {
                title: 'Paiement Externe - BikoRent',
                property: null,
                paiements: [],
                error: 'Propriété non trouvée',
                layout: false
            });
        }

        const property = {
            id: propertyDoc.id,
            name: propertyDoc.name,
            monthlyRent: propertyDoc.monthlyRent,
            tenant: propertyDoc.tenant || null,
            isPaymentLink: propertyDoc.isPaymentLink
        };

        const tenant = await dataService.getUser(propertyDoc.tenant?.userId);
        if(!tenant){
            return res.render('paiementExterne', {
                title: 'Paiement Externe - BikoRent',
                property: null,
                error: 'Locataire non trouvé',
                layout: false
            });
        }
        property.tenant = {
            name: tenant.profile.firstName + ' ' + tenant.profile.lastName,
            email: tenant.profile.email
        };

        console.log('✅ [EXTERNAL PAYMENT] Propriété trouvée:', property);

        // Récupérer les paiements pour cette propriété
        /*const paymentsQuery = await firestoreUtils.queryCollection('paiements', [
            ['propertyId', '==', propertyId],
            ['status', '==', 'paid']
        ]);

        const paiements = paymentsQuery.map(payment => ({
            mois: payment.monthsPaid ? `${payment.monthsPaid} mois` : 'N/A',
            statut: payment.status,
            montant: payment.amount,
            date: payment.date,
            methode: payment.method
        }));*/

        //console.log('✅ [EXTERNAL PAYMENT] Paiements récupérés:', paiements.length);

        res.render('paiementExterne', {
            title: 'Paiement Externe - BikoRent',
            property: property,
            error: null,
            layout: false
        });

    } catch (error) {
        console.error('❌ [EXTERNAL PAYMENT] Erreur:', error);
        res.render('paiementExterne', {
            title: 'Paiement Externe - BikoRent',
            property: null,
            error: 'Erreur lors du chargement des données',
            layout: false
        });
    }
});

// Route pour traiter les paiements externes
router.post('/paiement-externe/:propertyId', async (req, res) => {
    try {
        //const { propertyId } = req.params;
        const { propertyId, months, date, method, commentaire, isExternalPayment, data } = req.body;
       
        console.log('💳 [EXTERNAL PAYMENT] Traitement paiement externe:', {
            propertyId,
            months,
            date,
            method,
            commentaire,
            isExternalPayment,
            data
        });

        if(months <= 0){
            return res.status(400).json({
                success: false,
                message: 'Le nombre de mois doit être supérieur à 0'
            });
        }

        if(method === 'mobidyc'){
            if(!data.provider || !data.phoneNumber){
                return res.status(400).json({
                    success: false,
                    message: 'Provider ou numéro de téléphone non trouvés, veuillez contacter l\'administrateur'
                });
            }
        }else{
            return res.status(400).json({
                success: false,
                message: 'Méthode de paiement non supportée, veuillez contacter l\'administrateur'
            });
        }
        
        // Récupérer la propriété

        const propertyDoc = await dataService.getPropertyById(propertyId);
        
        if (!propertyDoc) {
            return res.json({
                success: false,
                message: 'Propriété non trouvée'
            });
        }

        const amount = propertyDoc.monthlyRent * parseInt(months);

        const owner = await dataService.getUser(propertyDoc.ownerId);
        if(!owner.mobidyc){
            return res.status(400).json({
                success: false,
                message: 'Propriétaire non trouvé, veuillez contacter l\'administrateur'
            });
        }
        
        const result = await dataService.singlePayement(`TXN_${Date.now()}`, owner.mobidyc.serviceId, amount, data.phoneNumber, owner.mobidyc.serviceApikey);


        // Créer le paiement
        const paymentData = {
            userId: propertyDoc.tenant?.userId || 'external',
            propertyId: propertyId,
            amount: result.montant,
            monthsPaid: parseInt(months),
            method: method || 'Virement',
            status: 'paid',
            date: date,
            reference: `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            description: 'Paiement externe',
            recordedBy: 'external',
            userRole: 'tenant',
            createdAt: new Date(),
            updatedAt: new Date(),
            externalDetails: {
                comment: commentaire || '',
                source: 'external_link'
            }
        };
        
        // Sauvegarder en base
        const paymentId = await firestoreUtils.add(COLLECTIONS.PAYMENTS, paymentData);
        
        console.log('✅ [EXTERNAL PAYMENT] Paiement créé:', paymentId);
        const tenant = await dataService.getUser(propertyDoc.tenant?.userId);

        if(result.montant < amount){
            await dataService.sendMail(tenant.profile.email, 'Paiement partiel', '/paiements', 'Votre paiement pour le loyer de la propriété ' + propertyDoc.name + ' d\'une somme de ' + amount + ' FCFA n\'a pas été effectué en entier, le montant payé est de ' + result.montant + ' FCFA. Veuillez compléter le paiement en ligne sur votre compte ou contacter l\'administrateur pour compléter le paiement');
            return res.status(400).json({
                success: false,
                message: 'Le paiement n\'a pas été effectué en entier, veuillez contacter l\'administrateur'
            });
        }

        //ON verifi si user_automations[userId].automations.accountant-payment-alert.isActive est true
        const userAutomations = await dataService.getUserAutomations(propertyDoc.ownerId);
        if (userAutomations.automations['accountant-payment-alert'].isActive) {
            //On recupere l email du user
            const owner = await dataService.getUser(propertyDoc.ownerId);
            
            //On envoi un email de confirmation de paiement
            const msg = 'Un paiement vient d\'être effectué pour la propriété ' + propertyDoc.name + '. Connectez-vous à votre compte pour voir les détails.';
            const msgTenant = 'Un paiement vient d\'être effectué pour la propriété ' + propertyDoc.name + ' dont vous êtes locataire. Connectez-vous à votre compte pour voir les détails.';
            await sendEmail(owner.profile.email, 'Nouveau paiement','/paiements', msg);
            await sendEmail(tenant.profile.email, 'Nouveau paiement','/paiements', msgTenant);
        }

        res.json({
            success: true,
            message: 'Paiement enregistré avec succès',
            paymentId: paymentId,
            amount: amount
        });

    } catch (error) {
        console.error('❌ [EXTERNAL PAYMENT] Erreur traitement:', error);
        res.json({
            success: false,
            message: 'Erreur lors du traitement du paiement'
        });
    }
});

module.exports = router; 