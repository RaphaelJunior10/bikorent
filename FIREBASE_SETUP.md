# Configuration Firebase pour BikoRent

## 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Donnez un nom à votre projet (ex: "bikorent-app")
4. Suivez les étapes de configuration

## 2. Activer Firestore Database

1. Dans la console Firebase, allez dans "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Mode test" pour commencer
4. Sélectionnez l'emplacement de votre base de données

## 3. Obtenir les informations de configuration

1. Dans la console Firebase, allez dans "Paramètres du projet" (icône engrenage)
2. Cliquez sur "Paramètres du projet"
3. Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"
4. Cliquez sur l'icône Web (</>) pour ajouter une application web
5. Donnez un nom à votre application (ex: "bikorent-web")
6. Copiez les informations de configuration

## 4. Configuration des variables d'environnement

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

## 5. Structure des collections Firestore

L'application utilise les collections suivantes :

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
  type: "admin|tenant",
  profile: {
    firstName: "Prénom",
    lastName: "Nom",
    email: "email@example.com",
    phone: "+33 1 23 45 67 89",
    profession: "Profession",
    workplace: "Lieu de travail",
    address: "Adresse complète",
    bio: "Description",
    photo: "url_photo"
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

## 6. Règles de sécurité Firestore

Configurez les règles de sécurité dans Firestore Database > Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture et l'écriture pour tous (mode développement)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // Pour la production, utilisez des règles plus strictes :
    // match /properties/{propertyId} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

## 7. Test de la connexion

1. Démarrez l'application : `npm start`
2. Vérifiez dans la console que Firebase est connecté
3. Les données de test seront utilisées si Firebase n'est pas configuré

## 8. Basculement entre Firebase et données de test

Vous pouvez basculer entre Firebase et les données de test en modifiant la variable `USE_FIREBASE` :

```env
USE_FIREBASE=true   # Utilise Firebase
USE_FIREBASE=false  # Utilise les données de test
```

## 9. Migration des données

Pour migrer les données de test vers Firebase :

1. Assurez-vous que Firebase est configuré et connecté
2. L'application utilisera automatiquement Firebase si `USE_FIREBASE=true`
3. Les nouvelles données seront sauvegardées dans Firestore
4. Les données existantes dans Firestore seront récupérées

## 10. Dépannage

### Erreur de connexion Firebase
- Vérifiez que les variables d'environnement sont correctes
- Assurez-vous que le projet Firebase existe et que Firestore est activé
- Vérifiez les règles de sécurité Firestore

### Données non visibles
- Vérifiez que les collections existent dans Firestore
- Assurez-vous que les règles de sécurité permettent la lecture
- Utilisez le mode debug pour voir les erreurs : `DEBUG=true`

### Performance
- Pour de grandes quantités de données, utilisez la pagination
- Indexez les champs fréquemment utilisés dans Firestore
- Utilisez les requêtes composées pour optimiser les performances 