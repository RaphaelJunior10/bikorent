#!/usr/bin/env node

/**
 * Script pour créer la collection billing_history et ajouter des données d'exemple
 * Crée un historique de facturation pour certains utilisateurs
 */

const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');

async function setupBillingHistory() {
    try {
        console.log('🚀 Initialisation de l\'historique de facturation...');
        
        // Vérifier que Firebase est activé
        if (!isFirebaseEnabled()) {
            console.log('⚠️ Firebase n\'est pas activé, utilisation du mode test');
        } else {
            console.log('✅ Firebase activé');
        }

        // Données d'exemple pour l'historique de facturation
        const billingHistoryData = [
            {
                id: 'BH001',
                userId: 'U7h4HU5OfB9KTeY341NE', // Utilisateur principal
                invoiceNumber: 'INV-2024-001',
                planName: 'Basique',
                planId: 'basique',
                amount: 5000, // 5000 XAF
                currency: 'XAF',
                status: 'paid', // paid, pending, failed, cancelled
                paymentMethod: 'visa',
                paymentMethodDetails: 'Visa se terminant par 4242',
                billingPeriod: {
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-31')
                },
                dueDate: new Date('2024-01-15'),
                paidDate: new Date('2024-01-10'),
                propertiesCount: 2,
                description: 'Facturation mensuelle - Plan Basique',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-10')
            },
            {
                id: 'BH002',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-002',
                planName: 'Basique',
                planId: 'basique',
                amount: 5000,
                currency: 'XAF',
                status: 'paid',
                paymentMethod: 'airtel_money',
                paymentMethodDetails: 'Airtel Money (+237612345678)',
                billingPeriod: {
                    startDate: new Date('2024-02-01'),
                    endDate: new Date('2024-02-29')
                },
                dueDate: new Date('2024-02-15'),
                paidDate: new Date('2024-02-12'),
                propertiesCount: 2,
                description: 'Facturation mensuelle - Plan Basique',
                createdAt: new Date('2024-02-01'),
                updatedAt: new Date('2024-02-12')
            },
            {
                id: 'BH003',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-003',
                planName: 'Standard',
                planId: 'standard',
                amount: 15000,
                currency: 'XAF',
                status: 'paid',
                paymentMethod: 'visa',
                paymentMethodDetails: 'Visa se terminant par 4242',
                billingPeriod: {
                    startDate: new Date('2024-03-01'),
                    endDate: new Date('2024-03-31')
                },
                dueDate: new Date('2024-03-15'),
                paidDate: new Date('2024-03-08'),
                propertiesCount: 5,
                description: 'Facturation mensuelle - Plan Standard',
                createdAt: new Date('2024-03-01'),
                updatedAt: new Date('2024-03-08')
            },
            {
                id: 'BH004',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-004',
                planName: 'Standard',
                planId: 'standard',
                amount: 15000,
                currency: 'XAF',
                status: 'pending',
                paymentMethod: 'mobicash',
                paymentMethodDetails: 'Mobicash (+237698765432)',
                billingPeriod: {
                    startDate: new Date('2024-04-01'),
                    endDate: new Date('2024-04-30')
                },
                dueDate: new Date('2024-04-15'),
                paidDate: null,
                propertiesCount: 5,
                description: 'Facturation mensuelle - Plan Standard',
                createdAt: new Date('2024-04-01'),
                updatedAt: new Date('2024-04-01')
            },
            {
                id: 'BH005',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-005',
                planName: 'Premium',
                planId: 'premium',
                amount: 30000,
                currency: 'XAF',
                status: 'paid',
                paymentMethod: 'visa',
                paymentMethodDetails: 'Visa se terminant par 4242',
                billingPeriod: {
                    startDate: new Date('2024-05-01'),
                    endDate: new Date('2024-05-31')
                },
                dueDate: new Date('2024-05-15'),
                paidDate: new Date('2024-05-05'),
                propertiesCount: 10,
                description: 'Facturation mensuelle - Plan Premium',
                createdAt: new Date('2024-05-01'),
                updatedAt: new Date('2024-05-05')
            },
            {
                id: 'BH006',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-006',
                planName: 'Premium',
                planId: 'premium',
                amount: 30000,
                currency: 'XAF',
                status: 'failed',
                paymentMethod: 'airtel_money',
                paymentMethodDetails: 'Airtel Money (+237612345678)',
                billingPeriod: {
                    startDate: new Date('2024-06-01'),
                    endDate: new Date('2024-06-30')
                },
                dueDate: new Date('2024-06-15'),
                paidDate: null,
                propertiesCount: 10,
                description: 'Facturation mensuelle - Plan Premium',
                createdAt: new Date('2024-06-01'),
                updatedAt: new Date('2024-06-16')
            },
            {
                id: 'BH007',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-007',
                planName: 'Premium',
                planId: 'premium',
                amount: 30000,
                currency: 'XAF',
                status: 'paid',
                paymentMethod: 'visa',
                paymentMethodDetails: 'Visa se terminant par 4242',
                billingPeriod: {
                    startDate: new Date('2024-07-01'),
                    endDate: new Date('2024-07-31')
                },
                dueDate: new Date('2024-07-15'),
                paidDate: new Date('2024-07-10'),
                propertiesCount: 10,
                description: 'Facturation mensuelle - Plan Premium',
                createdAt: new Date('2024-07-01'),
                updatedAt: new Date('2024-07-10')
            },
            {
                id: 'BH008',
                userId: 'U7h4HU5OfB9KTeY341NE',
                invoiceNumber: 'INV-2024-008',
                planName: 'Premium',
                planId: 'premium',
                amount: 30000,
                currency: 'XAF',
                status: 'paid',
                paymentMethod: 'mobicash',
                paymentMethodDetails: 'Mobicash (+237698765432)',
                billingPeriod: {
                    startDate: new Date('2024-08-01'),
                    endDate: new Date('2024-08-31')
                },
                dueDate: new Date('2024-08-15'),
                paidDate: new Date('2024-08-12'),
                propertiesCount: 10,
                description: 'Facturation mensuelle - Plan Premium',
                createdAt: new Date('2024-08-01'),
                updatedAt: new Date('2024-08-12')
            }
        ];

        // Ajouter les données d'historique de facturation
        console.log('📊 Ajout des données d\'historique de facturation...');
        
        for (const historyItem of billingHistoryData) {
            try {
                await firestoreUtils.add('billing_history', historyItem);
                console.log(`✅ Historique ajouté: ${historyItem.invoiceNumber} - ${historyItem.planName} - ${historyItem.status}`);
            } catch (error) {
                console.error(`❌ Erreur lors de l'ajout de ${historyItem.invoiceNumber}:`, error.message);
            }
        }

        console.log('🎉 Historique de facturation initialisé avec succès !');
        console.log(`📈 ${billingHistoryData.length} entrées d'historique ajoutées`);

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'historique de facturation:', error);
        process.exit(1);
    }
}

// Exécuter le script
if (require.main === module) {
    setupBillingHistory()
        .then(() => {
            console.log('✅ Script terminé avec succès');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { setupBillingHistory };
