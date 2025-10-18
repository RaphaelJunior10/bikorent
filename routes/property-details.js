const express = require('express');
const router = express.Router();
const { firestoreUtils } = require('../config/firebase');

// Page de détails d'une propriété
router.get('/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        console.log(`🔍 Recherche de la propriété avec l'ID: ${propertyId}`);

        // Récupérer la propriété depuis Firebase
        const property = await getPropertyById(propertyId);

        if (!property) {
            console.log(`❌ Propriété non trouvée avec l'ID: ${propertyId}`);
            return res.status(404).render('error', {
                title: 'Propriété non trouvée - BikoRent',
                message: 'La propriété demandée n\'existe pas.',
                layout: false
            });
        }

        console.log(`✅ Propriété trouvée:`, {
            id: property.id,
            title: property.title,
            price: property.price
        });

        // Debug de l'authentification
        console.log('🔐 Debug authentification:', {
            sessionUser: req.session.user,
            isAuthenticated: !!req.session.user,
            sessionKeys: Object.keys(req.session)
        });

        res.render('property-details', {
            title: `${property.title} - BikoRent`,
            currentPage: 'property-details',
            pageTitle: 'Détails de la propriété',
            layout: false, // Désactiver le layout pour cette page
            property: property,
            isAuthenticated: !!req.session.user,
            user: req.session.user || null
        });

    } catch (error) {
        console.error('Erreur lors du chargement des détails de la propriété:', error);
        res.status(500).render('error', {
            title: 'Erreur - BikoRent',
            message: 'Une erreur est survenue lors du chargement de la propriété.',
            layout: false
        });
    }
});

// Fonction pour récupérer une propriété par son ID
async function getPropertyById(propertyId) {
    try {
        if (!firestoreUtils.isInitialized()) {
            console.log('Firebase non initialisé, utilisation des données de test');
            return getMockPropertyById(propertyId);
        }

        // Récupérer toutes les propriétés et filtrer par ID
        const allProperties = await firestoreUtils.getAll('properties');
        console.log(`📊 Propriétés récupérées depuis Firebase: ${allProperties.length}`);

        // Chercher la propriété avec l'ID correspondant
        const property = allProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
        
        // Debug: Afficher les détails de la propriété trouvée
        if (property) {
            console.log('🔍 Détails de la propriété trouvée:', {
                id: property.id,
                name: property.name,
                tenantId: property.tenantId,
                status: property.status,
                isOccupied: property.isOccupied,
                occupied: property.occupied,
                available: property.available,
                allFields: Object.keys(property)
            });
        }

        if (!property) {
            return null;
        }

        // Transformer les données Firebase en format compatible avec la vue
        const formattedProperty = formatPropertyData(property);
        console.log('📋 Propriété formatée:', {
            id: formattedProperty.id,
            title: formattedProperty.title,
            status: formattedProperty.status,
            price: formattedProperty.price
        });

        return formattedProperty;

    } catch (error) {
        console.error('Erreur lors de la récupération de la propriété:', error);
        return getMockPropertyById(propertyId);
    }
}

// Fonction pour formater les données d'une propriété
function formatPropertyData(property) {
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
    
    console.log('🏠 Détermination du statut:', {
        id: property.id,
        tenantId: property.tenantId,
        status: property.status,
        isOccupied: property.isOccupied,
        occupied: property.occupied,
        available: property.available,
        finalStatus: status
    });

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

    // Gérer les images multiples
    let images = [];
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
        images = property.images;
    } else if (property.image) {
        images = [property.image];
    } else {
        images = [getDefaultImage(type)];
    }

    return {
        id: property.id,
        title: property.name || `Propriété ${property.id}`,
        location: property.address || 'Adresse non spécifiée',
        city: property.city || 'Ville non spécifiée',
        price: price,
        type: type,
        status: status,
        image: images[0], // Image principale pour la compatibilité
        images: images, // Tableau d'images pour le slider
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
function getMockPropertyById(propertyId) {
    const mockProperties = [
        {
            id: '1',
            title: "Appartement T3 moderne",
            location: "Paris 15ème",
            city: "Paris",
            price: "1200 xaf/mois",
            type: "appartement",
            status: "rented",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            features: {
                rooms: 3,
                area: "75m²",
                floor: "3ème"
            },
            description: "Magnifique appartement de 3 pièces dans le 15ème arrondissement, proche des transports en commun.",
            rent: 1200
        },
        {
            id: '2',
            title: "Studio cosy",
            location: "Lyon 2ème",
            city: "Lyon",
            price: "650 xaf/mois",
            type: "studio",
            status: "vacant",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
            ],
            features: {
                rooms: 1,
                area: "25m²",
                floor: "1er"
            },
            description: "Studio parfait pour étudiant ou jeune actif, entièrement meublé et équipé.",
            rent: 650
        }
    ];

    return mockProperties.find(p => p.id === propertyId || p.id.toString() === propertyId);
}

module.exports = router;
