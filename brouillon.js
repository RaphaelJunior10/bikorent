const express = require('express');
const router = express.Router();

// Page d'accueil (Dashboard)
router.get('/', (req, res) => {
    // Générer les données du dashboard
    const dashboardData = generateDashboardData();
    
    res.render('dashboard', {
        title: 'Dashboard - BikoRent',
        pageTitle: 'Dashboard',
        currentPage: 'dashboard',
        user: {
            name: 'Admin',
            role: 'Propriétaire'
        },
        dashboardData: dashboardData
    });
});

// Fonction pour générer les données du dashboard
function generateDashboardData() {
    return {
        proprietaire: {
            stats: {
                biensTotal: 24,
                biensLoues: 18,
                caMensuel: 12450,
                ceMois: 8200
            },
            alertes: {
                retards: 3,
                locataires: ['Marie Dubois', 'Jean Martin', 'Sophie Bernard']
            },
            retards: [
                {
                    locataire: 'Marie Dubois',
                    propriete: 'Appartement T33 - Rue de la Paix',
                    moisImpayes: 2,
                    montantDu: 1200
                },
                {
                    locataire: 'Jean Martin',
                    propriete: 'Studio - Avenue Victor Hugo',
                    moisImpayes: 1,
                    montantDu: 650
                },
                {
                    locataire: 'Sophie Bernard',
                    propriete: 'Maison T4 - Boulevard Central',
                    moisImpayes: 3,
                    montantDu: 1800
                }
            ],
            activites: [
                {
                    type: 'nouvelle_propriete',
                    titre: 'Nouvelle propriété ajoutée',
                    description: 'Appartement T2 - Rue des Fleurs (€850/mois)',
                    temps: 'Il y a 2 heures'
                },
                {
                    type: 'paiement_recu',
                    titre: 'Paiement reçu',
                    description: 'Marie Dubois - Appartement T3 (€600)',
                    temps: 'Il y a 1 jour'
                },
                {
                    type: 'nouvelle_propriete',
                    titre: 'Nouvelle propriété ajoutée',
                    description: 'Studio - Avenue de la République (€550/mois)',
                    temps: 'Il y a 3 jours'
                },
                {
                    type: 'paiement_recu',
                    titre: 'Paiement reçu',
                    description: 'Jean Martin - Studio (€650)',
                    temps: 'Il y a 5 jours'
                }
            ],
            calendrier: {
                paiements: [
                    {
                        locataire: 'Marie Dubois',
                        propriete: 'Appartement T3 - Rue de la Paix',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 600 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 600 },
                            { mois: 'Mar 2024', statut: 'payé', montant: 600 },
                            { mois: 'Avr 2024', statut: 'en-retard', montant: 600 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 600 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 600 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 600 },
                            { mois: 'Août 2024', statut: 'payé', montant: 600 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 600 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 600 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 600 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 600 }
                        ]
                    },
                    {
                        locataire: 'Jean Martin',
                        propriete: 'Studio - Avenue Victor Hugo',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 650 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 650 },
                            { mois: 'Mar 2024', statut: 'payé', montant: 650 },
                            { mois: 'Avr 2024', statut: 'en-retard', montant: 650 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 650 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 650 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 650 },
                            { mois: 'Août 2024', statut: 'payé', montant: 650 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 650 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 650 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 650 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 650 }
                        ]
                    },
                    {
                        locataire: 'Sophie Bernard',
                        propriete: 'Maison T4 - Boulevard Central',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 900 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 900 },
                            { mois: 'Mar 2024', statut: 'en-retard', montant: 900 },
                            { mois: 'Avr 2024', statut: 'en-retard', montant: 900 },
                            { mois: 'Mai 2024', statut: 'en-retard', montant: 900 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 900 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 900 },
                            { mois: 'Août 2024', statut: 'payé', montant: 900 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 900 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 900 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 900 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 900 }
                        ]
                    },
                    {
                        locataire: 'Pierre Durand',
                        propriete: 'Appartement T2 - Place du Marché',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 750 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 750 },
                            { mois: 'Mar 2024', statut: 'payé', montant: 750 },
                            { mois: 'Avr 2024', statut: 'payé', montant: 750 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 750 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 750 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 750 },
                            { mois: 'Août 2024', statut: 'payé', montant: 750 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 750 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 750 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 750 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 750 }
                        ]
                    },
                    {
                        locataire: 'Claire Moreau',
                        propriete: 'Studio - Rue des Lilas',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 550 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 550 },
                            { mois: 'Mar 2024', statut: 'payé', montant: 550 },
                            { mois: 'Avr 2024', statut: 'payé', montant: 550 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 550 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 550 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 550 },
                            { mois: 'Août 2024', statut: 'payé', montant: 550 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 550 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 550 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 550 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 550 }
                        ]
                    }
                ]
            }
        },
        locataire: {
            stats: {
                biensLoues: 2,
                loyerMensuel: 1250,
                moisEnRetard: 1
            },
            activites: [
                {
                    type: 'paiement_effectue',
                    titre: 'Paiement effectué',
                    description: 'Appartement T3 - Rue de la Paix (€600)',
                    temps: 'Il y a 1 jour'
                },
                {
                    type: 'paiement_retard',
                    titre: 'Paiement en retard',
                    description: 'Studio - Avenue Victor Hugo (€650)',
                    temps: 'Il y a 5 jours'
                },
                {
                    type: 'paiement_effectue',
                    titre: 'Paiement effectué',
                    description: 'Appartement T3 - Rue de la Paix (€600)',
                    temps: 'Il y a 1 mois'
                }
            ],
            calendrier: {
                paiements: [
                    {
                        locataire: 'Vous',
                        propriete: 'Appartement T3 - Rue de la Paix',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 600 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 600 },
                            { mois: 'Mar 2024', statut: 'en-retard', montant: 600 },
                            { mois: 'Avr 2024', statut: 'en-retard', montant: 600 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 600 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 600 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 600 },
                            { mois: 'Août 2024', statut: 'payé', montant: 600 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 600 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 600 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 600 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 600 }
                        ]
                    },
                    {
                        locataire: 'Vous',
                        propriete: 'Studio - Avenue Victor Hugo',
                        paiements: [
                            { mois: 'Jan 2024', statut: 'payé', montant: 650 },
                            { mois: 'Fév 2024', statut: 'payé', montant: 650 },
                            { mois: 'Mar 2024', statut: 'payé', montant: 650 },
                            { mois: 'Avr 2024', statut: 'en-retard', montant: 650 },
                            { mois: 'Mai 2024', statut: 'payé', montant: 650 },
                            { mois: 'Juin 2024', statut: 'payé', montant: 650 },
                            { mois: 'Juil 2024', statut: 'payé', montant: 650 },
                            { mois: 'Août 2024', statut: 'payé', montant: 650 },
                            { mois: 'Sep 2024', statut: 'payé', montant: 650 },
                            { mois: 'Oct 2024', statut: 'payé', montant: 650 },
                            { mois: 'Nov 2024', statut: 'payé', montant: 650 },
                            { mois: 'Déc 2024', statut: 'payé', montant: 650 }
                        ]
                    }
                ]
            }
        }
    };
}

// API pour rafraîchir les données du dashboard
router.get('/api/dashboard', (req, res) => {
    const dashboardData = generateDashboardData();
    res.json(dashboardData);
});

module.exports = router; 