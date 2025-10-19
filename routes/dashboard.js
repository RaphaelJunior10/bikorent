const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');
const billingService = require('../services/billingService');
const { checkPagePermissions } = require('../middleware/billingMiddleware');

// Page d'accueil (Dashboard)
router.get('/', checkPagePermissions, async (req, res) => {
    try {
        //On recupere le user
        //const user = await dataService.getUser(req.session.user.id);
        // Générer les données du dashboard depuis la base de données
        const dashboardData = await generateDashboardData(req.session.user.id);
        
        // Récupérer les permissions de facturation
        const userBillingPlan = await billingService.getUserBillingPlan(req.session.user.id);
        const pagePermissions = req.pagePermissions || {};
        
        // Récupérer et supprimer le compteur d'événements du jour
        const todayEventsCount = req.session.todayEventsCount || 0;
        delete req.session.todayEventsCount;

        res.render('dashboard', {
            title: 'Dashboard - BikoRent',
            pageTitle: 'Dashboard',
            currentPage: 'dashboard',
            user: {
                name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'Utilisateur',
                role: req.session.user ? req.session.user.role : 'Propriétaire'
            },
            dashboardData: dashboardData,
            userBillingPlan: userBillingPlan,
            pagePermissions: pagePermissions,
            todayEventsCount: todayEventsCount
        });
    } catch (error) {
        console.error('❌ Erreur lors du rendu de la page dashboard:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Fonction pour générer les données du dashboard depuis la base de données
async function generateDashboardData(userId) {
    try {
        console.log('🔄 Récupération des données du dashboard depuis la base de données...');
        
        // Récupérer toutes les données nécessaires
        const properties = await dataService.getProperties(userId);
        const tenants = await dataService.getTenants(userId);
        const payments = await dataService.getPayments(userId);
        const users = await dataService.getUsers();
        
        //console.log(`📊 Données récupérées: ${properties.length} propriétés, ${tenants.length} locataires, ${payments.length} paiements, ${users.length} utilisateurs`);
        
        // Identifier l'utilisateur connecté
        const connectedUser = users.find(user => user.id === userId);
        //console.log('👤 Utilisateur connecté:', connectedUser ? `${connectedUser.profile?.firstName} ${connectedUser.profile?.lastName}` : 'Non trouvé');
        //console.log('tenant list', tenants);
        const userProperties = properties.filter(property => property.ownerId === connectedUser.id);
        const userTenantIds =  userProperties.filter(property => property.tenant !== null).map(property => property.tenant.userId);
        const userTenants = tenants.filter(tenant => userTenantIds.includes(tenant.id));
        //console.log('reel properties', userProperties.length, 'reel tenants', userTenants.length);
        
        
        // Établir les relations entre les données avec une logique améliorée
        const updatedTenants = tenants.map(tenant => {
            // Chercher une propriété avec le même loyer mensuel et statut loué
            
            let matchingProperty = properties.find(property => 
                property.tenant !== null && property.tenant.userId === tenant.id && 
                (property.status === 'rented' || property.status === 'loué')
            );
          
            if (matchingProperty) {
                return {
                    ...tenant,
                    propertyId: (tenant.propertyId !== null) ? [...tenant.propertyId, matchingProperty.id] : [matchingProperty.id]
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

        const userUpdatedTenants = updatedTenants.filter(tenant => userTenantIds.includes(tenant.id));
        const userPropertyId =  userProperties.filter(property => property.tenant !== null).map(property => property.id);
        const userUpdatedPayments = updatedPayments.filter(payment => userPropertyId.includes(payment.propertyId));
        
        
        
        // Calculer les statistiques du propriétaire
        const totalProperties = userProperties.length;
        const rentedProperties = userProperties.filter(p => p.status === 'loué' || p.status === 'rented').length;
        const vacantProperties = userProperties.filter(p => p.status === 'vacant' || p.status === 'available').length;
        
        // Calculer le CA mensuel (somme des loyers des propriétés louées)
        const totalMonthlyRevenue = userProperties
            .filter(p => p.status === 'loué' || p.status === 'rented')
            .reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
        
        // Calculer le CA de ce mois (basé sur les paiements du mois en cours)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthPayments = payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear &&
                   p.status === 'payé';
        });
        const thisMonthRevenue = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // Identifier les locataires en retard**
        let overdueTenants = userProperties.map(property => {
            //On recupere payment.tenant.entryDate
            const entryDate = (property.tenant !== null) ? property.tenant.entryDate : new Date();
            //On calcule le nombre de mois entre entryDate et la date actuelle
            const monthsDiff = Math.floor((new Date() - new Date(entryDate)) / (1000 * 60 * 60 * 24 * 30));
            //console.log('monthsDiff**************************', monthsDiff);
            
            //On recupere le nombre de paiement effectués depuis entryDate
            const payments = updatedPayments.filter(p => p.propertyId === property.id && p.date >= entryDate);
            //On recupere la somme des montant des paiements
            const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            //On deduit le nombre de mois reellement non paye
            const unpaidMonths = Math.floor(monthsDiff - (totalPayments / (property.monthlyRent || 0)));
            const montantDu = Math.floor(monthsDiff) * (property.monthlyRent || 0) - totalPayments;
            //On recupere le tenant
            const tenant = tenants.find(t => property.tenant !== null && t.id === property.tenant.userId);
            if (!tenant) return null;//on ne retourne pas le tenant si il n'existe pas
            //console.log('unpaidMonths', unpaidMonths, 'monthsDiff', monthsDiff, 'totalPayments', totalPayments, 'property.monthlyRent', property.monthlyRent);
            return {
                locataire: `${tenant.firstName} ${tenant.lastName}`,
                propriete: property ? property.name : 'Propriété inconnue',
                moisImpayes: Math.floor(unpaidMonths) || 0,
                montantDu: montantDu > 0 ? montantDu : 0,
                email: tenant.email || '',
                telephone: tenant.phone || tenant.telephone || ''
            };

        });
        //on supprime toute les valeurs null
        overdueTenants = overdueTenants.filter(t => t !== null);
        
        
        // Générer les activités récentes (basées sur les paiements récents)
        const recentActivities = userUpdatedPayments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map(p => {
                
                const tenant = updatedTenants.find(t => t.id === p.tenantId);
                const property = properties.find(prop => prop.id === p.propertyId);
                const timeAgo = getTimeAgo(new Date(p.date));
                
                return {
                    type: p.status === 'paid' ? 'paiement_recu' : 'paiement_retard',
                    titre: p.status === 'paid' ? 'Paiement reçu' : 'Paiement en retard',
                    description: `${tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Locataire inconnu'} - ${property ? property.name : 'Propriété inconnue'} ( xaf${p.amount})`,
                    temps: timeAgo
                };
            });
        // Générer le calendrier des paiements
        const paymentCalendar = [];
        userProperties.forEach(property => {
            if (property.tenant && property.tenant.userId) {
                const tenant = updatedTenants.find(t => t.id === property.tenant.userId);
                if(tenant){
                    const entryDate =  new Date(property.tenant.entryDate);
                    // Générer les paiements pour les 12 derniers mois
                    const tenantPayments = [];
                    let payed = 0;
                    let lastMonthPayment = null;
                    for (let i = 0; i <= 11; i++) {
                        const date = new Date();
                        date.setDate(1);
                        date.setMonth(date.getMonth() - i );
                        date.setUTCDate(1);
                        console.log('date**************************', date, entryDate);
                        
                        if (date > entryDate) {
                            const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                            
                            // Chercher un paiement pour ce mois
                            let monthPayment = null;
                            const monthPaymentList = updatedPayments.filter(p => {
                                const paymentDate = new Date(p.date);
                                paymentDate.setUTCDate(1);
                                
                                return p.tenantId === tenant.id && 
                                    paymentDate.getMonth() === date.getMonth() && 
                                    paymentDate.getFullYear() === date.getFullYear();
                            });

                            //montPaymentList est un tableau des paiements du mois en cours de l'utilisateur, on considere qu un user peut faire plusieurs paiements par mois si il le souhaite
                            let paidUsed = 0; //montant payé par le user mais réellement utilisé pour le loyer
                            if(monthPaymentList.length > 0){
                                //Ici, le paiement a bien été effectué pour le mois en cours
                                //On recupere le montant total des paiements deffectue pendant le mois en cours de l'utilisateur
                                const montant = monthPaymentList.map(p => p.amount).reduce((a, b) => a + b, 0);
                                monthPayment = monthPaymentList[monthPaymentList.length - 1];
                                monthPayment.amount = montant;
                                //const monthsPaidDeclared = monthPaymentList.filter(p => p.monthsPaid);
                                //monthsPaid += monthsPaidDeclared.map(p => p.monthsPaid).reduce((a, b) => a + b, 0) - monthsPaidDeclared.length;
                                const paidPlus = montant - property.monthlyRent; 
                                payed += paidPlus > 0 ? paidPlus : 0; //Le surplus entre le montant payé et le loyer mensuel, sera utilisé comme loyer des mois en retard ou a venir
                                lastMonthPayment = monthPaymentList[monthPaymentList.length - 1];
                                paidUsed = property.monthlyRent;
                                if(montant < property.monthlyRent){
                                    paidUsed = montant;
                                    monthPayment.status = 'partiel';
                                }
                            }else {
                                //Ici, le paiement n'a pas été effectué pour le mois en cours, on se sert du surplus pour le/les mois précédent en retard 
                                    if(payed > property.monthlyRent){
                                        payed -= property.monthlyRent;
                                        monthPayment = lastMonthPayment;
                                        monthPayment.amount = 0;
                                        monthPayment.status = 'completé';
                                        paidUsed = property.monthlyRent //Permettra de calculer le montant réellement utilisé pour le loyer
                                    }else {
                                        monthPayment = null;
                                    }
                            }
                            
                            tenantPayments.push({
                                mois: monthYear,
                                statut: monthPayment ? (monthPayment.status === 'paid' || monthPayment.status === 'payé' ? 'payé' : monthPayment.status === 'completé' ? 'completé' : monthPayment.status === 'partiel' ? 'partiel' : 'en-retard') : 'en-retard',
                                montant: monthPayment ? monthPayment.amount || 0 : property.monthlyRent || 0,
                                paidUsed: paidUsed
                            });
                        }
                        
                    }

                    //On calcule le montant réellement utilisé pour le loyer
                    const paidUsedAll = tenantPayments.map(p => p.paidUsed).reduce((a, b) => a + b, 0);
                    //On calcule le montant total des paiements effectués
                    const amountAll = tenantPayments.filter(p => p.statut == 'payé' || p.statut == 'partiel').map(p => p.montant).reduce((a, b) => a + b, 0);
                    //On calcule le nombre de mois en retard ou a venir dont le surplus peut couvrir le loyer
                    let nb = Math.floor((amountAll - paidUsedAll) / property.monthlyRent);
                    
                    if(nb > 0){
                        //On parcourt le tableau dans le sens inverse pour marquer dabord les mois les plus anciens qui sont en retard comme payés
                        for(let i = tenantPayments.length - 1; i >= 0; i--) {
                            if(nb == 0) {
                                break;
                            }
                            const payment = tenantPayments[i];
                            if(payment.statut == 'en-retard') {
                                tenantPayments[i].statut = 'completé';
                                tenantPayments[i].montant = 0;
                                nb--;
                            }
                            if(payment.statut == 'partiel') {
                                tenantPayments[i].statut = 'completé';
                                nb--;
                            }
                        }
                    }
                    
                    paymentCalendar.push({
                        locataire: `${tenant.firstName} ${tenant.lastName}`,
                        propriete: property.name,
                        paiements: tenantPayments
                    });
                }
            }
        });
        // Calculer les statistiques pour l'utilisateur connecté (si c'est un locataire)
        let userStats = {
            biensLoues: 0,
            loyerMensuel: 0,
            moisEnRetard: 0
        };
        
        let userActivities = [];
        let userCalendar = { paiements: [] };
        
        //if (connectedUser && connectedUser.type === 'tenant') {
            // Trouver les propriétés louées par cet utilisateur
            const userTenant = updatedTenants.find(t => t.id === connectedUser.id);
            //console.log('userTenant:', userTenant);
            //console.log('updatedTenants:', updatedTenants);
            
            
            if (userTenant) {
                //On recupere les proprietes loue par ce user
                const thisUserProperties = properties.filter(p => p.tenant !== null && p.tenant.userId === connectedUser.id);
                userStats.biensLoues = thisUserProperties.length;
                userStats.loyerMensuel = thisUserProperties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
                
                let overdue = thisUserProperties.map(property => {
                    //On recupere payment.tenant.entryDate
                    const entryDate = (property.tenant !== null) ? property.tenant.entryDate : new Date();
                    //On calcule le nombre de mois entre entryDate et la date actuelle
                    const monthsDiff = (new Date() - new Date(entryDate)) / (1000 * 60 * 60 * 24 * 30);
                    //On recupere le nombre de paiement effectués depuis entryDate
                    const payments = updatedPayments.filter(p => p.propertyId === property.id && p.date >= entryDate);
                    //On recupere la somme des montant des paiements
                    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                    //arrondi a l entier superieur
                    
                    //On deduit le nombre de mois reellement non paye
                    let unpaidMonths = monthsDiff - (totalPayments / (property.monthlyRent || 0));
                    unpaidMonths = Math.floor(unpaidMonths);
                    //On recupere le proprietaire
                    const ownerId = tenants.find(t => property.tenant !== null && t.id === property.tenant.userId);
                    const owner = users.find(u => u.id === property.ownerId.trim());
                    
                    if (!owner) return null;//on ne retourne pas le tenant si il n'existe pas
         
                    return {
                        owner: `${owner.profile.firstName} ${owner.profile.lastName}`,
                        propriete: property ? property.name : 'Propriété inconnue',
                        moisImpayes: Math.floor(unpaidMonths) || 0,
                        montantDu: Math.floor(unpaidMonths * (property.monthlyRent || 0)) || 0
                    };
        
                });
                userStats.moisEnRetard = overdue.reduce((sum, p) => sum + (p.moisImpayes || 0), 0) || 0;
                userStats.montantDu = overdue.reduce((sum, p) => sum + (p.montantDu || 0), 0) || 0;
                
                
                // Générer les activités pour cet utilisateur
                const userPayments = updatedPayments.filter(p => p.tenantId === connectedUser.id && p.userId === connectedUser.id);
                
                userActivities = userPayments
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5)
                    .map(p => {
                        const property = properties.find(prop => prop.id === p.propertyId);
                        const timeAgo = getTimeAgo(new Date(p.date));
                        
                        return {
                            type: p.status === 'paid' ? 'paiement_effectue' : 'paiement_retard',
                            titre: p.status === 'paid' ? 'Paiement effectué' : 'Paiement en retard',
                            description: `${property ? property.name : 'Propriété inconnue'} ( xaf${p.amount})`,
                            temps: timeAgo
                        };
                    });
                
                // Générer le calendrier pour cet utilisateur
                const userTenantProperties = properties.filter(p => userTenant.propertyId.includes(p.id));
               
                
            
                userTenantProperties.forEach(userProperty =>  {
                    const entryDate = (userProperty.tenant !== null) ? new Date(userProperty.tenant.entryDate) : new Date();
                    const userTenantPayments = [];
                    let payed = 0;
                    let lastMonthPayment = null;
                    for (let i = 0; i <= 11; i++) {
                        const date = new Date();
                        date.setDate(1);
                        date.setMonth(date.getMonth() - i );
                        date.setUTCDate(1);
                        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                        if (date > entryDate) {
                            let monthPayment = null;
                            const monthPaymentList = userPayments.filter(p => {
                                //console.log('p', p);
                                
                                const paymentDate = new Date(p.date);
                                paymentDate.setUTCDate(1);
                                //console.log(paymentDate.getMonth(), date.getMonth(), paymentDate.getFullYear(), date.getFullYear());
                                
                                return paymentDate.getMonth() === date.getMonth() && 
                                    paymentDate.getFullYear() === date.getFullYear();
                            });

                            //montPaymentList est un tableau des paiements du mois en cours de l'utilisateur, on considere qu un user peut faire plusieurs paiements par mois si il le souhaite
                            let paidUsed = 0; //montant payé par le user mais réellement utilisé pour le loyer
                            if(monthPaymentList.length > 0){
                                //Ici, le paiement a bien été effectué pour le mois en cours
                                //On recupere le montant total des paiements deffectue pendant le mois en cours de l'utilisateur
                                const montant = monthPaymentList.map(p => p.amount).reduce((a, b) => a + b, 0);
                                monthPayment = monthPaymentList[monthPaymentList.length - 1];
                                monthPayment.amount = montant;
                                //const monthsPaidDeclared = monthPaymentList.filter(p => p.monthsPaid);
                                //monthsPaid += monthsPaidDeclared.map(p => p.monthsPaid).reduce((a, b) => a + b, 0) - monthsPaidDeclared.length;
                                const paidPlus = montant - userProperty.monthlyRent; 
                                payed += paidPlus > 0 ? paidPlus : 0; //Le surplus entre le montant payé et le loyer mensuel, sera utilisé comme loyer des mois en retard ou a venir
                                lastMonthPayment = monthPaymentList[monthPaymentList.length - 1];
                                paidUsed = userProperty.monthlyRent;
                                if(montant < userProperty.monthlyRent){
                                    paidUsed = montant;
                                    monthPayment.status = 'partiel';
                                }
                                
                            }else {
                                //Ici, le paiement n'a pas été effectué pour le mois en cours, on se sert du surplus pour le/les mois précédent en retard 
                                    if(payed > userProperty.monthlyRent){
                                        payed -= userProperty.monthlyRent;
                                        monthPayment = lastMonthPayment;
                                        monthPayment.amount = 0;
                                        monthPayment.status = 'completé';
                                        paidUsed = userProperty.monthlyRent //Permettra de calculer le montant réellement utilisé pour le loyer
                                    }else {
                                        monthPayment = null;
                                    }
                            }
                            
                            userTenantPayments.push({
                                mois: monthYear,
                                statut: monthPayment ? (monthPayment.status === 'paid' || monthPayment.status === 'payé' ? 'payé' : monthPayment.status === 'completé' ? 'completé' : monthPayment.status === 'partiel' ? 'partiel' : 'en-retard') : 'en-retard',
                                montant: monthPayment ? monthPayment.amount || 0 : userProperty.monthlyRent || 0,
                                paidUsed: paidUsed
                            });

                    }
                    }
                    //On calcule le montant réellement utilisé pour le loyer
                    const paidUsedAll = userTenantPayments.map(p => p.paidUsed).reduce((a, b) => a + b, 0);
                    //On calcule le montant total des paiements effectués
                    const amountAll = userTenantPayments.filter(p => p.statut == 'payé' || p.statut == 'partiel').map(p => p.montant).reduce((a, b) => a + b, 0);
                    //On calcule le nombre de mois en retard ou a venir dont le surplus peut couvrir le loyer
                    let nb = Math.floor((amountAll - paidUsedAll) / userProperty.monthlyRent);
                    
                    if(nb > 0){
                        //On parcourt le tableau dans le sens inverse pour marquer dabord les mois les plus anciens qui sont en retard comme payés
                        for(let i = userTenantPayments.length - 1; i >= 0; i--) {
                            if(nb == 0) {
                                break;
                            }
                            const payment = userTenantPayments[i];
                            if(payment.statut == 'en-retard') {
                                userTenantPayments[i].statut = 'completé';
                                userTenantPayments[i].montant = 0;
                                nb--;
                            }
                            if(payment.statut == 'partiel') {
                                userTenantPayments[i].statut = 'completé';
                                nb--;
                            }
                        }
                    }

                    userCalendar.paiements = [{
                        locataire: 'Vous',
                        propriete: userProperty.name,
                        paiements: userTenantPayments
                    }];
                });
            }
        //}
        
        console.log('📊 Statistiques calculées:', {
            totalProperties,
            rentedProperties,
            vacantProperties,
            totalMonthlyRevenue,
            thisMonthRevenue,
            //tenantsWithDebt: tenantsWithDebt.length
        });
        
        // Construire l'objet dashboardData
        const dashboardData = {
            proprietaire: {
                nom: connectedUser ? `${connectedUser.profile?.firstName || ''} ${connectedUser.profile?.lastName || ''}`.trim() : 'Propriétaire',
                //currency: convertArrayForUser(connectedUser),
                stats: {
                    biensTotal: totalProperties,
                    biensLoues: rentedProperties,
                    caMensuel: totalMonthlyRevenue,
                    ceMois: thisMonthRevenue
                },
                alertes: {
                    retards: overdueTenants.length,
                    locataires: overdueTenants.map(t => t.locataire)
                },
                retards: overdueTenants,
                activites: recentActivities,
                calendrier: {
                    paiements: paymentCalendar
                }
            },
            locataire: {
                stats: userStats,
                activites: userActivities,
                calendrier: userCalendar
            }
        };
        
        console.log('✅ Données du dashboard reconstituées avec succès');
        return dashboardData;
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des données du dashboard:', error);
        // Retourner des données de fallback en cas d'erreur
        return {
            proprietaire: {
                stats: {
                    biensTotal: 0,
                    biensLoues: 0,
                    caMensuel: 0,
                    ceMois: 0
                },
                alertes: {
                    retards: 0,
                    locataires: []
                },
                retards: [],
                activites: [],
                calendrier: {
                    paiements: []
                }
            },
            locataire: {
                stats: {
                    biensLoues: 0,
                    loyerMensuel: 0,
                    moisEnRetard: 0
                },
                activites: [],
                calendrier: {
                    paiements: []
                }
            }
        };
    }
}

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInHours < 1) {
        return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
        return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    }
}

// API pour rafraîchir les données du dashboard
router.get('/api/dashboard', async (req, res) => {
    try {
        const dashboardData = await generateDashboardData(req.session.user.id);
        res.json(dashboardData);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des données API dashboard:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router; 