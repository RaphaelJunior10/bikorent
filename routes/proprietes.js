const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

const { firestoreUtils, storageUtils, COLLECTIONS } = require('../config/firebase');
const { isFirebaseEnabled } = require('../config/environment');

const connectedUser = {id: 'U7h4HU5OfB9KTeY341NE'};
// Fonction pour uploader une image vers Firebase Storage
async function uploadImageToFirebaseStorage(base64Image, propertyId, imageIndex = 0) {
    try {
        // Convertir base64 en buffer
        const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Déterminer le type MIME
        const mimeType = base64Image.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const fileExtension = mimeType.split('/')[1];
        
        // Créer le nom du fichier
        const fileName = `properties/${propertyId}/image-${imageIndex}.${fileExtension}`;
        
        // Uploader le fichier en utilisant les utilitaires
        const downloadURL = await storageUtils.uploadFile(fileName, buffer, {
            contentType: mimeType,
            customMetadata: {
                propertyId: propertyId,
                imageIndex: imageIndex,
                uploadedAt: new Date().toISOString()
            }
        });
        
        console.log('✅ Image uploadée avec succès vers Firebase Storage:', downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload de l\'image vers Firebase Storage:', error);
        throw error;
    }
}

// Fonction pour supprimer une image de Firebase Storage
async function deleteImageFromFirebaseStorage(imageUrl) {
    try {
        if (!imageUrl || !imageUrl.includes('storage.googleapis.com')) {
            console.warn('⚠️ URL d\'image invalide pour la suppression:', imageUrl);
            return false;
        }
        
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = imageUrl.split('/');
        const filePath = urlParts.slice(4).join('/'); // properties/123/image-0.png
        
        await storageUtils.deleteFile(filePath);
        console.log(`✅ Image supprimée de Firebase Storage: ${filePath}`);
        return true;
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de l\'image:', error);
        return false;
    }
}

// Page des propriétés
router.get('/', async (req, res) => {

    let properties = [
        {
            id: 1,
            name: "Appartement T354 - Rue de la Paix",
            type: "appartement",
            surface: 75,
            rooms: 3,
            bedrooms: 2,
            address: "123 Rue de la Paix",
            city: "Paris",
            zipCode: "75001",
            coordinates: { lat: 48.8566, lng: 2.3522 },
            rent: 1200,
            status: "rented",
            tenant: "Marie Dubois",
            description: "Bel appartement lumineux avec balcon et vue sur la ville.",
            features: ["Ascenseur", "Balcon", "Cave", "Parking"],
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
            ]
        },
        {
            id: 2,
            name: "Studio - Avenue Victor Hugo",
            type: "studio",
            surface: 25,
            rooms: 1,
            bedrooms: 0,
            address: "456 Avenue Victor Hugo",
            city: "Lyon",
            zipCode: "69001",
            coordinates: { lat: 45.7578, lng: 4.8320 },
            rent: 650,
            status: "vacant",
            tenant: null,
            description: "Studio moderne et fonctionnel, idéal pour étudiant ou jeune professionnel.",
            features: ["Meublé", "Internet", "Chauffage inclus"],
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop"
            ]
        },
        {
            id: 3,
            name: "Maison T4 - Boulevard Central",
            type: "maison",
            surface: 120,
            rooms: 4,
            bedrooms: 3,
            address: "789 Boulevard Central",
            city: "Marseille",
            zipCode: "13001",
            coordinates: { lat: 43.2965, lng: 5.3698 },
            rent: 1800,
            status: "rented",
            tenant: "Jean Martin",
            description: "Maison spacieuse avec jardin et terrasse, parfaite pour une famille.",
            features: ["Jardin", "Terrasse", "Garage", "Cave"],
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
            ]
        },
        {
            id: 4,
            name: "Appartement T2 - Rue des Fleurs",
            type: "appartement",
            surface: 45,
            rooms: 2,
            bedrooms: 1,
            address: "321 Rue des Fleurs",
            city: "Toulouse",
            zipCode: "31000",
            coordinates: { lat: 43.6047, lng: 1.4442 },
            rent: 850,
            status: "rented",
            tenant: "Sophie Bernard",
            description: "Appartement charmant avec parquet et moulures d'époque.",
            features: ["Parquet", "Moulures", "Balcon", "Ascenseur"],
            image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
            ]
        },
        {
            id: 5,
            name: "Bureau - Avenue de la République",
            type: "bureau",
            surface: 80,
            rooms: 3,
            bedrooms: 0,
            address: "654 Avenue de la République",
            city: "Nantes",
            zipCode: "44000",
            coordinates: { lat: 47.2184, lng: -1.5536 },
            rent: 1500,
            status: "vacant",
            tenant: null,
            description: "Bureau moderne avec vue sur la ville, idéal pour entreprise.",
            features: ["Climatisation", "Parking", "Sécurité", "Ascenseur"],
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
            images: [
                "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop"
            ]
        }
    ];
    let ownerId = connectedUser.id;
    
    // Récupération des données depuis Firebase si activé
    if (isFirebaseEnabled() && firestoreUtils.isInitialized()) {
        try {
            // Récupérer toutes les propriétés du propriétaire ou ownerId=ownerId et isDeleted=false ou isDeleted n'existe pas
            const firebaseProperties = await firestoreUtils.query(COLLECTIONS.PROPERTIES, [
                { type: 'where', field: 'ownerId', operator: '==', value: ownerId },
                { type: 'where', field: 'isDeleted', operator: '==', value: false }
            ]);
            
            // Transformer les données Firebase en format attendu par l'interface
            properties = firebaseProperties.map(property => ({
                id: property.id,
                name: property.name,
                type: property.type,
                surface: property.surface,
                rooms: property.rooms,
                bedrooms: property.bedrooms,
                address: property.address,
                city: property.city,
                zipCode: property.zipCode,
                coordinates: property.coordinates,
                rent: property.monthlyRent,
                status: property.status,
                tenant: property.tenant ? property.tenant.name : null,
                description: property.description,
                features: property.features,
                image: property.images && property.images.length > 0 ? property.images[0] : null,
                images: property.images || [],
                isPaymentLink: property.isPaymentLink
            }));
            
            console.log(`✅ ${properties.length} propriétés récupérées depuis Firebase pour le propriétaire ${ownerId}`);
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des propriétés depuis Firebase:', error);
            console.log('🔄 Utilisation des données statiques par défaut');
            // En cas d'erreur, on garde les données statiques par défaut
        }
    } else {
        console.log('🔄 Firebase désactivé ou non initialisé - utilisation des données statiques');
    }
    res.render('proprietes', {
        title: 'Propriétés - BikoRent',
        pageTitle: 'Propriétés',
        currentPage: 'proprietes',
        user: {
            name: 'Admin',
            role: 'Propriétaire'
        },
        properties: properties
    });
});

router.post('/add', async (req, res) => {
    try {
        const newProperty = req.body;
        newProperty.ownerId = connectedUser.id;
        newProperty.isPaymentLink = false; // Par défaut, le lien de paiement est désactivé
        
        console.log('🔄 Ajout d\'une nouvelle propriété...', newProperty);
        
        // Vérifier si une image base64 est fournie
        if (newProperty.image && newProperty.image.startsWith('data:image/')) {
            // Vérifier la taille de l'image base64 (max 10MB)
            const base64Size = newProperty.image.length * 0.75; // Estimation de la taille en bytes
            const maxSize = 10 * 1024 * 1024; // 10MB
            
            if (base64Size > maxSize) {
                console.warn(`⚠️ Image trop volumineuse: ${(base64Size / 1024 / 1024).toFixed(2)}MB (max: 10MB)`);
                return res.status(400).json({ 
                    error: 'Image trop volumineuse',
                    details: `L'image fait ${(base64Size / 1024 / 1024).toFixed(2)}MB. Taille maximum: 10MB.`
                });
            }
            
            console.log(`🔄 Upload de l'image vers Firebase Storage... (taille: ${(base64Size / 1024 / 1024).toFixed(2)}MB)`);
            
            let createdProperty;
            try {
                // Créer d'abord la propriété dans la base de données pour obtenir l'ID
                createdProperty = await dataService.addProperty(newProperty);
                const propertyId = createdProperty.id;
                
                console.log(`✅ Propriété créée avec l'ID: ${propertyId}`);
                
                // Maintenant uploader l'image avec l'ID obtenu
                const imageURL = await uploadImageToFirebaseStorage(newProperty.image, propertyId);
                
                // Mettre à jour la propriété avec l'URL de l'image
                const updateData = {
                    image: imageURL,
                    images: [imageURL]
                };
                
                await dataService.updateProperty(propertyId, updateData);
                
                // Récupérer la propriété mise à jour
                const finalProperty = await dataService.getPropertyById(propertyId);
                
                console.log('✅ Image traitée et propriété mise à jour avec succès');
                res.status(201).json(finalProperty);
                
            } catch (uploadError) {
                console.error('❌ Erreur lors de l\'upload de l\'image:', uploadError);
                
                // En cas d'erreur d'upload, utiliser une image par défaut
                const updateData = {
                    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
                    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop']
                };
                
                await dataService.updateProperty(createdProperty.id, updateData);
                
                const finalProperty = await dataService.getPropertyById(createdProperty.id);
                console.log('🔄 Utilisation d\'une image par défaut');
                res.status(201).json(finalProperty);
            }
        } else if (newProperty.image && !newProperty.image.startsWith('data:image/')) {
            // Si c'est déjà une URL, l'utiliser directement
            newProperty.images = [newProperty.image];
            
            // Ajouter la propriété à la base de données
            const createdProperty = await dataService.addProperty(newProperty);
            console.log('✅ Propriété ajoutée avec succès:', createdProperty.id);
            res.status(201).json(createdProperty);
            
        } else {
            // Image par défaut si aucune image n'est fournie
            newProperty.image = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';
            newProperty.images = [newProperty.image];
            
            // Ajouter la propriété à la base de données
            const createdProperty = await dataService.addProperty(newProperty);
            console.log('✅ Propriété ajoutée avec succès:', createdProperty.id);
            res.status(201).json(createdProperty);
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout de la propriété:', error);
        res.status(500).json({ 
            error: 'Erreur lors de l\'ajout de la propriété',
            details: error.message 
        });
    }
});

// Route pour modifier une propriété
router.put('/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        const updateData = req.body;
        
        console.log(`🔄 Modification de la propriété ${propertyId}...`);
        console.log('Données reçues:', updateData);
        
        // Récupérer la propriété existante
        let existingProperty;
        try {
            existingProperty = await dataService.getPropertyById(propertyId);
        } catch (error) {
            console.warn(`⚠️ Propriété ${propertyId} non trouvée dans la base de données`);
            return res.status(404).json({ 
                error: 'Propriété non trouvée',
                details: 'La propriété à modifier n\'existe pas'
            });
        }
        
        if (!existingProperty) {
            return res.status(404).json({ 
                error: 'Propriété non trouvée',
                details: 'La propriété à modifier n\'existe pas'
            });
        }

        // Vérifier que l'utilisateur connecté est le propriétaire
        if (existingProperty.ownerId !== connectedUser.id) {
            return res.status(403).json({ 
                error: 'Accès refusé',
                details: 'Vous n\'êtes pas autorisé à modifier cette propriété'
            });
        }
        
        // Gérer les images
        const newImages = updateData.images || [];
        const oldImages = existingProperty.images || [];
        
        // Vérifier qu'il reste au moins une image
        if (newImages.length === 0) {
            return res.status(400).json({ 
                error: 'Images requises',
                details: 'Une propriété doit avoir au moins une image'
            });
        }
        
        console.log(`📸 Gestion des images: ${oldImages.length} anciennes → ${newImages.length} nouvelles`);
        
        // Identifier les images supprimées (présentes dans l'ancienne liste mais pas dans la nouvelle)
        const deletedImages = oldImages.filter(oldImg => !newImages.includes(oldImg));
        console.log(`🗑️ Images à supprimer: ${deletedImages.length}`, deletedImages);
        
        // Identifier les nouvelles images (base64)
        const newBase64Images = newImages.filter(img => img.startsWith('data:image/'));
        console.log(`📤 Nouvelles images à uploader: ${newBase64Images.length}`);
        
        // Supprimer les images supprimées de Firebase Storage
        for (const deletedImageUrl of deletedImages) {
            try {
                await deleteImageFromFirebaseStorage(deletedImageUrl);
            } catch (error) {
                console.warn(`⚠️ Impossible de supprimer l'image ${deletedImageUrl}:`, error.message);
            }
        }
        
        // Uploader les nouvelles images vers Firebase Storage
        const uploadedImageUrls = [];
        for (let i = 0; i < newImages.length; i++) {
            const image = newImages[i];
            
            if (image.startsWith('data:image/')) {
                // Nouvelle image base64 à uploader
                try {
                    const imageUrl = await uploadImageToFirebaseStorage(image, propertyId, i);
                    uploadedImageUrls.push(imageUrl);
                    console.log(`✅ Nouvelle image ${i} uploadée:`, imageUrl);
                } catch (error) {
                    console.error(`❌ Erreur lors de l'upload de l'image ${i}:`, error);
                    return res.status(500).json({ 
                        error: 'Erreur lors de l\'upload des images',
                        details: `Impossible d'uploader l'image ${i + 1}`
                    });
                }
            } else {
                // Image existante (URL), la conserver
                uploadedImageUrls.push(image);
                console.log(`✅ Image existante conservée:`, image);
            }
        }
        
        // Mettre à jour l'attribut image principal
        let mainImage;
        
        // Vérifier que uploadedImageUrls n'est pas vide
        if (uploadedImageUrls.length === 0) {
            return res.status(400).json({ 
                error: 'Images requises',
                details: 'Aucune image valide n\'a pu être traitée'
            });
        }
        
        // Si l'ancienne image principale a été supprimée ou n'existe pas, utiliser la première image disponible
        if (!existingProperty.image || deletedImages.includes(existingProperty.image)) {
            mainImage = uploadedImageUrls[0];
            console.log(`🔄 Image principale mise à jour: ${existingProperty.image || 'aucune'} → ${mainImage}`);
        } else {
            // Garder l'ancienne image principale si elle existe encore
            mainImage = existingProperty.image;
            console.log(`✅ Image principale conservée: ${mainImage}`);
        }
        
        // Vérification finale que mainImage est défini
        if (!mainImage) {
            console.error('❌ mainImage est undefined après traitement');
            return res.status(500).json({ 
                error: 'Erreur interne',
                details: 'Impossible de déterminer l\'image principale'
            });
        }
        
        // Préparer les données de mise à jour
        const finalUpdateData = {
            ...updateData,
            images: uploadedImageUrls,
            image: mainImage,
            updatedAt: new Date()
        };
        
        // Supprimer les champs qui ne doivent pas être modifiés
        delete finalUpdateData.id;
        delete finalUpdateData.createdAt;
        delete finalUpdateData.ownerId;
        
        console.log('📝 Données finales de mise à jour:', finalUpdateData);
        
        // Mettre à jour la propriété dans la base de données
        try {
            await dataService.updateProperty(propertyId, finalUpdateData);
            console.log(`✅ Propriété ${propertyId} mise à jour avec succès`);
            
            res.json({ 
                success: true, 
                message: 'Propriété modifiée avec succès',
                propertyId: propertyId,
                updatedProperty: {
                    ...existingProperty,
                    ...finalUpdateData
                }
            });
            
        } catch (updateError) {
            console.error('❌ Erreur lors de la mise à jour de la propriété:', updateError);
            res.status(500).json({ 
                error: 'Erreur lors de la modification de la propriété',
                details: updateError.message 
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la modification de la propriété:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la modification de la propriété',
            details: error.message 
        });
    }
});

// Route pour supprimer une propriété (suppression logique)
router.delete('/:id', async (req, res) => {
    try {
        const propertyId = req.params.id;
        console.log(`🔄 Suppression logique de la propriété ${propertyId}...`);
        
        // Récupérer la propriété pour obtenir les informations sur les images
        let property;
        try {
            property = await dataService.getPropertyById(propertyId);
        } catch (error) {
            console.warn(`⚠️ Propriété ${propertyId} non trouvée dans la base de données`);
            return res.status(404).json({ 
                error: 'Propriété non trouvée',
                details: 'La propriété à supprimer n\'existe pas'
            });
        }
        
        if (!property) {
            return res.status(404).json({ 
                error: 'Propriété non trouvée',
                details: 'La propriété à supprimer n\'existe pas'
            });
        }

        //On verifi que connectedUser.id est l id du owner de la propriete
        if(property.ownerId !== connectedUser.id) {
            return res.status(403).json({ 
                error: 'Accès refusé',
                details: 'Vous n\'êtes pas autorisé à supprimer cette propriété'
            });
        }
        
        // Supprimer les images de Firebase Storage
        if (property.images && property.images.length > 0) {
            console.log(`🗑️ Suppression de ${property.images.length} images de Firebase Storage...`);
            
            try {
                const { storageUtils } = require('../config/firebase');
                
                // Supprimer chaque image
                for (const imageUrl of property.images) {
                    if (imageUrl && imageUrl.includes('storage.googleapis.com')) {
                        // Extraire le chemin du fichier depuis l'URL
                        const urlParts = imageUrl.split('/');
                        const bucketName = urlParts[3]; // bikorent-fcae3.firebasestorage.app
                        const filePath = urlParts.slice(4).join('/'); // properties/123/main-image.png
                        
                        try {
                            await storageUtils.deleteFile(filePath);
                            console.log(`✅ Image supprimée: ${filePath}`);
                        } catch (deleteError) {
                            console.warn(`⚠️ Impossible de supprimer l'image ${filePath}:`, deleteError.message);
                        }
                    }
                }
                
                console.log('✅ Toutes les images ont été traitées');
                
            } catch (storageError) {
                console.error('❌ Erreur lors de la suppression des images:', storageError);
                // Continuer même si la suppression des images échoue
            }
        }
        
        // Mettre à jour la propriété avec isDeleted = true
        const updateData = {
            tenant: null,
            isDeleted: true,
            updatedAt: new Date(),
            image: "",
            images: []
        };
        
        try {
            await dataService.updateProperty(propertyId, updateData);
            console.log(`✅ Propriété ${propertyId} marquée comme supprimée`);
            
            res.json({ 
                success: true, 
                message: 'Propriété supprimée avec succès',
                propertyId: propertyId
            });
            
        } catch (updateError) {
            console.error('❌ Erreur lors de la mise à jour de la propriété:', updateError);
            res.status(500).json({ 
                error: 'Erreur lors de la suppression de la propriété',
                details: updateError.message 
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de la propriété:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la suppression de la propriété',
            details: error.message 
        });
    }
});

module.exports = router; 