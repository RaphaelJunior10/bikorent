/**
 * Script pour vérifier les expirations de bail et envoyer des notifications
 * Ce script peut être exécuté manuellement ou via un cron job
 */

// Charger les variables d'environnement
require('dotenv').config();

const { initializeFirebase } = require('../config/firebase-admin');
const automationService = require('../services/automationService');

// Initialiser Firebase Admin SDK
initializeFirebase();

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 Démarrage de la vérification des expirations de bail...');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
        // Exécuter la vérification des expirations de bail
        await automationService.checkLeaseExpiryReminders();

        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('✅ Vérification terminée avec succès !');
        console.log('═══════════════════════════════════════════════════════════');

        process.exit(0);
    } catch (error) {
        console.error('');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('❌ Erreur lors de la vérification:', error);
        console.error('═══════════════════════════════════════════════════════════');
        
        process.exit(1);
    }
}

// Exécuter le script
main();

