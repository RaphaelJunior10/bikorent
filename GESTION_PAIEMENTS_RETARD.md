# Gestion des Paiements en Retard

## Vue d'ensemble

Système de gestion des paiements en retard qui affiche des alertes aux utilisateurs et permet le traitement des paiements directement depuis l'interface.

## Fonctionnalités implémentées

### 🔔 Alerte globale

**Affichage automatique** sur toutes les pages quand l'utilisateur est en retard de paiement :

- **Condition** : `amountDue > (prix du forfait * nombre de propriétés * 2)`
- **Position** : En haut de chaque page (dans le layout principal)
- **Contenu** : Message d'alerte avec date d'expiration et bouton d'action
- **Actions** : "Payer maintenant" (redirige vers paramètres) et "Fermer"

### 💳 Interface de paiement dans les paramètres

**Section facturation** avec bannière de paiement en retard :

- **Affichage** : Montant dû et date d'expiration
- **Bouton** : "Payer maintenant" avec loader
- **Traitement** : Requête API vers `/parametres/api/process-payment`
- **Feedback** : Notifications de succès/erreur

## Logique de détection

### Calcul du seuil de retard

```javascript
// Prix des forfaits
const planPrices = {
    'basique': 0,
    'premium': 9.99,
    'enterprise': 29.99
};

// Seuil = prix du forfait * nombre de propriétés * 2
const threshold = planPrice * userProperties.length * 2;

// Détection du retard
if (userDu.amountDue > threshold) {
    // Afficher les alertes
}
```

### Données utilisées

- **`getUserDu(userId)`** : Retourne `{ amountDue, expireDate }`
- **`getPropertiesByOwnerId(userId)`** : Nombre de propriétés de l'utilisateur
- **`user.facturation.planId`** : Plan actuel de l'utilisateur

## Interface utilisateur

### 🚨 Alerte globale (layout.ejs)

```html
<div class="payment-overdue-alert">
    <div class="alert-content">
        <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="alert-message">
            <h3>Paiement en retard</h3>
            <p>Vous êtes en retard de paiement. Veuillez régulariser votre situation avant le <strong>DATE</strong> pour éviter les restrictions sur votre compte.</p>
        </div>
        <div class="alert-actions">
            <button onclick="goToBilling()">Payer maintenant</button>
            <button onclick="closePaymentAlert()">Fermer</button>
        </div>
    </div>
</div>
```

### 💰 Bannière facturation (parametres.ejs)

```html
<div class="payment-overdue-banner">
    <div class="banner-content">
        <div class="banner-icon">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="banner-info">
            <h3>Paiement en retard</h3>
            <p>Montant dû : <strong>MONTANT FCFA</strong></p>
            <p>Date d'expiration : <strong>DATE</strong></p>
        </div>
        <div class="banner-actions">
            <button id="payNowBtn">Payer maintenant</button>
        </div>
    </div>
</div>
```

## API de traitement

### Route de paiement

**`POST /parametres/api/process-payment`**

**Paramètres :**
```json
{
    "amount": 150000
}
```

**Réponse de succès :**
```json
{
    "success": true,
    "message": "Paiement traité avec succès",
    "transactionId": "TXN_1234567890",
    "amount": 150000,
    "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Réponse d'erreur :**
```json
{
    "success": false,
    "message": "Montant invalide"
}
```

## Middleware de vérification

### `automationMiddleware.js`

Le middleware vérifie automatiquement les paiements en retard à chaque requête :

```javascript
// Vérification des paiements en retard
const userDu = await dataService.getUserDu(req.session.user.id);
const userProperties = await dataService.getPropertiesByOwnerId(req.session.user.id);
const userPlan = currentUser?.facturation?.planId || 'basique';

const planPrice = planPrices[userPlan] || 0;
const threshold = planPrice * userProperties.length * 2;

if (userDu.amountDue > threshold) {
    res.locals.paymentOverdue = {
        amountDue: userDu.amountDue,
        expireDate: userDu.expireDate,
        threshold: threshold,
        isOverdue: true
    };
}
```

## Styles CSS

### Alerte globale
- **Couleur** : Dégradé rouge (`#ef4444` → `#dc2626`)
- **Animation** : Slide down à l'apparition
- **Responsive** : Layout vertical sur mobile

### Bannière facturation
- **Couleur** : Dégradé rouge identique
- **Layout** : Horizontal avec icône, info et bouton
- **Bouton** : Blanc avec texte rouge, effet hover

## Gestion des erreurs

### Frontend
- **Loader** : Bouton avec spinner pendant le traitement
- **Notifications** : Toast de succès/erreur
- **Rechargement** : Page rechargée après succès

### Backend
- **Validation** : Vérification du montant et de l'authentification
- **Logs** : Enregistrement des tentatives de paiement
- **Simulation** : Délai de 1 seconde pour simuler le traitement

## Logs de sécurité

```
💰 Paiement en retard détecté pour user123: 150000 > 59960
💳 Traitement du paiement pour user123: 150000 FCFA
```

## État actuel

### ✅ Implémenté
- Détection automatique des paiements en retard
- Alerte globale sur toutes les pages
- Interface de paiement dans les paramètres
- API de traitement (simulation)
- Styles et animations
- Gestion des erreurs

### 🔄 À implémenter
- Intégration avec un vrai système de paiement
- Mise à jour de la base de données après paiement
- Restrictions sur les fonctionnalités après expiration
- Historique des paiements
- Notifications par email/SMS

## Tests recommandés

1. **Test avec utilisateur en retard** : Vérifier l'affichage des alertes
2. **Test du bouton "Payer maintenant"** : Vérifier le loader et la réponse
3. **Test responsive** : Vérifier l'affichage sur mobile
4. **Test de fermeture** : Vérifier la fermeture de l'alerte globale
5. **Test API** : Vérifier les réponses de l'API de paiement
