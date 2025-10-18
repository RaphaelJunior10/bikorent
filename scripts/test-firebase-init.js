/**
 * Script pour tester l'initialisation de Firebase
 */

// Charger les variables d'environnement
require('dotenv').config();

console.log('═══════════════════════════════════════════════════════════');
console.log('🧪 Test d\'initialisation Firebase');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Test 1: Initialiser via firebase.js
console.log('📝 Test 1: Chargement de config/firebase.js...');
try {
    require('../config/firebase');
    console.log('✅ config/firebase.js chargé avec succès');
} catch (error) {
    console.error('❌ Erreur lors du chargement de config/firebase.js:', error.message);
}

console.log('');

// Test 2: Vérifier l'instance via firebase-admin.js
console.log('📝 Test 2: Test de config/firebase-admin.js...');
try {
    const { getFirestore, getAdmin, initializeFirebase } = require('../config/firebase-admin');
    
    console.log('   - Initialisation explicite...');
    const admin = initializeFirebase();
    console.log('   ✅ initializeFirebase() réussi');
    
    console.log('   - Récupération de Firestore...');
    const db = getFirestore();
    console.log('   ✅ getFirestore() réussi');
    
    console.log('   - Récupération de l\'instance Admin...');
    const adminInstance = getAdmin();
    console.log('   ✅ getAdmin() réussi');
    
    console.log('✅ Tous les tests de firebase-admin.js réussis');
} catch (error) {
    console.error('❌ Erreur lors des tests de firebase-admin.js:', error.message);
    console.error('Stack:', error.stack);
}

console.log('');

// Test 3: Vérifier automationService
console.log('📝 Test 3: Test du service d\'automatisation...');
try {
    const automationService = require('../services/automationService');
    console.log('   ✅ automationService chargé avec succès');
    
    // Test d'une fonction simple
    console.log('   - Test de getAllAutomations()...');
    automationService.getAllAutomations()
        .then(automations => {
            console.log('   ✅ getAllAutomations() réussi:', automations.length, 'automatisations');
        })
        .catch(error => {
            console.error('   ❌ Erreur getAllAutomations():', error.message);
        });
} catch (error) {
    console.error('❌ Erreur lors du chargement de automationService:', error.message);
}

console.log('');

// Test 4: Vérifier dataService
console.log('📝 Test 4: Test du service de données...');
try {
    const dataService = require('../services/dataService');
    console.log('   ✅ dataService chargé avec succès');
    
    // Test d'une fonction simple
    console.log('   - Test de getUsers()...');
    dataService.getUsers()
        .then(users => {
            console.log('   ✅ getUsers() réussi:', users.length, 'utilisateurs');
            
            console.log('');
            console.log('═══════════════════════════════════════════════════════════');
            console.log('✅ Tous les tests sont terminés avec succès !');
            console.log('═══════════════════════════════════════════════════════════');
            
            process.exit(0);
        })
        .catch(error => {
            console.error('   ❌ Erreur getUsers():', error.message);
            process.exit(1);
        });
} catch (error) {
    console.error('❌ Erreur lors du chargement de dataService:', error.message);
    process.exit(1);
}

// Attendre 5 secondes maximum pour les tests asynchrones
setTimeout(() => {
    console.log('');
    console.log('⏱️ Timeout: Les tests ont pris trop de temps');
    process.exit(1);
}, 5000);

