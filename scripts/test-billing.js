#!/usr/bin/env node

/**
 * Script de test pour les routes de facturation
 * Teste les routes de gestion des plans de facturation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBillingRoutes() {
    console.log('🧪 Test des routes de facturation...\n');

    try {
        // Test 1: Récupérer tous les plans de facturation
        console.log('1️⃣ Test de récupération des plans de facturation...');
        const plansResponse = await fetch(`${BASE_URL}/parametres/billing/plans`);
        const plansData = await plansResponse.json();
        
        if (plansData.success) {
            console.log('✅ Plans de facturation récupérés avec succès:');
            plansData.data.plans.forEach(plan => {
                console.log(`   - ${plan.name} (${plan.id}): ${plan.pricePerProperty} ${plan.currency}/propriété/mois`);
            });
        } else {
            console.log('❌ Échec de la récupération des plans:', plansData.message);
        }

        // Test 2: Récupérer les détails de facturation de l'utilisateur
        console.log('\n2️⃣ Test de récupération des détails de facturation...');
        const detailsResponse = await fetch(`${BASE_URL}/parametres/billing/details`);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.success) {
            console.log('✅ Détails de facturation récupérés:');
            console.log(`   - Plan actuel: ${detailsData.data.currentPlan?.name || 'N/A'}`);
            console.log(`   - Coût mensuel: ${detailsData.data.userBilling?.monthlyCost || 0} XAF`);
            console.log(`   - Nombre de propriétés: ${detailsData.data.propertiesCount || 0}`);
        } else {
            console.log('❌ Échec de la récupération des détails:', detailsData.message);
        }

        // Test 3: Changer vers le plan Standard
        console.log('\n3️⃣ Test de changement vers le plan Standard...');
        const changeResponse = await fetch(`${BASE_URL}/parametres/billing/change-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: 'standard' })
        });
        const changeData = await changeResponse.json();
        
        if (changeData.success) {
            console.log('✅ Changement de plan réussi:', changeData.data.plan.name);
        } else {
            console.log('❌ Échec du changement de plan:', changeData.message);
        }

        // Test 4: Changer vers le plan Premium
        console.log('\n4️⃣ Test de changement vers le plan Premium...');
        const changePremiumResponse = await fetch(`${BASE_URL}/parametres/billing/change-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: 'premium' })
        });
        const changePremiumData = await changePremiumResponse.json();
        
        if (changePremiumData.success) {
            console.log('✅ Changement vers Premium réussi:', changePremiumData.data.plan.name);
        } else {
            console.log('❌ Échec du changement vers Premium:', changePremiumData.message);
        }

        // Test 5: Revenir au plan Basique
        console.log('\n5️⃣ Test de retour au plan Basique...');
        const changeBasicResponse = await fetch(`${BASE_URL}/parametres/billing/change-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: 'basique' })
        });
        const changeBasicData = await changeBasicResponse.json();
        
        if (changeBasicData.success) {
            console.log('✅ Retour au plan Basique réussi:', changeBasicData.data.plan.name);
        } else {
            console.log('❌ Échec du retour au plan Basique:', changeBasicData.message);
        }

        // Test 6: Test avec un plan inexistant
        console.log('\n6️⃣ Test avec un plan inexistant...');
        const invalidResponse = await fetch(`${BASE_URL}/parametres/billing/change-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ planId: 'plan-inexistant' })
        });
        const invalidData = await invalidResponse.json();
        
        if (!invalidData.success) {
            console.log('✅ Validation correcte - plan inexistant rejeté:', invalidData.message);
        } else {
            console.log('❌ Problème de validation - plan inexistant accepté');
        }

        // Test 7: Vérification finale des détails
        console.log('\n7️⃣ Vérification finale des détails de facturation...');
        const finalDetailsResponse = await fetch(`${BASE_URL}/parametres/billing/details`);
        const finalDetailsData = await finalDetailsResponse.json();
        
        if (finalDetailsData.success) {
            console.log('✅ Détails finaux:');
            console.log(`   - Plan actuel: ${finalDetailsData.data.currentPlan?.name || 'N/A'}`);
            console.log(`   - Coût mensuel: ${finalDetailsData.data.userBilling?.monthlyCost || 0} XAF`);
            console.log(`   - Nombre de propriétés: ${finalDetailsData.data.propertiesCount || 0}`);
        } else {
            console.log('❌ Échec de la vérification finale:', finalDetailsData.message);
        }

        console.log('\n🎉 Tests de facturation terminés !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur est démarré sur le port 3000');
    }
}

// Exécuter les tests
if (require.main === module) {
    testBillingRoutes();
}

module.exports = { testBillingRoutes };
