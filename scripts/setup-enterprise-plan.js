// Script pour configurer un plan entreprise pour un utilisateur
require('dotenv').config();
const { firestoreUtils } = require('../config/firebase');

async function setupEnterprisePlan(userId, userEmail = null) {
    try {
        console.log('🚀 Configuration du plan entreprise...');
        console.log('User ID:', userId);
        
        if (!firestoreUtils.isInitialized()) {
            console.log('❌ Firebase non initialisé. Vérifiez votre configuration.');
            return;
        }

        // Vérifier si l'utilisateur existe déjà
        const existingPlans = await firestoreUtils.getAll('billingPlans');
        const existingPlan = existingPlans.find(plan => plan.userId === userId);
        
        if (existingPlan) {
            console.log('✅ Plan existant trouvé:', existingPlan);
            
            // Mettre à jour le plan existant
            const updatedPlan = {
                ...existingPlan,
                plan: 'entreprise',
                status: 'active',
                updatedAt: new Date(),
                features: {
                    calendar: true,
                    advancedReports: true,
                    prioritySupport: true,
                    unlimitedProperties: true
                }
            };
            
            await firestoreUtils.update('billingPlans', existingPlan.id, updatedPlan);
            console.log('✅ Plan mis à jour vers entreprise');
        } else {
            // Créer un nouveau plan
            const newPlan = {
                userId: userId,
                userEmail: userEmail,
                plan: 'entreprise',
                status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
                price: 290, // Prix annuel
                currency: 'EUR',
                features: {
                    calendar: true,
                    advancedReports: true,
                    prioritySupport: true,
                    unlimitedProperties: true
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await firestoreUtils.add('billingPlans', newPlan);
            console.log('✅ Nouveau plan entreprise créé');
        }
        
        console.log('🎉 Configuration terminée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error);
    }
}

// Fonction pour lister tous les utilisateurs
async function listUsers() {
    try {
        console.log('👥 Récupération des utilisateurs...');
        
        const users = await firestoreUtils.getAll('users');
        console.log('Utilisateurs trouvés:', users.length);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email || 'N/A'}, Nom: ${user.firstName || ''} ${user.lastName || ''}`);
        });
        
        return users;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
        return [];
    }
}

// Fonction pour lister tous les plans de facturation
async function listBillingPlans() {
    try {
        console.log('💳 Récupération des plans de facturation...');
        
        const plans = await firestoreUtils.getAll('billingPlans');
        console.log('Plans trouvés:', plans.length);
        
        plans.forEach((plan, index) => {
            console.log(`${index + 1}. User ID: ${plan.userId}, Plan: ${plan.plan}, Status: ${plan.status}, Prix: ${plan.price}${plan.currency || 'EUR'}`);
        });
        
        return plans;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des plans:', error);
        return [];
    }
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'list-users') {
        await listUsers();
    } else if (command === 'list-plans') {
        await listBillingPlans();
    } else if (command === 'setup' && args[1]) {
        const userId = args[1];
        const userEmail = args[2] || null;
        await setupEnterprisePlan(userId, userEmail);
    } else {
        console.log('📖 Utilisation:');
        console.log('  node scripts/setup-enterprise-plan.js list-users          # Lister tous les utilisateurs');
        console.log('  node scripts/setup-enterprise-plan.js list-plans         # Lister tous les plans');
        console.log('  node scripts/setup-enterprise-plan.js setup <userId> [email]  # Configurer un plan entreprise');
        console.log('');
        console.log('Exemples:');
        console.log('  node scripts/setup-enterprise-plan.js list-users');
        console.log('  node scripts/setup-enterprise-plan.js setup user123 user@example.com');
    }
}

// Exécuter le script
main().then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
