// Script pour ajouter des données de conversation d'exemple dans Firebase
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');

async function setupChatMessages() {
    console.log('🚀 Démarrage de la configuration des messages de chat...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé - utilisation des données mock');
            return;
        }
        
        // Données de conversation d'exemple
        const sampleMessages = [
            // Conversation 1 - Appartement T3 Paris 15ème
            {
                id: 'MSG001',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Bonjour, j\'ai une question concernant le loyer de l\'appartement.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 heures ago
                readBy: ['USER001'],
                participants: ['341NE', 'USER001']
            },
            {
                id: 'MSG002',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: '341NE',
                recipientId: 'USER001',
                message: 'Bonjour ! Bien sûr, quelle est votre question ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 heures ago
                readBy: ['341NE', 'USER001'],
                participants: ['341NE', 'USER001']
            },
            {
                id: 'MSG003',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Le loyer est-il négociable ? J\'ai un budget un peu serré.',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                readBy: ['USER001'],
                participants: ['341NE', 'USER001']
            },
            {
                id: 'MSG004',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Et y a-t-il des charges en plus ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                readBy: ['USER001'],
                participants: ['341NE', 'USER001']
            },
            
            // Conversation 2 - Studio Lyon 2ème
            {
                id: 'MSG005',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'USER002',
                recipientId: '341NE',
                message: 'Bonjour, je suis intéressé par votre studio à Lyon.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 heures ago
                readBy: ['USER002', '341NE'],
                participants: ['341NE', 'USER002']
            },
            {
                id: 'MSG006',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: '341NE',
                recipientId: 'USER002',
                message: 'Parfait ! Quand souhaitez-vous visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 heures ago
                readBy: ['341NE', 'USER002'],
                participants: ['341NE', 'USER002']
            },
            {
                id: 'MSG007',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'USER002',
                recipientId: '341NE',
                message: 'Merci pour votre réponse rapide ! Je peux venir demain après-midi.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 heures ago
                readBy: ['USER002', '341NE'],
                participants: ['341NE', 'USER002']
            },
            {
                id: 'MSG008',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: '341NE',
                recipientId: 'USER002',
                message: 'Parfait ! Je vous envoie l\'adresse exacte par email.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 heures ago
                readBy: ['341NE', 'USER002'],
                participants: ['341NE', 'USER002']
            },
            
            // Conversation 3 - Maison T4 Marseille
            {
                id: 'MSG009',
                propertyId: 'PROP003',
                propertyName: 'Maison T4 - Marseille',
                senderId: 'USER003',
                recipientId: '341NE',
                message: 'Bonjour, pouvez-vous me confirmer la date de visite pour la maison ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 jour ago
                readBy: ['USER003'],
                participants: ['341NE', 'USER003']
            },
            {
                id: 'MSG010',
                propertyId: 'PROP003',
                propertyName: 'Maison T4 - Marseille',
                senderId: 'USER003',
                recipientId: '341NE',
                message: 'J\'aimerais aussi savoir si le jardin est inclus dans le loyer.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 heures ago
                readBy: ['USER003'],
                participants: ['341NE', 'USER003']
            },
            
            // Conversation 4 - Appartement T2 Nice
            {
                id: 'MSG011',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: 'USER004',
                recipientId: '341NE',
                message: 'Salut ! L\'appartement est-il toujours disponible ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 heures ago
                readBy: ['USER004', '341NE'],
                participants: ['341NE', 'USER004']
            },
            {
                id: 'MSG012',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: '341NE',
                recipientId: 'USER004',
                message: 'Oui, il est toujours disponible ! Voulez-vous le visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5), // 5.5 heures ago
                readBy: ['341NE', 'USER004'],
                participants: ['341NE', 'USER004']
            },
            {
                id: 'MSG013',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: 'USER004',
                recipientId: '341NE',
                message: 'Parfait ! Je peux venir ce weekend si c\'est possible.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 heures ago
                readBy: ['USER004'],
                participants: ['341NE', 'USER004']
            },
            
            // Conversation 5 - Loft T3 Bordeaux
            {
                id: 'MSG014',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: 'USER005',
                recipientId: '341NE',
                message: 'Bonjour, j\'ai vu votre annonce pour le loft. Il est magnifique !',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 heures ago
                readBy: ['USER005', '341NE'],
                participants: ['341NE', 'USER005']
            },
            {
                id: 'MSG015',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: '341NE',
                recipientId: 'USER005',
                message: 'Merci ! Il a été entièrement rénové l\'année dernière.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11.5), // 11.5 heures ago
                readBy: ['341NE', 'USER005'],
                participants: ['341NE', 'USER005']
            },
            {
                id: 'MSG016',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: 'USER005',
                recipientId: '341NE',
                message: 'Quel est le montant des charges mensuelles ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 heures ago
                readBy: ['USER005'],
                participants: ['341NE', 'USER005']
            }
        ];
        
        console.log(`📝 Ajout de ${sampleMessages.length} messages d'exemple...`);
        
        // Ajouter chaque message
        for (const messageData of sampleMessages) {
            try {
                await firestoreUtils.add(COLLECTIONS.MESSAGES, messageData, messageData.id);
                console.log(`✅ Message ${messageData.id} ajouté avec succès`);
            } catch (error) {
                console.error(`❌ Erreur lors de l'ajout du message ${messageData.id}:`, error.message);
            }
        }
        
        console.log('🎉 Configuration des messages de chat terminée avec succès !');
        
        // Afficher un résumé
        console.log('\n📊 Résumé des conversations créées :');
        const conversations = {};
        sampleMessages.forEach(msg => {
            if (!conversations[msg.propertyId]) {
                conversations[msg.propertyId] = {
                    propertyName: msg.propertyName,
                    messageCount: 0,
                    lastMessage: msg.timestamp
                };
            }
            conversations[msg.propertyId].messageCount++;
            if (msg.timestamp > conversations[msg.propertyId].lastMessage) {
                conversations[msg.propertyId].lastMessage = msg.timestamp;
            }
        });
        
        Object.entries(conversations).forEach(([propertyId, data]) => {
            console.log(`  - ${data.propertyName}: ${data.messageCount} messages`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration des messages de chat:', error);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    setupChatMessages()
        .then(() => {
            console.log('✅ Script terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { setupChatMessages };
