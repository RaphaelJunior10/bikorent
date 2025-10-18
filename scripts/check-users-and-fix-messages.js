// Script pour vérifier les utilisateurs existants et corriger les messages
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');

async function checkUsersAndFixMessages() {
    console.log('🔍 Vérification des utilisateurs existants...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé');
            return;
        }
        
        // Récupérer tous les utilisateurs existants
        console.log('📋 Récupération des utilisateurs existants...');
        const existingUsers = await firestoreUtils.getAll(COLLECTIONS.USERS);
        
        console.log(`\n👥 Utilisateurs trouvés (${existingUsers.length}) :`);
        existingUsers.forEach(user => {
            console.log(`  - ID: ${user.id}`);
            console.log(`    Type: ${user.type}`);
            console.log(`    Nom: ${user.profile?.firstName} ${user.profile?.lastName}`);
            console.log(`    Email: ${user.profile?.email}`);
            console.log('');
        });
        
        if (existingUsers.length === 0) {
            console.log('❌ Aucun utilisateur trouvé dans la collection users');
            console.log('💡 Création d\'un utilisateur admin par défaut...');
            await createDefaultAdmin();
            return;
        }
        
        // Vérifier si l'utilisateur principal existe
        const adminUser = existingUsers.find(user => user.id === 'U7h4HU5OfB9KTeY341NE');
        if (!adminUser) {
            console.log('⚠️ Utilisateur principal U7h4HU5OfB9KTeY341NE non trouvé');
            console.log('💡 Utilisation du premier utilisateur admin disponible...');
            const firstAdmin = existingUsers.find(user => user.type === 'admin');
            if (firstAdmin) {
                console.log(`✅ Utilisation de l'utilisateur admin: ${firstAdmin.id}`);
                await fixMessagesWithCorrectUsers(existingUsers);
            } else {
                console.log('❌ Aucun utilisateur admin trouvé');
            }
        } else {
            console.log('✅ Utilisateur principal trouvé');
            await fixMessagesWithCorrectUsers(existingUsers);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des utilisateurs:', error);
    }
}

async function createDefaultAdmin() {
    console.log('👤 Création de l\'utilisateur admin par défaut...');
    
    const adminUser = {
        id: 'U7h4HU5OfB9KTeY341NE',
        type: 'admin',
        profile: {
            firstName: 'Admin',
            lastName: 'BikoRent',
            email: 'admin@bikorent.com',
            phone: '+33 1 23 45 67 89',
            profession: 'Administrateur',
            workplace: 'BikoRent',
            address: 'Paris, France',
            bio: 'Administrateur principal de BikoRent',
            photo: null
        },
        security: {
            twoFactorEnabled: false,
            lastLogin: new Date(),
            loginAttempts: 0
        },
        notifications: {
            email: true,
            push: true,
            sms: false
        },
        preferences: {
            language: 'fr',
            timezone: 'Europe/Paris',
            theme: 'light'
        },
        billing: {
            plan: 'premium',
            status: 'active',
            nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        integrations: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
    
    try {
        await firestoreUtils.add(COLLECTIONS.USERS, adminUser, adminUser.id);
        console.log('✅ Utilisateur admin créé avec succès');
        
        // Créer quelques utilisateurs de test
        await createTestUsers();
        
        // Corriger les messages
        const allUsers = await firestoreUtils.getAll(COLLECTIONS.USERS);
        await fixMessagesWithCorrectUsers(allUsers);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
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
        }
    ];
    
    for (const userData of testUsers) {
        try {
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

async function fixMessagesWithCorrectUsers(users) {
    console.log('🔧 Correction des messages avec les utilisateurs existants...');
    
    try {
        // Supprimer tous les anciens messages
        console.log('🗑️ Suppression des anciens messages...');
        const oldMessages = await firestoreUtils.getAll(COLLECTIONS.MESSAGES);
        for (const message of oldMessages) {
            await firestoreUtils.delete(COLLECTIONS.MESSAGES, message.id);
        }
        console.log(`✅ ${oldMessages.length} anciens messages supprimés`);
        
        // Trouver l'utilisateur admin
        const adminUser = users.find(user => user.id === 'U7h4HU5OfB9KTeY341NE') || users.find(user => user.type === 'admin');
        if (!adminUser) {
            console.log('❌ Aucun utilisateur admin trouvé');
            return;
        }
        
        console.log(`👤 Utilisation de l'utilisateur admin: ${adminUser.id} (${adminUser.profile?.firstName} ${adminUser.profile?.lastName})`);
        
        // Créer les messages avec les utilisateurs existants
        const correctedMessages = [
            // Conversation 1 - Appartement T3 Paris 15ème
            {
                id: 'MSG001',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'TENANT001',
                recipientId: adminUser.id,
                message: 'Bonjour, j\'ai une question concernant le loyer de l\'appartement.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                readBy: ['TENANT001'],
                senderName: 'Marie Dubois',
                recipientName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`
            },
            {
                id: 'MSG002',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: adminUser.id,
                recipientId: 'TENANT001',
                message: 'Bonjour ! Bien sûr, quelle est votre question ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
                readBy: [adminUser.id, 'TENANT001'],
                senderName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`,
                recipientName: 'Marie Dubois'
            },
            {
                id: 'MSG003',
                propertyId: 'PROP001',
                propertyName: 'Appartement T3 - Paris 15ème',
                senderId: 'TENANT001',
                recipientId: adminUser.id,
                message: 'Le loyer est-il négociable ? J\'ai un budget un peu serré.',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                readBy: ['TENANT001'],
                senderName: 'Marie Dubois',
                recipientName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`
            },
            
            // Conversation 2 - Studio Lyon 2ème
            {
                id: 'MSG004',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: 'TENANT002',
                recipientId: adminUser.id,
                message: 'Bonjour, je suis intéressé par votre studio à Lyon.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                readBy: ['TENANT002', adminUser.id],
                senderName: 'Pierre Martin',
                recipientName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`
            },
            {
                id: 'MSG005',
                propertyId: 'PROP002',
                propertyName: 'Studio - Lyon 2ème',
                senderId: adminUser.id,
                recipientId: 'TENANT002',
                message: 'Parfait ! Quand souhaitez-vous visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
                readBy: [adminUser.id, 'TENANT002'],
                senderName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`,
                recipientName: 'Pierre Martin'
            },
            
            // Conversation 3 - Maison T4 Marseille
            {
                id: 'MSG006',
                propertyId: 'PROP003',
                propertyName: 'Maison T4 - Marseille',
                senderId: 'TENANT003',
                recipientId: adminUser.id,
                message: 'Bonjour, pouvez-vous me confirmer la date de visite pour la maison ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                readBy: ['TENANT003'],
                senderName: 'Sophie Leroy',
                recipientName: `${adminUser.profile?.firstName} ${adminUser.profile?.lastName}`
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
        
        console.log('🎉 Correction des messages terminée avec succès !');
        
        // Afficher un résumé
        console.log('\n📊 Résumé des conversations corrigées :');
        const conversations = {};
        correctedMessages.forEach(msg => {
            if (!conversations[msg.propertyId]) {
                conversations[msg.propertyId] = {
                    propertyName: msg.propertyName,
                    messageCount: 0,
                    participants: new Set()
                };
            }
            conversations[msg.propertyId].messageCount++;
            conversations[msg.propertyId].participants.add(msg.senderId);
            conversations[msg.propertyId].participants.add(msg.recipientId);
        });
        
        Object.entries(conversations).forEach(([propertyId, data]) => {
            console.log(`  - ${data.propertyName}: ${data.messageCount} messages`);
            console.log(`    Participants: ${Array.from(data.participants).join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la correction des messages:', error);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    checkUsersAndFixMessages()
        .then(() => {
            console.log('✅ Script terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { checkUsersAndFixMessages };
