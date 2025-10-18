const express = require('express');
const router = express.Router();
const { firestoreUtils } = require('../config/firebase');

// Page des propriétés
router.get('/', async (req, res) => {
    try {
        // Récupérer les vraies propriétés depuis Firebase
        const properties = await getPropertiesFromDatabase();
        
        res.render('properties', {
            title: 'Propriétés - BikoRent',
            currentPage: 'properties',
            pageTitle: 'Propriétés',
            layout: false, // Désactiver le layout pour cette page
            properties: properties // Passer les propriétés à la vue
        });
    } catch (error) {
        console.error('Erreur lors du chargement des propriétés:', error);
        res.render('properties', {
            title: 'Propriétés - BikoRent',
            currentPage: 'properties',
            pageTitle: 'Propriétés',
            layout: false,
            properties: [] // Tableau vide en cas d'erreur
        });
    }
});

// Fonction pour récupérer les propriétés depuis Firebase
async function getPropertiesFromDatabase() {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Firebase non initialisé, utilisation des données de test');
            return getMockProperties();
        }
        
        const allProperties = await firestoreUtils.getAll('properties');
        console.log(`📊 Propriétés récupérées depuis Firebase: ${allProperties.length}`);
        
        // Transformer les données Firebase en format compatible avec la vue
        const formattedProperties = allProperties.map(property => {
            // Déterminer le statut basé sur les données disponibles
            let status = 'vacant';
            
            // Vérifier plusieurs champs possibles pour déterminer si la propriété est louée
            if (property.tenantId && property.tenantId !== '' && property.tenantId !== null) {
                status = 'rented';
            } else if (property.status && (property.status === 'rented' || property.status === 'loué' || property.status === 'occupied')) {
                status = 'rented';
            } else if (property.isOccupied === true || property.occupied === true) {
                status = 'rented';
            } else if (property.available === false) {
                status = 'rented';
            }
            
            // Déterminer le type de propriété
            let type = 'appartement';
            if (property.type) {
                type = property.type.toLowerCase();
            } else if (property.name && property.name.toLowerCase().includes('studio')) {
                type = 'studio';
            } else if (property.name && property.name.toLowerCase().includes('maison')) {
                type = 'maison';
            }
            
            // Extraire le prix du loyer
            let price = 'N/A';
            if (property.rent) {
                price = `${property.rent} xaf/mois`;
            } else if (property.monthlyRent) {
                price = `${property.monthlyRent} xaf/mois`;
            }
            
            // Extraire la surface
            let area = 'N/A';
            if (property.area) {
                area = `${property.area}m²`;
            } else if (property.surface) {
                area = `${property.surface}m²`;
            }
            
            // Extraire le nombre de pièces
            let rooms = 1;
            if (property.rooms) {
                rooms = property.rooms;
            } else if (property.bedrooms) {
                rooms = property.bedrooms + 1; // +1 pour le salon
            }
            
            // Extraire l'étage
            let floor = 'N/A';
            if (property.floor) {
                floor = property.floor;
            }
            
            // Créer une description basée sur les données disponibles
            let description = property.description || '';
            if (!description) {
                description = `Bien immobilier situé à ${property.address || 'adresse non spécifiée'}.`;
                if (property.features && property.features.length > 0) {
                    description += ` Équipements: ${property.features.join(', ')}.`;
                }
            }
            
            return {
                id: property.id,
                title: property.name || `Propriété ${property.id}`,
                location: property.address || 'Adresse non spécifiée',
                city: property.city || 'Ville non spécifiée',
                price: price,
                type: type,
                status: status,
                image: property.image || getDefaultImage(type),
                features: {
                    rooms: rooms,
                    area: area,
                    floor: floor
                },
                description: description,
                // Données supplémentaires pour les filtres
                rent: property.rent || property.monthlyRent || 0,
                tenantId: property.tenantId || null
            };
        });
        
        console.log('📋 Propriétés formatées:', formattedProperties.map(p => ({
            id: p.id,
            title: p.title,
            status: p.status,
            price: p.price
        })));
        
        return formattedProperties;
        
    } catch (error) {
        console.error('Erreur lors de la récupération des propriétés:', error);
        return getMockProperties();
    }
}

// Fonction pour obtenir une image par défaut selon le type
function getDefaultImage(type) {
    const imageMap = {
        'appartement': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'studio': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        'maison': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    };
    return imageMap[type] || imageMap['appartement'];
}

// Données de test en cas d'erreur
function getMockProperties() {
    return [
        {
            id: 1,
            title: "Appartement T3 moderne",
            location: "Paris 15ème",
            city: "Paris",
            price: "1200 xaf/mois",
            type: "appartement",
            status: "rented",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            features: {
                rooms: 3,
                area: "75m²",
                floor: "3ème"
            },
            description: "Magnifique appartement de 3 pièces dans le 15ème arrondissement, proche des transports en commun.",
            rent: 1200
        },
        {
            id: 2,
            title: "Studio cosy",
            location: "Lyon 2ème",
            city: "Lyon",
            price: "650 xaf/mois",
            type: "studio",
            status: "vacant",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            features: {
                rooms: 1,
                area: "25m²",
                floor: "1er"
            },
            description: "Studio parfait pour étudiant ou jeune actif, entièrement meublé et équipé.",
            rent: 650
        },
        {
            id: 3,
            title: "Maison T4 avec jardin",
            location: "Marseille 13001",
            city: "Marseille",
            price: "1500 xaf/mois",
            type: "maison",
            status: "vacant",
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            features: {
                rooms: 4,
                area: "120m²",
                floor: "RDC"
            },
            description: "Belle maison avec jardin privé, idéale pour une famille.",
            rent: 1500
        },
        {
            id: 4,
            title: "Appartement T2 centre-ville",
            location: "Toulouse 31000",
            city: "Toulouse",
            price: "900 xaf/mois",
            type: "appartement",
            status: "rented",
            image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            features: {
                rooms: 2,
                area: "50m²",
                floor: "2ème"
            },
            description: "Appartement lumineux en centre-ville, proche des commerces.",
            rent: 900
        },
        {
            id: 5,
            title: "Studio étudiant",
            location: "Nantes 44000",
            city: "Nantes",
            price: "550 xaf/mois",
            type: "studio",
            status: "vacant",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            features: {
                rooms: 1,
                area: "20m²",
                floor: "3ème"
            },
            description: "Studio meublé parfait pour étudiant, proche de l'université.",
            rent: 550
        }
    ];
}

// API pour récupérer les propriétés (pour les appels AJAX)
router.get('/api', async (req, res) => {
    try {
        const properties = await getPropertiesFromDatabase();
        res.json({ success: true, properties });
    } catch (error) {
        console.error('Erreur API propriétés:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API pour récupérer uniquement les villes disponibles
router.get('/api/cities', async (req, res) => {
    try {
        const properties = await getPropertiesFromDatabase();
        const cities = [...new Set(properties.map(property => property.city).filter(city => city))].sort();
        res.json({ success: true, cities });
    } catch (error) {
        console.error('Erreur API villes:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// API pour récupérer une propriété par son ID
router.get('/api/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await getPropertyById(propertyId);
        
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Propriété non trouvée'
            });
        }
        
        res.json({
            success: true,
            property: property
        });
    } catch (error) {
        console.error('Erreur API propriété:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la propriété'
        });
    }
});

// Fonction pour récupérer une propriété par son ID
async function getPropertyById(propertyId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            return getMockPropertyById(propertyId);
        }
        
        const allProperties = await firestoreUtils.getAll('properties');
        const property = allProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
        
        if (!property) {
            return null;
        }
        
        // Transformer les données Firebase en format compatible
        return {
            id: property.id,
            name: property.name || `Propriété ${property.id}`,
            address: property.address || 'Adresse non spécifiée',
            rent: property.rent || property.monthlyRent || 0,
            ownerId: property.ownerId,
            status: property.status || 'vacant',
            tenantId: property.tenantId,
            available: property.available !== false,
            isOccupied: property.isOccupied || false,
            occupied: property.occupied || false
        };
        
    } catch (error) {
        console.error('Erreur lors de la récupération de la propriété:', error);
        return null;
    }
}

// Fonction pour obtenir une propriété mock par ID
function getMockPropertyById(propertyId) {
    const mockProperties = [
        {
            id: '1',
            name: 'Appartement T3 moderne',
            address: 'Paris 15ème',
            rent: 1200,
            ownerId: 'U7h4HU5OfB9KTeY341NE',
            status: 'vacant',
            tenantId: null,
            available: true,
            isOccupied: false,
            occupied: false
        },
        {
            id: '2',
            name: 'Studio cosy',
            address: 'Lyon 2ème',
            rent: 650,
            ownerId: 'U7h4HU5OfB9KTeY341NE',
            status: 'vacant',
            tenantId: null,
            available: true,
            isOccupied: false,
            occupied: false
        }
    ];
    
    return mockProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
}

module.exports = router;
