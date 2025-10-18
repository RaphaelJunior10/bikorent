// Script pour corriger les messages de chat avec des utilisateurs existants
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');

async function fixChatMessages() {
    console.log('🚀 Correction des messages de chat...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé - impossible de corriger les messages');
            return;
        }
        
        // D'abord, supprimer tous les anciens messages
        console.log('🗑️ Suppression des anciens messages...');
        const oldMessages = await firestoreUtils.getAll(COLLECTIONS.MESSAGES);
        for (const message of oldMessages) {
            await firestoreUtils.delete(COLLECTIONS.MESSAGES, message.id);
            console.log(`✅ Message ${message.id} supprimé`);
        }
        
        // Créer des utilisateurs de test s'ils n'existent pas
        await createTestUsers();
        
        // Créer les nouveaux messages avec des utilisateurs existants
        const correctedMessages = [
            // Conversation 1 - Appartement T3 Paris 15ème
            {
                id: 'MSG001',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'TENANT001',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Bonjour, j\'ai une question concernant le loyer de l\'appartement.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 heures ago
                readBy: ['TENANT001'],
                senderName: 'Marie Dubois',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG002',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'U7h4HU5OfB9KTeY341NE',
                recipientId: 'TENANT001',
                message: 'Bonjour ! Bien sûr, quelle est votre question ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 heures ago
                readBy: ['U7h4HU5OfB9KTeY341NE', 'TENANT001'],
                senderName: 'Admin BikoRent',
                recipientName: 'Marie Dubois'
            },
            {
                id: 'MSG003',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'TENANT001',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Le loyer est-il négociable ? J\'ai un budget un peu serré.',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                readBy: ['TENANT001'],
                senderName: 'Marie Dubois',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG004',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'TENANT001',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Et y a-t-il des charges en plus ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
                readBy: ['TENANT001'],
                senderName: 'Marie Dubois',
                recipientName: 'Admin BikoRent'
            },
            
            // Conversation 2 - Studio Lyon 2ème
            {
                id: 'MSG005',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'TENANT002',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Bonjour, je suis intéressé par votre studio à Lyon.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 heures ago
                readBy: ['TENANT002', 'U7h4HU5OfB9KTeY341NE'],
                senderName: 'Pierre Martin',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG006',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'U7h4HU5OfB9KTeY341NE',
                recipientId: 'TENANT002',
                message: 'Parfait ! Quand souhaitez-vous visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 heures ago
                readBy: ['U7h4HU5OfB9KTeY341NE', 'TENANT002'],
                senderName: 'Admin BikoRent',
                recipientName: 'Pierre Martin'
            },
            {
                id: 'MSG007',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'TENANT002',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Merci pour votre réponse rapide ! Je peux venir demain après-midi.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 heures ago
                readBy: ['TENANT002', 'U7h4HU5OfB9KTeY341NE'],
                senderName: 'Pierre Martin',
                recipientName: 'Admin BikoRent'
            },
            
            // Conversation 3 - Maison T4 Marseille
            {
                id: 'MSG008',
                propertyId: 'PROP003',
                propertyName: 'Maison T4 - Marseille',
                senderId: 'TENANT003',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Bonjour, pouvez-vous me confirmer la date de visite pour la maison ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 jour ago
                readBy: ['TENANT003'],
                senderName: 'Sophie Leroy',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG009',
                propertyId: 'PROP003',
                propertyName: 'Maison T4 - Marseille',
                senderId: 'TENANT003',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'J\'aimerais aussi savoir si le jardin est inclus dans le loyer.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20), // 20 heures ago
                readBy: ['TENANT003'],
                senderName: 'Sophie Leroy',
                recipientName: 'Admin BikoRent'
            },
            
            // Conversation 4 - Appartement T2 Nice
            {
                id: 'MSG010',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: 'TENANT004',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Salut ! L\'appartement est-il toujours disponible ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 heures ago
                readBy: ['TENANT004', 'U7h4HU5OfB9KTeY341NE'],
                senderName: 'Lucas Bernard',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG011',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: 'U7h4HU5OfB9KTeY341NE',
                recipientId: 'TENANT004',
                message: 'Oui, il est toujours disponible ! Voulez-vous le visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5.5), // 5.5 heures ago
                readBy: ['U7h4HU5OfB9KTeY341NE', 'TENANT004'],
                senderName: 'Admin BikoRent',
                recipientName: 'Lucas Bernard'
            },
            {
                id: 'MSG012',
                propertyId: 'PROP004',
                propertyName: 'Appartement T2 - Nice',
                senderId: 'TENANT004',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Parfait ! Je peux venir ce weekend si c\'est possible.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 heures ago
                readBy: ['TENANT004'],
                senderName: 'Lucas Bernard',
                recipientName: 'Admin BikoRent'
            },
            
            // Conversation 5 - Loft T3 Bordeaux
            {
                id: 'MSG013',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: 'TENANT005',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Bonjour, j\'ai vu votre annonce pour le loft. Il est magnifique !',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 heures ago
                readBy: ['TENANT005', 'U7h4HU5OfB9KTeY341NE'],
                senderName: 'Emma Rousseau',
                recipientName: 'Admin BikoRent'
            },
            {
                id: 'MSG014',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: 'U7h4HU5OfB9KTeY341NE',
                recipientId: 'TENANT005',
                message: 'Merci ! Il a été entièrement rénové l\'année dernière.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 11.5), // 11.5 heures ago
                readBy: ['U7h4HU5OfB9KTeY341NE', 'TENANT005'],
                senderName: 'Admin BikoRent',
                recipientName: 'Emma Rousseau'
            },
            {
                id: 'MSG015',
                propertyId: 'PROP005',
                propertyName: 'Loft T3 - Bordeaux',
                senderId: 'TENANT005',
                recipientId: 'U7h4HU5OfB9KTeY341NE',
                message: 'Quel est le montant des charges mensuelles ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10), // 10 heures ago
                readBy: ['TENANT005'],
                senderName: 'Emma Rousseau',
                recipientName: 'Admin BikoRent'
            }
        ];
        
        console.log(`📝 Ajout de ${correctedMessages.length} messages corrigés...`);
        
        // Ajouter chaque message
        for (const messageData of correctedMessages) {
            try {
                await firestoreUtils.add(COLLECTIONS.MESSAGES, messageData, messageData.id);
                console.log(`✅ Message ${messageData.id} ajouté avec succès`);
            } catch (error) {
                console.error(`❌ Erreur lors de l'ajout du message ${messageData.id}:`, error.message);
            }
        }
        
        console.log('🎉 Correction des messages de chat terminée avec succès !');
        
        // Afficher un résumé
        console.log('\n📊 Résumé des conversations corrigées :');
        const conversations = {};
        correctedMessages.forEach(msg => {
            if (!conversations[msg.propertyId]) {
                conversations[msg.propertyId] = {
                    propertyName: msg.propertyName,
                    messageCount: 0,
                    lastMessage: msg.timestamp,
                    participants: new Set()
                };
            }
            conversations[msg.propertyId].messageCount++;
            conversations[msg.propertyId].participants.add(msg.senderId);
            conversations[msg.propertyId].participants.add(msg.recipientId);
            if (msg.timestamp > conversations[msg.propertyId].lastMessage) {
                conversations[msg.propertyId].lastMessage = msg.timestamp;
            }
        });
        
        Object.entries(conversations).forEach(([propertyId, data]) => {
            console.log(`  - ${data.propertyName}: ${data.messageCount} messages`);
            console.log(`    Participants: ${Array.from(data.participants).join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la correction des messages de chat:', error);
    }
}

async function createTestUsers() {
    console.log('👥 Création des utilisateurs de test...');
    
    const testUsers = [
        {
            id: 'TENANT001',
            type: 'tenant',
            profile: {
                firstName: 'Marie',
                lastName: 'Dubois',
                email: 'marie.dubois@email.com',
                phone: '+33 1 23 45 67 89',
                profession: 'Ingénieure',
                workplace: 'TechCorp Paris',
                address: '15 Rue de la Paix, 75001 Paris',
                bio: 'Locataire responsable et ponctuelle',
                photo: null
            },
            tenant: {
                monthlyRent: 1200,
                hasDebt: false,
                debtAmount: 0,
                entryDate: '2023-01-15',
                status: 'current',
                unpaidMonths: 0,
                lastPayment: '2024-01-15',
                nextPayment: '2024-02-15'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'TENANT002',
            type: 'tenant',
            profile: {
                firstName: 'Pierre',
                lastName: 'Martin',
                email: 'pierre.martin@email.com',
                phone: '+33 4 56 78 90 12',
                profession: 'Développeur',
                workplace: 'Startup Lyon',
                address: '8 Place Bellecour, 69002 Lyon',
                bio: 'Passionné de technologie et de design',
                photo: null
            },
            tenant: {
                monthlyRent: 800,
                hasDebt: false,
                debtAmount: 0,
                entryDate: '2023-03-01',
                status: 'current',
                unpaidMonths: 0,
                lastPayment: '2024-01-01',
                nextPayment: '2024-02-01'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'TENANT003',
            type: 'tenant',
            profile: {
                firstName: 'Sophie',
                lastName: 'Leroy',
                email: 'sophie.leroy@email.com',
                phone: '+33 4 91 23 45 67',
                profession: 'Architecte',
                workplace: 'Agence Marseille',
                address: '25 Vieux Port, 13001 Marseille',
                bio: 'Spécialisée en architecture moderne',
                photo: null
            },
            tenant: {
                monthlyRent: 1500,
                hasDebt: false,
                debtAmount: 0,
                entryDate: '2023-06-15',
                status: 'current',
                unpaidMonths: 0,
                lastPayment: '2024-01-15',
                nextPayment: '2024-02-15'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'TENANT004',
            type: 'tenant',
            profile: {
                firstName: 'Lucas',
                lastName: 'Bernard',
                email: 'lucas.bernard@email.com',
                phone: '+33 4 93 12 34 56',
                profession: 'Chef de projet',
                workplace: 'Digital Agency Nice',
                address: '12 Promenade des Anglais, 06000 Nice',
                bio: 'Expert en gestion de projets digitaux',
                photo: null
            },
            tenant: {
                monthlyRent: 1100,
                hasDebt: false,
                debtAmount: 0,
                entryDate: '2023-09-01',
                status: 'current',
                unpaidMonths: 0,
                lastPayment: '2024-01-01',
                nextPayment: '2024-02-01'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'TENANT005',
            type: 'tenant',
            profile: {
                firstName: 'Emma',
                lastName: 'Rousseau',
                email: 'emma.rousseau@email.com',
                phone: '+33 5 56 78 90 12',
                profession: 'Designer',
                workplace: 'Creative Studio Bordeaux',
                address: '30 Place de la Bourse, 33000 Bordeaux',
                bio: 'Designer UX/UI créative et innovante',
                photo: null
            },
            tenant: {
                monthlyRent: 900,
                hasDebt: false,
                debtAmount: 0,
                entryDate: '2023-11-01',
                status: 'current',
                unpaidMonths: 0,
                lastPayment: '2024-01-01',
                nextPayment: '2024-02-01'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
    
    for (const userData of testUsers) {
        try {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await firestoreUtils.getById(COLLECTIONS.USERS, userData.id);
            if (!existingUser) {
                await firestoreUtils.add(COLLECTIONS.USERS, userData, userData.id);
                console.log(`✅ Utilisateur ${userData.id} créé avec succès`);
            } else {
                console.log(`ℹ️ Utilisateur ${userData.id} existe déjà`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors de la création de l'utilisateur ${userData.id}:`, error.message);
        }
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    fixChatMessages()
        .then(() => {
            console.log('✅ Script terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { fixChatMessages };
