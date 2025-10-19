const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled, setFirebaseEnabled } = require('../config/environment');

// Nom de domaine
const DOMAIN_NAME = 'https://localhost:3000';

// Données de test (fallback)
const testData = {
    properties: [
        {
            id: '1',
            name: 'Appartement T34 - Rue de la Paix',
            type: 'Appartement',
            surface: 75,
            rooms: 3,
            address: '123 Rue de la Paix, 75001 Paris',
            coordinates: { lat: 48.8566, lng: 2.3522 },
            monthlyRent: 1200,
            status: 'loué',
            images: ['https://via.placeholder.com/400x300/4CAF50/ffffff?text=Appartement+T3'],
            description: 'Bel appartement lumineux avec balcon',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
        },
        {
            id: '2',
            name: 'Studio - Avenue Victor Hugo',
            type: 'Studio',
            surface: 25,
            rooms: 1,
            address: '456 Avenue Victor Hugo, 75016 Paris',
            coordinates: { lat: 48.8700, lng: 2.2800 },
            monthlyRent: 800,
            status: 'vacant',
            images: ['https://via.placeholder.com/400x300/2196F3/ffffff?text=Studio'],
            description: 'Studio moderne et fonctionnel',
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
        },
        {
            id: '3',
            name: 'Maison T4 - Boulevard Central',
            type: 'Maison',
            surface: 120,
            rooms: 4,
            address: '789 Boulevard Central, 92100 Boulogne',
            coordinates: { lat: 48.8333, lng: 2.2500 },
            monthlyRent: 2000,
            status: 'loué',
            images: ['https://via.placeholder.com/400x300/FF9800/ffffff?text=Maison+T4'],
            description: 'Maison spacieuse avec jardin',
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20')
        }
    ],
    tenants: [
        {
            id: '1',
            firstName: 'Marie',
            lastName: 'Dubois',
            email: 'marie.dubois@email.com',
            phone: '+33 1 23 45 67 89',
            propertyId: '1',
            monthlyRent: 1200,
            hasDebt: false,
            debtAmount: 0,
            avatar: null,
            profession: 'Ingénieure',
            workplace: 'TechCorp',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
        },
        {
            id: '2',
            firstName: 'Jean',
            lastName: 'Martin',
            email: 'jean.martin@email.com',
            phone: '+33 1 98 76 54 32',
            propertyId: '3',
            monthlyRent: 2000,
            hasDebt: true,
            debtAmount: 2000,
            avatar: null,
            profession: 'Médecin',
            workplace: 'Hôpital Central',
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date('2024-01-20')
        },
        {
            id: '3',
            firstName: 'Sophie',
            lastName: 'Bernard',
            email: 'sophie.bernard@email.com',
            phone: '+33 1 45 67 89 12',
            propertyId: '2',
            monthlyRent: 800,
            hasDebt: false,
            debtAmount: 0,
            avatar: null,
            profession: 'Avocate',
            workplace: 'Cabinet Legal',
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
        }
    ],
    payments: [
        {
            id: '1',
            tenantId: '1',
            propertyId: '1',
            amount: 1200,
            date: new Date('2024-03-01'),
            type: 'loyer',
            status: 'payé',
            method: 'virement',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-01')
        },
        {
            id: '2',
            tenantId: '2',
            propertyId: '3',
            amount: 2000,
            date: new Date('2024-02-01'),
            type: 'loyer',
            status: 'en_retard',
            method: 'virement',
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date('2024-02-01')
        },
        {
            id: '3',
            tenantId: '3',
            propertyId: '2',
            amount: 800,
            date: new Date('2024-03-01'),
            type: 'loyer',
            status: 'payé',
            method: 'chèque',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-03-01')
        }
    ]
};

class DataService {
    constructor() {
        this.useFirebase = isFirebaseEnabled();
    }

    // Méthodes pour les propriétés
    async getProperties(userId = null) {
        try {
            if (this.useFirebase) {
                //On recupere les proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                let filteredProperties = properties.filter(property => property.isDeleted !== true);
                
                // Filtrer par utilisateur si spécifié
                if (userId) {
                    filteredProperties = filteredProperties.filter(property => (property.ownerId === userId || ( property.tenant !== null && property.tenant.userId === userId)));
                }
                
                return filteredProperties;
                //return properties.filter(property => property.ownerId === ownerId);
            } else {
                return testData.properties;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des propriétés:', error);
            return testData.properties; // Fallback vers les données de test
        }
    }

    async getPropertyById(id) {
        try {
            if (this.useFirebase) {
                //On recupere les proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getById(COLLECTIONS.PROPERTIES, id);
                return properties.filter(property => property.isDeleted !== true);
                //return properties.filter(property => property.ownerId === ownerId);
            } else {
                return testData.properties.find(p => p.id === id) || null;
            }
        } catch (error) {
            console.error(`Erreur lors de la récupération de la propriété ${id}:`, error);
            return testData.properties.find(p => p.id === id) || null; // Fallback vers les données de test
        }
    }
    
    async getUsersByIds(ids) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getAll(COLLECTIONS.USERS);
            } else {
                return testData.users.filter(user => ids.includes(user.id));
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            return testData.users.filter(user => ids.includes(user.id));
        }
        
    }

    async getPropertyById(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.PROPERTIES, id);
            } else {
                return testData.properties.find(p => p.id === id) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la propriété:', error);
            return testData.properties.find(p => p.id === id) || null;
        }
    }

    async addProperty(propertyData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.add(COLLECTIONS.PROPERTIES, propertyData);
            } else {
                const newProperty = {
                    id: Date.now().toString(),
                    ...propertyData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                testData.properties.push(newProperty);
                return newProperty;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la propriété:', error);
            throw error;
        }
    }

    async updateProperty(id, propertyData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.update(COLLECTIONS.PROPERTIES, id, propertyData);
            } else {
                const index = testData.properties.findIndex(p => p.id === id);
                if (index !== -1) {
                    testData.properties[index] = {
                        ...testData.properties[index],
                        ...propertyData,
                        updatedAt: new Date()
                    };
                    return testData.properties[index];
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la propriété:', error);
            throw error;
        }
    }

    async deleteProperty(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.delete(COLLECTIONS.PROPERTIES, id);
            } else {
                const index = testData.properties.findIndex(p => p.id === id);
                if (index !== -1) {
                    testData.properties.splice(index, 1);
                    return { id };
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la propriété:', error);
            throw error;
        }
    }

    // Méthodes pour les locataires
    async getTenants(userId = null) {
        try {
            if (this.useFirebase) {
                // Récupérer tous les utilisateurs et filtrer ceux de type 'tenant'
                //on recupere les tenant.userId des proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                let filteredProperties = properties.filter(property => property.tenant !== null && property.isDeleted !== true);
                
                // Filtrer par utilisateur si spécifié
                if (userId) {
                    filteredProperties = filteredProperties.filter(property => property.tenant.userId === userId || property.ownerId === userId);
                }
                
                const tenantIds = filteredProperties.map(property => property.tenant.userId);
                
                const users = await firestoreUtils.getAll(COLLECTIONS.USERS);
                const tenants = users.filter(user => tenantIds.includes(user.id)).map(user => ({
                    id: user.id,
                    firstName: user.profile?.firstName || '',
                    lastName: user.profile?.lastName || '',
                    email: user.profile?.email || '',
                    phone: user.profile?.phone || '',
                    propertyId: null, // Sera établi plus tard
                    monthlyRent: user.tenant?.monthlyRent || 0,
                    hasDebt: user.tenant?.hasDebt || false,
                    debtAmount: user.tenant?.debtAmount || 0,
                    avatar: user.profile?.photo || null,
                    profession: user.profile?.profession || '',
                    workplace: user.profile?.workplace || '',
                    createdAt: user.createdAt || new Date(),
                    updatedAt: user.updatedAt || new Date(),
                    unpaidMonths: user.tenant?.unpaidMonths || 0
                }));
                return tenants;
            } else {
                return testData.tenants;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des locataires:', error);
            return testData.tenants;
        }
    }

    async getTenantById(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.TENANTS, id);
            } else {
                return testData.tenants.find(t => t.id === id) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du locataire:', error);
            return testData.tenants.find(t => t.id === id) || null;
        }
    }

    async addTenant(tenantData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.add(COLLECTIONS.TENANTS, tenantData);
            } else {
                const newTenant = {
                    id: Date.now().toString(),
                    ...tenantData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                testData.tenants.push(newTenant);
                return newTenant;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du locataire:', error);
            throw error;
        }
    }

    async updateTenant(id, tenantData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.update(COLLECTIONS.TENANTS, id, tenantData);
            } else {
                const index = testData.tenants.findIndex(t => t.id === id);
                if (index !== -1) {
                    testData.tenants[index] = {
                        ...testData.tenants[index],
                        ...tenantData,
                        updatedAt: new Date()
                    };
                    return testData.tenants[index];
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du locataire:', error);
            throw error;
        }
    }

    async deleteTenant(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.delete(COLLECTIONS.TENANTS, id);
            } else {
                const index = testData.tenants.findIndex(t => t.id === id);
                if (index !== -1) {
                    testData.tenants.splice(index, 1);
                    return { id };
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du locataire:', error);
            throw error;
        }
    }

    // Méthodes pour les paiements
    async getPayments(userId = null) {
        try {
            if (this.useFirebase) {
                //On recupere les proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                let filteredProperties = properties.filter(property => property.tenant !== null && property.isDeleted !== true);
                
                // Filtrer par utilisateur si spécifié
                if (userId) {
                    filteredProperties = filteredProperties.filter(property => (property.ownerId === userId || ( property.tenant !== null && property.tenant.userId === userId)));
                }
                
                const paymentIds = filteredProperties.map(property => property.tenant.userId);
                const paymentsAll = await firestoreUtils.getAll(COLLECTIONS.PAYMENTS);
                const payments = paymentsAll.filter(payment => paymentIds.includes(payment.userId)).map(payment => ({
                    id: payment.id,
                    tenantId: payment.userId,
                    propertyId: payment.propertyId,
                    amount: payment.amount,
                    date: payment.date,
                    type: payment.type,
                    status: payment.status,
                    method: payment.method,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                    userId: payment.userId
                }));
                return payments;
            } else {
                return testData.payments;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des paiements:', error);
            return testData.payments;
        }
    }

    async getPaymentById(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.PAYMENTS, id);
            } else {
                return testData.payments.find(p => p.id === id) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du paiement:', error);
            return testData.payments.find(p => p.id === id) || null;
        }
    }

    async addPayment(paymentData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.add(COLLECTIONS.PAYMENTS, paymentData);
            } else {
                const newPayment = {
                    id: Date.now().toString(),
                    ...paymentData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                testData.payments.push(newPayment);
                return newPayment;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout du paiement:', error);
            throw error;
        }
    }

    async updatePayment(id, paymentData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.update(COLLECTIONS.PAYMENTS, id, paymentData);
            } else {
                const index = testData.payments.findIndex(p => p.id === id);
                if (index !== -1) {
                    testData.payments[index] = {
                        ...testData.payments[index],
                        ...paymentData,
                        updatedAt: new Date()
                    };
                    return testData.payments[index];
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du paiement:', error);
            throw error;
        }
    }

    async deletePayment(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.delete(COLLECTIONS.PAYMENTS, id);
            } else {
                const index = testData.payments.findIndex(p => p.id === id);
                if (index !== -1) {
                    testData.payments.splice(index, 1);
                    return { id };
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du paiement:', error);
            throw error;
        }
    }

    // Méthodes utilitaires
    async getStatistics(userId = null) {
        try {
            const properties = await this.getProperties(userId);
            const tenants = await this.getTenants(userId);
            const payments = await this.getPayments(userId);

            const totalProperties = properties.length;
            const rentedProperties = properties.filter(p => p.status === 'loué').length;
            const vacantProperties = properties.filter(p => p.status === 'vacant').length;
            const totalMonthlyRevenue = properties
                .filter(p => p.status === 'loué')
                .reduce((sum, p) => sum + p.monthlyRent, 0);
            const tenantsWithDebt = tenants.filter(t => t.hasDebt).length;

            return {
                totalProperties,
                rentedProperties,
                vacantProperties,
                totalMonthlyRevenue,
                tenantsWithDebt
            };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            return {
                totalProperties: 0,
                rentedProperties: 0,
                vacantProperties: 0,
                totalMonthlyRevenue: 0,
                tenantsWithDebt: 0
            };
        }
    }

    // Méthode pour basculer entre Firebase et les données de test
    setUseFirebase(useFirebase) {
        this.useFirebase = useFirebase;
        setFirebaseEnabled(useFirebase);
    }

    // Méthode pour obtenir le statut actuel
    getFirebaseStatus() {
        return this.useFirebase;
    }

    // Méthodes pour les paramètres utilisateur
    async getUsers() {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getAll(COLLECTIONS.USERS);
            } else {
                // Données de test pour les utilisateurs
                return [
                    {
                        id: '1',
                        firstName: 'Admin',
                        lastName: 'BikoRentR',
                        email: 'admin33@bikorent.com',
                        phone: '+33 1 23 45 67 89',
                        profession: 'Gestionnaire immobilier',
                        workplace: 'BikoRent SAS',
                        address: '123 Rue de la Paix, 75001 Paris, France',
                        bio: 'Gestionnaire immobilier passionné avec plus de 10 ans d\'expérience dans la location et la gestion de propriétés.',
                        photo: null,
                        twoFactorAuth: false,
                        suspiciousLogin: true,
                        emailPayments: true,
                        emailOverdue: true,
                        emailNewTenants: false,
                        pushAlerts: true,
                        pushReminders: false,
                        reportFrequency: 'monthly',
                        language: 'fr',
                        timezone: 'Europe/Paris',
                        darkMode: false,
                        dateFormat: 'DD/MM/YYYY',
                        currency: 'EUR',
                        billingPlan: 'Premium',
                        billingPrice: 29.99,
                        billingCurrency: 'EUR',
                        paymentMethods: [
                            {
                                id: 1,
                                type: 'visa',
                                last4: '4242',
                                expiry: '12/25',
                                isDefault: true
                            }
                        ],
                        billingHistory: [
                            {
                                date: '01/03/2024',
                                description: 'Plan Premium - Mars 2024',
                                amount: 29.99,
                                status: 'paid'
                            },
                            {
                                date: '01/02/2024',
                                description: 'Plan Premium - Février 2024',
                                amount: 29.99,
                                status: 'paid'
                            },
                            {
                                date: '01/01/2024',
                                description: 'Plan Premium - Janvier 2024',
                                amount: 29.99,
                                status: 'paid'
                            }
                        ],
                        integrations: [
                            {
                                id: 'google-calendar',
                                name: 'Google Calendar',
                                description: 'Synchronisez vos événements de location',
                                icon: 'G',
                                color: '#4285f4',
                                connected: true
                            },
                            {
                                id: 'whatsapp',
                                name: 'WhatsApp Business',
                                description: 'Envoyez des messages automatiques aux locataires',
                                icon: 'W',
                                color: '#00c851',
                                connected: false
                            },
                            {
                                id: 'quickbooks',
                                name: 'QuickBooks',
                                description: 'Synchronisez vos données comptables',
                                icon: 'Q',
                                color: '#0073aa',
                                connected: false
                            },
                            {
                                id: 'zapier',
                                name: 'Zapier',
                                description: 'Automatisez vos workflows',
                                icon: 'Z',
                                color: '#ff6b35',
                                connected: false
                            }
                        ],
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-01')
                    }
                ];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            return [];
        }
    }

    async getUserById(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.USERS, id);
            } else {
                const users = await this.getUsers();
                return users.find(u => u.id === id) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    }
    async getUserAutomations(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.USER_AUTOMATIONS, id);
            } else {
                return testData.users.find(u => u.id === id).automations || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des automatisations de l\'utilisateur:', error);
            return null;
        }
    }
    async updateUserAutomations(id, automations) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.update(COLLECTIONS.USER_AUTOMATIONS, id, automations);
            } else {
                return testData.users.find(u => u.id === id).automations = automations;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour des automatisations de l\'utilisateur:', error);
            return null;
        }
    }
    async getUserBillingPlan(id) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getById(COLLECTIONS.USERS, id);
            } else {
                return testData.users.find(u => u.id === id).billing.plan || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du plan de facturation de l\'utilisateur:', error);
            return null;
        }
    }

    async getUserByEmail(email) {
        try {
            if (this.useFirebase) {
                // Pour Firebase, on doit récupérer tous les utilisateurs et filtrer
                const users = await this.getUsers();
                return users.find(u => u.profile && u.profile.email === email) || null;
            } else {
                const users = await this.getUsers();
                return users.find(u => u.profile && u.profile.email === email) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur par email:', error);
            return null;
        }
    }

    async updateUser(id, userData) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.update(COLLECTIONS.USERS, id, userData);
            } else {
                const users = await this.getUsers();
                const index = users.findIndex(u => u.id === id);
                if (index !== -1) {
                    users[index] = {
                        ...users[index],
                        ...userData,
                        updatedAt: new Date()
                    };
                    return users[index];
                }
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            throw error;
        }
    }

    // Méthodes pour les plans de facturation
    async getBillingPlans() {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getAll('billing_plans');
            } else {
                // Données de test pour les plans de facturation
                return [
                    {
                        id: 'basique',
                        name: 'Plan Basique',
                        description: 'Parfait pour débuter avec quelques propriétés',
                        maxProperties: 5,
                        pricePerProperty: 500,
                        currency: 'XAF',
                        features: ['Jusqu\'à 5 propriétés', 'Notifications de paiement', 'Support standard', 'Rapports de base']
                    },
                    {
                        id: 'standard',
                        name: 'Plan Standard',
                        description: 'Idéal pour gérer plusieurs propriétés efficacement',
                        maxProperties: 10,
                        pricePerProperty: 1000,
                        currency: 'XAF',
                        features: ['Jusqu\'à 10 propriétés', 'Notifications complètes', 'Support standard', 'Rapports généraux avancés']
                    },
                    {
                        id: 'premium',
                        name: 'Plan Premium',
                        description: 'Pour les gestionnaires professionnels',
                        maxProperties: 15,
                        pricePerProperty: 2500,
                        currency: 'XAF',
                        features: ['Jusqu\'à 15 propriétés', 'Notifications complètes', 'Support prioritaire', 'Rapports avancés complets', 'Intégration WhatsApp Business', 'Double authentification']
                    },
                    {
                        id: 'enterprise',
                        name: 'Plan Enterprise',
                        description: 'Solution complète pour les grandes entreprises',
                        maxProperties: -1,
                        pricePerProperty: 5000,
                        currency: 'XAF',
                        features: ['Propriétés illimitées', 'Notifications complètes', 'Support prioritaire', 'Rapports avancés complets', 'Toutes les intégrations API', 'Double authentification', 'Fonctionnalités avancées']
                    }
                ];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des plans de facturation:', error);
            return [];
        }
    }

    async getBillingPlanById(planId) {
        try {
            if (this.useFirebase) {
                const plans = await this.getBillingPlans();
                return plans.find(plan => plan.id === planId) || null;
            } else {
                const plans = await this.getBillingPlans();
                return plans.find(plan => plan.id === planId) || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du plan de facturation:', error);
            return null;
        }
    }

    async getPlanChange(userId) {
        try {
            if (this.useFirebase) {
                const userBilling = await firestoreUtils.getById(COLLECTIONS.USER_BILLING, userId);
                if (!userBilling) {
                    //On enregistre un nouveau user_billing
                    
                    const newUserBilling = await firestore
                    .collection(COLLECTIONS.USER_BILLING)
                    .doc(userId) // on précise l'ID du document
                    .set({
                        facturations: [],
                        paiements: []
                    });
                    return {
                        facturations: [],
                        paiements: []
                    };
                }
                return userBilling;
            } else {
                return testData.users.find(u => u.id === userId).billing.planChange || null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du changement de plan:', error);
            return null;
        }
    }

    async getDefaultPaymentMethod(userId) {
        try {
            if (this.useFirebase) {
                const paymentMethods = await firestoreUtils.getAll(COLLECTIONS.USER_PAYMENT_METHODS);
                return paymentMethods.find(method => method.userId === userId && method.isDefault);
            } else {
                return testData.users.find(u => u.id === userId).paymentMethods.find(method => method.isDefault);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la méthode de paiement par défaut:', error);
            return null;
        }
    }
       

    orderPlan(planId1, planId2) {
        const palnObject = {
            'basique': 1,
            'standard': 2,
            'premium': 3,
            'enterprise': 4
        }
        return palnObject[planId1] > palnObject[planId2];
    }

    async updateUserBillingPlan(userId, planId) {
        try {
            const plan = await this.getBillingPlanById(planId);
            if (!plan) {
                throw new Error('Plan de facturation non trouvé');
            }

            const billingData = {
                planId: plan.id,
                planName: plan.name,
                startDate: new Date(),
                isActive: true,
                propertiesCount: 0, // Sera mis à jour dynamiquement
                monthlyCost: 0, // Sera calculé dynamiquement
                lastUpdated: new Date()
            };

            return await this.updateUser(userId, {
                facturation: billingData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du plan de facturation:', error);
            throw error;
        }
    }

    async updateUserBillingPlan2(userId, userBilling) {
        //On met a jour dans user_billing
        return await firestoreUtils.update(COLLECTIONS.USER_BILLING, userId, userBilling);
    }

    // Méthodes pour les types de méthodes de paiement
    async getPaymentMethodTypes() {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.getAll('payment_method_types');
            } else {
                // Données de test pour les types de méthodes de paiement
                return [
                    {
                        id: 'airtel_money',
                        name: 'Airtel Money',
                        description: 'Paiement mobile via Airtel Money',
                        icon: 'fas fa-mobile-alt',
                        color: '#e60012',
                        parameters: [
                            {
                                name: 'phoneNumber',
                                label: 'Numéro de téléphone',
                                type: 'tel',
                                placeholder: '+237 6XX XXX XXX',
                                required: true,
                                validation: {
                                    pattern: '^\\+237[0-9]{9}$',
                                    message: 'Le numéro doit commencer par +237 suivi de 9 chiffres'
                                }
                            }
                        ]
                    },
                    {
                        id: 'mobicash',
                        name: 'Mobicash',
                        description: 'Paiement mobile via Mobicash',
                        icon: 'fas fa-mobile-alt',
                        color: '#00a651',
                        parameters: [
                            {
                                name: 'phoneNumber',
                                label: 'Numéro de téléphone',
                                type: 'tel',
                                placeholder: '+237 6XX XXX XXX',
                                required: true,
                                validation: {
                                    pattern: '^\\+237[0-9]{9}$',
                                    message: 'Le numéro doit commencer par +237 suivi de 9 chiffres'
                                }
                            }
                        ]
                    },
                    {
                        id: 'visa',
                        name: 'Visa',
                        description: 'Carte bancaire Visa',
                        icon: 'fab fa-cc-visa',
                        color: '#1a1f71',
                        parameters: [
                            {
                                name: 'cardNumber',
                                label: 'Numéro de carte',
                                type: 'text',
                                placeholder: '1234 5678 9012 3456',
                                required: true,
                                validation: {
                                    pattern: '^[0-9]{4}\\s[0-9]{4}\\s[0-9]{4}\\s[0-9]{4}$',
                                    message: 'Le numéro de carte doit contenir 16 chiffres séparés par des espaces'
                                }
                            },
                            {
                                name: 'expiryDate',
                                label: 'Date d\'expiration',
                                type: 'text',
                                placeholder: 'MM/AA',
                                required: true,
                                validation: {
                                    pattern: '^(0[1-9]|1[0-2])\\/([0-9]{2})$',
                                    message: 'Format: MM/AA (ex: 12/25)'
                                }
                            },
                            {
                                name: 'cvv',
                                label: 'Code CVV',
                                type: 'text',
                                placeholder: '123',
                                required: true,
                                validation: {
                                    pattern: '^[0-9]{3,4}$',
                                    message: 'Le CVV doit contenir 3 ou 4 chiffres'
                                }
                            },
                            {
                                name: 'cardholderName',
                                label: 'Nom du titulaire',
                                type: 'text',
                                placeholder: 'Jean Dupont',
                                required: true,
                                validation: {
                                    minLength: 2,
                                    message: 'Le nom doit contenir au moins 2 caractères'
                                }
                            }
                        ]
                    }
                ];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des types de méthodes de paiement:', error);
            return [];
        }
    }

    // Méthodes pour les méthodes de paiement des utilisateurs
    async getUserPaymentMethods(userId) {
        try {
            if (this.useFirebase) {
                const paymentMethods = await firestoreUtils.getAll('user_payment_methods');
                return paymentMethods.filter(method => method.userId === userId);
            } else {
                // Données de test pour les méthodes de paiement
                return [
                    {
                        id: '1',
                        userId: userId,
                        type: 'visa',
                        typeName: 'Visa',
                        isDefault: true,
                        parameters: {
                            cardNumber: '4242 4242 4242 4242',
                            expiryDate: '12/25',
                            cvv: '123',
                            cardholderName: 'Jean Dupont'
                        },
                        maskedData: {
                            cardNumber: '**** **** **** 4242',
                            expiryDate: '12/25'
                        },
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des méthodes de paiement:', error);
            return [];
        }
    }

    async addUserPaymentMethod(userId, paymentMethodData) {
        try {
            const newPaymentMethod = {
                userId: userId,
                type: paymentMethodData.type,
                typeName: paymentMethodData.typeName,
                isDefault: paymentMethodData.isDefault || false,
                parameters: paymentMethodData.parameters,
                maskedData: paymentMethodData.maskedData,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            if (this.useFirebase) {
                if(paymentMethodData.isDefault){
                    //On met a jour toutes les méthodes de paiement pour retirer le statut par défaut
                    const paymentMethods = await this.getUserPaymentMethods(userId);
                    for (const method of paymentMethods) {
                        if (method.isDefault) {
                            await firestoreUtils.update('user_payment_methods', method.id, {
                                isDefault: false,
                                updatedAt: new Date()
                            });
                        }
                    }
                    
                }
                return await firestoreUtils.add('user_payment_methods', newPaymentMethod);
            } else {
                // Mode test - ajouter à un tableau en mémoire
                const id = Date.now().toString();
                newPaymentMethod.id = id;
                return newPaymentMethod;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la méthode de paiement:', error);
            throw error;
        }
    }

    async deleteUserPaymentMethod(paymentMethodId) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.delete('user_payment_methods', paymentMethodId);
            } else {
                // Mode test - simuler la suppression
                return { id: paymentMethodId };
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la méthode de paiement:', error);
            throw error;
        }
    }

    async setDefaultPaymentMethod(userId, paymentMethodId) {
        try {
            if (this.useFirebase) {
                // Récupérer toutes les méthodes de paiement de l'utilisateur
                const paymentMethods = await this.getUserPaymentMethods(userId);
                
                // Mettre à jour toutes les méthodes pour retirer le statut par défaut
                for (const method of paymentMethods) {
                    if (method.isDefault) {
                        await firestoreUtils.update('user_payment_methods', method.id, {
                            isDefault: false,
                            updatedAt: new Date()
                        });
                    }
                }
                
                // Définir la nouvelle méthode par défaut
                return await firestoreUtils.update('user_payment_methods', paymentMethodId, {
                    isDefault: true,
                    updatedAt: new Date()
                });
            } else {
                // Mode test - simuler la mise à jour
                return { id: paymentMethodId, isDefault: true };
            }
        } catch (error) {
            console.error('Erreur lors de la définition de la méthode de paiement par défaut:', error);
            throw error;
        }
    }

    // Méthodes pour l'historique de facturation
    async getBillingHistory(userId, limit = 50) {
        try {
            if (this.useFirebase) {
                const allHistory = await firestoreUtils.getAll('billing_history');
                const userHistory = allHistory
                    .filter(item => item.userId === userId)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, limit);
                return userHistory;
            } else {
                // Données de test pour l'historique de facturation
                return [
                    {
                        id: 'BH001',
                        userId: userId,
                        invoiceNumber: 'INV-2024-001',
                        planName: 'Basique',
                        planId: 'basique',
                        amount: 5000,
                        currency: 'XAF',
                        status: 'paid',
                        paymentMethod: 'visa',
                        paymentMethodDetails: 'Visa se terminant par 4242',
                        billingPeriod: {
                            startDate: new Date('2024-01-01'),
                            endDate: new Date('2024-01-31')
                        },
                        dueDate: new Date('2024-01-15'),
                        paidDate: new Date('2024-01-10'),
                        propertiesCount: 2,
                        description: 'Facturation mensuelle - Plan Basique',
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-10')
                    },
                    {
                        id: 'BH002',
                        userId: userId,
                        invoiceNumber: 'INV-2024-002',
                        planName: 'Standard',
                        planId: 'standard',
                        amount: 15000,
                        currency: 'XAF',
                        status: 'paid',
                        paymentMethod: 'airtel_money',
                        paymentMethodDetails: 'Airtel Money (+237612345678)',
                        billingPeriod: {
                            startDate: new Date('2024-02-01'),
                            endDate: new Date('2024-02-29')
                        },
                        dueDate: new Date('2024-02-15'),
                        paidDate: new Date('2024-02-12'),
                        propertiesCount: 5,
                        description: 'Facturation mensuelle - Plan Standard',
                        createdAt: new Date('2024-02-01'),
                        updatedAt: new Date('2024-02-12')
                    },
                    {
                        id: 'BH003',
                        userId: userId,
                        invoiceNumber: 'INV-2024-003',
                        planName: 'Premium',
                        planId: 'premium',
                        amount: 30000,
                        currency: 'XAF',
                        status: 'pending',
                        paymentMethod: 'mobicash',
                        paymentMethodDetails: 'Mobicash (+237698765432)',
                        billingPeriod: {
                            startDate: new Date('2024-03-01'),
                            endDate: new Date('2024-03-31')
                        },
                        dueDate: new Date('2024-03-15'),
                        paidDate: null,
                        propertiesCount: 10,
                        description: 'Facturation mensuelle - Plan Premium',
                        createdAt: new Date('2024-03-01'),
                        updatedAt: new Date('2024-03-01')
                    }
                ];
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'historique de facturation:', error);
            return [];
        }
    }

    async addBillingHistory(billingHistory) {
        try {
            if (this.useFirebase) {
                return await firestoreUtils.add('billing_history', billingHistory);
            } else {
                return billingHistory;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'historique de facturation:', error);
            throw error;
        }
    }

    async getBillingHistoryStats(userId) {
        try {
            const history = await this.getBillingHistory(userId);
            
            const stats = {
                totalInvoices: history.length,
                paidInvoices: history.filter(item => item.status === 'paid').length,
                pendingInvoices: history.filter(item => item.status === 'pending').length,
                failedInvoices: history.filter(item => item.status === 'failed').length,
                totalPaid: history
                    .filter(item => item.status === 'paid')
                    .reduce((sum, item) => sum + item.amount, 0),
                totalPending: history
                    .filter(item => item.status === 'pending')
                    .reduce((sum, item) => sum + item.amount, 0),
                averageAmount: history.length > 0 
                    ? history.reduce((sum, item) => sum + item.amount, 0) / history.length 
                    : 0
            };
            
            return stats;
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques de facturation:', error);
            return {
                totalInvoices: 0,
                paidInvoices: 0,
                pendingInvoices: 0,
                failedInvoices: 0,
                totalPaid: 0,
                totalPending: 0,
                averageAmount: 0
            };
        }
    }

    async getUser(userId) {
        try {
            const user = await firestoreUtils.getById('users', userId);
            if (!user) {
                console.log('⚠️ Utilisateur non trouvé, utilisation des données de fallback');
                return null;
            }
            return user;
            } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }   
    }

    async getParametresData(userId = null) {
        try {
            const users = await this.getUsers();
            
            if (users.length === 0) {
                console.log('⚠️ Aucun utilisateur trouvé, utilisation des données de fallback');
                return null;
            }

            // Utiliser l'utilisateur spécifié ou chercher un utilisateur administrateur ou propriétaire
            let mainUser;
            if (userId) {
                mainUser = users.find(user => user.id === userId);
                if (!mainUser) {
                    console.log('⚠️ Utilisateur spécifié non trouvé, utilisation des données de fallback');
                    return null;
                }
            } else {
                mainUser = users.find(user => 
                    user.type === 'admin' || 
                    user.type === 'owner' || 
                    user.type === 'proprietaire' ||
                    (user.profile && user.profile.email === 'admin33@bikorent.com')
                ) || users[0];
            }
            
            console.log('✅ Données utilisateur récupérées:', {
                id: mainUser.id,
                type: mainUser.type,
                email: mainUser.profile ? mainUser.profile.email : 'N/A',
                firstName: mainUser.profile ? mainUser.profile.firstName : 'N/A',
                lastName: mainUser.profile ? mainUser.profile.lastName : 'N/A',
                photo: mainUser.profile ? mainUser.profile.photo : 'N/A',
                notifications: mainUser.notifications
            });

            // Construire l'objet parametresData à partir des données utilisateur
            const parametresData = {
                profile: {
                    firstName: mainUser.profile?.firstName || "",
                    lastName: mainUser.profile?.lastName || "",
                    email: mainUser.profile?.email || "",
                    phone: mainUser.profile?.phone || "",
                    profession: mainUser.profile?.profession || "",
                    workplace: mainUser.profile?.workplace || "",
                    address: mainUser.profile?.address || "",
                    bio: mainUser.profile?.bio || "",
                    photo: mainUser.profile?.photo || null
                },
                security: {
                    twoFactorAuth: mainUser.twoFactorAuth || false,
                    suspiciousLogin: mainUser.suspiciousLogin !== false
                },
                notifications: {
                    emailPayments: mainUser.notifications?.emailPayments || false,
                    emailOverdue: mainUser.notifications?.emailOverdue || false,
                    emailNewTenants: mainUser.notifications?.emailNewTenants || false,
                    pushAlerts: mainUser.notifications?.pushAlerts || false,
                    pushReminders: mainUser.notifications?.pushReminders || false,
                    reportFrequency: mainUser.notifications?.reportFrequency || "monthly"
                },
                preferences: {
                    language: mainUser.preferences?.language || "fr",
                    timezone: mainUser.preferences?.timezone || "Europe/Paris",
                    darkMode: mainUser.preferences?.darkMode || false,
                    dateFormat: mainUser.preferences?.dateFormat || "DD/MM/YYYY",
                    currency: mainUser.preferences?.currency || "EUR"
                },
                billing: {
                    plan: mainUser.facturation?.planName || "Plan Basique",
                    planId: mainUser.facturation?.planId || "basique",
                    price: mainUser.facturation?.monthlyCost || 0,
                    currency: "XAF",
                    startDate: mainUser.facturation?.startDate || new Date(mainUser.createdAt),
                    isActive: mainUser.facturation?.isActive !== false,
                    propertiesCount: mainUser.facturation?.propertiesCount || 0,
                    paymentMethods: mainUser.paymentMethods || [
                        /*{
                            id: 1,
                            type: "visa",
                            last4: "4242",
                            expiry: "12/25",
                            isDefault: true
                        }*/
                    ],
                    billingHistory: mainUser.billingHistory || [
                        {
                            date: "01/03/2024",
                            description: "Plan Basique - Mars 2024",
                            amount: 0,
                            status: "paid"
                        },
                        {
                            date: "01/02/2024",
                            description: "Plan Basique - Février 2024",
                            amount: 0,
                            status: "paid"
                        },
                        {
                            date: "01/01/2024",
                            description: "Plan Basique - Janvier 2024",
                            amount: 0,
                            status: "paid"
                        }
                    ]
                },
                integrations: mainUser.integrations || [
                    {
                        id: "automations",
                        name: "Automatisations",
                        description: "Automatisez vos tâches rapidement et facilement",
                        icon: "A",
                        color: "#4285f4",
                        connected: false
                    },
                    /*{
                        id: "google-calendar",
                        name: "Google Calendar",
                        description: "Synchronisez vos événements de location",
                        icon: "G",
                        color: "#4285f4",
                        connected: false
                    },
                    {
                        id: "whatsapp",
                        name: "WhatsApp Business",
                        description: "Envoyez des messages automatiques aux locataires",
                        icon: "W",
                        color: "#00c851",
                        connected: false
                    },
                    {
                        id: "quickbooks",
                        name: "QuickBooks",
                        description: "Synchronisez vos données comptables",
                        icon: "Q",
                        color: "#0073aa",
                        connected: false
                    },
                    {
                        id: "zapier",
                        name: "Zapier",
                        description: "Automatisez vos workflows",
                        icon: "Z",
                        color: "#ff6b35",
                        connected: false
                    }*/
                ]
            };
            
            console.log('📊 Données des paramètres construites:', {
                photo: parametresData.profile.photo,
                hasPhoto: !!parametresData.profile.photo,
                notifications: parametresData.notifications,
                preferences: parametresData.preferences
            });
            
            return parametresData;

        } catch (error) {
            console.error('Erreur lors de la récupération des données des paramètres:', error);
            return null;
        }
    }

    async sendMail (mailTo, subject, link, msg){
        const nodemailer = require('nodemailer');
        const mail = 'vyndore.angora@gmail.com';
        const pass = 'oxtsqvkrwjuvmmmz ';
        link = DOMAIN_NAME + link;
        return new Promise((resolve, reject) => {
            //Confguration du transporteur
            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth:{
                    user: mail,
                    pass: pass
                },
                connectionTimeout: 10000, // 10s
                socketTimeout: 20000 // 20s
            });
    
            //Detail de l'email
            const mailOptions = {
                from: 'BikoRent',
                to: mailTo,
                subject: subject,
                html: this.buildEmailPayement(link, msg)
            };
    
            //Envoi de l'email
            transporter.sendMail(mailOptions, (error, info) => {
                if(error){
                    console.log('Erreur lors de l\'envoi de l\'email: ', error);
                    reject(error);
                }else{
                    console.log('E-mail envoye: ', info.response);
                    resolve(info.response);
                }
            });
        });
    }
    
    buildEmailPayement(link, msg){
        return `
    <html>
    <head>
        <body>
        <div id=":251" class="a3s aiL msg-3130424687010682690">
        <u></u>
        <div style="margin:0;padding:0" bgcolor="#FFFFFF">
            <table width="100%" height="100%" style="min-width:348px" border="0" cellspacing="0" cellpadding="0" lang="en">
                <tbody>
                    <tr height="32" style="height:32px">
                        <td></td>
                    </tr>
                    <tr align="center">
                        <td>
                            <div>
                                <div></div>
                            </div>
                            <table border="0" cellspacing="0" cellpadding="0" style="padding-bottom:20px;max-width:516px;min-width:220px">
                                <tbody>
                                    <tr>
                                        <td width="8" style="width:8px"></td>
                                        <td>
                                            <div style="border-style:solid;border-width:thin;border-color:#dadce0;border-radius:8px;padding:40px 20px" align="center" class="m_-3130424687010682690mdv2rw">
                                                <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;border-bottom:thin solid #dadce0;color:rgba(0,0,0,0.87);line-height:32px;padding-bottom:24px;text-align:center;word-break:break-word">
                                              <h2 style="display: inline-block; font-size: 50px;">
                                              <span style="color: #34495e;border: 3px solid #EDF1FF !important;padding-left:8px;padding-right:8px" class=" font-weight-bold border px-2 mr-1">B</span>
              </h2><span style="font-size: 20px;font-weight:bold"><span style="color: #2ecc71;">i</span><span style="color: #3498db">k</span><span style="color: #e74c3c;">o</span style="color: #3498db"><span style="color: #2ecc71;">r</span><span style="color: #34495e;">e</span><span style="color: #2ecc71;">n</span><span style="color: #3498db">t</span></span> 
                                              
                                                <div style="font-size:24px">${msg}.</div>
                                            </div>
                                            <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:left">
                                            Connectez-vous pour plus d'informations
                                                <div style="padding-top:32px;text-align:center">
                                                    <a href="www.bikorent.com${link}" style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;line-height:16px;color:#ffffff;font-weight:400;text-decoration:none;font-size:14px;display:inline-block;padding:10px 24px;background-color:#4184f3;border-radius:5px;min-width:90px" target="_blank" data-saferedirecturl="${link}">Détails</a>
                                                </div>
                                                <div style="padding-top:40px">Ce message est automatique, Aucune réponse de votre part n'est attendue.<p><br>Cordialement,<br>L'équipe BikoRent</p></div>
                                            </div>
                                        </div>
                                        <div style="text-align:left">
                                            <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">
                                                <div>L'utilisateur aura la possibilite de noter la qualite de vos services, cette note pourrait impacter positivement ou negativement votre commerce, ainsi qu'encourager ou decourager de potentiel acheteur. Nous vous invitons par consequent a reagir rapidement a cet email.</div>
                                                <div style="direction:ltr">© 2023 Angora, <a class="m_-3130424687010682690afal" style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">Port-Gentil BP 941, Gabon</a></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td width="8" style="width:8px"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr height="32" style="height:32px"><td></td></tr>
            </tbody>
        </table>
    </div>
    </div>
        </body>
    </head>
    </html>
    
        `;
    }

    async getUserDu(userId) {
        const user_billing = await this.getPlanChange(userId);
        if(!user_billing){
            return {
                amountDue: 0,
                amountPayed: 0,
                expireDate: new Date()
            };
        }
        console.log('user_billing', user_billing);
        
        //Onnrecupere les couts des facturations
        const billing_plans = await this.getBillingPlans();
        const cost_billing_plans = {};
        for(const billing_plan of billing_plans){
            cost_billing_plans[billing_plan.id] = billing_plan.pricePerProperty;
        }
        let amountDue = 0;
        let endDate = new Date();
        for(let i = 0; i < user_billing.facturations.length; i++){
            const billing1st = user_billing.facturations[i];
            const startDate = new Date(billing1st.date);
            endDate = new Date();
            if(i < user_billing.facturations.length - 1){
                const billing2nd = user_billing.facturations[i + 1];
                endDate = new Date(billing2nd.date);
            }else{
                endDate = new Date();
            }
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const dette = cost_billing_plans[billing1st.planId] * billing1st.propertyCount * days / 30;
            amountDue += dette
            //console.log('Dette: ', dette, 'Plan: ', billing1st.planId, 'PropertyCount: ', billing1st.propertyCount, 'Days: ', days, 'StartDate: ', startDate, 'EndDate: ', endDate);
            

            
        }
        //const payements = user_billing.payments;
        //const amountPayed = payements.reduce((sum, payment) => sum + payment.amount, 0);

        let billing_history = await this.getBillingHistory(userId, 1000000000);
        let lastBillingDate;
        if(billing_history.length === 0){
            billing_history = [];
            lastBillingDate = new Date();
        }else{
            lastBillingDate = new Date(billing_history[billing_history.length - 1].date || billing_history[billing_history.length - 1].dueDate);
        }
        const amountPayed = billing_history.reduce((sum, payment) => sum + payment.amount, 0);
        
        amountDue = amountDue - amountPayed;
        return {
            amountDue: Math.round(amountDue),
            amountPayed: Math.round(amountPayed),
            expireDate: new Date(lastBillingDate) + 30 * 24 * 60 * 60 * 1000
        };

    }

    async singlePayement(idcom, id, montant, numero, apikey){
        const axios = require('axios');
        const constante  = require('../config/constantes').const;
        return new Promise((resolve, reject) => {
            //On construit les donnees
            var dt = {};
            var trans_home = this.classifierNumero(numero);
            
            dt = {
                rsid: id,
                apikey: apikey,
                id: idcom,
                montant: montant,
                data: {idcom: idcom}
            };
            if(trans_home == constante.trans_home.MOBIDYC){
                dt.smid = numero;
            }else{
                dt.snid = numero;
            }
            //On envoi la requette a Mobidyc
            axios.post(constante.singePayementURL,dt).then(function(response) {
                
                var resp = response.data;
                //On verifi si le montant est correcte
                resolve(resp);
                //On recupere l id com puis on met a jour la transaction
            }).catch((err) => {
                //La transaction a echouee
                var status = err.response?.status;
                var data = err.response?.data;
                status = (status == undefined)? 501 : status;
                data = (data == undefined)? "Erreure interne" : data;
                console.log(err.response?.status);
                console.log(err);
                reject({status: status, error: data});
            });
        })
    }

    classifierNumero(numero) {
        const trans_home =  {
            AIRTEL_MONEY: "AIRTEL_MONEY",
            MOOV_MONEY: "MOOV_MONEY",
            MOBIDYC: "MOBIDYC",
            NONE: "NONE"
        };
        // Expression régulière pour le format attendu
        const regexCategorie1 = /^(077|074)\d{6}$/;
        const regexCategorie2 = /^(066|062)\d{6}$/;
        const regexMob = /^[1-9]\d{7}$/;
    
        // Test de la correspondance avec les deux catégories
        if (regexCategorie1.test(numero)) {
            return trans_home.AIRTEL_MONEY;
        } else if (regexCategorie2.test(numero)) {
            return trans_home.MOOV_MONEY;
        } else if(regexMob.test(numero)){
            return trans_home.MOBIDYC;
        } else {
            return trans_home.NONE;
        }
    }

    async addServiceToMobidyc(data){
        const axios = require('axios');
        const constante  = require('../config/constantes').const;

        var dt = {
            nom: data.nom,
            uid: data.uid,
        };
        console.log('UUUUUUUUUUUUUUU2');
        console.log(dt);
        return new Promise((resolve, reject) => {
            axios.post(`${constante.addrMobidyc}api/services/add`,dt).then(function(response) {
                //console.log(response.data);
                //console.log('okokokkkokok');
                if(response.data[0]){
                    //Mise a jour de l'identifiant mobidic
                    var updateData = response.data[1];
                    //console.log(updateData);
                    /*bdd.collection('magazins').updateOne(
                        {_id: result.insertedId},
                        {$set: {_idmob: new mongoObject(updateData.sid), apikey: updateData.apikey}}
                    ); */
                    resolve(updateData);
    
                    //console.log('UUUUUUUUUUUUUUU3');
                }else{
                    //TO DO
                    //console.log('UUUUUUUUUUUUUUU4');
                }
                //console.log('UUUUUUUUUUUUUUU6');
            }).catch((err) => {
                console.log("Une errere est ssurvenue lors de lajout du service Mobidyc:  ");
                console.log(err);
                reject(err);
            })
        });
    }

    async addUserToMobidyc(data){
        const axios = require('axios');
        const constante  = require('../config/constantes').const;

        return new Promise((resolve, reject) => {
            var dt = {
                nom: data.nom,
                prenom: data.prenom,
                mail: data.mail,
                mdp: data.mdp,
                tel: data.tel,
            };
            
            axios.post(`${constante.addrMobidyc}api/users/register/`,dt).then(function(response) {
                if(response.data.userId != undefined){
                    /*bdd.collection('utilisateurs').updateOne(
                        {_id: result.insertedId},
                        {$set: {_idmob: new mongoObject(response.data.userId)}}
                    ); */
                    resolve(response.data.userId); 
                }else{
                    reject(response.data.error);
                }
                
            }).catch((err)=>{
                console.log('ERR: '+err);
                reject(err);
            })
            
            
        });
    }

    
}

module.exports = new DataService(); 