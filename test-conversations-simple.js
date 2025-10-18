// Script simple pour tester les conversations
const { firestoreUtils, COLLECTIONS } = require('./config/firebase');

async function testConversationsSimple() {
    console.log('🔍 Test simple des conversations...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé');
            return;
        }
        
        const userId = 'U7h4HU5OfB9KTeY341NE';
        console.log(`👤 Test pour l'utilisateur: ${userId}`);
        
        // Récupérer tous les messages
        const allMessages = await firestoreUtils.getAll('messages');
        console.log(`📊 Total des messages: ${allMessages.length}`);
        
        // Filtrer les messages de l'utilisateur
        const userMessages = allMessages.filter(message => 
            message.senderId === userId || message.recipientId === userId
        );
        
        console.log(`📊 Messages de l'utilisateur: ${userMessages.length}`);
        
        // Grouper par nom de propriété pour éviter les doublons
        const conversations = {};
        
        for (const message of userMessages) {
            const propertyName = message.propertyName || `Propriété ${message.propertyId}`;
            
            if (!conversations[propertyName]) {
                conversations[propertyName] = {
                    propertyId: message.propertyId, // Garder le premier propertyId trouvé
                    propertyName: propertyName,
                    messages: [],
                    unreadCount: 0
                };
            }
            
            conversations[propertyName].messages.push(message);
            
            // Compter les messages non lus
            if (message.senderId !== userId && !message.readBy?.includes(userId)) {
                conversations[propertyName].unreadCount++;
            }
        }
        
        // Trier les messages par date et récupérer le dernier
        const finalConversations = Object.values(conversations).map(conv => {
            // Trier les messages par date
            conv.messages.sort((a, b) => {
                const timeA = new Date(a.timestamp.seconds * 1000);
                const timeB = new Date(b.timestamp.seconds * 1000);
                return timeB - timeA;
            });
            
            const lastMessage = conv.messages[0];
            
            return {
                propertyId: conv.propertyId,
                propertyName: conv.propertyName,
                lastMessage: lastMessage.message,
                lastMessageTime: lastMessage.timestamp,
                unreadCount: conv.unreadCount,
                totalMessages: conv.messages.length
            };
        });
        
        // Trier les conversations par date du dernier message
        finalConversations.sort((a, b) => {
            const timeA = new Date(a.lastMessageTime.seconds * 1000);
            const timeB = new Date(b.lastMessageTime.seconds * 1000);
            return timeB - timeA;
        });
        
        console.log('\n💬 Conversations finales:');
        finalConversations.forEach((conversation, index) => {
            console.log(`\n📋 Conversation ${index + 1}:`);
            console.log(`  Propriété: ${conversation.propertyName}`);
            console.log(`  Dernier message: ${conversation.lastMessage}`);
            console.log(`  Heure: ${new Date(conversation.lastMessageTime.seconds * 1000).toLocaleString()}`);
            console.log(`  Messages non lus: ${conversation.unreadCount}`);
            console.log(`  Total messages: ${conversation.totalMessages}`);
        });
        
        console.log('\n✅ Test terminé avec succès !');
        return finalConversations;
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return [];
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    testConversationsSimple()
        .then((conversations) => {
            console.log(`\n📊 Résultat: ${conversations.length} conversations trouvées`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { testConversationsSimple };
