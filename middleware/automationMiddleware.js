const automationService = require('../services/automationService');
const dataService = require('../services/dataService');

/**
 * Middleware pour vérifier l'état des automatisations de l'utilisateur
 * et les rendre disponibles dans toutes les vues
 */
async function checkUserAutomations(req, res, next) {
    try {
        // Si l'utilisateur est connecté
        if (req.session && req.session.user) {
            // Vérifier si l'automatisation Google Calendar est active
            const isCalendarActive = await automationService.isAutomationActive(
                req.session.user.id,
                'google-calendar-events'
            );
            
            // Ajouter à res.locals pour être disponible dans toutes les vues
            res.locals.calendarAutomationActive = isCalendarActive;
            
            console.log(`📅 Automatisation calendrier pour ${req.session.user.id}: ${isCalendarActive}`);
            
            // Vérifier si l'intégration automations est connectée
            const currentUser = await dataService.getUserById(req.session.user.id);
            const isAutomationConnected = currentUser?.integration?.automations?.connected || false;
            
            // Ajouter à res.locals pour être disponible dans toutes les vues
            res.locals.automationConnected = isAutomationConnected;
            
            console.log(`⚡ Intégration automatisations pour ${req.session.user.id}: ${isAutomationConnected}`);
            
            // Vérifier les paiements en retard
            try {
                const userDu = await dataService.getUserDu(req.session.user.id);
                const userTenants = await dataService.getTenants(req.session.user.id);
                const userPlan = currentUser?.facturation?.planId || 'basique';
                
                // Calculer les seuils de retard
                const billing_plans = await dataService.getBillingPlans();
                const planPrices = {};
                for(const billing_plan of billing_plans){
                    planPrices[billing_plan.id] = billing_plan.pricePerProperty;
                };
                
                const planPrice = planPrices[userPlan] || 0;
                const baseThreshold = planPrice * userTenants.length;
                const threshold1x = baseThreshold * 1;  // Niveau 1: notification
                const threshold2x = baseThreshold * 2;  // Niveau 2: restrictions modifications
                const threshold3x = baseThreshold * 3;  // Niveau 3: compte bloqué
                
                // Déterminer le niveau d'alerte
                let alertLevel = 0;
                let alertColor = 'green';
                let alertMessage = '';
                let isBlocked = false;
                let canModify = true;
                
                if (userDu.amountDue > threshold3x) {
                    alertLevel = 3;
                    alertColor = 'red';
                    alertMessage = 'Votre compte est bloqué. Veuillez régulariser votre situation pour accéder à toutes les fonctionnalités.';
                    isBlocked = true;
                    canModify = false;
                } else if (userDu.amountDue > threshold2x) {
                    alertLevel = 2;
                    alertColor = 'orange';
                    alertMessage = 'Vous ne pouvez plus apporter de modifications sur votre compte jusqu\'au règlement de vos dettes.';
                    isBlocked = false;
                    canModify = false;
                } else if (userDu.amountDue > threshold1x) {
                    alertLevel = 1;
                    alertColor = 'yellow';
                    alertMessage = 'Vous avez du retard dans le règlement de vos facturations. Veuillez régulariser votre situation pour éviter les restrictions sur votre compte.';
                    isBlocked = false;
                    canModify = true;
                }
                
                res.locals.paymentOverdue = {
                    amountDue: userDu.amountDue,
                    expireDate: userDu.expireDate,
                    threshold1x: threshold1x,
                    threshold2x: threshold2x,
                    threshold3x: threshold3x,
                    alertLevel: alertLevel,
                    alertColor: alertColor,
                    alertMessage: alertMessage,
                    isOverdue: alertLevel > 0,
                    isBlocked: isBlocked,
                    canModify: canModify
                };
                
                if (alertLevel > 0) {
                    console.log(`💰 Alerte niveau ${alertLevel} détectée pour ${req.session.user.id}: ${userDu.amountDue} (seuils: 1x=${threshold1x}, 2x=${threshold2x}, 3x=${threshold3x})`);
                }
            } catch (error) {
                console.error('❌ Erreur vérification paiements:', error);
                res.locals.paymentOverdue = {
                    amountDue: 0,
                    expireDate: null,
                    threshold1x: 0,
                    threshold2x: 0,
                    threshold3x: 0,
                    alertLevel: 0,
                    alertColor: 'green',
                    alertMessage: '',
                    isOverdue: false,
                    isBlocked: false,
                    canModify: true
                };
            }
        } else {
            res.locals.calendarAutomationActive = false;
            res.locals.automationConnected = false;
            res.locals.paymentOverdue = {
                amountDue: 0,
                expireDate: null,
                threshold1x: 0,
                threshold2x: 0,
                threshold3x: 0,
                alertLevel: 0,
                alertColor: 'green',
                alertMessage: '',
                isOverdue: false,
                isBlocked: false,
                canModify: true
            };
        }
        
        next();
    } catch (error) {
        console.error('❌ Erreur middleware automatisations:', error);
        // En cas d'erreur, on affiche pas le calendrier
        res.locals.calendarAutomationActive = false;
        // Et on masque les automatisations en cas d'erreur
        res.locals.automationConnected = false;
        res.locals.paymentOverdue = {
            amountDue: 0,
            expireDate: null,
            threshold1x: 0,
            threshold2x: 0,
            threshold3x: 0,
            alertLevel: 0,
            alertColor: 'green',
            alertMessage: '',
            isOverdue: false,
            isBlocked: false,
            canModify: true
        };
        next();
    }
}

module.exports = {
    checkUserAutomations
};

