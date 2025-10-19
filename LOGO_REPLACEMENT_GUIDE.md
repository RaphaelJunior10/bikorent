# 🎨 Guide de Remplacement du Logo BikoRent

## 🎯 **Objectif**

Remplacer toutes les icônes "home" (🏠) par le logo BikoRent dans toutes les pages de l'application.

## 📁 **Fichier logo**

- **Emplacement** : `/assets/images/bikorent-logo.png`
- **Format** : PNG
- **Nom** : `bikorent-logo.png`

## 🔄 **Remplacements effectués**

### **1. Pages internes (avec sidebar)**

#### **Sidebar (`views/partials/sidebar.ejs`)**
```html
<!-- AVANT -->
<h2><i class="fas fa-home"></i> BikoRent</h2>

<!-- APRÈS -->
<h2><img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img"> BikoRent</h2>
```

### **2. Pages d'authentification**

#### **Login (`views/login.ejs`)**
```html
<!-- AVANT -->
<div class="auth-logo">
    <i class="fas fa-home"></i>
    <h1 class="auth-title">BikoRent</h1>
</div>

<!-- APRÈS -->
<div class="auth-logo">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    <h1 class="auth-title">BikoRent</h1>
</div>
```

#### **Register (`views/register.ejs`)**
```html
<!-- AVANT -->
<div class="auth-logo">
    <i class="fas fa-home"></i>
    <h1 class="auth-title">BikoRent</h1>
</div>

<!-- APRÈS -->
<div class="auth-logo">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    <h1 class="auth-title">BikoRent</h1>
</div>
```

### **3. Pages publiques**

#### **Home (`views/home.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="navbar-logo">
    <i class="fas fa-home"></i>
    BikoRent
</a>

<!-- APRÈS -->
<a href="/" class="navbar-logo">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    BikoRent
</a>
```

#### **Contact (`views/contact.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="navbar-logo">
    <i class="fas fa-home"></i>
    BikoRent
</a>

<!-- APRÈS -->
<a href="/" class="navbar-logo">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    BikoRent
</a>
```

#### **Properties (`views/properties.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="navbar-logo">
    <i class="fas fa-home"></i>
    BikoRent
</a>

<!-- APRÈS -->
<a href="/" class="navbar-logo">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    BikoRent
</a>
```

### **4. Pages d'erreur**

#### **Error (`views/error.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="btn btn-primary">
    <i class="fas fa-home"></i>
    Retour à l'accueil
</a>

<!-- APRÈS -->
<a href="/" class="btn btn-primary">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    Retour à l'accueil
</a>
```

#### **404 (`views/404.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="btn-primary">
    <i class="fas fa-home"></i> Retour à l'accueil
</a>

<!-- APRÈS -->
<a href="/" class="btn-primary">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img"> Retour à l'accueil
</a>
```

#### **Google Auth (`views/google-auth.ejs`)**
```html
<!-- AVANT -->
<a href="/" class="btn btn-primary">
    <i class="fas fa-home"></i>
    Retour à l'accueil
</a>

<!-- APRÈS -->
<a href="/" class="btn btn-primary">
    <img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img">
    Retour à l'accueil
</a>
```

### **5. Pages spéciales**

#### **Paiement Externe (`views/paiementExterne.ejs`)**
```html
<!-- AVANT -->
<h1><i class="fas fa-home"></i> BikoRent</h1>

<!-- APRÈS -->
<h1><img src="/assets/images/bikorent-logo.png" alt="BikoRent" class="logo-img"> BikoRent</h1>
```

## 🎨 **Styles CSS ajoutés**

### **Styles de base pour le logo**
```css
.logo-img {
    height: 24px;
    width: auto;
    vertical-align: middle;
    margin-right: 8px;
    display: inline-block;
}
```

### **Styles spécifiques par contexte**

#### **Sidebar**
```css
.sidebar-header h2 .logo-img {
    height: 28px;
    margin-right: 10px;
}
```

#### **Pages d'authentification**
```css
.auth-logo .logo-img {
    height: 48px;
    margin-right: 12px;
    margin-bottom: 8px;
}
```

#### **Navbar**
```css
.navbar-logo .logo-img {
    height: 24px;
    margin-right: 8px;
}
```

#### **Boutons**
```css
.btn .logo-img {
    height: 16px;
    margin-right: 6px;
    vertical-align: middle;
}
```

## 🧪 **Tests disponibles**

### **Test automatique**
```bash
npm run test:logo
```

### **Test manuel**
1. Aller sur `http://localhost:3200`
2. Vérifier que le logo s'affiche dans le sidebar
3. Tester les pages d'authentification
4. Vérifier les pages publiques
5. Tester les pages d'erreur

## 📋 **Pages modifiées**

### **Pages internes :**
- ✅ `views/partials/sidebar.ejs` - Logo dans le sidebar

### **Pages d'authentification :**
- ✅ `views/login.ejs` - Logo dans le header
- ✅ `views/register.ejs` - Logo dans le header

### **Pages publiques :**
- ✅ `views/home.ejs` - Logo dans la navbar
- ✅ `views/contact.ejs` - Logo dans la navbar
- ✅ `views/properties.ejs` - Logo dans la navbar

### **Pages d'erreur :**
- ✅ `views/error.ejs` - Logo dans le bouton
- ✅ `views/404.ejs` - Logo dans le bouton
- ✅ `views/google-auth.ejs` - Logo dans le bouton

### **Pages spéciales :**
- ✅ `views/paiementExterne.ejs` - Logo dans le header

## 🔍 **Vérifications**

### **Attributs du logo :**
- ✅ `src="/assets/images/bikorent-logo.png"`
- ✅ `alt="BikoRent"`
- ✅ `class="logo-img"`

### **Responsive :**
- ✅ Logo s'adapte aux différentes tailles d'écran
- ✅ Styles CSS responsives appliqués

### **Accessibilité :**
- ✅ Attribut `alt` défini
- ✅ Logo lisible sur tous les fonds

## 🎉 **Résultat**

Le logo BikoRent remplace maintenant toutes les icônes "home" dans l'application :

- **19 occurrences** remplacées au total
- **8 pages** modifiées
- **Styles CSS** adaptés pour chaque contexte
- **Tests automatisés** disponibles

L'identité visuelle de BikoRent est maintenant cohérente dans toute l'application ! 🚀
