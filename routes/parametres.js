const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { firestoreUtils, storageUtils, COLLECTIONS } = require('../config/firebase');
const { getAdmin } = require('../config/firebase-admin');

// Fonction pour uploader une photo de profil vers Firebase Storage
async function uploadProfilePhotoToFirebaseStorage(base64Image, userId) {
    try {
        // Convertir base64 en buffer
        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Déterminer le type MIME
        const mimeType = base64Image.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const fileExtension = mimeType.split('/')[1];
        
        // Créer le nom du fichier
        const fileName = `profiles/${userId}/profile-photo.${fileExtension}`;
        
        // Uploader le fichier en utilisant les utilitaires
        const downloadURL = await storageUtils.uploadFile(fileName, buffer, {
            contentType: mimeType,
            customMetadata: {
                userId: userId,
                type: 'profile-photo',
                uploadedAt: new Date().toISOString()
            }
        });
        
        console.log('✅ Photo de profil uploadée avec succès vers Firebase Storage:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload de la photo de profil vers Firebase Storage:', error);
        throw error;
    }
}

// Fonction pour supprimer une photo de profil de Firebase Storage
async function deleteProfilePhotoFromFirebaseStorage(imageUrl) {
    try {
        if (!imageUrl || !imageUrl.includes('storage.googleapis.com')) {
            console.warn('⚠️ URL de photo de profil invalide pour la suppression:', imageUrl);
            return false;
        }
        
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = imageUrl.split('/');
        const filePath = urlParts.slice(4).join('/'); // profiles/123/profile-photo.jpg
        
        await storageUtils.deleteFile(filePath);
        console.log(`✅ Photo de profil supprimée de Firebase Storage: ${filePath}`);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de la photo de profil:', error);
        return false;
    }
}

// Données de fallback pour les paramètres
const parametresDataFallback = {
    profile: {
        firstName: "Admin",
        lastName: "BikoRentR",
        email: "admin33@bikorent.com",
        phone: "+33 1 23 45 67 89",
        profession: "Gestionnaire immobilier",
        workplace: "BikoRent SAS",
        address: "123 Rue de la Paix, 75001 Paris, France",
        bio: "Gestionnaire immobilier passionné avec plus de 10 ans d'expérience dans la location et la gestion de propriétés.",
        photo: null
    },
    security: {
        twoFactorAuth: false,
        suspiciousLogin: true
    },
    notifications: {
        emailPayments: false,
        emailOverdue: false,
        emailNewTenants: false,
        pushAlerts: false,
        pushReminders: false,
        reportFrequency: "monthly"
    },
    preferences: {
        language: "fr",
        timezone: "Europe/Paris",
        darkMode: false,
        dateFormat: "DD/MM/YYYY",
        currency: "EUR"
    },
    billing: {
        plan: "Premium",
        price: 29.99,
        currency: "EUR",
        paymentMethods: [
            {
                id: 1,
                type: "visa",
                last4: "4242",
                expiry: "12/25",
                isDefault: true
            }
        ],
        billingHistory: [
            {
                date: "01/03/2024",
                description: "Plan Premium - Mars 2024",
                amount: 29.99,
                status: "paid"
            },
            {
                date: "01/02/2024",
                description: "Plan Premium - Février 2024",
                amount: 29.99,
                status: "paid"
            },
            {
                date: "01/01/2024",
                description: "Plan Premium - Janvier 2024",
                amount: 29.99,
                status: "paid"
            }
        ]
    },
    integrations: [
        {
            id: "google-calendar",
            name: "Google Calendar",
            description: "Synchronisez vos événements de location",
            icon: "G",
            color: "#4285f4",
            connected: true
        },
        {
            id: "whatsapp",
            name: "WhatsApp Business",
            description: "Envoyez des messages automatiques aux locataires",
            icon: "W",
            color: "#00c851",
            connected: false
        },
        {
            id: "quickbooks",
            name: "QuickBooks",
            description: "Synchronisez vos données comptables",
            icon: "Q",
            color: "#0073aa",
            connected: false
        },
        {
            id: "zapier",
            name: "Zapier",
            description: "Automatisez vos workflows",
            icon: "Z",
            color: "#ff6b35",
            connected: false
        }
    ]
};

// Page des paramètres
router.get('/', async (req, res) => {
    try {
        console.log('🔄 Récupération des données des paramètres depuis la base de données...');
        
        // Récupérer les données depuis la base de données via le service
        const parametresData = await dataService.getParametresData(req.session.user.id);
        const userDu = await dataService.getUserDu(req.session.user.id);
        console.log('🔍 Montant dû:', userDu);
        if (parametresData) {
            console.log('✅ Données des paramètres récupérées avec succès depuis la base de données');
        } else {
            console.log('⚠️ Aucune donnée trouvée, utilisation des données de fallback');
        }

        
        // Utiliser les données récupérées ou les données de fallback
        const finalData = parametresData || parametresDataFallback;
        
        console.log('🎯 Données finales envoyées au template:', {
            hasData: !!parametresData,
            usingFallback: !parametresData,
            photo: finalData.profile?.photo,
            hasPhoto: !!finalData.profile?.photo,
            notifications: finalData.notifications
        });
        
        res.render('parametres', {
            title: 'Paramètres du Compte - BikoRent',
            pageTitle: 'Paramètres',
            currentPage: 'parametres',
            user: {
                name: finalData.profile.firstName + ' ' + finalData.profile.lastName,
                role: 'Propriétaire'
            },
            parametresData: finalData,
            paymentOverdue: res.locals.paymentOverdue
        });
    } catch (error) {
        console.error('❌ Erreur lors du rendu de la page paramètres:', error);
        
        // En cas d'erreur, utiliser les données de fallback
        res.render('parametres', {
            title: 'Paramètres du Compte - BikoRent',
            pageTitle: 'Paramètres',
            currentPage: 'parametres',
            user: {
                name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Admin',
                role: req.session.user ? req.session.user.role : 'Propriétaire'
            },
            parametresData: parametresDataFallback,
            paymentOverdue: res.locals.paymentOverdue
        });
    }
});

// Route pour mettre à jour le profil utilisateur
router.post('/profile', async (req, res) => {
    try {
        console.log('🔄 Mise à jour du profil utilisateur...');
        console.log('Données reçues:', req.body);
        
        const {
            firstName,
            lastName,
            email,
            phone,
            profession,
            workplace,
            address,
            bio
        } = req.body;
        
        // Validation des données requises
        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Les champs prénom, nom et email sont obligatoires'
            });
        }
        
        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Format d\'email invalide'
            });
        }
        
        // Récupérer l'utilisateur actuel (pour l'instant, on utilise un ID fixe)
        // Dans une vraie application, on récupérerait l'ID depuis la session/auth
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        // Préparer les données de mise à jour
        const updateData = {
            'profile.firstName': firstName,
            'profile.lastName': lastName,
            'profile.email': email,
            'profile.phone': phone || '',
            'profile.profession': profession || '',
            'profile.workplace': workplace || '',
            'profile.address': address || '',
            'profile.bio': bio || '',
            updatedAt: new Date()
        };
        
        // Mettre à jour l'utilisateur dans la base de données
        const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
        if (updatedUser) {
            console.log('✅ Profil utilisateur mis à jour avec succès');
            res.json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: {
                    profile: {
                        firstName: updatedUser.profile?.firstName || firstName,
                        lastName: updatedUser.profile?.lastName || lastName,
                        email: updatedUser.profile?.email || email,
                        phone: updatedUser.profile?.phone || phone,
                        profession: updatedUser.profile?.profession || profession,
                        workplace: updatedUser.profile?.workplace || workplace,
                        address: updatedUser.profile?.address || address,
                        bio: updatedUser.profile?.bio || bio
                    }
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour du profil');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du profil'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour uploader la photo de profil
router.post('/profile/photo', async (req, res) => {
    try {
        console.log('🔄 Upload de la photo de profil...');
        
        const { photo } = req.body;
        
        // Validation
        if (!photo) {
            return res.status(400).json({
                success: false,
                message: 'Aucune photo fournie'
            });
        }
        
        // Vérifier que c'est une image base64 valide
        if (!photo.startsWith('data:image/')) {
            return res.status(400).json({
                success: false,
                message: 'Format d\'image invalide'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        console.log('🔍 Tentative de mise à jour pour l\'utilisateur ID:', currentUserId);
        
        // Récupérer l'utilisateur pour vérifier s'il a déjà une photo
        const currentUser = await dataService.getUserById(currentUserId);
        const currentPhotoUrl = currentUser?.profile?.photo;
        
        console.log('🔍 Utilisateur actuel trouvé:', {
            userId: currentUserId,
            hasUser: !!currentUser,
            hasProfile: !!currentUser?.profile,
            currentPhotoUrl: currentPhotoUrl,
            fullUser: currentUser
        });
        
        if (!currentUser) {
            console.error('❌ Utilisateur non trouvé avec l\'ID:', currentUserId);
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Supprimer l'ancienne photo si elle existe
        if (currentPhotoUrl) {
            console.log('🗑️ Suppression de l\'ancienne photo de profil...');
            await deleteProfilePhotoFromFirebaseStorage(currentPhotoUrl);
        }
        
        // Uploader la nouvelle photo
        console.log('📤 Upload de la nouvelle photo de profil...');
        const newPhotoUrl = await uploadProfilePhotoToFirebaseStorage(photo, currentUserId);
        
        // Mettre à jour l'utilisateur avec la nouvelle URL de photo
        // Pour Firebase, on doit utiliser une approche différente pour les champs imbriqués
        let updatedUser;
        
        if (currentUser) {
            // Mettre à jour l'objet utilisateur existant
            const updatedUserData = {
                ...currentUser,
                profile: {
                    ...currentUser.profile,
                    photo: newPhotoUrl
                },
                updatedAt: new Date()
            };
            
            console.log('📝 Données de mise à jour (utilisateur existant):', updatedUserData);
            updatedUser = await dataService.updateUser(currentUserId, updatedUserData);
        } else {
            // Si l'utilisateur n'existe pas, créer un objet de mise à jour simple
            const updateData = {
                profile: {
                    photo: newPhotoUrl
                },
                updatedAt: new Date()
            };
            
            console.log('📝 Données de mise à jour (nouvel utilisateur):', updateData);
            updatedUser = await dataService.updateUser(currentUserId, updateData);
        }
        
        console.log('🔄 Résultat de la mise à jour:', {
            success: !!updatedUser,
            updatedUser: updatedUser
        });
        
        if (updatedUser) {
            console.log('✅ Photo de profil mise à jour avec succès');
            console.log('🔍 Utilisateur mis à jour:', {
                userId: updatedUser.id,
                hasProfile: !!updatedUser.profile,
                newPhotoUrl: updatedUser.profile?.photo
            });
            
            res.json({
                success: true,
                message: 'Photo de profil mise à jour avec succès',
                data: {
                    photoUrl: newPhotoUrl
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour de la photo de profil');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la photo de profil'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload de la photo de profil:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour mettre à jour le mot de passe
router.post('/password', async (req, res) => {
    try {
        console.log('🔐 Mise à jour du mot de passe demandée');
        
        const { currentPassword, newPassword, confirmPassword } = req.body;
        
        // Validation des données
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Les mots de passe ne correspondent pas'
            });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Le mot de passe doit contenir au moins 8 caractères'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // TODO: Vérifier le mot de passe actuel (à implémenter plus tard)
        // Pour l'instant, on accepte tous les mots de passe actuels
        
        // Mettre à jour le mot de passe
        const updateData = {
            password: newPassword, // TODO: Hasher le mot de passe
            updatedAt: new Date()
        };
        
        //const updatedUser = await dataService.updateUser(currentUserId, updateData);
        //On verifi que le mot de passe actuel est correct
        /*const user = await admin.auth().getUserByEmail(currentUser.email);
        if (user.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }*/
        //On met a jour le mot de passe dans Firebase Auth
        const admin = getAdmin();
        await admin.auth().updateUser(currentUserId, { password: newPassword });
        
        console.log('✅ Mot de passe mis à jour avec succès');
        res.json({
            success: true,
            message: 'Mot de passe mis à jour avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du mot de passe:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du mot de passe'
        });
    }
});

// Route pour déconnecter tous les appareils
router.post('/logout-all', async (req, res) => {
    try {
        console.log('🚪 Déconnexion de tous les appareils demandée');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // TODO: Implémenter la logique de suppression des sessions
        // Pour l'instant, on simule la suppression des sessions actives
        console.log('🗑️ Suppression des sessions actives pour l\'utilisateur:', currentUserId);
        
        // Simuler la suppression des sessions (à implémenter plus tard)
        // - Supprimer les tokens JWT actifs
        // - Invalider les sessions en base de données
        // - Notifier les autres appareils de la déconnexion
        
        console.log('✅ Toutes les sessions ont été supprimées avec succès');
        res.json({
            success: true,
            message: 'Tous les appareils ont été déconnectés avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion de tous les appareils:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion de tous les appareils'
        });
    }
});

// Route pour mettre à jour les notifications
router.post('/notifications', async (req, res) => {
    try {
        console.log('🔔 Mise à jour des notifications demandée');
        
        const { notifications } = req.body;
        
        // Validation des données
        if (!notifications || typeof notifications !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Données de notifications invalides'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Mettre à jour les notifications
        const updateData = {
            notifications: {
                emailPayments: notifications.emailPayments || false,
                emailOverdue: false,// notifications.emailOverdue || false,
                emailNewTenants: false,// notifications.emailNewTenants || false,
                pushAlerts: false,// notifications.pushAlerts || false,
                pushReminders: false,// notifications.pushReminders || false,
                reportFrequency: "monthly"// notifications.reportFrequency || "monthly"
            },
            updatedAt: new Date()
        };
        
        const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
        if (updatedUser) {
            console.log('✅ Notifications mises à jour avec succès');
            res.json({
                success: true,
                message: 'Préférences de notifications mises à jour avec succès',
                data: {
                    notifications: updateData.notifications
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour des notifications');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour des notifications'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des notifications'
        });
    }
});


// Route pour mettre à jour les préférences
router.post('/preferences', async (req, res) => {
    try {
        console.log('⚙️ Mise à jour des préférences demandée');
        
        const {
            language,
            timezone,
            darkMode,
            dateFormat,
            currency
        } = req.body;
        
        // Validation des données
        if (!language || !timezone || !dateFormat || !currency) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Mettre à jour les préférences
        const updateData = {
            preferences: {
                language: language,
                timezone: timezone,
                darkMode: Boolean(darkMode),
                dateFormat: dateFormat,
                currency: currency
            },
            updatedAt: new Date()
        };
        
        console.log('📝 Données de préférences à mettre à jour:', updateData.preferences);
        
        //const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
        if (updatedUser) {
            console.log('✅ Préférences mises à jour avec succès');
            res.json({
                success: true,
                message: 'Préférences mises à jour avec succès',
                data: {
                    preferences: updateData.preferences
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour des préférences');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour des préférences'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des préférences:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des préférences'
        });
    }
});

// Route pour gérer les intégrations (connexion/déconnexion)
router.post('/integrations/:integrationId/toggle', async (req, res) => {
    try {
        console.log('🔗 Gestion de l\'intégration demandée');
        
        const { integrationId } = req.params;
        const { action } = req.body; // 'connect' ou 'disconnect'
        
        // Validation des données
        if (!integrationId || !action) {
            return res.status(400).json({
                success: false,
                message: 'ID d\'intégration et action requis'
            });
        }
        
        if (!['connect', 'disconnect'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action invalide. Utilisez "connect" ou "disconnect"'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Initialiser l'objet integration s'il n'existe pas
        if (!currentUser.integration) {
            currentUser.integration = {};
        }
        
        // Mettre à jour l'état de l'intégration
        const isConnected = action === 'connect';
        currentUser.integration[integrationId] = {
            connected: isConnected,
            connectedAt: isConnected ? new Date() : null,
            disconnectedAt: !isConnected ? new Date() : null,
            lastUpdated: new Date()
        };
        if(!isConnected && integrationId === 'automations'){
            //on desactive toutes les integrations
            //On recupere les negration du user dans user_automations
            const automations = await dataService.getUserAutomations(currentUserId);
            for(const key in automations.automations){
                automations.automations[key].isActive = false;
            }
            await dataService.updateUserAutomations(currentUserId, automations);
        }
        
        
        
        // Préparer les données de mise à jour
        const updateData = {
            integration: currentUser.integration,
            updatedAt: new Date()
        };
        
        console.log('📝 Mise à jour de l\'intégration:', {
            integrationId,
            action,
            isConnected,
            updateData
        });
        //On recupere le plan de facturation dans la base de données
        const plan = await dataService.getUserBillingPlan(currentUserId);
        console.log('Plan de facturation:', plan);
        if(!plan.facturation.planId.includes('enterprise')){
            res.json({
                success: true,
                message: `Intégration non disponnible pour votre plan de facturation`,
                data: {
                    integrationId,
                    connected: false,
                    integration: currentUser.integration
                }
            });
            return;
        }
        // Mettre à jour l'utilisateur dans la base de données
        const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
        
        if (updatedUser) {
            console.log('✅ Intégration mise à jour avec succès');
            res.json({
                success: true,
                message: `Intégration ${isConnected ? 'connectée' : 'déconnectée'} avec succès`,
                data: {
                    integrationId,
                    connected: isConnected,
                    integration: updatedUser.integration
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour de l\'intégration');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'intégration'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la gestion de l\'intégration:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour récupérer l'état des intégrations
router.get('/integrations', async (req, res) => {
    try {
        console.log('🔗 Récupération de l\'état des intégrations');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Retourner l'état des intégrations
        res.json({
            success: true,
            data: {
                integration: currentUser.integration || {}
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des intégrations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour récupérer tous les plans de facturation
router.get('/billing/plans', async (req, res) => {
    try {
        console.log('💳 Récupération des plans de facturation...');
        
        const billingPlans = await dataService.getBillingPlans();
        
        res.json({
            success: true,
            data: {
                plans: billingPlans
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des plans de facturation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour changer le plan de facturation d'un utilisateur
router.post('/billing/change-plan', async (req, res) => {
    try {
        console.log('💳 Changement de plan de facturation demandé');
        
        const { planId } = req.body;
        
        // Validation des données
        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'ID du plan requis'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Vérifier que le plan existe
        const newPlan = await dataService.getBillingPlanById(planId);
        if (!newPlan) {
            return res.status(404).json({
                success: false,
                message: 'Plan de facturation non trouvé'
            });
        }
        
        // Vérifier si l'utilisateur a déjà ce plan
        if (currentUser.facturation?.planId === planId) {
            return res.status(400).json({
                success: false,
                message: 'Vous avez déjà ce plan de facturation'
            });
        }

        //On recupere le dernier changement de plan
        const planChange = await dataService.getPlanChange(currentUserId);
        if(planChange.facturations?.length > 0){
            const lastFacturation = planChange.facturations[planChange.facturations.length - 1];
            const isDecrement = dataService.orderPlan(lastFacturation.planId, planId);
            if(isDecrement){
                const lastdate = new Date(lastFacturation.date);
                //On calcule le nombre de jours entre la date du dernier changement de plan et la date actuelle
                const daysDiff = fullDaysBetween(lastdate, new Date());
                console.log('lastFacturation.date', lastFacturation.date);
                console.log('isDecrement', isDecrement);
                
                console.log('daysDiff', daysDiff, 'lastdate', lastdate, 'new Date()', new Date());
                
                if(daysDiff < 30){
                    return res.status(400).json({
                        success: false,
                        message: 'Vous ne pouvez pas réduire votre plan de facturation avant 30 jours'
                    });
                }
                if(currentUser.facturation?.planId === 'enterprise'){
                    //On desactive les automatisations
                    const user_automations = await dataService.getUserAutomations(currentUserId);
                    for(const key in user_automations.automations){
                        user_automations.automations[key].isActive = false;
                    }
                    await dataService.updateUserAutomations(currentUserId, user_automations);

                    //On desactive les intégrations dans users
                    for(const key in currentUser.integration){
                        currentUser.integration[key].connected = false;
                    }
                    await dataService.updateUser(currentUserId, {
                        integration: currentUser.integration,
                        updatedAt: new Date()
                    });
                }
            }
        }
        
        // Mettre à jour le plan de facturation
        const updatedUser = await dataService.updateUserBillingPlan(currentUserId, planId);
        //On recupere le nombre de propriétés louées
        const propertiesCount = await dataService.getTenants(currentUserId);
        //On enregistre dans user_billing
        const userBilling = await dataService.getPlanChange(currentUserId);
        userBilling.facturations.push({
            planId: planId,
            propertyCount: propertiesCount.length,
            date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
        });
        await dataService.updateUserBillingPlan2(currentUserId, userBilling);
        
        if (updatedUser) {
            console.log('✅ Plan de facturation mis à jour avec succès');
            res.json({
                success: true,
                message: `Plan changé vers ${newPlan.name} avec succès`,
                data: {
                    plan: {
                        id: newPlan.id,
                        name: newPlan.name,
                        description: newPlan.description,
                        pricePerProperty: newPlan.pricePerProperty,
                        currency: newPlan.currency,
                        maxProperties: newPlan.maxProperties,
                        features: newPlan.features
                    },
                    userBilling: updatedUser.facturation
                }
            });
        } else {
            console.error('❌ Échec de la mise à jour du plan de facturation');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du plan de facturation'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du changement de plan de facturation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

function fullDaysBetween(date1, date2) {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
// Route pour récupérer les détails de facturation de l'utilisateur
router.get('/billing/details', async (req, res) => {
    try {
        console.log('💳 Récupération des détails de facturation...');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        const currentUser = await dataService.getUserById(currentUserId);
        
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // Récupérer le plan actuel
        const currentPlan = await dataService.getBillingPlanById(currentUser.facturation?.planId || 'basique');
        
        // Calculer le coût mensuel basé sur le nombre de propriétés
        const propertiesCount = currentUser.facturation?.propertiesCount || 0;
        const monthlyCost = currentPlan ? propertiesCount * currentPlan.pricePerProperty : 0;
        
        res.json({
            success: true,
            data: {
                currentPlan: currentPlan,
                userBilling: {
                    ...currentUser.facturation,
                    monthlyCost: monthlyCost
                },
                propertiesCount: propertiesCount
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des détails de facturation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour récupérer les types de méthodes de paiement
router.get('/payment-methods/types', async (req, res) => {
    try {
        console.log('💳 Récupération des types de méthodes de paiement...');
        
        const paymentMethodTypes = await dataService.getPaymentMethodTypes();
        
        res.json({
            success: true,
            data: {
                types: paymentMethodTypes
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des types de méthodes de paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour récupérer les méthodes de paiement de l'utilisateur
router.get('/payment-methods', async (req, res) => {
    try {
        console.log('💳 Récupération des méthodes de paiement de l\'utilisateur...');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        const paymentMethods = await dataService.getUserPaymentMethods(currentUserId);
        
        res.json({
            success: true,
            data: {
                paymentMethods: paymentMethods
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des méthodes de paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour ajouter une méthode de paiement
router.post('/payment-methods', async (req, res) => {
    try {
        console.log('💳 Ajout d\'une méthode de paiement...');
        
        const { type, parameters, isDefault } = req.body;
        
        // Validation des données
        if (!type || !parameters) {
            return res.status(400).json({
                success: false,
                message: 'Type et paramètres requis'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        // Récupérer le type de méthode de paiement pour validation
        const paymentMethodTypes = await dataService.getPaymentMethodTypes();
        const methodType = paymentMethodTypes.find(t => t.id === type);
        
        if (!methodType) {
            return res.status(400).json({
                success: false,
                message: 'Type de méthode de paiement non trouvé'
            });
        }
        
        // Valider les paramètres selon le type
        const validationErrors = validatePaymentMethodParameters(methodType, parameters);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Paramètres invalides',
                errors: validationErrors
            });
        }
        
        // Créer les données masquées pour l'affichage
        const maskedData = createMaskedData(type, parameters);
        
        // Préparer les données de la méthode de paiement
        const paymentMethodData = {
            type: type,
            typeName: methodType.name,
            parameters: parameters,
            maskedData: maskedData,
            isDefault: isDefault || false
        };
        
        // Ajouter la méthode de paiement
        const newPaymentMethod = await dataService.addUserPaymentMethod(currentUserId, paymentMethodData);
        
        if (newPaymentMethod) {
            console.log('✅ Méthode de paiement ajoutée avec succès');
            res.json({
                success: true,
                message: 'Méthode de paiement ajoutée avec succès',
                data: {
                    paymentMethod: newPaymentMethod
                }
            });
        } else {
            console.error('❌ Échec de l\'ajout de la méthode de paiement');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'ajout de la méthode de paiement'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la méthode de paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour supprimer une méthode de paiement
router.delete('/payment-methods/:paymentMethodId', async (req, res) => {
    try {
        console.log('💳 Suppression d\'une méthode de paiement...');
        
        const { paymentMethodId } = req.params;
        
        // Validation
        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'ID de la méthode de paiement requis'
            });
        }
        
        // Supprimer la méthode de paiement
        const result = await dataService.deleteUserPaymentMethod(paymentMethodId);
        
        if (result) {
            console.log('✅ Méthode de paiement supprimée avec succès');
            res.json({
                success: true,
                message: 'Méthode de paiement supprimée avec succès'
            });
        } else {
            console.error('❌ Échec de la suppression de la méthode de paiement');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de la méthode de paiement'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de la méthode de paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour définir une méthode de paiement par défaut
router.post('/payment-methods/:paymentMethodId/set-default', async (req, res) => {
    try {
        console.log('💳 Définition de la méthode de paiement par défaut...');
        
        const { paymentMethodId } = req.params;
        
        // Validation
        if (!paymentMethodId) {
            return res.status(400).json({
                success: false,
                message: 'ID de la méthode de paiement requis'
            });
        }
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        // Définir la méthode par défaut
        const result = await dataService.setDefaultPaymentMethod(currentUserId, paymentMethodId);
        
        if (result) {
            console.log('✅ Méthode de paiement par défaut définie avec succès');
            res.json({
                success: true,
                message: 'Méthode de paiement par défaut mise à jour'
            });
        } else {
            console.error('❌ Échec de la définition de la méthode par défaut');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de la méthode par défaut'
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la définition de la méthode par défaut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Fonction utilitaire pour valider les paramètres d'une méthode de paiement
function validatePaymentMethodParameters(methodType, parameters) {
    const errors = [];
    
    for (const param of methodType.parameters) {
        const value = parameters[param.name];
        
        // Vérifier si le paramètre requis est présent
        if (param.required && (!value || value.trim() === '')) {
            errors.push(`${param.label} est requis`);
            continue;
        }
        
        // Vérifier la longueur minimale
        if (value && param.validation?.minLength && value.length < param.validation.minLength) {
            errors.push(param.validation.message || `${param.label} doit contenir au moins ${param.validation.minLength} caractères`);
        }
        
        // Vérifier le pattern regex
        if (value && param.validation?.pattern) {
            const regex = new RegExp(param.validation.pattern);
            if (!regex.test(value)) {
                errors.push(param.validation.message || `${param.label} a un format invalide`);
            }
        }
    }
    
    return errors;
}

// Fonction utilitaire pour créer les données masquées
function createMaskedData(type, parameters) {
    const maskedData = {};
    
    switch (type) {
        case 'visa':
            if (parameters.cardNumber) {
                const cardNumber = parameters.cardNumber.replace(/\s/g, '');
                maskedData.cardNumber = '**** **** **** ' + cardNumber.slice(-4);
            }
            if (parameters.expiryDate) {
                maskedData.expiryDate = parameters.expiryDate;
            }
            break;
        case 'airtel_money':
        case 'mobicash':
            if (parameters.phoneNumber) {
                const phone = parameters.phoneNumber;
                maskedData.phoneNumber = phone.slice(0, 7) + '***' + phone.slice(-3);
            }
            break;
    }
    
    return maskedData;
}

// ========================================
// ROUTES POUR L'HISTORIQUE DE FACTURATION
// ========================================

// Route pour récupérer l'historique de facturation
router.get('/billing/history', async (req, res) => {
    try {
        console.log('📊 Récupération de l\'historique de facturation...');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        const { limit = 50 } = req.query;
        
        const billingHistory = await dataService.getBillingHistory(currentUserId, parseInt(limit));
        
        res.json({
            success: true,
            data: {
                history: billingHistory,
                total: billingHistory.length
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'historique de facturation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// Route pour récupérer les statistiques de facturation
router.get('/billing/history/stats', async (req, res) => {
    try {
        console.log('📈 Récupération des statistiques de facturation...');
        
        // Récupérer l'utilisateur actuel
        const currentUserId = req.session.user.id; // ID du propriétaire connecté
        
        const stats = await dataService.getBillingHistoryStats(currentUserId);
        
        res.json({
            success: true,
            data: {
                stats: stats
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des statistiques de facturation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
});

// API pour traiter le paiement en retard
router.post('/api/process-payment', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Non autorisé' 
            });
        }

        
        const amount =  (await dataService.getUserDu(req.session.user.id)).amountDue;
        const user = await dataService.getUser(req.session.user.id);
        if(!user.mobidyc){
            return res.status(400).json({
                success: false,
                message: 'Utilisateur non trouvé, veuillez contacter l\'administrateur'
            });
        }
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Montant invalide'
            });
        }

        console.log(`💳 Traitement du paiement pour ${req.session.user.id}: ${amount} FCFA`);
        //On recuperre le moyen de paiement par defaut
        const defaultPaymentMethod = await dataService.getDefaultPaymentMethod(req.session.user.id);
        if (!defaultPaymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Aucune méthode de paiement par défaut trouvée, veuillez en ajouter une'
            });
        }
        console.log('defaultPaymentMethod', defaultPaymentMethod);
        let phoneNumber = '';
        if(defaultPaymentMethod.type === 'visa'){
            const cardNumber = defaultPaymentMethod.parameters.cardNumber;
            const expiryDate = defaultPaymentMethod.parameters.expiryDate;
            const cvv = defaultPaymentMethod.parameters.cvv;
        }
        if(defaultPaymentMethod.type === 'airtel_money'){
            phoneNumber = defaultPaymentMethod.parameters.phoneNumber;
        }
        if(defaultPaymentMethod.type === 'mobicash'){
            phoneNumber = defaultPaymentMethod.parameters.phoneNumber;
        }
        // TODO: Intégrer avec le système de paiement réel
        // Pour l'instant, on simule un paiement réussi
        //const amount2 = 100; 
        const mobidyc_service_id = process.env.MOBIDYC_SERVICE_ID;
        const mobidyc_service_apikey = process.env.MOBIDYC_SERVICE_APIKEY;
        const result = await dataService.singlePayement(`TXN_${Date.now()}`, mobidyc_service_id, amount, phoneNumber, mobidyc_service_apikey);
        //console.log('result', result);
        
        const planId = user.facturation?.planId;
        const user_billing = await dataService.getPlanChange(req.session.user.id);
        user_billing.payments.push({
            planId: planId,
            amount: result.montant,
            date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
        });
        await dataService.updateUserBillingPlan2(req.session.user.id, user_billing);

        const propertyCount = await dataService.getTenants(req.session.user.id);
        console.log('Mise à jour du user_billing');
        //On recupere le dernier payement
        const billing_history_last = await dataService.getBillingHistory(req.session.user.id, 1);
        let endDate = new Date();
        if(billing_history_last.length > 0){
            endDate = new Date(billing_history_last[0].date || billing_history_last[0].dueDate);
        }else{
            endDate = user.createdAt;
        }
        //On enregistre dans billing_history
        //const billing_history = await dataService.getBillingHistory(req.session.user.id);
        const billing_history = {
            planId: planId,
            planName: planId,
            amount: result.montant,
            billingPeriod: {endDate: new Date(), startDate: endDate},
            createdAt: new Date(),
            currency: 'FCFA',
            description: 'Facuration mensuelle - Plan ' + planId,
            invoiceNumber: 'INV_' + Date.now(),
            paymentMethod: defaultPaymentMethod.type,
            paymentMethodDetails: defaultPaymentMethod.parameters,
            status: 'paid',
            transactionId: `TXN_${Date.now()}`,
            propertiesCount: propertyCount.length,
            userId: req.session.user.id,
            userName: user.profile.firstName + ' ' + user.profile.lastName,
            date: new Date().toISOString().split('T')[0] //au format yyyy-mm-dd
        };

        //On ajoute le billing_history
        await dataService.addBillingHistory( billing_history);
        
        // Simuler un délai de traitement
        //await new Promise(resolve => setTimeout(resolve, 1000));

        //On recupere l email de l utilisateur
        const email = user.profile.email;

        if(result.montant < amount){
            await dataService.sendMail(email, 'Paiement partiel', '/parametres', 'Votre paiement pour le plan ' + planId + ' d\'une somme de ' + amount + ' FCFA n\'a pas été effectué en entier, le montant payé est de ' + result.montant + ' FCFA. Veuillez compléter le paiement en ligne sur votre compte ou contacter l\'administrateur pour compléter le paiement.');
            return res.status(400).json({
                success: false,
                message: 'Le paiement n\'a pas été effectué en entier, veuillez contacter l\'administrateur'
            });
        }
        //On envoie un email de confirmation de paiement
        await dataService.sendMail(email, 'Paiement traité avec succès', '/parametres', 'Votre paiement pour le plan ' + planId + ' d\'une somme de ' + amount + ' FCFA a été traité avec succès');

        // Retourner une réponse de succès
        res.json({
            success: true,
            message: 'Paiement traité avec succès',
            transactionId: `TXN_${Date.now()}`,
            amount: result.montant,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Erreur traitement paiement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement du paiement',
            error: error.message
        });
    }
});

module.exports = router; 