# Guide de Migration vers Firebase

Ce guide vous explique comment migrer les données de test de BikoRent vers Firebase Firestore.

## 📋 Prérequis

1. **Projet Firebase créé** avec Firestore Database activé
2. **Variables d'environnement configurées** dans un fichier `.env`
3. **Règles de sécurité Firestore** configurées en mode test

## 🔧 Configuration Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "bikorent-app")
4. Suivez les étapes de configuration

### 2. Activer Firestore Database

1. Dans la console Firebase, allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode test" pour commencer
4. Sélectionnez l'emplacement de votre base de données

### 3. Obtenir les informations de configuration

1. Dans la console Firebase, allez dans "Paramètres du projet" (icône engrenage)
2. Cliquez sur "Paramètres du projet"
3. Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"
4. Cliquez sur l'icône Web (</>) pour ajouter une application web
5. Donnez un nom à votre application (ex: "bikorent-web")
6. Copiez les informations de configuration

### 4. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet avec les informations suivantes :

```env
# Configuration Firebase
FIREBASE_API_KEY=votre_api_key_ici
FIREBASE_AUTH_DOMAIN=votre_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=votre_project_id
FIREBASE_STORAGE_BUCKET=votre_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
FIREBASE_APP_ID=votre_app_id

# Configuration de l'application
PORT=3000
NODE_ENV=development
USE_FIREBASE=true
DEBUG=false
```

### 5. Configurer les règles de sécurité Firestore

Dans Firestore Database > Règles, configurez les règles suivantes pour le mode développement :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture et l'écriture pour tous (mode développement)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🧪 Test de la Configuration

Avant de procéder à la migration, testez votre configuration Firebase :

```bash
node scripts/test-firebase.js
```

Ce script vérifie :
- ✅ Configuration Firebase valide
- ✅ Firebase activé
- ✅ Connexion à Firestore OK
- ✅ Permissions d'écriture OK
- ✅ Règles de sécurité OK

## 🚀 Migration des Données

### Migration Standard

Pour migrer toutes les données de test vers Firebase :

```bash
node scripts/migrate-to-firebase.js
```

### Migration avec Nettoyage

Pour vider les collections existantes avant la migration :

```bash
node scripts/migrate-to-firebase.js --clear
```

ou

```bash
node scripts/migrate-to-firebase.js -c
```

## 📊 Données Migrées

Le script de migration transfère les données suivantes :

### 1. Utilisateurs (8 utilisateurs)
- **Admin** : Admin BikoRent (gestionnaire immobilier)
- **Propriétaire** : Pierre Martin (investisseur immobilier)
- **Locataires** :
  - Marie Dubois (Architecte)
  - Jean Martin (Ingénieur)
  - Sophie Bernard (Médecin)
  - Pierre Durand (Enseignant)
  - Claire Moreau (Designer)
  - Thomas Leroy (Développeur)

### 2. Propriétés (6 propriétés)
- Appartement T3 - Rue de la Paix (Paris) - Loué
- Studio - Avenue Victor Hugo (Lyon) - Vacant
- Maison T4 - Boulevard Central (Marseille) - Loué
- Appartement T2 - Rue des Fleurs (Toulouse) - Loué
- Studio - Avenue de la République (Nantes) - Loué
- Appartement T3 - Rue du Commerce (Bordeaux) - Loué

### 3. Paiements (8 paiements)
- Paiements de loyer pour différents locataires
- Statuts : payé, en retard, à venir
- Méthodes : virement, chèque, espèces

### 4. Rapports (1 rapport)
- Rapport mensuel de mars 2024
- Statistiques globales
- Détails des propriétés, utilisateurs et paiements

## 🔍 Structure des Collections

### Collection: `properties`
```javascript
{
  id: "auto-generated",
  name: "Nom de la propriété",
  type: "appartement|studio|maison",
  surface: 75,
  rooms: 3,
  bedrooms: 2,
  address: "Adresse complète",
  city: "Ville",
  zipCode: "Code postal",
  coordinates: { lat: 48.8566, lng: 2.3522 },
  monthlyRent: 1200,
  status: "rented|vacant",
  ownerId: "id_du_proprietaire",
  owner: {
    userId: "id_du_proprietaire",
    name: "Nom du propriétaire"
  },
  tenant: {
    userId: "id_du_locataire",
    name: "Nom du locataire",
    monthlyRent: 1200,
    entryDate: "2023-01-15",
    status: "current|overdue|upcoming"
  },
  description: "Description de la propriété",
  features: ["Ascenseur", "Balcon", "Cave"],
  images: ["url1", "url2"],
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Collection: `users`
```javascript
{
  id: "auto-generated",
  type: "admin|owner|tenant",
  profile: {
    firstName: "Prénom",
    lastName: "Nom",
    email: "email@example.com",
    phone: "+33 6 12 34 56 78",
    profession: "Profession",
    workplace: "Lieu de travail",
    address: "Adresse complète",
    bio: "Description",
    photo: "url_photo"
  },
  // Pour les propriétaires uniquement
  owner: {
    totalProperties: 6,
    totalRevenue: 4370,
    averageRent: 728
  },
  // Pour les locataires uniquement
  tenant: {
    monthlyRent: 1200,
    hasDebt: false,
    debtAmount: 0,
    entryDate: "2023-01-15",
    status: "current|overdue|upcoming",
    unpaidMonths: 0,
    lastPayment: "2024-01-15",
    nextPayment: "2024-02-15"
  },
  // Pour l'admin uniquement
  security: { /* ... */ },
  notifications: { /* ... */ },
  preferences: { /* ... */ },
  billing: { /* ... */ },
  integrations: [ /* ... */ ],
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Collection: `payments`
```javascript
{
  id: "auto-generated",
  userId: "id_du_locataire",
  propertyId: "id_de_la_propriete",
  amount: 1200,
  date: "2024-01-15",
  type: "loyer|charges|autre",
  status: "payé|en_retard|en_attente",
  method: "virement|chèque|espèces",
  month: "Jan 2024",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Collection: `users` (Admin)
```javascript
{
  id: "auto-generated",
  type: "admin",
  profile: {
    firstName: "Admin",
    lastName: "BikoRent",
    email: "admin@bikorent.com",
    phone: "+33 1 23 45 67 89",
    profession: "Gestionnaire immobilier",
    workplace: "BikoRent SAS",
    address: "123 Rue de la Paix, 75001 Paris, France",
    bio: "Description...",
    photo: null
  },
  security: {
    twoFactorAuth: false,
    suspiciousLogin: true
  },
  notifications: {
    emailPayments: true,
    emailOverdue: true,
    emailNewTenants: false,
    pushAlerts: true,
    pushReminders: false,
    reportFrequency: "monthly"
  },
  preferences: {
    language: "fr",
    timezone: "Europe/Paris",
    darkMode: false,
    dateFormat: "DD/MM/YYYY",
    currency: "EUR"
  },
  billing: {
    plan: "Premium",
    price: 29.99,
    currency: "EUR",
    paymentMethods: [...],
    billingHistory: [...]
  },
  integrations: [...],
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### Collection: `reports`
```javascript
{
  id: "auto-generated",
  type: "monthly",
  period: "2024-03",
  summary: {
    totalProperties: 6,
    rentedProperties: 5,
    totalTenants: 6,
    totalRevenue: 4370,
    outstandingPayments: 4370
  },
              details: {
                properties: [...],
                users: [...],
                payments: [...]
            },
  generatedAt: "timestamp",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

## 🔄 Basculement entre Firebase et Données de Test

Vous pouvez basculer entre Firebase et les données de test en modifiant la variable `USE_FIREBASE` :

```env
USE_FIREBASE=true   # Utilise Firebase
USE_FIREBASE=false  # Utilise les données de test
```

## 🛠️ Dépannage

### Erreur de connexion Firebase
- Vérifiez que les variables d'environnement sont correctes
- Assurez-vous que le projet Firebase existe et que Firestore est activé
- Vérifiez les règles de sécurité Firestore

### Données non visibles
- Vérifiez que les collections existent dans Firestore
- Assurez-vous que les règles de sécurité permettent la lecture
- Utilisez le mode debug pour voir les erreurs : `DEBUG=true`

### Erreur lors de la migration
- Vérifiez que Firebase est activé : `USE_FIREBASE=true`
- Assurez-vous que les règles de sécurité permettent l'écriture
- Vérifiez la connexion internet
- Consultez les logs d'erreur dans la console

### Performance
- Pour de grandes quantités de données, utilisez la pagination
- Indexez les champs fréquemment utilisés dans Firestore
- Utilisez les requêtes composées pour optimiser les performances

## 📝 Notes Importantes

1. **Mode Test** : Les règles de sécurité sont configurées en mode test pour permettre toutes les opérations
2. **Données de Test** : Les données migrées sont des données de démonstration
3. **Sauvegarde** : Faites une sauvegarde de vos données existantes avant la migration
4. **Production** : Configurez des règles de sécurité plus strictes pour la production

## 🎯 Prochaines Étapes

Après la migration réussie :

1. **Tester l'application** avec les données Firebase
2. **Configurer l'authentification** si nécessaire
3. **Optimiser les requêtes** pour de meilleures performances
4. **Configurer les règles de sécurité** pour la production
5. **Mettre en place la sauvegarde** automatique

## 📞 Support

Si vous rencontrez des problèmes lors de la migration :

1. Vérifiez les logs d'erreur dans la console
2. Testez la connexion avec `node scripts/test-firebase.js`
3. Consultez la documentation Firebase
4. Vérifiez la configuration dans `config/firebase.js`
