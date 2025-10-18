// Script pour tester directement les conversations sans JavaScript côté client
const { firestoreUtils, COLLECTIONS } = require('./config/firebase');

async function testConversationsDirect() {
    console.log('🔍 Test direct des conversations...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé');
            return;
        }
        
        const userId = 'U7h4HU5OfB9KTeY341NE';
        console.log(`👤 Test pour l'utilisateur: ${userId}`);
        
        // Récupérer tous les messages
        console.log('📋 Récupération de tous les messages...');
        const allMessages = await firestoreUtils.getAll('messages');
        console.log(`📊 Total des messages: ${allMessages.length}`);
        
        // Afficher tous les messages
        allMessages.forEach((message, index) => {
            console.log(`\n📝 Message ${index + 1}:`);
            console.log(`  ID: ${message.id}`);
            console.log(`  Propriété: ${message.propertyName}`);
            console.log(`  Expéditeur: ${message.senderId}`);
            console.log(`  Destinataire: ${message.recipientId}`);
            console.log(`  Message: ${message.message}`);
            console.log(`  Timestamp: ${message.timestamp}`);
            console.log(`  Lu par: ${message.readBy?.join(', ') || 'Personne'}`);
        });
        
        // Filtrer les messages où l'utilisateur est impliqué
        console.log(`\n🔍 Filtrage des messages pour l'utilisateur ${userId}...`);
        const userMessages = allMessages.filter(message => 
            message.senderId === userId || message.recipientId === userId
        );
        
        console.log(`📊 Messages de l'utilisateur: ${userMessages.length}`);
        
        // Grouper par propriété
        console.log('\n📋 Groupement par propriété...');
        const conversationMap = new Map();
        
        for (const message of userMessages) {
            const propertyId = message.propertyId;
            
            if (!conversationMap.has(propertyId)) {
                conversationMap.set(propertyId, {
                    propertyId: propertyId,
                    propertyName: message.propertyName || `Propriété ${propertyId}`,
                    lastMessage: message.message,
                    lastMessageTime: message.timestamp,
                    unreadCount: 0,
                    participants: [message.senderId, message.recipientId]
                });
            }
            
            // Mettre à jour le dernier message si plus récent
            if (message.timestamp > conversationMap.get(propertyId).lastMessageTime) {
                conversationMap.get(propertyId).lastMessage = message.message;
                conversationMap.get(propertyId).lastMessageTime = message.timestamp;
            }
            
            // Compter les messages non lus
            if (message.senderId !== userId && !message.readBy?.includes(userId)) {
                conversationMap.get(propertyId).unreadCount++;
            }
        }
        
        // Afficher les conversations
        console.log('\n💬 Conversations trouvées:');
        const conversations = Array.from(conversationMap.values()).sort((a, b) => 
            new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );
        
        conversations.forEach((conversation, index) => {
            console.log(`\n📋 Conversation ${index + 1}:`);
            console.log(`  Propriété: ${conversation.propertyName}`);
            console.log(`  Dernier message: ${conversation.lastMessage}`);
            console.log(`  Heure: ${conversation.lastMessageTime}`);
            console.log(`  Messages non lus: ${conversation.unreadCount}`);
            console.log(`  Participants: ${conversation.participants.join(', ')}`);
        });
        
        // Test du nombre de messages non lus
        console.log('\n🔔 Test du nombre de messages non lus...');
        const unreadMessages = allMessages.filter(message => 
            (message.senderId === userId || message.recipientId === userId) &&
            message.senderId !== userId &&
            !message.readBy?.includes(userId)
        );
        
        console.log(`📊 Messages non lus: ${unreadMessages.length}`);
        
        // Afficher les messages non lus
        unreadMessages.forEach((message, index) => {
            console.log(`\n🔔 Message non lu ${index + 1}:`);
            console.log(`  Propriété: ${message.propertyName}`);
            console.log(`  Expéditeur: ${message.senderId}`);
            console.log(`  Message: ${message.message}`);
        });
        
        console.log('\n✅ Test terminé avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    testConversationsDirect()
        .then(() => {
            console.log('✅ Script terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { testConversationsDirect };
