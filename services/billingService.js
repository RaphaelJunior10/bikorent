const dataService = require('./dataService');
const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');

/**
 * Service de gestion des permissions basé sur les plans de facturation
 */
class BillingService {
    
    /**
     * Récupère le plan de facturation d'un utilisateur
     */
    async getUserBillingPlan(userId) {
        try {
            if (!isFirebaseEnabled()) {
                // Mode test - retourner le plan basique par défaut
                return {
                    planId: 'basique',
                    planName: 'Plan Basique',
                    maxProperties: 5,
                    notifications: ['nouveau_paiement'],
                    supportPrioritaire: false,
                    rapportsAvances: { general: false, proprietes: false },
                    integrationsAPI: [],
                    doubleSecurite: false,
                    pricePerProperty: 500,
                    currency: 'XAF'
                };
            }

            const user = await dataService.getUser(userId);
            if (!user || !user.facturation) {
                return this.getDefaultPlan();
            }

            // Récupérer les détails du plan depuis la base de données
            const billingPlans = await firestoreUtils.getAll('billing_plans');
            const userPlan = billingPlans.find(plan => plan.id === user.facturation.planId);
            
            if (!userPlan) {
                console.warn(`Plan de facturation non trouvé pour l'utilisateur ${userId}:`, user.facturation.planId);
                return this.getDefaultPlan();
            }

            return {
                planId: userPlan.id,
                planName: userPlan.name,
                maxProperties: userPlan.maxProperties,
                notifications: userPlan.notifications || [],
                supportPrioritaire: userPlan.supportPrioritaire || false,
                rapportsAvances: userPlan.rapportsAvances || { general: false, proprietes: false },
                integrationsAPI: userPlan.integrationsAPI || [],
                doubleSecurite: userPlan.doubleSecurite || false,
                pricePerProperty: userPlan.pricePerProperty || 0,
                currency: userPlan.currency || 'XAF'
            };
        } catch (error) {
            console.error('Erreur lors de la récupération du plan de facturation:', error);
            return this.getDefaultPlan();
        }
    }

    /**
     * Vérifie si un utilisateur peut effectuer une action
     */
    async canUserPerformAction(userId, action, context = {}) {
        try {
            const userPlan = await this.getUserBillingPlan(userId);
            const userProperties = await this.getUserPropertiesCount(userId);
            
            switch (action) {
                case 'view_dashboard':
                    return { allowed: true, reason: null };
                
                case 'view_properties':
                    return { allowed: true, reason: null };
                
                case 'add_property':
                    if (userPlan.maxProperties === -1) {
                        return { allowed: true, reason: null };
                    }
                    if (userProperties >= userPlan.maxProperties) {
                        return { 
                            allowed: false, 
                            reason: `Limite de ${userPlan.maxProperties} propriétés atteinte. Plan actuel: ${userPlan.planName}`,
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            limit: userPlan.maxProperties
                        };
                    }
                    return { allowed: true, reason: null };
                
                case 'view_advanced_reports':
                    if (!userPlan.rapportsAvances.general) {
                        return { 
                            allowed: false, 
                            reason: 'Rapports avancés non disponibles avec votre plan actuel',
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            requiredFeature: 'rapports_avances'
                        };
                    }
                    return { allowed: true, reason: null, };
                
                case 'view_property_reports':
                    if (!userPlan.rapportsAvances.proprietes) {
                        return { 
                            allowed: false, 
                            reason: 'Rapports par propriété non disponibles avec votre plan actuel',
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            requiredFeature: 'rapports_proprietes'
                        };
                    }
                    return { allowed: true, reason: null };
                
                case 'use_whatsapp_integration':
                    if (!userPlan.integrationsAPI.includes('whatsapp_business')) {
                        return { 
                            allowed: false, 
                            reason: 'Intégration WhatsApp Business non disponible avec votre plan actuel',
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            requiredFeature: 'whatsapp_integration'
                        };
                    }
                    return { allowed: true, reason: null };
                
                case 'use_priority_support':
                    if (!userPlan.supportPrioritaire) {
                        return { 
                            allowed: false, 
                            reason: 'Support prioritaire non disponible avec votre plan actuel',
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            requiredFeature: 'support_prioritaire'
                        };
                    }
                    return { allowed: true, reason: null };
                
                case 'use_double_security':
                    if (!userPlan.doubleSecurite) {
                        return { 
                            allowed: false, 
                            reason: 'Double authentification non disponible avec votre plan actuel',
                            upgradeRequired: true,
                            currentPlan: userPlan.planName,
                            requiredFeature: 'double_security'
                        };
                    }
                    return { allowed: true, reason: null };
                
                default:
                    return { allowed: true, reason: null };
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            return { allowed: false, reason: 'Erreur lors de la vérification des permissions' };
        }
    }

    /**
     * Récupère le nombre de propriétés d'un utilisateur
     */
    async getUserPropertiesCount(userId) {
        try {
            const properties = await dataService.getProperties(userId);
            return properties.length;
        } catch (error) {
            console.error('Erreur lors du comptage des propriétés:', error);
            return 0;
        }
    }

    /**
     * Récupère le plan par défaut (basique)
     */
    getDefaultPlan() {
        return {
            planId: 'basique',
            planName: 'Plan Basique',
            maxProperties: 5,
            notifications: ['nouveau_paiement'],
            supportPrioritaire: false,
            rapportsAvances: { general: false, proprietes: false },
            integrationsAPI: [],
            doubleSecurite: false,
            pricePerProperty: 500,
            currency: 'XAF'
        };
    }

    /**
     * Génère un message de mise à niveau de plan
     */
    generateUpgradeMessage(permissionResult) {
        const { reason, currentPlan, requiredFeature, limit } = permissionResult;
        
        let upgradeMessage = {
            title: 'Fonctionnalité non disponible',
            message: reason,
            currentPlan: currentPlan,
            upgradeRequired: true
        };

        // Messages spécifiques selon la fonctionnalité
        switch (requiredFeature) {
            case 'rapports_avances':
                upgradeMessage.suggestedPlan = 'Plan Standard ou supérieur';
                upgradeMessage.featureDescription = 'Accédez aux rapports avancés et aux analyses détaillées';
                break;
            case 'rapports_proprietes':
                upgradeMessage.suggestedPlan = 'Plan Premium ou supérieur';
                upgradeMessage.featureDescription = 'Générez des rapports détaillés par propriété';
                break;
            case 'whatsapp_integration':
                upgradeMessage.suggestedPlan = 'Plan Premium ou supérieur';
                upgradeMessage.featureDescription = 'Intégration WhatsApp Business pour la communication automatisée';
                break;
            case 'support_prioritaire':
                upgradeMessage.suggestedPlan = 'Plan Premium ou supérieur';
                upgradeMessage.featureDescription = 'Support prioritaire pour une assistance rapide';
                break;
            case 'double_security':
                upgradeMessage.suggestedPlan = 'Plan Premium ou supérieur';
                upgradeMessage.featureDescription = 'Double authentification pour une sécurité renforcée';
                break;
            default:
                if (limit) {
                    upgradeMessage.suggestedPlan = 'Plan Standard ou supérieur';
                    upgradeMessage.featureDescription = `Augmentez votre limite de propriétés (actuellement: ${limit})`;
                }
        }

        return upgradeMessage;
    }

    /**
     * Vérifie les permissions pour une page spécifique
     */
    async checkPagePermissions(userId, pageName) {
        const permissions = {};
        
        switch (pageName) {
            case 'dashboard':
                permissions.viewAdvancedStats = await this.canUserPerformAction(userId, 'view_advanced_reports');
                permissions.viewPropertyReports = await this.canUserPerformAction(userId, 'view_property_reports');
                break;
            
            case 'proprietes':
                permissions.addProperty = await this.canUserPerformAction(userId, 'add_property');
                permissions.viewAdvancedReports = await this.canUserPerformAction(userId, 'view_property_reports');
                break;
            
            case 'locataires':
                permissions.useWhatsApp = await this.canUserPerformAction(userId, 'use_whatsapp_integration');
                break;
            
            case 'paiements':
                permissions.viewAdvancedReports = await this.canUserPerformAction(userId, 'view_advanced_reports');
                break;
            
            case 'rapports':
                permissions.viewAdvancedReports = await this.canUserPerformAction(userId, 'view_advanced_reports');
                permissions.viewPropertyReports = await this.canUserPerformAction(userId, 'view_property_reports');
                break;
        }
        
        return permissions;
    }
}

module.exports = new BillingService();
