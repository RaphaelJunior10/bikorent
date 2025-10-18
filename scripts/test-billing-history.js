#!/usr/bin/env node

/**
 * Script de test pour les routes d'historique de facturation
 * Teste les routes de gestion de l'historique de facturation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testBillingHistoryRoutes() {
    console.log('🧪 Test des routes d\'historique de facturation...\n');

    try {
        // Test 1: Récupérer l'historique de facturation
        console.log('1️⃣ Test de récupération de l\'historique de facturation...');
        const historyResponse = await fetch(`${BASE_URL}/parametres/billing/history`);
        const historyData = await historyResponse.json();
        
        if (historyData.success) {
            console.log('✅ Historique de facturation récupéré avec succès:');
            console.log(`   - Nombre d'entrées: ${historyData.data.total}`);
            historyData.data.history.forEach((invoice, index) => {
                console.log(`   ${index + 1}. ${invoice.invoiceNumber} - ${invoice.planName} - ${invoice.status} - ${invoice.amount} ${invoice.currency}`);
            });
        } else {
            console.log('❌ Échec de la récupération de l\'historique:', historyData.message);
        }

        // Test 2: Récupérer les statistiques de facturation
        console.log('\n2️⃣ Test de récupération des statistiques de facturation...');
        const statsResponse = await fetch(`${BASE_URL}/parametres/billing/history/stats`);
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
            console.log('✅ Statistiques de facturation récupérées:');
            const stats = statsData.data.stats;
            console.log(`   - Total factures: ${stats.totalInvoices}`);
            console.log(`   - Factures payées: ${stats.paidInvoices}`);
            console.log(`   - Factures en attente: ${stats.pendingInvoices}`);
            console.log(`   - Factures échouées: ${stats.failedInvoices}`);
            console.log(`   - Total payé: ${stats.totalPaid} XAF`);
            console.log(`   - Total en attente: ${stats.totalPending} XAF`);
            console.log(`   - Montant moyen: ${Math.round(stats.averageAmount)} XAF`);
        } else {
            console.log('❌ Échec de la récupération des statistiques:', statsData.message);
        }

        // Test 3: Test avec limite de résultats
        console.log('\n3️⃣ Test avec limite de résultats (limit=3)...');
        const limitedResponse = await fetch(`${BASE_URL}/parametres/billing/history?limit=3`);
        const limitedData = await limitedResponse.json();
        
        if (limitedData.success) {
            console.log('✅ Historique limité récupéré:');
            console.log(`   - Nombre d'entrées retournées: ${limitedData.data.total}`);
            limitedData.data.history.forEach((invoice, index) => {
                console.log(`   ${index + 1}. ${invoice.invoiceNumber} - ${invoice.planName}`);
            });
        } else {
            console.log('❌ Échec de la récupération limitée:', limitedData.message);
        }

        // Test 4: Vérification des données d'historique
        console.log('\n4️⃣ Vérification des données d\'historique...');
        if (historyData.success && historyData.data.history.length > 0) {
            const firstInvoice = historyData.data.history[0];
            console.log('✅ Structure des données vérifiée:');
            console.log(`   - ID: ${firstInvoice.id}`);
            console.log(`   - Numéro de facture: ${firstInvoice.invoiceNumber}`);
            console.log(`   - Plan: ${firstInvoice.planName} (${firstInvoice.planId})`);
            console.log(`   - Montant: ${firstInvoice.amount} ${firstInvoice.currency}`);
            console.log(`   - Statut: ${firstInvoice.status}`);
            console.log(`   - Méthode de paiement: ${firstInvoice.paymentMethod}`);
            console.log(`   - Période: ${new Date(firstInvoice.billingPeriod.startDate).toLocaleDateString()} - ${new Date(firstInvoice.billingPeriod.endDate).toLocaleDateString()}`);
            console.log(`   - Date d'échéance: ${new Date(firstInvoice.dueDate).toLocaleDateString()}`);
            if (firstInvoice.paidDate) {
                console.log(`   - Date de paiement: ${new Date(firstInvoice.paidDate).toLocaleDateString()}`);
            }
            console.log(`   - Nombre de propriétés: ${firstInvoice.propertiesCount}`);
        }

        // Test 5: Vérification des différents statuts
        console.log('\n5️⃣ Vérification des différents statuts...');
        if (historyData.success && historyData.data.history.length > 0) {
            const statuses = [...new Set(historyData.data.history.map(invoice => invoice.status))];
            console.log('✅ Statuts trouvés dans l\'historique:');
            statuses.forEach(status => {
                const count = historyData.data.history.filter(invoice => invoice.status === status).length;
                console.log(`   - ${status}: ${count} facture(s)`);
            });
        }

        // Test 6: Vérification des plans de facturation
        console.log('\n6️⃣ Vérification des plans de facturation...');
        if (historyData.success && historyData.data.history.length > 0) {
            const plans = [...new Set(historyData.data.history.map(invoice => invoice.planName))];
            console.log('✅ Plans de facturation trouvés:');
            plans.forEach(plan => {
                const count = historyData.data.history.filter(invoice => invoice.planName === plan).length;
                const totalAmount = historyData.data.history
                    .filter(invoice => invoice.planName === plan)
                    .reduce((sum, invoice) => sum + invoice.amount, 0);
                console.log(`   - ${plan}: ${count} facture(s), total: ${totalAmount} XAF`);
            });
        }

        console.log('\n🎉 Tests d\'historique de facturation terminés !');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        console.log('\n💡 Assurez-vous que le serveur est démarré sur le port 3000');
    }
}

// Exécuter les tests
if (require.main === module) {
    testBillingHistoryRoutes();
}

module.exports = { testBillingHistoryRoutes };
