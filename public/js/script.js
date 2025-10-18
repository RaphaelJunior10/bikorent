// ========================================
// BikoRent Dashboard - JavaScript
// ========================================

// Données simulées pour le calendrier de paiement
const calendarData = {
    proprietaire: {
        tenants: [
            { name: "Marie Dubois", property: "Appartement T3 - Rue de la Paix", rent: 600 },
            { name: "Jean Martin", property: "Studio - Avenue Victor Hugo", rent: 650 },
            { name: "Sophie Bernard", property: "Maison T4 - Boulevard Central", rent: 900 },
            { name: "Pierre Durand", property: "Appartement T2 - Place du Marché", rent: 750 },
            { name: "Claire Moreau", property: "Studio - Rue des Lilas", rent: 550 }
        ],
        payments: {
            "Marie Dubois": {
                "Jan 2024": { status: "paid", amount: 600 },
                "Fév 2024": { status: "paid", amount: 600 },
                "Mar 2024": { status: "unpaid", amount: 600 },
                "Avr 2024": { status: "unpaid", amount: 600 },
                "Mai 2024": { status: "paid", amount: 600 },
                "Juin 2024": { status: "paid", amount: 600 },
                "Juil 2024": { status: "paid", amount: 600 },
                "Août 2024": { status: "paid", amount: 600 },
                "Sep 2024": { status: "paid", amount: 600 },
                "Oct 2024": { status: "paid", amount: 600 },
                "Nov 2024": { status: "paid", amount: 600 },
                "Déc 2024": { status: "paid", amount: 600 }
            },
            "Jean Martin": {
                "Jan 2024": { status: "paid", amount: 650 },
                "Fév 2024": { status: "paid", amount: 650 },
                "Mar 2024": { status: "paid", amount: 650 },
                "Avr 2024": { status: "unpaid", amount: 650 },
                "Mai 2024": { status: "paid", amount: 650 },
                "Juin 2024": { status: "paid", amount: 650 },
                "Juil 2024": { status: "paid", amount: 650 },
                "Août 2024": { status: "paid", amount: 650 },
                "Sep 2024": { status: "paid", amount: 650 },
                "Oct 2024": { status: "paid", amount: 650 },
                "Nov 2024": { status: "paid", amount: 650 },
                "Déc 2024": { status: "paid", amount: 650 }
            },
            "Sophie Bernard": {
                "Jan 2024": { status: "paid", amount: 900 },
                "Fév 2024": { status: "paid", amount: 900 },
                "Mar 2024": { status: "unpaid", amount: 900 },
                "Avr 2024": { status: "unpaid", amount: 900 },
                "Mai 2024": { status: "unpaid", amount: 900 },
                "Juin 2024": { status: "paid", amount: 900 },
                "Juil 2024": { status: "paid", amount: 900 },
                "Août 2024": { status: "paid", amount: 900 },
                "Sep 2024": { status: "paid", amount: 900 },
                "Oct 2024": { status: "paid", amount: 900 },
                "Nov 2024": { status: "paid", amount: 900 },
                "Déc 2024": { status: "paid", amount: 900 }
            },
            "Pierre Durand": {
                "Jan 2024": { status: "paid", amount: 750 },
                "Fév 2024": { status: "paid", amount: 750 },
                "Mar 2024": { status: "paid", amount: 750 },
                "Avr 2024": { status: "paid", amount: 750 },
                "Mai 2024": { status: "paid", amount: 750 },
                "Juin 2024": { status: "paid", amount: 750 },
                "Juil 2024": { status: "paid", amount: 750 },
                "Août 2024": { status: "paid", amount: 750 },
                "Sep 2024": { status: "paid", amount: 750 },
                "Oct 2024": { status: "paid", amount: 750 },
                "Nov 2024": { status: "paid", amount: 750 },
                "Déc 2024": { status: "paid", amount: 750 }
            },
            "Claire Moreau": {
                "Jan 2024": { status: "paid", amount: 550 },
                "Fév 2024": { status: "paid", amount: 550 },
                "Mar 2024": { status: "paid", amount: 550 },
                "Avr 2024": { status: "paid", amount: 550 },
                "Mai 2024": { status: "paid", amount: 550 },
                "Juin 2024": { status: "paid", amount: 550 },
                "Juil 2024": { status: "paid", amount: 550 },
                "Août 2024": { status: "paid", amount: 550 },
                "Sep 2024": { status: "paid", amount: 550 },
                "Oct 2024": { status: "paid", amount: 550 },
                "Nov 2024": { status: "paid", amount: 550 },
                "Déc 2024": { status: "paid", amount: 550 }
            }
        }
    },
    locataire: {
        properties: [
            { name: "Appartement T3 - Rue de la Paix", rent: 600 },
            { name: "Studio - Avenue Victor Hugo", rent: 650 }
        ],
        payments: {
            "Appartement T3 - Rue de la Paix": {
                "Jan 2024": { status: "paid", amount: 600 },
                "Fév 2024": { status: "paid", amount: 600 },
                "Mar 2024": { status: "unpaid", amount: 600 },
                "Avr 2024": { status: "unpaid", amount: 600 },
                "Mai 2024": { status: "paid", amount: 600 },
                "Juin 2024": { status: "paid", amount: 600 },
                "Juil 2024": { status: "paid", amount: 600 },
                "Août 2024": { status: "paid", amount: 600 },
                "Sep 2024": { status: "paid", amount: 600 },
                "Oct 2024": { status: "paid", amount: 600 },
                "Nov 2024": { status: "paid", amount: 600 },
                "Déc 2024": { status: "paid", amount: 600 }
            },
            "Studio - Avenue Victor Hugo": {
                "Jan 2024": { status: "paid", amount: 650 },
                "Fév 2024": { status: "paid", amount: 650 },
                "Mar 2024": { status: "paid", amount: 650 },
                "Avr 2024": { status: "unpaid", amount: 650 },
                "Mai 2024": { status: "paid", amount: 650 },
                "Juin 2024": { status: "paid", amount: 650 },
                "Juil 2024": { status: "paid", amount: 650 },
                "Août 2024": { status: "paid", amount: 650 },
                "Sep 2024": { status: "paid", amount: 650 },
                "Oct 2024": { status: "paid", amount: 650 },
                "Nov 2024": { status: "paid", amount: 650 },
                "Déc 2024": { status: "paid", amount: 650 }
            }
        }
    }
};

// Mois pour l'affichage
const months = [
    "Jan 2024", "Fév 2024", "Mar 2024", "Avr 2024", "Mai 2024", "Juin 2024",
    "Juil 2024", "Août 2024", "Sep 2024", "Oct 2024", "Nov 2024", "Déc 2024"
];

// ========================================
// Gestion du menu latéral
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

// ========================================
// Gestion des onglets
// ========================================

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Retirer la classe active de tous les boutons et contenus
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // Régénérer le calendrier pour l'onglet actif
            generateCalendar(targetTab);
        });
    });
}

// ========================================
// Génération du calendrier de paiement
// ========================================

function generateCalendar(tabType) {
    const calendarContainer = document.getElementById(`${tabType}Calendar`);
    if (!calendarContainer) return;

    const data = calendarData[tabType];
    const items = tabType === 'proprietaire' ? data.tenants : data.properties;
    const payments = data.payments;

    let calendarHTML = '';

    // En-tête du calendrier
    calendarHTML += '<div class="calendar-header">';
    calendarHTML += '<div>' + (tabType === 'proprietaire' ? 'Locataire / Propriété' : 'Propriété') + '</div>';
    months.forEach(month => {
        calendarHTML += `<div>${month}</div>`;
    });
    calendarHTML += '</div>';

    // Lignes du calendrier
    items.forEach(item => {
        const itemName = tabType === 'proprietaire' ? item.name : item.name;
        const propertyName = tabType === 'proprietaire' ? item.property : '';
        
        // Vérifier s'il y a des impayés pour ce locataire
        const hasUnpaid = tabType === 'proprietaire' ? 
            Object.values(payments[itemName] || {}).some(payment => payment.status === 'unpaid') : 
            Object.values(payments[itemName] || {}).some(payment => payment.status === 'unpaid');
        
        // Couleur de l'icône locataire
        const tenantIconColor = hasUnpaid ? '#ef4444' : '#3b82f6';
        
        // Tronquer les noms si trop longs
        const truncatedTenantName = itemName.length > 20 ? itemName.substring(0, 17) + '...' : itemName;
        const truncatedPropertyName = propertyName.length > 25 ? propertyName.substring(0, 22) + '...' : propertyName;

        calendarHTML += '<div class="calendar-row">';
        
        if (tabType === 'proprietaire') {
            // Ligne 1: Nom du locataire avec icône
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
        } else {
            // Pour l'onglet locataire, afficher simplement le nom de la propriété
            calendarHTML += `<div class="tenant-info">
                <div class="property-name">
                    <i class="fas fa-home" style="color: #3b82f6; margin-right: 8px;"></i>
                    ${truncatedTenantName}
                </div>
            </div>`;
        }

        months.forEach(month => {
            const payment = payments[itemName]?.[month];
            let cellClass = 'calendar-cell empty';
            let cellContent = '';
            let tooltipData = '';

            if (payment) {
                cellClass = `calendar-cell ${payment.status}`;
                cellContent = payment.status === 'paid' ? '✓' : '✗';
                
                // Correction pour les données du tooltip
                const tenantName = tabType === 'proprietaire' ? itemName : 'Vous';
                const propertyNameForTooltip = tabType === 'proprietaire' ? item.property : itemName;
                
                tooltipData = `data-tenant="${tenantName}" data-property="${propertyNameForTooltip}" data-month="${month}" data-status="${payment.status}" data-amount="${payment.amount}"`;
            }

            calendarHTML += `<div class="${cellClass}" ${tooltipData}>${cellContent}</div>`;
        });

        calendarHTML += '</div>';
    });

    calendarContainer.innerHTML = calendarHTML;

    // Ajouter les événements pour les tooltips
    addCalendarTooltips();
}

// ========================================
// Gestion des tooltips du calendrier
// ========================================

function addCalendarTooltips() {
    const calendarCells = document.querySelectorAll('.calendar-cell:not(.empty)');
    const tooltip = document.getElementById('calendarTooltip');

    calendarCells.forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            const tenant = e.target.getAttribute('data-tenant');
            const property = e.target.getAttribute('data-property');
            const month = e.target.getAttribute('data-month');
            const status = e.target.getAttribute('data-status');
            const amount = e.target.getAttribute('data-amount');
            
            const statusText = status === 'paid' ? 'Payé' : 'Impayé';
            const statusColor = status === 'paid' ? '#10b981' : '#ef4444';

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

            const absoluteTop = rect.top + window.scrollY; //Position du rect par rapport au top de la page
            
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
            let top = absoluteTop - tooltipHeight - 10; // Positionner au dessus de l'élément
            
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
// Animations et effets visuels
// ========================================

function initAnimations() {
    // Animation des cartes statistiques
    const statCards = document.querySelectorAll('.stat-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    statCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Animation des éléments d'activité
    const activityItems = document.querySelectorAll('.activity-item');
    
    const activityObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateX(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });

    activityItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        activityObserver.observe(item);
    });
}

// ========================================
// Gestion des boutons d'action
// ========================================

function initActionButtons() {
    // Boutons "Contacter" dans le tableau
    const contactBtns = document.querySelectorAll('.btn-small');
    
    contactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const row = btn.closest('tr');
            const tenantName = row.cells[0].textContent;
            const propertyName = row.cells[1].textContent;
            
            // Simulation d'une action de contact
            alert(`Action de contact pour ${tenantName} - ${propertyName}\n\nCette fonctionnalité sera implémentée dans une version future.`);
        });
    });
}

// ========================================
// Gestion responsive
// ========================================

function initResponsive() {
    // Ajuster le calendrier selon la taille d'écran
    function adjustCalendar() {
        const calendarGrids = document.querySelectorAll('.calendar-grid');
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        calendarGrids.forEach(grid => {
            const headers = grid.querySelectorAll('.calendar-header > div');
            const rows = grid.querySelectorAll('.calendar-row > div');

            // Toujours afficher tous les mois, le scroll horizontal s'occupera du reste
            headers.forEach(header => header.style.display = 'block');
            rows.forEach(cell => cell.style.display = 'block');
        });
    }

    // Appeler la fonction au chargement et au redimensionnement
    adjustCalendar();
    window.addEventListener('resize', adjustCalendar);
}

// ========================================
// Initialisation de l'application
// ========================================

function initApp() {
    // Attendre que le DOM soit chargé
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 BikoRent Dashboard initialisé');

        // Initialiser toutes les fonctionnalités
        initTabs();
        initAnimations();
        initActionButtons();
        initResponsive();
        initSidebar(); // Initialiser le sidebar
        markActivePage(); // Marquer la page active

        // Générer le calendrier initial (onglet propriétaire par défaut)
        generateCalendar('proprietaire');

        // Ajouter un effet de chargement
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    });
}

// ========================================
// Fonctions utilitaires
// ========================================

// Formater les montants
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Formater les dates
function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Calculer les statistiques
function calculateStats(tabType) {
    const data = calendarData[tabType];
    let stats = {
        totalProperties: 0,
        rentedProperties: 0,
        totalRevenue: 0,
        unpaidCount: 0
    };

    if (tabType === 'proprietaire') {
        stats.totalProperties = data.tenants.length;
        stats.rentedProperties = data.tenants.length;
        
        data.tenants.forEach(tenant => {
            stats.totalRevenue += tenant.rent;
            
            // Compter les mois impayés
            const tenantPayments = data.payments[tenant.name];
            if (tenantPayments) {
                Object.values(tenantPayments).forEach(payment => {
                    if (payment.status === 'unpaid') {
                        stats.unpaidCount++;
                    }
                });
            }
        });
    } else {
        stats.totalProperties = data.properties.length;
        stats.rentedProperties = data.properties.length;
        
        data.properties.forEach(property => {
            stats.totalRevenue += property.rent;
            
            // Compter les mois impayés
            const propertyPayments = data.payments[property.name];
            if (propertyPayments) {
                Object.values(propertyPayments).forEach(payment => {
                    if (payment.status === 'unpaid') {
                        stats.unpaidCount++;
                    }
                });
            }
        });
    }

    return stats;
}

// Démarrer l'application
initApp();
