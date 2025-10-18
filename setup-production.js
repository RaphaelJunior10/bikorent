#!/usr/bin/env node

/**
 * Script de configuration pour la production
 * Désactive MongoDB et configure Firebase
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration de l\'environnement de production...');

// Vérifier si on est en production
if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ Ce script est destiné à la production. NODE_ENV doit être "production"');
    process.exit(1);
}

// Configuration de base pour la production
const productionConfig = {
    NODE_ENV: 'production',
    USE_FIREBASE: 'true',
    MONGODB_URI: '', // Désactiver MongoDB
    SESSION_SECRET: 'bikorent-production-secret-key-2024',
    PORT: process.env.PORT || '3000',
    HOST: '0.0.0.0'
};

// Vérifier les variables Firebase
const requiredFirebaseVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
];

let missingVars = [];
requiredFirebaseVars.forEach(varName => {
    if (!process.env[varName]) {
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('❌ Variables Firebase manquantes:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
    console.log('\n📖 Consultez env.production.template pour les variables requises');
    process.exit(1);
}

// Afficher la configuration
console.log('✅ Configuration de production détectée:');
console.log(`   - Firebase: ${process.env.USE_FIREBASE === 'true' ? 'Activé' : 'Désactivé'}`);
console.log(`   - MongoDB: ${process.env.MONGODB_URI ? 'Configuré' : 'Désactivé'}`);
console.log(`   - Port: ${process.env.PORT || '3000'}`);
console.log(`   - Host: ${process.env.HOST || '0.0.0.0'}`);

// Vérifier la configuration Firebase
try {
    const { initializeFirebase } = require('./config/firebase-admin');
    initializeFirebase();
    console.log('✅ Firebase Admin SDK initialisé avec succès');
} catch (error) {
    console.log('❌ Erreur lors de l\'initialisation Firebase:', error.message);
    process.exit(1);
}

console.log('🚀 Configuration de production terminée !');
console.log('💡 Les sessions utiliseront le store en mémoire (pas de MongoDB)');
console.log('🔥 Firebase sera utilisé pour la base de données');
