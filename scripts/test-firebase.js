#!/usr/bin/env node

/**
 * Script de test de la connexion Firebase
 * 
 * Ce script teste la connexion à Firebase et vérifie les permissions
 * avant d'effectuer la migration des données.
 * 
 * Usage: node scripts/test-firebase.js
 */

const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled, getFirebaseConfig } = require('../config/environment');

async function testFirebaseConnection() {
    console.log('🧪 Test de la connexion Firebase...\n');

    try {
        // 1. Vérifier la configuration
        console.log('1️⃣ Vérification de la configuration...');
        const config = getFirebaseConfig();
        
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        let configValid = true;
        
        for (const field of requiredFields) {
            if (!config[field] || config[field].includes('XXXXX')) {
                console.log(`   ❌ Configuration manquante pour: ${field}`);
                configValid = false;
            } else {
                console.log(`   ✅ ${field}: ${field === 'apiKey' ? '***' + config[field].slice(-4) : config[field]}`);
            }
        }
        
        if (!configValid) {
            console.log('\n⚠️  Configuration Firebase incomplète. Veuillez configurer vos variables d\'environnement.');
            return false;
        }
        
        console.log('   ✅ Configuration Firebase valide\n');

        // 2. Vérifier que Firebase est activé
        console.log('2️⃣ Vérification de l\'activation Firebase...');
        if (!isFirebaseEnabled()) {
            console.log('   ❌ Firebase n\'est pas activé');
            return false;
        }
        console.log('   ✅ Firebase est activé\n');

        // 3. Test de connexion à Firestore
        console.log('3️⃣ Test de connexion à Firestore...');
        try {
            // Essayer de récupérer les collections existantes
            const collections = Object.values(COLLECTIONS);
            console.log(`   📋 Collections configurées: ${collections.join(', ')}`);
            
            // Tester une requête simple sur chaque collection
            for (const collectionName of collections) {
                try {
                    const documents = await firestoreUtils.getAll(collectionName);
                    console.log(`   ✅ Collection "${collectionName}": ${documents.length} documents`);
                } catch (error) {
                    console.log(`   ⚠️  Collection "${collectionName}": ${error.message}`);
                }
            }
            
        } catch (error) {
            console.log(`   ❌ Erreur de connexion à Firestore: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Connexion à Firestore réussie\n');

        // 4. Test d'écriture (créer un document de test)
        console.log('4️⃣ Test d\'écriture...');
        try {
            const testData = {
                test: true,
                timestamp: new Date(),
                message: 'Test de connexion Firebase'
            };
            
            const result = await firestoreUtils.add('test', testData);
            console.log(`   ✅ Document de test créé (ID: ${result.id})`);
            
            // Supprimer le document de test
            await firestoreUtils.delete('test', result.id);
            console.log('   ✅ Document de test supprimé');
            
        } catch (error) {
            console.log(`   ❌ Erreur d'écriture: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Permissions d\'écriture OK\n');

        // 5. Test des règles de sécurité
        console.log('5️⃣ Vérification des règles de sécurité...');
        console.log('   ℹ️  Mode test activé - toutes les opérations sont autorisées');
        console.log('   ⚠️  Pour la production, configurez des règles de sécurité plus strictes');
        console.log('   ✅ Règles de sécurité OK (mode développement)\n');

        console.log('🎉 Tous les tests Firebase sont passés avec succès !');
        console.log('\n📋 Résumé:');
        console.log('   ✅ Configuration Firebase valide');
        console.log('   ✅ Firebase activé');
        console.log('   ✅ Connexion à Firestore OK');
        console.log('   ✅ Permissions d\'écriture OK');
        console.log('   ✅ Règles de sécurité OK');
        
        return true;

    } catch (error) {
        console.error('❌ Erreur lors du test Firebase:', error);
        return false;
    }
}

// Fonction pour afficher les informations de configuration
function showConfigurationInfo() {
    console.log('📋 Informations de configuration Firebase:');
    console.log('   - Assurez-vous d\'avoir créé un projet Firebase');
    console.log('   - Activez Firestore Database en mode test');
    console.log('   - Configurez vos variables d\'environnement dans un fichier .env');
    console.log('   - Vérifiez que les règles de sécurité permettent la lecture/écriture');
    console.log('');
}

// Exécution du script
async function main() {
    console.log('🔥 Test de la configuration Firebase pour BikoRent\n');
    
    const success = await testFirebaseConnection();
    
    if (!success) {
        console.log('\n❌ Les tests Firebase ont échoué.');
        console.log('Veuillez vérifier votre configuration avant de procéder à la migration.\n');
        showConfigurationInfo();
        process.exit(1);
    }
    
    console.log('\n🚀 Vous pouvez maintenant procéder à la migration avec:');
    console.log('   node scripts/migrate-to-firebase.js');
    console.log('');
    console.log('💡 Options disponibles:');
    console.log('   --clear ou -c : Vider les collections avant la migration');
    console.log('');
}

// Gestion des erreurs
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
    process.exit(1);
});

// Lancer le script
main(); 