#!/usr/bin/env node

/**
 * Script de test pour les intégrations
 * Teste les routes d'intégration dans la page paramètres
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testIntegrations() {
    console.log('🧪 Test des routes d\'intégration...\n');

    try {
        // Test 1: Récupérer l'état des intégrations
        console.log('1️⃣ Test de récupération de l\'état des intégrations...');
        const getResponse = await fetch(`${BASE_URL}/parametres/integrations`);
        const getData = await getResponse.json();
        
        if (getData.success) {
            console.log('✅ Récupération réussie:', getData.data);
        } else {
            console.log('❌ Échec de la récupération:', getData.message);
        }

        // Test 2: Connecter une intégration
        console.log('\n2️⃣ Test de connexion d\'une intégration (Google Calendar)...');
        const connectResponse = await fetch(`${BASE_URL}/parametres/integrations/google-calendar/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'connect' })
        });
        const connectData = await connectResponse.json();
        
        if (connectData.success) {
            console.log('✅ Connexion réussie:', connectData.data);
        } else {
            console.log('❌ Échec de la connexion:', connectData.message);
        }

        // Test 3: Déconnecter une intégration
        console.log('\n3️⃣ Test de déconnexion d\'une intégration (Google Calendar)...');
        const disconnectResponse = await fetch(`${BASE_URL}/parametres/integrations/google-calendar/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'disconnect' })
        });
        const disconnectData = await disconnectResponse.json();
        
        if (disconnectData.success) {
            console.log('✅ Déconnexion réussie:', disconnectData.data);
        } else {
            console.log('❌ Échec de la déconnexion:', disconnectData.message);
        }

        // Test 4: Vérifier l'état final
        console.log('\n4️⃣ Vérification de l\'état final...');
        const finalResponse = await fetch(`${BASE_URL}/parametres/integrations`);
        const finalData = await finalResponse.json();
        
        if (finalData.success) {
            console.log('✅ État final:', finalData.data);
        } else {
            console.log('❌ Échec de la vérification finale:', finalData.message);
        }

        // Test 5: Test avec une action invalide
        console.log('\n5️⃣ Test avec une action invalide...');
        const invalidResponse = await fetch(`${BASE_URL}/parametres/integrations/whatsapp/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'invalid-action' })
        });
        const invalidData = await invalidResponse.json();
        
        if (!invalidData.success) {
            console.log('✅ Validation correcte - action invalide rejetée:', invalidData.message);
        } else {
            console.log('❌ Problème de validation - action invalide acceptée');
        }

        console.log('\n🎉 Tests terminés !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur est démarré sur le port 3000');
    }
}

// Exécuter les tests
if (require.main === module) {
    testIntegrations();
}

module.exports = { testIntegrations };
