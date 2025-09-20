const dataService = require('../services/dataService');
const { isFirebaseEnabled } = require('../config/environment');

async function testDashboardData() {
    console.log('🧪 Test de récupération des données du dashboard');
    console.log('=' .repeat(50));
    
    // Vérifier le statut Firebase
    console.log('📊 Statut Firebase:', isFirebaseEnabled() ? 'Activé' : 'Désactivé');
    
    try {
        // Test 1: Récupérer toutes les données nécessaires
        console.log('\n🔍 Test 1: Récupération des données de base');
        const properties = await dataService.getProperties();
        const tenants = await dataService.getTenants();
        const payments = await dataService.getPayments();
        
        console.log(`✅ Données récupérées:`);
        console.log(`   - Propriétés: ${properties.length}`);
        console.log(`   - Locataires: ${tenants.length}`);
        console.log(`   - Paiements: ${payments.length}`);
        
        if (properties.length > 0) {
            console.log('\n📋 Exemple de propriété:', {
                id: properties[0].id,
                name: properties[0].name,
                status: properties[0].status,
                monthlyRent: properties[0].monthlyRent
            });
        }
        
        if (tenants.length > 0) {
            console.log('\n📋 Exemple de locataire:', {
                id: tenants[0].id,
                firstName: tenants[0].firstName,
                lastName: tenants[0].lastName,
                hasDebt: tenants[0].hasDebt,
                debtAmount: tenants[0].debtAmount
            });
        }
        
        if (payments.length > 0) {
            console.log('\n📋 Exemple de paiement:', {
                id: payments[0].id,
                amount: payments[0].amount,
                status: payments[0].status,
                date: payments[0].date
            });
        }
        
        // Établir les relations entre les données avec une logique améliorée
        const updatedTenants = tenants.map(tenant => {
            // Chercher une propriété avec le même loyer mensuel et statut loué
            let matchingProperty = properties.find(property => 
                property.monthlyRent === tenant.monthlyRent && 
                (property.status === 'rented' || property.status === 'loué')
            );
            
            // Si pas trouvé, chercher une propriété avec le même loyer même si elle est vacante
            if (!matchingProperty) {
                matchingProperty = properties.find(property => 
                    property.monthlyRent === tenant.monthlyRent
                );
            }
            
            // Si toujours pas trouvé, chercher une propriété avec un loyer proche (±10%)
            if (!matchingProperty) {
                const tolerance = tenant.monthlyRent * 0.1;
                matchingProperty = properties.find(property => 
                    Math.abs(property.monthlyRent - tenant.monthlyRent) <= tolerance &&
                    (property.status === 'rented' || property.status === 'loué')
                );
            }
            
            if (matchingProperty) {
                return {
                    ...tenant,
                    propertyId: matchingProperty.id
                };
            }
            return tenant;
        });
        
        const updatedPayments = payments.map(payment => {
            // Chercher un locataire qui loue cette propriété
            const matchingTenant = updatedTenants.find(tenant => 
                tenant.propertyId === payment.propertyId
            );
            
            if (matchingTenant) {
                return {
                    ...payment,
                    tenantId: matchingTenant.id
                };
            }
            return payment;
        });
        
        // Test 2: Calculer les statistiques
        console.log('\n🔍 Test 2: Calcul des statistiques');
        const totalProperties = properties.length;
        const rentedProperties = properties.filter(p => p.status === 'loué' || p.status === 'rented').length;
        const vacantProperties = properties.filter(p => p.status === 'vacant' || p.status === 'available').length;
        const totalMonthlyRevenue = properties
            .filter(p => p.status === 'loué' || p.status === 'rented')
            .reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
        
        console.log('📊 Statistiques calculées:');
        console.log(`   - Total propriétés: ${totalProperties}`);
        console.log(`   - Propriétés louées: ${rentedProperties}`);
        console.log(`   - Propriétés vacantes: ${vacantProperties}`);
        console.log(`   - CA mensuel total: €${totalMonthlyRevenue}`);
        
        // Test 3: Identifier les locataires en retard
        console.log('\n🔍 Test 3: Locataires en retard');
        const tenantsWithDebt = updatedTenants.filter(t => t.hasDebt || t.debtAmount > 0);
        console.log(`📊 Locataires en retard: ${tenantsWithDebt.length}`);
        
        tenantsWithDebt.forEach((tenant, index) => {
            const property = properties.find(p => p.id === tenant.propertyId);
            console.log(`   ${index + 1}. ${tenant.firstName} ${tenant.lastName} - ${property ? property.name : 'Propriété inconnue'} (€${tenant.debtAmount})`);
        });
        
        // Test 4: Calculer le CA du mois en cours
        console.log('\n🔍 Test 4: CA du mois en cours');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthPayments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'payé';
        });
        const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        console.log(`📊 CA du mois en cours: €${thisMonthRevenue} (${thisMonthPayments.length} paiements)`);
        
        // Test 5: Générer les activités récentes
        console.log('\n🔍 Test 5: Activités récentes');
        const recentActivities = updatedPayments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(p => {
                const tenant = updatedTenants.find(t => t.id === p.tenantId);
                const property = properties.find(prop => prop.id === p.propertyId);
                return {
                    type: p.status === 'payé' ? 'paiement_recu' : 'paiement_retard',
                    description: `${tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire inconnu'} - ${property ? property.name : 'Propriété inconnue'} (€${p.amount})`,
                    date: p.date
                };
            });
        
        console.log('📋 Activités récentes:');
        recentActivities.forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.type}: ${activity.description}`);
        });
        
        // Test 6: Générer le calendrier des paiements
        console.log('\n🔍 Test 6: Calendrier des paiements');
        const paymentCalendar = updatedTenants.slice(0, 2).map(tenant => {
            const property = properties.find(p => p.id === tenant.propertyId);
            if (!property) return null;
            
            // Générer les paiements pour les 3 derniers mois
            const tenantPayments = [];
            for (let i = 2; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                
                const monthPayment = updatedPayments.find(p => {
                    const paymentDate = new Date(p.date);
                    return p.tenantId === tenant.id && 
                           paymentDate.getMonth() === date.getMonth() && 
                           paymentDate.getFullYear() === date.getFullYear();
                });
                
                tenantPayments.push({
                    mois: monthYear,
                    statut: monthPayment ? (monthPayment.status === 'payé' ? 'payé' : 'en-retard') : 'en-retard',
                    montant: tenant.monthlyRent || 0
                });
            }
            
            return {
                locataire: `${tenant.firstName} ${tenant.lastName}`,
                propriete: property.name,
                paiements: tenantPayments
            };
        }).filter(Boolean);
        
        console.log('📋 Calendrier des paiements:');
        paymentCalendar.forEach((calendar, index) => {
            console.log(`   ${index + 1}. ${calendar.locataire} - ${calendar.propriete}`);
            calendar.paiements.forEach(payment => {
                console.log(`      ${payment.mois}: ${payment.statut} (€${payment.montant})`);
            });
        });
        
        console.log('\n✅ Tous les tests terminés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Exécuter les tests
testDashboardData().then(() => {
    console.log('\n🏁 Script de test terminé');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
