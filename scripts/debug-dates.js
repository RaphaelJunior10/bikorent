#!/usr/bin/env node

/**
 * Script de débogage pour examiner le format des dates dans l'historique de facturation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function debugDates() {
    try {
        console.log('🔍 Débogage des formats de dates...\n');
        
        const response = await fetch(`${BASE_URL}/parametres/billing/history`);
        const data = await response.json();
        
        if (data.success && data.data.history.length > 0) {
            const firstInvoice = data.data.history[0];
            
            console.log('📊 Premier élément de l\'historique:');
            console.log('ID:', firstInvoice.id);
            console.log('Numéro de facture:', firstInvoice.invoiceNumber);
            
            console.log('\n📅 Analyse des dates:');
            
            // Analyser billingPeriod
            console.log('\n1. billingPeriod:');
            console.log('  Type:', typeof firstInvoice.billingPeriod);
            console.log('  Valeur brute:', JSON.stringify(firstInvoice.billingPeriod, null, 2));
            
            if (firstInvoice.billingPeriod) {
                console.log('  startDate:');
                console.log('    Type:', typeof firstInvoice.billingPeriod.startDate);
                console.log('    Valeur brute:', firstInvoice.billingPeriod.startDate);
                console.log('    Valeur JSON:', JSON.stringify(firstInvoice.billingPeriod.startDate));
                
                console.log('  endDate:');
                console.log('    Type:', typeof firstInvoice.billingPeriod.endDate);
                console.log('    Valeur brute:', firstInvoice.billingPeriod.endDate);
                console.log('    Valeur JSON:', JSON.stringify(firstInvoice.billingPeriod.endDate));
            }
            
            // Analyser dueDate
            console.log('\n2. dueDate:');
            console.log('  Type:', typeof firstInvoice.dueDate);
            console.log('  Valeur brute:', firstInvoice.dueDate);
            console.log('  Valeur JSON:', JSON.stringify(firstInvoice.dueDate));
            
            // Analyser paidDate
            console.log('\n3. paidDate:');
            console.log('  Type:', typeof firstInvoice.paidDate);
            console.log('  Valeur brute:', firstInvoice.paidDate);
            console.log('  Valeur JSON:', JSON.stringify(firstInvoice.paidDate));
            
            // Analyser createdAt
            console.log('\n4. createdAt:');
            console.log('  Type:', typeof firstInvoice.createdAt);
            console.log('  Valeur brute:', firstInvoice.createdAt);
            console.log('  Valeur JSON:', JSON.stringify(firstInvoice.createdAt));
            
            // Tester la conversion en Date
            console.log('\n🧪 Tests de conversion:');
            
            if (firstInvoice.billingPeriod && firstInvoice.billingPeriod.startDate) {
                const startDate = new Date(firstInvoice.billingPeriod.startDate);
                console.log('  startDate converti:', startDate);
                console.log('  startDate valide:', !isNaN(startDate.getTime()));
                console.log('  startDate ISO:', startDate.toISOString());
            }
            
            if (firstInvoice.dueDate) {
                const dueDate = new Date(firstInvoice.dueDate);
                console.log('  dueDate converti:', dueDate);
                console.log('  dueDate valide:', !isNaN(dueDate.getTime()));
                console.log('  dueDate ISO:', dueDate.toISOString());
            }
            
        } else {
            console.log('❌ Aucune donnée d\'historique trouvée');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du débogage:', error.message);
    }
}

// Exécuter le débogage
if (require.main === module) {
    debugDates();
}

module.exports = { debugDates };
