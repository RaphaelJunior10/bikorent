const dataService = require('../services/dataService');
const { isFirebaseEnabled } = require('../config/environment');

async function testParametresData() {
    console.log('🧪 Test de récupération des données des paramètres');
    console.log('=' .repeat(50));
    
    // Vérifier le statut Firebase
    console.log('📊 Statut Firebase:', isFirebaseEnabled() ? 'Activé' : 'Désactivé');
    
    try {
        // Test 1: Récupérer tous les utilisateurs
        console.log('\n🔍 Test 1: Récupération de tous les utilisateurs');
        const users = await dataService.getUsers();
        console.log(`✅ ${users.length} utilisateur(s) récupéré(s)`);
        
        if (users.length > 0) {
            console.log('📋 Structure complète du premier utilisateur:');
            console.log(JSON.stringify(users[0], null, 2));
            
            console.log('\n📋 Propriétés disponibles:');
            console.log('Keys:', Object.keys(users[0]));
            
            if (users[0].profile) {
                console.log('📋 Propriétés du profile:', Object.keys(users[0].profile));
            }
        }
        
        // Test 2: Récupérer les données des paramètres
        console.log('\n🔍 Test 2: Récupération des données des paramètres');
        const parametresData = await dataService.getParametresData();
        
        if (parametresData) {
            console.log('✅ Données des paramètres récupérées avec succès');
            console.log('📋 Profil:', {
                firstName: parametresData.profile.firstName,
                lastName: parametresData.profile.lastName,
                email: parametresData.profile.email
            });
            console.log('📋 Sécurité:', parametresData.security);
            console.log('📋 Notifications:', parametresData.notifications);
            console.log('📋 Préférences:', parametresData.preferences);
            console.log('📋 Facturation:', {
                plan: parametresData.billing.plan,
                price: parametresData.billing.price,
                currency: parametresData.billing.currency
            });
            console.log(`📋 Intégrations: ${parametresData.integrations.length} intégration(s)`);
        } else {
            console.log('⚠️ Aucune donnée des paramètres trouvée');
        }
        
        // Test 3: Rechercher un utilisateur par email
        console.log('\n🔍 Test 3: Recherche d\'utilisateur par email');
        const userByEmail = await dataService.getUserByEmail('admin33@bikorent.com');
        
        if (userByEmail) {
            console.log('✅ Utilisateur trouvé par email:', {
                id: userByEmail.id,
                email: userByEmail.email,
                firstName: userByEmail.firstName,
                lastName: userByEmail.lastName
            });
        } else {
            console.log('⚠️ Aucun utilisateur trouvé avec cet email');
        }
        
        console.log('\n✅ Tous les tests terminés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Exécuter les tests
testParametresData().then(() => {
    console.log('\n🏁 Script de test terminé');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
