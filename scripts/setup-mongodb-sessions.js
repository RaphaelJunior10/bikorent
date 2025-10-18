#!/usr/bin/env node

/**
 * Script de configuration MongoDB pour les sessions
 */

const { MongoClient } = require('mongodb');

async function setupMongoDBSessions() {
    console.log('🔧 Configuration MongoDB pour les sessions');
    
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/bikorent-sessions';
    console.log('🔗 URL MongoDB:', mongoUrl);
    
    let client;
    
    try {
        // Connexion à MongoDB
        console.log('📡 Connexion à MongoDB...');
        client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('✅ Connexion MongoDB réussie');
        
        // Sélectionner la base de données
        const db = client.db('bikorent-sessions');
        console.log('📊 Base de données sélectionnée: bikorent-sessions');
        
        // Créer la collection sessions si elle n'existe pas
        const collections = await db.listCollections().toArray();
        const sessionsCollectionExists = collections.some(col => col.name === 'sessions');
        
        if (!sessionsCollectionExists) {
            console.log('📝 Création de la collection sessions...');
            await db.createCollection('sessions');
            console.log('✅ Collection sessions créée');
        } else {
            console.log('✅ Collection sessions existe déjà');
        }
        
        // Créer les index nécessaires
        console.log('🔍 Création des index...');
        const sessionsCollection = db.collection('sessions');
        
        try {
            await sessionsCollection.createIndex({ 'expires': 1 }, { expireAfterSeconds: 0 });
            console.log('✅ Index expires créé');
        } catch (error) {
            if (error.code === 85) {
                console.log('✅ Index expires existe déjà');
            } else {
                console.log('⚠️ Erreur création index expires:', error.message);
            }
        }
        
        try {
            await sessionsCollection.createIndex({ 'session': 1 });
            console.log('✅ Index session créé');
        } catch (error) {
            if (error.code === 85) {
                console.log('✅ Index session existe déjà');
            } else {
                console.log('⚠️ Erreur création index session:', error.message);
            }
        }
        
        // Vérifier les collections existantes
        console.log('📋 Collections existantes:');
        const allCollections = await db.listCollections().toArray();
        allCollections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        
        // Tester l'insertion d'une session de test
        console.log('🧪 Test d\'insertion de session...');
        const testSession = {
            _id: 'test-session-' + Date.now(),
            session: JSON.stringify({ test: true }),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        };
        
        await sessionsCollection.insertOne(testSession);
        console.log('✅ Session de test insérée');
        
        // Nettoyer la session de test
        await sessionsCollection.deleteOne({ _id: testSession._id });
        console.log('🧹 Session de test supprimée');
        
        console.log('\n🎉 Configuration MongoDB terminée avec succès !');
        console.log('💡 Vous pouvez maintenant démarrer le serveur avec: npm start');
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration MongoDB:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Assurez-vous que MongoDB est démarré:');
            console.log('   - Windows: net start MongoDB');
            console.log('   - Linux: sudo systemctl start mongod');
            console.log('   - macOS: brew services start mongodb-community');
        }
        
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Connexion MongoDB fermée');
        }
    }
}

// Exécuter la configuration
setupMongoDBSessions();
