const fs = require('fs');
const path = require('path');
const { environment, validateConfig, getFirebaseConfig, isFirebaseEnabled } = require('../config/environment');

console.log('🔍 DIAGNOSTIC FIREBASE');
console.log('======================\n');

// 1. Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

console.log('1. FICHIER .ENV:');
if (envExists) {
    console.log('✅ Fichier .env trouvé');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    console.log(`   ${lines.length} variables d'environnement configurées`);
    
    // Vérifier les variables Firebase
    const firebaseVars = ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID'];
    const missingVars = [];
    
    firebaseVars.forEach(varName => {
        if (!envContent.includes(varName + '=')) {
            missingVars.push(varName);
        }
    });
    
    if (missingVars.length > 0) {
        console.log('❌ Variables Firebase manquantes:', missingVars.join(', '));
    } else {
        console.log('✅ Toutes les variables Firebase sont présentes');
    }
} else {
    console.log('❌ FICHIER .ENV MANQUANT !');
    console.log('   C\'est la cause principale du problème.');
}

console.log('\n2. CONFIGURATION ACTUELLE:');
console.log('   Firebase activé:', isFirebaseEnabled());
console.log('   Mode debug:', environment.app.debug);

console.log('\n3. CONFIGURATION FIREBASE:');
const config = getFirebaseConfig();
Object.entries(config).forEach(([key, value]) => {
    const status = value && !value.includes('XXXXX') ? '✅' : '❌';
    console.log(`   ${status} ${key}: ${value}`);
});

console.log('\n4. DIAGNOSTIC DU PROBLÈME:');
if (!envExists) {
    console.log('❌ PROBLÈME PRINCIPAL: Fichier .env manquant');
    console.log('   Solution: Créer un fichier .env avec vos vraies valeurs Firebase');
} else if (Object.values(config).some(value => value.includes('XXXXX'))) {
    console.log('❌ PROBLÈME: Configuration Firebase utilise des valeurs par défaut invalides');
    console.log('   Solution: Vérifier que toutes les variables Firebase sont définies dans .env');
} else {
    console.log('✅ Configuration Firebase semble correcte');
    console.log('   Le problème pourrait être:');
    console.log('   - Problème de réseau (ECONNRESET)');
    console.log('   - Règles de sécurité Firebase trop restrictives');
    console.log('   - Aucune donnée dans Firebase pour l\'ownerId: U7h4HU5OfB9KTeY341NE');
}

console.log('\n5. SOLUTIONS RECOMMANDÉES:');
console.log('   a) Créer un fichier .env à la racine du projet avec:');
console.log('      FIREBASE_API_KEY=votre_clé_api');
console.log('      FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com');
console.log('      FIREBASE_PROJECT_ID=votre_projet_id');
console.log('      FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com');
console.log('      FIREBASE_MESSAGING_SENDER_ID=votre_sender_id');
console.log('      FIREBASE_APP_ID=votre_app_id');
console.log('      USE_FIREBASE=true');
console.log('');
console.log('   b) Vérifier vos règles de sécurité Firebase dans la console Firebase');
console.log('   c) Vérifier qu\'il y a des données dans Firebase pour l\'ownerId: U7h4HU5OfB9KTeY341NE');
console.log('   d) Redémarrer le serveur après avoir créé le fichier .env');

console.log('\n6. POUR TESTER SANS FIREBASE:');
console.log('   Modifier .env: USE_FIREBASE=false');
console.log('   Cela utilisera les données de fallback locales');

console.log('\n🔍 Diagnostic terminé');
