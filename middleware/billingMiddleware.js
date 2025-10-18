const billingService = require('../services/billingService');

/**
 * Middleware pour vérifier les permissions de facturation
 */
const checkBillingPermission = (action) => {
    return async (req, res, next) => {
        try {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Utilisateur non authentifié' 
                });
            }

            const userId = req.session.user.id;
            const permissionResult = await billingService.canUserPerformAction(userId, action);

            if (!permissionResult.allowed) {
                const upgradeMessage = billingService.generateUpgradeMessage(permissionResult);
                
                // Si c'est une requête AJAX, retourner JSON
                if (req.xhr || req.headers.accept?.includes('application/json')) {
                    return res.status(403).json({
                        success: false,
                        message: permissionResult.reason,
                        upgradeRequired: true,
                        upgradeMessage: upgradeMessage
                    });
                }
                
                // Sinon, rediriger vers la page de paramètres avec un message
                req.flash('error', upgradeMessage.message);
                return res.redirect('/parametres?tab=billing');
            }

            // Ajouter les informations de permission à la requête
            req.billingPermissions = {
                allowed: true,
                action: action,
                plan: await billingService.getUserBillingPlan(userId)
            };

            next();
        } catch (error) {
            console.error('Erreur dans le middleware de facturation:', error);
            
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la vérification des permissions'
                });
            }
            
            req.flash('error', 'Erreur lors de la vérification des permissions');
            return res.redirect('/dashboard');
        }
    };
};

/**
 * Middleware pour vérifier les permissions de page
 */
const checkPagePermissions = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return next();
        }

        const userId = req.session.user.id;
        
        // Extraire le nom de la page de manière plus robuste
        let pageName = '';
        
        // Utiliser req.baseUrl pour obtenir le chemin de base du router
        if (req.baseUrl) {
            // Si on a un baseUrl (ex: /rapports), l'utiliser
            pageName = req.baseUrl.replace('/', '');
        } else if (req.route && req.route.path) {
            // Si on a une route définie, utiliser son path
            pageName = req.route.path.replace('/', '');
        } else {
            // Sinon, extraire du path de la requête
            const pathParts = req.path.split('/').filter(part => part !== '');
            pageName = pathParts[0] || 'dashboard';
        }
        
        // Récupérer les permissions pour cette page
        const permissions = await billingService.checkPagePermissions(userId, pageName);
        console.log('🔍 Debug middleware:');
        console.log('  - req.path:', req.path);
        console.log('  - req.baseUrl:', req.baseUrl);
        console.log('  - req.originalUrl:', req.originalUrl);
        console.log('  - req.route:', req.route);
        console.log('  - pageName extrait:', pageName);
        console.log('  - permissions:', permissions);
        // Ajouter les permissions à la requête
        req.pagePermissions = permissions;
        req.userBillingPlan = await billingService.getUserBillingPlan(userId);
        
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification des permissions de page:', error);
        next();
    }
};

/**
 * Middleware pour vérifier la limite de propriétés
 */
const checkPropertyLimit = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non authentifié' 
            });
        }

        const userId = req.session.user.id;
        const permissionResult = await billingService.canUserPerformAction(userId, 'add_property');

        if (!permissionResult.allowed) {
            const upgradeMessage = billingService.generateUpgradeMessage(permissionResult);
            
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: permissionResult.reason,
                    upgradeRequired: true,
                    upgradeMessage: upgradeMessage
                });
            }
            
            req.flash('error', upgradeMessage.message);
            return res.redirect('/proprietes');
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de la limite de propriétés:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification de la limite de propriétés'
            });
        }
        
        req.flash('error', 'Erreur lors de la vérification de la limite de propriétés');
        return res.redirect('/proprietes');
    }
};

/**
 * Middleware pour vérifier l'accès aux rapports avancés
 */
const checkAdvancedReportsAccess = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non authentifié' 
            });
        }

        const userId = req.session.user.id;
        const permissionResult = await billingService.canUserPerformAction(userId, 'view_advanced_reports');

        if (!permissionResult.allowed) {
            const upgradeMessage = billingService.generateUpgradeMessage(permissionResult);
            
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: permissionResult.reason,
                    upgradeRequired: true,
                    upgradeMessage: upgradeMessage
                });
            }
            
            req.flash('error', upgradeMessage.message);
            return res.redirect('/rapports');
        }

        next();
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'accès aux rapports:', error);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification de l\'accès aux rapports'
            });
        }
        
        req.flash('error', 'Erreur lors de la vérification de l\'accès aux rapports');
        return res.redirect('/rapports');
    }
};

module.exports = {
    checkBillingPermission,
    checkPagePermissions,
    checkPropertyLimit,
    checkAdvancedReportsAccess
};
