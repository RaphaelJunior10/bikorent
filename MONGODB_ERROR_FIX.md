# 🔧 Résolution de l'erreur MongoDB "Command createIndexes requires authentication"

## 🚨 **Problème**

```
MongoServerError: Command createIndexes requires authentication
```

Cette erreur se produit quand l'application essaie de se connecter à MongoDB mais que :
1. MongoDB nécessite une authentification
2. Les credentials ne sont pas fournis
3. L'application utilise `connect-mongo` pour les sessions

## ✅ **Solutions**

### **Solution 1 : Désactiver MongoDB (Recommandée pour la production)**

Votre application utilise Firebase, donc MongoDB n'est pas nécessaire.

#### **Variables d'environnement à configurer :**

```bash
# Désactiver MongoDB
MONGODB_URI=

# Activer Firebase
USE_FIREBASE=true
NODE_ENV=production

# Configuration Firebase
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@votre-project-id.iam.gserviceaccount.com
```

#### **Code modifié dans server.js :**

```javascript
// Configuration des sessions
let sessionStore;
if (process.env.NODE_ENV === 'production' && process.env.USE_FIREBASE === 'true') {
    // En production avec Firebase, utiliser un store en mémoire
    sessionStore = undefined; // Store par défaut (mémoire)
} else {
    // En développement, utiliser MongoDB si disponible
    try {
        sessionStore = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/bikorent-sessions',
            touchAfter: 24 * 3600
        });
    } catch (error) {
        sessionStore = undefined;
    }
}
```

### **Solution 2 : Configurer MongoDB avec authentification**

Si vous voulez garder MongoDB, configurez les credentials :

```bash
# MongoDB avec authentification
MONGODB_URI=mongodb://username:password@host:port/database

# Ou MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### **Solution 3 : Utiliser un store de session alternatif**

#### **A. Store en mémoire (par défaut)**
```javascript
// Pas de store = mémoire
app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false
    // Pas de store
}));
```

#### **B. Store Redis (recommandé pour la production)**
```bash
npm install connect-redis redis
```

```javascript
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false
}));
```

## 🚀 **Déploiement**

### **Variables d'environnement pour le serveur :**

```bash
# Production
NODE_ENV=production
USE_FIREBASE=true
MONGODB_URI=  # Vide pour désactiver

# Firebase
FIREBASE_PROJECT_ID=votre-project-id
FIREBASE_PRIVATE_KEY="votre-cle-privee"
FIREBASE_CLIENT_EMAIL=votre-email-service

# Session
SESSION_SECRET=un-secret-tres-securise
```

### **Vérification :**

```bash
# Tester la configuration
node setup-production.js

# Démarrer le serveur
npm start
```

## 🔍 **Diagnostic**

### **Logs à vérifier :**

```
🏭 Mode production détecté
🔥 Firebase: Activé
🍃 MongoDB: Désactivé
🔧 Configuration des sessions en mémoire (pas de MongoDB)
```

### **Si l'erreur persiste :**

1. **Vérifier les variables d'environnement**
2. **Redémarrer le serveur**
3. **Vérifier que Firebase est bien configuré**
4. **Utiliser le store en mémoire**

## 📋 **Checklist de résolution**

- [ ] `NODE_ENV=production` défini
- [ ] `USE_FIREBASE=true` défini
- [ ] `MONGODB_URI` vide ou non défini
- [ ] Variables Firebase configurées
- [ ] Serveur redémarré
- [ ] Logs de production visibles

## 🎯 **Résultat attendu**

```
🚀 Serveur BikoRent démarré sur http://0.0.0.0:3000
🏭 Mode production détecté
🔥 Firebase: Activé
🍃 MongoDB: Désactivé
🔧 Configuration des sessions en mémoire (pas de MongoDB)
```
