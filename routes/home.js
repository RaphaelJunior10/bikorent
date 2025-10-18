const express = require('express');
const router = express.Router();

// Page d'accueil
router.get('/', (req, res) => {
    res.render('home', {
        title: 'BikoRent - Plateforme de Gestion Locative',
        currentPage: 'home',
        pageTitle: 'Accueil',
        layout: false // Désactiver le layout pour cette page
    });
});

module.exports = router;
