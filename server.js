// Charger les variables d'environnement
require('dotenv').config();

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const { validateConfig } = require('./config/environment');

// Valider la configuration au démarrage
validateConfig();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware pour passer les variables globales au layout
app.use((req, res, next) => {
    // Variables par défaut pour le layout
    res.locals.user = {
        name: 'Admin',
        role: 'Propriétaire'
    };
    res.locals.currentPage = '';
    res.locals.pageTitle = 'BikoRent';
    res.locals.title = 'BikoRent';
    
    // Déterminer la page actuelle basée sur l'URL
    const path = req.path;
    if (path === '/') {
        res.locals.currentPage = 'dashboard';
    } else if (path.startsWith('/proprietes')) {
        res.locals.currentPage = 'proprietes';
    } else if (path.startsWith('/locataires')) {
        res.locals.currentPage = 'locataires';
    } else if (path.startsWith('/paiements')) {
        res.locals.currentPage = 'paiements';
    } else if (path.startsWith('/rapports')) {
        res.locals.currentPage = 'rapports';
    } else if (path.startsWith('/parametres')) {
        res.locals.currentPage = 'parametres';
    }
    
    next();
});

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

// Route racine redirige vers le dashboard
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

app.use('/dashboard', dashboardRoutes);
app.use('/proprietes', proprietesRoutes);
app.use('/locataires', locatairesRoutes);
app.use('/paiements', paiementsRoutes);
app.use('/rapports', rapportsRoutes);
app.use('/parametres', parametresRoutes);

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

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur BikoRent démarré sur http://localhost:${PORT}`);
    console.log(`📁 Dossier des vues: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Fichiers statiques: ${path.join(__dirname, 'public')}`);
    console.log(`🔥 Firebase: ${process.env.USE_FIREBASE !== 'false' ? 'Activé' : 'Désactivé'}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
}); 