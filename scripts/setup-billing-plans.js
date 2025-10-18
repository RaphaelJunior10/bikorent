#!/usr/bin/env node

/**
 * Script pour initialiser les plans de facturation dans la base de données
 */

const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');

// Plans de facturation définis dans le fichier test-rapports-periodes.html
const BILLING_PLANS = [
    {
        id: 'basique',
        name: 'Plan Basique',
        description: 'Parfait pour débuter avec quelques propriétés',
        maxProperties: 5,
        notifications: ['nouveau_paiement'],
        supportPrioritaire: false,
        rapportsAvances: {
            general: false,
            proprietes: false
        },
        integrationsAPI: [],
        doubleSecurite: false,
        pricePerProperty: 500, // XAF par propriété par mois
        currency: 'XAF',
        features: [
            'Jusqu\'à 5 propriétés',
            'Notifications de paiement',
            'Support standard',
            'Rapports de base'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'standard',
        name: 'Plan Standard',
        description: 'Idéal pour gérer plusieurs propriétés efficacement',
        maxProperties: 10,
        notifications: ['nouveau_paiement', 'nouvelle_location', 'retard_paiement'],
        supportPrioritaire: false,
        rapportsAvances: {
            general: true,
            proprietes: false
        },
        integrationsAPI: [],
        doubleSecurite: false,
        pricePerProperty: 1000, // XAF par propriété par mois
        currency: 'XAF',
        features: [
            'Jusqu\'à 10 propriétés',
            'Notifications complètes',
            'Support standard',
            'Rapports généraux avancés'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'premium',
        name: 'Plan Premium',
        description: 'Pour les gestionnaires professionnels',
        maxProperties: 15,
        notifications: ['nouveau_paiement', 'nouvelle_location', 'retard_paiement'],
        supportPrioritaire: true,
        rapportsAvances: {
            general: true,
            proprietes: true
        },
        integrationsAPI: ['whatsapp_business'],
        doubleSecurite: true,
        pricePerProperty: 2500, // XAF par propriété par mois
        currency: 'XAF',
        features: [
            'Jusqu\'à 15 propriétés',
            'Notifications complètes',
            'Support prioritaire',
            'Rapports avancés complets',
            'Intégration WhatsApp Business',
            'Double authentification'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'enterprise',
        name: 'Plan Enterprise',
        description: 'Solution complète pour les grandes entreprises',
        maxProperties: -1, // Illimité
        notifications: ['nouveau_paiement', 'nouvelle_location', 'retard_paiement'],
        supportPrioritaire: true,
        rapportsAvances: {
            general: true,
            proprietes: true
        },
        integrationsAPI: ['whatsapp_business', 'google_calendar', 'quickbooks', 'zapier'],
        doubleSecurite: true,
        pricePerProperty: 5000, // XAF par propriété par mois
        currency: 'XAF',
        features: [
            'Propriétés illimitées',
            'Notifications complètes',
            'Support prioritaire',
            'Rapports avancés complets',
            'Toutes les intégrations API',
            'Double authentification',
            'Fonctionnalités avancées'
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function setupBillingPlans() {
    try {
        console.log('🚀 Initialisation des plans de facturation...');
        
        if (!isFirebaseEnabled()) {
            console.log('⚠️ Firebase n\'est pas activé. Les plans seront créés en mode test.');
            console.log('📋 Plans de facturation à créer:');
            BILLING_PLANS.forEach(plan => {
                console.log(`- ${plan.name} (${plan.id}): ${plan.pricePerProperty} ${plan.currency}/propriété/mois`);
            });
            return;
        }

        // Vérifier si la collection existe déjà
        const existingPlans = await firestoreUtils.getAll('billing_plans');
        
        if (existingPlans && existingPlans.length > 0) {
            console.log('⚠️ Des plans de facturation existent déjà dans la base de données.');
            console.log('📋 Plans existants:');
            existingPlans.forEach(plan => {
                console.log(`- ${plan.name} (${plan.id})`);
            });
            
            // Demander confirmation pour continuer
            console.log('🔄 Mise à jour des plans existants...');
        }

        // Créer ou mettre à jour chaque plan
        for (const plan of BILLING_PLANS) {
            try {
                // Vérifier si le plan existe déjà
                const existingPlan = existingPlans?.find(p => p.id === plan.id);
                
                if (existingPlan) {
                    // Mettre à jour le plan existant
                    await firestoreUtils.update('billing_plans', existingPlan.docId, plan);
                    console.log(`✅ Plan mis à jour: ${plan.name}`);
                } else {
                    // Créer un nouveau plan
                    const docId = await firestoreUtils.add('billing_plans', plan);
                    console.log(`✅ Plan créé: ${plan.name} (ID: ${docId})`);
                }
            } catch (error) {
                console.error(`❌ Erreur lors de la création/mise à jour du plan ${plan.name}:`, error);
            }
        }

        console.log('🎉 Initialisation des plans de facturation terminée !');
        
        // Afficher un résumé
        console.log('\n📊 Résumé des plans de facturation:');
        BILLING_PLANS.forEach(plan => {
            console.log(`\n${plan.name}:`);
            console.log(`  - Prix: ${plan.pricePerProperty} ${plan.currency}/propriété/mois`);
            console.log(`  - Propriétés max: ${plan.maxProperties === -1 ? 'Illimité' : plan.maxProperties}`);
            console.log(`  - Intégrations: ${plan.integrationsAPI.length > 0 ? plan.integrationsAPI.join(', ') : 'Aucune'}`);
            console.log(`  - Support prioritaire: ${plan.supportPrioritaire ? 'Oui' : 'Non'}`);
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des plans de facturation:', error);
        throw error;
    }
}

// Fonction pour attribuer le plan basique par défaut aux utilisateurs existants
async function assignDefaultPlanToUsers() {
    try {
        console.log('\n👥 Attribution du plan basique par défaut aux utilisateurs...');
        
        if (!isFirebaseEnabled()) {
            console.log('⚠️ Firebase n\'est pas activé. Attribution simulée.');
            return;
        }

        const users = await firestoreUtils.getAll(COLLECTIONS.USERS);
        let updatedCount = 0;

        for (const user of users) {
            // Vérifier si l'utilisateur a déjà un plan de facturation
            if (!user.facturation || !user.facturation.planId) {
                const billingData = {
                    planId: 'basique',
                    planName: 'Plan Basique',
                    startDate: new Date(),
                    isActive: true,
                    propertiesCount: 0, // Sera mis à jour dynamiquement
                    monthlyCost: 0, // Sera calculé dynamiquement
                    lastUpdated: new Date()
                };

                await firestoreUtils.update(COLLECTIONS.USERS, user.id, {
                    facturation: billingData,
                    updatedAt: new Date()
                });

                updatedCount++;
                console.log(`✅ Plan basique attribué à l'utilisateur: ${user.profile?.email || user.id}`);
            }
        }

        console.log(`🎉 ${updatedCount} utilisateur(s) mis à jour avec le plan basique par défaut.`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'attribution du plan par défaut:', error);
        throw error;
    }
}

// Exécuter le script
async function main() {
    try {
        await setupBillingPlans();
        await assignDefaultPlanToUsers();
        console.log('\n🎊 Script d\'initialisation terminé avec succès !');
    } catch (error) {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    }
}

// Exécuter si le script est appelé directement
if (require.main === module) {
    main();
}

module.exports = {
    setupBillingPlans,
    assignDefaultPlanToUsers,
    BILLING_PLANS
};
