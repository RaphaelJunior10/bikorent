// Chat JavaScript - Logique pour la page de chat
class ChatManager {
    constructor() {
        console.log('🏗️ Construction du ChatManager...');
        this.currentPropertyId = null;
        this.currentUserId = null; // Sera défini dynamiquement
        this.messages = [];
        this.conversations = [];
        this.isLoading = false;
        this.refreshInterval = null;
        
        // Initialiser l'ID utilisateur depuis les données de la page
        this.initializeUserId();
        
        console.log('🔧 Initialisation du ChatManager...');
        this.init();
    }
    
    initializeUserId() {
        // Récupérer l'ID utilisateur depuis les données de la page
        const userIdElement = document.getElementById('currentUserId');
        if (userIdElement) {
            this.currentUserId = userIdElement.textContent || userIdElement.value;
            console.log('👤 ID utilisateur initialisé:', this.currentUserId);
        } else {
            console.error('❌ Impossible de récupérer l\'ID utilisateur');
        }
    }
    
    init() {
        console.log('🔧 Initialisation du ChatManager...');
        this.bindEvents();
        console.log('📡 Chargement des conversations...');
        this.loadConversations();
        
        // Forcer l'affichage de la liste des conversations sur mobile
        this.ensureMobileView();
        
        // Gérer la redirection depuis la page de détails
        this.handlePropertyRedirect();
        
        // Désactiver temporairement l'auto-refresh pour éviter les erreurs
        // this.startAutoRefresh();
        // Désactiver temporairement la mise à jour du badge qui échoue
        // this.updateUnreadBadge();
    }
    
    bindEvents() {
        // Événements pour les conversations
        document.addEventListener('click', (e) => {
            if (e.target.closest('.conversation-item')) {
                const conversationItem = e.target.closest('.conversation-item');
                const propertyId = conversationItem.dataset.propertyId;
                const senderId = conversationItem.dataset.senderId;
                this.selectConversation(propertyId, senderId);
            }
        });
        
        // Bouton retour aux conversations (mobile)
        document.addEventListener('click', (e) => {
            if (e.target.closest('#backToConversations')) {
                this.showConversationsList();
            }
        });
        
        // Envoi de message
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sendMessage')) {
                this.sendMessage();
            }
        });
        
        // Envoi avec Enter
        document.addEventListener('keydown', (e) => {
            if (e.target.id === 'messageInput' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Auto-resize du textarea
        document.addEventListener('input', (e) => {
            if (e.target.id === 'messageInput') {
                this.autoResizeTextarea(e.target);
            }
        });
        
        // Recherche de conversations
        document.addEventListener('input', (e) => {
            if (e.target.id === 'searchConversations') {
                this.searchConversations(e.target.value);
            }
        });
        
        // Actualisation
        document.addEventListener('click', (e) => {
            if (e.target.closest('#refreshChat')) {
                this.refreshChat();
            }
        });
        
        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.ensureMobileView();
        });
        
        // Gérer le popup d'informations utilisateur
        document.addEventListener('click', (e) => {
            if (e.target.closest('#conversationInfo')) {
                this.showUserInfoPopup();
            }
            if (e.target.closest('#closeUserInfoPopup') || e.target.closest('#closeUserInfoPopup2')) {
                this.hideUserInfoPopup();
            }
            if (e.target.closest('#copyUserName')) {
                this.copyUserName();
            }
        });
        
        // Fermer le popup en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (e.target.id === 'userInfoPopup') {
                this.hideUserInfoPopup();
            }
            if (e.target.id === 'addTenantPopup') {
                this.hideAddTenantPopup();
            }
        });
        
        // Gérer le popup d'ajout de locataire
        document.addEventListener('click', (e) => {
            if (e.target.closest('#addTenantBtn')) {
                this.showAddTenantPopup();
            }
            if (e.target.closest('#closeAddTenantPopup') || e.target.closest('#cancelAddTenant')) {
                this.hideAddTenantPopup();
            }
            if (e.target.closest('#confirmAddTenant')) {
                this.confirmAddTenant();
            }
        });
    }
    
    async loadConversations() {
        try {
            console.log('🔄 Chargement des conversations...');
            this.showLoading(true);
            
            // Désactiver temporairement la requête API qui échoue
            // const response = await fetch('/chat/api/unread-count');
            // const data = await response.json();
            
            // if (data.success) {
            //     this.updateUnreadBadge(data.unreadCount);
            // }
            
            // Les conversations sont déjà chargées côté serveur
            this.conversations = window.conversations || [];
            console.log('📋 Conversations reçues:', this.conversations);
            console.log('📋 Nombre de conversations:', this.conversations.length);
            console.log('📋 window.conversations:', window.conversations);
            console.log('📋 Type de window.conversations:', typeof window.conversations);
            console.log('📋 window.conversations est undefined?', window.conversations === undefined);
            console.log('📋 window.conversations est null?', window.conversations === null);
            console.log('📋 window.conversations est un array?', Array.isArray(window.conversations));
            this.renderConversations();
            
        } catch (error) {
            console.error('Erreur lors du chargement des conversations:', error);
            this.showError('Erreur lors du chargement des conversations');
        } finally {
            this.showLoading(false);
        }
    }
    
    async selectConversation(propertyId, senderId) {
        if (this.currentPropertyId === propertyId && this.currentSenderId === senderId) return;
        
        try {
            this.currentPropertyId = propertyId;
            this.currentSenderId = senderId;
            this.showLoading(true);
            
            // Mettre à jour l'interface
            this.updateActiveConversation(propertyId, senderId);
            this.showConversationView();
            
            // Charger les messages
            await this.loadMessages(propertyId);
            
            // Marquer les messages comme lus
            await this.markMessagesAsRead(propertyId);
            
        } catch (error) {
            console.error('Erreur lors de la sélection de la conversation:', error);
            this.showError('Erreur lors du chargement de la conversation');
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadMessages(propertyId) {
        try {
            const response = await fetch(`/chat/api/conversation/${propertyId}`);
            const data = await response.json();
            
            if (data.success) {
                this.messages = data.messages;
                this.renderMessages();
                this.scrollToBottom();
            } else {
                throw new Error(data.error || 'Erreur lors du chargement des messages');
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
            this.showError('Erreur lors du chargement des messages');
        }
    }
    
    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message || !this.currentPropertyId) return;
        
        try {
            // Trouver le destinataire (l'autre participant de la conversation)
            const conversation = this.conversations.find(c => c.propertyId === this.currentPropertyId);
            if (!conversation) return;
            
            // Utiliser senderId comme destinataire (car c'est le propriétaire de la propriété)
            const recipientId = conversation.senderId;
            if (!recipientId) return;
            
            // Créer le message temporaire
            const tempMessage = {
                id: 'temp_' + Date.now(),
                propertyId: this.currentPropertyId,
                senderId: this.currentUserId,
                recipientId: recipientId,
                message: message,
                timestamp: new Date(),
                readBy: [this.currentUserId],
                isTemporary: true
            };
            
            // Afficher le message immédiatement
            this.messages.push(tempMessage);
            this.renderMessages();
            this.scrollToBottom();
            
            // Vider l'input
            messageInput.value = '';
            this.autoResizeTextarea(messageInput);
            
            // Simuler un délai de frappe pour plus de réalisme
            await this.simulateTypingDelay();
            
            // Envoyer au serveur
            const response = await fetch('/chat/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyId: this.currentPropertyId,
                    message: message,
                    recipientId: recipientId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remplacer le message temporaire par le vrai message
                const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id);
                if (messageIndex !== -1) {
                    this.messages[messageIndex] = data.message;
                    this.renderMessages();
                }
                
                // Mettre à jour les conversations
                this.updateConversationLastMessage(this.currentPropertyId, message);
            } else {
                // Supprimer le message temporaire en cas d'erreur
                this.messages = this.messages.filter(m => m.id !== tempMessage.id);
                this.renderMessages();
                this.showError('Erreur lors de l\'envoi du message');
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            this.showError('Erreur lors de l\'envoi du message');
        }
    }
    
    async markMessagesAsRead(propertyId) {
        try {
            await fetch('/chat/api/mark-as-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ propertyId: propertyId })
            });
            
            // Mettre à jour le badge
            this.updateUnreadBadge();
            
        } catch (error) {
            console.error('Erreur lors du marquage des messages comme lus:', error);
        }
    }
    
    async updateUnreadBadge(count = null) {
        try {
            console.log('🔔 Mise à jour du badge...');
            if (count === null) {
                const response = await fetch('/chat/api/unread-count');
                const data = await response.json();
                count = data.success ? data.unreadCount : 0;
                console.log(`📊 Nombre de messages non lus: ${count}`);
            }
            
            const badge = document.getElementById('unreadMessagesBadge');
            if (badge) {
                if (count > 0) {
                    badge.textContent = count;
                    badge.style.display = 'flex';
                    console.log(`✅ Badge affiché avec ${count} messages`);
                } else {
                    badge.style.display = 'none';
                    console.log('✅ Badge masqué (aucun message non lu)');
                }
            } else {
                console.error('❌ Badge non trouvé');
            }
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour du badge:', error);
        }
    }
    
    renderConversations() {
        console.log('🎨 Rendu des conversations...');
        const conversationsList = document.getElementById('conversationsList');
        if (!conversationsList) {
            console.error('❌ Élément conversationsList non trouvé');
            return;
        }
        
        console.log(`📊 Nombre de conversations à rendre: ${this.conversations.length}`);
        
        if (this.conversations.length === 0) {
            console.log('⚠️ Aucune conversation à afficher');
            conversationsList.innerHTML = `
                <div class="no-conversations">
                    <i class="fas fa-comments"></i>
                    <p>Aucune conversation</p>
                </div>
            `;
            return;
        }
        
        console.log('🎨 Génération du HTML des conversations...');
        console.log('🎨 Conversations:', this.conversations);
        
            const html = this.conversations.map(conversation => `
                <div class="conversation-item ${this.currentPropertyId === conversation.propertyId && this.currentSenderId === conversation.senderId ? 'active' : ''}" 
                     data-property-id="${conversation.propertyId}" data-sender-id="${conversation.senderId}">
                    <div class="conversation-content">
                        <!-- Ligne 1: Nom de l'utilisateur avec petite icône -->
                        <div class="conversation-line conversation-user">
                            <i class="fas fa-user-circle conversation-icon-small"></i>
                            <span class="conversation-sender-name">${conversation.senderName.includes('undefined') ? 'Propriétaire' : conversation.senderName}</span>
                            <span class="conversation-time">
                                ${this.formatTime(conversation.lastMessageTime)}
                            </span>
                        </div>
                        
                        <!-- Ligne 2: Nom de la propriété avec petite icône -->
                        <div class="conversation-line conversation-property">
                            <i class="fas fa-building conversation-icon-small"></i>
                            <span class="conversation-property-name">${conversation.propertyName}</span>
                        </div>
                        
                        <!-- Ligne 3: Message avec icône message -->
                        <div class="conversation-line conversation-message">
                            <i class="fas fa-comment conversation-icon-small"></i>
                            <span class="conversation-message-text">${conversation.lastMessage}</span>
                            ${conversation.unreadCount > 0 ? `<span class="unread-badge">${conversation.unreadCount}</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        
        console.log('🎨 HTML généré:', html.substring(0, 2000) + '...');
        conversationsList.innerHTML = html;
        console.log('✅ Conversations rendues avec succès');
    }
    
    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        if (this.messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <p>Aucun message dans cette conversation</p>
                </div>
            `;
            return;
        }
        
        messagesContainer.innerHTML = this.messages.map(message => {
            const isSent = message.senderId === this.currentUserId;
            const isTemporary = message.isTemporary;
            
            return `
                <div class="message ${isSent ? 'sent' : 'received'} ${isTemporary ? 'temporary' : ''}">
                    <div class="message-content">
                        <div class="message-text">${this.escapeHtml(message.message)}</div>
                        <div class="message-time">
                            ${this.formatTime(message.timestamp)}
                            ${isTemporary ? '<i class="fas fa-clock" style="margin-left: 0.25rem; opacity: 0.7;"></i>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateActiveConversation(propertyId, senderId) {
        // Mettre à jour la classe active
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-property-id="${propertyId}"][data-sender-id="${senderId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Mettre à jour le header de conversation
        this.updateConversationHeader(propertyId, senderId);
    }
    
    updateConversationHeader(propertyId, senderId) {
        const conversation = this.conversations.find(c => c.propertyId === propertyId && c.senderId === senderId);
        if (conversation) {
            // Mettre à jour le nom du sender dans l'en-tête
            const senderNameElement = document.querySelector('#chatSenderName');
            if (senderNameElement) {
                senderNameElement.textContent = conversation.senderName;
            }
            
            // Mettre à jour le nom de la propriété dans l'en-tête
            const propertyNameElement = document.querySelector('#chatPropertyName');
            if (propertyNameElement) {
                propertyNameElement.textContent = conversation.propertyName;
            }
            
            // Gérer l'affichage du bouton "Ajouter comme locataire"
            this.updateAddTenantButton(conversation);
        }
    }
    
    updateAddTenantButton(conversation) {
        //const addTenantBtn = document.getElementById('addTenantBtn');
        const conversationDetails = document.getElementById('conversationDetails');
        
        if (!conversationDetails) return;

        const isPropertyOwner = conversation.isPropertyOwner;
        const propertyStatus = conversation.propertyStatus;
        const isAvailable = propertyStatus !== 'rented' && propertyStatus !== 'sold';

        if(isPropertyOwner && isAvailable) {
            //Le user est le propriétaire et la propriété est disponible
            conversationDetails.innerHTML = `
                <h3 class="conversation-property-name">${conversation.propertyName}</h3>
                <button class="btn-add-tenant" id="addTenantBtn" title="Ajouter comme locataire">
                    <i class="fas fa-user-plus"></i>
                    Ajouter comme locataire
                </button>
                `;
        } else {
            //Le user n'est pas le propriétaire ou la propriété n'est pas disponible
            conversationDetails.innerHTML = `
                <h3 class="conversation-property-name">${conversation.propertyName}</h3>
                `;
        }
        
    }
    
    async checkPropertyStatus(propertyId) {
        try {
            // Récupérer les informations de la propriété
            const response = await fetch(`/properties/api/${propertyId}`);
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            if (!data.success) {
                return false;
            }
            
            const property = data.property;
            
            // Vérifier si l'utilisateur actuel est le propriétaire
            const isOwner = property.ownerId === this.currentUserId;
            
            // Vérifier si la propriété n'est pas louée
            const isAvailable = property.status !== 'rented' && 
                               !property.tenantId && 
                               property.available !== false;
            
            return isOwner && isAvailable;
            
        } catch (error) {
            console.error('Erreur lors de la vérification du statut:', error);
            return false;
        }
    }
    
    ensureMobileView() {
        // Vérifier si on est sur mobile
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            console.log('📱 Mode mobile détecté - Affichage de la liste des conversations');
            // Délai pour s'assurer que le DOM est prêt
            setTimeout(() => {
                this.showConversationsList();
            }, 100);
        }
    }
    
    showUserInfoPopup() {
        if (!this.currentSenderId) {
            console.warn('⚠️ Aucun utilisateur sélectionné');
            return;
        }
        
        // Trouver les informations de l'utilisateur
        const conversation = this.conversations.find(c => c.senderId === this.currentSenderId);
        
        if (!conversation) {
            console.warn('⚠️ Conversation non trouvée');
            return;
        }
        
        // Remplir les informations du popup
        this.populateUserInfo(conversation);
        
        // Afficher le popup
        const popup = document.getElementById('userInfoPopup');
        
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Empêcher le scroll
        } else {
            console.error('❌ Élément popup non trouvé');
        }
    }
    
    hideUserInfoPopup() {
        const popup = document.getElementById('userInfoPopup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = ''; // Restaurer le scroll
        }
    }
    
    populateUserInfo(conversation) {
        // Remplir les informations utilisateur
        const userNameElement = document.getElementById('popupUserName');
        const userEmailElement = document.getElementById('popupUserEmail');
        const userPhoneElement = document.getElementById('popupUserPhone');
        const userPropertyElement = document.getElementById('popupUserProperty');
        const userJoinDateElement = document.getElementById('popupUserJoinDate');
        
        if (userNameElement) {
            userNameElement.textContent = conversation.senderName.includes('undefined') ? 'Propriétaire' : conversation.senderName || 'Utilisateur inconnu';
        }
        
        if (userEmailElement) {
            // Générer un email basé sur le nom (pour la démo)
            const email = conversation.senderEmail || 'Non disponnible';
            userEmailElement.textContent = email;
        }
        
        if (userPhoneElement) {
            // Générer un numéro de téléphone (pour la démo)
            const phone = conversation.senderPhone || 'Non disponnible';
            userPhoneElement.textContent = phone;
        }
        
        if (userPropertyElement) {
            userPropertyElement.textContent = conversation.propertyName || 'Propriété inconnue';
        }
        
        if (userJoinDateElement) {
            // Générer une date d'inscription (pour la démo)
            const joinDate = this.generateJoinDate();
            userJoinDateElement.textContent = joinDate;
        }
    }
    
    generateEmailFromName(name) {
        if (!name) return 'utilisateur@example.com';
        
        // Convertir le nom en email
        const cleanName = name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '.');
        
        return `${cleanName}@example.com`;
    }
    
    generatePhoneNumber() {
        // Générer un numéro de téléphone français aléatoire
        const prefixes = ['01', '02', '03', '04', '05', '06', '07'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        
        return `+33 ${prefix} ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)}`;
    }
    
    generateJoinDate() {
        // Générer une date d'inscription aléatoire dans les 2 dernières années
        const now = new Date();
        const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
        const randomDate = new Date(twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime()));
        
        return `Membre depuis ${randomDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    }
    
    async copyUserName() {
        const userNameElement = document.getElementById('popupUserName');
        if (!userNameElement) return;
        
        const userName = userNameElement.textContent;
        
        try {
            await navigator.clipboard.writeText(userName);
            console.log('✅ Nom copié dans le presse-papiers:', userName);
            
            // Afficher un feedback visuel
            this.showCopyFeedback();
            
        } catch (error) {
            console.error('❌ Erreur lors de la copie:', error);
            
            // Fallback pour les navigateurs plus anciens
            this.fallbackCopy(userName);
        }
    }
    
    showCopyFeedback() {
        const copyBtn = document.getElementById('copyUserName');
        if (!copyBtn) return;
        
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalIcon;
            copyBtn.style.background = '';
        }, 2000);
    }
    
    fallbackCopy(text) {
        // Méthode de fallback pour copier du texte
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            console.log('✅ Nom copié (fallback):', text);
            this.showCopyFeedback();
        } catch (error) {
            console.error('❌ Erreur lors de la copie (fallback):', error);
        }
        
        document.body.removeChild(textArea);
    }
    
    showConversationView() {
        const chatConversation = document.getElementById('chatConversation');
        const conversationTemplate = document.getElementById('conversationTemplate');
        
        if (chatConversation && conversationTemplate) {
            //
            chatConversation.innerHTML = conversationTemplate.innerHTML;
            
            // Masquer la sidebar sur mobile
            const chatSidebar = document.getElementById('chatSidebar');
            if (chatSidebar && window.innerWidth <= 768) {
                chatSidebar.classList.remove('active');
            }
        }
    }
    
    showConversationsList() {
        const chatSidebar = document.getElementById('chatSidebar');
        if (chatSidebar) {
            chatSidebar.classList.add('active');
        }
    }
    
    searchConversations(query) {
        const conversationItems = document.querySelectorAll('.conversation-item');
        const searchTerm = query.toLowerCase();
        
        conversationItems.forEach(item => {
            // Récupérer les éléments de recherche
            const senderName = item.querySelector('.conversation-sender-name')?.textContent.toLowerCase() || '';
            const propertyName = item.querySelector('.conversation-property-name')?.textContent.toLowerCase() || '';
            const messageText = item.querySelector('.conversation-message-text')?.textContent.toLowerCase() || '';
            
            // Vérifier si le terme de recherche correspond à l'un des éléments
            if (senderName.includes(searchTerm) || 
                propertyName.includes(searchTerm) || 
                messageText.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
    
    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    startAutoRefresh() {
        console.log('🔄 Démarrage de l\'auto-refresh...');
        // Actualiser les conversations toutes les 30 secondes
        this.refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refresh des conversations...');
            this.loadConversations();
        }, 30000);
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    async refreshChat() {
        const refreshButton = document.getElementById('refreshChat');
        const originalContent = refreshButton.innerHTML;
        
        try {
            // Afficher le loader
            refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualisation...';
            refreshButton.disabled = true;
            
            await this.loadConversations();
            if (this.currentPropertyId) {
                await this.loadMessages(this.currentPropertyId);
            }
            
            // Afficher un feedback de succès
            refreshButton.innerHTML = '<i class="fas fa-check"></i> Actualisé';
            setTimeout(() => {
                refreshButton.innerHTML = originalContent;
                refreshButton.disabled = false;
            }, 1500);
            
        } catch (error) {
            console.error('Erreur lors de l\'actualisation:', error);
            
            // Afficher un feedback d'erreur
            refreshButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur';
            setTimeout(() => {
                refreshButton.innerHTML = originalContent;
                refreshButton.disabled = false;
            }, 2000);
        }
    }
    
    showLoading(show) {
        this.isLoading = show;
        // Vous pouvez ajouter un indicateur de chargement ici
    }
    
    showError(message) {
        // Vous pouvez ajouter une notification d'erreur ici
        console.error(message);
    }
    
    formatTime(timestamp) {
        let date;
        
        // Gérer les timestamps Firebase (objet avec seconds et nanoseconds)
        if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            date = new Date(timestamp);
        }
        
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
            console.warn('Timestamp invalide:', timestamp);
            return 'Date invalide';
        }
        
        const now = new Date();
        const diff = now - date;
        
        // Moins d'une minute
        if (diff < 60000) {
            return 'Maintenant';
        }
        
        // Moins d'une heure
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `Il y a ${minutes} min`;
        }
        
        // Moins de 24 heures
        if (diff < 86400000) {
            return date.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
        
        // Plus d'un jour
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async simulateTypingDelay() {
        // Simuler un délai de frappe réaliste (500ms à 1.5s)
        const delay = Math.random() * 1000 + 500;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
    
    updateConversationLastMessage(propertyId, message) {
        const conversation = this.conversations.find(c => c.propertyId === propertyId);
        if (conversation) {
            conversation.lastMessage = message;
            conversation.lastMessageTime = new Date();
            this.renderConversations();
        }
    }
    
    showTypingIndicator(propertyId, isTyping) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        let typingIndicator = messagesContainer.querySelector('.typing-indicator');
        
        if (isTyping && !typingIndicator) {
            typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = `
                <span>Quelqu'un est en train d'écrire</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messagesContainer.appendChild(typingIndicator);
            this.scrollToBottom();
        } else if (!isTyping && typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    handlePropertyRedirect() {
        // Vérifier s'il y a une redirection depuis la page de détails
        if (window.redirectPropertyId && window.preMessage) {
            console.log('🔄 Redirection détectée:', {
                propertyId: window.redirectPropertyId,
                preMessage: window.preMessage
            });
            
            // Attendre que les conversations soient chargées
            setTimeout(() => {
                this.handlePropertyRedirectAction(window.redirectPropertyId, window.preMessage);
            }, 1000);
        }
    }
    
    handlePropertyRedirectAction(propertyId, preMessage) {
        console.log('🎯 Traitement de la redirection:', { propertyId, preMessage });
        
        // Chercher une conversation existante pour cette propriété
        const existingConversation = this.conversations.find(conv => 
            conv.propertyId === propertyId
        );
        
        if (existingConversation) {
            console.log('✅ Conversation existante trouvée, ouverture...');
            // Ouvrir la conversation existante
            this.selectConversation(propertyId, existingConversation.senderId);
            
            // Pré-remplir le message après un court délai
            setTimeout(() => {
                this.prefillMessage(preMessage);
            }, 500);
        } else {
            console.log('🆕 Aucune conversation existante, création d\'une nouvelle...');
            // Créer une nouvelle conversation
            this.createNewConversationForProperty(propertyId, preMessage);
        }
    }
    
    createNewConversationForProperty(propertyId, preMessage) {
        // Utiliser les vraies informations de la propriété et du propriétaire
        const propertyInfo = window.redirectPropertyInfo;
        
        if (!propertyInfo) {
            console.error('❌ Informations de propriété non disponibles pour la redirection');
            return;
        }
        
        const newConversation = {
            propertyId: propertyId,
            senderId: propertyInfo.ownerId || 'OWNER_UNKNOWN',
            senderName: propertyInfo.ownerName || 'Propriétaire',
            propertyName: propertyInfo.name || `Propriété ${propertyId}`,
            lastMessage: 'Nouvelle demande',
            lastMessageTime: new Date(),
            unreadCount: 0
        };
        
        console.log('🆕 Création d\'une nouvelle conversation avec les vraies infos:', newConversation);
        
        // Ajouter à la liste des conversations
        this.conversations.unshift(newConversation);
        this.renderConversations();
        
        // Sélectionner cette conversation
        this.selectConversation(propertyId, newConversation.senderId);
        
        // Pré-remplir le message
        setTimeout(() => {
            this.prefillMessage(preMessage);
        }, 500);
    }
    
    prefillMessage(message) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = message;
            messageInput.focus();
            console.log('📝 Message pré-rempli:', message);
        }
    }
    
    showAddTenantPopup() {
        if (!this.currentPropertyId || !this.currentSenderId) {
            console.warn('⚠️ Aucune conversation sélectionnée');
            return;
        }
        
        // Trouver les informations de la conversation
        const conversation = this.conversations.find(c => 
            c.propertyId === this.currentPropertyId && c.senderId === this.currentSenderId
        );
        
        if (!conversation) {
            console.warn('⚠️ Conversation non trouvée');
            return;
        }
        
        // Remplir les informations du popup
        this.populateAddTenantPopup(conversation);
        
        // Afficher le popup
        const popup = document.getElementById('addTenantPopup');
        if (popup) {
            popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideAddTenantPopup() {
        const popup = document.getElementById('addTenantPopup');
        if (popup) {
            popup.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    async populateAddTenantPopup(conversation) {
        try {
            // Récupérer les informations détaillées de la propriété
            const propertyResponse = await fetch(`/properties/api/${conversation.propertyId}`);
            const propertyData = await propertyResponse.json();
            
            if (!propertyData.success) {
                throw new Error('Impossible de récupérer les informations de la propriété');
            }
            
            const property = propertyData.property;
            
            // Remplir les informations de la propriété
            document.getElementById('popupPropertyName').textContent = property.name || conversation.propertyName;
            document.getElementById('popupPropertyAddress').textContent = property.address || 'Adresse non spécifiée';
            document.getElementById('popupPropertyRent').textContent = property.rent ? `${property.rent}FCFA /mois` : 'Prix non spécifié';
            
            // Remplir les informations du locataire
            document.getElementById('popupTenantName').textContent = conversation.senderName;
            document.getElementById('popupTenantEmail').textContent = conversation.senderEmail || 'Non disponnible';
            
            // Remplir le message de confirmation
            document.getElementById('confirmTenantName').textContent = conversation.senderName;
            document.getElementById('confirmPropertyName').textContent = property.name || conversation.propertyName;
            
        } catch (error) {
            console.error('Erreur lors du remplissage du popup:', error);
            this.showError('Erreur lors du chargement des informations');
        }
    }
    
    async confirmAddTenant() {
        const confirmBtn = document.getElementById('confirmAddTenant');
        const originalContent = confirmBtn.innerHTML;
        
        try {
            // Afficher le loader
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';
            confirmBtn.disabled = true;
            
            // Fermer le popup
            this.hideAddTenantPopup();
            
            // Désactiver le bouton principal
            const addTenantBtn = document.getElementById('addTenantBtn');
            if (addTenantBtn) {
                addTenantBtn.classList.add('loading');
                addTenantBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout...';
                addTenantBtn.disabled = true;
            }
            
            // Ajouter le locataire
            const response = await fetch('/chat/api/add-tenant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyId: this.currentPropertyId,
                    tenantId: this.currentSenderId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Envoyer le message de bienvenue
                await this.sendWelcomeMessage(data.propertyName);
                
                // Actualiser les conversations
                await this.loadConversations();
                
                // Afficher un message de succès
                this.showSuccessMessage('Locataire ajouté avec succès !');
                showNotification('Locataire ajouté avec succès !', 'success');
                
                // Mettre à jour le bouton
                if (addTenantBtn) {
                    addTenantBtn.innerHTML = '<i class="fas fa-check"></i> Locataire ajouté';
                    addTenantBtn.style.background = '#6c757d';
                }
                
            } else {
                console.log('response', response);
                
                if(response.status === 400) {
                    //On affiche une notification d erreur
                    showNotification('Cette propriété est déjà louée', 'error');
                }
                throw new Error(response.error || 'Erreur lors de l\'ajout du locataire');
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'ajout du locataire:', error);
            this.showError('Erreur lors de l\'ajout du locataire');
            
            // Restaurer le bouton
            const addTenantBtn = document.getElementById('addTenantBtn');
            if (addTenantBtn) {
                addTenantBtn.classList.remove('loading');
                addTenantBtn.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter comme locataire';
                addTenantBtn.disabled = false;
            }
        } finally {
            // Restaurer le bouton de confirmation
            confirmBtn.innerHTML = originalContent;
            confirmBtn.disabled = false;
        }
    }
    
    async sendWelcomeMessage(propertyName) {
        try {
            const welcomeMessage = `Je viens de vous ajouter comme locataire de la propriété "${propertyName}". Félicitations !`;
            
            const response = await fetch('/chat/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    propertyId: this.currentPropertyId,
                    message: welcomeMessage,
                    recipientId: this.currentSenderId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Message de bienvenue envoyé');
                // Ajouter le message à la conversation actuelle
                this.messages.push(data.message);
                this.renderMessages();
                this.scrollToBottom();
            } else {
                console.error('❌ Erreur lors de l\'envoi du message de bienvenue:', data.error);
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi du message de bienvenue:', error);
        }
    }
    
    showSuccessMessage(message) {
        // Créer une notification de succès temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    destroy() {
        this.stopAutoRefresh();
    }
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Fonction pour obtenir l'icône de notification
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// Initialiser le chat quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM chargé, initialisation du chat...');
    // Vérifier si nous sommes sur la page de chat
    if (document.querySelector('.chat-container')) {
        console.log('✅ Page de chat détectée, création du ChatManager...');
        window.chatManager = new ChatManager();
        console.log('✅ ChatManager créé:', window.chatManager);
    } else {
        console.log('⚠️ Page de chat non détectée');
    }
});

// Nettoyer lors de la fermeture de la page
window.addEventListener('beforeunload', () => {
    if (window.chatManager) {
        window.chatManager.destroy();
    }
});
