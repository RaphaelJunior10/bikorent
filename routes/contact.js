const express = require('express');
const router = express.Router();

// Page de contact
router.get('/', (req, res) => {
    res.render('contact', {
        title: 'Contact - BikoRent',
        currentPage: 'contact',
        pageTitle: 'Contact',
        layout: false // Désactiver le layout pour cette page
    });
});

module.exports = router;
