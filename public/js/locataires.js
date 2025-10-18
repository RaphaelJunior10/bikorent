// ========================================
// BikoRent - Gestion des Locataires
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

// Données des locataires (chargées depuis le contrôleur)
let locataires = [];
let proprietes = [];
let stats = {};

// Initialiser les données depuis le contrôleur
function initializeLocatairesData() {
    if (window.locatairesData) {
        locataires = window.locatairesData.locataires || [];
        proprietes = window.locatairesData.proprietes || [];
        stats = window.locatairesData.stats || {};
        // Initialiser filteredLocataires avec les données chargées
        filteredLocataires = [...locataires];
        console.log('Données des locataires chargées:', locataires.length, 'locataires');
    } else {
        console.error('Données des locataires non disponibles');
    }
}

// Variables globales
let filteredLocataires = [];
let currentView = 'grid';

// Éléments DOM (seront initialisés après le chargement)
let sidebar, menuBtn, closeSidebarBtn, searchInput, statusFilter, addLocataireBtn;
let locatairesContainer, locataireModal, addLocataireModal, closeModalBtn;
let closeAddModalBtn, cancelAddBtn, addLocataireForm;
let removeTenantModal, closeRemoveTenantModal, cancelRemoveTenant, confirmRemoveTenant;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeLocatairesData(); // Charger les données du contrôleur
    initializePage();
    initializeDOMElements(); // Initialiser les éléments DOM
    setupEventListeners();
    renderLocataires();
    updateStats();
    initSidebar(); // Initialiser le sidebar
    markActivePage(); // Marquer la page active
});

// Initialisation de la page
function initializePage() {
    // Charger les propriétés disponibles pour le formulaire d'ajout
    loadProprietes();
}

// Initialiser les éléments DOM
function initializeDOMElements() {
    sidebar = document.getElementById('sidebar');
    menuBtn = document.getElementById('menuBtn');
    closeSidebarBtn = document.getElementById('closeSidebar');
    searchInput = document.getElementById('searchLocataires');
    statusFilter = document.getElementById('statusFilter');
    addLocataireBtn = document.getElementById('addLocataireBtn');
    locatairesContainer = document.getElementById('locatairesContainer');
    locataireModal = document.getElementById('locataireModal');
    addLocataireModal = document.getElementById('addLocataireModal');
    closeModalBtn = document.getElementById('closeModal');
    closeAddModalBtn = document.getElementById('closeAddModal');
    cancelAddBtn = document.getElementById('cancelAdd');
    addLocataireForm = document.getElementById('addLocataireForm');
    removeTenantModal = document.getElementById('removeTenantModal');
    closeRemoveTenantModal = document.getElementById('closeRemoveTenantModal');
    cancelRemoveTenant = document.getElementById('cancelRemoveTenant');
    confirmRemoveTenant = document.getElementById('confirmRemoveTenant');
    
    // Vérifier que les éléments critiques sont trouvés
    if (!locatairesContainer) {
        console.error('Container des locataires non trouvé');
    }
    if (!searchInput) {
        console.error('Champ de recherche non trouvé');
    }
    if (!addLocataireModal) {
        console.error('Modal d\'ajout de locataire non trouvée');
    }
    if (!addLocataireBtn) {
        console.error('Bouton d\'ajout de locataire non trouvé');
    }
    
    console.log('Éléments DOM initialisés:', {
        addLocataireModal: !!addLocataireModal,
        addLocataireBtn: !!addLocataireBtn,
        addLocataireForm: !!addLocataireForm
    });
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Recherche et filtres
    searchInput.addEventListener('input', handleSearch);
    statusFilter.addEventListener('change', handleFilter);

    // Boutons d'action
    if (addLocataireBtn) {
        addLocataireBtn.addEventListener('click', openAddModal);
        console.log('Événement click attaché au bouton d\'ajout de locataire');
    } else {
        console.error('Bouton d\'ajout de locataire non trouvé - événement non attaché');
    }
    closeModalBtn.addEventListener('click', closeModal);
    closeAddModalBtn.addEventListener('click', closeAddModal);
    cancelAddBtn.addEventListener('click', closeAddModal);

    // Formulaire d'ajout
    addLocataireForm.addEventListener('submit', handleAddLocataire);

    // Modal de retrait de locataire
    closeRemoveTenantModal.addEventListener('click', closeRemoveTenantModalHandler);
    cancelRemoveTenant.addEventListener('click', closeRemoveTenantModalHandler);
    confirmRemoveTenant.addEventListener('click', handleRemoveTenantConfirm);

    // Options de vue
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });

    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === locataireModal) {
            closeModal();
        }
        if (event.target === addLocataireModal) {
            closeAddModal();
        }
        if (event.target === removeTenantModal) {
            closeRemoveTenantModalHandler();
        }
    });
}

// Gestion de la recherche
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredLocataires = locataires.filter(locataire => 
        locataire.nom.toLowerCase().includes(searchTerm) ||
        locataire.email.toLowerCase().includes(searchTerm) ||
        locataire.propriete.toLowerCase().includes(searchTerm)
    );
    renderLocataires();
}

// Gestion des filtres
function handleFilter() {
    const filterValue = statusFilter.value;
    if (filterValue === 'all') {
        filteredLocataires = [...locataires];
    } else {
        filteredLocataires = locataires.filter(locataire => locataire.statut === filterValue);
    }
    renderLocataires();
}

// Gestion du changement de vue
function handleViewChange(e) {
    const view = e.currentTarget.dataset.view;
    currentView = view;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Mettre à jour la classe du conteneur
    locatairesContainer.className = `locataires-container ${view}-view`;
    
    renderLocataires();
}

// Rendu des locataires
function renderLocataires() {
    if (!locatairesContainer) {
        console.error('Container des locataires non initialisé');
        return;
    }
    
    if (filteredLocataires.length === 0) {
        locatairesContainer.innerHTML = '<div class="no-data">Aucun locataire trouvé</div>';
        return;
    }
    
    if (currentView === 'grid') {
        renderGridView();
    } else {
        renderListView();
    }
}

// Rendu en vue grille
function renderGridView() {
    locatairesContainer.innerHTML = filteredLocataires.map(locataire => `
        <div class="locataire-card" data-id="${locataire.id}">
            <div class="card-header">
                <div class="locataire-profile">
                    <div class="profile-photo">
                        <img src="${getAvatarUrl(locataire)}" alt="${locataire.nom}" onerror="this.src='https://via.placeholder.com/50x50/cccccc/666666?text=${locataire.nom.charAt(0)}'">
                    </div>
                    <div class="status-indicator ${getStatusClass(locataire.statut)}">
                        <i class="fas ${getStatusIcon(locataire.statut)}"></i>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon" onclick="removeTenantFromProperty('${locataire.id}', '${locataire.propriete}')" title="Retirer de la propriété">
                        <i class="fas fa-minus"></i>
                    </button>
                    <!--<button class="btn-icon" onclick="editLocataire('${locataire.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>-->
                </div>
            </div>
            <div class="card-body">
                <h3 class="locataire-name">${locataire.nom}</h3>
                <p class="locataire-property">${locataire.propriete}</p>
                <div class="locataire-info">
                    <div class="info-item">
                        <i class="fas fa-envelope"></i>
                        <span>${locataire.email}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <span>${locataire.telephone}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="payment-info">
                    <div class="loyer">
                        <span class="label">Loyer:</span>
                        <span class="amount">FCFA ${locataire.loyer}/mois</span>
                    </div>
                    <div class="dues">
                        <span class="label">Dû:</span>
                        <span class="amount ${locataire.montantDu > 0 ? 'overdue' : 'paid'}">
                            FCFA ${locataire.montantDu}
                        </span>
                    </div>
                </div>
                <div class="payment-status">
                    ${getPaymentStatusText(locataire)}
                </div>
            </div>
        </div>
    `).join('');
}

// Rendu en vue liste
function renderListView() {
    locatairesContainer.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Locataire</th>
                        <th>Propriété</th>
                        <th>Contact</th>
                        <th>Loyer</th>
                        <th>Statut</th>
                        <th>Montant dû</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredLocataires.map(locataire => `
                        <tr>
                            <td>
                                <div class="locataire-info-cell">
                                    <div class="profile-photo-small">
                                        <img src="${getAvatarUrl(locataire)}" alt="${locataire.nom}" onerror="this.src='https://via.placeholder.com/40x40/cccccc/666666?text=${locataire.nom.charAt(0)}'">
                                    </div>
                                    <div class="locataire-details-cell">
                                        <div class="status-indicator ${getStatusClass(locataire.statut)}">
                                            <i class="fas ${getStatusIcon(locataire.statut)}"></i>
                                        </div>
                                        <div>
                                            <strong>${locataire.nom}</strong>
                                            <small>${locataire.email}</small>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>${locataire.propriete}</td>
                            <td>${locataire.telephone}</td>
                            <td>FCFA ${locataire.loyer}/mois</td>
                            <td>
                                <span class="status-badge ${getStatusClass(locataire.statut)}">
                                    ${getStatusText(locataire.statut)}
                                </span>
                            </td>
                            <td>
                                <span class="amount ${locataire.montantDu > 0 ? 'overdue' : 'paid'}">
                                    FCFA ${locataire.montantDu}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-icon" onclick="removeTenantFromProperty('${locataire.id}', '${locataire.propriete}')" title="Retirer de la propriété">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                   <!-- <button class="btn-small" onclick="viewLocataire('${locataire.id}')">
                                        <i class="fas fa-eye"></i> Détails
                                    </button>
                                    <button class="btn-small" onclick="editLocataire('${locataire.id}')">
                                        <i class="fas fa-edit"></i> Modifier2
                                    </button>-->
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Fonctions utilitaires pour le statut
function getStatusClass(statut) {
    switch(statut) {
        case 'current': return 'status-current';
        case 'overdue': return 'status-overdue';
        case 'upcoming': return 'status-upcoming';
        default: return 'status-current';
    }
}

function getStatusIcon(statut) {
    switch(statut) {
        case 'current': return 'fa-check-circle';
        case 'overdue': return 'fa-exclamation-triangle';
        case 'upcoming': return 'fa-clock';
        default: return 'fa-check-circle';
    }
}

function getStatusText(statut) {
    switch(statut) {
        case 'current': return 'À jour';
        case 'overdue': return 'En retard';
        case 'upcoming': return 'À venir';
        default: return 'À jour';
    }
}

function getPaymentStatusText(locataire) {
    if (locataire.montantDu > 0) {
        return `<span class="status-overdue">${locataire.moisImpayes} mois impayés</span>`;
    } else {
        return `<span class="status-current">À jour</span>`;
    }
}

// Mise à jour des statistiques
function updateStats() {
    // Utiliser les statistiques du contrôleur ou les calculer dynamiquement
    const total = stats.total || locataires.length;
    const aJour = stats.aJour || locataires.filter(l => l.statut === 'current').length;
    const enRetard = stats.enRetard || locataires.filter(l => l.statut === 'overdue').length;
    const montantDu = stats.montantDu || locataires.reduce((sum, l) => sum + l.montantDu, 0);

    document.getElementById('totalLocataires').textContent = total;
    document.getElementById('aJour').textContent = aJour;
    document.getElementById('enRetard').textContent = enRetard;
    document.getElementById('montantDu').textContent = `FCFA ${montantDu}`;
}

// Gestion des modals
function openAddModal() {
    console.log('Tentative d\'ouverture de la modal d\'ajout...');
    
    if (!addLocataireModal) {
        console.error('Modal d\'ajout non trouvée');
        return;
    }
    
    // Charger les propriétés libres à chaque ouverture
    loadProprietes();
    
    // Définir la date d'aujourd'hui par défaut
    const today = new Date().toISOString().split('T')[0];
    const dateEntreeInput = document.getElementById('dateEntree');
    if (dateEntreeInput) {
        dateEntreeInput.value = today;
    }
    
    // Afficher la modal avec la classe show
    addLocataireModal.classList.add('show');
    
    console.log('Modal d\'ajout ouverte:', {
        hasShowClass: addLocataireModal.classList.contains('show'),
        computedStyle: window.getComputedStyle(addLocataireModal).opacity
    });
}

function closeAddModal() {
    if (addLocataireModal) {
        addLocataireModal.classList.remove('show');
    }
    if (addLocataireForm) {
        addLocataireForm.reset();
    }
}

function closeModal() {
    if (locataireModal) {
        locataireModal.classList.remove('show');
    }
}

// Charger les propriétés libres pour le formulaire
async function loadProprietes() {
    const proprieteSelect = document.getElementById('propriete');
    if (!proprieteSelect) return;

    try {
        // Récupérer les propriétés libres depuis le backend
        const response = await fetch('/locataires/available-properties');
        const result = await response.json();

        if (response.ok && result.success) {
            // Vider le select
            proprieteSelect.innerHTML = '<option value="">Sélectionner une propriété libre</option>';
            
            // Ajouter les propriétés libres
            result.properties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${property.name} - FCFA ${property.monthlyRent}/mois`;
                option.dataset.rent = property.monthlyRent;
                proprieteSelect.appendChild(option);
            });

            // Ajouter un événement pour mettre à jour le loyer automatiquement
            proprieteSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const loyerInput = document.getElementById('loyer');
                if (selectedOption.dataset.rent && loyerInput) {
                    loyerInput.value = selectedOption.dataset.rent;
                }
            });

            console.log(`✅ ${result.properties.length} propriétés libres chargées`);
        } else {
            console.error('Erreur lors du chargement des propriétés libres:', result.message);
            showNotification('Erreur lors du chargement des propriétés', 'error');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des propriétés libres:', error);
        showNotification('Erreur de connexion lors du chargement des propriétés', 'error');
    }
}

// Gestion de l'ajout d'un locataire
async function handleAddLocataire(e) {
    e.preventDefault();
    
    const formData = new FormData(addLocataireForm);
    
    // Préparer les données du nouveau locataire
    const newTenantData = {
        // Informations obligatoires
        prenom: formData.get('prenom'),
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        propertyId: formData.get('propriete'),
        monthlyRent: parseFloat(formData.get('loyer')),
        entryDate: formData.get('dateEntree'),
        
        // Informations facultatives
        emploi: formData.get('emploi') || null,
        lieuTravail: formData.get('lieuTravail') || null,
        adresse: formData.get('adresse') || null,
        bio: formData.get('bio') || null,
        photo: null
    };

    // Validation côté client
    if (!newTenantData.prenom || !newTenantData.nom || !newTenantData.email || 
        !newTenantData.telephone || !newTenantData.propertyId || 
        !newTenantData.entryDate) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    try {
        // Afficher un indicateur de chargement
        const submitBtn = addLocataireForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création...';
        submitBtn.disabled = true;

        // Envoyer les données au backend
        const response = await fetch('/locataires/add-tenant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTenantData)
        });

        const result = await response.json();

        // Restaurer le bouton
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (response.ok && result.success) {
            showNotification(result.message || 'Locataire créé avec succès', 'success');
            closeAddModal();
            
            // Recharger la page pour mettre à jour les données
            window.location.reload();
        } else {
            showNotification(result.message || 'Erreur lors de la création du locataire', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la création du locataire:', error);
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        
        // Restaurer le bouton en cas d'erreur
        const submitBtn = addLocataireForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Créer le locataire';
        submitBtn.disabled = false;
    }
}

// Fonctions pour voir et modifier les locataires
function viewLocataire(id) {
    const locataire = locataires.find(l => l.id === id);
    if (!locataire) return;

    document.getElementById('modalTitle').textContent = `Détails de ${locataire.nom}`;
    document.getElementById('modalBody').innerHTML = generateLocataireDetails(locataire);
    locataireModal.style.display = 'flex';
}

function editLocataire(id) {
    const locataire = locataires.find(l => l.id === id);
    if (!locataire) return;

    // Pour l'instant, on affiche juste les détails
    // Dans une version complète, on pourrait ouvrir un formulaire d'édition
    viewLocataire(id);
}

// Génération des détails du locataire
function generateLocataireDetails(locataire) {
    // Générer un historique de transactions fictif basé sur les données du locataire
    const transactions = generateTransactionHistory(locataire);
    
    return `
        <div class="locataire-details">
            <div class="detail-section">
                <h3>Informations personnelles</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Nom complet:</label>
                        <span>${locataire.nom}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${locataire.email}</span>
                    </div>
                    <div class="detail-item">
                        <label>Téléphone:</label>
                        <span>${locataire.telephone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date d'entrée:</label>
                        <span>${formatDate(locataire.dateEntree)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Informations locatives</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Propriété:</label>
                        <span>${locataire.propriete}</span>
                    </div>
                    <div class="detail-item">
                        <label>Loyer mensuel:</label>
                        <span>FCFA ${locataire.loyer}</span>
                    </div>
                    <div class="detail-item">
                        <label>Statut:</label>
                        <span class="status-badge ${getStatusClass(locataire.statut)}">
                            ${getStatusText(locataire.statut)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Montant dû:</label>
                        <span class="amount ${locataire.montantDu > 0 ? 'overdue' : 'paid'}">
                            FCFA ${locataire.montantDu}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Historique des paiements</h3>
                <div class="payment-history">
                    <div class="history-item">
                        <span class="history-label">Dernier paiement:</span>
                        <span class="history-value">
                            ${locataire.dernierPaiement ? formatDate(locataire.dernierPaiement) : 'Aucun'}
                        </span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">Prochain paiement:</span>
                        <span class="history-value">${formatDate(locataire.prochainPaiement)}</span>
                    </div>
                    <div class="history-item">
                        <span class="history-label">Mois impayés:</span>
                        <span class="history-value">${locataire.moisImpayes}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Historique des transactions</h3>
                <div class="transactions-table">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Montant</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(transaction => `
                                <tr class="transaction-row ${transaction.status === 'overdue' ? 'overdue' : ''}">
                                    <td>${formatDate(transaction.date)}</td>
                                    <td>
                                        <span class="transaction-type ${transaction.type}">
                                            <i class="fas ${getTransactionIcon(transaction.type)}"></i>
                                            ${getTransactionTypeText(transaction.type)}
                                        </span>
                                    </td>
                                    <td>${transaction.description}</td>
                                    <td class="amount ${transaction.amount < 0 ? 'negative' : 'positive'}">
                                        ${transaction.amount > 0 ? '+' : ''}FCFA ${transaction.amount}
                                    </td>
                                    <td>
                                        <span class="status-badge ${getStatusClass(transaction.status)}">
                                            ${getStatusText(transaction.status)}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="detail-section">
                <h3>Résumé financier</h3>
                <div class="financial-summary">
                    <div class="summary-item">
                        <span class="summary-label">Total payé:</span>
                        <span class="summary-value positive">FCFA ${calculateTotalPaid(transactions)}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Total dû:</span>
                        <span class="summary-value negative">FCFA ${locataire.montantDu}</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label">Solde:</span>
                        <span class="summary-value ${calculateBalance(transactions) >= 0 ? 'positive' : 'negative'}">
                            FCFA ${calculateBalance(transactions)}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-actions">
                <button class="btn-primary" onclick="contactLocataire('${locataire.id}')">
                    <i class="fas fa-phone"></i> Contacter
                </button>
                <button class="btn-secondary" onclick="recordPayment('${locataire.id}')">
                    <i class="fas fa-credit-card"></i> Enregistrer un paiement
                </button>
                <button class="btn-outline" onclick="downloadTransactionHistory('${locataire.id}')">
                    <i class="fas fa-download"></i> Télécharger l'historique
                </button>
            </div>
        </div>
    `;
}

// Fonctions utilitaires
function formatDate(dateString) {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Générer un historique de transactions fictif
function generateTransactionHistory(locataire) {
    const transactions = [];
    const entryDate = new Date(locataire.dateEntree);
    const today = new Date();
    
    // Ajouter le paiement de la caution
    transactions.push({
        date: new Date(entryDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant l'entrée
        type: 'deposit',
        description: 'Paiement de la caution',
        amount: locataire.loyer,
        status: 'completed'
    });
    
    // Ajouter les paiements de loyer mensuels
    let currentDate = new Date(entryDate);
    let paymentCount = 0;
    
    while (currentDate <= today && paymentCount < 12) { // Limiter à 12 mois pour l'exemple
        const paymentDate = new Date(currentDate);
        const isOverdue = locataire.statut === 'overdue' && paymentCount >= (12 - locataire.moisImpayes);
        
        transactions.push({
            date: paymentDate,
            type: 'rent',
            description: `Loyer ${paymentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            amount: -locataire.loyer,
            status: isOverdue ? 'overdue' : 'completed'
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
        paymentCount++;
    }
    
    // Ajouter quelques paiements effectués
    const completedPayments = transactions.filter(t => t.status === 'completed').slice(0, 3);
    completedPayments.forEach((payment, index) => {
        const paymentDate = new Date(payment.date);
        paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 jours après
        
        transactions.push({
            date: paymentDate,
            type: 'payment',
            description: `Paiement reçu - ${payment.description}`,
            amount: Math.abs(payment.amount),
            status: 'completed'
        });
    });
    
    // Ajouter quelques charges/amendes si applicable
    if (locataire.montantDu > 0) {
        transactions.push({
            date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // Il y a 30 jours
            type: 'charge',
            description: 'Frais de retard',
            amount: -50,
            status: 'overdue'
        });
    }
    
    // Trier par date (plus récent en premier)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Fonctions pour les types de transactions
function getTransactionIcon(type) {
    switch(type) {
        case 'rent': return 'fa-home';
        case 'payment': return 'fa-credit-card';
        case 'deposit': return 'fa-shield-alt';
        case 'charge': return 'fa-exclamation-triangle';
        case 'refund': return 'fa-undo';
        default: return 'fa-money-bill';
    }
}

function getTransactionTypeText(type) {
    switch(type) {
        case 'rent': return 'Loyer';
        case 'payment': return 'Paiement';
        case 'deposit': return 'Caution';
        case 'charge': return 'Charge';
        case 'refund': return 'Remboursement';
        default: return 'Transaction';
    }
}

// Calculs financiers
function calculateTotalPaid(transactions) {
    return transactions
        .filter(t => t.type === 'payment' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
}

function calculateBalance(transactions) {
    const totalRent = transactions
        .filter(t => t.type === 'rent')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalPaid = calculateTotalPaid(transactions);
    
    return totalPaid - totalRent;
}

// Fonction pour télécharger l'historique
function downloadTransactionHistory(locataireId) {
    const locataire = locataires.find(l => l.id === locataireId);
    if (!locataire) return;
    
    const transactions = generateTransactionHistory(locataire);
    
    // Créer le contenu CSV
    let csvContent = "Date,Type,Description,Montant,Statut\n";
    transactions.forEach(transaction => {
        csvContent += `${formatDate(transaction.date)},${getTransactionTypeText(transaction.type)},${transaction.description},${transaction.amount}FCFA ,${getStatusText(transaction.status)}\n`;
    });
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historique_${locataire.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function contactLocataire(id) {
    const locataire = locataires.find(l => l.id === id);
    if (locataire) {
        showNotification(`Contact de ${locataire.nom}: ${locataire.telephone} - ${locataire.email}`, 'info');
    }
}

function recordPayment(id) {
    const locataire = locataires.find(l => l.id === id);
    if (locataire) {
        const montant = prompt(`Enregistrer un paiement pour ${locataire.nom} (montant en FCFA ):`);
        if (montant && !isNaN(montant)) {
            locataire.montantDu = Math.max(0, locataire.montantDu - parseFloat(montant));
            locataire.dernierPaiement = new Date().toISOString().split('T')[0];
            locataire.statut = locataire.montantDu > 0 ? 'overdue' : 'current';
            locataire.moisImpayes = Math.ceil(locataire.montantDu / locataire.loyer);
            
            renderLocataires();
            updateStats();
            closeModal();
        }
    }
} 

// Fonction pour générer un avatar SVG avec initiale
function generateAvatar(initiale, size = 50) {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ];
    const color = colors[initiale.charCodeAt(0) % colors.length];
    
    return `data:image/svg+xml;base64,${btoa(`
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
            <text x="${size/2}" y="${size/2 + size/6}" font-family="Arial, sans-serif" font-size="${size/2}" font-weight="bold" text-anchor="middle" fill="white">${initiale.toUpperCase()}</text>
        </svg>
    `)}`;
}

// Fonction pour obtenir l'URL de l'avatar
function getAvatarUrl(locataire) {
    if (locataire.photo) {
        return locataire.photo;
    }
    return generateAvatar(locataire.nom.charAt(0));
}

// Fonction pour retirer un locataire d'une propriété
function removeTenantFromProperty(tenantId, propertyName) {
    // Trouver le locataire dans les données
    const locataire = locataires.find(l => l.id === tenantId);
    if (!locataire) {
        console.error('Locataire non trouvé');
        return;
    }

    // Mettre à jour le message de la modal
    const messageElement = document.getElementById('removeTenantMessage');
    if (messageElement) {
        messageElement.textContent = `Êtes-vous sûr de vouloir retirer ${locataire.nom} de la propriété "${propertyName}" ?`;
    }

    // Stocker les données dans la modal
    removeTenantModal.dataset.tenantId = tenantId;
    removeTenantModal.dataset.propertyName = propertyName;

    // Afficher la modal
    removeTenantModal.classList.add('show');
}

// Fonction pour fermer la modal de retrait
function closeRemoveTenantModalHandler() {
    removeTenantModal.classList.remove('show');
}

// Fonction pour gérer la confirmation de retrait
function handleRemoveTenantConfirm() {
    const tenantId = removeTenantModal.dataset.tenantId;
    const propertyName = removeTenantModal.dataset.propertyName;
    
    if (!tenantId || !propertyName) {
        console.error('Données manquantes pour le retrait');
        return;
    }

    // Fermer la modal
    closeRemoveTenantModalHandler();

    // Envoyer la requête au backend
    sendRemoveTenantRequest(tenantId, propertyName);
}

// Fonction pour envoyer la requête de retrait au backend
async function sendRemoveTenantRequest(tenantId, propertyName) {
    try {
        // Afficher un indicateur de chargement
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'loading-message';
        loadingMessage.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrait en cours...';
        loadingMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
        `;
        document.body.appendChild(loadingMessage);

        const response = await fetch('/locataires/remove-tenant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tenantId: tenantId,
                propertyName: propertyName
            })
        });

        const result = await response.json();

        // Retirer l'indicateur de chargement
        document.body.removeChild(loadingMessage);

        if (response.ok && result.success) {
            // Succès - mettre à jour l'interface
            showNotification(result.message || 'Locataire retiré avec succès de la propriété', 'success');
            
            // Recharger la page pour mettre à jour les données
            window.location.reload();
        } else {
            // Erreur
            showNotification(result.message || 'Impossible de retirer le locataire de la propriété', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la requête:', error);
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        
        // Retirer l'indicateur de chargement en cas d'erreur
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            document.body.removeChild(loadingMessage);
        }
    }
}

// Fonction pour afficher des notifications
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
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Fonction pour obtenir l'icône de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// Fonction de test pour déboguer l'ouverture de modal
function testOpenModal() {
    console.log('=== Test d\'ouverture de modal ===');
    console.log('addLocataireModal:', addLocataireModal);
    console.log('addLocataireBtn:', addLocataireBtn);
    console.log('addLocataireForm:', addLocataireForm);
    
    if (addLocataireModal) {
        console.log('Tentative d\'ouverture de la modal...');
        openAddModal();
    } else {
        console.error('Modal non trouvée');
    }
}

// Exposer la fonction de test globalement pour le débogage
window.testOpenModal = testOpenModal;