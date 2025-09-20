const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled, setFirebaseEnabled } = require('../config/environment');

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
    async getProperties() {
        try {
            if (this.useFirebase) {
                //On recupere les proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                return properties.filter(property => property.isDeleted !== true);
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
    async getTenants() {
        try {
            if (this.useFirebase) {
                // Récupérer tous les utilisateurs et filtrer ceux de type 'tenant'
                //on recupere les tenant.userId des proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                //const tenantIds = properties.filter(property => property.ownerId === ownerId && property.tenant !== null).map(property => property.tenant.userId);
                const tenantIds = properties.filter(property => property.tenant !== null && property.isDeleted !== true).map(property => property.tenant.userId);
                
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
    async getPayments() {
        try {
            if (this.useFirebase) {
                //On recupere les proprietes appartenant a l'ownerId
                const properties = await firestoreUtils.getAll(COLLECTIONS.PROPERTIES);
                //const paymentIds = properties.filter(property => property.ownerId === ownerId && property.tenant !== null).map(property => property.tenant.userId); //si property.tenant == null, on passe
                const paymentIds = properties.filter(property => property.tenant !== null && property.isDeleted !== true).map(property => property.tenant.userId);
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
    async getStatistics() {
        try {
            const properties = await this.getProperties();
            const tenants = await this.getTenants();
            const payments = await this.getPayments();

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

    async getParametresData() {
        try {
            const users = await this.getUsers();
            
            if (users.length === 0) {
                console.log('⚠️ Aucun utilisateur trouvé, utilisation des données de fallback');
                return null;
            }

            // Chercher un utilisateur administrateur ou propriétaire, sinon prendre le premier
            const mainUser = users.find(user => 
                user.type === 'admin' || 
                user.type === 'owner' || 
                user.type === 'proprietaire' ||
                (user.profile && user.profile.email === 'admin33@bikorent.com')
            ) || users[0];
            
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
                    firstName: mainUser.profile?.firstName || "Admin",
                    lastName: mainUser.profile?.lastName || "BikoRentR",
                    email: mainUser.profile?.email || "admin33@bikorent.com",
                    phone: mainUser.profile?.phone || "+33 1 23 45 67 89",
                    profession: mainUser.profile?.profession || "Gestionnaire immobilier",
                    workplace: mainUser.profile?.workplace || "BikoRent SAS",
                    address: mainUser.profile?.address || "123 Rue de la Paix, 75001 Paris, France",
                    bio: mainUser.profile?.bio || "Gestionnaire immobilier passionné avec plus de 10 ans d'expérience dans la location et la gestion de propriétés.",
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
                    language: mainUser.language || "fr",
                    timezone: mainUser.timezone || "Europe/Paris",
                    darkMode: mainUser.darkMode || false,
                    dateFormat: mainUser.dateFormat || "DD/MM/YYYY",
                    currency: mainUser.currency || "EUR"
                },
                billing: {
                    plan: mainUser.billingPlan || "Premium",
                    price: mainUser.billingPrice || 29.99,
                    currency: mainUser.billingCurrency || "EUR",
                    paymentMethods: mainUser.paymentMethods || [
                        {
                            id: 1,
                            type: "visa",
                            last4: "4242",
                            expiry: "12/25",
                            isDefault: true
                        }
                    ],
                    billingHistory: mainUser.billingHistory || [
                        {
                            date: "01/03/2024",
                            description: "Plan Premium - Mars 2024",
                            amount: 29.99,
                            status: "paid"
                        },
                        {
                            date: "01/02/2024",
                            description: "Plan Premium - Février 2024",
                            amount: 29.99,
                            status: "paid"
                        },
                        {
                            date: "01/01/2024",
                            description: "Plan Premium - Janvier 2024",
                            amount: 29.99,
                            status: "paid"
                        }
                    ]
                },
                integrations: mainUser.integrations || [
                    {
                        id: "google-calendar",
                        name: "Google Calendar",
                        description: "Synchronisez vos événements de location",
                        icon: "G",
                        color: "#4285f4",
                        connected: true
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
                    }
                ]
            };
            
            console.log('📊 Données des paramètres construites:', {
                photo: parametresData.profile.photo,
                hasPhoto: !!parametresData.profile.photo,
                notifications: parametresData.notifications
            });
            
            return parametresData;

        } catch (error) {
            console.error('Erreur lors de la récupération des données des paramètres:', error);
            return null;
        }
    }
}

module.exports = new DataService(); 