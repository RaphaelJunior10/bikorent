# Rappel d'Expiration de Bail

## Description

Cette automatisation vérifie les événements d'expiration de bail dans le calendrier et envoie des notifications par email 30 jours avant l'expiration au propriétaire et au locataire concernés.

## Fonctionnement

### Critères de détection d'expiration

Pour chaque utilisateur ayant activé l'automatisation :

1. **Récupération des événements** : Le système récupère tous les événements de calendrier de l'utilisateur
2. **Filtrage par type** : Recherche des événements avec `eventType = 'expiration'` ou `eventType = 'expiration_bail'`
3. **Filtrage par propriété** : Vérifie que `propertyId` correspond à une propriété de l'utilisateur
4. **Filtrage par date** : Ne garde que les événements dont la date est exactement dans 30 jours
5. **Notification** : Envoie un email au propriétaire ET au locataire de la propriété

### Activation de l'automatisation

L'automatisation doit être activée dans la collection `user_automations` :

```javascript
{
  userId: "xxx",
  automations: {
    "lease-expiry-reminder": {
      isActive: true,
      settings: {}
    }
  }
}
```

### Format de l'email

L'email envoyé contient :

- **Destinataires** : Email du propriétaire ET email du locataire
- **Sujet** : "Expiration de bail à venir"
- **Contenu** : 
  - Message principal : "Le bail de la propriété [nom] arrive à expiration dans exactement 30 jours."
  - Encadré avec informations sur la propriété :
    - Nom de la propriété
    - Adresse
    - Date d'expiration
  - Alerte de rappel : "Il est temps de planifier le renouvellement du bail ou le départ du locataire."
  - Bouton "Détails" pointant vers `/calendrier` (propriétaire) ou `/paiement` (locataire)

## Structure des événements

Les événements d'expiration de bail sont stockés dans la collection `calendarEvents` :

```javascript
{
  id: "auto-generated",
  userId: "user123",
  propertyId: "prop456",
  eventType: "expiration" | "expiration_bail",
  title: "Expiration de bail - Appartement T3",
  description: "Le bail expire le 15/12/2024. Renouvellement ou départ prévu.",
  start: "2024-12-15T00:00:00.000Z", // Date d'expiration
  end: "2024-12-16T00:00:00.000Z",
  location: "123 Rue de la Paix, Paris",
  createdAt: "2024-01-01T00:00:00.000Z",
  isAutomatic: true
}
```

## Utilisation

### 1. Exécution manuelle via script

```bash
# Depuis la racine du projet
node scripts/check-lease-expiry.js
```

Ce script :
- Initialise Firebase Admin SDK
- Exécute la vérification pour tous les utilisateurs
- Affiche les logs détaillés
- Termine avec un code de sortie approprié

### 2. Exécution via API

**Endpoint** : `POST /automatisations/api/check-lease-expiry`

**Authentification** : Session requise (req.session.user)

**Requête** :
```bash
curl -X POST http://localhost:3000/automatisations/api/check-lease-expiry \
  -H "Content-Type: application/json" \
  -b "cookies.txt"
```

**Réponse en cas de succès** :
```json
{
  "success": true,
  "message": "Vérification des expirations de bail effectuée avec succès"
}
```

**Réponse en cas d'erreur** :
```json
{
  "success": false,
  "message": "Erreur lors de la vérification des expirations de bail",
  "error": "Message d'erreur détaillé"
}
```

### 3. Automatisation via Cron Job

Le cron job est configuré dans `server.js` pour s'exécuter **tous les jours à 9h** :

```javascript
// Exécuter tous les jours à 9h
cron.schedule('0 9 * * *', async () => {
    console.log('📅 Vérification automatique des expirations de bail');
    try {
        await automationService.checkLeaseExpiryReminders();
        console.log('✅ Vérification des expirations de bail terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la vérification automatique des expirations:', error);
    }
});
```

**Pourquoi tous les jours ?**
- L'automatisation vérifie une date précise (dans exactement 30 jours)
- L'exécution quotidienne garantit qu'aucune expiration ne soit manquée
- Si un événement est détecté, la notification est envoyée une seule fois

### Configuration personnalisée

**Unix/Linux - Crontab**
```bash
# Éditer le crontab
crontab -e

# Exécuter tous les jours à 9h
0 9 * * * cd /chemin/vers/bikorent && node scripts/check-lease-expiry.js >> /var/log/bikorent-lease-expiry.log 2>&1
```

**Windows Task Scheduler**
1. Ouvrir le Planificateur de tâches
2. Créer une tâche de base
3. Déclencheur : Quotidien à 9h00
4. Action : Démarrer un programme
   - Programme : `node`
   - Arguments : `scripts/check-lease-expiry.js`
   - Répertoire : `C:\chemin\vers\bikorent`

## Création d'événements d'expiration

### Via l'utilitaire

Utiliser la fonction `addLeaseExpirationEvent` du module `utils/calendarEvents.js` :

```javascript
const { addLeaseExpirationEvent } = require('../utils/calendarEvents');

// Lors de l'ajout d'un locataire avec une date de fin de bail
await addLeaseExpirationEvent(
    userId,
    property,
    leaseEndDate  // Date d'expiration du bail
);
```

### Via l'API du calendrier

Envoyer une requête POST à `/calendrier/api/events` :

```javascript
{
  "title": "Expiration de bail - Appartement T3",
  "description": "Le bail expire le 15/12/2024",
  "start": "2024-12-15T00:00:00.000Z",
  "end": "2024-12-16T00:00:00.000Z",
  "propertyId": "prop456",
  "eventType": "expiration",
  "location": "123 Rue de la Paix, Paris"
}
```

### Automatiquement

Les événements peuvent être créés automatiquement lors de :
- L'ajout d'un locataire avec une `leaseEnd` date
- L'importation de données
- La synchronisation avec des sources externes

## Structure des données

### Collection : `user_automations`

```javascript
{
  userId: "user123",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z",
  automations: {
    "lease-expiry-reminder": {
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
  address: "123 Rue de la Paix, Paris",
  tenant: {
    userId: "tenant789",
    entryDate: "2023-06-01",
    leaseEnd: "2024-12-15"  // Optionnel
  }
}
```

### Collection : `calendarEvents`

```javascript
{
  id: "event001",
  userId: "user123",
  propertyId: "prop456",
  eventType: "expiration",
  title: "Expiration de bail - Appartement T3",
  description: "Le bail expire le 15/12/2024",
  start: "2024-12-15T00:00:00.000Z",
  end: "2024-12-16T00:00:00.000Z",
  location: "123 Rue de la Paix, Paris",
  createdAt: "2024-01-01T00:00:00.000Z",
  isAutomatic: true
}
```

## Logs et Débogage

Les logs sont préfixés avec des emojis pour faciliter la lecture :

- 📅 Démarrage de la vérification
- 📊 Statistiques (nombre d'utilisateurs, événements, etc.)
- ⚡ Traitement d'un utilisateur spécifique
- 🏠 Propriétés récupérées
- 📆 Événements récupérés
- 🎯 Date cible de recherche
- 🔔 Expiration détectée
- 📧 Envoi d'email
- ✅ Succès
- ❌ Erreur

**Exemple de logs** :
```
📅 Vérification des expirations de bail...
✅ Firebase Admin SDK vérifié/initialisé
📊 5 utilisateurs trouvés
🎯 Recherche d'expirations de bail pour le 15/12/2024
⚡ Vérification pour l'utilisateur user123 (jean.dupont@example.com) true
🏠 3 propriétés trouvées pour user123
📆 12 événements trouvés pour user123
🔔 Expiration de bail détectée pour la propriété Appartement T3
✅ Email d'expiration envoyé au propriétaire: jean.dupont@example.com
✅ Email d'expiration envoyé au locataire: marie.martin@example.com
✅ Vérification des expirations de bail terminée
```

## Gestion des cas particuliers

### Propriété sans locataire

Si la propriété n'a pas de locataire, seul le propriétaire reçoit l'email.

### Email manquant

- Si l'email du propriétaire est manquant, un log d'erreur est généré
- Si l'email du locataire est manquant, seul le propriétaire reçoit l'email
- Si les deux emails sont manquants, un log d'erreur est généré et aucun email n'est envoyé

### Événement déjà traité

L'automatisation vérifie une date précise (dans exactement 30 jours). Une fois la date passée, l'événement ne sera plus détecté, évitant ainsi l'envoi de doublons.

### Multiples événements d'expiration

Si plusieurs événements d'expiration existent pour la même propriété à la même date, tous seront traités et les emails seront envoyés pour chacun (attention aux doublons).

## Tests

### Test manuel avec date personnalisée

Pour tester sans attendre 30 jours, vous pouvez modifier temporairement le calcul de la date cible dans `checkLeaseExpiryReminders()` :

```javascript
// Dans services/automationService.js, ligne ~438
const targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 1); // Tester pour demain au lieu de dans 30 jours
```

### Test avec des événements de test

Créer un événement de test dans le calendrier avec une date dans 30 jours exactement.

### Test sans envoi d'emails

Commenter l'appel à `sendMail()` pour tester la logique sans envoyer d'emails :

```javascript
// Dans services/automationService.js, ligne ~583
// await dataService.sendMail(...);
console.log('📧 Email à envoyer (test):', {
    to: ownerEmail,
    subject: 'Expiration de bail à venir'
});
```

## Dépannage

### Aucun email envoyé

- Vérifier que l'automatisation est bien activée : `isActive: true`
- Vérifier qu'un événement existe avec `eventType: 'expiration'` ou `'expiration_bail'`
- Vérifier que la date de l'événement est exactement dans 30 jours
- Vérifier que les utilisateurs ont des emails valides
- Vérifier les logs pour les erreurs

### Événement non détecté

- Vérifier que `propertyId` correspond bien à une propriété de l'utilisateur
- Vérifier le format de la date de l'événement
- Vérifier que l'événement n'a pas déjà été traité (date passée)

### Erreur d'authentification SMTP

Voir la documentation de `check-unpaid-rent` pour configurer l'envoi d'emails.

## Améliorations futures

- [ ] Permettre de configurer le délai de rappel (30, 60, 90 jours)
- [ ] Envoyer plusieurs rappels (à 60, 30, 15, 7 jours)
- [ ] Ajouter un historique des notifications envoyées
- [ ] Ajouter des notifications push en plus de l'email
- [ ] Générer un PDF récapitulatif en pièce jointe
- [ ] Permettre de personnaliser le message
- [ ] Ajouter des suggestions de renouvellement de bail

## Relation avec d'autres automatisations

Cette automatisation fonctionne en synergie avec :

- **Automatisation de calendrier Google** : Les événements peuvent être synchronisés depuis Google Calendar
- **Notification de retard de paiement** : Complémentaire pour la gestion des locataires
- **Génération automatique d'événements** : Les événements d'expiration peuvent être créés automatiquement

## Sécurité et confidentialité

- Les emails sont envoyés de manière sécurisée via SMTP
- Les données sensibles (dates, adresses) ne sont partagées qu'avec les parties concernées
- Les logs ne contiennent pas d'informations confidentielles
- La vérification est effectuée côté serveur uniquement

