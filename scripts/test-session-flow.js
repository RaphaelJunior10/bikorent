#!/usr/bin/env node

/**
 * Script de test du flux de session
 */

const axios = require('axios');

async function testSessionFlow() {
    console.log('🧪 Test du flux de session');
    
    const baseUrl = 'http://localhost:3200';
    const axiosInstance = axios.create({
        baseURL: baseUrl,
        withCredentials: true, // Important pour les cookies
        timeout: 10000
    });
    
    try {
        // Étape 1: Tester l'accès à la page de connexion
        console.log('📄 Étape 1: Accès à la page de connexion');
        const loginPageResponse = await axiosInstance.get('/auth/login');
        console.log('✅ Page de connexion accessible:', loginPageResponse.status);
        
        // Étape 2: Tester la configuration Firebase
        console.log('📄 Étape 2: Configuration Firebase');
        const firebaseConfigResponse = await axiosInstance.get('/auth/firebase-config');
        console.log('✅ Configuration Firebase:', firebaseConfigResponse.status);
        
        // Étape 3: Tester l'accès au dashboard (doit rediriger vers login)
        console.log('📄 Étape 3: Accès au dashboard (non connecté)');
        try {
            const dashboardResponse = await axiosInstance.get('/dashboard');
            console.log('⚠️ Dashboard accessible sans connexion:', dashboardResponse.status);
        } catch (error) {
            if (error.response && error.response.status === 302) {
                console.log('✅ Redirection vers login (attendu)');
            } else {
                console.log('❌ Erreur inattendue:', error.message);
            }
        }
        
        // Étape 4: Tester la page d'accueil
        console.log('📄 Étape 4: Page d\'accueil');
        const homeResponse = await axiosInstance.get('/');
        console.log('✅ Page d\'accueil accessible:', homeResponse.status);
        
        console.log('\n🎯 Test terminé !');
        console.log('💡 Pour tester la connexion complète, utilisez le navigateur');
        console.log('🌐 URL: http://localhost:3200/auth/login');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Assurez-vous que le serveur est démarré: npm start');
        }
    }
}

// Exécuter le test
testSessionFlow();
