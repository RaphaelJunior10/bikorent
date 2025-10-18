# Système de 3 Niveaux d'Alerte de Paiement

## Vue d'ensemble

Système progressif de gestion des retards de paiement avec 3 niveaux d'alerte, chacun avec des restrictions et des interfaces utilisateur spécifiques.

## Niveaux d'alerte

### 🟡 Niveau 1 : Notification (1x < montant dû ≤ 2x)

**Seuil** : `montant dû > (prix du forfait * nombre de propriétés * 1)`

**Comportement** :
- ✅ **Notification non intrusive** (coin supérieur droit)
- ✅ **Couleur jaune** (warning)
- ✅ **Auto-fermeture** après 5 secondes
- ✅ **Affichage unique** par connexion
- ✅ **Accès complet** aux fonctionnalités
- ✅ **Bannière dans paramètres** avec bouton "Payer maintenant"

**Message** : "Vous avez du retard dans le règlement de vos facturations. Veuillez régulariser votre situation pour éviter les restrictions sur votre compte."

### 🟠 Niveau 2 : Restrictions (2x < montant dû ≤ 3x)

**Seuil** : `montant dû > (prix du forfait * nombre de propriétés * 2)`

**Comportement** :
- ✅ **Alerte orange** (pleine largeur)
- ✅ **Restrictions de modification** activées
- ✅ **Blocage des formulaires** et boutons de modification
- ✅ **Message d'erreur** lors des tentatives de modification
- ✅ **Accès en lecture seule** aux fonctionnalités
- ✅ **Bannière dans paramètres** avec bouton "Payer maintenant"

**Message** : "Vous ne pouvez plus apporter de modifications sur votre compte jusqu'au règlement de vos dettes."

### 🔴 Niveau 3 : Compte bloqué (montant dû > 3x)

**Seuil** : `montant dû > (prix du forfait * nombre de propriétés * 3)`

**Comportement** :
- ✅ **Alerte rouge** (pleine largeur)
- ✅ **Compte entièrement bloqué**
- ✅ **Overlay de blocage** sur toutes les pages sauf paramètres
- ✅ **Pages grisées** avec accès restreint
- ✅ **Seule la page paramètres** reste accessible
- ✅ **Bannière dans paramètres** avec bouton "Payer maintenant"

**Message** : "Votre compte est bloqué. Veuillez régulariser votre situation pour accéder à toutes les fonctionnalités."

## Calcul des seuils

```javascript
// Prix du forfait par propriété
const planPrice = planPrices[userPlan] || 0;

// Seuils de retard
const baseThreshold = planPrice * userTenants.length;
const threshold1x = baseThreshold * 1;  // Niveau 1
const threshold2x = baseThreshold * 2;  // Niveau 2  
const threshold3x = baseThreshold * 3;  // Niveau 3

// Détermination du niveau
if (userDu.amountDue > threshold3x) {
    alertLevel = 3; // Compte bloqué
} else if (userDu.amountDue > threshold2x) {
    alertLevel = 2; // Restrictions
} else if (userDu.amountDue > threshold1x) {
    alertLevel = 1; // Notification
}
```

## Interface utilisateur

### 🟡 Niveau 1 - Notification

```html
<div class="payment-notification payment-level-1">
    <div class="notification-content">
        <div class="notification-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="notification-message">
            <p>Message d'alerte niveau 1</p>
        </div>
        <div class="notification-actions">
            <button onclick="goToBilling()">Payer maintenant</button>
            <button onclick="closePaymentNotification()">Fermer</button>
        </div>
    </div>
</div>
```

**Caractéristiques** :
- Position fixe (coin supérieur droit)
- Auto-fermeture après 5 secondes
- Couleur jaune (#f59e0b)
- Taille réduite (max-width: 400px)

### 🟠 Niveau 2 - Restrictions

```html
<div class="payment-overdue-alert payment-level-2">
    <div class="alert-content">
        <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="alert-message">
            <h3>Restrictions appliquées</h3>
            <p>Message d'alerte niveau 2</p>
        </div>
        <div class="alert-actions">
            <button onclick="goToBilling()">Payer maintenant</button>
            <button onclick="closePaymentAlert()">Fermer</button>
        </div>
    </div>
</div>
```

**Caractéristiques** :
- Pleine largeur de la page
- Couleur orange (#f97316)
- Blocage des modifications
- Message d'erreur lors des tentatives

### 🔴 Niveau 3 - Compte bloqué

```html
<div class="payment-blocked-alert payment-level-3">
    <div class="alert-content">
        <div class="alert-icon">
            <i class="fas fa-ban"></i>
        </div>
        <div class="alert-message">
            <h3>Compte bloqué</h3>
            <p>Message d'alerte niveau 3</p>
        </div>
        <div class="alert-actions">
            <button onclick="goToBilling()">Payer maintenant</button>
        </div>
    </div>
</div>
```

**Caractéristiques** :
- Pleine largeur de la page
- Couleur rouge (#ef4444)
- Overlay de blocage sur toutes les pages
- Accès restreint aux fonctionnalités

## Restrictions et blocages

### Niveau 2 - Restrictions de modification

**Fonctionnalités bloquées** :
- Soumission de formulaires
- Boutons de modification (ajouter, supprimer, créer, mettre à jour, enregistrer)
- Actions de modification sur les données

**Fonctionnalités autorisées** :
- Consultation des données
- Navigation entre les pages
- Accès aux paramètres

### Niveau 3 - Compte bloqué

**Fonctionnalités bloquées** :
- Toutes les pages sauf `/parametres`
- Overlay de blocage sur toutes les pages
- Accès restreint aux fonctionnalités

**Fonctionnalités autorisées** :
- Page des paramètres uniquement
- Bouton "Payer maintenant"

## Gestion des tentatives de modification

### Interception des événements

```javascript
// Intercepter les soumissions de formulaires
document.addEventListener('submit', function(e) {
    if (!window.paymentRestrictions.canModify) {
        e.preventDefault();
        showModificationBlockedMessage();
        return false;
    }
});

// Intercepter les clics sur les boutons de modification
document.addEventListener('click', function(e) {
    const target = e.target;
    if (target.matches('button[type="submit"], .btn-primary, .btn-secondary') && 
        !window.paymentRestrictions.canModify) {
        
        const buttonText = target.textContent.toLowerCase();
        const isModificationButton = buttonText.includes('modifier') || 
                                   buttonText.includes('ajouter') || 
                                   buttonText.includes('supprimer') || 
                                   buttonText.includes('créer') || 
                                   buttonText.includes('mettre à jour') ||
                                   buttonText.includes('enregistrer');
        
        if (isModificationButton) {
            e.preventDefault();
            showModificationBlockedMessage();
            return false;
        }
    }
});
```

### Message de modification bloquée

```javascript
function showModificationBlockedMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
        <h3><i class="fas fa-ban"></i> Modification bloquée</h3>
        <p>Vous ne pouvez plus apporter de modifications sur votre compte jusqu'au règlement de vos dettes.</p>
        <button onclick="this.parentElement.remove()">Fermer</button>
    `;
    document.body.appendChild(message);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        if (message.parentElement) {
            message.remove();
        }
    }, 5000);
}
```

## Variables globales

```javascript
window.paymentRestrictions = {
    canModify: true,      // Peut modifier les données
    isBlocked: false,     // Compte bloqué
    alertLevel: 0         // Niveau d'alerte (0, 1, 2, 3)
};
```

## Logs de sécurité

```
💰 Alerte niveau 1 détectée pour user123: 150000 (seuils: 1x=50000, 2x=100000, 3x=150000)
💰 Alerte niveau 2 détectée pour user123: 200000 (seuils: 1x=50000, 2x=100000, 3x=150000)
💰 Alerte niveau 3 détectée pour user123: 300000 (seuils: 1x=50000, 2x=100000, 3x=150000)
```

## Avantages du système

1. **Progressif** : Restrictions graduelles selon le niveau de retard
2. **Éducatif** : Messages clairs sur les conséquences
3. **Flexible** : Permet l'accès aux paramètres pour régulariser
4. **Sécurisé** : Blocage des modifications en cas de retard
5. **UX optimisée** : Interfaces adaptées à chaque niveau
6. **Traçable** : Logs détaillés des niveaux d'alerte

## Tests recommandés

1. **Test niveau 1** : Vérifier la notification jaune et auto-fermeture
2. **Test niveau 2** : Vérifier les restrictions de modification
3. **Test niveau 3** : Vérifier le blocage complet du compte
4. **Test paramètres** : Vérifier l'accès aux paramètres à tous les niveaux
5. **Test paiement** : Vérifier le bouton "Payer maintenant"
6. **Test responsive** : Vérifier l'affichage sur mobile
