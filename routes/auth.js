const express = require('express');
const router = express.Router();
const { getFirestore, getAdmin } = require('../config/firebase-admin');
const https = require('https');
const dataService = require('../services/dataService');

// API pour obtenir la configuration Firebase côté client
router.get('/firebase-config', (req, res) => {
    const { getFirebaseConfig } = require('../config/environment');
    const firebaseConfig = getFirebaseConfig();
    res.json(firebaseConfig);
});

// Page de connexion
router.get('/login', (req, res) => {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    res.render('login', {
        title: 'Connexion - BikoRent',
        currentPage: 'login',
        pageTitle: 'Connexion',
        layout: false // Désactiver le layout pour cette page
    });
});

// Traitement de la connexion
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Tentative de connexion:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('❌ Données manquantes:', { email: !!email, password: !!password });
            return res.render('login', {
                title: 'Connexion - BikoRent',
                currentPage: 'login',
                pageTitle: 'Connexion',
                layout: false,
                error: 'Email et mot de passe requis'
            });
        }

        // La vérification du mot de passe est maintenant faite côté client avec Firebase Auth
        // Le serveur reçoit la requête seulement si Firebase Auth a validé les identifiants
        console.log('🔍 Création de session pour utilisateur authentifié:', email);
        let user = null;
        
        try {
            // Récupérer les données utilisateur depuis Firestore
            const db = getFirestore();
            const usersSnapshot = await db.collection('users').get();
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            
            user = users.find(u => u.profile.email === email);
            
            if (!user) {
                console.log('❌ Utilisateur non trouvé dans Firestore:', email);
                return res.render('login', {
                    title: 'Connexion - BikoRent',
                    currentPage: 'login',
                    pageTitle: 'Connexion',
                    layout: false,
                    error: 'Utilisateur non trouvé',
                    email: email
                });
            }
            
            console.log('✅ Données utilisateur récupérées:', user.firstName, user.lastName);
            
        } catch (error) {
            console.log('❌ Erreur lors de la récupération des données utilisateur:', error.message);
            return res.render('login', {
                title: 'Connexion - BikoRent',
                currentPage: 'login',
                pageTitle: 'Connexion',
                layout: false,
                error: 'Erreur lors de la connexion',
                email: email
            });
        }

        // Créer la session
        req.session.user = {
            id: user.id,
            email: user.profile?.email || user.email,
            firstName: user.profile?.firstName || user.firstName,
            lastName: user.profile?.lastName || user.lastName,
            role: user.type || user.role || 'owner'
        };

        // Vérifier s'il y a des événements aujourd'hui
        try {
            const db = getFirestore();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const eventsSnapshot = await db.collection('calendarEvents')
                .where('userId', '==', user.id)
                .get();

            let todayEventsCount = 0;
            eventsSnapshot.forEach(doc => {
                const event = doc.data();
                let eventDate;
                
                // Gérer les différents formats de date
                if (event.start && typeof event.start === 'object' && event.start.seconds) {
                    eventDate = new Date(event.start.seconds * 1000);
                } else if (event.start) {
                    eventDate = new Date(event.start);
                }
                
                if (eventDate && eventDate >= today && eventDate < tomorrow) {
                    todayEventsCount++;
                }
            });

            if (todayEventsCount > 0) {
                req.session.todayEventsCount = todayEventsCount;
            }
        } catch (error) {
            console.log('⚠️ Erreur lors de la vérification des événements du jour:', error.message);
        }

        console.log('✅ Session créée:', req.session.user);
        
        // Forcer la sauvegarde de la session avant la redirection
        req.session.save((err) => {
            if (err) {
                console.error('❌ Erreur sauvegarde session:', err);
                return res.render('login', {
                    title: 'Connexion - BikoRent',
                    currentPage: 'login',
                    pageTitle: 'Connexion',
                    layout: false,
                    error: 'Erreur lors de la sauvegarde de session'
                });
            }
            
            console.log('💾 Session sauvegardée avec succès');
            console.log('🔄 Redirection vers /');
            res.redirect('/');
        });

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.render('login', {
            title: 'Connexion - BikoRent',
            currentPage: 'login',
            pageTitle: 'Connexion',
            layout: false,
            error: 'Erreur lors de la connexion',
            email: req.body.email // Retain email value on error
        });
    }
});

// Page d'inscription
router.get('/register', (req, res) => {
    // Si l'utilisateur est déjà connecté, rediriger vers le dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    res.render('register', {
        title: 'Inscription - BikoRent',
        currentPage: 'register',
        pageTitle: 'Inscription',
        layout: false // Désactiver le layout pour cette page
    });
});

// Traitement de l'inscription
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Tentative d\'inscription:', req.body);
        const { firstName, lastName, email, password, confirmPassword, phone } = req.body;
        
        // Validation des données
        if (!firstName || !lastName || !email || !password || !confirmPassword || !phone) {
            return res.status(500).json({ success: false, error: 'Tous les champs sont requis' });
        }

        if (password !== confirmPassword) {
            return res.status(500).json({ success: false, error: 'Les mots de passe ne correspondent pas' });
        }

        if (password.length < 6) {
            return res.status(500).json({ success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' });
        }

        // La création de l'utilisateur dans Firebase Auth est maintenant faite côté client
        // Le serveur reçoit la requête seulement si Firebase Auth a créé l'utilisateur avec succès
        console.log('🔍 Création du profil utilisateur dans Firestore pour:', email);
        
        try {
            // Attendre un peu pour que l'utilisateur soit créé côté client
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Récupérer l'utilisateur créé dans Firebase Auth
            const admin = getAdmin();
            let userRecord;
            let attempts = 0;
            const maxAttempts = 5;
            
            while (attempts < maxAttempts) {
                try {
                    userRecord = await admin.auth().getUserByEmail(email);
                    console.log('✅ Utilisateur trouvé dans Firebase Auth:', userRecord.uid);
                    break;
                } catch (error) {
                    attempts++;
                    console.log(`⏳ Tentative ${attempts}/${maxAttempts} - Utilisateur pas encore créé, attente...`);
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        throw error;
                    }
                }
            }
            
            // Vérifier si l'utilisateur existe déjà dans Firestore
            const db = getFirestore();
            const userDoc = await db.collection('users').doc(userRecord.uid).get();
            
            if (userDoc.exists) {
                console.log('⚠️ Utilisateur existe déjà dans Firestore');
                return res.status(500).json({ success: false, error: 'Cet email est déjà utilisé' });
            }
            console.log('💾 Utilisateur trouvé dans Firestore:', userDoc.id);
            //Creer l'utilisateur dans Mobidyc
            const userMobId = await dataService.addUserToMobidyc({
                nom: firstName,
                prenom: lastName,
                mail: email,
                mdp: password,
                tel: [phone],
            });

            if(!userMobId){
                return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'utilisateur dans Mobidyc' });
            }
            console.log('💾 Utilisateur créé dans Mobidyc:', userMobId);
            //Creer le service dans Mobidyc
            const serviceMobData = await dataService.addServiceToMobidyc({
                nom: 'BikoRent-'+firstName+'-'+lastName,
                uid: userMobId,
            });

            if(!serviceMobData){
                return res.status(500).json({ success: false, error: 'Erreur lors de la création du service dans Mobidyc' });
            }
            console.log('💾 Service créé dans Mobidyc:', serviceMobData);
            
            // Créer l'utilisateur dans Firestore avec les paramètres par défaut
            const userData = {
                id: userRecord.uid,
                type: 'owner', // Type par défaut pour les nouveaux utilisateurs
                email: email,
                createdAt: new Date(),
                isActive: true,
                profile: {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    address: '',
                    city: '',
                    postalCode: '',
                    country: 'France',
                    profession: '',
                    workplace: '',
                    bio: '',
                    photo: null
                },
                notifications: {
                    emailPayments: true,
                    emailOverdue: false,
                    emailNewTenants: false,
                    pushAlerts: false,
                    pushReminders: false,
                    reportFrequency: 'monthly'
                },
                preferences: {
                    language: 'fr',
                    timezone: 'Europe/Paris',
                    darkMode: false,
                    dateFormat: 'DD/MM/YYYY',
                    currency: 'EUR'
                },
                security: {
                    twoFactorAuth: false,
                    suspiciousLogin: true
                },
                mobidyc: {
                    userId: userMobId,
                    userApikey: '',
                    serviceId: serviceMobData.sid,
                    serviceApikey: serviceMobData.apikey
                }
            };

            console.log('💾 Création de l\'utilisateur dans Firestore...');
            await db.collection('users').doc(userRecord.uid).set(userData);
            console.log('✅ Utilisateur créé dans Firestore');

            // Créer la session
            req.session.user = {
                id: userRecord.uid,
                email: email,
                firstName: firstName,
                lastName: lastName,
                role: 'owner'
            };
            
        } catch (error) {
            console.log('❌ Erreur lors de la création du profil utilisateur:', error.message);
            return res.status(500).json({ success: false, error: 'Erreur lors de la création du profil utilisateur' });
            
        }

        console.log('✅ Session créée:', req.session.user);
        console.log('🔄 Redirection vers /');
        res.redirect('/');

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        return res.status(500).json({ success: false, error: 'Erreur lors de l\'inscription' });
        
    }
});

// Déconnexion
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erreur lors de la déconnexion:', err);
            return res.status(500).json({ success: false, error: 'Erreur lors de la déconnexion' });
        }
        
        // Vérifier si la requête attend une réponse JSON (AJAX)
        if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
            res.json({ success: true, message: 'Déconnexion réussie' });
        } else {
            // Redirection pour les requêtes normales
            res.redirect('/');
        }
    });
});

// API pour vérifier l'état de connexion
router.get('/api/auth/status', (req, res) => {
    res.json({
        isAuthenticated: !!req.session.user,
        user: req.session.user || null
    });
});

// Route pour vérifier le mot de passe actuel
router.post('/verify-password', async (req, res) => {
    try {
        const { currentPassword } = req.body;
        
        if (!req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non connecté' 
            });
        }
        
        if (!currentPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Mot de passe requis' 
            });
        }
        
        // Récupérer l'utilisateur depuis Firebase Auth
        const admin = getAdmin();
        const userRecord = await admin.auth().getUser(req.session.user.id);
        const userEmail = userRecord.email;
        
        // Utiliser une requête HTTP vers l'API Firebase REST pour vérifier le mot de passe
        const firebaseApiKey = process.env.FIREBASE_API_KEY;
        const postData = JSON.stringify({
            email: userEmail,
            password: currentPassword,
            returnSecureToken: true
        });
        
        const options = {
            hostname: 'identitytoolkit.googleapis.com',
            port: 443,
            path: `/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const request = https.request(options, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (result.error) {
                        console.log('❌ Mot de passe actuel incorrect:', result.error.message);
                        res.status(400).json({ 
                            success: false, 
                            message: 'Mot de passe actuel incorrect' 
                        });
                    } else {
                        console.log('✅ Mot de passe actuel vérifié avec succès');
                        res.json({ 
                            success: true, 
                            message: 'Mot de passe correct' 
                        });
                    }
                } catch (parseError) {
                    console.error('Erreur lors du parsing de la réponse:', parseError);
                    res.status(500).json({ 
                        success: false, 
                        message: 'Erreur lors de la vérification du mot de passe' 
                    });
                }
            });
        });
        
        request.on('error', (error) => {
            console.error('Erreur lors de la requête:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erreur lors de la vérification du mot de passe' 
            });
        });
        
        request.write(postData);
        request.end();
        
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la vérification du mot de passe' 
        });
    }
});

// Route pour l'authentification Google (placeholder)
router.get('/google', (req, res) => {
    // Pour l'instant, rediriger vers une page d'information
    res.render('google-auth', {
        title: 'Connexion Google - BikoRent',
        currentPage: 'google-auth',
        pageTitle: 'Connexion Google',
        layout: false,
        message: 'L\'authentification Google sera bientôt disponible. Pour l\'instant, vous pouvez utiliser votre compte BikoRent normal.'
    });
});

module.exports = router;
