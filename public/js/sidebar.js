// ========================================
// BikoRent - Gestion du Sidebar
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

    //On surligne le menu actif
    const currentPage = window.location.pathname.split('/').pop();
    const sidebarItem = document.querySelector(`.sb_${currentPage}`);
    if (sidebarItem) {
        sidebarItem.classList.add('active');
    }

    // Gestion de la déconnexion avec modal personnalisé
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');
    
    if (logoutBtn && logoutModal) {
        console.log('✅ Bouton de déconnexion trouvé');
        
        // Ouvrir le modal de déconnexion
        logoutBtn.addEventListener('click', function(e) {
            console.log('🖱️ Clic sur le bouton de déconnexion');
            e.preventDefault();
            e.stopPropagation();
            logoutModal.classList.add('show');
        });
        
        // Fermer le modal
        function closeModal() {
            logoutModal.classList.remove('show');
        }
        
        // Événements pour fermer le modal
        if (closeLogoutModal) {
            closeLogoutModal.addEventListener('click', closeModal);
        }
        if (cancelLogout) {
            cancelLogout.addEventListener('click', closeModal);
        }
        
        // Fermer le modal en cliquant à l'extérieur
        logoutModal.addEventListener('click', function(e) {
            if (e.target === logoutModal) {
                closeModal();
            }
        });
        
        // Fermer le modal avec la touche Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && logoutModal.classList.contains('show')) {
                closeModal();
            }
        });
        
        // Confirmer la déconnexion
        if (confirmLogout) {
            confirmLogout.addEventListener('click', function() {
                console.log('✅ Confirmation de déconnexion');
                // Afficher un loader sur le bouton de confirmation
                const originalText = confirmLogout.innerHTML;
                confirmLogout.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Déconnexion...</span>';
                confirmLogout.disabled = true;
                
                // Effectuer la déconnexion
                fetch('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => {
                    console.log('📡 Réponse de déconnexion:', response.status);
                    if (response.ok) {
                        // Rediriger vers la page d'accueil
                        window.location.href = '/';
                    } else {
                        throw new Error('Erreur lors de la déconnexion');
                    }
                })
                .catch(error => {
                    console.error('Erreur de déconnexion:', error);
                    
                    // Afficher une alerte d'erreur
                    alert('Erreur lors de la déconnexion. Veuillez réessayer.');
                    
                    // Restaurer le bouton
                    confirmLogout.innerHTML = originalText;
                    confirmLogout.disabled = false;
                });
            });
        } else {
            console.error('❌ Bouton de confirmation de déconnexion non trouvé');
        }
    } else {
        console.error('❌ Bouton de déconnexion ou modal non trouvé');
    }
}

// Initialisation automatique quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    //console.log('🚀 Initialisation du sidebar...');
    initSidebar();
}); 