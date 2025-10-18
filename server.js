// Charger les variables d'environnement
require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { validateConfig } = require('./config/environment');
const { initializeFirebase } = require('./config/firebase-admin');

const cron = require('node-cron');
const automationService = require('./services/automationService');


// Valider la configuration au démarrage
validateConfig();

// Initialiser Firebase Admin SDK
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Configuration des sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'bikorent-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bikorent-sessions',
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.set('layout', 'layout');

// Middleware pour passer les variables globales au layout
app.use((req, res, next) => {
    // Variables par défaut pour le layout
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = !!req.session.user;
    res.locals.currentPage = '';
    res.locals.pageTitle = 'BikoRent';
    res.locals.title = 'BikoRent';
    
    // Déterminer la page actuelle basée sur l'URL
    const path = req.path;
    if (path === '/') {
        res.locals.currentPage = 'home';
    } else if (path.startsWith('/dashboard')) {
        res.locals.currentPage = 'dashboard';
    } else if (path.startsWith('/proprietes')) {
        res.locals.currentPage = 'proprietes';
    } else if (path.startsWith('/properties')) {
        res.locals.currentPage = 'properties';
    } else if (path.startsWith('/locataires')) {
        res.locals.currentPage = 'locataires';
    } else if (path.startsWith('/paiements')) {
        res.locals.currentPage = 'paiements';
    } else if (path.startsWith('/rapports')) {
        res.locals.currentPage = 'rapports';
    } else if (path.startsWith('/parametres')) {
        res.locals.currentPage = 'parametres';
    } else if (path.startsWith('/chat')) {
        res.locals.currentPage = 'chat';
    } else if (path.startsWith('/contact')) {
        res.locals.currentPage = 'contact';
    } else if (path.startsWith('/login')) {
        res.locals.currentPage = 'login';
    } else if (path.startsWith('/register')) {
        res.locals.currentPage = 'register';
    }
    
    next();
});

// Middleware d'authentification
const requireAuth = (req, res, next) => {
    // si le chemin est /paiements/paiement-externe/:propertyId, alors on passe
    if (req.path.startsWith('/paiement-externe/')) {
        return next();
    }
    if (!req.session.user) {
        console.log('🔒 Accès refusé - Utilisateur non connecté');
        return res.redirect('/');
    }
    next();
};

// Middleware pour vérifier les automatisations
const { checkUserAutomations } = require('./middleware/automationMiddleware');

// Middleware
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(methodOverride('_method'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const dashboardRoutes = require('./routes/dashboard');
const proprietesRoutes = require('./routes/proprietes');
const locatairesRoutes = require('./routes/locataires');
const paiementsRoutes = require('./routes/paiements');
const rapportsRoutes = require('./routes/rapports');
const parametresRoutes = require('./routes/parametres');
const chatRoutes = require('./routes/chat');
const homeRoutes = require('./routes/home');
const propertiesRoutes = require('./routes/properties');
const propertyDetailsRoutes = require('./routes/property-details');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const calendrierRoutes = require('./routes/calendrier');
const automatisationsRoutes = require('./routes/automatisations');

// Routes publiques
app.use('/auth', authRoutes); // Routes d'authentification avec préfixe
app.use('/', homeRoutes);
app.use('/properties', propertiesRoutes);
app.use('/property', propertyDetailsRoutes);
app.use('/contact', contactRoutes);

// Routes protégées (dashboard)
app.use('/dashboard', requireAuth, checkUserAutomations, dashboardRoutes);
app.use('/proprietes', requireAuth, checkUserAutomations, proprietesRoutes);
app.use('/locataires', requireAuth, checkUserAutomations, locatairesRoutes);
app.use('/paiements', requireAuth, checkUserAutomations, paiementsRoutes);
app.use('/rapports', requireAuth, checkUserAutomations, rapportsRoutes);
app.use('/parametres', requireAuth, checkUserAutomations, parametresRoutes);
app.use('/chat', requireAuth, checkUserAutomations, chatRoutes);
app.use('/calendrier', requireAuth, checkUserAutomations, calendrierRoutes);
app.use('/automatisations', requireAuth, checkUserAutomations, automatisationsRoutes);

// Route 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page non trouvée',
        currentPage: '404',
        pageTitle: 'Page non trouvée'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Erreur serveur',
        error: err,
        currentPage: 'error',
        pageTitle: 'Erreur serveur'
    });
});

// Exécuter le 1er de chaque mois à 0h01
cron.schedule('0 1 1 * *', async () => {
    //Vérification des retards de paiement
    console.log('🔔 Vérification automatique des retards de paiement');
    try {
        await automationService.checkUnpaidRentNotifications();
        console.log('✅ Vérification des retards de paiement terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la vérification automatique des retards:', error);
    }

    //Vérification des expirations de bail (30 jours avant)
    console.log('📅 Vérification automatique des expirations de bail');
    try {
        await automationService.checkLeaseExpiryReminders();
        console.log('✅ Vérification des expirations de bail terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la vérification automatique des expirations:', error);
    }
});


// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur BikoRent démarré sur http://localhost:${PORT}`);
    console.log(`📁 Dossier des vues: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Fichiers statiques: ${path.join(__dirname, 'public')}`);
    console.log(`🔥 Firebase: ${process.env.USE_FIREBASE !== 'false' ? 'Activé' : 'Désactivé'}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
}); 