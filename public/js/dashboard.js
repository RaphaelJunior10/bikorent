// Gestion des onglets
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des données du dashboard
    initializeDashboard();
    
    // Gestion des onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
});

// Initialisation du dashboard avec les données
function initializeDashboard() {
    if (!window.dashboardData) {
        console.error('Données du dashboard non disponibles');
        return;
    }
    
    // Remplir les statistiques propriétaire
    populateProprietaireStats();
    
    // Remplir les alertes propriétaire
    populateProprietaireAlertes();
    
    // Remplir les retards de paiement
    populateProprietaireRetards();
    
    // Remplir les activités propriétaire
    populateProprietaireActivities();
    
    // Remplir les statistiques locataire
    populateLocataireStats();
    
    // Remplir les activités locataire
    populateLocataireActivities();
    
    // Initialiser les calendriers
    initializeCalendars();
    
    // Appliquer les restrictions de plan
    applyBillingRestrictions();
}

// Remplir les statistiques propriétaire
function populateProprietaireStats() {
    const container = document.getElementById('proprietaireStats');
    if (!container) return;

    const stats = window.dashboardData.proprietaire.stats;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-building"></i>
            </div>
            <div class="stat-info">
                <h3>Biens Total</h3>
                <p class="stat-number">${stats.biensTotal}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-key"></i>
            </div>
            <div class="stat-info">
                <h3>Biens Loués</h3>
                <p class="stat-number">${stats.biensLoues}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-euro-sign"></i>
            </div>
            <div class="stat-info">
                <h3>CA Mensuel</h3>
                <p class="stat-number">FCFA ${stats.caMensuel.toLocaleString()}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-wallet"></i>
            </div>
            <div class="stat-info">
                <h3>Ce Mois</h3>
                <p class="stat-number">FCFA ${stats.ceMois.toLocaleString()}</p>
            </div>
        </div>
    `;
}

// Remplir les alertes propriétaire
function populateProprietaireAlertes() {
    const container = document.getElementById('proprietaireAlertes');
    if (!container) return;

    const alertes = window.dashboardData.proprietaire.alertes;
    
    container.innerHTML = `
        <div class="alert-card">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-info">
                <h3>Retards de Paiement</h3>
                <p class="alert-number">${alertes.retards} locataires en retard</p>
            </div>
        </div>
    `;
}

// Remplir les retards de paiement
function populateProprietaireRetards() {
    const container = document.getElementById('proprietaireRetards');
    if (!container) return;

    const retards = window.dashboardData.proprietaire.retards;
    
    let tableHTML = `
        <h2><i class="fas fa-exclamation-circle"></i> Locataires en Retard</h2>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Locataire</th>
                        <th>Propriété</th>
                        <th>Mois Impayés</th>
                        <th>Montant Dû</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
    `;

    retards.forEach(retard => {
        tableHTML += `
            <tr>
                <td>${retard.locataire}</td>
                <td>${retard.propriete}</td>
                <td>${retard.moisImpayes}</td>
                <td>FCFA ${retard.montantDu.toLocaleString()}</td>
                <td><button class="btn-small" onclick="contacterLocataire('${retard.locataire}', '${retard.propriete}', ${retard.moisImpayes}, ${retard.montantDu}, '${retard.email || ''}', '${retard.telephone || ''}')">Contacter</button></td>
            </tr>
        `;
    });

    tableHTML += `
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = tableHTML;
}

// Remplir les activités propriétaire
function populateProprietaireActivities() {
    const container = document.getElementById('proprietaireActivities');
    if (!container) return;

    const activites = window.dashboardData.proprietaire.activites;
    
    let activitiesHTML = `
        <h2><i class="fas fa-history"></i> Activités Récentes</h2>
        <div class="activities-list">
    `;

    activites.forEach(activite => {
        const icon = activite.type === 'nouvelle_propriete' ? 'fa-plus-circle' : 
                    activite.type === 'paiement_recu' ? 'fa-check-circle' : 'fa-info-circle';
        
        activitiesHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activite.titre}</h4>
                    <p>${activite.description}</p>
                    <span class="activity-time">${activite.temps}</span>
                </div>
            </div>
        `;
    });

    activitiesHTML += `
        </div>
    `;

    container.innerHTML = activitiesHTML;
}

// Remplir les statistiques locataire
function populateLocataireStats() {
    const container = document.getElementById('locataireStats');
    if (!container) return;

    const stats = window.dashboardData.locataire.stats;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-home"></i>
            </div>
            <div class="stat-info">
                <h3>Biens Loués</h3>
                <p class="stat-number">${stats.biensLoues}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-euro-sign"></i>
            </div>
            <div class="stat-info">
                <h3>Loyer Mensuel</h3>
                <p class="stat-number">FCFA ${stats.loyerMensuel.toLocaleString()}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
                <h3>Mois en Retard</h3>
                <p class="stat-number">${stats.moisEnRetard}</p>
            </div>
        </div>
    `;
}

// Remplir les activités locataire
function populateLocataireActivities() {
    const container = document.getElementById('locataireActivities');
    if (!container) return;

    const activites = window.dashboardData.locataire.activites;
    
    let activitiesHTML = `
        <h2><i class="fas fa-history"></i> Mes Activités Récentes</h2>
        <div class="activities-list">
    `;

    activites.forEach(activite => {
        const icon = activite.type === 'paiement_effectue' ? 'fa-check-circle' : 
                    activite.type === 'paiement_retard' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        activitiesHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activite.titre}</h4>
                    <p>${activite.description}</p>
                    <span class="activity-time">${activite.temps}</span>
                </div>
            </div>
        `;
    });

    activitiesHTML += `
        </div>
    `;

    container.innerHTML = activitiesHTML;
}

// Initialiser les calendriers
function initializeCalendars() {
    // Calendrier propriétaire
    if (window.dashboardData.proprietaire.calendrier) {
        generateCalendar('proprietaireCalendar', window.dashboardData.proprietaire.calendrier);
    }
    
    // Calendrier locataire
    if (window.dashboardData.locataire.calendrier) {
        generateCalendar('locataireCalendar', window.dashboardData.locataire.calendrier);
    }
}

// Générer un calendrier
function generateCalendar(containerId, calendarData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let months = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setDate(25);
        date.setMonth(date.getMonth() - i );
        date.setUTCDate(25);
        
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        months.push(monthYear);
    }

    let calendarHTML = '';

    // En-tête du calendrier
    calendarHTML += '<div class="calendar-header">';
    calendarHTML += '<div>Locataire / Propriété</div>';
    months.forEach(month => {
        calendarHTML += `<div>${month}</div>`;
    });
    calendarHTML += '</div>';

    // Lignes du calendrier
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
        months.forEach(month => {
            const monthPayment = paiement.paiements.find(p => p.mois === month);
            let cellClass = 'calendar-cell empty';
            let cellContent = '';
            let tooltipData = '';

            if (monthPayment) {
                cellClass = `calendar-cell ${monthPayment.statut}`;
                cellClass = monthPayment.statut === 'completé' ? 'calendar-cell à-venir' : cellClass;
                cellContent = monthPayment.statut === 'payé' ? '✓' : monthPayment.statut === 'completé' ? '●' : monthPayment.statut === 'partiel' ? '⚠' : '✗';
                
                tooltipData = `data-tenant="${paiement.locataire}" data-property="${paiement.propriete}" data-month="${month}" data-status="${monthPayment.statut}" data-amount="${monthPayment.montant}"`;
            }

            calendarHTML += `<div class="${cellClass}" ${tooltipData}>${cellContent}</div>`;
        });

        calendarHTML += '</div>';
    });

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

// Fonction pour contacter un locataire
function contacterLocataire(locataire, propriete, moisRetard, montantDu, email, telephone) {
    console.log('Contacter locataire:', locataire, propriete, moisRetard, montantDu, email, telephone);
    
    // Récupérer les informations du propriétaire depuis les données du dashboard
    const proprietaireNom = window.dashboardData?.proprietaire?.nom || 'Propriétaire';
    
    // Créer le message prérempli
    const message = `Bonjour Mr ${locataire}, je suis ${proprietaireNom} propriétaire de la propriété ${propriete}, je viens vous informer à titre de rappel que vous avez ${moisRetard} mois de retard soit un montant de FCFA ${montantDu.toLocaleString()}, Je reste en attente du règlement de ces loyers, Merci et bonne journée.`;
    
    // Créer le popup
    const popup = document.createElement('div');
    popup.className = 'contact-popup-overlay';
    popup.innerHTML = `
        <div class="contact-popup">
            <div class="contact-popup-header">
                <h3><i class="fas fa-envelope"></i> Contacter ${locataire}</h3>
                <button class="close-btn" onclick="closeContactPopup()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="contact-popup-content">
                <div class="message-section">
                    <label for="contactMessage">Message :</label>
                    <textarea id="contactMessage" rows="6" placeholder="Votre message...">${message}</textarea>
                </div>
                
                <div class="tenant-info">
                    <h4><i class="fas fa-user"></i> Informations du locataire</h4>
                    <div class="info-item">
                        <strong>Nom :</strong> ${locataire}
                    </div>
                    ${email ? `<div class="info-item"><strong>Email :</strong> ${email}</div>` : ''}
                    ${telephone ? `<div class="info-item"><strong>Téléphone :</strong> ${telephone}</div>` : ''}
                </div>
                
                <div class="contact-options">
                    <h4><i class="fas fa-phone"></i> Options de contact</h4>
                    <div class="contact-buttons">
                        ${telephone ? `
                            <button class="contact-btn whatsapp-btn" onclick="contactWhatsApp('${telephone}', '${message}')">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </button>
                        ` : ''}
                        ${email ? `
                            <button class="contact-btn email-btn" onclick="contactEmail('${email}', '${message}')">
                                <i class="fas fa-envelope"></i> Email
                            </button>
                        ` : ''}
                        ${telephone ? `
                            <button class="contact-btn call-btn" onclick="contactCall('${telephone}')">
                                <i class="fas fa-phone"></i> Appeler
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter le popup au DOM
    document.body.appendChild(popup);
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
}

// Fonction pour fermer le popup
function closeContactPopup() {
    const popup = document.querySelector('.contact-popup-overlay');
    if (popup) {
        popup.remove();
        document.body.style.overflow = '';
    }
}

// Fonction pour contacter via WhatsApp
function contactWhatsApp(telephone, message) {
    const cleanPhone = telephone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Fonction pour contacter via Email
function contactEmail(email, message) {
    const subject = encodeURIComponent('Rappel de loyer - BikoRent');
    const body = encodeURIComponent(message);
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
}

// Fonction pour appeler
function contactCall(telephone) {
    window.location.href = `tel:${telephone}`;
}

// Appliquer les restrictions de facturation
function applyBillingRestrictions() {
    // Vérifier si les permissions sont disponibles
    if (!window.pagePermissions) {
        console.log('Permissions de facturation non disponibles');
        return;
    }

    const permissions = window.pagePermissions;
    
    // Masquer les fonctionnalités non autorisées
    if (permissions.viewAdvancedStats && !permissions.viewAdvancedStats.allowed) {
        // Masquer les statistiques avancées
        const advancedStats = document.querySelectorAll('.advanced-stat');
        advancedStats.forEach(stat => {
            stat.style.display = 'none';
        });
        
        // Ajouter un message de mise à niveau
        showUpgradeMessage({
            title: 'Statistiques avancées non disponibles',
            message: 'Accédez aux analyses détaillées avec un plan supérieur',
            suggestedPlan: 'Plan Standard ou supérieur',
            featureDescription: 'Visualisez des graphiques avancés et des analyses détaillées'
        });
    }
    
    if (permissions.viewPropertyReports && !permissions.viewPropertyReports.allowed) {
        // Masquer les rapports par propriété
        const propertyReports = document.querySelectorAll('.property-report');
        propertyReports.forEach(report => {
            report.style.display = 'none';
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



// Fonction pour rafraîchir les données du dashboard
function refreshDashboard() {
    // Recharger les données depuis le serveur
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            window.dashboardData = data;
            initializeDashboard();
        })
        .catch(error => {
            console.error('Erreur lors du rafraîchissement:', error);
        });
}
