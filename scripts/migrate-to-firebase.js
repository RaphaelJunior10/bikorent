#!/usr/bin/env node

/**
 * Script de migration des données de test vers Firebase Firestore
 * 
 * Ce script migre toutes les données de test de l'application BikoRent
 * vers Firebase Firestore en respectant la structure définie.
 * 
 * Usage: node scripts/migrate-to-firebase.js
 */

const { firestoreUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled, setFirebaseEnabled } = require('../config/environment');

// Données de test à migrer
const testData = {
    // Utilisateurs (incluant les locataires et l'admin)
    users: [
        // Admin
        {
            type: "admin",
            profile: {
                firstName: "Admin",
                lastName: "BikoRent",
                email: "admin@bikorent.com",
                phone: "+33 1 23 45 67 89",
                profession: "Gestionnaire immobilier",
                workplace: "BikoRent SAS",
                address: "123 Rue de la Paix, 75001 Paris, France",
                bio: "Gestionnaire immobilier passionné avec plus de 10 ans d'expérience dans la location et la gestion de propriétés.",
                photo: null
            },
            security: {
                twoFactorAuth: false,
                suspiciousLogin: true
            },
            notifications: {
                emailPayments: true,
                emailOverdue: true,
                emailNewTenants: false,
                pushAlerts: true,
                pushReminders: false,
                reportFrequency: "monthly"
            },
            preferences: {
                language: "fr",
                timezone: "Europe/Paris",
                darkMode: false,
                dateFormat: "DD/MM/YYYY",
                currency: "EUR"
            },
            billing: {
                plan: "Premium",
                price: 29.99,
                currency: "EUR",
                paymentMethods: [
                    {
                        type: "card",
                        brand: "Visa",
                        last4: "4242",
                        expiry: "12/25"
                    }
                ],
                billingHistory: [
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
            integrations: [
                {
                    id: "google-calendar",
                    name: "Google Calendar",
                    description: "Synchronisez vos événements de location",
                    connected: true,
                    icon: "G",
                    color: "#4285f4"
                },
                {
                    id: "whatsapp",
                    name: "WhatsApp Business",
                    description: "Envoyez des messages automatiques aux locataires",
                    connected: false,
                    icon: "W",
                    color: "#00c851"
                },
                {
                    id: "quickbooks",
                    name: "QuickBooks",
                    description: "Synchronisez vos données comptables",
                    connected: false,
                    icon: "Q",
                    color: "#0073aa"
                },
                {
                    id: "zapier",
                    name: "Zapier",
                    description: "Automatisez vos workflows",
                    connected: false,
                    icon: "Z",
                    color: "#ff6b35"
                }
            ]
        },
        // Propriétaire
        {
            type: "owner",
            profile: {
                firstName: "Pierre",
                lastName: "Martin",
                email: "pierre.martin@email.com",
                phone: "+33 6 11 22 33 44",
                profession: "Investisseur immobilier",
                workplace: "Martin Investissements",
                address: "456 Avenue des Champs, 75008 Paris, France",
                bio: "Investisseur immobilier avec plus de 15 ans d'expérience",
                photo: null
            },
            owner: {
                totalProperties: 6,
                totalRevenue: 4370,
                averageRent: 728
            }
        },
        // Locataires
        {
            type: "tenant",
            profile: {
                firstName: "Marie",
                lastName: "Dubois",
                email: "marie.dubois@email.com",
                phone: "+33 6 12 34 56 78",
                profession: "Architecte",
                workplace: "Cabinet Dubois Architecture",
                address: "123 Rue de la Paix, 75001 Paris, France",
                bio: "Architecte passionnée avec 8 ans d'expérience",
                photo: null
            },
            tenant: {
                monthlyRent: 1200,
                hasDebt: true,
                debtAmount: 1200,
                entryDate: "2023-01-15",
                status: "current",
                unpaidMonths: 2,
                lastPayment: "2024-01-15",
                nextPayment: "2024-03-15"
            }
        },
        {
            type: "tenant",
            profile: {
                firstName: "Jean",
                lastName: "Martin",
                email: "jean.martin@email.com",
                phone: "+33 6 98 76 54 32",
                profession: "Ingénieur",
                workplace: "Tech Solutions",
                address: "456 Avenue Victor Hugo, 69001 Lyon, France",
                bio: "Ingénieur en informatique spécialisé en développement web",
                photo: null
            },
            tenant: {
                monthlyRent: 650,
                hasDebt: true,
                debtAmount: 650,
                entryDate: "2023-03-01",
                status: "overdue",
                unpaidMonths: 1,
                lastPayment: "2024-01-01",
                nextPayment: "2024-02-01"
            }
        },
        {
            type: "tenant",
            profile: {
                firstName: "Sophie",
                lastName: "Bernard",
                email: "sophie.bernard@email.com",
                phone: "+33 6 45 67 89 12",
                profession: "Médecin",
                workplace: "Hôpital Central",
                address: "789 Boulevard Central, 13001 Marseille, France",
                bio: "Médecin généraliste avec 12 ans d'expérience",
                photo: null
            },
            tenant: {
                monthlyRent: 1800,
                hasDebt: true,
                debtAmount: 1800,
                entryDate: "2022-09-01",
                status: "overdue",
                unpaidMonths: 3,
                lastPayment: "2023-12-01",
                nextPayment: "2024-01-01"
            }
        },
        {
            type: "tenant",
            profile: {
                firstName: "Pierre",
                lastName: "Durand",
                email: "pierre.durand@email.com",
                phone: "+33 6 23 45 67 89",
                profession: "Enseignant",
                workplace: "Lycée Victor Hugo",
                address: "321 Rue des Fleurs, 31000 Toulouse, France",
                bio: "Enseignant en mathématiques au lycée",
                photo: null
            },
            tenant: {
                monthlyRent: 850,
                hasDebt: false,
                debtAmount: 0,
                entryDate: "2023-06-01",
                status: "current",
                unpaidMonths: 0,
                lastPayment: "2024-02-01",
                nextPayment: "2024-03-01"
            }
        },
        {
            type: "tenant",
            profile: {
                firstName: "Claire",
                lastName: "Moreau",
                email: "claire.moreau@email.com",
                phone: "+33 6 78 90 12 34",
                profession: "Designer",
                workplace: "Studio Créatif",
                address: "654 Avenue de la République, 44000 Nantes, France",
                bio: "Designer graphique freelance",
                photo: null
            },
            tenant: {
                monthlyRent: 480,
                hasDebt: false,
                debtAmount: 0,
                entryDate: "2023-08-01",
                status: "current",
                unpaidMonths: 0,
                lastPayment: "2024-02-01",
                nextPayment: "2024-03-01"
            }
        },
        {
            type: "tenant",
            profile: {
                firstName: "Thomas",
                lastName: "Leroy",
                email: "thomas.leroy@email.com",
                phone: "+33 6 56 78 90 12",
                profession: "Développeur",
                workplace: "Startup Tech",
                address: "987 Rue du Commerce, 33000 Bordeaux, France",
                bio: "Développeur full-stack dans une startup",
                photo: null
            },
            tenant: {
                monthlyRent: 720,
                hasDebt: true,
                debtAmount: 720,
                entryDate: "2023-04-15",
                status: "upcoming",
                unpaidMonths: 0,
                lastPayment: "2024-01-15",
                nextPayment: "2024-02-15"
            }
        }
    ],

    // Propriétés
    properties: [
        {
            name: "Appartement T3 - Rue de la Paix",
            type: "appartement",
            surface: 75,
            rooms: 3,
            bedrooms: 2,
            address: "123 Rue de la Paix",
            city: "Paris",
            zipCode: "75001",
            coordinates: { lat: 48.8566, lng: 2.3522 },
            monthlyRent: 1200,
            status: "rented",
            ownerId: null, // Sera mis à jour après création des users
            tenant: null, // Sera mis à jour après création des users
            description: "Bel appartement lumineux avec balcon et vue sur la ville.",
            features: ["Ascenseur", "Balcon", "Cave", "Parking"],
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
            ]
        },
        {
            name: "Studio - Avenue Victor Hugo",
            type: "studio",
            surface: 25,
            rooms: 1,
            bedrooms: 0,
            address: "456 Avenue Victor Hugo",
            city: "Lyon",
            zipCode: "69001",
            coordinates: { lat: 45.7578, lng: 4.8320 },
            monthlyRent: 650,
            status: "vacant",
            ownerId: null,
            tenant: null,
            description: "Studio moderne et fonctionnel, idéal pour étudiant ou jeune professionnel.",
            features: ["Meublé", "Internet", "Chauffage inclus"],
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop"
            ]
        },
        {
            name: "Maison T4 - Boulevard Central",
            type: "maison",
            surface: 120,
            rooms: 4,
            bedrooms: 3,
            address: "789 Boulevard Central",
            city: "Marseille",
            zipCode: "13001",
            coordinates: { lat: 43.2965, lng: 5.3698 },
            monthlyRent: 1800,
            status: "rented",
            ownerId: null,
            tenant: null,
            description: "Maison spacieuse avec jardin et terrasse, parfaite pour une famille.",
            features: ["Jardin", "Terrasse", "Garage", "Cave"],
            images: [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
            ]
        },
        {
            name: "Appartement T2 - Rue des Fleurs",
            type: "appartement",
            surface: 45,
            rooms: 2,
            bedrooms: 1,
            address: "321 Rue des Fleurs",
            city: "Toulouse",
            zipCode: "31000",
            coordinates: { lat: 43.6047, lng: 1.4442 },
            monthlyRent: 850,
            status: "rented",
            ownerId: null,
            tenant: null,
            description: "Appartement charmant avec parquet et moulures d'époque.",
            features: ["Parquet", "Moulures", "Balcon", "Ascenseur"],
            images: [
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
            ]
        },
        {
            name: "Studio - Avenue de la République",
            type: "studio",
            surface: 30,
            rooms: 1,
            bedrooms: 0,
            address: "654 Avenue de la République",
            city: "Nantes",
            zipCode: "44000",
            coordinates: { lat: 47.2184, lng: -1.5536 },
            monthlyRent: 480,
            status: "rented",
            ownerId: null,
            tenant: null,
            description: "Studio bien situé près des transports et commerces.",
            features: ["Meublé", "Internet", "Chauffage inclus"],
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
            ]
        },
        {
            name: "Appartement T3 - Rue du Commerce",
            type: "appartement",
            surface: 65,
            rooms: 3,
            bedrooms: 2,
            address: "987 Rue du Commerce",
            city: "Bordeaux",
            zipCode: "33000",
            coordinates: { lat: 44.8378, lng: -0.5792 },
            monthlyRent: 720,
            status: "rented",
            ownerId: null,
            tenant: null,
            description: "Appartement moderne avec vue sur la ville.",
            features: ["Ascenseur", "Balcon", "Cave"],
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
            ]
        }
    ],

    // Paiements
    payments: [
        // Paiements pour Marie Dubois
        {
            userId: null, // Sera mis à jour
            propertyId: null, // Sera mis à jour
            amount: 1200,
            date: "2024-01-15",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Jan 2024"
        },
        {
            userId: null,
            propertyId: null,
            amount: 1200,
            date: "2024-02-15",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Fév 2024"
        },
        // Paiements pour Jean Martin
        {
            userId: null,
            propertyId: null,
            amount: 650,
            date: "2024-02-01",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Fév 2024"
        },
        // Paiements pour Pierre Durand
        {
            userId: null,
            propertyId: null,
            amount: 850,
            date: "2024-01-01",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Jan 2024"
        },
        {
            userId: null,
            propertyId: null,
            amount: 850,
            date: "2024-02-01",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Fév 2024"
        },
        // Paiements pour Claire Moreau
        {
            userId: null,
            propertyId: null,
            amount: 480,
            date: "2024-01-01",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Jan 2024"
        },
        {
            userId: null,
            propertyId: null,
            amount: 480,
            date: "2024-02-01",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Fév 2024"
        },
        // Paiements pour Thomas Leroy
        {
            userId: null,
            propertyId: null,
            amount: 720,
            date: "2024-01-15",
            type: "loyer",
            status: "payé",
            method: "virement",
            month: "Jan 2024"
        }
    ]
};

// Fonction principale de migration
async function migrateToFirebase() {
    console.log('🚀 Début de la migration vers Firebase...\n');

    try {
        // Vérifier que Firebase est activé
        if (!isFirebaseEnabled()) {
            console.log('⚠️  Firebase n\'est pas activé. Activation...');
            setFirebaseEnabled(true);
        }

        // 1. Migrer les utilisateurs (admin + locataires)
        console.log('👥 Migration des utilisateurs...');
        const userIds = await migrateUsers();
        console.log(`✅ ${userIds.length} utilisateurs migrés\n`);

        // 2. Migrer les propriétés (avec références aux locataires)
        console.log('📦 Migration des propriétés...');
        const propertyIds = await migrateProperties(userIds);
        console.log(`✅ ${propertyIds.length} propriétés migrées\n`);

        // 3. Migrer les paiements (avec références aux utilisateurs et propriétés)
        console.log('💰 Migration des paiements...');
        const paymentIds = await migratePayments(userIds, propertyIds);
        console.log(`✅ ${paymentIds.length} paiements migrés\n`);

        // 4. Créer les rapports
        console.log('📊 Création des rapports...');
        await createReports(propertyIds, userIds, paymentIds);
        console.log('✅ Rapports créés\n');

        console.log('🎉 Migration terminée avec succès !');
        console.log('\n📋 Résumé de la migration:');
        console.log(`   - Utilisateurs: ${userIds.length}`);
        console.log(`   - Propriétés: ${propertyIds.length}`);
        console.log(`   - Paiements: ${paymentIds.length}`);

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

// Migration des utilisateurs
async function migrateUsers() {
    const userIds = [];
    
    for (const user of testData.users) {
        try {
            const result = await firestoreUtils.add(COLLECTIONS.USERS, user);
            userIds.push({
                id: result.id,
                type: user.type,
                name: user.type === 'admin' 
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : `${user.profile.firstName} ${user.profile.lastName}`
            });
            console.log(`   ✅ Utilisateur "${user.profile.firstName} ${user.profile.lastName}" (${user.type}) migré (ID: ${result.id})`);
        } catch (error) {
            console.error(`   ❌ Erreur lors de la migration de l'utilisateur "${user.profile.firstName} ${user.profile.lastName}":`, error);
        }
    }
    
    return userIds;
}

// Migration des propriétés
async function migrateProperties(userIds) {
    const propertyIds = [];
    const ownerUser = userIds.find(u => u.type === 'owner');
    const tenantUsers = userIds.filter(u => u.type === 'tenant');
    
    for (let i = 0; i < testData.properties.length; i++) {
        const property = testData.properties[i];
        const tenantUser = tenantUsers[i % tenantUsers.length]; // Associer les propriétés aux locataires
        
        try {
            const propertyData = {
                ...property,
                ownerId: ownerUser.id,
                owner: {
                    userId: ownerUser.id,
                    name: ownerUser.name
                },
                tenant: property.status === 'rented' ? {
                    userId: tenantUser.id,
                    name: tenantUser.name,
                    monthlyRent: property.monthlyRent,
                    entryDate: testData.users.find(u => u.type === 'tenant' && u.profile.firstName === tenantUser.name.split(' ')[0])?.tenant?.entryDate || "2023-01-01",
                    status: testData.users.find(u => u.type === 'tenant' && u.profile.firstName === tenantUser.name.split(' ')[0])?.tenant?.status || "current"
                } : null
            };
            
            const result = await firestoreUtils.add(COLLECTIONS.PROPERTIES, propertyData);
            propertyIds.push({
                id: result.id,
                name: property.name,
                ownerId: ownerUser.id,
                tenantUserId: property.status === 'rented' ? tenantUser.id : null
            });
            console.log(`   ✅ Propriété "${property.name}" migrée (ID: ${result.id}) - Propriétaire: ${ownerUser.name}`);
        } catch (error) {
            console.error(`   ❌ Erreur lors de la migration de la propriété "${property.name}":`, error);
        }
    }
    
    return propertyIds;
}

// Migration des paiements
async function migratePayments(userIds, propertyIds) {
    const paymentIds = [];
    const tenantUsers = userIds.filter(u => u.type === 'tenant');
    const rentedProperties = propertyIds.filter(p => p.tenantUserId);
    
    for (const payment of testData.payments) {
        try {
            // Trouver le locataire et la propriété correspondants
            const tenantIndex = testData.payments.indexOf(payment) % tenantUsers.length;
            const tenant = tenantUsers[tenantIndex];
            const property = rentedProperties[tenantIndex % rentedProperties.length];
            
            if (!tenant || !property) {
                console.log(`   ⚠️  Impossible de trouver le locataire ou la propriété pour le paiement ${payment.amount} xaf`);
                continue;
            }
            
            const paymentData = {
                ...payment,
                userId: tenant.id,
                propertyId: property.id
            };
            
            const result = await firestoreUtils.add(COLLECTIONS.PAYMENTS, paymentData);
            paymentIds.push(result.id);
            console.log(`   ✅ Paiement de ${payment.amount} xaf pour ${tenant.name} migré (ID: ${result.id})`);
        } catch (error) {
            console.error(`   ❌ Erreur lors de la migration du paiement:`, error);
        }
    }
    
    return paymentIds;
}

// Création des rapports
async function createReports(propertyIds, userIds, paymentIds) {
    try {
        const tenantUsers = userIds.filter(u => u.type === 'tenant');
        const rentedProperties = propertyIds.filter(p => p.tenantUserId);
        
        const reportData = {
            type: "monthly",
            period: "2024-03",
            summary: {
                totalProperties: propertyIds.length,
                rentedProperties: rentedProperties.length,
                totalTenants: tenantUsers.length,
                totalRevenue: 4370,
                outstandingPayments: 4370
            },
            details: {
                properties: propertyIds,
                users: userIds,
                payments: paymentIds
            },
            generatedAt: new Date()
        };
        
        await firestoreUtils.add(COLLECTIONS.REPORTS, reportData);
        console.log('   ✅ Rapport mensuel créé');
    } catch (error) {
        console.error('   ❌ Erreur lors de la création du rapport:', error);
    }
}

// Fonction pour vider les collections (optionnel)
async function clearCollections() {
    console.log('🗑️  Nettoyage des collections existantes...');
    
    const collections = Object.values(COLLECTIONS);
    
    for (const collectionName of collections) {
        try {
            const documents = await firestoreUtils.getAll(collectionName);
            for (const doc of documents) {
                await firestoreUtils.delete(collectionName, doc.id);
            }
            console.log(`   ✅ Collection "${collectionName}" vidée`);
        } catch (error) {
            console.error(`   ❌ Erreur lors du vidage de "${collectionName}":`, error);
        }
    }
    
    console.log('');
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
const shouldClear = args.includes('--clear') || args.includes('-c');

// Exécution du script
async function main() {
    if (shouldClear) {
        await clearCollections();
    }
    
    await migrateToFirebase();
    process.exit(0);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
    process.exit(1);
});

// Lancer le script
main();
