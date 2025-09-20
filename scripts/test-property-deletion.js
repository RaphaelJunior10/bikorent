const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PROPERTY_ID = 1; // ID d'une propriété existante

async function testPropertyDeletion() {
    console.log('🧪 Test de suppression logique de propriété');
    console.log('==========================================');
    
    try {
        console.log(`🔄 Tentative de suppression de la propriété ${TEST_PROPERTY_ID}...`);
        
        // Envoyer la requête DELETE
        const response = await axios.delete(`${BASE_URL}/proprietes/${TEST_PROPERTY_ID}`);
        
        console.log('✅ Suppression réussie !');
        console.log('📋 Réponse du serveur:', response.data);
        
        // Vérifier que la propriété est marquée comme supprimée
        if (response.data.success) {
            console.log(`✅ Propriété ${TEST_PROPERTY_ID} supprimée avec succès`);
            console.log(`📅 Supprimée le: ${response.data.deletedAt || 'maintenant'}`);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test de suppression:');
        
        if (error.response) {
            console.error('📊 Statut:', error.response.status);
            console.error('📋 Données:', error.response.data);
        } else if (error.request) {
            console.error('🌐 Erreur de connexion:', error.message);
        } else {
            console.error('❌ Erreur:', error.message);
        }
    }
    
    console.log('\n🏁 Test terminé');
}

// Exécuter le test
testPropertyDeletion();
