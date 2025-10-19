const express = require('express');
const router = express.Router();
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const dataService = require('../services/dataService');

// Page principale du chat
router.get('/', async (req, res) => {
    try {
        //On recupere le user
        const user = await dataService.getUser(req.session.user.id);
        // Récupérer les conversations de l'utilisateur connecté
        const conversations = await getConversations(req.session.user.id);
        
        // Récupérer les paramètres de redirection depuis la page de détails
        const propertyId = req.query.propertyId;
        const preMessage = req.query.message;
        
        console.log('🎨 Rendu de la vue chat avec conversations:', conversations.length);
        if (propertyId) {
            console.log('📝 Redirection depuis la page de détails:', { propertyId, preMessage });
        }

        // Récupérer les informations de la propriété pour la redirection
        let propertyInfo = null;
        if (propertyId) {
            try {
                const allProperties = await firestoreUtils.getAll('properties');
                const property = allProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
                if (property) {
                    // Récupérer les informations du propriétaire
                    const owner = await firestoreUtils.getById('users', property.ownerId);
                    propertyInfo = {
                        id: property.id,
                        name: property.name || `Propriété ${property.id}`,
                        ownerId: property.ownerId,
                        ownerName: owner ? (owner.name || owner.firstName + ' ' + owner.lastName || 'Propriétaire') : 'Propriétaire'
                    };
                    console.log('🏠 Informations de la propriété pour redirection:', propertyInfo);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des infos de propriété:', error);
            }
        }
        
        res.render('chat', {
            title: 'Chat',
            currentPage: 'chat',
            pageTitle: 'Chat',
            conversations: conversations || [],
            currentUserId: req.session.user.id,
            redirectPropertyId: propertyId,
            preMessage: preMessage,
            redirectPropertyInfo: propertyInfo,
            user: {
                name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Utilisateur',
                role: req.session.user ? req.session.user.role : 'Propriétaire'
            }
        });
    } catch (error) {
        console.error('Erreur lors du chargement du chat:', error);
        res.render('chat', {
            title: 'Chat',
            currentPage: 'chat',
            pageTitle: 'Chat',
            conversations: [],
            currentUserId: req.session.user.id,
            error: 'Erreur lors du chargement des conversations',
            user: {
                name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Utilisateur',
                role: req.session.user ? req.session.user.role : 'Propriétaire'
            }
        });
    }
});

// API pour récupérer les messages d'une conversation
router.get('/api/conversation/:propertyId', async (req, res) => {
    try {
        const { propertyId } = req.params;
        const messages = await getMessagesForProperty(propertyId, req.session.user.id);
        
        res.json({
            success: true,
            messages: messages
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des messages'
        });
    }
});

// API pour envoyer un message
router.post('/api/send-message', async (req, res) => {
    try {
        const { propertyId, message, recipientId } = req.body;
        const senderId = req.session.user.id;
        
        console.log('📤 Envoi de message:', {
            propertyId,
            senderId,
            recipientId,
            message: message.substring(0, 50) + '...'
        });
        
        const newMessage = await sendMessage({
            propertyId,
            senderId,
            recipientId,
            message,
            timestamp: new Date()
        });
        
        console.log('✅ Message envoyé avec succès:', newMessage.id);
        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du message:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi du message'
        });
    }
});

// API pour marquer les messages comme lus
router.post('/api/mark-as-read', async (req, res) => {
    try {
        const { propertyId } = req.body;
        const userId = req.session.user.id;
        
        await markMessagesAsRead(propertyId, userId);
        
        res.json({
            success: true
        });
    } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du marquage des messages'
        });
    }
});

// API pour récupérer le nombre de messages non lus
router.get('/api/unread-count', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const unreadCount = await getUnreadMessagesCount(userId);
        
        res.json({
            success: true,
            unreadCount: unreadCount
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de messages non lus:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération du nombre de messages non lus'
        });
    }
});

// API pour ajouter un locataire à une propriété
router.post('/api/add-tenant', async (req, res) => {
    try {
        const { propertyId, tenantId } = req.body;
        const ownerId = req.session.user.id;
        
        console.log('🏠 Ajout de locataire:', { propertyId, tenantId, ownerId });
        
        // Vérifier que l'utilisateur est bien le propriétaire
        const property = await getPropertyById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Propriété non trouvée'
            });
        }
        
        if (property.ownerId !== ownerId) {
            return res.status(403).json({
                success: false,
                error: 'Vous n\'êtes pas le propriétaire de cette propriété'
            });
        }
        
        // Vérifier que la propriété n'est pas déjà louée
        if (property.status === 'rented') {
            return res.status(400).json({
                success: false,
                error: 'Cette propriété est déjà louée'
            });
        }
        
        // Ajouter le locataire à la propriété
        await addTenantToProperty(propertyId, tenantId);
        
        console.log('✅ Locataire ajouté avec succès');

        //On recupere le nombre de propriétés louées
        const propertiesCount = await dataService.getTenants(ownerId);
        //On recupere le plan de facturation
        const user = await dataService.getUser(ownerId);
        //On enregistre dans user_billing
        const userBilling = await dataService.getPlanChange(ownerId);
        userBilling.facturations.push({
            planId: user.facturation?.planId,
            propertyCount: propertiesCount, 
            date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
        });
        await dataService.updateUserBillingPlan2(ownerId, userBilling);
        //On verifi si user_automations[userId].automations.email-tenant-confirmation.isActive est true
        const userAutomations = await dataService.getUserAutomations(ownerId);
        if (userAutomations.automations['email-tenant-confirmation'].isActive) {
            //On recupere l email du locataire
            const tenant = await dataService.getUser(tenantId);
            //On envoi un email de confirmation de locataire
            const msg = 'Vous etes désormais locataire de la propriété ' + property.name + '. Bienvenue dans votre nouvelle maison ! Si vous avez des questions ou des preoccupations, n\'hesitez pas à nous contacter via le chat de l\'application BikoRent.';
            await sendEmail(tenant.profile.email, 'Confirmation de locataire', '/dashboard', msg);
        }
        
        res.json({
            success: true,
            message: 'Locataire ajouté avec succès',
            propertyName: property.name || property.title
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout du locataire:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout du locataire'
        });
    }
});

// Fonctions utilitaires pour les messages

// Fonction pour enrichir les conversations avec les noms des utilisateurs
async function enrichConversationsWithUserNames(conversations) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return conversations;
        }
        
        // Récupérer tous les utilisateurs
        const allUsers = await firestoreUtils.getAll('users');
        const userMap = new Map();
        
        // Créer une map des utilisateurs par ID
        allUsers.forEach(user => {
            userMap.set(user.id, user);
        });
        
        // Enrichir chaque conversation avec le nom de l'utilisateur
        return conversations.map(conv => {
            const user = userMap.get(conv.senderId);
            if (user) {
                // Prioriser le nom complet, puis firstName + lastName, puis email
                if (user.profile.firstName && user.profile.lastName) {
                    conv.senderName = `${user.profile.firstName} ${user.profile.lastName}`;
                } else if (user.profile.firstName) {
                    conv.senderName = user.profile.firstName;
                } else {
                    conv.senderName = user.profile.email || `Utilisateur ${conv.senderId}`;
                }
            } else {
                conv.senderName = `Utilisateur ${conv.senderId}`;
            }
            return conv;
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des noms d\'utilisateurs:', error);
        return conversations;
    }
}

// Fonction pour enrichir les conversations avec les noms des propriétés
async function enrichConversationsWithPropertyNames(conversations) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return conversations;
        }
        
        // Récupérer toutes les propriétés
        const allProperties = await firestoreUtils.getAll('properties');
        const propertyMap = new Map();
        
        // Créer une map des propriétés par ID
        allProperties.forEach(property => {
            propertyMap.set(property.id, property);
        });
        
        // Enrichir chaque conversation avec le nom de la propriété
        return conversations.map(conv => {
            const property = propertyMap.get(conv.propertyId);
            if (property) {
                // Prioriser le nom, puis l'adresse, puis un nom générique
                if (property.name) {
                    conv.propertyName = property.name;
                } else if (property.address) {
                    conv.propertyName = property.address;
                } else {
                    conv.propertyName = `Propriété ${conv.propertyId}`;
                }
            } else {
                conv.propertyName = `Propriété ${conv.propertyId}`;
            }
            return conv;
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des noms de propriétés:', error);
        return conversations;
    }
}

// Récupérer les conversations de l'utilisateur
async function getConversations(userId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return getMockConversations();
        }
        
        // Récupérer tous les messages (sans requête complexe pour éviter les erreurs d'index)
        const allMessages = await firestoreUtils.getAll('messages');
        const properties = await firestoreUtils.getAll('properties');
        
        // Filtrer les messages où l'utilisateur est impliqué
        const userMessages = allMessages.filter(message => 
            message.senderId === userId || message.recipientId === userId
        );
        
        console.log(`📊 Messages trouvés pour l'utilisateur ${userId}: ${userMessages.length}`);
        console.log('📋 Détails des messages:', userMessages.map(m => ({ id: m.id, senderId: m.senderId, recipientId: m.recipientId, message: m.message.substring(0, 50) + '...' })));
        
        // Grouper par sender (expéditeur) pour créer des conversations individuelles
        const conversations = {};
        
        for (const message of userMessages) {
            // Déterminer l'autre participant (pas l'utilisateur actuel)
            const otherParticipant = message.senderId === userId ? message.recipientId : message.senderId;
            const conversationKey = `${otherParticipant}_${message.propertyId}`;
            
            if (!conversations[conversationKey]) {
                conversations[conversationKey] = {
                    senderId: otherParticipant,
                    senderName: `Utilisateur ${otherParticipant}`, // On récupérera le vrai nom plus tard
                    propertyId: message.propertyId,
                    propertyName: message.propertyName || `Propriété ${message.propertyId}`,
                    messages: [],
                    unreadCount: 0
                };
            }
            
            conversations[conversationKey].messages.push(message);
            
            // Compter les messages non lus (messages reçus par l'utilisateur actuel)
            if (message.recipientId === userId && !message.readBy?.includes(userId)) {
                conversations[conversationKey].unreadCount++;
            }
        }
        
        // Traiter chaque conversation
        const conversationMap = new Map();
        //On recupere toute les proprietes
        
        for (const [conversationKey, conv] of Object.entries(conversations)) {
            // Trier les messages par date
            conv.messages.sort((a, b) => {
                const timeA = a.timestamp && a.timestamp.seconds ? 
                    new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
                const timeB = b.timestamp && b.timestamp.seconds ? 
                    new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
                return timeB - timeA;
            });
            
            const lastMessage = conv.messages[0];
            const property = properties.find(p => p.id === conv.propertyId);
            
            conversationMap.set(conversationKey, {
                senderId: conv.senderId,
                senderName: conv.senderName,
                propertyId: conv.propertyId,
                propertyName: conv.propertyName,
                lastMessage: lastMessage.message,
                lastMessageTime: lastMessage.timestamp,
                unreadCount: conv.unreadCount,
                isPropertyOwner: (property.ownerId === userId)? true : false,
                propertyStatus: property.status,
                participants: [lastMessage.senderId, lastMessage.recipientId]
            });
        }
        
        // Trier par date du dernier message
        const finalConversations = Array.from(conversationMap.values());
        finalConversations.sort((a, b) => {
            const timeA = a.lastMessageTime && a.lastMessageTime.seconds ? 
                new Date(a.lastMessageTime.seconds * 1000) : new Date(a.lastMessageTime);
            const timeB = b.lastMessageTime && b.lastMessageTime.seconds ? 
                new Date(b.lastMessageTime.seconds * 1000) : new Date(b.lastMessageTime);
            return timeB - timeA;
        });
        
        // Récupérer les noms des utilisateurs et des propriétés
        const finalConversationsWithNames = await enrichConversationsWithUserNames(finalConversations);
        
        // Enrichir avec les noms des propriétés
        const finalConversationsWithPropertyNames = await enrichConversationsWithPropertyNames(finalConversationsWithNames);
        
        console.log('📋 Conversations finales:', finalConversationsWithNames.map(c => ({
            senderName: c.senderName,
            propertyName: c.propertyName,
            lastMessage: c.lastMessage.substring(0, 50) + '...',
            unreadCount: c.unreadCount
        })));
        
        return finalConversationsWithPropertyNames;
    } catch (error) {
        console.error('Erreur lors de la récupération des conversations:', error);
        return getMockConversations();
    }
}

// Récupérer les messages d'une propriété
async function getMessagesForProperty(propertyId, userId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return getMockMessages(propertyId);
        }
        
        // Récupérer tous les messages et filtrer côté client pour éviter les erreurs d'index
        const allMessages = await firestoreUtils.getAll('messages');
        const propertyMessages = allMessages
            .filter(message => message.propertyId === propertyId)
            .sort((a, b) => {
                // Gérer les timestamps Firebase
                const timeA = a.timestamp && a.timestamp.seconds ? 
                    new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
                const timeB = b.timestamp && b.timestamp.seconds ? 
                    new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
                return timeA - timeB;
            });
        
        return propertyMessages;
    } catch (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return getMockMessages(propertyId);
    }
}

// Envoyer un message
async function sendMessage(messageData) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return { id: Date.now(), ...messageData };
        }
        
        const message = await firestoreUtils.add(COLLECTIONS.MESSAGES, {
            ...messageData,
            readBy: [messageData.senderId],
            participants: [messageData.senderId, messageData.recipientId]
        });
        
        return message;
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        throw error;
    }
}

// Marquer les messages comme lus
async function markMessagesAsRead(propertyId, userId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return;
        }
        
        // Récupérer tous les messages et filtrer côté client
        const allMessages = await firestoreUtils.getAll('messages');
        const propertyMessages = allMessages.filter(message => 
            message.propertyId === propertyId && 
            message.senderId !== userId
        );
        
        for (const message of propertyMessages) {
            if (!message.readBy?.includes(userId)) {
                const updatedReadBy = [...(message.readBy || []), userId];
                await firestoreUtils.update(COLLECTIONS.MESSAGES, message.id, {
                    readBy: updatedReadBy
                });
            }
        }
    } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
        throw error;
    }
}

// Récupérer le nombre de messages non lus
async function getUnreadMessagesCount(userId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return 3; // Nombre mock
        }
        
        // Récupérer tous les messages et filtrer côté client
        const allMessages = await firestoreUtils.getAll('messages');
        const unreadMessages = allMessages.filter(message => 
            (message.senderId === userId || message.recipientId === userId) &&
            message.senderId !== userId &&
            !message.readBy?.includes(userId)
        );
        
        return unreadMessages.length;
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de messages non lus:', error);
        return 0;
    }
}

// Données mock pour les tests
function getMockConversations() {
    return [
        {
            senderId: 'TENANT001',
            senderName: 'Marie Dubois',
            propertyId: 'PROP001',
            propertyName: 'Appartement T3 - Paris 15ème',
            lastMessage: 'Bonjour, j\'ai une question concernant le loyer...',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            unreadCount: 2,
            participants: ['U7h4HU5OfB9KTeY341NE', 'TENANT001']
        },
        {
            senderId: 'TENANT002',
            senderName: 'Pierre Martin',
            propertyId: 'PROP002',
            propertyName: 'Studio - Lyon 2ème',
            lastMessage: 'Merci pour votre réponse rapide !',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            unreadCount: 0,
            participants: ['U7h4HU5OfB9KTeY341NE', 'TENANT002']
        },
        {
            senderId: 'TENANT003',
            senderName: 'Sophie Leroy',
            propertyId: 'PROP003',
            propertyName: 'Maison T4 - Marseille',
            lastMessage: 'Pouvez-vous me confirmer la date de visite ?',
            lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            unreadCount: 1,
            participants: ['U7h4HU5OfB9KTeY341NE', 'TENANT003']
        }
    ];
}

function getMockMessages(propertyId) {
    const mockMessages = {
        'PROP001': [
            {
                id: '1',
                propertyId: 'PROP001',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Bonjour, j\'ai une question concernant le loyer de l\'appartement.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                readBy: ['USER001']
            },
            {
                id: '2',
                propertyId: 'PROP001',
                senderId: '341NE',
                recipientId: 'USER001',
                message: 'Bonjour ! Bien sûr, quelle est votre question ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
                readBy: ['341NE', 'USER001']
            },
            {
                id: '3',
                propertyId: 'PROP001',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Le loyer est-il négociable ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                readBy: ['USER001']
            },
            {
                id: '4',
                propertyId: 'PROP001',
                senderId: 'USER001',
                recipientId: '341NE',
                message: 'Et y a-t-il des charges en plus ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 15),
                readBy: ['USER001']
            }
        ],
        'PROP002': [
            {
                id: '5',
                propertyId: 'PROP002',
                senderId: 'USER002',
                recipientId: '341NE',
                message: 'Bonjour, je suis intéressé par votre studio.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                readBy: ['USER002', '341NE']
            },
            {
                id: '6',
                propertyId: 'PROP002',
                senderId: '341NE',
                recipientId: 'USER002',
                message: 'Parfait ! Quand souhaitez-vous visiter ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
                readBy: ['341NE', 'USER002']
            },
            {
                id: '7',
                propertyId: 'PROP002',
                senderId: 'USER002',
                recipientId: '341NE',
                message: 'Merci pour votre réponse rapide !',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                readBy: ['USER002', '341NE']
            }
        ],
        'PROP003': [
            {
                id: '8',
                propertyId: 'PROP003',
                senderId: 'USER003',
                recipientId: '341NE',
                message: 'Bonjour, pouvez-vous me confirmer la date de visite ?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                readBy: ['USER003']
            }
        ]
    };
    
    return mockMessages[propertyId] || [];
}

// Fonction pour récupérer une propriété par son ID
async function getPropertyById(propertyId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return null;
        }
        
        const allProperties = await firestoreUtils.getAll('properties');
        const property = allProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
        
        return property;
    } catch (error) {
        console.error('Erreur lors de la récupération de la propriété:', error);
        return null;
    }
}

// Fonction pour ajouter un locataire à une propriété
async function addTenantToProperty(propertyId, tenantId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Firebase non initialisé, simulation de l\'ajout du locataire');
            return;
        }
        
        // Mettre à jour la propriété avec le locataire
        const today = new Date();
        const year  = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // +1 car getMonth() démarre à 0
        const day   = String(today.getDate()).padStart(2, '0');

        const formatted = `${year}-${month}-${day}`;
        await firestoreUtils.update('properties', propertyId, {
            status: 'rented',
            tenant: {
                entryDate: formatted,
                userId: tenantId
            }
        });
        
        console.log(`✅ Locataire ${tenantId} ajouté à la propriété ${propertyId}`);
        
    } catch (error) {
        console.error('Erreur lors de l\'ajout du locataire à la propriété:', error);
        throw error;
    }
}

module.exports = router;
