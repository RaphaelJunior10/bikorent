#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Configuration Firebase pour BikoRent');
console.log('=====================================\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
    console.log('✅ Fichier .env trouvé');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Vérifier les variables Firebase
    const requiredVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN', 
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];
    
    console.log('\n📋 Variables Firebase requises:');
    requiredVars.forEach(varName => {
        const hasVar = envContent.includes(varName);
        console.log(`   ${hasVar ? '✅' : '❌'} ${varName}`);
    });
    
    console.log('\n🔧 Pour activer Firebase:');
    console.log('   1. Assurez-vous que toutes les variables sont configurées');
    console.log('   2. Ajoutez USE_FIREBASE=true dans votre fichier .env');
    console.log('   3. Redémarrez l\'application');
    
} else {
    console.log('❌ Fichier .env non trouvé');
    console.log('\n📝 Création d\'un fichier .env exemple...');
    
    const envTemplate = `# Configuration Firebase
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop

# Activer Firebase (true/false)
USE_FIREBASE=false

# Configuration de l'application
PORT=3000
NODE_ENV=development
DEBUG=false
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Fichier .env créé avec les variables d\'exemple');
    console.log('\n📋 Étapes suivantes:');
    console.log('   1. Configurez vos vraies valeurs Firebase dans le fichier .env');
    console.log('   2. Changez USE_FIREBASE=false en USE_FIREBASE=true');
    console.log('   3. Redémarrez l\'application');
}

console.log('\n📚 Documentation:');
console.log('   - FIREBASE_SETUP.md pour la configuration Firebase');
console.log('   - MIGRATION_GUIDE.md pour migrer les données');
