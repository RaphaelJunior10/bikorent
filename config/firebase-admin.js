const admin = require('firebase-admin');

// Variable pour stocker l'instance Firestore
let firestoreInstance = null;
let adminInstance = null;

/**
 * Initialise Firebase Admin SDK si pas déjà fait
 * @returns {admin} Instance Firebase Admin
 */
function initializeFirebase() {
    try {
        // Vérifier si l'app 'admin' existe déjà (créée par firebase.js)
        if (!adminInstance) {
            try {
                adminInstance = admin.app('admin');
                console.log('✅ Utilisation de l\'instance Firebase Admin existante (admin)');
            } catch (e) {
                // L'app 'admin' n'existe pas, essayer l'app par défaut
                if (admin.apps.length > 0) {
                    adminInstance = admin.app();
                    console.log('✅ Utilisation de l\'instance Firebase Admin par défaut');
                } else {
                    // Aucune app n'existe, en créer une nouvelle
                    const serviceAccount = require('./keys/firebase-service-account.json');
                    adminInstance = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    console.log('✅ Firebase Admin SDK initialisé (nouvelle instance)');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Firebase:', error.message);
        throw error;
    }
    return adminInstance;
}

/**
 * Retourne l'instance Firestore (paresse)
 * @returns {admin.firestore.Firestore} Instance Firestore
 */
function getFirestore() {
    try {
        if (!firestoreInstance) {
            const firebaseAdmin = initializeFirebase();
            firestoreInstance = firebaseAdmin.firestore();
            console.log('✅ Instance Firestore créée avec succès');
        }
        return firestoreInstance;
    } catch (error) {
        console.error('❌ Erreur lors de l\'accès à Firestore:', error.message);
        console.error('Stack:', error.stack);
        // Réinitialiser les instances et réessayer une fois
        firestoreInstance = null;
        adminInstance = null;
        const firebaseAdmin = initializeFirebase();
        firestoreInstance = firebaseAdmin.firestore();
        return firestoreInstance;
    }
}

/**
 * Retourne l'instance Firebase Admin
 * @returns {admin} Instance Firebase Admin
 */
function getAdmin() {
    if (!adminInstance) {
        initializeFirebase();
    }
    return adminInstance;
}

module.exports = {
    getFirestore,
    getAdmin,
    initializeFirebase
};
