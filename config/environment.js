// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config();

// Configuration d'environnement
const environment = {
    // Configuration Firebase
    firebase: {
        apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || "bikorent-xxxxx.firebaseapp.com",
        projectId: process.env.FIREBASE_PROJECT_ID || "bikorent-xxxxx",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "bikorent-xxxxx.appspot.com",
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789012",
        appId: process.env.FIREBASE_APP_ID || "1:123456789012:web:abcdefghijklmnop"
    },

    // Configuration de l'application
    app: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development',
        useFirebase: process.env.USE_FIREBASE === 'true' || true, // Activé par défaut pour les tests
        debug: process.env.DEBUG === 'true'
    },

    // Configuration de la base de données
    database: {
        // Si vous voulez utiliser une base de données locale en plus de Firebase
        local: {
            enabled: process.env.LOCAL_DB_ENABLED === 'true',
            path: process.env.LOCAL_DB_PATH || './data/local.db'
        }
    }
};

// Fonction pour valider la configuration
function validateConfig() {
    const requiredFirebaseFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    
    for (const field of requiredFirebaseFields) {
        if (!environment.firebase[field] || environment.firebase[field].includes('XXXXX')) {
            console.warn(`⚠️  Configuration Firebase manquante ou par défaut pour: ${field}`);
            console.warn('   Veuillez configurer vos variables d\'environnement Firebase');
        }
    }

    if (environment.app.debug) {
        console.log('🔧 Configuration de l\'environnement:', JSON.stringify(environment, null, 2));
    }
}

// Fonction pour obtenir la configuration Firebase
function getFirebaseConfig() {
    return environment.firebase;
}

// Fonction pour vérifier si Firebase est activé
function isFirebaseEnabled() {
    return environment.app.useFirebase;
}

// Fonction pour basculer Firebase on/off
function setFirebaseEnabled(enabled) {
    environment.app.useFirebase = enabled;
    console.log(`🔥 Firebase ${enabled ? 'activé' : 'désactivé'}`);
}

module.exports = {
    environment,
    validateConfig,
    getFirebaseConfig,
    isFirebaseEnabled,
    setFirebaseEnabled
}; 