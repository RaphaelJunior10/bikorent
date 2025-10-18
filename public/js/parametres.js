// ========================================
// BikoRent - Paramètres du Compte
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

// Données utilisateur (chargées depuis le contrôleur)
let userData = {};

// Initialiser les données depuis le contrôleur
function initializeParametresData() {
    if (window.parametresData) {
        userData = window.parametresData;
        console.log('📊 Données des paramètres chargées:', userData);
        console.log('🖼️ Photo de profil dans les données:', userData.profile?.photo);
        
        // S'assurer que les notifications existent et ont des valeurs par défaut
        if (!userData.notifications) {
            userData.notifications = {
                emailPayments: false,
                emailOverdue: false,
                emailNewTenants: false,
                pushAlerts: false,
                pushReminders: false,
                reportFrequency: "monthly"
            };
            console.log('🔔 Notifications initialisées avec des valeurs par défaut');
        }
    } else {
        console.error('❌ Données des paramètres non disponibles');
    }
}

// Variables globales
let currentSection = 'profile';

// Éléments DOM
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebarBtn = document.getElementById('closeSidebar');
const settingsNavBtns = document.querySelectorAll('.settings-nav-btn');
const settingsSections = document.querySelectorAll('.settings-section');
const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const preferencesForm = document.getElementById('preferencesForm');
const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
const photoInput = document.getElementById('photoInput');
const profilePhoto = document.getElementById('profilePhoto');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const logoutAllBtn = document.getElementById('logoutAllBtn');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeParametresData(); // Charger les données du contrôleur
    setupEventListeners();
    loadUserData();
    initializePasswordStrength();
    initSidebar(); // Initialiser le sidebar
    markActivePage(); // Marquer la page active
    
    // Vérifier l'URL pour ouvrir automatiquement l'onglet facturation
    checkUrlHash();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Navigation des paramètres
    settingsNavBtns.forEach(btn => {
        btn.addEventListener('click', handleSectionChange);
    });

    // Formulaires
    profileForm.addEventListener('submit', handleProfileSubmit);
    passwordForm.addEventListener('submit', handlePasswordSubmit);
    preferencesForm.addEventListener('submit', handlePreferencesSubmit);

    // Upload de photo
    uploadPhotoBtn.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoUpload);

    // Force du mot de passe
    newPassword.addEventListener('input', updatePasswordStrength);
    confirmPassword.addEventListener('input', validatePasswordMatch);

    // Switches et options
    setupSwitches();
    setupSelects();

    // Boutons d'action
    logoutAllBtn.addEventListener('click', handleLogoutAll);
}

// Gestion du changement de section
function handleSectionChange(e) {
    const section = e.currentTarget.dataset.section;
    currentSection = section;
    
    // Mettre à jour la navigation
    settingsNavBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Mettre à jour le contenu
    settingsSections.forEach(section => section.classList.remove('active'));
    document.getElementById(section).classList.add('active');
}

// Fonction pour ouvrir une section spécifique
function openSection(sectionId) {
    const sectionBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (sectionBtn) {
        sectionBtn.click();
    }
}

// Vérifier l'URL pour ouvrir automatiquement l'onglet facturation
function checkUrlHash() {
    const hash = window.location.hash;
    if (hash === '#billing') {
        // Attendre un peu que la page soit complètement chargée
        setTimeout(() => {
            openSection('billing');
        }, 100);
    }
}

// Chargement des données utilisateur
function loadUserData() {
    // Remplir le formulaire de profil
    
    document.getElementById('firstName').value = userData.profile.firstName;
    document.getElementById('lastName').value =  userData.profile.lastName;
    document.getElementById('email').value = userData.profile.email;
    document.getElementById('phone').value = userData.profile.phone;
    document.getElementById('profession').value = userData.profile.profession;
    document.getElementById('workplace').value = userData.profile.workplace;
    document.getElementById('address').value = userData.profile.address;
    document.getElementById('bio').value = userData.profile.bio;
    
    // Charger la photo de profil si elle existe
    if (userData.profile.photo) {
        console.log('🖼️ Chargement de la photo de profil:', userData.profile.photo);
        // Ajouter un paramètre de cache-busting pour forcer le rechargement
        const photoUrl = userData.profile.photo + '?t=' + Date.now();
        profilePhoto.src = photoUrl;
        console.log('🖼️ Image src mise à jour vers:', profilePhoto.src);
    } else {
        console.log('⚠️ Aucune photo de profil trouvée');
        // Garder l'image par défaut
    }

    // Configurer les switches
    document.getElementById('twoFactorAuth').checked = userData.security.twoFactorAuth;
    document.getElementById('suspiciousLogin').checked = userData.security.suspiciousLogin;
    
    // Logs pour vérifier les valeurs des notifications
    console.log('🔔 Valeurs des notifications chargées:', userData.notifications);
    
    // S'assurer que les valeurs sont bien des booléens et à false par défaut
    const emailPayments = Boolean(userData.notifications?.emailPayments);
    const emailOverdue = Boolean(userData.notifications?.emailOverdue);
    const emailNewTenants = Boolean(userData.notifications?.emailNewTenants);
    const pushAlerts = Boolean(userData.notifications?.pushAlerts);
    const pushReminders = Boolean(userData.notifications?.pushReminders);
    
    console.log('🔔 Valeurs des notifications après conversion:', {
        emailPayments,
        emailOverdue,
        emailNewTenants,
        pushAlerts,
        pushReminders
    });
    
    document.getElementById('emailPayments').checked = emailPayments;
    document.getElementById('emailOverdue').checked = emailOverdue;
    document.getElementById('emailNewTenants').checked = emailNewTenants;
    document.getElementById('pushAlerts').checked = pushAlerts;
    document.getElementById('pushReminders').checked = pushReminders;
    document.getElementById('darkMode').checked = userData.preferences.darkMode;

    // Configurer les selects
    document.getElementById('reportFrequency').value = userData.notifications.reportFrequency;
    document.getElementById('language').value = userData.preferences.language;
    document.getElementById('timezone').value = userData.preferences.timezone;
    document.getElementById('dateFormat').value = userData.preferences.dateFormat;
    document.getElementById('currency').value = userData.preferences.currency;

    // Charger les données de facturation
    loadBillingData();
    
    // Charger les plans de facturation
    loadBillingPlans();
    
    // Charger les méthodes de paiement
    loadPaymentMethods();
    
    // Charger l'historique de facturation
    loadBillingHistory();
    
    // Charger les intégrations
    loadIntegrationsData();
    
    // Charger l'état des intégrations depuis le backend
    loadIntegrationsFromBackend();
}

// Configuration des switches
function setupSwitches() {
    const switches = document.querySelectorAll('input[type="checkbox"]');
    switches.forEach(switchInput => {
        switchInput.addEventListener('change', handleSwitchChange);
    });
}

// Configuration des selects
function setupSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', handleSelectChange);
    });
}

// Gestion des changements de switches
function handleSwitchChange(e) {
    const id = e.target.id;
    const value = e.target.checked;

    if(id == 'isDefaultPaymentMethod'){
        return;
    }
    
    console.log('🔄 Switch modifié:', id, '=', value);
    
    // Mettre à jour les données utilisateur
    if (id === 'twoFactorAuth' || id === 'suspiciousLogin') {
        userData.security[id] = value;
        // Sauvegarder les changements de sécurité
        saveUserData();
        showNotification('Paramètre de sécurité mis à jour', 'success');
    } else if (id === 'darkMode') {
        userData.preferences[id] = value;
        applyDarkMode(value);
        // Ne pas sauvegarder automatiquement, attendre le bouton "Enregistrer"
    } else {
        // C'est une notification, faire un appel API
        console.log('🔔 Switch de notification modifié:', id, '=', value);
        userData.notifications[id] = value;
        updateNotifications(id);
    }
}

// Gestion des changements de selects
function handleSelectChange(e) {
    const id = e.target.id;
    const value = e.target.value;
    
    // Ignorer le select des méthodes de paiement (géré séparément)
    if (id === 'paymentMethodType') {
        return;
    }
    
    // Mettre à jour les données utilisateur
    if (id === 'language' || id === 'timezone' || id === 'dateFormat' || id === 'currency') {
        userData.preferences[id] = value;
        // Ne pas sauvegarder automatiquement, attendre le bouton "Enregistrer"
    } else {
        // C'est une notification, faire un appel API
        userData.notifications[id] = value;
        updateNotifications(id);
    }
}

// Gestion du formulaire de profil
function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(profileForm);
    const updatedProfile = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        profession: formData.get('profession'),
        workplace: formData.get('workplace'),
        address: formData.get('address'),
        bio: formData.get('bio')
    };
    
    // Afficher le modal de confirmation
    showConfirmationModal({
        title: 'Confirmer la sauvegarde',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-save" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir sauvegarder vos modifications ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Vos informations de profil seront mises à jour.</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            saveProfileData(updatedProfile);
        }
    });
}

// Fonction pour sauvegarder les données du profil avec loader
function saveProfileData(updatedProfile) {
    const saveButton = profileForm.querySelector('button[type="submit"]');
    const originalText = saveButton.innerHTML;
    
    // Activer l'état de chargement
    saveButton.disabled = true;
    saveButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> Sauvegarde en cours...
    `;
    
    // Faire l'appel API pour sauvegarder
    fetch('/parametres/profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile)
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
        if (data.success) {
            // Mettre à jour les données locales
            userData.profile = { ...userData.profile, ...data.data.profile };
            
            // Sauvegarder en localStorage
            saveUserData();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Profil mis à jour avec succès', 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la sauvegarde', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la sauvegarde:', error);
        
        // Restaurer le bouton
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Gestion du formulaire de mot de passe
function handlePasswordSubmit(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPasswordValue = newPassword.value;
    const confirmPasswordValue = confirmPassword.value;
    
    // Validation
    if (newPasswordValue !== confirmPasswordValue) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return;
    }
    
    if (newPasswordValue.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
    }
    
    // Vérifier le mot de passe actuel avant de continuer
    verifyCurrentPassword(currentPassword);
}

// Fonction pour vérifier le mot de passe actuel
async function verifyCurrentPassword(currentPassword) {
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    
    // Afficher le loader sur le bouton
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';
    submitBtn.disabled = true;
    
    try {
        // Faire une tentative de connexion avec le mot de passe actuel
        const response = await fetch('/auth/verify-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: currentPassword
            })
        });
        
        const data = await response.json();
        
        // Restaurer le bouton
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        if (data.success) {
            // Mot de passe correct, afficher la modal de confirmation
            showPasswordConfirmationModal();
        } else {
            // Mot de passe incorrect
            showNotification(data.message || 'Mot de passe actuel incorrect', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du mot de passe:', error);
        
        // Restaurer le bouton
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    }
}

// Gestion de l'upload de photo
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Veuillez sélectionner une image', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
        showNotification('L\'image est trop volumineuse (max 5MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        
        // Afficher immédiatement l'image pour l'UX
        profilePhoto.src = base64Image;
        
        // Uploader vers le serveur
        uploadProfilePhoto(base64Image);
    };
    reader.readAsDataURL(file);
}

// Fonction pour uploader la photo de profil vers le serveur
function uploadProfilePhoto(base64Image) {
    // Afficher un indicateur de chargement sur le bouton
    const uploadBtn = document.getElementById('uploadPhotoBtn');
    const originalContent = uploadBtn.innerHTML;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    uploadBtn.disabled = true;
    
    // Afficher un loader visible sur la zone de photo
    const photoSection = document.querySelector('.profile-photo-large');
    const loader = document.createElement('div');
    loader.id = 'photoUploadLoader';
    loader.className = 'photo-upload-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Upload en cours...</span>
        </div>
    `;
    photoSection.appendChild(loader);
    
    // Faire l'appel API
    fetch('/parametres/profile/photo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photo: base64Image })
    })
    .then(response => response.json())
    .then(data => {
        // Supprimer le loader de la zone de photo
        const loader = document.getElementById('photoUploadLoader');
        if (loader) {
            loader.remove();
        }
        
        // Restaurer le bouton
        uploadBtn.innerHTML = originalContent;
        uploadBtn.disabled = false;
        
        if (data.success) {
            console.log('✅ Photo uploadée avec succès:', data.data.photoUrl);
            
            // Mettre à jour les données locales
            userData.profile.photo = data.data.photoUrl;
            saveUserData();
            
            // S'assurer que l'image est bien affichée avec cache-busting
            const photoUrl = data.data.photoUrl + '?t=' + Date.now();
            profilePhoto.src = photoUrl;
            console.log('🖼️ Image src mise à jour après upload vers:', profilePhoto.src);
            
            // Forcer le rechargement de l'image
            profilePhoto.onload = function() {
                console.log('✅ Image rechargée avec succès');
            };
            profilePhoto.onerror = function() {
                console.error('❌ Erreur lors du rechargement de l\'image');
            };
            
            // Afficher la notification de succès
            showNotification(data.message || 'Photo de profil mise à jour', 'success');
        } else {
            // Supprimer le loader en cas d'erreur
            const loader = document.getElementById('photoUploadLoader');
            if (loader) {
                loader.remove();
            }
            
            // Restaurer l'ancienne image en cas d'erreur
            profilePhoto.src = userData.profile.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiMyNTYzZWIiLz48dGV4dCB4PSI2MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5BPC90ZXh0Pjwvc3ZnPg==';
            
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la mise à jour de la photo', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de l\'upload de la photo:', error);
        
        // Supprimer le loader en cas d'erreur
        const loader = document.getElementById('photoUploadLoader');
        if (loader) {
            loader.remove();
        }
        
        // Restaurer le bouton
        uploadBtn.innerHTML = originalContent;
        uploadBtn.disabled = false;
        
        // Restaurer l'ancienne image
        profilePhoto.src = userData.profile.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iNjAiIGZpbGw9IiMyNTYzZWIiLz48dGV4dCB4PSI2MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5BPC90ZXh0Pjwvc3ZnPg==';
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Initialisation de la force du mot de passe
function initializePasswordStrength() {
    strengthFill.style.width = '0%';
    strengthText.textContent = 'Force du mot de passe';
}

// Mise à jour de la force du mot de passe
function updatePasswordStrength() {
    const password = newPassword.value;
    let strength = 0;
    let strengthLabel = '';
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    strengthFill.style.width = strength + '%';
    
    if (strength <= 25) {
        strengthLabel = 'Faible';
        strengthFill.style.backgroundColor = '#ef4444';
    } else if (strength <= 50) {
        strengthLabel = 'Moyenne';
        strengthFill.style.backgroundColor = '#f59e0b';
    } else if (strength <= 75) {
        strengthLabel = 'Bonne';
        strengthFill.style.backgroundColor = '#10b981';
    } else {
        strengthLabel = 'Excellente';
        strengthFill.style.backgroundColor = '#059669';
    }
    
    strengthText.textContent = strengthLabel;
}

// Validation de la correspondance des mots de passe
function validatePasswordMatch() {
    const password = newPassword.value;
    const confirm = confirmPassword.value;
    
    if (confirm && password !== confirm) {
        confirmPassword.setCustomValidity('Les mots de passe ne correspondent pas');
    } else {
        confirmPassword.setCustomValidity('');
    }
}

// Gestion de la déconnexion de tous les appareils
function handleLogoutAll() {
    showLogoutConfirmationModal();
}

// Application du mode sombre
function applyDarkMode(enabled) {
    if (enabled) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Chargement des données de facturation
function loadBillingData() {
    if (!userData.billing) return;
    
    // Mettre à jour les informations du plan
    const planCard = document.querySelector('.plan-card .plan-info h4');
    if (planCard) {
        planCard.textContent = userData.billing.plan;
    }
    
    const planPrice = document.querySelector('.plan-card .plan-info p');
    if (planPrice) {
        const price = userData.billing.propertiesCount > 0 ? 
            userData.billing.price : 0;
        planPrice.textContent = `${formatCurrency(price, userData.billing.currency)}/mois`;
    }
    
    // Mettre à jour l'historique de facturation
    const billingTable = document.querySelector('.billing-table tbody');
    if (billingTable && userData.billing.billingHistory) {
        billingTable.innerHTML = userData.billing.billingHistory.map(bill => `
            <tr>
                <td>${bill.date}</td>
                <td>${bill.description}</td>
                <td>${formatCurrency(bill.amount, userData.billing.currency)}</td>
                <td><span class="status-${bill.status}">${bill.status === 'paid' ? 'Payé' : 'En attente'}</span></td>
            </tr>
        `).join('');
    }
}

// Chargement des plans de facturation
function loadBillingPlans() {
    console.log('💳 Chargement des plans de facturation...');
    
    fetch('/parametres/billing/plans')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.plans) {
                console.log('✅ Plans de facturation chargés:', data.data.plans);
                window.billingPlans = data.data.plans;
                renderBillingPlans(data.data.plans);
            } else {
                console.log('⚠️ Aucun plan de facturation trouvé');
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement des plans de facturation:', error);
        });
}

// Affichage des plans de facturation
function renderBillingPlans(plans) {
    const plansContainer = document.querySelector('.billing-plans-container');
    if (!plansContainer) return;
    
    const currentPlanId = userData.billing?.planId || 'basique';
    
    plansContainer.innerHTML = plans.map(plan => {
        const isCurrentPlan = plan.id === currentPlanId;
        const maxPropertiesText = plan.maxProperties === -1 ? 'Illimité' : plan.maxProperties;
        
        return `
            <div class="billing-plan-card ${isCurrentPlan ? 'current-plan' : ''}">
                <div class="plan-header">
                    <h3>${plan.name}</h3>
                    <div class="plan-price">
                        <span class="price">${plan.pricePerProperty} ${plan.currency}</span>
                        <span class="period">/propriété/mois</span>
                    </div>
                </div>
                <div class="plan-description">
                    <p>${plan.description}</p>
                </div>
                <div class="plan-features">
                    <ul>
                        <li><i class="fas fa-check"></i> Jusqu'à ${maxPropertiesText} propriétés</li>
                        ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                    </ul>
                </div>
                <div class="plan-actions">
                    ${isCurrentPlan ? 
                        '<button class="btn-secondary" disabled><i class="fas fa-check"></i> Plan actuel</button>' :
                        `<button class="btn-primary" onclick="changeBillingPlan('${plan.id}')">
                            <i class="fas fa-arrow-right"></i> Changer de plan
                        </button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Fonction pour changer de plan de facturation
function changeBillingPlan(planId) {
    const plan = window.billingPlans?.find(p => p.id === planId);
    if (!plan) {
        showNotification('Plan de facturation non trouvé', 'error');
        return;
    }
    window.billingPlanId = planId;
    // Afficher la modal de confirmation
    showConfirmationModal({
        title: 'Changer de plan de facturation',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-credit-card" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir changer vers le <strong>${plan.name}</strong> ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Prix: ${plan.pricePerProperty} ${plan.currency}/propriété/mois</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Propriétés max: ${plan.maxProperties === -1 ? 'Illimité' : plan.maxProperties}</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            executeBillingPlanChange(window.billingPlanId);
        }
    });
}

// Exécution du changement de plan
function executeBillingPlanChange(planId) {
    const button = document.querySelector(`button[onclick="changeBillingPlan('${planId}')"]`);
    const originalContent = button.innerHTML;
    
    // Afficher le loader
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changement en cours...';
    button.disabled = true;
    
    // Faire l'appel API
    fetch('/parametres/billing/change-plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId })
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        if (data.success) {
            // Mettre à jour les données locales
            userData.billing = {
                ...userData.billing,
                plan: data.data.plan.name,
                planId: data.data.plan.id,
                price: data.data.plan.pricePerProperty,
                currency: data.data.plan.currency
            };
            
            // Recharger l'affichage
            loadBillingData();
            renderBillingPlans(window.billingPlans);
            
            // Sauvegarder les données
            saveUserData();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Plan de facturation changé avec succès', 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors du changement de plan', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors du changement de plan:', error);
        
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Chargement des données d'intégrations
function loadIntegrationsData() {
    if (!userData.integrations) return;
    
    const integrationsSection = document.querySelector('.integrations-section');
    if (integrationsSection) {
        integrationsSection.innerHTML = userData.integrations.map(integration => `
            <div class="integration-item">
                <div class="integration-info">
                    <img style="font-size: 30px;" src="https://via.placeholder.com/40x40/${integration.color.replace('#', '')}/ffffff?text=${integration.icon}" alt="${integration.icon}">
                    <div>
                        <h4>${integration.name}</h4>
                        <p>${integration.description}</p>
                    </div>
                </div>
                <div class="integration-status">
                    <span class="status-${integration.connected ? 'connected' : 'disconnected'}">
                        ${integration.connected ? 'Connecté' : 'Non connecté'}
                    </span>
                    <button class="btn-${integration.connected ? 'secondary' : 'primary'}"
                            onclick="toggleIntegration('${integration.id}')">
                        ${integration.connected ? 'Déconnecter' : 'Connecter'}
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Fonction pour charger l'état des intégrations depuis le backend
function loadIntegrationsFromBackend() {
    console.log('🔗 Chargement de l\'état des intégrations depuis le backend...');
    
    fetch('/parametres/integrations')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.integration) {
                console.log('✅ État des intégrations chargé depuis le backend:', data.data.integration);
                
                // Mettre à jour les données locales
                userData.integration = data.data.integration;
                
                // Synchroniser l'état des intégrations avec les données du backend
                if (userData.integrations) {
                    userData.integrations.forEach(integration => {
                        const backendState = userData.integration[integration.id];
                        if (backendState) {
                            integration.connected = backendState.connected;
                        }
                    });
                    
                    // Recharger l'affichage avec les données synchronisées
                    loadIntegrationsData();
                }
            } else {
                console.log('⚠️ Aucun état d\'intégration trouvé dans le backend');
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement de l\'état des intégrations:', error);
            // En cas d'erreur, on continue avec les données par défaut
        });
}

// Fonction pour basculer l'état d'une intégration
function toggleIntegration(integrationId) {
    const integration = userData.integrations.find(i => i.id === integrationId);
    if (!integration) {
        console.error('❌ Intégration non trouvée:', integrationId);
        showNotification('Intégration non trouvée', 'error');
        return;
    }
    
    const newState = !integration.connected;
    const action = newState ? 'connect' : 'disconnect';
    
    console.log('🔗 Basculement de l\'intégration:', {
        integrationId,
        currentState: integration.connected,
        newState,
        action
    });

    //On recupere le plan de facturation
    const plan = userData.billing.plan;
    console.log('Plan de facturation:', plan);
    
    if(!plan.includes('Enterprise')){
    //Cette fonctionnalite sera traitee plus tard.
        showNotification('Intégration non disponnible pour votre plan de facturation');

        return;
    }
    
    // Afficher un loader sur le bouton
    const button = document.querySelector(`button[onclick="toggleIntegration('${integrationId}')"]`);
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;

    
    
    // Faire l'appel API vers le backend
    fetch(`/parametres/integrations/${integrationId}/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        if (data.success) {
            // Mettre à jour l'état local
            integration.connected = newState;
            
            // Mettre à jour les données d'intégration dans userData si elles existent
            if (!userData.integration) {
                userData.integration = {};
            }
            userData.integration[integrationId] = data.data;
            
            // Recharger l'affichage
            loadIntegrationsData();
            
            // Sauvegarder les données
            saveUserData();
            
            // Afficher la notification de succès
            showNotification(data.message || `${integration.name} ${newState ? 'connecté' : 'déconnecté'} avec succès`, 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la mise à jour de l\'intégration', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors de la mise à jour de l\'intégration:', error);
        
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Sauvegarde des données utilisateur
function saveUserData() {
    // Simuler la sauvegarde en localStorage
    localStorage.setItem('bikorent_user_data', JSON.stringify(userData));
}

// Affichage des notifications
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Afficher avec animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Obtenir l'icône de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Fonction pour afficher un modal de confirmation personnalisé
function showConfirmationModal(options) {
    // Créer le modal s'il n'existe pas
    let confirmationModal = document.getElementById('confirmationModal');
    if (!confirmationModal) {
        confirmationModal = document.createElement('div');
        confirmationModal.id = 'confirmationModal';
        confirmationModal.className = 'modal';
        confirmationModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="confirmationTitle">Confirmation</h3>
                    <button class="close-modal" id="closeConfirmationModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="confirmationContent"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelConfirmation">Annuler</button>
                    <button type="button" class="btn-primary" id="confirmConfirmation">Confirmer</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmationModal);
        
        // Ajouter les événements
        document.getElementById('closeConfirmationModal').addEventListener('click', closeConfirmationModal);
        document.getElementById('cancelConfirmation').addEventListener('click', closeConfirmationModal);
        document.getElementById('confirmConfirmation').addEventListener('click', () => {
            if (options.onConfirm) options.onConfirm();
        });
        
        // Fermer en cliquant à l'extérieur
        confirmationModal.addEventListener('click', (e) => {
            if (e.target === confirmationModal) {
                closeConfirmationModal();
            }
        });
    }
    
    // Mettre à jour le contenu
    document.getElementById('confirmationTitle').textContent = options.title || 'Confirmation';
    document.getElementById('confirmationContent').innerHTML = options.content || '';
    
    // Afficher le modal
    confirmationModal.classList.add('show');
}

// Fonction pour fermer le modal de confirmation
function closeConfirmationModal() {
    const confirmationModal = document.getElementById('confirmationModal');
    if (confirmationModal) {
        confirmationModal.classList.remove('show');
    }
}

// Fonction pour afficher la modal de confirmation du mot de passe
function showPasswordConfirmationModal() {
    showConfirmationModal({
        title: 'Confirmer le changement de mot de passe',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-lock" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir changer votre mot de passe ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Cette action modifiera votre mot de passe de connexion.</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            updatePassword();
        }
    });
}

// Fonction pour mettre à jour le mot de passe
async function updatePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPasswordValue = newPassword.value;
    const confirmPasswordValue = confirmPassword.value;
    
    // Récupérer le bouton de soumission
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    
    // Afficher le loader sur le bouton
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mise à jour...';
    submitBtn.disabled = true;

    

    // Faire l'appel API vers le backend
    fetch('/parametres/password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPasswordValue,
            confirmPassword: confirmPasswordValue
        })
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        if (data.success) {
            showNotification(data.message || 'Mot de passe mis à jour avec succès', 'success');
            passwordForm.reset();
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Force du mot de passe';
        } else {
            showNotification(data.message || 'Erreur lors de la mise à jour du mot de passe', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        
        // Restaurer le bouton
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Gestion du formulaire de préférences
function handlePreferencesSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(preferencesForm);
    const updatedPreferences = {
        language: document.getElementById('language').value,
        timezone: document.getElementById('timezone').value,
        darkMode: document.getElementById('darkMode').checked,
        dateFormat: document.getElementById('dateFormat').value,
        currency: document.getElementById('currency').value
    };
    
    // Afficher le modal de confirmation
    showConfirmationModal({
        title: 'Confirmer la sauvegarde',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-sliders-h" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir sauvegarder vos préférences ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Vos préférences d'interface seront mises à jour.</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            savePreferencesData(updatedPreferences);
        }
    });
}

// Fonction pour sauvegarder les données de préférences avec loader
function savePreferencesData(updatedPreferences) {
    const saveButton = preferencesForm.querySelector('button[type="submit"]');
    const originalText = saveButton.innerHTML;
    
    // Activer l'état de chargement
    saveButton.disabled = true;
    saveButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i> Sauvegarde en cours...
    `;
    
    // Faire l'appel API pour sauvegarder
    fetch('/parametres/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPreferences)
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
        if (data.success) {
            // Mettre à jour les données locales
            userData.preferences = { ...userData.preferences, ...data.data.preferences };
            
            // Sauvegarder en localStorage
            saveUserData();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Préférences mises à jour avec succès', 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la sauvegarde', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la sauvegarde des préférences:', error);
        
        // Restaurer le bouton
        saveButton.disabled = false;
        saveButton.innerHTML = originalText;
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Fonction pour afficher la modal de confirmation de déconnexion
function showLogoutConfirmationModal() {
    showConfirmationModal({
        title: 'Confirmer la déconnexion',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-sign-out-alt" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir déconnecter tous les appareils ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">Cette action fermera toutes les sessions actives sur tous les appareils.</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            logoutAllDevices();
        }
    });
}

// Fonction pour déconnecter tous les appareils
function logoutAllDevices() {
    // Récupérer le bouton de déconnexion
    const logoutBtn = document.getElementById('logoutAllBtn');
    const originalContent = logoutBtn.innerHTML;
    
    // Afficher le loader sur le bouton
    logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Déconnexion...';
    logoutBtn.disabled = true;
    console.log('Déconnexion de tous les appareils...');
    
    // Faire l'appel API vers le backend
    fetch('/parametres/logout-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        logoutBtn.innerHTML = originalContent;
        logoutBtn.disabled = false;
        
        if (data.success) {
            showNotification(data.message || 'Tous les appareils ont été déconnectés', 'success');
        } else {
            showNotification(data.message || 'Erreur lors de la déconnexion', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la déconnexion de tous les appareils:', error);
        
        // Restaurer le bouton
        logoutBtn.innerHTML = originalContent;
        logoutBtn.disabled = false;
        
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Fonction pour mettre à jour les notifications
function updateNotifications(notificationId) {
    console.log('🔔 Mise à jour des notifications pour:', notificationId);
    
    // Afficher le loader à côté de la checkbox
    showNotificationLoader(notificationId);
    
    // Faire l'appel API vers le backend
    fetch('/parametres/notifications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            notifications: userData.notifications
        })
    })
    .then(response => response.json())
    .then(data => {
        // Masquer le loader
        hideNotificationLoader(notificationId);
        
        if (data.success) {
            showNotification(data.message || 'Préférences de notifications mises à jour', 'success');
        } else {
            showNotification(data.message || 'Erreur lors de la mise à jour des notifications', 'error');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la mise à jour des notifications:', error);
        
        // Masquer le loader
        hideNotificationLoader(notificationId);
        
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Fonction pour afficher le loader à côté d'une checkbox
function showNotificationLoader(notificationId) {
    const checkbox = document.getElementById(notificationId);
    if (!checkbox) {
        console.error('❌ Checkbox non trouvée:', notificationId);
        return;
    }
    
    // Trouver le conteneur parent (option-action)
    const optionAction = checkbox.closest('.option-action');
    if (!optionAction) {
        console.error('❌ Conteneur .option-action non trouvé pour:', notificationId);
        return;
    }
    
    // Créer le loader s'il n'existe pas
    let loader = optionAction.querySelector('.notification-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'notification-loader';
        loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        optionAction.appendChild(loader);
        console.log('✅ Loader créé pour:', notificationId);
    }
    
    // Afficher le loader
    loader.style.display = 'inline-block';
    console.log('🔄 Loader affiché pour:', notificationId);
}

// Fonction pour masquer le loader à côté d'une checkbox
function hideNotificationLoader(notificationId) {
    const checkbox = document.getElementById(notificationId);
    if (!checkbox) return;
    
    // Trouver le conteneur parent (option-action)
    const optionAction = checkbox.closest('.option-action');
    if (!optionAction) return;
    
    // Masquer le loader
    const loader = optionAction.querySelector('.notification-loader');
    if (loader) {
        loader.style.display = 'none';
        console.log('✅ Loader masqué pour:', notificationId);
    }
}

// Fonctions utilitaires
function formatCurrency(amount, currency = 'XAF') {
    const formatters = {
        'EUR': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
        'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
        'XAF': new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 })
    };
    
    if (currency === 'XAF') {
        return `${formatters[currency].format(amount)} ${currency}`;
    }
    
    return formatters[currency] ? formatters[currency].format(amount) : `${amount} ${currency}`;
}

function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return 'N/A';
    
    let d;
    
    // Gérer différents formats de dates
    if (typeof date === 'string') {
        // Si c'est une chaîne, essayer de la convertir
        d = new Date(date);
    } else if (date && typeof date === 'object' && date.seconds !== undefined) {
        // Si c'est un Timestamp Firestore avec seconds
        d = new Date(date.seconds * 1000);
    } else if (date && typeof date === 'object' && date._seconds !== undefined) {
        // Si c'est un Timestamp Firestore avec _seconds
        d = new Date(date._seconds * 1000);
    } else if (date instanceof Date) {
        // Si c'est déjà un objet Date
        d = date;
    } else {
        // Essayer de convertir en Date
        d = new Date(date);
    }
    
    // Vérifier si la date est valide
    if (isNaN(d.getTime())) {
        console.warn('Date invalide:', date, 'Type:', typeof date);
        return 'Date invalide';
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch(format) {
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
            return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

// ========================================
// GESTION DES MÉTHODES DE PAIEMENT
// ========================================

// Variables globales pour les méthodes de paiement
let paymentMethodTypes = [];
let userPaymentMethods = [];

// Chargement des méthodes de paiement
function loadPaymentMethods() {
    console.log('💳 Chargement des méthodes de paiement...');
    
    // Charger les types de méthodes de paiement
    fetch('/parametres/payment-methods/types')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.types) {
                console.log('✅ Types de méthodes de paiement chargés:', data.data.types);
                paymentMethodTypes = data.data.types;
                populatePaymentMethodTypes();
            } else {
                console.log('⚠️ Aucun type de méthode de paiement trouvé');
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement des types de méthodes de paiement:', error);
        });
    
    // Charger les méthodes de paiement de l'utilisateur
    fetch('/parametres/payment-methods')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.paymentMethods) {
                console.log('✅ Méthodes de paiement chargées:', data.data.paymentMethods);
                userPaymentMethods = data.data.paymentMethods;
                renderPaymentMethods();
            } else {
                console.log('⚠️ Aucune méthode de paiement trouvée');
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement des méthodes de paiement:', error);
        });
}

// Remplir le select des types de méthodes de paiement
function populatePaymentMethodTypes() {
    const select = document.getElementById('paymentMethodType');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionner un type</option>';
    
    paymentMethodTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.id;
        option.textContent = type.name;
        select.appendChild(option);
    });
    
    // Cloner le select pour supprimer tous les gestionnaires d'événements existants
    const newSelect = select.cloneNode(true);
    select.parentNode.replaceChild(newSelect, select);
    
    // Ajouter notre gestionnaire d'événements spécifique
    newSelect.addEventListener('change', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🎯 Gestionnaire spécifique déclenché pour paymentMethodType');
        updatePaymentMethodFields();
    });
}

// Mettre à jour les champs selon le type sélectionné
function updatePaymentMethodFields() {
    console.log('🔄 Mise à jour des champs de méthode de paiement...');
    
    const typeSelect = document.getElementById('paymentMethodType');
    const fieldsContainer = document.getElementById('paymentMethodFields');
    
    if (!typeSelect || !fieldsContainer) {
        console.log('⚠️ Éléments non trouvés');
        return;
    }
    
    const selectedType = typeSelect.value;
    console.log('📋 Type sélectionné:', selectedType);
    
    const methodType = paymentMethodTypes.find(t => t.id === selectedType);
    
    if (!methodType) {
        console.log('⚠️ Type de méthode non trouvé, vidage des champs');
        fieldsContainer.innerHTML = '';
        return;
    }
    
    console.log('✅ Génération des champs pour:', methodType.name);
    
    // Générer les champs selon les paramètres du type
    fieldsContainer.innerHTML = methodType.parameters.map(param => `
        <div class="form-group">
            <label for="${param.name}">${param.label}${param.required ? ' *' : ''}</label>
            <input 
                type="${param.type}" 
                id="${param.name}" 
                name="${param.name}" 
                placeholder="${param.placeholder}"
                ${param.required ? 'required' : ''}
                ${param.validation?.pattern ? `pattern="${param.validation.pattern}"` : ''}
                ${param.validation?.minLength ? `minlength="${param.validation.minLength}"` : ''}
            >
            ${param.validation?.message ? `<small class="help-text">${param.validation.message}</small>` : ''}
        </div>
    `).join('');
    
    console.log('✅ Champs générés avec succès');
}

// Afficher le modal d'ajout de méthode de paiement
function showAddPaymentMethodModal() {
    const modal = document.getElementById('addPaymentMethodModal');
    if (modal) {
        modal.classList.add('show');
        // Réinitialiser le formulaire
        document.getElementById('addPaymentMethodForm').reset();
        document.getElementById('paymentMethodFields').innerHTML = '';
    }
}

// Fermer le modal d'ajout de méthode de paiement
function closeAddPaymentMethodModal() {
    const modal = document.getElementById('addPaymentMethodModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Ajouter une méthode de paiement
function addPaymentMethod() {
    const form = document.getElementById('addPaymentMethodForm');
    const formData = new FormData(form);
    
    const type = formData.get('type');
    const isDefault = formData.get('isDefault') === 'on';
    
    if (!type) {
        showNotification('Veuillez sélectionner un type de méthode de paiement', 'error');
        return;
    }
    
    // Récupérer les paramètres
    const parameters = {};
    const methodType = paymentMethodTypes.find(t => t.id === type);
    
    if (methodType) {
        methodType.parameters.forEach(param => {
            const value = formData.get(param.name);
            if (value) {
                parameters[param.name] = value;
            }
        });
    }
    
    // Valider les paramètres requis
    const missingParams = methodType.parameters.filter(param => 
        param.required && (!parameters[param.name] || parameters[param.name].trim() === '')
    );
    
    if (missingParams.length > 0) {
        showNotification(`Veuillez remplir tous les champs requis: ${missingParams.map(p => p.label).join(', ')}`, 'error');
        return;
    }
    
    // Afficher le loader
    const addButton = document.querySelector('#addPaymentMethodModal .btn-primary');
    const originalContent = addButton.innerHTML;
    addButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';
    addButton.disabled = true;
    
    // Faire l'appel API
    fetch('/parametres/payment-methods', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: type,
            parameters: parameters,
            isDefault: isDefault
        })
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        addButton.innerHTML = originalContent;
        addButton.disabled = false;
        
        if (data.success) {
            // Fermer le modal
            closeAddPaymentMethodModal();
            
            // Recharger les méthodes de paiement
            loadPaymentMethods();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Méthode de paiement ajoutée avec succès', 'success');
        } else {
            // Afficher les erreurs
            if (data.errors && data.errors.length > 0) {
                showNotification(data.errors.join(', '), 'error');
            } else {
                showNotification(data.message || 'Erreur lors de l\'ajout de la méthode de paiement', 'error');
            }
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors de l\'ajout de la méthode de paiement:', error);
        
        // Restaurer le bouton
        addButton.innerHTML = originalContent;
        addButton.disabled = false;
        
        // Afficher l'erreur
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Afficher les méthodes de paiement
function renderPaymentMethods() {
    const container = document.getElementById('paymentMethodsList');
    if (!container) return;
    
    if (userPaymentMethods.length === 0) {
        container.innerHTML = `
            <div class="no-payment-methods">
                <i class="fas fa-credit-card" style="font-size: 3rem; color: #64748b; margin-bottom: 1rem; display: block;"></i>
                <p style="text-align: center; color: #64748b;">Aucune méthode de paiement configurée</p>
                <p style="text-align: center; color: #64748b; font-size: 0.9rem;">Ajoutez une méthode de paiement pour faciliter vos transactions.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userPaymentMethods.map(method => {
        const methodType = paymentMethodTypes.find(t => t.id === method.type);
        const iconClass = methodType?.icon || 'fas fa-credit-card';
        const iconColor = methodType?.color || '#64748b';
        
        let displayText = '';
        if (method.maskedData) {
            if (method.type === 'visa') {
                displayText = `${method.maskedData.cardNumber} - Expire ${method.maskedData.expiryDate}`;
            } else if (method.type === 'airtel_money' || method.type === 'mobicash') {
                displayText = method.maskedData.phoneNumber;
            }
        }
        
        return `
            <div class="payment-method-card ${method.isDefault ? 'default' : ''}">
                <div class="payment-method-info">
                    <div class="payment-method-icon" style="background-color: ${iconColor};">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="payment-method-details">
                        <h4>${method.typeName}${method.isDefault ? '<span class="default-badge">Par défaut</span>' : ''}</h4>
                        <p>${displayText}</p>
                    </div>
                </div>
                <div class="payment-method-actions">
                    ${!method.isDefault ? 
                        `<button class="btn-secondary" onclick="setDefaultPaymentMethod('${method.id}')">
                            <i class="fas fa-star"></i> Définir par défaut
                        </button>` : ''
                    }
                    <button class="btn-danger" onclick="deletePaymentMethod('${method.id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Supprimer une méthode de paiement
function deletePaymentMethod(paymentMethodId) {
    const method = userPaymentMethods.find(m => m.id === paymentMethodId);
    if (!method) {
        showNotification('Méthode de paiement non trouvée', 'error');
        return;
    }
    
    // Afficher la modal de confirmation
    showConfirmationModal({
        title: 'Supprimer la méthode de paiement',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-trash" style="font-size: 3rem; color: #ef4444; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?</p>
                <p style="color: #6b7280; font-size: 0.9rem;">${method.typeName} - Cette action est irréversible.</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            executeDeletePaymentMethod(paymentMethodId);
        }
    });
}

// Exécuter la suppression de la méthode de paiement
function executeDeletePaymentMethod(paymentMethodId) {
    fetch(`/parametres/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Recharger les méthodes de paiement
            loadPaymentMethods();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Méthode de paiement supprimée avec succès', 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la suppression de la méthode de paiement', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors de la suppression de la méthode de paiement:', error);
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// Définir une méthode de paiement par défaut
function setDefaultPaymentMethod(paymentMethodId) {
    const method = userPaymentMethods.find(m => m.id === paymentMethodId);
    if (!method) {
        showNotification('Méthode de paiement non trouvée', 'error');
        return;
    }
    
    // Trouver le bouton et afficher le loader
    const button = document.querySelector(`button[onclick="setDefaultPaymentMethod('${paymentMethodId}')"]`);
    const originalContent = button.innerHTML;
    
    // Afficher le loader
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Définition...';
    button.disabled = true;
    
    fetch(`/parametres/payment-methods/${paymentMethodId}/set-default`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        if (data.success) {
            // Recharger les méthodes de paiement
            loadPaymentMethods();
            
            // Afficher la notification de succès
            showNotification(data.message || 'Méthode de paiement par défaut mise à jour', 'success');
        } else {
            // Afficher l'erreur
            showNotification(data.message || 'Erreur lors de la mise à jour de la méthode par défaut', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erreur lors de la mise à jour de la méthode par défaut:', error);
        
        // Restaurer le bouton
        button.innerHTML = originalContent;
        button.disabled = false;
        
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
    });
}

// ========================================
// GESTION DE L'HISTORIQUE DE FACTURATION
// ========================================

// Variables globales pour l'historique de facturation
let billingHistory = [];
let billingStats = {};

// Chargement de l'historique de facturation
function loadBillingHistory() {
    console.log('📊 Chargement de l\'historique de facturation...');
    
    // Charger l'historique
    fetch('/parametres/billing/history')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.history) {
                console.log('✅ Historique de facturation chargé:', data.data.history.length, 'entrées');
                billingHistory = data.data.history;
                renderBillingHistory();
            } else {
                console.log('⚠️ Aucun historique de facturation trouvé');
                renderBillingHistory();
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement de l\'historique de facturation:', error);
            renderBillingHistory();
        });
    
    // Charger les statistiques
    fetch('/parametres/billing/history/stats')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.stats) {
                console.log('✅ Statistiques de facturation chargées:', data.data.stats);
                billingStats = data.data.stats;
                renderBillingStats();
            } else {
                console.log('⚠️ Aucune statistique de facturation trouvée');
                renderBillingStats();
            }
        })
        .catch(error => {
            console.error('❌ Erreur lors du chargement des statistiques de facturation:', error);
            renderBillingStats();
        });
}

// Afficher les statistiques de facturation
function renderBillingStats() {
    const container = document.getElementById('billingStats');
    if (!container) return;
    
    if (!billingStats || Object.keys(billingStats).length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${billingStats.totalInvoices || 0}</div>
            <div class="stat-label">Factures</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${billingStats.paidInvoices || 0}</div>
            <div class="stat-label">Payées</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${billingStats.pendingInvoices || 0}</div>
            <div class="stat-label">En attente</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${formatCurrency(billingStats.totalPaid || 0, 'XAF')}</div>
            <div class="stat-label">Total payé</div>
        </div>
    `;
}

// Afficher l'historique de facturation
function renderBillingHistory() {
    const container = document.getElementById('billingHistoryList');
    if (!container) return;
    
    if (!billingHistory || billingHistory.length === 0) {
        container.innerHTML = `
            <div class="no-billing-history">
                <i class="fas fa-receipt"></i>
                <p>Aucun historique de facturation</p>
                <p style="font-size: 0.9rem;">Vos factures apparaîtront ici une fois que vous aurez souscrit à un plan.</p>
            </div>
        `;
        return;
    }
    
    // Debug: Afficher les données reçues
    console.log('📊 Données d\'historique reçues:', billingHistory);
    if (billingHistory.length > 0) {
        console.log('📅 Premier élément - billingPeriod:', billingHistory[0].billingPeriod);
        console.log('📅 Premier élément - dueDate:', billingHistory[0].dueDate);
        console.log('📅 Premier élément - paidDate:', billingHistory[0].paidDate);
    }
    
    container.innerHTML = `
        <div class="billing-history-table">
            <table>
                <thead>
                    <tr>
                        <th>Facture</th>
                        <th>Période</th>
                        <th>Plan</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${billingHistory.map(invoice => `
                        <tr>
                            <td>
                                <div class="invoice-number">${invoice.invoiceNumber}</div>
                                <div class="invoice-description">${invoice.description}</div>
                            </td>
                            <td>
                                <div>${formatDate(invoice.billingPeriod.startDate, 'DD/MM/YYYY')}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">au ${formatDate(invoice.billingPeriod.endDate, 'DD/MM/YYYY')}</div>
                            </td>
                            <td>
                                <div style="font-weight: 500;">${invoice.planName}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">${invoice.propertiesCount} propriété(s)</div>
                            </td>
                            <td>
                                <div class="invoice-amount">${formatCurrency(invoice.amount, invoice.currency)}</div>
                                ${invoice.paidDate ? `<div style="font-size: 0.875rem; color: #6b7280;">Payé le ${formatDate(invoice.paidDate, 'DD/MM/YYYY')}</div>` : ''}
                            </td>
                            <td>
                                <span class="invoice-status ${invoice.status}">
                                    ${getStatusIcon(invoice.status)}
                                    ${getStatusText(invoice.status)}
                                </span>
                            </td>
                            <td>
                                <div class="invoice-actions">
                                    <button class="btn-secondary" onclick="downloadInvoice('${invoice.id}')" title="Télécharger la facture">
                                        <i class="fas fa-download"></i>
                                    </button>
                                    ${invoice.status === 'pending' ? `
                                        <button class="btn-primary" onclick="payInvoice('${invoice.id}')" title="Payer maintenant">
                                            <i class="fas fa-credit-card"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Obtenir l'icône du statut
function getStatusIcon(status) {
    const icons = {
        'paid': '<i class="fas fa-check-circle"></i>',
        'pending': '<i class="fas fa-clock"></i>',
        'failed': '<i class="fas fa-times-circle"></i>',
        'cancelled': '<i class="fas fa-ban"></i>'
    };
    return icons[status] || '<i class="fas fa-question-circle"></i>';
}

// Obtenir le texte du statut
function getStatusText(status) {
    const texts = {
        'paid': 'Payé',
        'pending': 'En attente',
        'failed': 'Échoué',
        'cancelled': 'Annulé'
    };
    return texts[status] || 'Inconnu';
}

// Télécharger une facture
function downloadInvoice(invoiceId) {
    const invoice = billingHistory.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showNotification('Facture non trouvée', 'error');
        return;
    }
    
    // Simuler le téléchargement
    showNotification(`Téléchargement de la facture ${invoice.invoiceNumber}...`, 'info');
    
    // Ici, vous pourriez faire un appel API pour générer et télécharger le PDF
    setTimeout(() => {
        showNotification('Facture téléchargée avec succès', 'success');
    }, 1000);
}

// Payer une facture en attente
function payInvoice(invoiceId) {
    const invoice = billingHistory.find(inv => inv.id === invoiceId);
    if (!invoice) {
        showNotification('Facture non trouvée', 'error');
        return;
    }
    
    // Afficher la modal de confirmation de paiement
    showConfirmationModal({
        title: 'Payer la facture',
        content: `
            <div style="text-align: center; padding: 1rem 0;">
                <i class="fas fa-credit-card" style="font-size: 3rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Confirmer le paiement de la facture</p>
                <p style="color: #6b7280; font-size: 0.9rem;">${invoice.invoiceNumber} - ${formatCurrency(invoice.amount, invoice.currency)}</p>
            </div>
        `,
        onConfirm: () => {
            closeConfirmationModal();
            executePayment(invoiceId);
        }
    });
}

// Exécuter le paiement
function executePayment(invoiceId) {
    // Simuler le paiement
    showNotification('Traitement du paiement en cours...', 'info');
    
    setTimeout(() => {
        // Mettre à jour l'historique local
        const invoice = billingHistory.find(inv => inv.id === invoiceId);
        if (invoice) {
            invoice.status = 'paid';
            invoice.paidDate = new Date();
            renderBillingHistory();
            renderBillingStats();
        }
        
        showNotification('Paiement effectué avec succès', 'success');
    }, 2000);
} 
 