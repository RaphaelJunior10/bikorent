const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoutes = require('./routes/index');
const proprietesRoutes = require('./routes/proprietes');
const locatairesRoutes = require('./routes/locataires');
const paiementsRoutes = require('./routes/paiements');
const rapportsRoutes = require('./routes/rapports');
const parametresRoutes = require('./routes/parametres');

app.use('/', indexRoutes);
app.use('/proprietes', proprietesRoutes);
app.use('/locataires', locatairesRoutes);
app.use('/paiements', paiementsRoutes);
app.use('/rapports', rapportsRoutes);
app.use('/parametres', parametresRoutes);

// Route 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page non trouvée',
        currentPage: '404'
    });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Erreur serveur',
        error: err,
        currentPage: 'error'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur BikoRent démarré sur http://localhost:${PORT}`);
    console.log(`📁 Dossier des vues: ${path.join(__dirname, 'views')}`);
    console.log(`📁 Fichiers statiques: ${path.join(__dirname, 'public')}`);
}); 