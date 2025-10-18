const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');
const { getFirebaseConfig, validateConfig, isFirebaseEnabled } = require('./environment');

// Admin SDK pour le serveur
const admin = require('firebase-admin');

// Valider la configuration
validateConfig();

let app = null;
let db = null;
let storage = null;
let adminApp = null;
let adminStorage = null;

// Initialiser Firebase seulement si activé
if (isFirebaseEnabled()) {
    try {
        // Configuration Firebase depuis l'environnement
        const firebaseConfig = getFirebaseConfig();
        
        // Initialiser Firebase
        app = initializeApp(firebaseConfig);
        
        // Initialiser Firestore
        db = getFirestore(app);
        
        // Initialiser Firebase Storage
        storage = getStorage(app);
        
        // Initialiser l'Admin SDK pour le serveur
        try {
            // Utiliser la clé de service pour l'authentification
            const serviceAccount = require('./keys/firebase-service-account.json');
            
            adminApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: firebaseConfig.storageBucket
            }, 'admin');
            
            adminStorage = admin.storage(adminApp);
            console.log('✅ Admin SDK Firebase initialisé avec succès (clé de service)');
            
        } catch (adminError) {
            console.warn('⚠️ Admin SDK déjà initialisé ou erreur:', adminError.message);
            // Essayer de récupérer l'instance existante
            try {
                adminApp = admin.app('admin');
                adminStorage = admin.storage(adminApp);
                console.log('✅ Admin SDK Firebase récupéré avec succès');
            } catch (retryError) {
                console.error('❌ Impossible d\'initialiser l\'Admin SDK:', retryError.message);
            }
        }
        
        console.log('✅ Firebase initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
        console.log('🔄 Utilisation des données statiques par défaut');
    }
} else {
    console.log('🔄 Firebase désactivé - utilisation des données statiques');
}

// Collections
const COLLECTIONS = {
    PROPERTIES: 'properties',
    USERS: 'users',
    PAYMENTS: 'payments',
    REPORTS: 'reports',
    MESSAGES: 'messages',
    USER_AUTOMATIONS: 'user_automations',
    USER_BILLING: 'user_billing',
    USER_PAYMENT_METHODS: 'user_payment_methods'
};



// Fonctions utilitaires pour Firestore
const firestoreUtils = {
    // Vérifier si Firebase est initialisé
    isInitialized() {
        return db !== null;
    },

    // Récupérer tous les documents d'une collection
    async getAll(collectionName) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Erreur lors de la récupération de ${collectionName}:`, error);
            throw error;
        }
    },

    // Récupérer un document par ID
    async getById(collectionName, id) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération du document ${id} de ${collectionName}:`, error);
            throw error;
        }
    },

    // Ajouter un nouveau document
    async add(collectionName, data, customId = null) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const docData = {
                ...data,
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date()
            };

            if (customId) {
                // Utiliser setDoc avec un ID personnalisé
                const { setDoc } = require('firebase/firestore');
                const docRef = doc(db, collectionName, customId);
                await setDoc(docRef, docData);
                return {
                    id: customId,
                    ...docData
                };
            } else {
                // Utiliser addDoc pour générer un ID automatique
                const docRef = await addDoc(collection(db, collectionName), docData);
                return {
                    id: docRef.id,
                    ...docData
                };
            }
        } catch (error) {
            console.error(`Erreur lors de l'ajout dans ${collectionName}:`, error);
            throw error;
        }
    },

    // Mettre à jour un document
    async update(collectionName, id, data) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date()
            });
            return {
                id,
                ...data
            };
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du document ${id} dans ${collectionName}:`, error);
            throw error;
        }
    },

    // Supprimer un document
    async delete(collectionName, id) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return { id };
        } catch (error) {
            console.error(`Erreur lors de la suppression du document ${id} de ${collectionName}:`, error);
            throw error;
        }
    },

    // Rechercher des documents avec des critères
    async query(collectionName, conditions = []) {
        if (!this.isInitialized()) {
            throw new Error('Firebase non initialisé');
        }
        
        try {
            let q = collection(db, collectionName);
            
            // Appliquer les conditions de recherche
            conditions.forEach(condition => {
                if (condition.type === 'where') {
                    q = query(q, where(condition.field, condition.operator, condition.value));
                } else if (condition.type === 'orderBy') {
                    q = query(q, orderBy(condition.field, condition.direction || 'asc'));
                } else if (condition.type === 'limit') {
                    q = query(q, limit(condition.value));
                }
            });

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Erreur lors de la requête sur ${collectionName}:`, error);
            throw error;
        }
    }
};

// Fonctions utilitaires pour Firebase Storage
const storageUtils = {
    // Vérifier si Firebase Storage est initialisé
    isInitialized() {
        return adminStorage !== null;
    },

    // Uploader un fichier vers Firebase Storage avec Admin SDK
    async uploadFile(filePath, fileData, metadata = {}) {
        if (!this.isInitialized()) {
            throw new Error('Admin SDK Firebase Storage non initialisé');
        }
        
        try {
            const bucket = adminStorage.bucket();
            const file = bucket.file(filePath);
            
            // Uploader le fichier
            await file.save(fileData, {
                metadata: {
                    contentType: metadata.contentType || 'application/octet-stream',
                    metadata: metadata.customMetadata || {}
                }
            });
            
            // Rendre le fichier public et obtenir l'URL
            await file.makePublic();
            const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            
            console.log('✅ Fichier uploadé avec succès:', downloadURL);
            return downloadURL;
            
        } catch (error) {
            console.error('Erreur lors de l\'upload vers Firebase Storage:', error);
            throw error;
        }
    },

    // Supprimer un fichier de Firebase Storage
    async deleteFile(filePath) {
        if (!this.isInitialized()) {
            throw new Error('Admin SDK Firebase Storage non initialisé');
        }
        
        try {
            const bucket = adminStorage.bucket();
            const file = bucket.file(filePath);
            
            // Vérifier si le fichier existe
            const [exists] = await file.exists();
            if (!exists) {
                console.warn(`⚠️ Fichier ${filePath} n'existe pas dans Firebase Storage`);
                return false;
            }
            
            // Supprimer le fichier
            await file.delete();
            console.log(`✅ Fichier ${filePath} supprimé avec succès de Firebase Storage`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur lors de la suppression du fichier ${filePath}:`, error);
            throw error;
        }
    }
};

// Fonctions utilitaires pour l'authentification Firebase
const authUtils = {
    // Vérifier si l'Admin SDK est initialisé
    isInitialized() {
        return adminApp !== null;
    },

    // Créer un nouvel utilisateur dans l'authentification Firebase
    async createUser(email, password, displayName = null) {
        if (!this.isInitialized()) {
            throw new Error('Admin SDK Firebase non initialisé');
        }

        try {
            const userRecord = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: displayName,
                emailVerified: false // L'utilisateur devra vérifier son email
            });

            console.log('✅ Utilisateur créé dans l\'authentification Firebase:', userRecord.uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified
            };
        } catch (error) {
            console.error('❌ Erreur lors de la création de l\'utilisateur dans l\'authentification:', error);
            throw error;
        }
    },

    // Supprimer un utilisateur de l'authentification Firebase
    async deleteUser(uid) {
        if (!this.isInitialized()) {
            throw new Error('Admin SDK Firebase non initialisé');
        }

        try {
            await admin.auth().deleteUser(uid);
            console.log('✅ Utilisateur supprimé de l\'authentification Firebase:', uid);
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'utilisateur de l\'authentification:', error);
            throw error;
        }
    },

    // Obtenir les informations d'un utilisateur par son UID
    async getUser(uid) {
        if (!this.isInitialized()) {
            throw new Error('Admin SDK Firebase non initialisé');
        }

        try {
            const userRecord = await admin.auth().getUser(uid);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                createdAt: userRecord.metadata.creationTime
            };
        } catch (error) {
            console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
            throw error;
        }
    }
};

module.exports = {
    db,
    storage,
    adminStorage,
    COLLECTIONS,
    firestoreUtils,
    storageUtils,
    authUtils
}; 