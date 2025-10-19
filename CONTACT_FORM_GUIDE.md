# 📧 Guide du Formulaire de Contact

## 🎯 **Fonctionnalité implémentée**

Le formulaire de contact permet aux utilisateurs d'envoyer des messages directement depuis le site web. Les messages sont traités par le backend et envoyés par email.

## 🔧 **Composants implémentés**

### **1. Route Backend (`routes/contact.js`)**

```javascript
// Route POST /contact/send
router.post('/send', async (req, res) => {
    // Validation des champs requis
    // Validation de l'email
    // Envoi via dataService.sendMail()
    // Gestion des erreurs
});
```

**Fonctionnalités :**
- ✅ Validation des champs obligatoires (prénom, nom, email, message)
- ✅ Validation du format d'email
- ✅ Envoi d'email via `dataService.sendMail()`
- ✅ Gestion des erreurs avec messages appropriés
- ✅ Logs détaillés pour le debugging

### **2. Frontend JavaScript (`views/contact.ejs`)**

```javascript
// Gestion du formulaire
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    // Prévention du comportement par défaut
    // Récupération des données du formulaire
    // Envoi de la requête POST vers /contact/send
    // Gestion des réponses (succès/erreur)
    // Réinitialisation du formulaire en cas de succès
});
```

**Fonctionnalités :**
- ✅ Prévention du rechargement de page
- ✅ Désactivation du bouton pendant l'envoi
- ✅ Affichage d'un loader pendant l'envoi
- ✅ Gestion des réponses de succès et d'erreur
- ✅ Réinitialisation automatique du formulaire
- ✅ Scroll automatique vers les messages

### **3. Interface Utilisateur**

**Messages de notification :**
- ✅ Message de succès avec icône verte
- ✅ Message d'erreur avec icône rouge
- ✅ Masquage automatique des messages précédents
- ✅ Scroll automatique vers les messages

**États du bouton :**
- ✅ État normal : "Envoyer le message"
- ✅ État de chargement : "Envoi en cours..." avec spinner
- ✅ Désactivation pendant l'envoi

## 📋 **Champs du formulaire**

### **Champs obligatoires :**
- **Prénom** (`firstName`) - Texte
- **Nom** (`lastName`) - Texte  
- **Email** (`email`) - Email avec validation
- **Message** (`message`) - Texte long

### **Champs optionnels :**
- **Téléphone** (`phone`) - Téléphone
- **Sujet** (`subject`) - Sélection (Support, Facturation, Technique, Autre)

## 🔄 **Flux de traitement**

### **1. Soumission du formulaire**
```
Utilisateur clique "Envoyer" 
→ JavaScript intercepte l'événement
→ Validation côté client (HTML5)
→ Envoi des données au backend
```

### **2. Traitement backend**
```
Réception des données
→ Validation des champs requis
→ Validation du format email
→ Préparation du contenu HTML
→ Envoi via dataService.sendMail()
→ Retour de la réponse JSON
```

### **3. Gestion de la réponse**
```
Réception de la réponse
→ Si succès : Affichage message + Réinitialisation
→ Si erreur : Affichage message d'erreur
→ Réactivation du bouton
```

## 📧 **Format de l'email envoyé**

```html
<h2>Nouveau message de contact</h2>
<p><strong>Nom:</strong> [Prénom] [Nom]</p>
<p><strong>Email:</strong> [email]</p>
<p><strong>Téléphone:</strong> [téléphone] (si fourni)</p>
<p><strong>Sujet:</strong> [sujet]</p>
<hr>
<h3>Message:</h3>
<p>[message formaté en HTML]</p>
```

## 🧪 **Tests disponibles**

### **Test automatique :**
```bash
npm run test:contact-form
```

### **Test manuel :**
1. Aller sur `http://localhost:3200/contact`
2. Remplir le formulaire avec des données valides
3. Cliquer sur "Envoyer le message"
4. Vérifier l'affichage du message de succès
5. Vérifier que le formulaire est réinitialisé

### **Test de validation :**
1. Laisser des champs obligatoires vides
2. Utiliser un email invalide
3. Vérifier l'affichage des messages d'erreur appropriés

## 🛠️ **Configuration**

### **Email de destination :**
```javascript
// Dans routes/contact.js
await dataService.sendMail(
    'contact@bikorent.com', // Email de destination
    `Message de contact - ${firstName} ${lastName}`,
    '/contact',
    emailContent
);
```

### **Variables d'environnement requises :**
- `SMTP_HOST` - Serveur SMTP
- `SMTP_PORT` - Port SMTP
- `SMTP_USER` - Utilisateur SMTP
- `SMTP_PASS` - Mot de passe SMTP

## 🔍 **Debugging**

### **Logs côté serveur :**
```
📧 Envoi de message de contact: { firstName, lastName, email, subject }
✅ Message de contact envoyé avec succès
❌ Erreur lors de l'envoi du message de contact: [détails]
```

### **Logs côté client :**
```javascript
console.error('Erreur lors de l\'envoi:', error);
```

## 📁 **Fichiers modifiés**

- **`routes/contact.js`** - Route POST pour traiter les messages
- **`views/contact.ejs`** - JavaScript pour la gestion du formulaire
- **`scripts/test-contact-form.js`** - Script de test
- **`package.json`** - Ajout du script de test

## 🎉 **Résultat**

Le formulaire de contact est maintenant entièrement fonctionnel avec :
- ✅ Validation complète des données
- ✅ Envoi d'emails automatique
- ✅ Gestion des erreurs
- ✅ Interface utilisateur intuitive
- ✅ Tests automatisés

Les utilisateurs peuvent maintenant envoyer des messages directement depuis le site web ! 🚀
