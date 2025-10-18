#!/usr/bin/env node

/**
 * Script de test pour les routes de méthodes de paiement
 * Teste les routes de gestion des méthodes de paiement
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testPaymentMethodsRoutes() {
    console.log('🧪 Test des routes de méthodes de paiement...\n');

    try {
        // Test 1: Récupérer les types de méthodes de paiement
        console.log('1️⃣ Test de récupération des types de méthodes de paiement...');
        const typesResponse = await fetch(`${BASE_URL}/parametres/payment-methods/types`);
        const typesData = await typesResponse.json();
        
        if (typesData.success) {
            console.log('✅ Types de méthodes de paiement récupérés avec succès:');
            typesData.data.types.forEach(type => {
                console.log(`   - ${type.name} (${type.id}): ${type.parameters.length} paramètre(s)`);
            });
        } else {
            console.log('❌ Échec de la récupération des types:', typesData.message);
        }

        // Test 2: Récupérer les méthodes de paiement de l'utilisateur
        console.log('\n2️⃣ Test de récupération des méthodes de paiement de l\'utilisateur...');
        const methodsResponse = await fetch(`${BASE_URL}/parametres/payment-methods`);
        const methodsData = await methodsResponse.json();
        
        if (methodsData.success) {
            console.log('✅ Méthodes de paiement récupérées:');
            console.log(`   - Nombre de méthodes: ${methodsData.data.paymentMethods.length}`);
            methodsData.data.paymentMethods.forEach(method => {
                console.log(`   - ${method.typeName} (${method.type}) - ${method.isDefault ? 'Par défaut' : 'Secondaire'}`);
            });
        } else {
            console.log('❌ Échec de la récupération des méthodes:', methodsData.message);
        }

        // Test 3: Ajouter une méthode Airtel Money
        console.log('\n3️⃣ Test d\'ajout d\'une méthode Airtel Money...');
        const addAirtelResponse = await fetch(`${BASE_URL}/parametres/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'airtel_money',
                parameters: {
                    phoneNumber: '+237612345678'
                },
                isDefault: false
            })
        });
        const addAirtelData = await addAirtelResponse.json();
        
        if (addAirtelData.success) {
            console.log('✅ Méthode Airtel Money ajoutée avec succès');
        } else {
            console.log('❌ Échec de l\'ajout d\'Airtel Money:', addAirtelData.message);
            if (addAirtelData.errors) {
                console.log('   Erreurs:', addAirtelData.errors.join(', '));
            }
        }

        // Test 4: Ajouter une méthode Visa
        console.log('\n4️⃣ Test d\'ajout d\'une méthode Visa...');
        const addVisaResponse = await fetch(`${BASE_URL}/parametres/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'visa',
                parameters: {
                    cardNumber: '4242 4242 4242 4242',
                    expiryDate: '12/25',
                    cvv: '123',
                    cardholderName: 'Jean Dupont'
                },
                isDefault: true
            })
        });
        const addVisaData = await addVisaResponse.json();
        
        if (addVisaData.success) {
            console.log('✅ Méthode Visa ajoutée avec succès');
        } else {
            console.log('❌ Échec de l\'ajout de Visa:', addVisaData.message);
            if (addVisaData.errors) {
                console.log('   Erreurs:', addVisaData.errors.join(', '));
            }
        }

        // Test 5: Ajouter une méthode Mobicash
        console.log('\n5️⃣ Test d\'ajout d\'une méthode Mobicash...');
        const addMobicashResponse = await fetch(`${BASE_URL}/parametres/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'mobicash',
                parameters: {
                    phoneNumber: '+237698765432'
                },
                isDefault: false
            })
        });
        const addMobicashData = await addMobicashResponse.json();
        
        if (addMobicashData.success) {
            console.log('✅ Méthode Mobicash ajoutée avec succès');
        } else {
            console.log('❌ Échec de l\'ajout de Mobicash:', addMobicashData.message);
            if (addMobicashData.errors) {
                console.log('   Erreurs:', addMobicashData.errors.join(', '));
            }
        }

        // Test 6: Test avec des paramètres invalides
        console.log('\n6️⃣ Test avec des paramètres invalides...');
        const invalidResponse = await fetch(`${BASE_URL}/parametres/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'visa',
                parameters: {
                    cardNumber: '1234', // Numéro invalide
                    expiryDate: '13/25', // Date invalide
                    cvv: '12', // CVV trop court
                    cardholderName: 'A' // Nom trop court
                },
                isDefault: false
            })
        });
        const invalidData = await invalidResponse.json();
        
        if (!invalidData.success) {
            console.log('✅ Validation correcte - paramètres invalides rejetés:', invalidData.message);
            if (invalidData.errors) {
                console.log('   Erreurs détaillées:', invalidData.errors.join(', '));
            }
        } else {
            console.log('❌ Problème de validation - paramètres invalides acceptés');
        }

        // Test 7: Test avec un type inexistant
        console.log('\n7️⃣ Test avec un type de méthode inexistant...');
        const invalidTypeResponse = await fetch(`${BASE_URL}/parametres/payment-methods`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'type_inexistant',
                parameters: {
                    test: 'valeur'
                },
                isDefault: false
            })
        });
        const invalidTypeData = await invalidTypeResponse.json();
        
        if (!invalidTypeData.success) {
            console.log('✅ Validation correcte - type inexistant rejeté:', invalidTypeData.message);
        } else {
            console.log('❌ Problème de validation - type inexistant accepté');
        }

        // Test 8: Vérification finale des méthodes
        console.log('\n8️⃣ Vérification finale des méthodes de paiement...');
        const finalMethodsResponse = await fetch(`${BASE_URL}/parametres/payment-methods`);
        const finalMethodsData = await finalMethodsResponse.json();
        
        if (finalMethodsData.success) {
            console.log('✅ Méthodes finales:');
            console.log(`   - Nombre total: ${finalMethodsData.data.paymentMethods.length}`);
            finalMethodsData.data.paymentMethods.forEach(method => {
                console.log(`   - ${method.typeName} (${method.type}) - ${method.isDefault ? 'Par défaut' : 'Secondaire'}`);
                if (method.maskedData) {
                    console.log(`     Données masquées:`, method.maskedData);
                }
            });
        } else {
            console.log('❌ Échec de la vérification finale:', finalMethodsData.message);
        }

        console.log('\n🎉 Tests de méthodes de paiement terminés !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur est démarré sur le port 3000');
    }
}

// Exécuter les tests
if (require.main === module) {
    testPaymentMethodsRoutes();
}

module.exports = { testPaymentMethodsRoutes };
