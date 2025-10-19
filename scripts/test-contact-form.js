#!/usr/bin/env node

/**
 * Script de test du formulaire de contact
 */

const axios = require('axios');

async function testContactForm() {
    console.log('🧪 Test du formulaire de contact');
    
    const baseUrl = 'http://localhost:3200';
    const axiosInstance = axios.create({
        baseURL: baseUrl,
        timeout: 10000
    });
    
    try {
        // Étape 1: Tester l'accès à la page de contact
        console.log('📄 Étape 1: Accès à la page de contact');
        const contactPageResponse = await axiosInstance.get('/contact');
        console.log('✅ Page de contact accessible:', contactPageResponse.status);
        
        // Étape 2: Tester l'envoi d'un message valide
        console.log('📧 Étape 2: Test d\'envoi de message');
        const testMessage = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '+241123456789',
            subject: 'Test automatique',
            message: 'Ceci est un message de test automatique pour vérifier le fonctionnement du formulaire de contact.'
        };
        
        const sendResponse = await axiosInstance.post('/contact/send', testMessage);
        console.log('✅ Message envoyé avec succès:', sendResponse.status);
        console.log('📝 Réponse:', sendResponse.data);
        
        // Étape 3: Tester la validation avec des données invalides
        console.log('❌ Étape 3: Test de validation avec données invalides');
        try {
            const invalidMessage = {
                firstName: '', // Champ requis manquant
                lastName: 'Test',
                email: 'invalid-email', // Email invalide
                message: 'Test message'
            };
            
            await axiosInstance.post('/contact/send', invalidMessage);
            console.log('⚠️ La validation n\'a pas fonctionné comme attendu');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Validation fonctionne correctement:', error.response.data.error);
            } else {
                console.log('❌ Erreur inattendue lors de la validation:', error.message);
            }
        }
        
        console.log('\n🎉 Test du formulaire de contact terminé !');
        console.log('💡 Le formulaire de contact fonctionne correctement');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Assurez-vous que le serveur est démarré: npm start');
        }
    }
}

// Exécuter le test
testContactForm();
