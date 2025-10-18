// Script pour déboguer les propertyId
const { firestoreUtils, COLLECTIONS } = require('./config/firebase');

async function debugPropertyIds() {
    console.log('🔍 Debug des propertyId...');
    
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('⚠️ Firebase non initialisé');
            return;
        }
        
        const allMessages = await firestoreUtils.getAll('messages');
        console.log(`📊 Total des messages: ${allMessages.length}`);
        
        console.log('\n📋 Détails des messages:');
        allMessages.forEach((message, index) => {
            console.log(`\n📝 Message ${index + 1}:`);
            console.log(`  ID: ${message.id}`);
            console.log(`  Property ID: ${message.propertyId}`);
            console.log(`  Property Name: ${message.propertyName}`);
            console.log(`  Expéditeur: ${message.senderId}`);
            console.log(`  Destinataire: ${message.recipientId}`);
            console.log(`  Message: ${message.message}`);
        });
        
        // Grouper par propertyId
        const propertyGroups = {};
        allMessages.forEach(message => {
            const propertyId = message.propertyId;
            if (!propertyGroups[propertyId]) {
                propertyGroups[propertyId] = [];
            }
            propertyGroups[propertyId].push(message);
        });
        
        console.log('\n📋 Groupement par propertyId:');
        Object.entries(propertyGroups).forEach(([propertyId, messages]) => {
            console.log(`\n🏠 Property ID: ${propertyId}`);
            console.log(`  Nom: ${messages[0].propertyName}`);
            console.log(`  Nombre de messages: ${messages.length}`);
            messages.forEach(msg => {
                console.log(`    - ${msg.senderId} → ${msg.recipientId}: ${msg.message.substring(0, 50)}...`);
            });
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du debug:', error);
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    debugPropertyIds()
        .then(() => {
            console.log('\n✅ Debug terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = { debugPropertyIds };
