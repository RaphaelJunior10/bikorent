/**
 * Script pour vérifier les retards de paiement et envoyer des notifications
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
    console.log('🚀 Démarrage de la vérification des retards de paiement...');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
        // Exécuter la vérification des retards de paiement
        await automationService.checkUnpaidRentNotifications();

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

