# Notification de Retard de Paiement

## Description

Cette automatisation vérifie les retards de paiement de loyer pour chaque propriétaire ayant activé l'automatisation `unpaid-rent-notification` et envoie un email récapitulatif avec la liste des locataires en retard.

## Fonctionnement

### Critères de détection de retard

Pour chaque propriété avec un locataire, le système vérifie :

1. **Paiement du mois précédent** : Y a-t-il un paiement complété dans le mois précédent ?
   - ✅ **OUI** → Le locataire n'est pas en retard
   - ❌ **NON** → Passer à l'étape 2

2. **Vérification du solde total** : Le montant total payé depuis l'entrée du locataire est-il suffisant ?
   - Formule : `Total payé >= monthlyRent × (nombre de mois depuis entryDate - 1)`
   - ✅ **OUI** → Le locataire n'est pas en retard (il a payé d'avance)
   - ❌ **NON** → Le locataire est en retard

### Activation de l'automatisation

L'automatisation doit être activée dans la collection `user_automations` :

```javascript
{
  userId: "xxx",
  automations: {
    "unpaid-rent-notification": {
      isActive: true,
      settings: {}
    }
  }
}
```

### Format de l'email

L'email envoyé contient :

- **Destinataire** : Email du propriétaire (user.profile.email)
- **Sujet** : "Locataire en retard"
- **Contenu** : 
  - Message d'introduction
  - Tableau HTML avec les colonnes :
    - Nom et Prénom du locataire
    - Nom de la propriété
    - Paiement le mois dernier (Oui/Non)
    - Montant total dû (€)
  - Bouton "Détails" pointant vers `/paiements`

## Utilisation

### 1. Exécution manuelle via script

```bash
# Depuis la racine du projet
node scripts/check-unpaid-rent.js
```

Ce script :
- Initialise Firebase Admin SDK
- Exécute la vérification pour tous les utilisateurs
- Affiche les logs détaillés
- Termine avec un code de sortie approprié

### 2. Exécution via API

**Endpoint** : `POST /automatisations/api/check-unpaid-rent`

**Authentification** : Session requise (req.session.user)

**Requête** :
```bash
curl -X POST http://localhost:3000/automatisations/api/check-unpaid-rent \
  -H "Content-Type: application/json" \
  -b "cookies.txt"
```

**Réponse en cas de succès** :
```json
{
  "success": true,
  "message": "Vérification des retards de paiement effectuée avec succès"
}
```

**Réponse en cas d'erreur** :
```json
{
  "success": false,
  "message": "Erreur lors de la vérification des retards de paiement",
  "error": "Message d'erreur détaillé"
}
```

### 3. Automatisation via Cron Job

Pour exécuter automatiquement la vérification chaque mois :

**Option A : Cron Unix/Linux**
```bash
# Éditer le crontab
crontab -e

# Ajouter cette ligne pour exécuter le 1er de chaque mois à 9h
0 9 1 * * cd /chemin/vers/bikorent && node scripts/check-unpaid-rent.js >> /var/log/bikorent-rent-check.log 2>&1
```

**Option B : Windows Task Scheduler**
1. Ouvrir le Planificateur de tâches
2. Créer une tâche de base
3. Déclencheur : Mensuel, le 1er jour à 9h00
4. Action : Démarrer un programme
   - Programme : `node`
   - Arguments : `scripts/check-unpaid-rent.js`
   - Répertoire : `C:\chemin\vers\bikorent`

**Option C : Node-cron (dans l'application)**

Ajouter dans `server.js` :
```javascript
const cron = require('node-cron');
const automationService = require('./services/automationService');

// Exécuter le 1er de chaque mois à 9h
cron.schedule('0 9 1 * *', async () => {
    console.log('🔔 Exécution automatique de la vérification des retards de paiement');
    try {
        await automationService.checkUnpaidRentNotifications();
    } catch (error) {
        console.error('❌ Erreur lors de la vérification automatique:', error);
    }
});
```

Installer la dépendance :
```bash
npm install node-cron
```

## Structure des données

### Collection : `user_automations`

```javascript
{
  userId: "user123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z",
  automations: {
    "unpaid-rent-notification": {
      isActive: true,
      settings: {}
    }
  }
}
```

### Collection : `users`

```javascript
{
  id: "user123",
  profile: {
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean.dupont@example.com"
  }
}
```

### Collection : `properties`

```javascript
{
  id: "prop456",
  ownerId: "user123",
  name: "Appartement T3",
  monthlyRent: 1200,
  tenant: {
    userId: "tenant789",
    entryDate: "2023-06-01"
  }
}
```

### Collection : `payments`

```javascript
{
  id: "pay001",
  propertyId: "prop456",
  amount: 1200,
  date: "2024-01-05",
  status: "completed"
}
```

## Logs et Débogage

Les logs sont préfixés avec des emojis pour faciliter la lecture :

- 🔔 Démarrage de la vérification
- 📊 Statistiques (nombre d'utilisateurs, propriétés, etc.)
- ⚡ Traitement d'un utilisateur spécifique
- 🏠 Propriétés récupérées
- 📧 Envoi d'email
- ✅ Succès
- ❌ Erreur

**Exemple de logs** :
```
🔔 Vérification des retards de paiement...
📊 5 utilisateurs trouvés
⚡ Vérification pour l'utilisateur user123 (jean.dupont@example.com)
🏠 3 propriétés trouvées pour user123
📧 Envoi de notification pour 2 locataire(s) en retard
✅ Email envoyé à jean.dupont@example.com pour 2 locataire(s) en retard
✅ Vérification des retards de paiement terminée
```

## Configuration de l'email

La fonction utilise la méthode `sendMail` du `dataService` avec la configuration suivante :

- **Service SMTP** : Gmail
- **Email expéditeur** : vyndore.angora@gmail.com
- **Template** : `buildEmailPayement` (HTML responsive)

Pour modifier la configuration de l'email, éditer le fichier `services/dataService.js`.

## Tests

Pour tester la fonction sans envoyer d'emails réels, vous pouvez :

1. Commenter l'appel à `dataService.sendMail()` dans `sendUnpaidRentNotification`
2. Remplacer par un `console.log()` du contenu de l'email
3. Exécuter le script de test

```javascript
// Dans services/automationService.js, ligne ~386
// await dataService.sendMail(...);
console.log('📧 Email à envoyer:', {
    to: userEmail,
    subject: 'Locataire en retard',
    latePayments: latePayments
});
```

## Dépannage

### Aucun email envoyé

- Vérifier que l'automatisation est bien activée : `isActive: true`
- Vérifier que l'utilisateur a un email valide dans `profile.email`
- Vérifier les logs pour les erreurs

### Faux positifs (locataires marqués en retard à tort)

- Vérifier les dates des paiements dans la collection `payments`
- Vérifier le statut des paiements : seuls ceux avec `status: "completed"` sont comptabilisés
- Vérifier l'`entryDate` du locataire

### Erreur d'authentification SMTP

- Vérifier les credentials dans `dataService.js`
- S'assurer que "Autoriser les applications moins sécurisées" est activé sur Gmail
- Ou utiliser un mot de passe d'application

## Améliorations futures

- [ ] Ajouter des paramètres configurables (jour d'envoi, fréquence, etc.)
- [ ] Permettre de personnaliser le message de l'email
- [ ] Ajouter un historique des notifications envoyées
- [ ] Ajouter des rappels automatiques aux locataires
- [ ] Générer un PDF récapitulatif en pièce jointe
- [ ] Ajouter des notifications push en plus de l'email

