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
    
    // Charger les intégrations
    loadIntegrationsData();
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
        // Sauvegarder les changements de préférences
        saveUserData();
        showNotification('Préférence mise à jour', 'success');
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
    
    // Mettre à jour les données utilisateur
    if (id === 'language' || id === 'timezone' || id === 'dateFormat' || id === 'currency') {
        userData.preferences[id] = value;
        // Sauvegarder les changements de préférences
        saveUserData();
        showNotification('Préférence mise à jour', 'success');
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
    
    // Afficher la modal de confirmation
    showPasswordConfirmationModal();
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
        planCard.textContent = `Plan ${userData.billing.plan}`;
    }
    
    const planPrice = document.querySelector('.plan-card .plan-info p');
    if (planPrice) {
        planPrice.textContent = `${formatCurrency(userData.billing.price, userData.billing.currency)}/mois`;
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

// Chargement des données d'intégrations
function loadIntegrationsData() {
    if (!userData.integrations) return;
    
    const integrationsSection = document.querySelector('.integrations-section');
    if (integrationsSection) {
        integrationsSection.innerHTML = userData.integrations.map(integration => `
            <div class="integration-item">
                <div class="integration-info">
                    <img src="https://via.placeholder.com/40x40/${integration.color.replace('#', '')}/ffffff?text=${integration.icon}" alt="${integration.name}">
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

// Fonction pour basculer l'état d'une intégration
function toggleIntegration(integrationId) {
    const integration = userData.integrations.find(i => i.id === integrationId);
    if (integration) {
        integration.connected = !integration.connected;
        loadIntegrationsData(); // Recharger l'affichage
        saveUserData();
        showNotification(
            `${integration.name} ${integration.connected ? 'connecté' : 'déconnecté'}`, 
            'success'
        );
    }
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
function updatePassword() {
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
function formatCurrency(amount, currency = 'EUR') {
    const formatters = {
        'EUR': new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }),
        'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        'GBP': new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
    };
    
    return formatters[currency] ? formatters[currency].format(amount) : `${amount} ${currency}`;
}

function formatDate(date, format = 'DD/MM/YYYY') {
    const d = new Date(date);
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
 