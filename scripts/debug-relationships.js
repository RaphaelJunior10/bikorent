const dataService = require('../services/dataService');

async function debugRelationships() {
    try {
        console.log('🔍 Debug des relations propriétés-locataires');
        console.log('=' .repeat(60));
        
        // Récupérer toutes les données
        const properties = await dataService.getProperties();
        const tenants = await dataService.getTenants();
        const payments = await dataService.getPayments();
        
        console.log('\n📊 PROPRIÉTÉS:');
        properties.forEach(prop => {
            console.log(`  - ${prop.name} (ID: ${prop.id})`);
            console.log(`    Status: ${prop.status}, Loyer:  xaf${prop.monthlyRent}`);
        });
        
        console.log('\n👥 LOCATAIRES:');
        tenants.forEach(tenant => {
            console.log(`  - ${tenant.firstName} ${tenant.lastName} (ID: ${tenant.id})`);
            console.log(`    Loyer:  xaf${tenant.monthlyRent}, Dette: ${tenant.hasDebt ? 'Oui' : 'Non'}, Montant:  xaf${tenant.debtAmount}`);
        });
        
        console.log('\n💰 PAIEMENTS:');
        payments.forEach(payment => {
            console.log(`  -  xaf${payment.amount} - ${payment.status} - ${payment.date} - PropertyID: ${payment.propertyId}`);
        });
        
        console.log('\n🔗 TENTATIVE DE CORRESPONDANCE:');
        
        // Tester la logique de correspondance actuelle
        const updatedTenants = tenants.map(tenant => {
            console.log(`\n📍 Pour ${tenant.firstName} ${tenant.lastName} ( xaf${tenant.monthlyRent}):`);
            
            // Chercher une propriété avec le même loyer mensuel
            const matchingProperty = properties.find(property => 
                property.monthlyRent === tenant.monthlyRent && 
                (property.status === 'rented' || property.status === 'loué')
            );
            
            if (matchingProperty) {
                console.log(`  ✅ Correspondance trouvée: ${matchingProperty.name}`);
                return {
                    ...tenant,
                    propertyId: matchingProperty.id
                };
            } else {
                console.log(`  ❌ Aucune correspondance trouvée`);
                console.log(`     Propriétés avec loyer  xaf${tenant.monthlyRent}:`);
                const sameRentProperties = properties.filter(p => p.monthlyRent === tenant.monthlyRent);
                if (sameRentProperties.length > 0) {
                    sameRentProperties.forEach(p => {
                        console.log(`       - ${p.name} (Status: ${p.status})`);
                    });
                } else {
                    console.log(`       Aucune propriété avec ce loyer`);
                }
                return tenant;
            }
        });
        
        console.log('\n📋 RÉSULTAT FINAL:');
        updatedTenants.forEach(tenant => {
            const property = properties.find(p => p.id === tenant.propertyId);
            console.log(`  - ${tenant.firstName} ${tenant.lastName}: ${property ? property.name : 'Propriété inconnue'}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

debugRelationships().then(() => {
    console.log('\n🏁 Debug terminé');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
