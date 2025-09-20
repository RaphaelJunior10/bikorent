const { storageUtils } = require('../config/firebase');

async function testImageUpload() {
    console.log('🧪 Test de l\'upload d\'image vers Firebase Storage');
    console.log('=' .repeat(60));
    
    try {
        // Vérifier si Firebase Storage est initialisé
        if (!storageUtils.isInitialized()) {
            console.log('❌ Firebase Storage non initialisé');
            return;
        }
        
        console.log('✅ Firebase Storage initialisé');
        
        // Créer une image base64 de test (1x1 pixel transparent)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        // Convertir base64 en buffer
        const base64Data = testImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Test d'upload
        const fileName = `test/test-image-${Date.now()}.png`;
        console.log('🔄 Test d\'upload vers:', fileName);
        
        const downloadURL = await storageUtils.uploadFile(fileName, buffer, {
            contentType: 'image/png',
            customMetadata: {
                test: 'true',
                uploadedAt: new Date().toISOString()
            }
        });
        
        console.log('✅ Upload réussi !');
        console.log('📋 URL de téléchargement:', downloadURL);
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
testImageUpload().then(() => {
    console.log('\n🏁 Test terminé');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
