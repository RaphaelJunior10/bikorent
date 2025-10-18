#!/usr/bin/env node

/**
 * Script de test des sessions
 */

const { MongoClient } = require('mongodb');

async function testSessions() {
    console.log('🧪 Test des sessions MongoDB');
    
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/bikorent-sessions';
    
    try {
        // Connexion MongoDB
        const client = new MongoClient(mongoUrl);
        await client.connect();
        console.log('✅ Connexion MongoDB réussie');
        
        const db = client.db();
        const sessionsCollection = db.collection('sessions');
        
        // Vérifier les sessions existantes
        const sessionCount = await sessionsCollection.countDocuments();
        console.log(`📊 Nombre de sessions: ${sessionCount}`);
        
        // Lister les sessions récentes
        const recentSessions = await sessionsCollection
            .find({})
            .sort({ lastModified: -1 })
            .limit(5)
            .toArray();
            
        console.log('🔍 Sessions récentes:');
        recentSessions.forEach((session, index) => {
            console.log(`   ${index + 1}. ID: ${session._id}`);
            console.log(`      Expires: ${new Date(session.expires).toLocaleString()}`);
            console.log(`      Last Modified: ${new Date(session.lastModified).toLocaleString()}`);
            console.log(`      User: ${session.session?.user ? 'Connecté' : 'Non connecté'}`);
            console.log('');
        });
        
        // Vérifier les index
        const indexes = await sessionsCollection.indexes();
        console.log('📋 Index MongoDB:');
        indexes.forEach((index, i) => {
            console.log(`   ${i + 1}. ${JSON.stringify(index.key)}`);
        });
        
        await client.close();
        console.log('✅ Test terminé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du test des sessions:', error.message);
        process.exit(1);
    }
}

// Exécuter le test
testSessions();
