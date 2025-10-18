const admin = require('firebase-admin');

/**
 * Utilitaires pour interagir avec Firestore
 */
class FirestoreUtils {
    constructor() {
        // Ne pas initialiser db ici, on le fera dans getDb()
    }

    getDb() {
        if (!this.db) {
            // S'assurer que Firebase est initialisé
            if (!admin.apps.length) {
                const serviceAccount = require('../config/keys/firebase-service-account.json');
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }
            this.db = admin.firestore();
        }
        return this.db;
    }

    /**
     * Récupérer tous les documents d'une collection
     * @param {string} collectionName - Nom de la collection
     * @returns {Promise<Array>} - Tableau des documents
     */
    async getAll(collectionName) {
        try {
            const snapshot = await this.getDb().collection(collectionName).get();
            const documents = [];
            
            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return documents;
        } catch (error) {
            console.error(`Erreur lors de la récupération de la collection ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Récupérer un document par son ID
     * @param {string} collectionName - Nom de la collection
     * @param {string} docId - ID du document
     * @returns {Promise<Object|null>} - Document ou null si non trouvé
     */
    async getById(collectionName, docId) {
        try {
            const doc = await this.getDb().collection(collectionName).doc(docId).get();
            
            if (doc.exists) {
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            
            return null;
        } catch (error) {
            console.error(`Erreur lors de la récupération du document ${docId} de ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Créer un nouveau document
     * @param {string} collectionName - Nom de la collection
     * @param {string} docId - ID du document (optionnel, généré automatiquement si non fourni)
     * @param {Object} data - Données du document
     * @returns {Promise<string>} - ID du document créé
     */
    async create(collectionName, docId, data) {
        try {
            const docRef = docId 
                ? this.getDb().collection(collectionName).doc(docId)
                : this.getDb().collection(collectionName).doc();
            
            await docRef.set({
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            
            return docRef.id;
        } catch (error) {
            console.error(`Erreur lors de la création du document dans ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Mettre à jour un document
     * @param {string} collectionName - Nom de la collection
     * @param {string} docId - ID du document
     * @param {Object} data - Données à mettre à jour
     * @returns {Promise<void>}
     */
    async update(collectionName, docId, data) {
        try {
            await this.getDb().collection(collectionName).doc(docId).update({
                ...data,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du document ${docId} dans ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Supprimer un document
     * @param {string} collectionName - Nom de la collection
     * @param {string} docId - ID du document
     * @returns {Promise<void>}
     */
    async delete(collectionName, docId) {
        try {
            await this.getDb().collection(collectionName).doc(docId).delete();
        } catch (error) {
            console.error(`Erreur lors de la suppression du document ${docId} de ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Rechercher des documents avec des critères
     * @param {string} collectionName - Nom de la collection
     * @param {string} field - Champ à filtrer
     * @param {*} value - Valeur à rechercher
     * @returns {Promise<Array>} - Tableau des documents correspondants
     */
    async findBy(collectionName, field, value) {
        try {
            const snapshot = await this.getDb().collection(collectionName)
                .where(field, '==', value)
                .get();
            
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return documents;
        } catch (error) {
            console.error(`Erreur lors de la recherche dans ${collectionName} par ${field}:`, error);
            throw error;
        }
    }

    /**
     * Compter les documents d'une collection
     * @param {string} collectionName - Nom de la collection
     * @returns {Promise<number>} - Nombre de documents
     */
    async count(collectionName) {
        try {
            const snapshot = await this.getDb().collection(collectionName).get();
            return snapshot.size;
        } catch (error) {
            console.error(`Erreur lors du comptage de la collection ${collectionName}:`, error);
            throw error;
        }
    }
}

module.exports = new FirestoreUtils();
