#!/usr/bin/env node

/**
 * Script de diagnostic des variables d'environnement
 * 
 * Ce script vérifie que les variables d'environnement Firebase
 * sont bien chargées depuis le fichier .env
 * 
 * Usage: node scripts/check-env.js
 */

// Charger dotenv en premier
require('dotenv').config();

console.log('🔍 Diagnostic des variables d\'environnement Firebase...\n');

// Variables Firebase requises
const requiredVars = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN', 
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
];

// Variables optionnelles
const optionalVars = [
    'USE_FIREBASE',
    'DEBUG',
    'PORT',
    'NODE_ENV'
];

console.log('📋 Variables Firebase requises:');
let allRequiredPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value && !value.includes('XXXXX')) {
        // Masquer la clé API pour la sécurité
        const displayValue = varName === 'FIREBASE_API_KEY' 
            ? '***' + value.slice(-4) 
            : value;
        console.log(`   ✅ ${varName}: ${displayValue}`);
    } else {
        console.log(`   ❌ ${varName}: ${value || 'NON DÉFINIE'}`);
        allRequiredPresent = false;
    }
});

console.log('\n📋 Variables optionnelles:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`   ✅ ${varName}: ${value}`);
    } else {
        console.log(`   ⚠️  ${varName}: ${value || 'NON DÉFINIE'}`);
    }
});

console.log('\n📁 Informations sur le fichier .env:');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
    const stats = fs.statSync(envPath);
    console.log(`   ✅ Fichier .env trouvé`);
    console.log(`   📏 Taille: ${stats.size} octets`);
    console.log(`   📅 Modifié: ${stats.mtime.toLocaleString()}`);
    
    // Lire le contenu du fichier .env (sans afficher les valeurs sensibles)
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`   📝 Lignes de configuration: ${lines.length}`);
    
    // Vérifier les variables Firebase dans le fichier
    console.log('\n🔍 Variables Firebase dans le fichier .env:');
    requiredVars.forEach(varName => {
        const line = lines.find(l => l.startsWith(varName + '='));
        if (line) {
            const hasValue = line.split('=')[1] && line.split('=')[1].trim();
            if (hasValue) {
                console.log(`   ✅ ${varName}: définie`);
            } else {
                console.log(`   ❌ ${varName}: définie mais vide`);
            }
        } else {
            console.log(`   ❌ ${varName}: non trouvée`);
        }
    });
    
} else {
    console.log(`   ❌ Fichier .env non trouvé à: ${envPath}`);
    console.log('   💡 Créez un fichier .env à la racine du projet');
}

console.log('\n🔧 Test de chargement des variables:');
console.log(`   process.env.FIREBASE_API_KEY: ${process.env.FIREBASE_API_KEY ? '✅ Chargée' : '❌ Non chargée'}`);
console.log(`   process.env.FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ Chargée' : '❌ Non chargée'}`);

console.log('\n📋 Résumé:');
if (allRequiredPresent) {
    console.log('   ✅ Toutes les variables Firebase requises sont présentes');
    console.log('   🚀 Vous pouvez maintenant tester la connexion Firebase');
} else {
    console.log('   ❌ Certaines variables Firebase sont manquantes');
    console.log('   📝 Vérifiez votre fichier .env');
}

console.log('\n💡 Conseils de dépannage:');
console.log('   1. Vérifiez que le fichier .env est à la racine du projet');
console.log('   2. Assurez-vous qu\'il n\'y a pas d\'espaces autour des signes =');
console.log('   3. Vérifiez qu\'il n\'y a pas de guillemets autour des valeurs');
console.log('   4. Redémarrez votre terminal après modification du fichier .env');
console.log('   5. Vérifiez que le fichier .env n\'est pas dans .gitignore');

console.log('\n📝 Exemple de fichier .env correct:');
console.log(`
# Configuration Firebase
FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=votre-project.firebaseapp.com
FIREBASE_PROJECT_ID=votre-project
FIREBASE_STORAGE_BUCKET=votre-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop

# Configuration de l'application
USE_FIREBASE=true
DEBUG=false
PORT=3000
`);
