const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// Page de contact
router.get('/', (req, res) => {
    res.render('contact', {
        title: 'Contact - BikoRent',
        currentPage: 'contact',
        pageTitle: 'Contact',
        layout: false // Désactiver le layout pour cette page
    });
});

// Traitement de l'envoi de message
router.post('/send', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, subject, message } = req.body;
        
        // Validation des champs requis
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Tous les champs obligatoires doivent être remplis'
            });
        }
        
        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Adresse email invalide'
            });
        }
        
        console.log('📧 Envoi de message de contact:', { firstName, lastName, email, subject });
        
        // Préparer le contenu de l'email
        const emailContent = `
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
            <p><strong>Sujet:</strong> ${subject || 'Contact général'}</p>
            <hr>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `;
        
        // Envoyer l'email
        await dataService.sendMail(
            'vyndore.angora@gmail.com', // Email de destination
            `Message de contact - BikoRent`,
            '/contact',
            emailContent
        );
        
        console.log('✅ Message de contact envoyé avec succès');
        
        res.json({
            success: true,
            message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi du message de contact:', error);
        
        res.status(500).json({
            success: false,
            error: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.'
        });
    }
});

module.exports = router;
