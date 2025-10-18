# Correction du problème d'initialisation Firebase Admin SDK

## Problème rencontré

Lors de l'exécution du cron job pour vérifier les retards de paiement, l'erreur suivante se produisait :

```
FirebaseAppError: The default Firebase app does not exist. 
Make sure you call initializeApp() before using any of the Firebase services.
```

## Cause

Il y avait **deux initialisations différentes** de Firebase Admin SDK dans le projet :

1. **`config/firebase.js`** : Initialise une app nommée `'admin'`
   ```javascript
   adminApp = admin.initializeApp({
       credential: admin.credential.cert(serviceAccount),
       storageBucket: firebaseConfig.storageBucket
   }, 'admin');  // ← Nom spécifié
   ```

2. **`config/firebase-admin.js`** : Initialise l'app par défaut (sans nom)
   ```javascript
   admin.initializeApp({
       credential: admin.credential.cert(serviceAccount)
   });  // ← Pas de nom (app par défaut)
   ```

Ces deux apps sont **distinctes** dans Firebase Admin SDK. Quand `automationService` essayait d'accéder à Firestore via `firebase-admin.js`, il cherchait l'app par défaut qui n'existait pas, car seule l'app nommée `'admin'` avait été créée par `firebase.js`.

## Solution implémentée

### 1. Modification de `config/firebase-admin.js`

La fonction `initializeFirebase()` a été améliorée pour :

1. **Vérifier d'abord si l'app `'admin'` existe** (créée par `firebase.js`)
2. Si elle n'existe pas, **essayer l'app par défaut**
3. Si aucune app n'existe, **en créer une nouvelle**

```javascript
function initializeFirebase() {
    try {
        if (!adminInstance) {
            try {
                // Essayer l'app 'admin' d'abord
                adminInstance = admin.app('admin');
                console.log('✅ Utilisation de l\'instance Firebase Admin existante (admin)');
            } catch (e) {
                // Sinon essayer l'app par défaut
                if (admin.apps.length > 0) {
                    adminInstance = admin.app();
                    console.log('✅ Utilisation de l\'instance Firebase Admin par défaut');
                } else {
                    // Créer une nouvelle instance si aucune n'existe
                    const serviceAccount = require('./keys/firebase-service-account.json');
                    adminInstance = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    console.log('✅ Firebase Admin SDK initialisé (nouvelle instance)');
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Firebase:', error.message);
        throw error;
    }
    return adminInstance;
}
```

### 2. Amélioration de `getFirestore()`

Ajout d'une meilleure gestion des erreurs avec réinitialisation automatique :

```javascript
function getFirestore() {
    try {
        if (!firestoreInstance) {
            const firebaseAdmin = initializeFirebase();
            firestoreInstance = firebaseAdmin.firestore();
            console.log('✅ Instance Firestore créée avec succès');
        }
        return firestoreInstance;
    } catch (error) {
        console.error('❌ Erreur lors de l\'accès à Firestore:', error.message);
        // Réinitialiser et réessayer
        firestoreInstance = null;
        adminInstance = null;
        const firebaseAdmin = initializeFirebase();
        firestoreInstance = firebaseAdmin.firestore();
        return firestoreInstance;
    }
}
```

### 3. Amélioration de `automationService.js`

Ajout d'une vérification explicite de Firebase au début de `checkUnpaidRentNotifications()` :

```javascript
async checkUnpaidRentNotifications() {
    try {
        console.log('🔔 Vérification des retards de paiement...');

        // S'assurer que Firebase est initialisé
        try {
            initializeFirebase();
            console.log('✅ Firebase Admin SDK vérifié/initialisé');
        } catch (firebaseError) {
            console.log('⚠️ Firebase déjà initialisé ou erreur:', firebaseError.message);
        }

        // ... reste du code
    }
}
```

### 4. Amélioration du cron job dans `server.js`

Ajout d'une meilleure gestion des erreurs :

```javascript
cron.schedule('36 5 11 * *', async () => {
    console.log('🔔 Vérification automatique des retards de paiement');
    try {
        await automationService.checkUnpaidRentNotifications();
        console.log('✅ Vérification des retards de paiement terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de la vérification automatique des retards:', error);
    }
});
```

## Test de la solution

### Script de test manuel

Un script de test a été créé pour vérifier l'initialisation :

```bash
node scripts/test-firebase-init.js
```

Ce script vérifie :
- ✅ Chargement de `config/firebase.js`
- ✅ Initialisation via `firebase-admin.js`
- ✅ Accès à Firestore
- ✅ Chargement de `automationService`
- ✅ Chargement de `dataService`

### Test du cron job

Pour tester la vérification des retards de paiement :

```bash
node scripts/check-unpaid-rent.js
```

## Prévention future

Pour éviter ce problème à l'avenir :

1. **Toujours utiliser `firebase-admin.js`** pour accéder à Firebase Admin SDK dans les services
2. **Ne pas créer plusieurs instances** avec des noms différents
3. **Tester l'initialisation** avant de déployer des cron jobs
4. **Ajouter des logs** pour faciliter le débogage

## Logs à surveiller

Après correction, vous devriez voir ces logs au démarrage :

```
✅ Admin SDK Firebase initialisé avec succès (clé de service)
✅ Utilisation de l'instance Firebase Admin existante (admin)
✅ Instance Firestore créée avec succès
```

Et lors de l'exécution du cron job :

```
🔔 Vérification automatique des retards de paiement
🔔 Vérification des retards de paiement...
✅ Firebase Admin SDK vérifié/initialisé
📊 21 utilisateurs trouvés
...
✅ Vérification des retards de paiement terminée avec succès
```

## Fichiers modifiés

- ✅ `config/firebase-admin.js` - Harmonisation de l'initialisation
- ✅ `services/automationService.js` - Vérification Firebase + meilleure gestion d'erreurs
- ✅ `server.js` - Gestion d'erreur du cron job
- ✅ `scripts/test-firebase-init.js` - Script de test (nouveau)
- ✅ `FIREBASE_ADMIN_FIX.md` - Cette documentation (nouveau)

## Références

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Multiple Firebase Apps](https://firebase.google.com/docs/admin/setup#multiple-apps)

