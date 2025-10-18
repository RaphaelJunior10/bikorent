// ========================================
// BikoRent - Gestion des Paiements
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

// Données des paiements (générées par le contrôleur)
let paiements = [];
let mesPaiements = [];
let proprietesLocataire = [];
let amountWaited = 0;
let proprietesDueList = [];
let locatairesDueList = [];

// Fonction pour trier les paiements par date (plus récent au plus ancien)
function sortPaiementsByDate(paiementsArray) {
    return paiementsArray.sort((a, b) => {
        // Convertir les dates en objets Date pour comparaison
        const dateA = new Date(a.datePaiement || a.date || 0);
        const dateB = new Date(b.datePaiement || b.date || 0);
        
        // Tri décroissant (plus récent en premier)
        return dateB - dateA;
    });
}

// Initialiser les données depuis le contrôleur
function initializePaiementsData() {
    if (window.paiementsData) {
        console.log('✅ Données des paiements reçues:', window.paiementsData);
        paiements = window.paiementsData.proprietaire.paiements;
        amountWaited = window.paiementsData.proprietaire.amountWaited;
        mesPaiements = window.paiementsData.locataire.paiements;
        proprietesLocataire = window.paiementsData.locataire.proprietes;
        proprietesDueList = window.paiementsData.proprietaire.proprietesDueList;
        locatairesDueList = window.paiementsData.locataire.locatairesDueList;
        
        // Trier les paiements par date (plus récent au plus ancien)
        paiements = sortPaiementsByDate(paiements);
        mesPaiements = sortPaiementsByDate(mesPaiements);
        
        filteredPaiements = [...paiements];
        filteredMesPaiements = [...mesPaiements];
        console.log('✅ Paiements propriétaire (triés par date):', paiements);
        console.log('✅ Paiements locataire (triés par date):', mesPaiements);
        console.log('✅ Calendrier propriétaire:', window.paiementsData.proprietaire.calendrier);
        console.log('✅ Calendrier locataire:', window.paiementsData.locataire.calendrier);
        console.log('✅ Propriétés due:', proprietesDueList);
        console.log('✅ Locataires due:', locatairesDueList);
    } else {
        console.error('❌ Données des paiements non disponibles');
    }
}

// Variables globales
let filteredPaiements = [...paiements];
let filteredMesPaiements = [...mesPaiements];
let currentView = 'table';
let currentTab = 'proprietaire';
let currentPage = 1;
let currentPageMesPaiements = 1;
let itemsPerPage = 10;

// Éléments DOM
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebarBtn = document.getElementById('closeSidebar');
const searchPaiements = document.getElementById('searchPaiements');
const searchMesPaiements = document.getElementById('searchMesPaiements');
const statusFilter = document.getElementById('statusFilter');
const statusFilterLocataire = document.getElementById('statusFilterLocataire');
const monthFilter = document.getElementById('monthFilter');
const addPaiementBtn = document.getElementById('addPaiementBtn');
const effectuerPaiementBtn = document.getElementById('effectuerPaiementBtn');
const paiementsContainer = document.getElementById('paiementsContainer');
const mesPaiementsContainer = document.getElementById('mesPaiementsContainer');
const addPaiementModal = document.getElementById('addPaiementModal');
const effectuerPaiementModal = document.getElementById('effectuerPaiementModal');
const closeAddModal = document.getElementById('closeAddModal');
const closeEffectuerModal = document.getElementById('closeEffectuerModal');
const cancelAdd = document.getElementById('cancelAdd');
const cancelEffectuer = document.getElementById('cancelEffectuer');
const addPaiementForm = document.getElementById('addPaiementForm');
const effectuerPaiementForm = document.getElementById('effectuerPaiementForm');
const paiementDetailsModal = document.getElementById('paiementDetailsModal');
const closePaiementDetailsModal = document.getElementById('closePaiementDetailsModal');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les données depuis le contrôleur
    initializePaiementsData();
    
    // Initialiser le sidebar
    initSidebar();
    markActivePage();
    
    initializePage();
    setupEventListeners();
    renderPaiements();
    renderMesPaiements();
    updateStats();
    updateStatsLocataire();
    
    // Rendre les sections de retard
    renderLocatairesEnRetard();
    renderRetardPaiement();
    
    // Initialiser les calendriers
    initializeCalendars();
});

// Initialisation de la page
function initializePage() {
    // Charger les locataires et propriétés pour les formulaires
    loadLocataires();
    loadProprietes();
    loadMois();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Initialiser les éléments du modal paiement en espèces
    initializeEspecesModalElements();
    
    // Onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabChange);
    });

    // Recherche et filtres (Propriétaire)
    searchPaiements.addEventListener('input', handleSearchPaiements);
    statusFilter.addEventListener('change', handleFilterPaiements);
    monthFilter.addEventListener('change', handleFilterPaiements);

    // Recherche et filtres (Locataire)
    searchMesPaiements.addEventListener('input', handleSearchMesPaiements);
    statusFilterLocataire.addEventListener('change', handleFilterMesPaiements);

    // Boutons d'action
    addPaiementBtn.addEventListener('click', openEspecesModal); // Ouvrir le modal paiement en espèces
    effectuerPaiementBtn.addEventListener('click', function() {
        // Rediriger vers la nouvelle page de paiement
        window.location.href = '/paiements/paiement';
    });
    closeAddModal.addEventListener('click', closeAddPaiementModal);
    closeEffectuerModal.addEventListener('click', closeEffectuerPaiementModal);
    cancelAdd.addEventListener('click', closeAddPaiementModal);
    
    // Modal de détails
    closePaiementDetailsModal.addEventListener('click', closePaiementDetailsModalHandler);
    cancelEffectuer.addEventListener('click', closeEffectuerPaiementModal);
    
    // Modal paiement en espèces
    if (closeEspecesModal) {
        closeEspecesModal.addEventListener('click', closeEspecesModalHandler);
    }
    
    if (cancelEspeces) {
        cancelEspeces.addEventListener('click', cancelEspecesHandler);
    }
    
    if (proprieteEspeces) {
        proprieteEspeces.addEventListener('change', handleProprieteEspecesChange);
    }
    
    if (confirmEspeces) {
        confirmEspeces.addEventListener('click', confirmEspecesPayment);
    }

    // Formulaires
    addPaiementForm.addEventListener('submit', handleAddPaiement);
    effectuerPaiementForm.addEventListener('submit', handleEffectuerPaiement);

    // Options de vue
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });

    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        if (event.target === addPaiementModal) {
            closeAddPaiementModal();
        }
        if (event.target === effectuerPaiementModal) {
            closeEffectuerPaiementModal();
        }
        if (event.target === paiementDetailsModal) {
            closePaiementDetailsModalHandler();
        }
    });
}

// Gestion des onglets
function handleTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    currentTab = tab;
    
    // Mettre à jour les boutons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Mettre à jour le contenu
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    
    // Mettre à jour les statistiques
    if (tab === 'proprietaire') {
        updateStats();
    } else {
        updateStatsLocataire();
    }
    
    // Régénérer les calendriers
    initializeCalendars();
}

// Gestion de la recherche (Propriétaire)
function handleSearchPaiements() {
    const searchTerm = searchPaiements.value.toLowerCase();
    filteredPaiements = paiements.filter(paiement => 
        paiement.locataire.toLowerCase().includes(searchTerm) ||
        paiement.propriete.toLowerCase().includes(searchTerm) ||
        paiement.mois.toLowerCase().includes(searchTerm)
    );
    // Maintenir le tri par date après filtrage
    filteredPaiements = sortPaiementsByDate(filteredPaiements);
    currentPage = 1;
    renderPaiements();
}

// Gestion des filtres (Propriétaire)
function handleFilterPaiements() {
    const statusValue = statusFilter.value;
    const monthValue = monthFilter.value;
    
    filteredPaiements = paiements.filter(paiement => {
        const statusMatch = statusValue === 'all' || paiement.statut === statusValue;
        const monthMatch = monthValue === 'all' || 
                          (monthValue === 'current' && paiement.mois.includes('Février')) ||
                          (monthValue === 'last' && paiement.mois.includes('Janvier'));
        return statusMatch && monthMatch;
    });
    
    // Maintenir le tri par date après filtrage
    filteredPaiements = sortPaiementsByDate(filteredPaiements);
    currentPage = 1;
    renderPaiements();
}

// Gestion de la recherche (Locataire)
function handleSearchMesPaiements() {
    const searchTerm = searchMesPaiements.value.toLowerCase();
    filteredMesPaiements = mesPaiements.filter(paiement => 
        paiement.propriete.toLowerCase().includes(searchTerm) ||
        paiement.mois.toLowerCase().includes(searchTerm)
    );
    // Maintenir le tri par date après filtrage
    filteredMesPaiements = sortPaiementsByDate(filteredMesPaiements);
    currentPageMesPaiements = 1;
    renderMesPaiements();
}

// Gestion des filtres (Locataire)
function handleFilterMesPaiements() {
    const statusValue = statusFilterLocataire.value;
    filteredMesPaiements = mesPaiements.filter(paiement => 
        statusValue === 'all' || paiement.statut === statusValue
    );
    // Maintenir le tri par date après filtrage
    filteredMesPaiements = sortPaiementsByDate(filteredMesPaiements);
    currentPageMesPaiements = 1;
    renderMesPaiements();
}

// Gestion du changement de vue
function handleViewChange(e) {
    const view = e.currentTarget.dataset.view;
    currentView = view;
    
    // Mettre à jour les boutons
    e.currentTarget.parentElement.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Mettre à jour le rendu
    if (currentTab === 'proprietaire') {
        renderPaiements();
    } else {
        renderMesPaiements();
    }
}

// Rendu des paiements (Propriétaire)
function renderPaiements() {
    if (currentView === 'table') {
        renderPaiementsTable();
    } else {
        renderPaiementsCards();
    }
}

// Rendu en tableau (Propriétaire)
function renderPaiementsTable() {
    const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPaiements = filteredPaiements.slice(startIndex, endIndex);

    paiementsContainer.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Locataire</th>
                        <th>Propriété</th>
                        <th>Mois</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Méthode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedPaiements.map(paiement => `
                        <tr>
                            <td>
                                <div class="paiement-info-cell">
                                    <strong>${paiement.locataire}</strong>
                                </div>
                            </td>
                            <td>${paiement.propriete}</td>
                            <td>${paiement.mois}</td>
                            <td>FCFA ${paiement.montant}</td>
                            <td>${paiement.datePaiement ? formatDate(paiement.datePaiement) : '-'}</td>
                            <td>
                                <span class="status-badge ${getStatusClass(paiement.statut)}">
                                    ${getStatusText(paiement.statut)}
                                </span>
                            </td>
                            <td>${getMethodeText(paiement.methode)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-small" onclick="viewPaiement('${paiement.id}')">
                                        <i class="fas fa-eye"></i> Détails
                                    </button>
                                    ${paiement.statut === 'pending' ? `
                                        <button class="btn-small" onclick="markAsPaid('${paiement.id}')">
                                            <i class="fas fa-check"></i> Marquer payé
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ${renderPagination(currentPage, totalPages, 'proprietaire')}
    `;
}

// Rendu en cartes (Propriétaire)
function renderPaiementsCards() {
    const totalPages = Math.ceil(filteredPaiements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPaiements = filteredPaiements.slice(startIndex, endIndex);

    paiementsContainer.innerHTML = `
        <div class="paiements-grid">
            ${paginatedPaiements.map(paiement => `
                <div class="paiement-card ${getStatusClass(paiement.statut)}">
                    <div class="card-header">
                        <div class="status-indicator ${getStatusClass(paiement.statut)}">
                            <i class="fas ${getStatusIcon(paiement.statut)}"></i>
                        </div>
                        <div class="card-actions">
                            <button class="btn-icon" onclick="viewPaiement('${paiement.id}')" title="Voir détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${paiement.statut === 'pending' ? `
                                <button class="btn-icon" onclick="markAsPaid('${paiement.id}')" title="Marquer payé">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-body">
                        <h3 class="paiement-locataire">${paiement.locataire}</h3>
                        <p class="paiement-propriete">${paiement.propriete}</p>
                        <div class="paiement-info">
                            <div class="info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${paiement.mois}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-euro-sign"></i>
                                <span>FCFA ${paiement.montant}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="paiement-details">
                            <div class="detail-item">
                                <span class="label">Date:</span>
                                <span class="value">${paiement.datePaiement ? formatDate(paiement.datePaiement) : 'Non payé'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Méthode:</span>
                                <span class="value">${getMethodeText(paiement.methode)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        ${renderPagination(currentPage, totalPages, 'proprietaire')}
    `;
}

// Rendu des paiements (Locataire)
function renderMesPaiements() {
    if (currentView === 'table') {
        renderMesPaiementsTable();
    } else {
        renderMesPaiementsCards();
    }
}

// Rendu en tableau (Locataire)
function renderMesPaiementsTable() {
    const totalPages = Math.ceil(filteredMesPaiements.length / itemsPerPage);
    const startIndex = (currentPageMesPaiements - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPaiements = filteredMesPaiements.slice(startIndex, endIndex);

    mesPaiementsContainer.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Propriété</th>
                        <th>Mois</th>
                        <th>Montant</th>
                        <th>Date</th>
                        <th>Statut</th>
                        <th>Méthode</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedPaiements.map(paiement => `
                        <tr>
                            <td>
                                <div class="paiement-info-cell">
                                    <strong>${paiement.propriete}</strong>
                                </div>
                            </td>
                            <td>${paiement.mois}</td>
                            <td>FCFA ${paiement.montant}</td>
                            <td>${paiement.datePaiement ? formatDate(paiement.datePaiement) : '-'}</td>
                            <td>
                                <span class="status-badge ${getStatusClass(paiement.statut)}">
                                    ${getStatusText(paiement.statut)}
                                </span>
                            </td>
                            <td>${getMethodeText(paiement.methode)}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-small" onclick="viewMesPaiement('${paiement.id}')">
                                        <i class="fas fa-eye"></i> Détails
                                    </button>
                                    ${paiement.statut === 'pending' ? `
                                        <button class="btn-small" onclick="effectuerPaiement('${paiement.id}')">
                                            <i class="fas fa-credit-card"></i> Payer
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ${renderPagination(currentPageMesPaiements, totalPages, 'locataire')}
    `;
}

// Rendu en cartes (Locataire)
function renderMesPaiementsCards() {
    const totalPages = Math.ceil(filteredMesPaiements.length / itemsPerPage);
    const startIndex = (currentPageMesPaiements - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPaiements = filteredMesPaiements.slice(startIndex, endIndex);

    mesPaiementsContainer.innerHTML = `
        <div class="paiements-grid">
            ${paginatedPaiements.map(paiement => `
                <div class="paiement-card ${getStatusClass(paiement.statut)}">
                    <div class="card-header">
                        <div class="status-indicator ${getStatusClass(paiement.statut)}">
                            <i class="fas ${getStatusIcon(paiement.statut)}"></i>
                        </div>
                        <div class="card-actions">
                            <button class="btn-icon" onclick="viewMesPaiement('${paiement.id}')" title="Voir détails">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${paiement.statut === 'pending' ? `
                                <button class="btn-icon" onclick="effectuerPaiement('${paiement.id}')" title="Payer">
                                    <i class="fas fa-credit-card"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="card-body">
                        <h3 class="paiement-propriete">${paiement.propriete}</h3>
                        <div class="paiement-info">
                            <div class="info-item">
                                <i class="fas fa-calendar"></i>
                                <span>${paiement.mois}</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-euro-sign"></i>
                                <span>FCFA ${paiement.montant}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="paiement-details">
                            <div class="detail-item">
                                <span class="label">Date:</span>
                                <span class="value">${paiement.datePaiement ? formatDate(paiement.datePaiement) : 'À payer'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Méthode:</span>
                                <span class="value">${getMethodeText(paiement.methode)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        ${renderPagination(currentPageMesPaiements, totalPages, 'locataire')}
    `;
}

// Fonctions utilitaires pour le statut
function getStatusClass(statut) {
    switch(statut) {
        case 'paid': return 'status-paid';
        case 'pending': return 'status-pending';
        case 'overdue': return 'status-overdue';
        case 'partiel': return 'status-partiel';
        default: return 'status-pending';
    }
}

function getStatusIcon(statut) {
    switch(statut) {
        case 'paid': return 'fa-check-circle';
        case 'pending': return 'fa-clock';
        case 'overdue': return 'fa-exclamation-triangle';
        case 'partiel': return 'fa-clock';
        default: return 'fa-clock';
    }
}

function getStatusText(statut) {
    switch(statut) {
        case 'paid': return 'Payé';
        case 'pending': return 'En attente';
        case 'overdue': return 'En retard';
        case 'partiel': return 'Partiel';
        default: return 'En attente';
    }
}

function getMethodeText(methode) {
    if (!methode) return '-';
    switch(methode) {
        case 'virement': return 'Virement';
        case 'cheque': return 'Chèque';
        case 'especes': return 'Espèces';
        case 'carte': return 'Carte bancaire';
        default: return methode;
    }
}

// Mise à jour des statistiques (Propriétaire)
function updateStats() {
    const totalRecu = paiements.filter(p => p.statut === 'paid').reduce((sum, p) => sum + p.montant, 0);
    const enAttente = paiements.filter(p => p.statut === 'pending').reduce((sum, p) => sum + p.montant, 0);
    let enRetard =  amountWaited - totalRecu;
    enRetard = enRetard > 0 ? enRetard : 0;
    const tauxRecouvrement = amountWaited > 0 ? Math.round((totalRecu / amountWaited) * 100) : 100;
    
    // Mettre à jour le contenu et ajuster la taille
    const totalRecuElement = document.getElementById('totalRecu');
    const enRetardElement = document.getElementById('enRetard');
    const tauxRecouvrementElement = document.getElementById('tauxRecouvrement');
    
    totalRecuElement.textContent = `FCFA ${totalRecu}`;
    enRetardElement.textContent = `FCFA ${enRetard}`;
    tauxRecouvrementElement.textContent = `${tauxRecouvrement}%`;
    
    // Ajuster la taille selon la longueur
    adjustStatNumberSize(totalRecuElement);
    adjustStatNumberSize(enRetardElement);
    adjustStatNumberSize(tauxRecouvrementElement);
}

// Mise à jour des statistiques (Locataire)
function updateStatsLocataire() {
    const totalPaye = mesPaiements.filter(p => p.statut === 'paid').reduce((sum, p) => sum + p.montant, 0);
    //const montantDu = mesPaiements.filter(p => p.statut === 'pending' || p.statut === 'overdue').reduce((sum, p) => sum + p.montant, 0);
    /*const montantDu = mesPaiements.filter(p => {
        const entryDate = new Date(p.entryDate);
        const dateActuelle = new Date();
        const monthDiff = dateActuelle.getMonth() - entryDate.getMonth();
        const totalToPay = p.monthlyRent * monthDiff;
        console.log('totalPay', totalToPay, p.monthlyRent, monthDiff);
        
        return totalToPay ;
    }).reduce((sum, p) => sum + p, 0);
    console.log('montantDu************', montantDu);*/
    let totalToPay = 0;
    
    proprietesLocataire.forEach(p => {
        const entryDate = new Date(p.tenant.entryDate);
        const dateActuelle = new Date();
        const monthDiff = dateActuelle.getMonth() - entryDate.getMonth();
        console.log('monthDiff:', monthDiff);
        
        totalToPay += p.monthlyRent * monthDiff;
    });
    
    const montantDu = (totalToPay > totalPaye) ? totalToPay - totalPaye : 0;
    //const prochainPaiement = mesPaiements.find(p => p.statut === 'pending')?.montant || 0;
    const prochainPaiement = proprietesLocataire.map(p => p.tenant.monthlyRent).reduce((sum, p) => sum + p, 0);
    const aJour = montantDu === 0 ? 'Oui' : 'Non';

    // Mettre à jour le contenu et ajuster la taille
    const totalPayeElement = document.getElementById('totalPaye');
    const montantDuElement = document.getElementById('montantDu');
    const aJourElement = document.getElementById('aJour');
    
    totalPayeElement.textContent = `FCFA ${totalPaye}`;
    montantDuElement.textContent = `FCFA ${montantDu}`;
    //document.getElementById('prochainPaiement').textContent = `FCFA ${prochainPaiement}`;
    aJourElement.textContent = aJour;
    
    // Ajuster la taille selon la longueur
    adjustStatNumberSize(totalPayeElement);
    adjustStatNumberSize(montantDuElement);
}

// Fonction pour formater les chiffres avec notation k, M, etc.
function adjustStatNumberSize(element) {
    if (!element) return;
    
    // Supprimer toutes les classes de longueur existantes
    element.removeAttribute('data-length');
    
    const originalText = element.textContent;
    const formattedText = formatNumber(originalText);
    
    // Mettre à jour le texte avec la notation abrégée
    element.textContent = formattedText;
    
    // Déterminer la catégorie de longueur basée sur le nouveau texte
    const textLength = formattedText.length;
    let lengthCategory;
    if (textLength <= 6) {
        lengthCategory = 'short';
    } else if (textLength <= 10) {
        lengthCategory = 'medium';
    } else if (textLength <= 15) {
        lengthCategory = 'long';
    } else {
        lengthCategory = 'very-long';
    }
    
    // Appliquer l'attribut data-length
    element.setAttribute('data-length', lengthCategory);
}

// Fonction pour formater les nombres avec notation abrégée
function formatNumber(text) {
    // Extraire le nombre du texte (enlever FCFA , %, etc.)
    const match = text.match(/[FCFA $]?([\d,]+\.?\d*)/);
    if (!match) return text;
    
    const number = parseFloat(match[1].replace(/,/g, ''));
    const prefix = text.includes('FCFA ') ? 'FCFA ' : text.includes('$') ? '$' : '';
    const suffix = text.includes('%') ? '%' : '';
    
    // Notation abrégée uniquement pour les valeurs >= 1 milliard
    if (number >= 1000000000) {
        return `${prefix}${(number / 1000000000).toFixed(1)}B${suffix}`;
    } else {
        return text; // Garder le format original pour tous les autres nombres
    }
}

// Gestion des modals
function openAddModal() {
    addPaiementModal.style.display = 'flex';
}

function openEffectuerModal() {
    effectuerPaiementModal.style.display = 'flex';
}

function closeAddPaiementModal() {
    addPaiementModal.style.display = 'none';
    addPaiementForm.reset();
}

function closeEffectuerPaiementModal() {
    effectuerPaiementModal.style.display = 'none';
    effectuerPaiementForm.reset();
}

// Charger les données pour les formulaires
function loadLocataires() {
    if (!window.paiementsData) return;
    
    const locataires = window.paiementsData.proprietaire.locataires;
    const locataireSelect = document.getElementById('locataire');
    
    /*if (locataireSelect) {
        locataires.forEach(locataire => {
            const option = document.createElement('option');
            option.value = locataire;
            option.textContent = locataire;
            locataireSelect.appendChild(option);
        });
    }*/
}

function loadProprietes() {
    if (!window.paiementsData) return;
    
    const proprietes = window.paiementsData.proprietaire.proprietes;
    const proprieteSelect = document.getElementById('proprietePaiement');
    
    if (proprieteSelect) {
        proprietes.forEach(propriete => {
            const option = document.createElement('option');
            option.value = propriete;
            option.textContent = propriete;
            proprieteSelect.appendChild(option);
        });
    }
}

function loadMois() {
    if (!window.paiementsData) return;
    
    const mois = window.paiementsData.proprietaire.mois;
    const moisSelects = [document.getElementById('mois'), document.getElementById('moisPaiement')];
    
    moisSelects.forEach(select => {
        if (select) {
            mois.forEach(m => {
                const option = document.createElement('option');
                option.value = m;
                option.textContent = m;
                select.appendChild(option);
            });
        }
    });
}

// Gestion des formulaires
function handleAddPaiement(e) {
    e.preventDefault();
    
    const formData = new FormData(addPaiementForm);
    const newPaiement = {
        id: paiements.length + 1,
        locataire: formData.get('locataire'),
        propriete: "Propriété à déterminer", // Sera lié au locataire
        montant: parseFloat(formData.get('montant')),
        datePaiement: formData.get('datePaiement'),
        mois: formData.get('mois'),
        statut: 'paid',
        methode: formData.get('methode'),
        commentaire: formData.get('commentaire')
    };

    paiements.push(newPaiement);
    // Trier les paiements par date après ajout
    paiements = sortPaiementsByDate(paiements);
    filteredPaiements = [...paiements];
    
    renderPaiements();
    updateStats();
    renderLocatairesEnRetard();
    closeAddPaiementModal();
}

function handleEffectuerPaiement(e) {
    e.preventDefault();
    
    const formData = new FormData(effectuerPaiementForm);
    const newPaiement = {
        id: mesPaiements.length + 1,
        propriete: formData.get('propriete'),
        montant: parseFloat(formData.get('montant')),
        datePaiement: formData.get('datePaiement'),
        mois: formData.get('mois'),
        statut: 'paid',
        methode: formData.get('methode'),
        commentaire: "Paiement effectué"
    };

    mesPaiements.push(newPaiement);
    // Trier les paiements par date après ajout
    mesPaiements = sortPaiementsByDate(mesPaiements);
    filteredMesPaiements = [...mesPaiements];
    
    renderMesPaiements();
    updateStatsLocataire();
    renderRetardPaiement();
    closeEffectuerPaiementModal();
}

// Fonctions d'action
function viewPaiement(id) {
    console.log(id);
    
    const paiement = paiements.find(p => p.id === id);
    console.log(paiement);
    
    if (paiement) {
        console.log('dedans');
        
        showPaiementDetails(paiement, 'proprietaire');
    }
}

function viewMesPaiement(id) {
    const paiement = mesPaiements.find(p => p.id === id);
    if (paiement) {
        showPaiementDetails(paiement, 'locataire');
    }
}

// Fonction pour afficher les détails d'un paiement dans une modal
function showPaiementDetails(paiement, type) {
    if (!paiementDetailsModal) {
        console.error('Modal de détails non trouvée');
        return;
    }

    // Mettre à jour le titre
    const titleElement = document.getElementById('paiementDetailsTitle');
    if (titleElement) {
        titleElement.textContent = `Détails du Paiement - ${paiement.locataire || paiement.propriete}`;
    }

    // Générer le contenu des détails
    const detailsContent = generatePaiementDetailsContent(paiement, type);
    
    // Mettre à jour le contenu de la modal
    const bodyElement = document.getElementById('paiementDetailsBody');
    if (bodyElement) {
        bodyElement.innerHTML = detailsContent;
    }

    // Afficher la modal
    paiementDetailsModal.classList.add('show');
}

// Fonction pour fermer la modal de détails
function closePaiementDetailsModalHandler() {
    if (paiementDetailsModal) {
        paiementDetailsModal.classList.remove('show');
    }
}

// Fonction pour générer le contenu des détails du paiement
function generatePaiementDetailsContent(paiement, type) {
    const isPaid = paiement.statut === 'paid';
    const isOverdue = paiement.statut === 'overdue';
    const isPending = paiement.statut === 'pending';

    return `
        <div class="paiement-details-content">
            <div class="detail-section">
                <h4>Informations générales</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>ID du paiement:</label>
                        <span class="detail-value">#${paiement.id}</span>
                    </div>
                    ${type === 'proprietaire' ? `
                        <div class="detail-item">
                            <label>Locataire:</label>
                            <span class="detail-value">${paiement.locataire}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <label>Propriété:</label>
                        <span class="detail-value">${paiement.propriete}</span>
                    </div>
                    <div class="detail-item">
                        <label>Montant:</label>
                        <span class="detail-value amount">FCFA ${paiement.montant}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4>Statut et dates</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Statut:</label>
                        <span class="detail-value">
                            <span class="status-badge ${getStatusClass(paiement.statut)}">
                                ${getStatusText(paiement.statut)}
                            </span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Date d'échéance:</label>
                        <span class="detail-value">${formatDate(paiement.dateEcheance)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date de paiement:</label>
                        <span class="detail-value">
                            ${paiement.datePaiement ? formatDate(paiement.datePaiement) : 'Non payé'}
                        </span>
                    </div>
                    ${isPaid && paiement.datePaiement ? `
                        <div class="detail-item">
                            <label>Délai de paiement:</label>
                            <span class="detail-value">
                                ${calculatePaymentDelay(paiement.dateEcheance, paiement.datePaiement)}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="detail-section">
                <h4>Informations de paiement</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Méthode de paiement:</label>
                        <span class="detail-value">${getMethodeText(paiement.methode)}</span>
                    </div>
                    ${paiement.reference ? `
                        <div class="detail-item">
                            <label>Référence:</label>
                            <span class="detail-value">${paiement.reference}</span>
                        </div>
                    ` : ''}
                    ${paiement.notes ? `
                        <div class="detail-item full-width">
                            <label>Notes:</label>
                            <span class="detail-value">${paiement.notes}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${isOverdue ? `
                <div class="detail-section warning">
                    <h4><i class="fas fa-exclamation-triangle"></i> Paiement en retard</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Jours de retard:</label>
                            <span class="detail-value overdue">
                                ${calculateDaysOverdue(paiement.dateEcheance)} jours
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Frais de retard:</label>
                            <span class="detail-value overdue">
                                FCFA ${calculateLateFees(paiement.dateEcheance, paiement.montant)}
                            </span>
                        </div>
                    </div>
                </div>
            ` : ''}

            <div class="detail-actions">
                ${isPending ? `
                    <button class="btn-primary" onclick="markAsPaid('${paiement.id}'); closePaiementDetailsModalHandler();">
                        <i class="fas fa-check"></i> Marquer comme payé
                    </button>
                ` : ''}
                <button class="btn-secondary" onclick="closePaiementDetailsModalHandler()">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
        </div>
    `;
}

// Fonctions utilitaires pour les calculs
function calculatePaymentDelay(dueDate, paymentDate) {
    const due = new Date(dueDate);
    const payment = new Date(paymentDate);
    const diffTime = payment - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
        return `${Math.abs(diffDays)} jours en avance`;
    } else {
        return `${diffDays} jours de retard`;
    }
}

function calculateDaysOverdue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
}

function calculateLateFees(dueDate, amount) {
    const daysOverdue = calculateDaysOverdue(dueDate);
    // Frais de retard : 5% par mois de retard, minimum 10FCFA 
    const monthsOverdue = Math.ceil(daysOverdue / 30);
    const lateFee = Math.max(10, amount * 0.05 * monthsOverdue);
    
    return Math.round(lateFee);
}

function markAsPaid(id) {
    const paiement = paiements.find(p => p.id === id);
    if (paiement) {
        paiement.statut = 'paid';
        paiement.datePaiement = new Date().toISOString().split('T')[0];
        paiement.methode = 'virement';
        
        renderPaiements();
        updateStats();
        renderLocatairesEnRetard();
    }
}

function effectuerPaiement(id) {
    // Rediriger vers la nouvelle page de paiement
    window.location.href = '/paiements/paiement';
}

// Fonctions pour les sections de retard
function renderLocatairesEnRetard() {
    const container = document.getElementById('locatairesEnRetardContainer');
    if (!container) return;
    
    if (!window.paiementsData || !window.paiementsData.proprietaire || !window.paiementsData.proprietaire.proprietesDueList) {
        container.innerHTML = '<div class="no-retard"><i class="fas fa-check-circle"></i><h3>Aucun retard</h3><p>Tous les locataires sont à jour</p></div>';
        return;
    }
    
    const proprietesDueList = window.paiementsData.proprietaire.proprietesDueList;
    
    if (proprietesDueList.length === 0) {
        container.innerHTML = '<div class="no-retard"><i class="fas fa-check-circle"></i><h3>Aucun retard</h3><p>Tous les locataires sont à jour</p></div>';
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Locataire</th>
                        <th>Propriété</th>
                        <th>Montant Payé</th>
                        <th>Montant Dû</th>
                        <th>Mois en Retard</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    proprietesDueList.forEach(item => {
        html += `
            <tr>
                <td>
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <span class="user-name">${item.user}</span>
                    </div>
                </td>
                <td>
                    <span class="property-name">${item.propriete}</span>
                </td>
                <td>
                    <span class="amount-paid">FCFA ${item.montantPaye}</span>
                </td>
                <td>
                    <span class="amount-due">FCFA ${item.montantDue}</span>
                </td>
                <td>
                    <span class="months-badge">${item.moisDue} mois</span>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function renderRetardPaiement() {
    const container = document.getElementById('retardPaiementContainer');
    if (!container) return;
    
    if (!window.paiementsData || !window.paiementsData.locataire || !window.paiementsData.locataire.locatairesDueList) {
        container.innerHTML = '<div class="no-retard"><i class="fas fa-check-circle"></i><h3>À jour</h3><p>Vous n\'avez aucun retard de paiement</p></div>';
        return;
    }
    
    const locatairesDueList = window.paiementsData.locataire.locatairesDueList;
    
    if (locatairesDueList.length === 0) {
        container.innerHTML = '<div class="no-retard"><i class="fas fa-check-circle"></i><h3>À jour</h3><p>Vous n\'avez aucun retard de paiement</p></div>';
        return;
    }
    
    let html = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Propriété</th>
                        <th>Montant Payé</th>
                        <th>Montant Dû</th>
                        <th>Mois en Retard</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    locatairesDueList.forEach(item => {
        html += `
            <tr>
                <td>
                    <div class="property-info">
                        <div class="property-icon">
                            <i class="fas fa-home"></i>
                        </div>
                        <span class="property-name">${item.propriete}</span>
                    </div>
                </td>
                <td>
                    <span class="amount-paid">FCFA ${item.montantPaye}</span>
                </td>
                <td>
                    <span class="amount-due">FCFA ${item.montantDue}</span>
                </td>
                <td>
                    <span class="months-badge">${item.moisDue} mois</span>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Fonctions utilitaires
function formatDate(dateString) {
    if (!dateString) return 'Non défini';
    //console.log(dateString);
    
    const date = new Date(dateString);
    //const date2 = new Date(date.getTime() + 1 * 60 * 60 * 1000);
    //console.log(date);
    //console.log(date2);
    
    return date.toLocaleDateString('fr-FR');
}

// ========================================
// Gestion du calendrier de paiement
// ========================================

// Initialiser les calendriers
function initializeCalendars() {
    if (!window.paiementsData) {
        console.error('Données des paiements non disponibles');
        return;
    }
    
    console.log('Initialisation des calendriers avec les données:', window.paiementsData);
    
    // Calendrier propriétaire
    if (window.paiementsData.proprietaire && window.paiementsData.proprietaire.calendrier) {
        console.log('Génération du calendrier propriétaire:', window.paiementsData.proprietaire.calendrier);
        generateCalendar('proprietairePaiementsCalendar', window.paiementsData.proprietaire.calendrier);
    } else {
        console.error('Données du calendrier propriétaire manquantes');
    }
    
    // Calendrier locataire
    if (window.paiementsData.locataire && window.paiementsData.locataire.calendrier) {
        console.log('Génération du calendrier locataire:', window.paiementsData.locataire.calendrier);
        generateCalendar('locatairePaiementsCalendar', window.paiementsData.locataire.calendrier);
    } else {
        console.error('Données du calendrier locataire manquantes');
    }
}

// Générer un calendrier
function generateCalendar(containerId, calendarData) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} non trouvé`);
        return;
    }

    console.log(`Génération du calendrier pour ${containerId}:`, calendarData);

    /*const months = [
        "Jan 2024", "Fév 2024", "Mar 2024", "Avr 2024", "Mai 2024", "Juin 2024",
        "Juil 2024", "Août 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Déc 2024"
    ];*/
    let months = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setDate(25);
        date.setMonth(date.getMonth() - i );
        date.setUTCDate(25);
        
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        months.push(monthYear);
    }
    
    console.log('📅 Mois attendus par le calendrier:', months);

    let calendarHTML = '';

    // En-tête du calendrier
    calendarHTML += '<div class="calendar-header">';
    calendarHTML += '<div>Locataire / Propriété</div>';
    months.forEach(month => {
        calendarHTML += `<div>${month}</div>`;
    });
    calendarHTML += '</div>';

    // Lignes du calendrier
    console.log('🔍 Structure complète des données du calendrier:', calendarData);
    console.log('🔍 Propriété paiements:', calendarData.paiements);
    
    if (calendarData.paiements && calendarData.paiements.length > 0) {
        console.log(`Nombre de paiements dans le calendrier: ${calendarData.paiements.length}`);
        calendarData.paiements.forEach(paiement => {
            // Vérifier s'il y a des impayés pour ce locataire
            const hasUnpaid = paiement.paiements.some(p => p.statut === 'en-retard');
            
            // Couleur de l'icône locataire
            const tenantIconColor = hasUnpaid ? '#ef4444' : '#3b82f6';
            
            // Tronquer les noms si trop longs
            const truncatedTenantName = paiement.locataire.length > 20 ? paiement.locataire.substring(0, 17) + '...' : paiement.locataire;
            const truncatedPropertyName = paiement.propriete.length > 25 ? paiement.propriete.substring(0, 22) + '...' : paiement.propriete;

            calendarHTML += '<div class="calendar-row">';
            
            // Informations du locataire
            calendarHTML += `<div class="tenant-info">
                <div class="tenant-name">
                    <i class="fas fa-user" style="color: ${tenantIconColor}; margin-right: 8px;"></i>
                    ${truncatedTenantName}
                </div>
                <div class="property-name">
                    <i class="fas fa-home" style="color: #64748b; margin-right: 8px;"></i>
                    ${truncatedPropertyName}
                </div>
            </div>`;

            // Cellules pour chaque mois
            console.log(`🔍 Recherche des paiements pour ${paiement.locataire} - ${paiement.propriete}:`, paiement.paiements);
            
            months.forEach(month => {
                const monthPayment = paiement.paiements.find(p => p.mois === month);
                let cellClass = 'calendar-cell empty';
                let cellContent = '';
                let tooltipData = '';

                if (monthPayment) {
                    console.log(`✅ Paiement trouvé pour ${month}:`, monthPayment);
                    let statusClass = '';
                    switch(monthPayment.statut) {
                        case 'payé':
                            statusClass = 'paid';
                            cellContent = '✓';
                            break;
                        case 'en-retard':
                            statusClass = 'overdue';
                            cellContent = '✗';
                            break;
                        case 'completé':
                            statusClass = 'future';
                            cellContent = '●';
                            break;
                        case 'partiel':
                            statusClass = 'partiel';
                            cellContent = '⚠';
                            break;
                        default:
                            statusClass = 'empty';
                            cellContent = '';
                    }
                    cellClass = `calendar-cell ${statusClass}`;
                    
                    tooltipData = `data-tenant="${paiement.locataire}" data-property="${paiement.propriete}" data-month="${month}" data-status="${monthPayment.statut}" data-amount="${monthPayment.montant}"`;
                } else {
                    console.log(`❌ Aucun paiement trouvé pour ${month}`);
                    console.log(`📋 Paiements disponibles:`, paiement.paiements.map(p => p.mois));
                }

                calendarHTML += `<div class="${cellClass}" ${tooltipData}>${cellContent}</div>`;
            });

            calendarHTML += '</div>';
        });
    } else {
        console.log('Aucun paiement trouvé dans les données du calendrier');
    }

    container.innerHTML = calendarHTML;

    // Ajouter les événements pour les tooltips
    addCalendarTooltips();
}

// ========================================
// Gestion des tooltips du calendrier
// ========================================

function addCalendarTooltips() {
    const calendarCells = document.querySelectorAll('.calendar-cell:not(.empty)');
    const tooltip = document.getElementById('calendarTooltip');

    if (!tooltip) {
        console.error('Tooltip non trouvé dans le DOM');
        return;
    }
    
    calendarCells.forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            const tenant = e.target.getAttribute('data-tenant');
            const property = e.target.getAttribute('data-property');
            const month = e.target.getAttribute('data-month');
            const status = e.target.getAttribute('data-status');
            const amount = e.target.getAttribute('data-amount');
            
            const statusText = status === 'payé' ? 'Payé' : status === 'en-retard' ? 'En retard' : status === 'partiel' ? 'Partiel' : 'Completé';
            const statusColor = status === 'payé' ? '#10b981' : status === 'en-retard' ? '#ef4444' : status === 'partiel' ? 'gray' : '#f59e0b';

            tooltip.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong style="color: ${statusColor};">${statusText}</strong>
                </div>
                <div><strong>Locataire:</strong> ${tenant}</div>
                <div><strong>Propriété:</strong> ${property}</div>
                <div><strong>Période:</strong> ${month}</div>
                <div><strong>Montant:</strong> FCFA ${amount}</div>
            `;

            tooltip.classList.add('show');

            // Positionner le tooltip
            const rect = e.target.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            
            // Calculer la position horizontale
            let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            
            // S'assurer que le tooltip ne sorte pas de l'écran
            if (left < 10) left = 10;
            if (left + tooltipWidth > window.innerWidth - 10) {
                left = window.innerWidth - tooltipWidth - 10;
            }
            
            // Calculer la position verticale
            let top = absoluteTop - tooltipHeight - 10;
            
            // Si le tooltip sort en haut, le positionner en dessous
            if (rect.top < 250) {
                top = absoluteTop + 40;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
        });

        cell.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    });
}

// ========================================
// Fonctions de pagination
// ========================================

function renderPagination(currentPage, totalPages, type) {
    if (totalPages <= 1) return '';
    
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, type === 'proprietaire' ? filteredPaiements.length : filteredMesPaiements.length);
    const totalItems = type === 'proprietaire' ? filteredPaiements.length : filteredMesPaiements.length;
    
    if (totalPages === 0) {
        return `
        <div class="pagination">
            <div class="pagination-info">
                0-0 sur 0 éléments
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn disabled" disabled>
                    Précédent
                </button>
                <span class="pagination-dots">...</span>
                <button class="pagination-btn disabled" disabled>
                    Suivant
                </button>
            </div>
        </div>
    `;
    }

    let pageButtons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        pageButtons += `
            <button class="pagination-btn" onclick="changePage(1, '${type}')">1</button>
            ${startPage > 2 ? '<span class="pagination-dots">...</span>' : ''}
        `;
    }

    for (let i = startPage; i <= endPage; i++) {
        pageButtons += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i}, '${type}')">${i}</button>
        `;
    }

    if (endPage < totalPages) {
        pageButtons += `
            ${endPage < totalPages - 1 ? '<span class="pagination-dots">...</span>' : ''}
            <button class="pagination-btn" onclick="changePage(${totalPages}, '${type}')">${totalPages}</button>
        `;
    }

    return `
        <div class="pagination">
            <div class="pagination-info">
                ${startItem}-${endItem} sur ${totalItems} éléments
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1}, '${type}')">
                    Précédent
                </button>
                ${pageButtons}
                <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1}, '${type}')">
                    Suivant
                </button>
            </div>
        </div>
    `;
}

function changePage(page, type) {
    if (type === 'proprietaire') {
        currentPage = page;
        renderPaiements();
    } else {
        currentPageMesPaiements = page;
        renderMesPaiements();
    }
}

// ========================================
// Fonctions globales pour l'accessibilité
// ========================================

// ========================================
// Gestion du modal paiement en espèces
// ========================================

// Éléments DOM pour le modal paiement en espèces
let especesPaiementModal;
let closeEspecesModal;
let cancelEspeces;
let especesPaiementForm;
let proprieteEspeces;
let moisEspeces;
let dateEspeces;
let commentaireEspeces;
let confirmEspeces;

// Initialiser les éléments DOM pour le modal paiement en espèces
function initializeEspecesModalElements() {
    especesPaiementModal = document.getElementById('especesPaiementModal');
    closeEspecesModal = document.getElementById('closeEspecesModal');
    cancelEspeces = document.getElementById('cancelEspeces');
    especesPaiementForm = document.getElementById('especesPaiementForm');
    proprieteEspeces = document.getElementById('proprieteEspeces');
    moisEspeces = document.getElementById('moisEspeces');
    dateEspeces = document.getElementById('dateEspeces');
    commentaireEspeces = document.getElementById('commentaireEspeces');
    confirmEspeces = document.getElementById('confirmEspeces');
}

// Ouvrir le modal paiement en espèces
function openEspecesModal() {
    if (especesPaiementModal) {
        especesPaiementModal.classList.add('show');
        loadProprietesForEspeces();
        // Définir la date d'aujourd'hui par défaut
        if (dateEspeces) {
            const today = new Date().toISOString().split('T')[0];
            dateEspeces.value = today;
        }
        
        // Ajouter un écouteur pour le champ nombre de mois
        if (moisEspeces) {
            moisEspeces.addEventListener('input', updateTotalAmount);
        }
    }
}

// Fonction pour mettre à jour le montant total
function updateTotalAmount() {
    const selectedPropertyId = proprieteEspeces.value;
    const months = parseInt(moisEspeces.value) || 0;
    
    if (selectedPropertyId && months > 0) {
        const selectedProperty = availableProperties.find(p => p.id === selectedPropertyId);
        if (selectedProperty) {
            const monthlyRent = selectedProperty.monthlyRent || 0;
            const totalAmount = monthlyRent * months;
            
            // Mettre à jour l'affichage du montant total
            const proprieteInfoSection = document.getElementById('proprieteInfoSection');
            if (proprieteInfoSection) {
                const totalElement = proprieteInfoSection.querySelector('.total');
                const monthsLabel = proprieteInfoSection.querySelector('.highlight .info-label');
                
                if (totalElement) {
                    totalElement.textContent = `${totalAmount.toLocaleString()} FCFA`;
                }
                if (monthsLabel) {
                    monthsLabel.textContent = `Montant total (${months} mois):`;
                }
                
                // Afficher la section highlight si elle n'existe pas
                let highlightSection = proprieteInfoSection.querySelector('.highlight');
                if (!highlightSection && months > 0) {
                    const infoContent = proprieteInfoSection.querySelector('.info-content');
                    if (infoContent) {
                        const highlightDiv = document.createElement('div');
                        highlightDiv.className = 'info-item highlight';
                        highlightDiv.innerHTML = `
                            <span class="info-label">Montant total (${months} mois):</span>
                            <span class="info-value amount total">${totalAmount.toLocaleString()} FCFA</span>
                        `;
                        infoContent.appendChild(highlightDiv);
                    }
                }
            }
        }
    }
}

// Fermer le modal paiement en espèces
function closeEspecesModalHandler() {
    if (especesPaiementModal) {
        especesPaiementModal.classList.remove('show');
        resetEspecesForm();
    }
}

// Annuler le paiement en espèces
function cancelEspecesHandler() {
    closeEspecesModalHandler();
}

// Réinitialiser le formulaire paiement en espèces
function resetEspecesForm() {
    if (especesPaiementForm) {
        especesPaiementForm.reset();
    }
    // Masquer les informations de la propriété
    const proprieteInfoSection = document.getElementById('proprieteInfoSection');
    if (proprieteInfoSection) {
        proprieteInfoSection.style.display = 'none';
    }
}

// Variable pour stocker les propriétés disponibles
let availableProperties = [];
let tenantsObject = {};

// Charger les propriétés pour le paiement en espèces
async function loadProprietesForEspeces() {
    try {
        const response = await fetch('/paiements/available-properties');
        const data = await response.json();
        
        if (data.success && proprieteEspeces) {
            // Stocker les propriétés pour utilisation ultérieure
            availableProperties = data.properties || [];
            tenantsObject = data.tenantsObject || {};
            proprieteEspeces.innerHTML = '<option value="">Sélectionner une propriété</option>';
            
            if (data.properties && Array.isArray(data.properties)) {
                data.properties.forEach(property => {
                    const option = document.createElement('option');
                    option.value = property.id;
                    option.textContent = property.name;
                    proprieteEspeces.appendChild(option);
                });
            } else {
                console.warn('Aucune propriété disponible trouvée');
                showNotification('Aucune propriété disponible', 'warning');
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des propriétés:', error);
        showNotification('Erreur lors du chargement des propriétés', 'error');
    }
}

// Gérer le changement de propriété
function handleProprieteEspecesChange() {
    const selectedPropertyId = proprieteEspeces.value;
    const proprieteInfoSection = document.getElementById('proprieteInfoSection');
    
    if (selectedPropertyId && proprieteInfoSection) {
        // Trouver la propriété sélectionnée dans les propriétés disponibles
        const selectedProperty = availableProperties.find(p => p.id === selectedPropertyId);
        
        if (selectedProperty) {
            // Extraire les informations du locataire
            const tenantObject = tenantsObject[selectedProperty.tenant.userId];
            const tenantName = tenantObject.firstName + ' ' + tenantObject.lastName;

            const tenant = selectedProperty.tenant;
            
            const monthlyRent = selectedProperty.monthlyRent || 0;
            const entryDate = tenant && tenant.entryDate ? 
                new Date(tenant.entryDate).toLocaleDateString('fr-FR') : 
                'Non défini';
            
            // Calculer le montant total si des mois sont saisis
            const monthsInput = document.getElementById('moisEspeces');
            const months = monthsInput ? parseInt(monthsInput.value) || 0 : 0;
            const totalAmount = monthlyRent * months;
            
            proprieteInfoSection.innerHTML = `
                <div class="info-card">
                    <div class="info-header">
                        <i class="fas fa-home"></i>
                        <h3>Informations de la propriété</h3>
                    </div>
                    <div class="info-content">
                        <div class="info-item">
                            <span class="info-label">Propriété:</span>
                            <span class="info-value">${selectedProperty.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Locataire:</span>
                            <span class="info-value">${tenantName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Date d'entrée:</span>
                            <span class="info-value">${entryDate}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Loyer mensuel:</span>
                            <span class="info-value amount">${monthlyRent.toLocaleString()} FCFA</span>
                        </div>
                        ${months > 0 ? `
                            <div class="info-item highlight">
                                <span class="info-label">Montant total (${months} mois):</span>
                                <span class="info-value amount total">${totalAmount.toLocaleString()} FCFA</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            proprieteInfoSection.style.display = 'block';
            
            // Mettre à jour le montant total si des mois sont saisis
            if (monthsInput) {
                monthsInput.addEventListener('input', function() {
                    const newMonths = parseInt(this.value) || 0;
                    const newTotal = monthlyRent * newMonths;
                    const totalElement = proprieteInfoSection.querySelector('.total');
                    if (totalElement && newMonths > 0) {
                        totalElement.textContent = `${newTotal.toLocaleString()} FCFA`;
                        const monthsLabel = proprieteInfoSection.querySelector('.highlight .info-label');
                        if (monthsLabel) {
                            monthsLabel.textContent = `Montant total (${newMonths} mois):`;
                        }
                    }
                });
            }
        } else {
            console.warn('Propriété sélectionnée non trouvée dans les données disponibles');
            proprieteInfoSection.style.display = 'none';
        }
    } else if (proprieteInfoSection) {
        proprieteInfoSection.style.display = 'none';
    }
}

// Valider le paiement en espèces
function validateEspecesPayment() {
    if (!proprieteEspeces.value) {
        showNotification('Veuillez sélectionner une propriété', 'error');
        return false;
    }
    
    if (!moisEspeces.value || parseInt(moisEspeces.value) <= 0) {
        showNotification('Veuillez entrer un nombre de mois valide', 'error');
        return false;
    }
    
    if (!dateEspeces.value) {
        showNotification('Veuillez sélectionner une date', 'error');
        return false;
    }
    
    return true;
}

// Confirmer le paiement en espèces
function confirmEspecesPayment() {
    if (!validateEspecesPayment()) {
        return;
    }
    
    // Récupérer les données correctes
    const selectedProperty = availableProperties.find(p => p.id === proprieteEspeces.value);
    if (!selectedProperty) {
        showNotification('Propriété sélectionnée non trouvée', 'error');
        return;
    }
    
    const propertyName = selectedProperty.name;
    const tenantObject = tenantsObject[selectedProperty.tenant.userId];
    const tenantName = tenantObject.firstName + ' ' + tenantObject.lastName;
    
    const months = parseInt(moisEspeces.value);
    const monthlyRent = selectedProperty.monthlyRent || 0;
    const totalAmount = monthlyRent * months;
    const date = dateEspeces.value;
    const commentaire = commentaireEspeces.value || 'Aucun commentaire';
    
    // Afficher le modal de confirmation personnalisé
    showConfirmationModal({
        title: 'Confirmer le paiement en espèces',
        content: `
            <div class="confirmation-content">
                <div class="confirmation-section">
                    <h4>Détails du paiement</h4>
                    <div class="confirmation-details">
                        <div class="detail-row">
                            <span class="label">Propriété:</span>
                            <span class="value">${propertyName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Locataire:</span>
                            <span class="value">${tenantName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Nombre de mois:</span>
                            <span class="value">${months}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Loyer mensuel:</span>
                            <span class="value">${monthlyRent.toLocaleString()} FCFA</span>
                        </div>
                        <div class="detail-row highlight">
                            <span class="label">Montant total:</span>
                            <span class="value">${totalAmount.toLocaleString()} FCFA</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date de réception:</span>
                            <span class="value">${new Date(date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Commentaire:</span>
                            <span class="value">${commentaire}</span>
                        </div>
                    </div>
                </div>
            </div>
        `,
        onConfirm: () => {
            sendEspecesPaymentRequest();
            closeConfirmationModal();
        },
        onCancel: () => {
            closeConfirmationModal();
        }
    });
}

// Envoyer la requête de paiement en espèces
async function sendEspecesPaymentRequest() {
    const confirmButton = document.querySelector('#confirmationModal .btn-primary');
    const validateButton = document.querySelector('#confirmEspeces');
    const originalButtonText = confirmButton ? confirmButton.innerHTML : '';
    const originalButtonTextValidate = validateButton ? validateButton.innerHTML : '';
    
    try {
        // Afficher le loader et désactiver le bouton
        if (confirmButton) {
            showPaymentLoader(confirmButton);
            showPaymentLoader(validateButton);
        }
        
        const paymentData = {
            propertyId: proprieteEspeces.value,
            months: parseInt(moisEspeces.value),
            date: dateEspeces.value,
            commentaire: commentaireEspeces.value || ''
        };
       
        const response = await fetch('/paiements/process-especes-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(result.message, 'success');
            closeEspecesModalHandler();
            // Recharger la page pour afficher le nouveau paiement
            location.reload();
        } else {
            showNotification(result.message, 'error');
            // Restaurer le bouton en cas d'erreur
            if (confirmButton) {
                restorePaymentButton(confirmButton, originalButtonText);
                restorePaymentButton(validateButton, originalButtonTextValidate);
            }
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du paiement:', error);
        showNotification('Erreur lors de l\'envoi du paiement', 'error');
        // Restaurer le bouton en cas d'erreur
        if (confirmButton) {
            restorePaymentButton(confirmButton, originalButtonText);
        }
    }
}

// Afficher le loader de paiement
function showPaymentLoader(button) {
    button.disabled = true;
    button.innerHTML = `
        <div class="payment-loader">
            <div class="spinner"></div>
            <span>Traitement en cours...</span>
        </div>
    `;
    button.classList.add('loading');
}

// Restaurer le bouton de paiement
function restorePaymentButton(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
    button.classList.remove('loading');
}

// Afficher une notification
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

    // Afficher la notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Masquer et supprimer après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Fonction pour obtenir l'icône selon le type de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': 
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

// Rendre les fonctions accessibles globalement
window.changePage = changePage;
window.viewPaiement = viewPaiement;
window.viewMesPaiement = viewMesPaiement;
window.markAsPaid = markAsPaid;
window.effectuerPaiement = effectuerPaiement; 
window.openEspecesModal = openEspecesModal;
window.closeEspecesModalHandler = closeEspecesModalHandler;
window.cancelEspecesHandler = cancelEspecesHandler;
window.handleProprieteEspecesChange = handleProprieteEspecesChange;
window.confirmEspecesPayment = confirmEspecesPayment; 