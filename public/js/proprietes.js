// ========================================
// BikoRent - Gestion des Propriétés
// ========================================

// Initialisation du sidebar
function initSidebar() {
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');

    if (!menuBtn || !closeBtn || !sidebar || !mainContent) {
        console.error('Éléments du sidebar non trouvés');
        return;
    }

    function openSidebar() {
        sidebar.classList.add('active');
        mainContent.classList.add('sidebar-open');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        mainContent.classList.remove('sidebar-open');
    }

    // Attacher les événements
    menuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openSidebar();
    });
    
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeSidebar();
    });

    // Fermer le sidebar en cliquant à l'extérieur
    document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            closeSidebar();
        }
    });

    // Fermer le sidebar avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

// Marquer la page active dans le menu
function markActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Données simulées des propriétés
let properties = window.properties;
let properties2 = [
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

// Variables globales
let currentFilter = 'all';
let miniMap = null;
let currentPropertyMarker = null;
let editMiniMap = null;
let editPropertyMarker = null;
let currentImageIndex = 0;
let propertyImages = [];

// Éléments DOM
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebarBtn = document.getElementById('closeSidebar');
const addPropertyBtn = document.getElementById('addPropertyBtn');
const propertyModal = document.getElementById('propertyModal');
const propertyDetailsModal = document.getElementById('propertyDetailsModal');
const closeModal = document.getElementById('closeModal');
const closeDetailsModal = document.getElementById('closeDetailsModal');
const propertyForm = document.getElementById('propertyForm');
const searchProperty = document.getElementById('searchProperty');
const filterButtons = document.querySelectorAll('.filter-btn');
const propertiesGrid = document.getElementById('propertiesGrid');
const deleteModal = document.getElementById('deleteModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

// Nouveaux éléments pour la géolocalisation
const getCurrentLocationBtn = document.getElementById('getCurrentLocation');
const openMapPickerBtn = document.getElementById('openMapPicker');
const propertyLat = document.getElementById('propertyLat');
const propertyLng = document.getElementById('propertyLng');
const openGoogleMapsBtn = document.getElementById('openGoogleMapsBtn');
const updateLocationBtn = document.getElementById('updateLocationBtn');
const refreshLocationBtn = document.getElementById('refreshLocationBtn');
const miniMapContainer = document.getElementById('miniMap');

// Éléments pour le slider d'images
const imagesSlider = document.getElementById('imagesSlider');
const sliderDots = document.getElementById('sliderDots');
const sliderPrev = document.getElementById('sliderPrev');
const sliderNext = document.getElementById('sliderNext');
const addImageBtn = document.getElementById('addImageBtn');
const removeImageBtn = document.getElementById('removeImageBtn');

// Éléments pour le modal d'édition
const propertyEditModal = document.getElementById('propertyEditModal');
const closeEditModal = document.getElementById('closeEditModal');
const editPropertyBtn = document.getElementById('editPropertyBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const editPropertyForm = document.getElementById('editPropertyForm');

// Éléments pour le slider d'images d'édition
const editImagesSlider = document.getElementById('editImagesSlider');
const editSliderDots = document.getElementById('editSliderDots');
const editSliderPrev = document.getElementById('editSliderPrev');
const editSliderNext = document.getElementById('editSliderNext');
const editAddImageBtn = document.getElementById('editAddImageBtn');
const editRemoveImageBtn = document.getElementById('editRemoveImageBtn');
const editMiniMapContainer = document.getElementById('editMiniMap');

// Éléments pour la géolocalisation d'édition
const editGetCurrentLocationBtn = document.getElementById('editGetCurrentLocation');
const editOpenMapPickerBtn = document.getElementById('editOpenMapPicker');
const editRefreshLocationBtn = document.getElementById('editRefreshLocationBtn');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM chargé, propriétés disponibles:', properties.length);
    
    // Initialiser le sidebar
    initSidebar();
    markActivePage();
    
    // Test de diagnostic
    testDataDisplay();
    
    setupEventListeners();
    renderProperties();
    updateStats();
    console.log('Initialisation terminée');
});

// Fonction de test pour diagnostiquer le problème
function testDataDisplay() {
    console.log('=== DIAGNOSTIC DES DONNÉES ===');
    console.log('Nombre de propriétés:', properties.length);
    console.log('Propriétés:', properties);
    
    // Vérifier les éléments DOM
    const propertiesGrid = document.getElementById('propertiesGrid');
    const totalProperties = document.getElementById('totalProperties');
    const rentedProperties = document.getElementById('rentedProperties');
    const vacantProperties = document.getElementById('vacantProperties');
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    
    console.log('Éléments DOM trouvés:');
    console.log('- propertiesGrid:', propertiesGrid ? 'OK' : 'MANQUANT');
    console.log('- totalProperties:', totalProperties ? 'OK' : 'MANQUANT');
    console.log('- rentedProperties:', rentedProperties ? 'OK' : 'MANQUANT');
    console.log('- vacantProperties:', vacantProperties ? 'OK' : 'MANQUANT');
    console.log('- monthlyRevenue:', monthlyRevenue ? 'OK' : 'MANQUANT');
    
    // Forcer l'affichage si les éléments existent
    if (totalProperties) {
        totalProperties.textContent = properties.length;
        console.log('Total propriétés forcé à:', properties.length);
    }
    
    if (rentedProperties) {
        const rented = properties.filter(p => p.status === 'rented').length;
        rentedProperties.textContent = rented;
        console.log('Propriétés louées forcées à:', rented);
    }
    
    if (vacantProperties) {
        const vacant = properties.filter(p => p.status === 'vacant').length;
        vacantProperties.textContent = vacant;
        console.log('Propriétés vacantes forcées à:', vacant);
    }
    
    if (monthlyRevenue) {
        const revenue = properties.filter(p => p.status === 'rented').reduce((sum, p) => sum + p.rent, 0);
        monthlyRevenue.textContent = `FCFA ${revenue}`;
        console.log('Revenus mensuels forcés à: FCFA ', revenue);
    }
    
    // Forcer l'affichage des cartes de propriétés
    if (propertiesGrid) {
        console.log('Forçage de l\'affichage des cartes de propriétés...');
        const testHTML = properties.map(property => `
            <div class="property-card">
                <div class="property-image">
                    <img src="${property.image}" alt="${property.name}">
                    <div class="property-status-overlay">
                        <span class="property-status status-${property.status}">
                            ${getStatusText(property.status)}
                        </span>
                    </div>
                </div>
                <div class="property-header">
                    <div class="property-status status-${property.status}">
                        ${getStatusText(property.status)}
                    </div>
                    <div class="property-actions">
                        <button class="btn-icon" onclick="viewProperty('${property.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="editProperty('${property.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-property" onclick="deleteProperty('${property.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="property-content">
                    <h3 class="property-name">${property.name}</h3>
                    <p class="property-type">${getTypeText(property.type)} • ${property.surface}m²</p>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${property.address}, ${property.city} ${property.zipCode}</span>
                        <button class="btn-locate-icon" onclick="openGoogleMaps(${property.coordinates.lat}, ${property.coordinates.lng}, '${property.name}')" title="Localiser sur Google Maps">
                            <i class="fas fa-location-arrow"></i>
                        </button>
                    </div>
                    <div class="property-tenant">
                        <i class="fas fa-user"></i>
                        <span>${property.tenant || 'Aucun locataire'}</span>
                    </div>
                    <div class="property-rent">
                        <i class="fas fa-euro-sign"></i>
                        <span>FCFA ${property.rent}/mois</span>
                    </div>
                    <div class="property-features">
                        ${property.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                        ${property.features.length > 3 ? 
                            `<span class="feature-more">+${property.features.length - 3}</span>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
        propertiesGrid.innerHTML = testHTML;
        console.log('Cartes de propriétés forcées affichées');
    }
    
    console.log('=== FIN DIAGNOSTIC ===');
}

// Variables globales pour l'upload d'image
let selectedImageBase64 = null;

// Fonction pour compresser une image
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calculer les nouvelles dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Configurer le canvas
            canvas.width = width;
            canvas.height = height;
            
            // Dessiner l'image compressée
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en Base64 avec compression
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Fonction pour gérer l'upload d'image
async function handleImageUpload(event) {
    const file = event.target.files[0];
    const imagePreview = document.getElementById('imagePreview');
    
    if (!file) {
        return;
    }
    
    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner une image valide', 'error');
        return;
    }
    
    // Vérifier la taille (max 10MB pour l'original)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('L\'image est trop volumineuse (max 10MB)', 'error');
        return;
    }
    
    try {
        // Afficher un indicateur de chargement
        imagePreview.innerHTML = `
            <div class="image-overlay">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Compression de l'image...</span>
            </div>
        `;
        
        // Compresser l'image
        const compressedBase64 = await compressImage(file, 800, 0.7);
        selectedImageBase64 = compressedBase64;
        
        // Afficher la prévisualisation
        imagePreview.style.backgroundImage = `url(${compressedBase64})`;
        imagePreview.style.backgroundSize = 'cover';
        imagePreview.style.backgroundPosition = 'center';
        imagePreview.style.backgroundRepeat = 'no-repeat';
        imagePreview.classList.add('has-image');
        imagePreview.innerHTML = `
            <div class="image-overlay">
                <i class="fas fa-check"></i>
                <span>Image compressée et sélectionnée</span>
                <button type="button" class="btn-remove-image" onclick="removeSelectedImage()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Afficher la taille compressée
        const originalSize = (file.size / 1024 / 1024).toFixed(2);
        const compressedSize = (compressedBase64.length * 0.75 / 1024 / 1024).toFixed(2);
        console.log(`Image compressée: ${originalSize}MB → ${compressedSize}MB`);
        
    } catch (error) {
        console.error('Erreur lors de la compression:', error);
        showNotification('Erreur lors de la compression de l\'image', 'error');
        
        // Fallback: utiliser l'image originale
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageBase64 = e.target.result;
            imagePreview.style.backgroundImage = `url(${selectedImageBase64})`;
            imagePreview.style.backgroundSize = 'cover';
            imagePreview.style.backgroundPosition = 'center';
            imagePreview.style.backgroundRepeat = 'no-repeat';
            imagePreview.classList.add('has-image');
            imagePreview.innerHTML = `
                <div class="image-overlay">
                    <i class="fas fa-check"></i>
                    <span>Image sélectionnée (non compressée)</span>
                    <button type="button" class="btn-remove-image" onclick="removeSelectedImage()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// Fonction pour supprimer l'image sélectionnée
function removeSelectedImage() {
    const imagePreview = document.getElementById('imagePreview');
    const propertyImageInput = document.getElementById('propertyImage');
    
    selectedImageBase64 = null;
    propertyImageInput.value = '';
    
    // Restaurer l'état initial
    imagePreview.style.backgroundImage = 'none';
    imagePreview.style.backgroundSize = '';
    imagePreview.style.backgroundPosition = '';
    imagePreview.style.backgroundRepeat = '';
    imagePreview.classList.remove('has-image');
    imagePreview.innerHTML = `
        <i class="fas fa-camera"></i>
        <span>Cliquez pour sélectionner une image</span>
    `;
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Boutons principaux
    addPropertyBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closePropertyModal);
    closeDetailsModal.addEventListener('click', closeDetailsModalHandler);
    closeDeleteModal.addEventListener('click', closeDeleteModalHandler);

    // Formulaire
    propertyForm.addEventListener('submit', handlePropertySubmit);

    // Recherche et filtres
    searchProperty.addEventListener('input', handleSearch);
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Suppression
    confirmDelete.addEventListener('click', handleDeleteConfirm);
    cancelDelete.addEventListener('click', closeDeleteModalHandler);

    // Géolocalisation
    getCurrentLocationBtn.addEventListener('click', getCurrentLocation);
    openMapPickerBtn.addEventListener('click', openMapPicker);
    openGoogleMapsBtn.addEventListener('click', openGoogleMapsFromDetails);
    updateLocationBtn.addEventListener('click', updateLocationFromDetails);
    refreshLocationBtn.addEventListener('click', refreshMiniMap);

    // Slider d'images
    sliderPrev.addEventListener('click', previousImage);
    sliderNext.addEventListener('click', nextImage);
    addImageBtn.addEventListener('click', addImage);
    removeImageBtn.addEventListener('click', removeImage);

    // Modal d'édition
    editPropertyBtn.addEventListener('click', openEditModal);
    closeEditModal.addEventListener('click', closeEditModalHandler);
    cancelEditBtn.addEventListener('click', closeEditModalHandler);
    saveEditBtn.addEventListener('click', handleEditSubmit);

    // Slider d'images d'édition
    editSliderPrev.addEventListener('click', () => previousEditImage());
    editSliderNext.addEventListener('click', () => nextEditImage());
    editAddImageBtn.addEventListener('click', addEditImage);
    editRemoveImageBtn.addEventListener('click', removeEditImage);

    // Géolocalisation d'édition
    editGetCurrentLocationBtn.addEventListener('click', getEditCurrentLocation);
    (editOpenMapPickerBtn) ? editOpenMapPickerBtn.addEventListener('click', openEditMapPicker) : null;
    editRefreshLocationBtn.addEventListener('click', refreshEditMiniMap);

    // Upload d'image
    const propertyImageInput = document.getElementById('propertyImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (propertyImageInput && imagePreview) {
        propertyImageInput.addEventListener('change', handleImageUpload);
        imagePreview.addEventListener('click', () => propertyImageInput.click());
    }

    // Bouton Annuler du modal d'ajout
    const cancelPropertyBtn = document.getElementById('cancelProperty');
    if (cancelPropertyBtn) {
        cancelPropertyBtn.addEventListener('click', closePropertyModal);
    }

    // Fermer les modals en cliquant à l'extérieur (sauf le modal d'ajout de propriété)
    window.addEventListener('click', function(e) {
        // Ne pas fermer le modal d'ajout de propriété en cliquant à l'extérieur
        // if (e.target === propertyModal) {
        //     closePropertyModal();
        // }
        if (e.target === propertyDetailsModal) {
            closeDetailsModalHandler();
        }
        if (e.target === propertyEditModal) {
            closeEditModalHandler();
        }
        if (e.target === deleteModal) {
            closeDeleteModalHandler();
        }
    });
}

// Rendu des propriétés
function renderProperties() {
    const filteredProperties = getFilteredProperties();
    console.log('Rendu des propriétés:', filteredProperties.length, 'propriétés trouvées');
    console.log('🔗 [DEBUG] Statuts des propriétés:', filteredProperties.map(p => ({ id: p.id, name: p.name, status: p.status, isPaymentLink: p.isPaymentLink })));
    
    propertiesGrid.innerHTML = filteredProperties.map(property => `
        <div class="property-card">
            <div class="property-image">
                <img src="${property.image}" alt="${property.name}">
                <div class="property-status-overlay">
                    <span class="property-status status-${property.status}">
                        ${getStatusText(property.status)}
                    </span>
                </div>
            </div>
            <div class="property-header">
                <div class="property-status status-${property.status}">
                    ${getStatusText(property.status)}
                </div>
                <div class="property-actions">
                    <button class="btn-icon" onclick="viewProperty('${property.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="editProperty('${property.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${(() => {
                        const shouldShow = property.status === 'rented' && (property.isPaymentLink === true);
                        console.log(`🔗 [DEBUG] Propriété ${property.id} (${property.name}): status=${property.status}, isPaymentLink=${property.isPaymentLink}, shouldShow=${shouldShow}`);
                        return shouldShow;
                    })() ? `
                    <button class="btn-icon payment-link-btn" onclick="generatePaymentLink('${property.id}')" title="Générer un lien de paiement">
                        <i class="fas fa-link"></i>
                    </button>
                    ` : ''}
                    <button class="btn-icon delete-property" onclick="deleteProperty('${property.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="property-content">
                <h3 class="property-name">${property.name}</h3>
                <p class="property-type">${getTypeText(property.type)} • ${property.surface}m²</p>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${property.address}, ${property.city} ${property.zipCode}</span>
                    <button class="btn-locate-icon" onclick="openGoogleMaps(${property.coordinates.lat}, ${property.coordinates.lng}, '${property.name}')" title="Localiser sur Google Maps">
                        <i class="fas fa-location-arrow"></i>
                    </button>
                </div>
                <div class="property-tenant">
                    <i class="fas fa-user"></i>
                    <span>${property.tenant || 'Aucun locataire'}</span>
                </div>
                <div class="property-rent">
                    <i class="fas fa-euro-sign"></i>
                    <span>FCFA ${property.rent}/mois</span>
                </div>
                <div class="property-features">
                    ${property.features.slice(0, 3).map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                    ${property.features.length > 3 ? 
                        `<span class="feature-more">+${property.features.length - 3}</span>` : 
                        ''
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Fonctions de géolocalisation
function openGoogleMaps(lat, lng, propertyName) {
    const url = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&q=${encodeURIComponent(propertyName)}`;
    window.open(url, '_blank');
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        getCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation...';
        getCurrentLocationBtn.disabled = true;
        
        // Utiliser watchPosition pour une meilleure précision
        const watchId = navigator.geolocation.watchPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                console.log('Position obtenue:', {
                    latitude: lat,
                    longitude: lng,
                    accuracy: accuracy + 'm',
                    timestamp: new Date(position.timestamp).toLocaleString()
                });
                
                propertyLat.value = lat.toFixed(8);
                propertyLng.value = lng.toFixed(8);
                
                // Si la précision est bonne (< 10m), arrêter la surveillance
                if (accuracy < 10) {
                    navigator.geolocation.clearWatch(watchId);
                    getCurrentLocationBtn.innerHTML = '<i class="fas fa-check"></i> Position précise obtenue';
                    setTimeout(() => {
                        getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                        getCurrentLocationBtn.disabled = false;
                    }, 2000);
                    showNotification(`Position précise obtenue (${Math.round(accuracy)}m)`, 'success');
                } else {
                    getCurrentLocationBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Amélioration précision (${Math.round(accuracy)}m)...`;
                }
            },
            function(error) {
                navigator.geolocation.clearWatch(watchId);
                console.error('Erreur de géolocalisation:', error);
                getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                getCurrentLocationBtn.disabled = false;
                
                let errorMessage = 'Impossible de récupérer votre position';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Position non disponible. Vérifiez votre connexion GPS/Internet.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Délai de géolocalisation dépassé. Réessayez.';
                        break;
                }
                
                showNotification(errorMessage, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
        
        // Arrêter la surveillance après 20 secondes maximum
        setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (getCurrentLocationBtn.disabled) {
                getCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                getCurrentLocationBtn.disabled = false;
                showNotification('Position obtenue (précision limitée)', 'info');
            }
        }, 20000);
        
    } else {
        showNotification('La géolocalisation n\'est pas supportée par votre navigateur', 'error');
    }
}

function openMapPicker() {
    // Ouvrir une nouvelle fenêtre avec Google Maps pour choisir l'emplacement
    const url = 'https://www.google.com/maps';
    window.open(url, '_blank');
    showNotification('Ouvrez Google Maps et copiez les coordonnées dans les champs', 'info');
}

function openGoogleMapsFromDetails() {
    const property = getCurrentPropertyFromDetails();
    if (property && property.coordinates) {
        openGoogleMaps(property.coordinates.lat, property.coordinates.lng, property.name);
    }
}

function updateLocationFromDetails() {
    const property = getCurrentPropertyFromDetails();
    if (property) {
        getCurrentLocation();
    }
}

function refreshMiniMap() {
    const property = getCurrentPropertyFromDetails();
    if (property && property.coordinates) {
        initMiniMap(property.coordinates.lat, property.coordinates.lng, property.name);
    }
}

// Initialisation de la carte miniature
function initMiniMap(lat, lng, propertyName) {
    if (!miniMapContainer) {
        console.warn('Container de carte miniature non trouvé');
        return;
    }
    
    // Vérifier que Google Maps est chargé
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps API non chargée - Affichage des coordonnées uniquement');
        // Afficher les coordonnées au lieu de la carte
        miniMapContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; background: #f5f5f5; border-radius: 8px;">
                <h4>Coordonnées de la propriété</h4>
                <p><strong>Latitude:</strong> ${lat}</p>
                <p><strong>Longitude:</strong> ${lng}</p>
                <button onclick="openGoogleMaps(${lat}, ${lng}, '${propertyName}')" class="btn btn-primary">
                    <i class="fas fa-map-marker-alt"></i> Voir sur Google Maps
                </button>
            </div>
        `;
        return;
    }
    
    try {
        // Détruire la carte existante
        if (miniMap) {
            miniMap = null;
        }
        
        // Créer une nouvelle carte
        miniMap = new google.maps.Map(miniMapContainer, {
            center: { lat: parseFloat(lat), lng: parseFloat(lng) },
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
        });
        
        // Ajouter le marqueur
        if (currentPropertyMarker) {
            currentPropertyMarker.setMap(null);
        }
        
        currentPropertyMarker = new google.maps.Marker({
            position: { lat: parseFloat(lat), lng: parseFloat(lng) },
            map: miniMap,
            title: propertyName,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte miniature:', error);
    }
}

// Affichage des détails d'une propriété
function viewProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    // Remplir les détails
    document.getElementById('detailPropertyName').textContent = property.name;
    document.getElementById('detailType').textContent = getTypeText(property.type);
    document.getElementById('detailSurface').textContent = `${property.surface}m²`;
    document.getElementById('detailRooms').textContent = property.rooms;
    document.getElementById('detailBedrooms').textContent = property.bedrooms;
    document.getElementById('detailRent').textContent = `FCFA ${property.rent}/mois`;
    document.getElementById('detailStatus').textContent = getStatusText(property.status);
    document.getElementById('detailAddress').textContent = `${property.address}, ${property.city} ${property.zipCode}`;
    document.getElementById('detailCoordinates').textContent = `${property.coordinates.lat}, ${property.coordinates.lng}`;
    document.getElementById('detailDescription').textContent = property.description;
    
    // Initialiser les images du slider
    propertyImages = property.images || [property.image];
    currentImageIndex = 0;
    initImageSlider();
    
    // Afficher les équipements
    const featuresContainer = document.getElementById('detailFeatures');
    featuresContainer.innerHTML = property.features.map(feature => 
        `<span class="feature-tag">${feature}</span>`
    ).join('');
    
    // Initialiser la carte miniature
    setTimeout(() => {
        initMiniMap(property.coordinates.lat, property.coordinates.lng, property.name);
    }, 100);
    
    // Ouvrir le modal
    propertyDetailsModal.classList.add('show');
    
    // Stocker la propriété actuelle pour les actions
    propertyDetailsModal.dataset.currentPropertyId = property.id;
}

// Fonctions pour le slider d'images
function initImageSlider() {
    if (!imagesSlider || !sliderDots) return;
    
    // Vider le slider
    imagesSlider.innerHTML = '';
    sliderDots.innerHTML = '';
    
    if (propertyImages.length === 0) {
        // Afficher une image par défaut
        imagesSlider.innerHTML = `
            <div class="slider-slide">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" alt="Aucune image">
            </div>
        `;
        sliderDots.innerHTML = '<div class="slider-dot active"></div>';
        removeImageBtn.style.display = 'none';
        return;
    }
    
    // Créer les slides
    propertyImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        slide.innerHTML = `<img src="${image}" alt="Image ${index + 1}">`;
        imagesSlider.appendChild(slide);
        
        // Créer les points de navigation
        const dot = document.createElement('div');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToImage(index));
        sliderDots.appendChild(dot);
    });
    
    // Afficher/masquer le bouton de suppression
    removeImageBtn.style.display = propertyImages.length > 1 ? 'block' : 'none';
    
    // Mettre à jour la position
    updateSliderPosition();
}

function updateSliderPosition() {
    if (!imagesSlider) return;
    const translateX = -currentImageIndex * 100;
    imagesSlider.style.transform = `translateX(${translateX}%)`;
    
    // Mettre à jour les points actifs
    const dots = sliderDots.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentImageIndex);
    });
    
    // Afficher/masquer les boutons de navigation
    sliderPrev.style.display = currentImageIndex > 0 ? 'flex' : 'none';
    sliderNext.style.display = currentImageIndex < propertyImages.length - 1 ? 'flex' : 'none';
    
    // Afficher/masquer le bouton de suppression
    removeImageBtn.style.display = propertyImages.length > 1 ? 'block' : 'none';
}

function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateSliderPosition();
    }
}

function nextImage() {
    if (currentImageIndex < propertyImages.length - 1) {
        currentImageIndex++;
        updateSliderPosition();
    }
}

function goToImage(index) {
    currentImageIndex = index;
    updateSliderPosition();
}

function addImage() {
    // Créer un input file temporaire
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newImage = e.target.result;
                propertyImages.push(newImage);
                
                // Mettre à jour la propriété
                const property = getCurrentPropertyFromDetails();
                if (property) {
                    property.images = propertyImages;
                }
                
                // Réinitialiser le slider
                currentImageIndex = propertyImages.length - 1;
                initImageSlider();
                showNotification('Image chargée avec succès', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function removeImage() {
    if (propertyImages.length <= 1) {
        showNotification('Impossible de supprimer la dernière image', 'error');
        return;
    }
    
    // Supprimer l'image actuelle
    propertyImages.splice(currentImageIndex, 1);
    
    // Ajuster l'index si nécessaire
    if (currentImageIndex >= propertyImages.length) {
        currentImageIndex = propertyImages.length - 1;
    }
    
    // Mettre à jour la propriété
    const property = getCurrentPropertyFromDetails();
    if (property) {
        property.images = propertyImages;
    }
    
    // Réinitialiser le slider
    initImageSlider();
    showNotification('Image supprimée avec succès', 'success');
}

function getCurrentPropertyFromDetails() {
    const propertyId = parseInt(propertyDetailsModal.dataset.currentPropertyId);
    return properties.find(p => p.id === propertyId);
}

function closeDetailsModalHandler() {
    propertyDetailsModal.classList.remove('show');
    
    // Nettoyer la carte
    try {
        if (miniMap) {
            miniMap = null;
        }
        if (currentPropertyMarker) {
            currentPropertyMarker.setMap(null);
            currentPropertyMarker = null;
        }
    } catch (error) {
        console.warn('Erreur lors du nettoyage de la carte:', error);
    }
}

// Fonctions utilitaires existantes (à conserver)
function getFilteredProperties() {
    let filtered = properties;
    
    // Filtre des propriétés supprimées (suppression logique)
    filtered = filtered.filter(property => !property.isDeleted);
    
    // Filtre par statut
    if (currentFilter !== 'all') {
        filtered = filtered.filter(property => property.status === currentFilter);
    }
    
    // Filtre par recherche
    const searchTerm = searchProperty.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(property => 
            property.name.toLowerCase().includes(searchTerm) ||
            property.address.toLowerCase().includes(searchTerm) ||
            property.city.toLowerCase().includes(searchTerm) ||
            (property.tenant && property.tenant.toLowerCase().includes(searchTerm))
        );
    }
    
    return filtered;
}

function getStatusText(status) {
    const statusMap = {
        'vacant': 'Vacant',
        'rented': 'Loué',
        'maintenance': 'En maintenance'
    };
    return statusMap[status] || status;
}

function getTypeText(type) {
    const typeMap = {
        'appartement': 'Appartement',
        'maison': 'Maison',
        'studio': 'Studio',
        'bureau': 'Bureau',
        'commerce': 'Commerce'
    };
    return typeMap[type] || type;
}

function updateStats() {
    // Filtrer les propriétés non supprimées pour les statistiques
    const activeProperties = properties.filter(p => !p.isDeleted);
    
    console.log('Mise à jour des statistiques:', activeProperties.length, 'propriétés actives');
    document.getElementById('totalProperties').textContent = activeProperties.length;
    document.getElementById('rentedProperties').textContent = activeProperties.filter(p => p.status === 'rented').length;
    document.getElementById('vacantProperties').textContent = activeProperties.filter(p => p.status === 'vacant').length;
    
    const monthlyRevenue = activeProperties
        .filter(p => p.status === 'rented')
        .reduce((sum, p) => sum + p.rent, 0);
    document.getElementById('monthlyRevenue').textContent = `FCFA ${monthlyRevenue}`;
    console.log('Statistiques mises à jour');
}

function handleSearch() {
    renderProperties();
}

function handleFilter(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderProperties();
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter une propriété';
    propertyForm.reset();
    
    // Réinitialiser l'image sélectionnée
    selectedImageBase64 = null;
    removeSelectedImage();
    
    // Empêcher le scroll de la page
    document.body.classList.add('modal-open');
    
    propertyModal.classList.add('show');
}

function closePropertyModal() {
    propertyModal.classList.remove('show');
    
    // Réinitialiser le formulaire et l'image sélectionnée
    propertyForm.reset();
    selectedImageBase64 = null;
    removeSelectedImage();
    
    // Réinitialiser les boutons au cas où ils seraient désactivés
    const saveBtn = document.getElementById('saveProperty');
    const cancelBtn = document.getElementById('cancelProperty');
    const closeBtn = document.getElementById('closeModal');
    
    if (saveBtn) {
        saveBtn.innerHTML = 'Enregistrer';
        saveBtn.disabled = false;
    }
    if (cancelBtn) {
        cancelBtn.disabled = false;
    }
    if (closeBtn) {
        closeBtn.disabled = false;
    }
    
    // Restaurer le scroll de la page
    document.body.classList.remove('modal-open');
}

function handlePropertySubmit(e) {
    e.preventDefault();
    
    // Validation : vérifier qu'au moins une image est sélectionnée
    if (!selectedImageBase64) {
        showNotification('Veuillez sélectionner au moins une image pour la propriété', 'error');
        return;
    }
    
    const formData = new FormData(propertyForm);
    console.log('propertyForm', propertyForm);
    console.log(formData.get('propertyName'),);
    
    console.log('formData', formData.get('propertyDescription'));
    console.log('formData', formData.get('propertyFeatures'));
    
    const newProperty = {
        //id: Date.now(),
        name: formData.get('propertyName'),
        type: formData.get('propertyType'),
        surface: parseInt(formData.get('propertySurface')),
        rooms: parseInt(formData.get('propertyRooms')) || 0,
        bedrooms: parseInt(formData.get('propertyBedrooms')) || 0,
        address: formData.get('propertyAddress'),
        city: formData.get('propertyCity'),
        zipCode: formData.get('propertyZip'),
        coordinates: {
            lat: parseFloat(formData.get('propertyLat')) || 48.8566,
            lng: parseFloat(formData.get('propertyLng')) || 2.3522
        },
        monthlyRent: parseFloat(formData.get('propertyRent')),
        status: formData.get('propertyStatus'),
        tenant: null,
        description: formData.get('propertyDescription'),
        features: formData.get('propertyFeatures').split(',').map(f => f.trim()).filter(f => f),
        isPaymentLink: formData.get('propertyPaymentLink') === 'on',
        image: selectedImageBase64, // Utiliser seulement l'image sélectionnée
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
    };
    
    // Récupérer les boutons pour les désactiver
    const saveBtn = document.getElementById('saveProperty');
    const cancelBtn = document.getElementById('cancelProperty');
    const closeBtn = document.getElementById('closeModal');
    
    // Sauvegarder le contenu original des boutons
    const originalSaveContent = saveBtn.innerHTML;
    const originalCancelDisabled = cancelBtn.disabled;
    const originalCloseDisabled = closeBtn.disabled;
    
    // Afficher le loader et désactiver les boutons
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    closeBtn.disabled = true;
    
    // Envoyer la propriété au backend avec l'image base64
    axios.post('/proprietes/add', newProperty)
        .then(response => {
            console.log('Propriété ajoutée avec succès', response.data);
            showNotification('Propriété ajoutée avec succès', 'success');
            
            // Réinitialiser l'image sélectionnée
            selectedImageBase64 = null;
            removeSelectedImage();
            
            // Fermer le modal seulement si la requête réussit
            closePropertyModal();
            
            // Recharger la page pour afficher la nouvelle propriété
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la propriété:', error);
            showNotification('Une erreur est survenue lors de l\'ajout de la propriété', 'error');
            // Ne pas fermer le modal en cas d'erreur
        })
        .finally(() => {
            // Restaurer les boutons
            saveBtn.innerHTML = originalSaveContent;
            saveBtn.disabled = false;
            cancelBtn.disabled = originalCancelDisabled;
            closeBtn.disabled = originalCloseDisabled;
        });
}

function addProperty(newProperty) {
    //On envoie la propriete dans le backend
    axios.post('/api/properties', newProperty)
        .then(response => {
            console.log('Propriété ajoutée avec succès', response.data);
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout de la propriété:', error);
        });
    const propertyRef = firebase.firestore().collection('properties').doc();
    propertyRef.set(newProperty);
}
function editProperty(id) {
    const property = properties.find(p => p.id === id);
    if (!property) return;
    
    // Remplir le formulaire d'édition avec les données existantes
    document.getElementById('editPropertyName').textContent = `Modifier ${property.name}`;
    document.getElementById('editPropertyNameInput').value = property.name;
    document.getElementById('editPropertyType').value = property.type;
    document.getElementById('editPropertySurface').value = property.surface;
    document.getElementById('editPropertyRooms').value = property.rooms;
    document.getElementById('editPropertyBedrooms').value = property.bedrooms;
    document.getElementById('editPropertyAddress').value = property.address;
    document.getElementById('editPropertyCity').value = property.city;
    document.getElementById('editPropertyZip').value = property.zipCode;
    document.getElementById('editPropertyLat').value = property.coordinates.lat;
    document.getElementById('editPropertyLng').value = property.coordinates.lng;
    document.getElementById('editPropertyRent').value = property.rent;
    document.getElementById('editPropertyStatus').value = property.status;
    document.getElementById('editPropertyDescription').value = property.description;
    document.getElementById('editPropertyFeatures').value = property.features.join(', ');
    document.getElementById('editPropertyPaymentLink').checked = property.isPaymentLink === true;
    
    // Initialiser les images du slider d'édition
    propertyImages = property.images || [property.image];
    currentImageIndex = 0;
    initEditImageSlider();
    
    // Initialiser la carte miniature d'édition
    setTimeout(() => {
        initEditMiniMap(property.coordinates.lat, property.coordinates.lng, property.name);
    }, 100);
    
    // Ouvrir le modal d'édition
    propertyEditModal.classList.add('show');
    propertyEditModal.dataset.editId = property.id;
}

function deleteProperty(id) {
    deleteModal.classList.add('show');
    deleteModal.dataset.deleteId = id;
}

function closeDeleteModalHandler() {
    deleteModal.classList.remove('show');
}

function handleDeleteConfirm() {
    const id = deleteModal.dataset.deleteId;
    
    // Afficher un indicateur de chargement
    confirmDelete.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suppression...';
    confirmDelete.disabled = true;
    
    // Envoyer la requête DELETE au backend
    axios.delete(`/proprietes/${id}`)
        .then(response => {
            console.log('Propriété supprimée avec succès:', response.data);
            
            // Marquer la propriété comme supprimée localement
            const property = properties.find(p => p.id === id);
            if (property) {
                property.isDeleted = true;
                property.updatedAt = new Date();
                property.deletedAt = new Date();
            }
            
            // Filtrer les propriétés supprimées de l'affichage
            properties = properties.filter(p => !p.isDeleted);
            
            renderProperties();
            updateStats();
            closeDeleteModalHandler();
            showNotification('Propriété supprimée avec succès', 'success');
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de la propriété:', error);
            
            let errorMessage = 'Une erreur est survenue lors de la suppression';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            
            showNotification(errorMessage, 'error');
        })
        .finally(() => {
            // Restaurer le bouton
            confirmDelete.innerHTML = 'Confirmer la suppression';
            confirmDelete.disabled = false;
        });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Fonctions pour le modal d'édition
function openEditModal() {
    // Cette fonction est appelée par le bouton "Modifier cette propriété" dans le modal de visualisation
    const propertyId = parseInt(propertyDetailsModal.dataset.currentPropertyId);
    if (propertyId) {
        editProperty(propertyId);
        closeDetailsModalHandler();
    }
}

function closeEditModalHandler() {
    propertyEditModal.classList.remove('show');
    
    // Nettoyer la carte d'édition
    try {
        if (editMiniMap) {
            editMiniMap = null;
        }
        if (editPropertyMarker) {
            editPropertyMarker.setMap(null);
            editPropertyMarker = null;
        }
    } catch (error) {
        console.warn('Erreur lors du nettoyage de la carte d\'édition:', error);
    }
}

function handleEditSubmit() {
    const propertyId = propertyEditModal.dataset.editId;
    const property = properties.find(p => p.id === propertyId);
    
    if (!property) return;
    
    // Récupérer les valeurs du formulaire d'édition
    const updatedProperty = {
        name: document.getElementById('editPropertyNameInput').value,
        type: document.getElementById('editPropertyType').value,
        surface: parseInt(document.getElementById('editPropertySurface').value),
        rooms: parseInt(document.getElementById('editPropertyRooms').value) || 0,
        bedrooms: parseInt(document.getElementById('editPropertyBedrooms').value) || 0,
        address: document.getElementById('editPropertyAddress').value,
        city: document.getElementById('editPropertyCity').value,
        zipCode: document.getElementById('editPropertyZip').value,
        coordinates: {
            lat: parseFloat(document.getElementById('editPropertyLat').value) || 48.8566,
            lng: parseFloat(document.getElementById('editPropertyLng').value) || 2.3522
        },
        monthlyRent: parseFloat(document.getElementById('editPropertyRent').value),
        status: document.getElementById('editPropertyStatus').value,
        description: document.getElementById('editPropertyDescription').value,
        features: document.getElementById('editPropertyFeatures').value.split(',').map(f => f.trim()).filter(f => f),
        isPaymentLink: document.getElementById('editPropertyPaymentLink').checked,
        image: (propertyImages && propertyImages.length > 0) ? propertyImages[0] : (property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'),
        images: propertyImages && propertyImages.length > 0 ? propertyImages : (property.images || [property.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'])
    };
    
    // Vérifier qu'il y a au moins une image
    if (propertyImages.length === 0) {
        showNotification('Une propriété doit avoir au moins une image', 'error');
        return;
    }
    
    // Afficher un indicateur de chargement
    const saveEditBtn = document.getElementById('saveEditBtn');
    const originalText = saveEditBtn.innerHTML;
    saveEditBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
    saveEditBtn.disabled = true;
    
    console.log('🔄 Envoi de la modification au backend...', updatedProperty);
    
    // Envoyer la modification au backend
    axios.put(`/proprietes/${propertyId}`, updatedProperty)
        .then(response => {
            console.log('✅ Propriété modifiée avec succès:', response.data);
            
            // Mettre à jour la propriété locale avec les nouvelles données
            Object.assign(property, response.data.updatedProperty);
            
            // Mettre à jour aussi le tableau global window.properties
            const globalProperty = window.properties.find(p => p.id === propertyId);
            if (globalProperty) {
                Object.assign(globalProperty, response.data.updatedProperty);
            }
            
            // Mettre à jour l'affichage
            renderProperties();
            updateStats();
            closeEditModalHandler();
            showNotification('Propriété modifiée avec succès', 'success');
        })
        .catch(error => {
            console.error('❌ Erreur lors de la modification de la propriété:', error);
            
            let errorMessage = 'Une erreur est survenue lors de la modification de la propriété';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
                if (error.response.data.details) {
                    errorMessage += `: ${error.response.data.details}`;
                }
            }
            
            showNotification(errorMessage, 'error');
        })
        .finally(() => {
            // Restaurer le bouton
            saveEditBtn.innerHTML = originalText;
            saveEditBtn.disabled = false;
        });
}

// Fonctions pour le slider d'images d'édition
function initEditImageSlider() {
    if (!editImagesSlider || !editSliderDots) return;
    
    // Vider le slider
    editImagesSlider.innerHTML = '';
    editSliderDots.innerHTML = '';
    
    if (propertyImages.length === 0) {
        editImagesSlider.innerHTML = `
            <div class="slider-slide">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" alt="Aucune image">
            </div>
        `;
        editSliderDots.innerHTML = '<div class="slider-dot active"></div>';
        editRemoveImageBtn.style.display = 'none';
        return;
    }
    
    // Créer les slides
    propertyImages.forEach((image, index) => {
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        slide.innerHTML = `<img src="${image}" alt="Image ${index + 1}">`;
        editImagesSlider.appendChild(slide);
        
        // Créer les points de navigation
        const dot = document.createElement('div');
        dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToEditImage(index));
        editSliderDots.appendChild(dot);
    });
    
    // Afficher/masquer le bouton de suppression
    editRemoveImageBtn.style.display = propertyImages.length > 1 ? 'block' : 'none';
    
    // Mettre à jour la position
    updateEditSliderPosition();
}

function updateEditSliderPosition() {
    if (!editImagesSlider) return;
    const translateX = -currentImageIndex * 100;
    editImagesSlider.style.transform = `translateX(${translateX}%)`;
    
    // Mettre à jour les points actifs
    const dots = editSliderDots.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentImageIndex);
    });
    
    // Afficher/masquer les boutons de navigation
    editSliderPrev.style.display = currentImageIndex > 0 ? 'flex' : 'none';
    editSliderNext.style.display = currentImageIndex < propertyImages.length - 1 ? 'flex' : 'none';
    
    // Afficher/masquer le bouton de suppression
    editRemoveImageBtn.style.display = propertyImages.length > 1 ? 'block' : 'none';
}

function previousEditImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateEditSliderPosition();
    }
}

function nextEditImage() {
    if (currentImageIndex < propertyImages.length - 1) {
        currentImageIndex++;
        updateEditSliderPosition();
    }
}

function goToEditImage(index) {
    currentImageIndex = index;
    updateEditSliderPosition();
}

function addEditImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const newImage = e.target.result;
                propertyImages.push(newImage);
                currentImageIndex = propertyImages.length - 1;
                initEditImageSlider();
                //showNotification('Image ajoutée avec succès', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function removeEditImage() {
    if (propertyImages.length <= 1) {
        showNotification('Impossible de supprimer la dernière image. Une propriété doit avoir au moins une image.', 'error');
        return;
    }
    
    // Demander confirmation avant de supprimer
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
        return;
    }
    
    // Supprimer l'image actuelle
    propertyImages.splice(currentImageIndex, 1);
    
    if (currentImageIndex >= propertyImages.length) {
        currentImageIndex = propertyImages.length - 1;
    }
    
    initEditImageSlider();
    showNotification('Image supprimée avec succès', 'success');
}

// Fonctions pour la géolocalisation d'édition
function getEditCurrentLocation() {
    if (navigator.geolocation) {
        editGetCurrentLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Localisation...';
        editGetCurrentLocationBtn.disabled = true;
        
        // Essayer d'abord avec une précision élevée
        const watchId = navigator.geolocation.watchPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                console.log('Position d\'édition obtenue:', {
                    latitude: lat,
                    longitude: lng,
                    accuracy: accuracy + 'm',
                    timestamp: new Date(position.timestamp).toLocaleString()
                });
                
                document.getElementById('editPropertyLat').value = lat.toFixed(8);
                document.getElementById('editPropertyLng').value = lng.toFixed(8);
                
                // Si la précision est bonne (< 10m), arrêter la surveillance
                if (accuracy < 10) {
                    navigator.geolocation.clearWatch(watchId);
                    editGetCurrentLocationBtn.innerHTML = '<i class="fas fa-check"></i> Position précise obtenue';
                    setTimeout(() => {
                        editGetCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                        editGetCurrentLocationBtn.disabled = false;
                    }, 2000);
                    showNotification(`Position précise obtenue (${Math.round(accuracy)}m)`, 'success');
                } else {
                    editGetCurrentLocationBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Amélioration précision (${Math.round(accuracy)}m)...`;
                }
            },
            function(error) {
                navigator.geolocation.clearWatch(watchId);
                console.error('Erreur de géolocalisation (édition):', error);
                editGetCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                editGetCurrentLocationBtn.disabled = false;
                
                let errorMessage = 'Impossible de récupérer votre position';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Position non disponible. Vérifiez votre connexion GPS/Internet.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Délai de géolocalisation dépassé. Réessayez.';
                        break;
                }
                
                showNotification(errorMessage, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            }
        );
        
        // Arrêter la surveillance après 20 secondes maximum
        setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (editGetCurrentLocationBtn.disabled) {
                editGetCurrentLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Utiliser ma position actuelle';
                editGetCurrentLocationBtn.disabled = false;
                showNotification('Position obtenue (précision limitée)', 'info');
            }
        }, 20000);
        
    } else {
        showNotification('La géolocalisation n\'est pas supportée par votre navigateur', 'error');
    }
}

function openEditMapPicker() {
    const url = 'https://www.google.com/maps';
    window.open(url, '_blank');
    showNotification('Ouvrez Google Maps et copiez les coordonnées dans les champs', 'info');
}

function refreshEditMiniMap() {
    const latElement = document.getElementById('editPropertyLat');
    const lngElement = document.getElementById('editPropertyLng');
    const nameElement = document.getElementById('editPropertyNameInput');
    
    if (!latElement || !lngElement || !nameElement) {
        console.warn('Éléments de formulaire d\'édition non trouvés');
        return;
    }
    
    const lat = latElement.value;
    const lng = lngElement.value;
    const name = nameElement.value;
    
    if (lat && lng) {
        initEditMiniMap(lat, lng, name);
    }
}

function initEditMiniMap(lat, lng, propertyName) {
    if (!editMiniMapContainer) {
        console.warn('Container de carte d\'édition non trouvé');
        return;
    }
    
    // Vérifier que Google Maps est chargé
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps API non chargée - Affichage des coordonnées uniquement');
        // Afficher les coordonnées au lieu de la carte
        editMiniMapContainer.innerHTML = `
            <div style="padding: 20px; text-align: center; background: #f5f5f5; border-radius: 8px;">
                <h4>Coordonnées de la propriété</h4>
                <p><strong>Latitude:</strong> ${lat}</p>
                <p><strong>Longitude:</strong> ${lng}</p>
                <button onclick="openGoogleMaps(${lat}, ${lng}, '${propertyName}')" class="btn btn-primary">
                    <i class="fas fa-map-marker-alt"></i> Voir sur Google Maps
                </button>
            </div>
        `;
        return;
    }
    
    try {
        // Nettoyer la carte existante
        if (editMiniMap) {
            editMiniMap = null;
        }
        
        if (editPropertyMarker) {
            editPropertyMarker.setMap(null);
            editPropertyMarker = null;
        }
        
        // Créer une nouvelle carte
        editMiniMap = new google.maps.Map(editMiniMapContainer, {
            center: { lat: parseFloat(lat), lng: parseFloat(lng) },
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
        });
        
        // Ajouter le marqueur
        editPropertyMarker = new google.maps.Marker({
            position: { lat: parseFloat(lat), lng: parseFloat(lng) },
            map: editMiniMap,
            title: propertyName,
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la carte d\'édition:', error);
    }
}

// Fonction pour générer un lien de paiement externe
function generatePaymentLink(propertyId) {
    console.log('🔗 [DEBUG] generatePaymentLink appelé avec propertyId:', propertyId);
    console.log('🔗 [DEBUG] properties disponibles:', window.properties);
    
    const property = window.properties.find(p => p.id === propertyId);
    if (!property) {
        console.error('❌ [DEBUG] Propriété non trouvée:', propertyId);
        console.error('❌ [DEBUG] Propriétés disponibles:', window.properties.map(p => ({ id: p.id, name: p.name })));
        return;
    }
    
    console.log('✅ [DEBUG] Propriété trouvée:', property);

    // Générer l'URL du lien de paiement
    const baseUrl = window.location.origin;
    const paymentUrl = `${baseUrl}/paiements/paiement-externe/${propertyId}`;
    
    // Créer un modal pour afficher le lien
    const modal = document.createElement('div');
    modal.className = 'modal payment-link-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-link"></i> Lien de paiement externe</h3>
                <button class="close-modal" onclick="closePaymentLinkModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="property-info">
                    <h4>${property.name}</h4>
                    <p><i class="fas fa-euro-sign"></i> Loyer mensuel: FCFA ${property.rent}</p>
                    <p><i class="fas fa-user"></i> Locataire: ${property.tenant || 'Non défini'}</p>
                </div>
                
                <div class="link-section">
                    <label for="paymentLinkInput">Lien de paiement :</label>
                    <div class="link-input-container">
                        <input type="text" id="paymentLinkInput" value="${paymentUrl}" readonly>
                        <button class="btn-copy" onclick="copyPaymentLink()" title="Copier le lien">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div class="link-info">
                    <div class="info-item">
                        <i class="fas fa-info-circle"></i>
                        <span>Ce lien permet à votre locataire de payer sans s'identifier</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>Le paiement est sécurisé et enregistré automatiquement</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-mobile-alt"></i>
                        <span>Compatible avec tous les appareils (mobile, tablette, ordinateur)</span>
                    </div>
                </div>
                
                <div class="share-options">
                    <h4>Partager le lien :</h4>
                    <div class="share-buttons">
                        <button class="btn-share" onclick="shareViaEmail('${paymentUrl}', '${property.name}')">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                        <button class="btn-share" onclick="shareViaSMS('${paymentUrl}', '${property.name}')">
                            <i class="fas fa-sms"></i> SMS
                        </button>
                        <button class="btn-share" onclick="shareViaWhatsApp('${paymentUrl}', '${property.name}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('🔗 [DEBUG] Modal créé, ajout au DOM...');
    document.body.appendChild(modal);
    
    // Ajouter la classe show pour afficher le modal
    setTimeout(() => {
        modal.classList.add('show');
        console.log('🔗 [DEBUG] Modal affiché avec classe show');
    }, 10);
    
    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePaymentLinkModal();
        }
    });
    
    // Focus sur l'input pour faciliter la sélection
    setTimeout(() => {
        const input = document.getElementById('paymentLinkInput');
        if (input) {
            input.select();
            console.log('🔗 [DEBUG] Input sélectionné');
        } else {
            console.error('❌ [DEBUG] Input non trouvé');
        }
    }, 100);
}

// Fonction pour fermer le modal de lien de paiement
function closePaymentLinkModal() {
    const modal = document.querySelector('.payment-link-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300); // Attendre la fin de l'animation
    }
}

// Fonction pour copier le lien de paiement
function copyPaymentLink() {
    const input = document.getElementById('paymentLinkInput');
    input.select();
    input.setSelectionRange(0, 99999); // Pour mobile
    
    try {
        document.execCommand('copy');
        
        // Afficher une notification de succès
        const copyBtn = document.querySelector('.btn-copy');
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.color = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.style.color = '';
        }, 2000);
        
        // Notification toast
        showNotification('Lien copié dans le presse-papiers !', 'success');
        
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        showNotification('Erreur lors de la copie du lien', 'error');
    }
}

// Fonctions de partage
function shareViaEmail(url, propertyName) {
    const subject = `Lien de paiement - ${propertyName}`;
    const body = `Bonjour,\n\nVoici le lien pour effectuer le paiement de votre loyer pour ${propertyName} :\n\n${url}\n\nCordialement`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
}

function shareViaSMS(url, propertyName) {
    const message = `Lien de paiement pour ${propertyName} : ${url}`;
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
}

function shareViaWhatsApp(url, propertyName) {
    const message = `Lien de paiement pour ${propertyName} : ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Fonction de notification (si elle n'existe pas déjà)
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Afficher avec animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Fonction de test temporaire pour vérifier le modal
function testPaymentLinkModal() {
    console.log('🧪 [TEST] Test du modal de lien de paiement');
    console.log('🧪 [TEST] window.properties:', window.properties);
    
    if (window.properties && window.properties.length > 0) {
        const firstProperty = window.properties[0];
        console.log('🧪 [TEST] Test avec la première propriété:', firstProperty);
        generatePaymentLink(firstProperty.id);
    } else {
        console.error('🧪 [TEST] Aucune propriété disponible pour le test');
    }
}

// Exposer la fonction de test globalement pour les tests
window.testPaymentLinkModal = testPaymentLinkModal;
