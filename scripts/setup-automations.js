const { getFirestore } = require('../config/firebase-admin');

async function setupAutomations() {
    try {
        console.log('🚀 Initialisation des automatisations...');
        
        const db = getFirestore();
        
        // Définir les 10 automatisations disponibles
        const automations = [
            {
                id: 'unpaid-rent-notification',
                name: 'Notifier les loyers impayés',
                description: 'Recevez automatiquement une notification sur WhatsApp ou par email lorsqu\'un loyer est en retard',
                category: 'Notifications',
                icon: 'fa-bell',
                color: '#E01E5A',
                isActive: true,
                settings: {
                    notificationMethod: {
                        type: 'select',
                        label: 'Méthode de notification',
                        options: ['email', 'whatsapp'],
                        default: 'email'
                    },
                    checkFrequency: {
                        type: 'select',
                        label: 'Fréquence de vérification',
                        options: ['daily', 'weekly', 'monthly'],
                        default: 'daily'
                    }
                }
            },
            {
                id: 'email-tenant-confirmation',
                name: 'Email de confirmation locataire',
                description: 'Envoyez automatiquement un email de bienvenue à chaque nouveau locataire',
                category: 'Communication',
                icon: 'fa-envelope',
                color: '#0078D4',
                isActive: true,
                settings: {
                    emailTemplate: {
                        type: 'textarea',
                        label: 'Template d\'email',
                        default: 'Bienvenue dans votre nouveau logement !'
                    },
                    sendDelay: {
                        type: 'number',
                        label: 'Délai d\'envoi (heures)',
                        default: 0
                    }
                }
            },
            {
                id: 'google-calendar-events',
                name: 'Événements BikoRent Calendar',
                description: 'Créez automatiquement des événements dans BikoRent Calendar pour les visites et échéances de bail',
                category: 'Calendrier',
                icon: 'fa-calendar',
                color: '#4285F4',
                isActive: true,
                settings: {
                    eventTypes: {
                        type: 'multi-select',
                        label: 'Types d\'événements',
                        options: ['visite', 'echeance_bail', 'paiement'],
                        default: ['visite', 'echeance_bail']
                    },
                    reminderMinutes: {
                        type: 'number',
                        label: 'Rappel avant l\'événement (minutes)',
                        default: 60
                    }
                }
            },
            /*{
                id: 'google-sheets-sync',
                name: 'Synchronisation Google Sheets',
                description: 'Ajoutez automatiquement chaque nouveau bien immobilier dans une feuille Google Sheets',
                category: 'Gestion',
                icon: 'fa-table',
                color: '#34A853',
                isActive: false,
                settings: {
                    spreadsheetId: {
                        type: 'text',
                        label: 'ID de la feuille Google Sheets',
                        default: ''
                    }
                }
            },
            {
                id: 'trello-incident-ticket',
                name: 'Tickets d\'incident Trello',
                description: 'Créez automatiquement un ticket lorsqu\'un incident est signalé',
                category: 'Gestion',
                icon: 'fa-ticket-alt',
                color: '#0079BF',
                isActive: false,
                settings: {
                    boardId: {
                        type: 'text',
                        label: 'ID du tableau Trello',
                        default: ''
                    }
                }
            },
            {
                id: 'google-drive-receipts',
                name: 'Quittances Google Drive',
                description: 'Générez et stockez automatiquement les quittances de loyer dans Google Drive',
                category: 'Documents',
                icon: 'fa-file-invoice',
                color: '#4285F4',
                isActive: false,
                settings: {
                    folderId: {
                        type: 'text',
                        label: 'ID du dossier Google Drive',
                        default: ''
                    }
                }
            },
            {
                id: 'crm-tenant-sync',
                name: 'Ajout au CRM',
                description: 'Ajoutez automatiquement chaque nouveau locataire à votre CRM',
                category: 'CRM',
                icon: 'fa-users',
                color: '#FF7A59',
                isActive: false,
                settings: {
                    crmProvider: {
                        type: 'select',
                        label: 'Fournisseur CRM',
                        options: ['hubspot', 'salesforce', 'pipedrive'],
                        default: 'hubspot'
                    }
                }
            },*/
            /*{
                id: 'lease-expiry-reminder',
                name: 'Rappel fin de bail',
                description: 'Envoyez automatiquement un rappel 30 jours avant la fin d\'un bail',
                category: 'Communication',
                icon: 'fa-clock',
                color: '#F59E0B',
                isActive: false,
                settings: {
                    reminderDays: {
                        type: 'number',
                        label: 'Nombre de jours avant',
                        default: 30
                    }
                }
            },
            {
                id: 'dropbox-tenant-folder',
                name: 'Dossier Dropbox locataire',
                description: 'Créez automatiquement un dossier Dropbox pour chaque nouveau locataire',
                category: 'Documents',
                icon: 'fa-folder',
                color: '#0061FF',
                isActive: false,
                settings: {
                    parentFolderId: {
                        type: 'text',
                        label: 'ID du dossier parent',
                        default: ''
                    }
                }
            },*/
            {
                id: 'accountant-payment-alert',
                name: 'Alerte comptable',
                description: 'Alertez automatiquement votre comptable lorsqu\'un paiement est reçu',
                category: 'Finance',
                icon: 'fa-calculator',
                color: '#10B981',
                isActive: false,
                settings: {
                    accountantEmail: {
                        type: 'email',
                        label: 'Email du comptable',
                        default: ''
                    }
                }
            }
        ];

        // Créer ou mettre à jour chaque automatisation
        for (const automation of automations) {
            await db.collection('automations').doc(automation.id).set(automation, { merge: true });
            console.log(`✅ Automatisation créée: ${automation.name}`);
        }

        console.log(`\n🎉 ${automations.length} automatisations créées avec succès dans Firebase !`);
        console.log('\nLes 3 automatisations activées par défaut:');
        console.log('  1. Notifier les loyers impayés');
        console.log('  2. Email de confirmation locataire');
        console.log('  3. Événements Google Calendar');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur lors de la configuration des automatisations:', error);
        process.exit(1);
    }
}

// Exécuter le script
setupAutomations();
