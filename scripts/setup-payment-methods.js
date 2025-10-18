#!/usr/bin/env node

/**
 * Script pour initialiser les types de méthodes de paiement dans la base de données
 */

const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');

// Types de méthodes de paiement disponibles
const PAYMENT_METHOD_TYPES = [
    {
        id: 'airtel_money',
        name: 'Airtel Money',
        description: 'Paiement mobile via Airtel Money',
        icon: 'fas fa-mobile-alt',
        color: '#e60012',
        parameters: [
            {
                name: 'phoneNumber',
                label: 'Numéro de téléphone',
                type: 'tel',
                placeholder: '+237 6XX XXX XXX',
                required: true,
                validation: {
                    pattern: '^\\+237[0-9]{9}$',
                    message: 'Le numéro doit commencer par +237 suivi de 9 chiffres'
                }
            }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'mobicash',
        name: 'Mobicash',
        description: 'Paiement mobile via Mobicash',
        icon: 'fas fa-mobile-alt',
        color: '#00a651',
        parameters: [
            {
                name: 'phoneNumber',
                label: 'Numéro de téléphone',
                type: 'tel',
                placeholder: '+237 6XX XXX XXX',
                required: true,
                validation: {
                    pattern: '^\\+237[0-9]{9}$',
                    message: 'Le numéro doit commencer par +237 suivi de 9 chiffres'
                }
            }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'visa',
        name: 'Visa',
        description: 'Carte bancaire Visa',
        icon: 'fab fa-cc-visa',
        color: '#1a1f71',
        parameters: [
            {
                name: 'cardNumber',
                label: 'Numéro de carte',
                type: 'text',
                placeholder: '1234 5678 9012 3456',
                required: true,
                validation: {
                    pattern: '^[0-9]{4}\\s[0-9]{4}\\s[0-9]{4}\\s[0-9]{4}$',
                    message: 'Le numéro de carte doit contenir 16 chiffres séparés par des espaces'
                }
            },
            {
                name: 'expiryDate',
                label: 'Date d\'expiration',
                type: 'text',
                placeholder: 'MM/AA',
                required: true,
                validation: {
                    pattern: '^(0[1-9]|1[0-2])\\/([0-9]{2})$',
                    message: 'Format: MM/AA (ex: 12/25)'
                }
            },
            {
                name: 'cvv',
                label: 'Code CVV',
                type: 'text',
                placeholder: '123',
                required: true,
                validation: {
                    pattern: '^[0-9]{3,4}$',
                    message: 'Le CVV doit contenir 3 ou 4 chiffres'
                }
            },
            {
                name: 'cardholderName',
                label: 'Nom du titulaire',
                type: 'text',
                placeholder: 'Jean Dupont',
                required: true,
                validation: {
                    minLength: 2,
                    message: 'Le nom doit contenir au moins 2 caractères'
                }
            }
        ],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function setupPaymentMethodTypes() {
    try {
        console.log('💳 Initialisation des types de méthodes de paiement...');
        
        if (!isFirebaseEnabled()) {
            console.log('⚠️ Firebase n\'est pas activé. Les types seront créés en mode test.');
            console.log('📋 Types de méthodes de paiement à créer:');
            PAYMENT_METHOD_TYPES.forEach(type => {
                console.log(`- ${type.name} (${type.id}): ${type.parameters.length} paramètre(s)`);
            });
            return;
        }

        // Vérifier si les types existent déjà
        const existingTypes = await firestoreUtils.getAll('payment_method_types');
        
        if (existingTypes && existingTypes.length > 0) {
            console.log('⚠️ Des types de méthodes de paiement existent déjà dans la base de données.');
            console.log('📋 Types existants:');
            existingTypes.forEach(type => {
                console.log(`- ${type.name} (${type.id})`);
            });
            
            console.log('🔄 Mise à jour des types existants...');
        }

        // Créer ou mettre à jour chaque type
        for (const type of PAYMENT_METHOD_TYPES) {
            try {
                // Vérifier si le type existe déjà
                const existingType = existingTypes?.find(t => t.id === type.id);
                
                if (existingType) {
                    // Mettre à jour le type existant
                    await firestoreUtils.update('payment_method_types', existingType.docId, type);
                    console.log(`✅ Type mis à jour: ${type.name}`);
                } else {
                    // Créer un nouveau type
                    const docId = await firestoreUtils.add('payment_method_types', type);
                    console.log(`✅ Type créé: ${type.name} (ID: ${docId})`);
                }
            } catch (error) {
                console.error(`❌ Erreur lors de la création/mise à jour du type ${type.name}:`, error);
            }
        }

        console.log('🎉 Initialisation des types de méthodes de paiement terminée !');
        
        // Afficher un résumé
        console.log('\n📊 Résumé des types de méthodes de paiement:');
        PAYMENT_METHOD_TYPES.forEach(type => {
            console.log(`\n${type.name}:`);
            console.log(`  - ID: ${type.id}`);
            console.log(`  - Paramètres: ${type.parameters.length}`);
            type.parameters.forEach(param => {
                console.log(`    * ${param.label} (${param.type})`);
            });
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des types de méthodes de paiement:', error);
        throw error;
    }
}

// Exécuter le script
async function main() {
    try {
        await setupPaymentMethodTypes();
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
    setupPaymentMethodTypes,
    PAYMENT_METHOD_TYPES
};
