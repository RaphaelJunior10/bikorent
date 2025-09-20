const { isFirebaseEnabled, getFirebaseConfig } = require('../config/environment');
const { firestoreUtils } = require('../config/firebase');

async function diagnoseFirebaseConnection() {
    console.log('🔍 Diagnostic de la connexion Firebase');
    console.log('=' .repeat(50));
    
    // Vérifier le statut Firebase
    console.log('📊 Statut Firebase:', isFirebaseEnabled() ? 'Activé' : 'Désactivé');
    
    if (!isFirebaseEnabled()) {
        console.log('❌ Firebase est désactivé. Vérifiez votre fichier .env');
        return;
    }
    
    // Vérifier la configuration
    try {
        const config = getFirebaseConfig();
        console.log('✅ Configuration Firebase récupérée');
        console.log('📋 Projet ID:', config.projectId);
        console.log('📋 Base de données:', config.databaseURL || 'Non spécifiée');
        
        // Vérifier si Firebase est initialisé
        if (!firestoreUtils.isInitialized()) {
            console.log('❌ Firebase n\'est pas initialisé');
            return;
        }
        
        console.log('✅ Firebase est initialisé');
        
        // Test de connexion simple
        console.log('\n🔍 Test de connexion...');
        try {
            // Essayer de récupérer un document simple
            const testQuery = await firestoreUtils.getAll('properties');
            console.log('✅ Connexion réussie !');
            console.log(`📊 ${testQuery.length} propriétés récupérées`);
            
        } catch (error) {
            console.log('❌ Erreur de connexion:', error.message);
            
            if (error.message.includes('ECONNRESET')) {
                console.log('\n💡 Solutions possibles :');
                console.log('1. Vérifiez votre connexion internet');
                console.log('2. Vérifiez que votre projet Firebase est actif');
                console.log('3. Vérifiez les règles de sécurité Firestore');
                console.log('4. Vérifiez que votre fichier .env contient les bonnes clés');
                console.log('5. Essayez de redémarrer votre serveur');
            }
            
            if (error.message.includes('permission-denied')) {
                console.log('\n💡 Problème de permissions :');
                console.log('1. Vérifiez les règles de sécurité Firestore');
                console.log('2. Assurez-vous que l\'authentification est configurée');
            }
        }
        
    } catch (error) {
        console.log('❌ Erreur lors de la récupération de la configuration:', error.message);
        console.log('\n💡 Vérifiez votre fichier .env :');
        console.log('FIREBASE_PROJECT_ID=votre-project-id');
        console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
        console.log('FIREBASE_CLIENT_EMAIL=votre-service-account@project.iam.gserviceaccount.com');
    }
}

// Exécuter le diagnostic
diagnoseFirebaseConnection().then(() => {
    console.log('\n🏁 Diagnostic terminé');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
