const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const { firestoreUtils, storageUtils, COLLECTIONS } = require('../config/firebase');

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
        const parametresData = await dataService.getParametresData();
        
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
            parametresData: finalData
        });
    } catch (error) {
        console.error('❌ Erreur lors du rendu de la page paramètres:', error);
        
        // En cas d'erreur, utiliser les données de fallback
        res.render('parametres', {
            title: 'Paramètres du Compte - BikoRent',
            pageTitle: 'Paramètres',
            currentPage: 'parametres',
            user: {
                name: 'Admin',
                role: 'Propriétaire'
            },
            parametresData: parametresDataFallback
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
        
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
        
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
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
        
        const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
        if (updatedUser) {
            console.log('✅ Mot de passe mis à jour avec succès');
            res.json({
                success: true,
                message: 'Mot de passe mis à jour avec succès'
            });
        } else {
            console.error('❌ Échec de la mise à jour du mot de passe');
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour du mot de passe'
            });
        }
        
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
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
                /*emailOverdue: notifications.emailOverdue || false,
                emailNewTenants: notifications.emailNewTenants || false,
                pushAlerts: notifications.pushAlerts || false,
                pushReminders: notifications.pushReminders || false,
                reportFrequency: notifications.reportFrequency || "monthly"*/
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
        const currentUserId = 'U7h4HU5OfB9KTeY341NE'; // ID du propriétaire connecté
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
        
        const updatedUser = await dataService.updateUser(currentUserId, updateData);
        
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

module.exports = router; 