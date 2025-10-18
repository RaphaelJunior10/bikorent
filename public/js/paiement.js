// ========================================
// BikoRent - Page de Paiement
// ========================================

// Variables globales
let currentStep = 1;
let selectedProperty = null;
let selectedPaymentMethod = 'mobidyc';
let monthsToPay = 1;
let monthlyRent = 0;
let totalAmount = 0;
let serviceFees = 0;
let finalTotal = 0;

// Données depuis le serveur
let userProperties = [];
let userDebts = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Initialisation de la page de paiement...');
    
    // Initialiser les données
    initializeData();
    
    // Configurer les événements
    setupEventListeners();
    
    // Initialiser la première étape
    initializeStep1();
    
    console.log('✅ Page de paiement initialisée');
});

// Initialiser les données
function initializeData() {
    if (window.userProperties) {
        userProperties = window.userProperties;
        console.log('✅ Propriétés utilisateur chargées:', userProperties);
    }
    
    if (window.userDebts) {
        userDebts = window.userDebts;
        console.log('✅ Dettes utilisateur chargées:', userDebts);
    }
}

// Configurer les événements
function setupEventListeners() {
    // Sélection de propriété
    const propertySelect = document.getElementById('propertySelect');
    if (propertySelect) {
        propertySelect.addEventListener('change', handlePropertyChange);
    }
    
    // Méthode de paiement
    const paymentMethod = document.getElementById('paymentMethod');
    if (paymentMethod) {
        paymentMethod.addEventListener('change', handlePaymentMethodChange);
    }
    
    // Nombre de mois
    const monthsToPayInput = document.getElementById('monthsToPay');
    if (monthsToPayInput) {
        monthsToPayInput.addEventListener('input', handleMonthsChange);
    }
    
    // Événements Mobidyc
    const mobidycProvider = document.getElementById('mobidycProvider');
    const mobidycNumber = document.getElementById('mobidycNumber');
    
    if (mobidycProvider) {
        mobidycProvider.addEventListener('change', handleMobidycProviderChange);
    }
    
    if (mobidycNumber) {
        mobidycNumber.addEventListener('input', handleMobidycNumberInput);
    }
    
    // Boutons de navigation
    const nextStepBtn = document.getElementById('nextStep');
    const prevStepBtn = document.getElementById('prevStep');
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', goToNextStep);
    }
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', goToPreviousStep);
    }
    
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', confirmPayment);
    }
}

// Initialiser l'étape 1
function initializeStep1() {
    console.log('🔄 Initialisation de l\'étape 1...');
    
    // Sélectionner la première propriété par défaut
    if (userProperties.length > 0) {
        const firstProperty = userProperties[0];
        selectedProperty = firstProperty;
        monthlyRent = firstProperty.monthlyRent;
        
        // Mettre à jour l'affichage
        updateDebtSummary();
        updateTotalAmount();
        updateMobidycSummary();
        
        console.log('✅ Première propriété sélectionnée:', firstProperty.name);
    }
}

// Gérer le changement de propriété
function handlePropertyChange(event) {
    const propertyId = event.target.value;
    console.log('🔄 Changement de propriété:', propertyId);
    
    if (propertyId) {
        selectedProperty = userProperties.find(p => p.id === propertyId);
        if (selectedProperty) {
            monthlyRent = selectedProperty.monthlyRent;
            updateDebtSummary();
            updateTotalAmount();
            updateMobidycSummary();
            console.log('✅ Propriété sélectionnée:', selectedProperty.name);
        }
    } else {
        selectedProperty = null;
        monthlyRent = 0;
        updateDebtSummary();
        updateTotalAmount();
        updateMobidycSummary();
    }
}

// Mettre à jour le récapitulatif des dettes
function updateDebtSummary() {
    console.log('🔄 Mise à jour du récapitulatif des dettes...');
    
    if (!selectedProperty) {
        // Masquer le récapitulatif
        const debtSummary = document.getElementById('debtSummary');
        if (debtSummary) {
            debtSummary.style.display = 'none';
        }
        return;
    }
    
    // Trouver les dettes pour cette propriété
    const debt = userDebts.find(d => d.propertyId === selectedProperty.id);
    
    if (debt) {
        // Mettre à jour les éléments
        const unpaidMonthsEl = document.getElementById('unpaidMonths');
        const monthlyRentEl = document.getElementById('monthlyRent');
        const totalDebtEl = document.getElementById('totalDebt');
        
        if (unpaidMonthsEl) {
            unpaidMonthsEl.textContent = debt.unpaidMonths;
        }
        
        if (monthlyRentEl) {
            monthlyRentEl.textContent = `FCFA ${debt.monthlyRent}`;
        }
        
        if (totalDebtEl) {
            totalDebtEl.textContent = `FCFA ${debt.totalDebt}`;
        }
        
        // Afficher le récapitulatif
        const debtSummary = document.getElementById('debtSummary');
        if (debtSummary) {
            debtSummary.style.display = 'block';
        }
        
        console.log('✅ Récapitulatif mis à jour:', debt);
    } else {
        // Masquer le récapitulatif si pas de dettes
        const debtSummary = document.getElementById('debtSummary');
        if (debtSummary) {
            debtSummary.style.display = 'none';
        }
    }
}

// Gérer le changement de méthode de paiement
function handlePaymentMethodChange(event) {
    selectedPaymentMethod = event.target.value;
    console.log('🔄 Méthode de paiement changée:', selectedPaymentMethod);
    
    // Masquer tous les formulaires
    hideAllPaymentForms();
    
    // Afficher le formulaire correspondant
    showPaymentForm(selectedPaymentMethod);
}

// Masquer tous les formulaires de paiement
function hideAllPaymentForms() {
    const forms = ['mobidycForm', 'virementForm', 'chequeForm', 'especesForm', 'carteForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = 'none';
        }
    });
}

// Afficher le formulaire de paiement correspondant
function showPaymentForm(method) {
    const formId = method + 'Form';
    const form = document.getElementById(formId);
    
    if (form) {
        form.style.display = 'block';
        console.log('✅ Formulaire affiché:', formId);
    }
}

// Gérer le changement du nombre de mois
function handleMonthsChange(event) {
    monthsToPay = parseInt(event.target.value) || 1;
    console.log('🔄 Nombre de mois changé:', monthsToPay);
    
    updateTotalAmount();
    updateMobidycSummary();
}

// Mettre à jour le montant total
function updateTotalAmount() {
    totalAmount = monthlyRent * monthsToPay;
    
    const totalAmountEl = document.getElementById('totalAmount');
    if (totalAmountEl) {
        totalAmountEl.textContent = totalAmount.toFixed(2);
    }
    
    console.log('✅ Montant total mis à jour:', totalAmount);
}

// Calculer les frais de service selon le fournisseur
function calculateServiceFees(provider, amount) {
    const fees = {
        'airtel': amount * 0.02, // 2% pour Airtel Money
        'mobicash': amount * 0.015, // 1.5% pour Mobicash
        'mobidyc': amount * 0.01 // 1% pour Mobidyc
    };
    
    // Frais minimum de 0.50FCFA  et maximum de 5FCFA 
    const calculatedFee = fees[provider] || 0;
    return Math.max(0.50, Math.min(5.00, calculatedFee));
}

// Mettre à jour le récapitulatif Mobidyc
function updateMobidycSummary() {
    const provider = document.getElementById('mobidycProvider')?.value || 'mobidyc';
    serviceFees = calculateServiceFees(provider, totalAmount);
    finalTotal = totalAmount + serviceFees;
    
    // Mettre à jour les éléments d'affichage
    const amountEl = document.getElementById('mobidycAmount');
    const feesEl = document.getElementById('mobidycFees');
    const totalEl = document.getElementById('mobidycTotal');
    
    if (amountEl) amountEl.textContent = `FCFA ${totalAmount.toFixed(2)}`;
    if (feesEl) feesEl.textContent = `FCFA ${serviceFees.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `FCFA ${finalTotal.toFixed(2)}`;
    
    console.log('✅ Récapitulatif Mobidyc mis à jour:', { totalAmount, serviceFees, finalTotal });
}

// Gérer le changement de fournisseur Mobidyc
function handleMobidycProviderChange(event) {
    const provider = event.target.value;
    console.log('🔄 Fournisseur Mobidyc changé:', provider);
    
    // Mettre à jour les frais
    updateMobidycSummary();
}

// Gérer la saisie du numéro de téléphone
function handleMobidycNumberInput(event) {
    let value = event.target.value.replace(/\D/g, ''); // Garder seulement les chiffres
    
    // Limiter à 10 chiffres
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    event.target.value = value;
}

// Aller à l'étape suivante
function goToNextStep() {
    console.log('🔄 Passage à l\'étape suivante...');
    
    if (currentStep === 1) {
        // Vérifier que la propriété est sélectionnée
        if (!selectedProperty) {
            showNotification('Veuillez sélectionner une propriété', 'error');
            return;
        }
        
        // Passer à l'étape 2
        currentStep = 2;
        showStep(2);
        updateNavigationButtons();
        
    } else if (currentStep === 2) {
        // Vérifier que le nombre de mois est valide
        if (monthsToPay < 1 || monthsToPay > 12) {
            showNotification('Le nombre de mois doit être entre 1 et 12', 'error');
            return;
        }
        
        // Passer à l'étape 3
        currentStep = 3;
        showStep(3);
        updateNavigationButtons();
    }
}

// Aller à l'étape précédente
function goToPreviousStep() {
    console.log('🔄 Retour à l\'étape précédente...');
    
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateNavigationButtons();
    }
}

// Afficher une étape spécifique
function showStep(stepNumber) {
    console.log('🔄 Affichage de l\'étape:', stepNumber);
    
    // Masquer toutes les étapes
    const steps = document.querySelectorAll('.step-section');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Afficher l'étape courante
    const currentStepEl = document.getElementById(`step${stepNumber}`);
    if (currentStepEl) {
        currentStepEl.classList.add('active');
    }
}

// Mettre à jour les boutons de navigation
function updateNavigationButtons() {
    const nextStepBtn = document.getElementById('nextStep');
    const prevStepBtn = document.getElementById('prevStep');
    const confirmPaymentBtn = document.getElementById('confirmPayment');
    
    if (currentStep === 1) {
        if (prevStepBtn) prevStepBtn.style.display = 'none';
        if (nextStepBtn) nextStepBtn.style.display = 'flex';
        if (confirmPaymentBtn) confirmPaymentBtn.style.display = 'none';
        
    } else if (currentStep === 2) {
        if (prevStepBtn) prevStepBtn.style.display = 'flex';
        if (nextStepBtn) nextStepBtn.style.display = 'flex';
        if (confirmPaymentBtn) confirmPaymentBtn.style.display = 'none';
        
    } else if (currentStep === 3) {
        if (prevStepBtn) prevStepBtn.style.display = 'flex';
        if (nextStepBtn) nextStepBtn.style.display = 'none';
        if (confirmPaymentBtn) confirmPaymentBtn.style.display = 'flex';
    }
}

// Confirmer le paiement
function confirmPayment() {
    console.log('🔄 Confirmation du paiement...');
    
    // Valider les données de base
    if (!selectedProperty) {
        showNotification('Veuillez sélectionner une propriété', 'error');
        return;
    }
    
    if (monthsToPay < 1 || monthsToPay > 12) {
        showNotification('Le nombre de mois doit être entre 1 et 12', 'error');
        return;
    }
    
    if (totalAmount <= 0) {
        showNotification('Le montant total doit être supérieur à 0', 'error');
        return;
    }
    
    // Valider selon la méthode de paiement
    if (!validatePaymentMethod()) {
        return;
    }
    
    // Désactiver le bouton et afficher le loader
    setPaymentButtonLoading(true);
    
    // Collecter les données du formulaire
    const paymentData = collectPaymentData();
    
    // Afficher un message de confirmation
    showNotification('Paiement en cours de traitement...', 'info');
    
    // Envoyer la requête au backend
    sendPaymentRequest(paymentData);
}

// Gérer l'état du bouton de paiement
function setPaymentButtonLoading(isLoading) {
    const confirmBtn = document.getElementById('confirmPayment');
    if (!confirmBtn) return;
    
    if (isLoading) {
        // Sauvegarder le texte original si pas déjà fait
        if (!confirmBtn.dataset.originalText) {
            confirmBtn.dataset.originalText = confirmBtn.innerHTML;
        }
        
        // Ajouter le loader avec le style utilisé dans les autres pages
        confirmBtn.innerHTML = `
            <div class="payment-loader">
                <div class="spinner"></div>
                <span>Traitement en cours...</span>
            </div>
        `;
        
        // Désactiver le bouton
        confirmBtn.disabled = true;
        confirmBtn.classList.add('loading');
        
        console.log('🔄 Bouton de paiement désactivé avec loader');
    } else {
        // Retirer les classes de loading
        confirmBtn.classList.remove('loading');
        
        // Restaurer le texte original
        confirmBtn.innerHTML = confirmBtn.dataset.originalText || '<i class="fas fa-check"></i> Confirmer le Paiement';
        
        // Réactiver le bouton
        confirmBtn.disabled = false;
        
        console.log('✅ Bouton de paiement réactivé');
    }
}

// Valider la méthode de paiement
function validatePaymentMethod() {
    if (selectedPaymentMethod === 'mobidyc') {
        return validateMobidycPayment();
    } else if (selectedPaymentMethod === 'virement') {
        return validateVirementPayment();
    } else if (selectedPaymentMethod === 'cheque') {
        return validateChequePayment();
    } else if (selectedPaymentMethod === 'especes') {
        return validateEspecesPayment();
    } else if (selectedPaymentMethod === 'carte') {
        return validateCartePayment();
    }
    
    return true;
}

// Valider le paiement Mobidyc
function validateMobidycPayment() {
    const provider = document.getElementById('mobidycProvider')?.value;
    const phoneNumber = document.getElementById('mobidycNumber')?.value;
    
    if (!provider) {
        showNotification('Veuillez sélectionner un fournisseur mobile money', 'error');
        return false;
    }
    
    if (!phoneNumber || phoneNumber.length !== 9) {
        showNotification('Veuillez entrer un numéro de téléphone valide (9 chiffres)', 'error');
        return false;
    }
    
    return true;
}

// Valider le paiement par virement
function validateVirementPayment() {
    const bankName = document.getElementById('bankName')?.value;
    const iban = document.getElementById('iban')?.value;
    const bic = document.getElementById('bic')?.value;
    const reference = document.getElementById('reference')?.value;
    
    if (!bankName || !iban || !bic || !reference) {
        showNotification('Veuillez remplir tous les champs du virement bancaire', 'error');
        return false;
    }
    
    return true;
}

// Valider le paiement par chèque
function validateChequePayment() {
    const chequeNumber = document.getElementById('chequeNumber')?.value;
    const chequeDate = document.getElementById('chequeDate')?.value;
    const chequeBank = document.getElementById('chequeBank')?.value;
    
    if (!chequeNumber || !chequeDate || !chequeBank) {
        showNotification('Veuillez remplir tous les champs du chèque', 'error');
        return false;
    }
    
    return true;
}

// Valider le paiement en espèces
function validateEspecesPayment() {
    const deliveryDate = document.getElementById('deliveryDate')?.value;
    const deliveryLocation = document.getElementById('deliveryLocation')?.value;
    const deliveryPerson = document.getElementById('deliveryPerson')?.value;
    
    if (!deliveryDate || !deliveryLocation || !deliveryPerson) {
        showNotification('Veuillez remplir tous les champs de remise en espèces', 'error');
        return false;
    }
    
    return true;
}

// Valider le paiement par carte
function validateCartePayment() {
    const cardNumber = document.getElementById('cardNumber')?.value;
    const expiryDate = document.getElementById('expiryDate')?.value;
    const cvv = document.getElementById('cvv')?.value;
    const cardName = document.getElementById('cardName')?.value;
    
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
        showNotification('Veuillez remplir tous les champs de la carte bancaire', 'error');
        return false;
    }
    
    return true;
}

// Collecter les données du paiement
function collectPaymentData() {
    const data = {
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        method: selectedPaymentMethod,
        monthsToPay: monthsToPay,
        monthlyRent: monthlyRent,
        totalAmount: totalAmount,
        serviceFees: serviceFees,
        finalTotal: finalTotal,
        timestamp: new Date().toISOString()
    };
    
    // Ajouter les données spécifiques à la méthode de paiement
    if (selectedPaymentMethod === 'mobidyc') {
        data.mobidycDetails = {
            provider: document.getElementById('mobidycProvider')?.value || '',
            phoneNumber: document.getElementById('mobidycNumber')?.value || ''
        };
    } else if (selectedPaymentMethod === 'virement') {
        data.bankDetails = {
            bankName: document.getElementById('bankName')?.value || '',
            iban: document.getElementById('iban')?.value || '',
            bic: document.getElementById('bic')?.value || '',
            reference: document.getElementById('reference')?.value || ''
        };
    } else if (selectedPaymentMethod === 'cheque') {
        data.chequeDetails = {
            chequeNumber: document.getElementById('chequeNumber')?.value || '',
            chequeDate: document.getElementById('chequeDate')?.value || '',
            chequeBank: document.getElementById('chequeBank')?.value || ''
        };
    } else if (selectedPaymentMethod === 'especes') {
        data.cashDetails = {
            deliveryDate: document.getElementById('deliveryDate')?.value || '',
            deliveryLocation: document.getElementById('deliveryLocation')?.value || '',
            deliveryPerson: document.getElementById('deliveryPerson')?.value || ''
        };
    } else if (selectedPaymentMethod === 'carte') {
        data.cardDetails = {
            cardNumber: document.getElementById('cardNumber')?.value || '',
            expiryDate: document.getElementById('expiryDate')?.value || '',
            cvv: document.getElementById('cvv')?.value || '',
            cardName: document.getElementById('cardName')?.value || ''
        };
    }
    
    console.log('✅ Données du paiement collectées:', data);
    return data;
}

// Envoyer la requête de paiement au backend
async function sendPaymentRequest(paymentData) {
    try {
        console.log('🔄 Envoi de la requête de paiement...', paymentData);
        console.log('🔍 Détails de la requête:', {
            propertyId: paymentData.propertyId,
            propertyName: paymentData.propertyName,
            method: paymentData.paymentMethod,
            totalAmount: paymentData.totalAmount,
            finalTotal: paymentData.finalTotal
        });
        
        const response = await fetch('/paiements/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Paiement traité avec succès:', result);
            showNotification('Paiement effectué avec succès !', 'success');
            
            // Rediriger vers la page des paiements après 3 secondes
            setTimeout(() => {
                window.location.href = '/paiements';
            }, 3000);
        } else {
            console.error('❌ Erreur lors du paiement:', result);
            showNotification(result.message || 'Erreur lors du traitement du paiement', 'error');
            
            // Réactiver le bouton en cas d'erreur
            setPaymentButtonLoading(false);
        }
        
    } catch (error) {
        console.error('❌ Erreur réseau:', error);
        showNotification('Erreur de connexion. Veuillez réessayer.', 'error');
        
        // Réactiver le bouton en cas d'erreur réseau
        setPaymentButtonLoading(false);
    }
}

// Traiter le paiement
function processPayment(paymentData) {
    console.log('🔄 Traitement du paiement...', paymentData);
    
    // Ici, vous pouvez envoyer les données au serveur
    // Pour l'instant, on simule un succès
    
    showNotification('Paiement effectué avec succès !', 'success');
    
    // Rediriger vers la page des paiements après 3 secondes
    setTimeout(() => {
        window.location.href = '/paiements';
    }, 3000);
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
    
    // Afficher avec animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Masquer après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Obtenir l'icône de notification
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        default:
            return 'fa-info-circle';
    }
}

// Initialiser le sidebar
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

// Marquer la page active dans le sidebar
function markActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });
}

// Initialiser le sidebar et marquer la page active
initSidebar();
markActivePage();
