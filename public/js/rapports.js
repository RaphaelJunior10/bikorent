// ========================================
// BikoRent - Rapports et Analyses
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

// Données des rapports (chargées depuis le contrôleur)
let rapportsData = {};

// Variable globale pour suivre la période actuelle
window.currentPeriode = 12; // Par défaut 12 mois

// Données de fallback en cas de problème
const fallbackData = {
    proprietaire: {
        proprietes: [
            {
                nom: "Appartement T3 - Rue de la Paix",
                type: "appartement",
                loyer: 600,
                locataire: "Marie Dubois",
                paiements: {
                    "janvier 2019": { paye: true, montant: 600 },
                    "février 2019": { paye: true, montant: 600 },
                    "mars 2019": { paye: true, montant: 600 },
                    "avril 2019": { paye: true, montant: 600 },
                    "mai 2019": { paye: true, montant: 600 },
                    "juin 2019": { paye: true, montant: 600 },
                    "juillet 2019": { paye: true, montant: 600 },
                    "août 2019": { paye: true, montant: 600 },
                    "septembre 2019": { paye: true, montant: 600 },
                    "octobre 2019": { paye: true, montant: 600 },
                    "novembre 2019": { paye: true, montant: 600 },
                    "décembre 2019": { paye: true, montant: 600 },
                    "janvier 2020": { paye: true, montant: 600 },
                    "février 2020": { paye: true, montant: 600 },
                    "mars 2020": { paye: true, montant: 600 },
                    "avril 2020": { paye: true, montant: 600 },
                    "mai 2020": { paye: true, montant: 600 },
                    "juin 2020": { paye: true, montant: 600 },
                    "juillet 2020": { paye: true, montant: 600 },
                    "août 2020": { paye: true, montant: 600 },
                    "septembre 2020": { paye: true, montant: 600 },
                    "octobre 2020": { paye: true, montant: 600 },
                    "novembre 2020": { paye: true, montant: 600 },
                    "décembre 2020": { paye: true, montant: 600 },
                    "janvier 2021": { paye: true, montant: 600 },
                    "février 2021": { paye: true, montant: 600 },
                    "mars 2021": { paye: true, montant: 600 },
                    "avril 2021": { paye: true, montant: 600 },
                    "mai 2021": { paye: true, montant: 600 },
                    "juin 2021": { paye: true, montant: 600 },
                    "juillet 2021": { paye: true, montant: 600 },
                    "août 2021": { paye: true, montant: 600 },
                    "septembre 2021": { paye: true, montant: 600 },
                    "octobre 2021": { paye: true, montant: 600 },
                    "novembre 2021": { paye: true, montant: 600 },
                    "décembre 2021": { paye: true, montant: 600 },
                    "janvier 2022": { paye: true, montant: 600 },
                    "février 2022": { paye: true, montant: 600 },
                    "mars 2022": { paye: true, montant: 600 },
                    "avril 2022": { paye: true, montant: 600 },
                    "mai 2022": { paye: true, montant: 600 },
                    "juin 2022": { paye: true, montant: 600 },
                    "juillet 2022": { paye: true, montant: 600 },
                    "août 2022": { paye: true, montant: 600 },
                    "septembre 2022": { paye: true, montant: 600 },
                    "octobre 2022": { paye: true, montant: 600 },
                    "novembre 2022": { paye: true, montant: 600 },
                    "décembre 2022": { paye: true, montant: 600 },
                    "janvier 2023": { paye: true, montant: 600 },
                    "février 2023": { paye: true, montant: 600 },
                    "mars 2023": { paye: true, montant: 600 },
                    "avril 2023": { paye: false, montant: 600 },
                    "mai 2023": { paye: true, montant: 600 },
                    "juin 2023": { paye: true, montant: 600 },
                    "juillet 2023": { paye: true, montant: 600 },
                    "août 2023": { paye: true, montant: 600 },
                    "septembre 2023": { paye: true, montant: 600 },
                    "octobre 2023": { paye: true, montant: 600 },
                    "novembre 2023": { paye: true, montant: 600 },
                    "décembre 2023": { paye: true, montant: 600 },
                    "janvier 2024": { paye: true, montant: 600 },
                    "février 2024": { paye: false, montant: 600 },
                    "mars 2024": { paye: false, montant: 600 },
                    "avril 2024": { paye: false, montant: 600 },
                    "mai 2024": { paye: true, montant: 600 },
                    "juin 2024": { paye: true, montant: 600 },
                    "juillet 2024": { paye: true, montant: 600 },
                    "août 2024": { paye: true, montant: 600 },
                    "septembre 2024": { paye: true, montant: 600 },
                    "octobre 2024": { paye: true, montant: 600 },
                    "novembre 2024": { paye: true, montant: 600 },
                    "décembre 2024": { paye: true, montant: 600 },
                    "janvier 2025": { paye: true, montant: 600 },
                    "février 2025": { paye: true, montant: 600 },
                    "mars 2025": { paye: true, montant: 600 },
                    "avril 2025": { paye: true, montant: 600 },
                    "mai 2025": { paye: true, montant: 600 },
                    "juin 2025": { paye: true, montant: 600 },
                    "juillet 2025": { paye: true, montant: 600 },
                    "août 2025": { paye: true, montant: 600 },
                    "septembre 2025": { paye: true, montant: 600 },
                    "octobre 2025": { paye: true, montant: 600 },
                    "novembre 2025": { paye: true, montant: 600 },
                    "décembre 2025": { paye: true, montant: 600 },
                    "janvier 2026": { paye: true, montant: 600 },
                    "février 2026": { paye: true, montant: 600 },
                    "mars 2026": { paye: true, montant: 600 },
                    "avril 2026": { paye: true, montant: 600 },
                    "mai 2026": { paye: true, montant: 600 },
                    "juin 2026": { paye: true, montant: 600 },
                    "juillet 2026": { paye: true, montant: 600 },
                    "août 2026": { paye: true, montant: 600 },
                    "septembre 2026": { paye: true, montant: 600 },
                    "octobre 2026": { paye: true, montant: 600 },
                    "novembre 2026": { paye: true, montant: 600 },
                    "décembre 2026": { paye: true, montant: 600 }
                }
            },
            {
                nom: "Studio - Avenue des Champs",
                type: "studio",
                loyer: 450,
                locataire: "Pierre Martin",
                paiements: {
                    "janvier 2019": { paye: true, montant: 450 },
                    "février 2019": { paye: true, montant: 450 },
                    "mars 2019": { paye: true, montant: 450 },
                    "avril 2019": { paye: true, montant: 450 },
                    "mai 2019": { paye: true, montant: 450 },
                    "juin 2019": { paye: true, montant: 450 },
                    "juillet 2019": { paye: true, montant: 450 },
                    "août 2019": { paye: true, montant: 450 },
                    "septembre 2019": { paye: true, montant: 450 },
                    "octobre 2019": { paye: true, montant: 450 },
                    "novembre 2019": { paye: true, montant: 450 },
                    "décembre 2019": { paye: true, montant: 450 },
                    "janvier 2020": { paye: true, montant: 450 },
                    "février 2020": { paye: true, montant: 450 },
                    "mars 2020": { paye: true, montant: 450 },
                    "avril 2020": { paye: true, montant: 450 },
                    "mai 2020": { paye: true, montant: 450 },
                    "juin 2020": { paye: true, montant: 450 },
                    "juillet 2020": { paye: true, montant: 450 },
                    "août 2020": { paye: true, montant: 450 },
                    "septembre 2020": { paye: true, montant: 450 },
                    "octobre 2020": { paye: true, montant: 450 },
                    "novembre 2020": { paye: true, montant: 450 },
                    "décembre 2020": { paye: true, montant: 450 },
                    "janvier 2021": { paye: true, montant: 450 },
                    "février 2021": { paye: true, montant: 450 },
                    "mars 2021": { paye: true, montant: 450 },
                    "avril 2021": { paye: true, montant: 450 },
                    "mai 2021": { paye: true, montant: 450 },
                    "juin 2021": { paye: true, montant: 450 },
                    "juillet 2021": { paye: true, montant: 450 },
                    "août 2021": { paye: true, montant: 450 },
                    "septembre 2021": { paye: true, montant: 450 },
                    "octobre 2021": { paye: true, montant: 450 },
                    "novembre 2021": { paye: true, montant: 450 },
                    "décembre 2021": { paye: true, montant: 450 },
                    "janvier 2022": { paye: true, montant: 450 },
                    "février 2022": { paye: true, montant: 450 },
                    "mars 2022": { paye: true, montant: 450 },
                    "avril 2022": { paye: true, montant: 450 },
                    "mai 2022": { paye: true, montant: 450 },
                    "juin 2022": { paye: true, montant: 450 },
                    "juillet 2022": { paye: true, montant: 450 },
                    "août 2022": { paye: true, montant: 450 },
                    "septembre 2022": { paye: true, montant: 450 },
                    "octobre 2022": { paye: true, montant: 450 },
                    "novembre 2022": { paye: true, montant: 450 },
                    "décembre 2022": { paye: true, montant: 450 },
                    "janvier 2023": { paye: true, montant: 450 },
                    "février 2023": { paye: true, montant: 450 },
                    "mars 2023": { paye: true, montant: 450 },
                    "avril 2023": { paye: true, montant: 450 },
                    "mai 2023": { paye: true, montant: 450 },
                    "juin 2023": { paye: true, montant: 450 },
                    "juillet 2023": { paye: true, montant: 450 },
                    "août 2023": { paye: true, montant: 450 },
                    "septembre 2023": { paye: true, montant: 450 },
                    "octobre 2023": { paye: true, montant: 450 },
                    "novembre 2023": { paye: true, montant: 450 },
                    "décembre 2023": { paye: true, montant: 450 },
                    "janvier 2024": { paye: true, montant: 450 },
                    "février 2024": { paye: true, montant: 450 },
                    "mars 2024": { paye: true, montant: 450 },
                    "avril 2024": { paye: true, montant: 450 },
                    "mai 2024": { paye: true, montant: 450 },
                    "juin 2024": { paye: true, montant: 450 },
                    "juillet 2024": { paye: true, montant: 450 },
                    "août 2024": { paye: true, montant: 450 },
                    "septembre 2024": { paye: true, montant: 450 },
                    "octobre 2024": { paye: true, montant: 450 },
                    "novembre 2024": { paye: true, montant: 450 },
                    "décembre 2024": { paye: true, montant: 450 },
                    "janvier 2025": { paye: true, montant: 450 },
                    "février 2025": { paye: true, montant: 450 },
                    "mars 2025": { paye: true, montant: 450 },
                    "avril 2025": { paye: true, montant: 450 },
                    "mai 2025": { paye: true, montant: 450 },
                    "juin 2025": { paye: true, montant: 450 },
                    "juillet 2025": { paye: true, montant: 450 },
                    "août 2025": { paye: true, montant: 450 },
                    "septembre 2025": { paye: true, montant: 450 },
                    "octobre 2025": { paye: true, montant: 450 },
                    "novembre 2025": { paye: true, montant: 450 },
                    "décembre 2025": { paye: true, montant: 450 },
                    "janvier 2026": { paye: true, montant: 450 },
                    "février 2026": { paye: true, montant: 450 },
                    "mars 2026": { paye: true, montant: 450 },
                    "avril 2026": { paye: true, montant: 450 },
                    "mai 2026": { paye: true, montant: 450 },
                    "juin 2026": { paye: true, montant: 450 },
                    "juillet 2026": { paye: true, montant: 450 },
                    "août 2026": { paye: true, montant: 450 },
                    "septembre 2026": { paye: true, montant: 450 },
                    "octobre 2026": { paye: true, montant: 450 },
                    "novembre 2026": { paye: true, montant: 450 },
                    "décembre 2026": { paye: true, montant: 450 }
                }
            },
            {
                nom: "Maison T4 - Quartier Résidentiel",
                type: "maison",
                loyer: 800,
                locataire: "Inoccupé",
                paiements: {}
            }
        ],
        stats: {
            revenusTotaux: 10500,
            tauxOccupation: 67,
            proprietesActives: 2,
            croissance: 15
        }
    },
    locataire: {
        proprietes: [
            {
                nom: "Appartement T3 - Rue de la Paix",
                loyer: 600,
                actuellementLouee: true,
                paiements: {
                    "janvier 2023": { paye: true, montant: 600 },
                    "février 2023": { paye: true, montant: 600 },
                    "mars 2023": { paye: true, montant: 600 },
                    "avril 2023": { paye: true, montant: 600 },
                    "mai 2023": { paye: true, montant: 600 },
                    "juin 2023": { paye: true, montant: 600 },
                    "juillet 2023": { paye: true, montant: 600 },
                    "août 2023": { paye: true, montant: 600 },
                    "septembre 2023": { paye: true, montant: 600 },
                    "octobre 2023": { paye: true, montant: 600 },
                    "novembre 2023": { paye: true, montant: 600 },
                    "décembre 2023": { paye: true, montant: 600 },
                    "janvier 2024": { paye: true, montant: 600 },
                    "février 2024": { paye: true, montant: 600 },
                    "mars 2024": { paye: false, montant: 600 },
                    "avril 2024": { paye: false, montant: 600 },
                    "mai 2024": { paye: true, montant: 600 },
                    "juin 2024": { paye: true, montant: 600 },
                    "juillet 2024": { paye: true, montant: 600 },
                    "août 2024": { paye: true, montant: 600 },
                    "septembre 2024": { paye: true, montant: 600 },
                    "octobre 2024": { paye: true, montant: 600 },
                    "novembre 2024": { paye: true, montant: 600 },
                    "décembre 2024": { paye: true, montant: 600 },
                    "janvier 2025": { paye: true, montant: 600 },
                    "février 2025": { paye: true, montant: 600 },
                    "mars 2025": { paye: true, montant: 600 },
                    "avril 2025": { paye: true, montant: 600 },
                    "mai 2025": { paye: true, montant: 600 },
                    "juin 2025": { paye: true, montant: 600 },
                    "juillet 2025": { paye: true, montant: 600 },
                    "août 2025": { paye: true, montant: 600 },
                    "septembre 2025": { paye: true, montant: 600 },
                    "octobre 2025": { paye: true, montant: 600 },
                    "novembre 2025": { paye: true, montant: 600 },
                    "décembre 2025": { paye: true, montant: 600 },
                    "janvier 2026": { paye: true, montant: 600 },
                    "février 2026": { paye: true, montant: 600 },
                    "mars 2026": { paye: true, montant: 600 },
                    "avril 2026": { paye: true, montant: 600 },
                    "mai 2026": { paye: true, montant: 600 },
                    "juin 2026": { paye: true, montant: 600 },
                    "juillet 2026": { paye: true, montant: 600 },
                    "août 2026": { paye: true, montant: 600 },
                    "septembre 2026": { paye: true, montant: 600 },
                    "octobre 2026": { paye: true, montant: 600 },
                    "novembre 2026": { paye: true, montant: 600 },
                    "décembre 2026": { paye: true, montant: 600 }
                }
            },
            {
                nom: "Studio - Avenue des Champs",
                loyer: 450,
                actuellementLouee: false,
                paiements: {}
            }
        ],
        stats: {
            depensesTotales: 6000,
            proprietesLouees: 1,
            paiementsAJour: 1,
            economies: 500
        }
    }
};

// Initialiser les données depuis le contrôleur
function initializeRapportsData() {
    console.log('🔍 Tentative de chargement des données des rapports...');
    console.log('window.rapportsData disponible:', !!window.rapportsData);
    
    if (window.rapportsData && window.rapportsData.proprietaire && window.rapportsData.locataire) {
        rapportsData = window.rapportsData;
        console.log('✅ Données des rapports chargées avec succès depuis le serveur');
        
        // Vérifier la structure des données
        if (rapportsData.proprietaire && rapportsData.proprietaire.proprietes) {
            console.log(`📈 ${rapportsData.proprietaire.proprietes.length} propriétés trouvées pour le propriétaire`);
        }
        if (rapportsData.locataire && rapportsData.locataire.proprietes) {
            console.log(`🏠 ${rapportsData.locataire.proprietes.length} propriétés trouvées pour le locataire`);
        }
    } else {
        console.warn('⚠️ Données des rapports non disponibles ou incomplètes, utilisation des données de fallback');
        rapportsData = fallbackData;
        console.log('✅ Données de fallback chargées:', rapportsData);
    }
}

// Variables globales
let currentTab = 'proprietaire';
let currentPeriode = 12;
let charts = {};

// Configuration des périodes
const PERIODES = {
    3: { mois: 3, label: '3 derniers mois' },
    6: { mois: 6, label: '6 derniers mois' },
    12: { mois: 12, label: '12 derniers mois' },
    24: { mois: 24, label: '2 dernières années' },
    60: { mois: 60, label: '5 dernières années' }
};

// Configuration commune pour les graphiques avec scroll amélioré
function getChartOptions(data, title = '') {
    console.log('🔧 Configuration des options de graphique:', {
        labelsCount: data.labels.length,
        currentPeriode: window.currentPeriode || 12
    });
    
    // Détecter si on est sur un petit écran
    const isSmallScreen = window.innerWidth <= 768;
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        // Améliorer la qualité sur petits écrans
        devicePixelRatio: isSmallScreen ? 1 : window.devicePixelRatio || 1,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    // Améliorer la lisibilité sur petits écrans
                    font: {
                        size: isSmallScreen ? 11 : 12
                    },
                    usePointStyle: true,
                    padding: isSmallScreen ? 10 : 15
                }
            },
            ...(title && {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: isSmallScreen ? 14 : 16
                    }
                }
            })
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: isSmallScreen ? 60 : 45,
                    minRotation: isSmallScreen ? 60 : 45,
                    autoSkip: false,
                    // Supprimer la limite pour permettre le scroll
                    maxTicksLimit: undefined,
                    font: {
                        size: isSmallScreen ? 10 : 12
                    },
                    padding: isSmallScreen ? 4 : 6
                },
                grid: {
                    display: true
                },
                // Configuration pour permettre le scroll horizontal
                type: 'category',
                offset: false
            },
            y: {
                beginAtZero: true,
                position: 'left',
                ticks: {
                    callback: function(value) {
                        return 'FCFA ' + value;
                    },
                    font: {
                        size: isSmallScreen ? 10 : 12
                    },
                    padding: isSmallScreen ? 4 : 6
                },
                grid: {
                    display: true
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        },
        // Configuration responsive pour s'adapter au conteneur
        responsive: true,
        maintainAspectRatio: false
    };
}

// Éléments DOM
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebarBtn = document.getElementById('closeSidebar');
const periodeFilter = document.getElementById('periodeFilter');
const proprieteFilter = document.getElementById('proprieteFilter');
const periodeFilterLocataire = document.getElementById('periodeFilterLocataire');
const exportBtn = document.getElementById('exportBtn');
const exportLocataireBtn = document.getElementById('exportLocataireBtn');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation de la page des rapports...');
    
    initializeRapportsData(); // Charger les données du contrôleur
    initSidebar(); // Initialiser le sidebar
    markActivePage(); // Marquer la page active
    setupEventListeners();
    
    // Appliquer les restrictions de plan
    applyBillingRestrictions();
    
    // Vérifier que les données sont disponibles avant d'initialiser les graphiques
    if (rapportsData && rapportsData.proprietaire && rapportsData.locataire) {
        console.log('✅ Données disponibles, initialisation des graphiques...');
        initializeCharts();
        
        // Gérer le redimensionnement de la fenêtre pour améliorer la qualité des graphiques
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                console.log('📱 Redimensionnement détecté, mise à jour des graphiques...');
                // Redessiner les graphiques pour s'adapter à la nouvelle taille
                if (charts.revenusGlobaux) {
                    charts.revenusGlobaux.update('none');
                }
                if (charts.depensesGlobaux) {
                    charts.depensesGlobaux.update('none');
                }
                // Redessiner les graphiques des propriétés
                Object.values(charts).forEach(chart => {
                    if (chart && typeof chart.update === 'function') {
                        chart.update('none');
                    }
                });
            }, 250); // Délai pour éviter trop de recalculs
        });
        updateStats();
    } else {
        console.error('❌ Données insuffisantes pour initialiser les graphiques');
        console.log('État des données:', rapportsData);
        
        // Essayer d'utiliser les données de fallback
        if (!rapportsData.proprietaire || !rapportsData.locataire) {
            console.log('🔄 Tentative d\'utilisation des données de fallback...');
            rapportsData = fallbackData;
            initializeCharts();
            updateStats();
        }
    }
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Onglets
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabChange);
    });

    // Filtres
    periodeFilter.addEventListener('change', handlePeriodeChange);
    proprieteFilter.addEventListener('change', handleProprieteFilter);
    periodeFilterLocataire.addEventListener('change', handlePeriodeChangeLocataire);

    // Boutons d'export
    exportBtn.addEventListener('click', exportData);
    exportLocataireBtn.addEventListener('click', exportDataLocataire);
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
    
    // Mettre à jour les graphiques
    setTimeout(() => {
        initializeCharts();
        updateStats();
    }, 100);
}

// Gestion des changements de période
function handlePeriodeChange() {
    currentPeriode = parseInt(periodeFilter.value);
    window.currentPeriode = currentPeriode; // Mettre à jour la variable globale
    console.log(`🔄 Changement de période: ${currentPeriode} mois (${PERIODES[currentPeriode]?.label})`);
    initializeCharts();
    updateStats();
}

function handlePeriodeChangeLocataire() {
    currentPeriode = parseInt(periodeFilterLocataire.value);
    window.currentPeriode = currentPeriode; // Mettre à jour la variable globale
    console.log(`🔄 Changement de période locataire: ${currentPeriode} mois (${PERIODES[currentPeriode]?.label})`);
    initializeCharts();
    updateStats();
}

// Gestion du filtre par propriété
function handleProprieteFilter() {
    initializeCharts();
    updateStats();
}

// Initialisation des graphiques
function initializeCharts() {
    if (currentTab === 'proprietaire') {
        initializeProprietaireCharts();
    } else {
        initializeLocataireCharts();
    }
}

// Initialisation des graphiques propriétaire
function initializeProprietaireCharts() {
    const permissions = window.pagePermissions;

    //si le plan est basique, ne pas afficher les graphiques
    if (!permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed){
        return;
    }else if (permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed){
        //Plan standard
        // Graphique global des revenus
        createRevenusGlobauxChart();
        return;
    }else if (permissions.viewAdvancedReports?.allowed && permissions.viewPropertyReports?.allowed){
        //Plan premium & enterprise
        // Graphique global des revenus
        createRevenusGlobauxChart();
        // Graphiques par propriété
        createProprieteCharts();
        return;
    }
    
    
}

// Initialisation des graphiques locataire
function initializeLocataireCharts() {
    const permissions = window.pagePermissions;
    
    //si le plan est basique, ne pas afficher les graphiques
    if (!permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed){
        // Plan basique : générer des faux graphiques
        generateFakeDepensesChart();
        generateFakeLocatairePropertiesCharts();
        return;
    }else if (permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed){
        //Plan standard
        // Graphique global des dépenses
        createDepensesGlobauxChart();
        // Faux graphiques par propriété
        generateFakeLocatairePropertiesCharts();
        return;
    }else if (permissions.viewAdvancedReports?.allowed && permissions.viewPropertyReports?.allowed){
        //Plan premium & enterprise
        // Graphique global des dépenses
        createDepensesGlobauxChart();
        // Graphiques par propriété
        createLocataireProprieteCharts();
        return;
    }
    
}

// Création du graphique global des revenus
function createRevenusGlobauxChart() {
    const ctx = document.getElementById('revenusGlobauxChart');
    if (!ctx) return;

    // Détruire le graphique existant
    if (charts.revenusGlobaux) {
        charts.revenusGlobaux.destroy();
    }

    const data = getRevenusGlobauxData();
    console.log('📊 Données du graphique revenus globaux:', {
        labelsCount: data.labels.length,
        labels: data.labels.slice(0, 5) + '...', // Afficher les 5 premiers
        revenusCumulesCount: data.revenusCumules.length,
        revenusMensuelsCount: data.revenusMensuels.length
    });
    
    charts.revenusGlobaux = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenus cumulés',
                    data: data.revenusCumules,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Revenus mensuels',
                    data: data.revenusMensuels,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: getChartOptions(data, 'Évolution des revenus')
    });
}

// Création des graphiques par propriété (propriétaire)
function createProprieteCharts() {
    const container = document.getElementById('propertiesCharts');
    if (!container) return;

    container.innerHTML = '';
    
    const proprietes = getFilteredProprietes();
    
    if (proprietes.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-info-circle"></i>
                <h3>Aucune propriété occupée</h3>
                <p>Aucune propriété n'est actuellement louée pour la période sélectionnée.</p>
            </div>
        `;
        return;
    }
    
    proprietes.forEach(propriete => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'property-chart';
        chartDiv.innerHTML = `
            <div class="chart-header">
                <h3>${propriete.nom}</h3>
                <p>Locataire: ${propriete.locataire} | Loyer: FCFA ${propriete.loyer}/mois</p>
            </div>
            <div class="chart-wrapper">
                <canvas id="chart-${propriete.nom.replace(/\s+/g, '-')}"></canvas>
            </div>
        `;
        container.appendChild(chartDiv);
        
        createProprieteChart(propriete);
    });
}

// Création d'un graphique pour une propriété spécifique
function createProprieteChart(propriete) {
    const canvasId = `chart-${propriete.nom.replace(/\s+/g, '-')}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Détruire le graphique existant
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const data = getProprieteData(propriete);
    console.log('📊 Données du graphique propriété:', {
        propriete: propriete.nom,
        labelsCount: data.labels.length,
        labels: data.labels.slice(0, 5) + '...', // Afficher les 5 premiers
        revenusCumulesCount: data.revenusCumules.length,
        revenusMensuelsCount: data.revenusMensuels.length
    });
    
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Revenus cumulés',
                    data: data.revenusCumules,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Revenus mensuels',
                    data: data.revenusMensuels,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: getChartOptions(data, 'Évolution des revenus par propriété')
    });
}

// Création du graphique global des dépenses (locataire)
function createDepensesGlobauxChart() {
    const ctx = document.getElementById('depensesGlobauxChart');
    if (!ctx) return;

    // Détruire le graphique existant
    if (charts.depensesGlobaux) {
        charts.depensesGlobaux.destroy();
    }

    const data = getDepensesGlobauxData();
    
    charts.depensesGlobaux = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Dépenses cumulées',
                    data: data.depensesCumulees,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Dépenses mensuelles',
                    data: data.depensesMensuelles,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: getChartOptions(data, 'Évolution des dépenses de location')
    });
}

// Création des graphiques par propriété louée (locataire)
function createLocataireProprieteCharts() {
    const container = document.getElementById('locatairePropertiesCharts');
    if (!container) return;

    container.innerHTML = '';
    
    const proprietes = getProprietesLocataireActuel();
    
    if (proprietes.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-info-circle"></i>
                <h3>Aucune propriété louée</h3>
                <p>Vous n'avez actuellement aucune propriété louée pour la période sélectionnée.</p>
            </div>
        `;
        return;
    }
    
    proprietes.forEach(propriete => {
        const chartDiv = document.createElement('div');
        chartDiv.className = 'property-chart';
        chartDiv.innerHTML = `
            <div class="chart-header">
                <h3>${propriete.nom}</h3>
                <p>Loyer: FCFA ${propriete.loyer}/mois</p>
            </div>
            <div class="chart-wrapper">
                <canvas id="locataire-chart-${propriete.nom.replace(/\s+/g, '-')}"></canvas>
            </div>
        `;
        container.appendChild(chartDiv);
        
        createLocataireProprieteChart(propriete);
    });
}

// Création d'un graphique pour une propriété louée spécifique
function createLocataireProprieteChart(propriete) {
    const canvasId = `locataire-chart-${propriete.nom.replace(/\s+/g, '-')}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Détruire le graphique existant
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const data = getLocataireProprieteData(propriete);
    console.log('📊 Données du graphique locataire propriété:', {
        propriete: propriete.nom,
        labelsCount: data.labels.length,
        labels: data.labels.slice(0, 5) + '...', // Afficher les 5 premiers
        depensesCumuleesCount: data.depensesCumulees.length,
        depensesMensuellesCount: data.depensesMensuelles.length
    });
    
    charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Dépenses cumulées',
                    data: data.depensesCumulees,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Dépenses mensuelles',
                    data: data.depensesMensuelles,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: getChartOptions(data, 'Évolution des dépenses par propriété')
    });
}

// Fonctions de génération des données
function getRevenusGlobauxData() {
    const proprietes = getFilteredProprietes();
    const mois = getMoisLabels();
    const revenusMensuels = [];
    const revenusCumules = [];
    let cumul = 0;

    console.log(`📊 Calcul des revenus pour ${proprietes.length} propriétés avec locataire actuel`);

    mois.forEach(mois => {
        let revenuMensuel = 0;
        proprietes.forEach(propriete => {
            if (propriete.paiements && propriete.paiements[mois] && propriete.paiements[mois].paye) {
                revenuMensuel += propriete.paiements[mois].montant;
            }
        });
        revenusMensuels.push(revenuMensuel);
        cumul += revenuMensuel;
        revenusCumules.push(cumul);
    });

    return {
        labels: mois,
        revenusMensuels: revenusMensuels,
        revenusCumules: revenusCumules
    };
}

function getProprieteData(propriete) {
    const mois = getMoisLabels();
    const revenusMensuels = [];
    const revenusCumules = [];
    let cumul = 0;

    mois.forEach(mois => {
        const revenu = propriete.paiements && propriete.paiements[mois] && propriete.paiements[mois].paye 
            ? propriete.paiements[mois].montant 
            : 0;
        revenusMensuels.push(revenu);
        cumul += revenu;
        revenusCumules.push(cumul);
    });

    return {
        labels: mois,
        revenusMensuels: revenusMensuels,
        revenusCumules: revenusCumules
    };
}

function getDepensesGlobauxData() {
    const proprietes = getProprietesLocataireActuel();
    const mois = getMoisLabels();
    const depensesMensuelles = [];
    const depensesCumulees = [];
    let cumul = 0;

    console.log(`📊 Calcul des dépenses pour ${proprietes.length} propriétés louées actuellement`);

    mois.forEach(mois => {
        let depenseMensuelle = 0;
        proprietes.forEach(propriete => {
            if (propriete.paiements && propriete.paiements[mois] && propriete.paiements[mois].paye) {
                depenseMensuelle += propriete.paiements[mois].montant;
            }
        });
        depensesMensuelles.push(depenseMensuelle);
        cumul += depenseMensuelle;
        depensesCumulees.push(cumul);
    });

    return {
        labels: mois,
        depensesMensuelles: depensesMensuelles,
        depensesCumulees: depensesCumulees
    };
}

function getLocataireProprieteData(propriete) {
    const mois = getMoisLabels();
    const depensesMensuelles = [];
    const depensesCumulees = [];
    let cumul = 0;

    mois.forEach(mois => {
        const depense = propriete.paiements && propriete.paiements[mois] && propriete.paiements[mois].paye 
            ? propriete.paiements[mois].montant 
            : 0;
        depensesMensuelles.push(depense);
        cumul += depense;
        depensesCumulees.push(cumul);
    });

    return {
        labels: mois,
        depensesMensuelles: depensesMensuelles,
        depensesCumulees: depensesCumulees
    };
}

// Fonctions utilitaires
function getMoisLabels() {
    // Générer les mois selon la période sélectionnée
    const today = new Date();
    const mois = [];
    const nbMois = currentPeriode || 12;
    
    for (let i = nbMois - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        mois.push(formatMonthYear(date));
    }
    
    console.log(`📅 Génération de ${mois.length} mois pour la période: ${PERIODES[currentPeriode]?.label}`);
    return mois;
}

// Fonction pour filtrer les propriétés par locataire actuel
function getProprietesAvecLocataireActuel() {
    if (!rapportsData.proprietaire || !rapportsData.proprietaire.proprietes) {
        return [];
    }
    
    return rapportsData.proprietaire.proprietes.filter(propriete => {
        // Vérifier si la propriété a un locataire actuel
        return propriete.locataire && propriete.locataire.trim() !== '' && 
               propriete.locataire.toLowerCase() !== 'inoccupé' &&
               propriete.locataire.toLowerCase() !== 'vacant';
    });
}

// Fonction pour filtrer les propriétés du locataire actuel
function getProprietesLocataireActuel() {
    if (!rapportsData.locataire || !rapportsData.locataire.proprietes) {
        return [];
    }
    
    return rapportsData.locataire.proprietes.filter(propriete => {
        // Vérifier si la propriété est actuellement louée
        return propriete.actuellementLouee !== false;
    });
}

// Fonction pour parser une date "mois année" en objet Date
function parseMonthYear(monthYearStr) {
    const mois = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    
    const parts = monthYearStr.toLowerCase().split(' ');
    if (parts.length === 2) {
        const moisStr = parts[0];
        const annee = parseInt(parts[1]);
        const moisIndex = mois[moisStr];
        
        if (moisIndex !== undefined && !isNaN(annee)) {
            return new Date(annee, moisIndex, 1);
        }
    }
    
    // Fallback: essayer de parser avec Date.parse
    return new Date(monthYearStr);
}

// Fonction pour formater une date en "mois année"
function formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
}

function getFilteredProprietes() {
    // D'abord filtrer par locataire actuel
    let proprietes = getProprietesAvecLocataireActuel();
    
    // Ensuite appliquer le filtre par type de propriété
    const filterValue = proprieteFilter.value;
    
    if (filterValue === 'all') {
        return proprietes;
    }
    
    return proprietes.filter(propriete => propriete.type === filterValue);
}

// Mise à jour des statistiques
function updateStats() {
    if (currentTab === 'proprietaire') {
        updateStatsProprietaire();
    } else {
        updateStatsLocataire();
    }
}

function updateStatsProprietaire() {
    const proprietes = getFilteredProprietes();
    const data = getRevenusGlobauxData();
    
    // Utiliser les statistiques du contrôleur ou les calculer dynamiquement
    const revenusTotaux = rapportsData.proprietaire?.stats?.revenusTotaux || data.revenusCumules[data.revenusCumules.length - 1] || 0;
    const proprietesActives = rapportsData.proprietaire?.stats?.proprietesActives || proprietes.length;
    const tauxOccupation = rapportsData.proprietaire?.stats?.tauxOccupation || (proprietesActives > 0 ? Math.round((proprietesActives / proprietes.length) * 100) : 0);
    /*const croissance = rapportsData.proprietaire?.stats?.croissance || (data.revenusCumules.length > 1 
        ? Math.round(((data.revenusCumules[data.revenusCumules.length - 1] - data.revenusCumules[data.revenusCumules.length - 2]) / data.revenusCumules[data.revenusCumules.length - 2]) * 100)
        : 0);*/

    document.getElementById('revenusTotaux').textContent = `FCFA ${revenusTotaux}`;
    document.getElementById('tauxOccupation').textContent = `${tauxOccupation}%`;
    document.getElementById('proprietesActives').textContent = proprietesActives;
    //document.getElementById('croissance').textContent = `${croissance > 0 ? '+' : ''}${croissance}%`;
}

function updateStatsLocataire() {
    const proprietes = rapportsData.locataire.proprietes;
    const data = getDepensesGlobauxData();
    
    // Utiliser les statistiques du contrôleur ou les calculer dynamiquement
    const depensesTotales = rapportsData.locataire?.stats?.depensesTotales || data.depensesCumulees[data.depensesCumulees.length - 1] || 0;
    const proprietesLouees = rapportsData.locataire?.stats?.proprietesLouees || proprietes.length;
    const paiementsAJour = rapportsData.locataire?.stats?.paiementsAJour || proprietes.filter(p => {
        const dernierMois = getMoisLabels()[getMoisLabels().length - 1];
        return p.paiements[dernierMois] && p.paiements[dernierMois].paye;
    }).length;
    //const economies = rapportsData.locataire?.stats?.economies || 0; // À calculer selon la logique métier

    document.getElementById('depensesTotales').textContent = `FCFA ${depensesTotales}`;
    document.getElementById('proprietesLouees').textContent = proprietesLouees;
    document.getElementById('paiementsAJour').textContent = paiementsAJour;
    //document.getElementById('economies').textContent = `FCFA ${economies}`;
}

// Fonctions d'export
function exportData() {
    const proprietes = getFilteredProprietes();
    const data = getRevenusGlobauxData();
    
    // Créer un nouveau classeur Excel
    const wb = XLSX.utils.book_new();
    
    // Feuille 1: Résumé global
    const summaryData = [
        ['RAPPORT FINANCIER - PROPRIÉTAIRE'],
        [''],
        ['Période analysée', `${currentPeriode} derniers mois`],
        ['Date de génération', new Date().toLocaleDateString('fr-FR')],
        [''],
        ['STATISTIQUES GLOBALES'],
        ['Revenus totaux', `FCFA ${data.revenusCumules[data.revenusCumules.length - 1] || 0}`],
        ['Propriétés actives', proprietes.length],
        ['Taux d\'occupation', `${Math.round((proprietes.length / rapportsData.proprietaire.proprietes.length) * 100)}%`],
        [''],
        ['ÉVOLUTION DES REVENUS MENSUELS'],
        ['Mois', 'Revenus mensuels', 'Revenus cumulés']
    ];
    
    // Ajouter les données mensuelles
    data.labels.forEach((mois, index) => {
        summaryData.push([
            mois,
            `FCFA ${data.revenusMensuels[index]}`,
            `FCFA ${data.revenusCumules[index]}`
        ]);
    });
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé Global');
    
    // Feuille 2: Détails par propriété
    const proprietesData = [
        ['ANALYSE PAR PROPRIÉTÉ'],
        [''],
        ['Propriété', 'Locataire', 'Loyer mensuel', 'Type', 'Revenus totaux', 'Mois payés', 'Taux de paiement']
    ];
    
    proprietes.forEach(propriete => {
        const proprieteData = getProprieteData(propriete);
        const revenusTotaux = proprieteData.revenusCumules[proprieteData.revenusCumules.length - 1] || 0;
        const moisPayes = proprieteData.revenusMensuels.filter(rev => rev > 0).length;
        const tauxPaiement = Math.round((moisPayes / proprieteData.revenusMensuels.length) * 100);
        
        proprietesData.push([
            propriete.nom,
            propriete.locataire,
            `FCFA ${propriete.loyer}`,
            propriete.type,
            `FCFA ${revenusTotaux}`,
            moisPayes,
            `${tauxPaiement}%`
        ]);
    });
    
    const proprietesSheet = XLSX.utils.aoa_to_sheet(proprietesData);
    XLSX.utils.book_append_sheet(wb, proprietesSheet, 'Propriétés');
    
    // Feuille 3: Détails mensuels par propriété
    const detailsData = [
        ['DÉTAILS MENSUELS PAR PROPRIÉTÉ'],
        ['']
    ];
    
    // En-têtes avec tous les mois
    const mois = getMoisLabels();
    const headers = ['Propriété', 'Locataire'];
    mois.forEach(mois => headers.push(mois));
    detailsData.push(headers);
    
    // Données pour chaque propriété
    proprietes.forEach(propriete => {
        const row = [propriete.nom, propriete.locataire];
        mois.forEach(mois => {
            const paiement = propriete.paiements[mois];
            if (paiement && paiement.paye) {
                row.push(`FCFA ${paiement.montant}`);
            } else {
                row.push('Non payé');
            }
        });
        detailsData.push(row);
    });
    
    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(wb, detailsSheet, 'Détails Mensuels');
    
    // Télécharger le fichier Excel
    const fileName = `rapport-proprietaire-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

function exportDataLocataire() {
    const proprietes = rapportsData.locataire.proprietes;
    const data = getDepensesGlobauxData();
    
    // Créer un nouveau classeur Excel
    const wb = XLSX.utils.book_new();
    
    // Feuille 1: Résumé global
    const summaryData = [
        ['RAPPORT FINANCIER - LOCATAIRE'],
        [''],
        ['Période analysée', `${currentPeriode} derniers mois`],
        ['Date de génération', new Date().toLocaleDateString('fr-FR')],
        [''],
        ['STATISTIQUES GLOBALES'],
        ['Dépenses totales', `FCFA ${data.depensesCumulees[data.depensesCumulees.length - 1] || 0}`],
        ['Propriétés louées', proprietes.length],
        ['Paiements à jour', proprietes.filter(p => {
            const dernierMois = getMoisLabels()[getMoisLabels().length - 1];
            return p.paiements[dernierMois] && p.paiements[dernierMois].paye;
        }).length],
        [''],
        ['ÉVOLUTION DES DÉPENSES MENSUELLES'],
        ['Mois', 'Dépenses mensuelles', 'Dépenses cumulées']
    ];
    
    // Ajouter les données mensuelles
    data.labels.forEach((mois, index) => {
        summaryData.push([
            mois,
            `FCFA ${data.depensesMensuelles[index]}`,
            `FCFA ${data.depensesCumulees[index]}`
        ]);
    });
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé Global');
    
    // Feuille 2: Détails par propriété louée
    const proprietesData = [
        ['ANALYSE PAR PROPRIÉTÉ LOUÉE'],
        [''],
        ['Propriété', 'Loyer mensuel', 'Dépenses totales', 'Mois payés', 'Taux de paiement', 'Statut actuel']
    ];
    
    proprietes.forEach(propriete => {
        const proprieteData = getLocataireProprieteData(propriete);
        const depensesTotales = proprieteData.depensesCumulees[proprieteData.depensesCumulees.length - 1] || 0;
        const moisPayes = proprieteData.depensesMensuelles.filter(dep => dep > 0).length;
        const tauxPaiement = Math.round((moisPayes / proprieteData.depensesMensuelles.length) * 100);
        const dernierMois = getMoisLabels()[getMoisLabels().length - 1];
        const statutActuel = propriete.paiements[dernierMois] && propriete.paiements[dernierMois].paye ? 'À jour' : 'En retard';
        
        proprietesData.push([
            propriete.nom,
            `FCFA ${propriete.loyer}`,
            `FCFA ${depensesTotales}`,
            moisPayes,
            `${tauxPaiement}%`,
            statutActuel
        ]);
    });
    
    const proprietesSheet = XLSX.utils.aoa_to_sheet(proprietesData);
    XLSX.utils.book_append_sheet(wb, proprietesSheet, 'Propriétés Louées');
    
    // Feuille 3: Détails mensuels par propriété
    const detailsData = [
        ['DÉTAILS MENSUELS PAR PROPRIÉTÉ'],
        ['']
    ];
    
    // En-têtes avec tous les mois
    const mois = getMoisLabels();
    const headers = ['Propriété'];
    mois.forEach(mois => headers.push(mois));
    detailsData.push(headers);
    
    // Données pour chaque propriété
    proprietes.forEach(propriete => {
        const row = [propriete.nom];
        mois.forEach(mois => {
            const paiement = propriete.paiements[mois];
            if (paiement && paiement.paye) {
                row.push(`FCFA ${paiement.montant}`);
            } else {
                row.push('Non payé');
            }
        });
        detailsData.push(row);
    });
    
    const detailsSheet = XLSX.utils.aoa_to_sheet(detailsData);
    XLSX.utils.book_append_sheet(wb, detailsSheet, 'Détails Mensuels');
    
    // Télécharger le fichier Excel
    const fileName = `rapport-locataire-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// ========================================
// Gestion des restrictions de facturation
// ========================================

// Appliquer les restrictions de plan
function applyBillingRestrictions() {
    // Vérifier si les permissions sont disponibles
    if (!window.pagePermissions) {
        console.log('Permissions de facturation non disponibles');
        return;
    }

    const permissions = window.pagePermissions;
    
    
    // Plan basique : masquer tous les graphiques avancés
    if (!permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed) {
        console.log('🔒 Plan basique détecté - masquage des graphiques avancés');
        
        // Masquer seulement le canvas du graphique global des revenus
        const globalChartCanvas = document.getElementById('revenusGlobauxChart');
        if (globalChartCanvas) {
            globalChartCanvas.style.display = 'none';
        }
        
        // Masquer le conteneur des graphiques par propriété
        const propertyChartsContainer = document.getElementById('propertiesCharts');
        if (propertyChartsContainer) {
            propertyChartsContainer.style.display = 'none';
        }
        
        // Générer les faux graphiques
        generateFakeRevenusChart();
        generateFakePropertiesCharts();
    }
    
    // Plan standard : masquer seulement les graphiques par propriété
    if (permissions.viewAdvancedReports?.allowed && !permissions.viewPropertyReports?.allowed) {
        console.log('🔒 Plan standard détecté - masquage des graphiques par propriété');
        
        // Masquer seulement le conteneur des graphiques par propriété
        const propertyChartsContainer = document.getElementById('propertiesCharts');
        if (propertyChartsContainer) {
            propertyChartsContainer.style.display = 'none';
        }
        
        // Générer les faux graphiques par propriété
        generateFakePropertiesCharts();
    }
    
    // Plan premium et enterprise : aucune restriction
    if (permissions.viewAdvancedReports?.allowed && permissions.viewPropertyReports?.allowed) {
        console.log('✅ Plan premium/enterprise - accès complet aux graphiques');
    }
}

// Générer un faux graphique de revenus globaux
function generateFakeRevenusChart() {
    const fakeChartContainer = document.getElementById('fakeRevenusGlobauxChart');
    if (!fakeChartContainer) return;
    
    // Générer des données fictives différentes des vraies données
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const revenues = [1800, 1250, 1380, 2020, 1980, 2100, 1550, 1320, 1650, 1900, 2250, 2400]; // Données différentes des vraies
    
    // Créer un canvas pour le faux graphique
    const canvas = document.createElement('canvas');
    canvas.id = 'fakeRevenusGlobauxChartCanvas';
    
    fakeChartContainer.innerHTML = '';
    fakeChartContainer.appendChild(canvas);
    
    // Créer le faux graphique avec Chart.js comme les vrais graphiques
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenus cumulés',
                data: revenues,
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: getChartOptions({
            labels: months,
            revenusCumules: revenues,
            revenusMensuels: revenues
        }, 'Données fictives')
    });
}

// Générer des faux graphiques par propriété
function generateFakePropertiesCharts() {
    const fakeChartsContainer = document.getElementById('fakePropertiesCharts');
    if (!fakeChartsContainer) return;
    
    // Données fictives pour un seul graphique avec 12 mois
    const fakeData = {
        name: 'Villa fictive - Quartier Résidentiel',
        tenant: 'Jean Dupont',
        rent: 1200,
        data: [1150, 200, 600, 1200, 1000, 1000, 1200, 1500, 900, 800, 1300, 1200],
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    };
    
    // Créer un seul graphique avec les mêmes dimensions que les vrais graphiques
    const fakeChartHTML = `
        <div class="property-chart">
            <div class="chart-header">
                <h3>${fakeData.name}</h3>
                <p>Locataire: ${fakeData.tenant} | Loyer: FCFA ${fakeData.rent}/mois</p>
            </div>
            <div class="chart-wrapper">
                <canvas id="fake-property-chart"></canvas>
                <div class="chart-overlay">
                    <div class="upgrade-overlay-content">
                        <div class="upgrade-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3>Analyse par propriété non disponible</h3>
                        <p>Visualisez les performances détaillées de chaque propriété avec un plan Premium ou supérieur.</p>
                        <div class="upgrade-actions">
                            <a href="/parametres?tab=billing" class="btn btn-primary">
                                <i class="fas fa-arrow-up"></i> Mettre à niveau
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    fakeChartsContainer.innerHTML = fakeChartHTML;
    
    // Dessiner le faux graphique avec Chart.js comme les vrais graphiques
    const canvas = document.getElementById('fake-property-chart');
    if (canvas) {
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: fakeData.months,
                datasets: [{
                    label: 'Revenus mensuels',
                    data: fakeData.data,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false,
                    tension: 0.4
                }]
            },
            options: getChartOptions({
                labels: fakeData.months,
                revenusCumules: fakeData.data,
                revenusMensuels: fakeData.data
            })
        });
    }
}

// Générer un faux graphique de dépenses pour les locataires
function generateFakeDepensesChart() {
    const fakeChartContainer = document.getElementById('fakeDepensesGlobauxChart');
    if (!fakeChartContainer) return;
    
    // Générer des données fictives pour les dépenses
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const depenses = [800, 850, 820, 900, 880, 920, 910, 950, 930, 980, 960, 1000]; // Données différentes des vraies
    
    // Créer un canvas pour le faux graphique
    const canvas = document.createElement('canvas');
    canvas.id = 'fakeDepensesGlobauxChartCanvas';
    
    fakeChartContainer.innerHTML = '';
    fakeChartContainer.appendChild(canvas);
    
    // Créer le faux graphique avec Chart.js comme les vrais graphiques
    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Dépenses cumulées',
                data: depenses,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: getChartOptions({
            labels: months,
            revenusCumules: depenses,
            revenusMensuels: depenses
        }, 'Données fictives')
    });
}

// Générer des faux graphiques par propriété pour les locataires
function generateFakeLocatairePropertiesCharts() {
    const fakeChartsContainer = document.getElementById('fakeLocatairePropertiesCharts');
    if (!fakeChartsContainer) return;
    
    // Données fictives pour un seul graphique avec 12 mois
    const fakeData = {
        name: 'Studio fictif - Centre Ville',
        rent: 650,
        data: [1650, 1550, 1130, 1600, 1750, 1850, 1350, 950, 1250, 1650, 1740, 1850],
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    };
    
    // Créer un seul graphique
    const fakeChartHTML = `
        <div class="property-chart">
            <div class="chart-header">
                <h3>${fakeData.name}</h3>
                <p>Loyer: FCFA ${fakeData.rent}/mois</p>
            </div>
            <div class="chart-wrapper">
                <canvas id="fake-locataire-chart"></canvas>
                <div class="chart-overlay">
                    <div class="upgrade-overlay-content">
                        <div class="upgrade-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <h3>Analyse par propriété non disponible</h3>
                        <p>Visualisez les performances détaillées de chaque propriété avec un plan Premium ou supérieur.</p>
                        <div class="upgrade-actions">
                            <a href="/parametres?tab=billing" class="btn btn-primary">
                                <i class="fas fa-arrow-up"></i> Mettre à niveau
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    fakeChartsContainer.innerHTML = fakeChartHTML;
    
    // Dessiner le faux graphique avec Chart.js comme les vrais graphiques
    const canvas = document.getElementById('fake-locataire-chart');
    if (canvas) {
        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: fakeData.months,
                datasets: [{
                    label: 'Dépenses mensuelles',
                    data: fakeData.data,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: false,
                    tension: 0.4
                }]
            },
            options: getChartOptions({
                labels: fakeData.months,
                revenusCumules: fakeData.data,
                revenusMensuels: fakeData.data
            })
        });
    }
}

// Fonction pour afficher un message de mise à niveau
function showUpgradeMessage(data) {
    // Supprimer les messages existants
    const existingMessages = document.querySelectorAll('.upgrade-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Créer le nouveau message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'upgrade-message';
    messageDiv.innerHTML = `
        <div class="upgrade-content">
            <div class="upgrade-icon">
                <i class="fas fa-crown"></i>
            </div>
            <div class="upgrade-text">
                <h3>${data.title || 'Fonctionnalité non disponible'}</h3>
                <p>${data.message || 'Cette fonctionnalité n\'est pas disponible avec votre plan actuel.'}</p>
                ${data.suggestedPlan ? `<p class="suggested-plan"><strong>Plan recommandé :</strong> ${data.suggestedPlan}</p>` : ''}
                ${data.featureDescription ? `<p class="feature-description">${data.featureDescription}</p>` : ''}
            </div>
            <div class="upgrade-actions">
                <a href="/parametres?tab=billing" class="btn btn-primary">
                    <i class="fas fa-arrow-up"></i> Mettre à niveau
                </a>
                <button class="btn btn-secondary" onclick="closeUpgradeMessage()">
                    <i class="fas fa-times"></i> Fermer
                </button>
            </div>
        </div>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(messageDiv);
    
    // Animation d'apparition
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 100);
}

// Fonction pour fermer le message de mise à niveau
function closeUpgradeMessage() {
    const upgradeMessage = document.querySelector('.upgrade-message');
    if (upgradeMessage) {
        upgradeMessage.style.display = 'none';
    }
} 