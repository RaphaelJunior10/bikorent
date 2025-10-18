const express = require('express');
const router = express.Router();
const automationService = require('../services/automationService');
const dataService = require('../services/dataService');

// Page des automatisations
router.get('/', async (req, res) => {
    // Vérifier l'authentification
    if (!req.session || !req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            console.log('❌ Utilisateur non trouvé');
            return res.redirect('/auth/login');
        }

        // Vérifier si l'utilisateur a un plan Premium ou Entreprise
        const userPlan = user.facturation?.planId || 'basique';
        console.log(`🔍 Plan utilisateur: ${userPlan}`);
        
        if (userPlan !== 'enterprise') {
            console.log('❌ Accès refusé - Plan insuffisant');
            return res.render('upgrade-required', {
                title: 'Accès refusé - BikoRent',
                currentPage: 'automatisations',
                pageTitle: 'Accès refusé',
                isAuthenticated: true,
                user: req.session.user,
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }
        // Récupérer les automatisations depuis Firebase
        const allAutomations = await automationService.getAllAutomations();
        console.log('📊 Automatisations récupérées:', allAutomations.length);
        
        // Récupérer les paramètres utilisateur
        const userAutomations = await automationService.getUserAutomations(req.session.user.id);
        console.log('👤 Paramètres utilisateur:', JSON.stringify(userAutomations, null, 2));

        // Fusionner les données
        const automations = allAutomations.map(auto => {
            const userIsActive = userAutomations.automations?.[auto.id]?.isActive;
            console.log(`🔍 ${auto.id}: isActive dans BDD = ${userIsActive}, défaut = ${auto.isActive}`);
            
            return {
                ...auto,
                userIsActive: userIsActive !== undefined ? userIsActive : auto.isActive,
                userSettings: userAutomations.automations?.[auto.id]?.settings || {}
            };
        });
        
        console.log('✅ Automatisations fusionnées:', automations.map(a => ({ id: a.id, userIsActive: a.userIsActive })));

        res.render('automatisations', {
            title: 'Automatisations - BikoRent',
            currentPage: 'automatisations',
            pageTitle: 'Automatisations',
            isAuthenticated: true,
            user: req.session.user,
            automations: automations
        });

    } catch (error) {
        console.error('❌ Erreur chargement automatisations:', error);
        res.status(500).render('error', {
            title: 'Erreur - BikoRent',
            currentPage: 'automatisations',
            message: 'Erreur lors du chargement des automatisations',
            isAuthenticated: true,
            user: req.session.user
        });
    }
});

// API pour activer/désactiver une automatisation
router.post('/api/toggle/:automationId', async (req, res) => {
    try {
        console.log('📡 API toggle appelée');
        
        if (!req.session || !req.session.user) {
            console.log('❌ Utilisateur non authentifié');
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.billing?.plan || 'free';
        if (userPlan !== 'premium' && userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        const { automationId } = req.params;
        const { isActive } = req.body;

        console.log(`🔄 Toggle automatisation: ${automationId} -> ${isActive} pour user ${req.session.user.id}`);

        const result = await automationService.toggleAutomation(
            req.session.user.id,
            automationId,
            isActive
        );

        console.log('📊 Résultat:', result);
        res.json(result);

    } catch (error) {
        console.error('❌ Erreur toggle automatisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour'
        });
    }
});

// API pour mettre à jour les paramètres d'une automatisation
router.post('/api/settings/:automationId', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ success: false, message: 'Non autorisé' });
        }

        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.billing?.plan || 'free';
        if (userPlan !== 'premium' && userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        const { automationId } = req.params;
        const { settings } = req.body;

        const result = await automationService.updateAutomationSettings(
            req.session.user.id,
            automationId,
            settings
        );

        res.json(result);

    } catch (error) {
        console.error('❌ Erreur mise à jour paramètres:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour des paramètres'
        });
    }
});

// API pour exécuter manuellement la vérification des retards de paiement
router.post('/api/check-unpaid-rent', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Non autorisé' 
            });
        }

        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.billing?.plan || 'free';
        if (userPlan !== 'premium' && userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        console.log('🔔 Exécution manuelle de la vérification des retards de paiement...');

        // Exécuter la vérification
        await automationService.checkUnpaidRentNotifications();

        res.json({
            success: true,
            message: 'Vérification des retards de paiement effectuée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur lors de la vérification des retards:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des retards de paiement',
            error: error.message
        });
    }
});

// API pour exécuter manuellement la vérification des expirations de bail
router.post('/api/check-lease-expiry', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Non autorisé' 
            });
        }

        // Vérifier le plan de l'utilisateur
        const user = await dataService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const userPlan = user.billing?.plan || 'free';
        if (userPlan !== 'premium' && userPlan !== 'enterprise') {
            return res.status(403).json({ 
                success: false, 
                message: 'Seuls les membres Entreprise ont accès à cette fonctionnalité. Mettez à jour votre forfait pour y accéder.',
                requiredPlan: 'enterprise'
            });
        }

        console.log('📅 Exécution manuelle de la vérification des expirations de bail...');

        // Exécuter la vérification
        await automationService.checkLeaseExpiryReminders();

        res.json({
            success: true,
            message: 'Vérification des expirations de bail effectuée avec succès'
        });

    } catch (error) {
        console.error('❌ Erreur lors de la vérification des expirations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification des expirations de bail',
            error: error.message
        });
    }
});

module.exports = router;