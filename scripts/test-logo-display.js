#!/usr/bin/env node

/**
 * Script de test pour vérifier l'affichage du logo BikoRent
 */

const axios = require('axios');

async function testLogoDisplay() {
    console.log('🧪 Test de l\'affichage du logo BikoRent');
    
    const baseUrl = 'http://localhost:3200';
    const axiosInstance = axios.create({
        baseURL: baseUrl,
        timeout: 10000
    });
    
    const pagesToTest = [
        { path: '/', name: 'Page d\'accueil' },
        { path: '/contact', name: 'Page de contact' },
        { path: '/properties', name: 'Page des propriétés' },
        { path: '/auth/login', name: 'Page de connexion' },
        { path: '/auth/register', name: 'Page d\'inscription' }
    ];
    
    try {
        for (const page of pagesToTest) {
            console.log(`\n📄 Test de ${page.name} (${page.path})`);
            
            try {
                const response = await axiosInstance.get(page.path);
                const html = response.data;
                
                // Vérifier la présence du logo dans le HTML
                const logoMatches = html.match(/bikorent-logo\.png/g);
                const logoCount = logoMatches ? logoMatches.length : 0;
                
                if (logoCount > 0) {
                    console.log(`✅ Logo trouvé (${logoCount} occurrence(s))`);
                    
                    // Vérifier les attributs du logo
                    const logoImgMatches = html.match(/<img[^>]*bikorent-logo\.png[^>]*>/g);
                    if (logoImgMatches) {
                        logoImgMatches.forEach((match, i) => {
                            const srcMatch = match.match(/src="([^"]*)"/);
                            const altMatch = match.match(/alt="([^"]*)"/);
                            const classMatch = match.match(/class="([^"]*)"/);
                            
                            console.log(`  📸 Logo ${i + 1}:`);
                            console.log(`     - Source: ${srcMatch ? srcMatch[1] : 'Non trouvé'}`);
                            console.log(`     - Alt: ${altMatch ? altMatch[1] : 'Non défini'}`);
                            console.log(`     - Classes: ${classMatch ? classMatch[1] : 'Aucune'}`);
                        });
                    }
                } else {
                    console.log('❌ Aucun logo trouvé');
                    
                    // Vérifier s'il y a encore des icônes home
                    const homeIconMatches = html.match(/fa-home/g);
                    if (homeIconMatches) {
                        console.log(`⚠️  ${homeIconMatches.length} icône(s) home trouvée(s) - remplacement nécessaire`);
                    }
                }
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log('⚠️  Page non trouvée (404)');
                } else {
                    console.log(`❌ Erreur lors du test: ${error.message}`);
                }
            }
        }
        
        // Test spécifique du logo dans le dossier public
        console.log('\n📁 Test de l\'existence du fichier logo');
        try {
            const logoResponse = await axiosInstance.get('/images/bikorent-logo.png');
            console.log('✅ Fichier logo accessible:', logoResponse.status);
        } catch (error) {
            console.log('❌ Fichier logo non accessible:', error.message);
        }
        
        console.log('\n🎉 Test du logo terminé !');
        console.log('💡 Vérifiez manuellement que le logo s\'affiche correctement dans le navigateur');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Assurez-vous que le serveur est démarré: npm start');
        }
    }
}

// Exécuter le test
testLogoDisplay();
