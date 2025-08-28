// Classe principal do ChatBot Django
class DjangoChatBot {
    constructor() {
        this.initializeElements();
        this.setupCSRF();
        this.bindEvents();
        this.setupTheme();
        this.setupWelcomeMessage();
        this.loadHistory();
        this.messageHistory = [];
    }

    // Inicializar elementos DOM
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearChat');
        this.exportButton = document.getElementById('exportHistory');
        this.themeToggle = document.getElementById('toggleTheme');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.charCounter = document.getElementById('charCounter');
        this.notificationsContainer = document.getElementById('notificationsContainer');
    }

    // Configurar CSRF token para Django
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    }

    // Vincular eventos
    bindEvents() {
        // Enviar mensagem
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter para enviar
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Contador de caracteres
        this.messageInput.addEventListener('input', () => {
            this.updateCharCounter();
            this.toggleSendButton();
        });

        // Limpar chat
        this.clearButton.addEventListener('click', () => this.clearChat());

        // Exportar histórico
        this.exportButton.addEventListener('click', () => this.exportHistory());

        // Toggle tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Foco automático no input
        this.messageInput.focus();
    }

    // Configurar tema inicial
    setupTheme() {
        const savedTheme = localStorage.getItem('django-chatbot-theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Configurar mensagem de boas-vindas
    setupWelcomeMessage() {
        const welcomeTime = document.getElementById('welcomeTime');
        if (welcomeTime) {
            welcomeTime.textContent = this.formatTime(new Date());
        }
    }

    // Carregar histórico da sessão
    async loadHistory() {
        try {
            const response = await fetch('/api/history/', {
                method: 'GET',
                headers: {
                    'X-CSRFToken': this.csrfToken,
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.messageHistory = data.messages || [];
                
                // Recriar mensagens do histórico
                data.messages.forEach(message => {
                    this.addMessage(message.user_message, 'user', false, false);
                    this.addMessage(message.bot_response, 'bot', false, false);
                });
            }
        } catch (error) {
            console.log('Nenhum histórico encontrado ou erro ao carregar:', error);
        }
    }

    // Enviar mensagem
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;

        // Desabilitar input
        this.setInputState(false);
        
        // Adicionar mensagem do usuário
        this.addMessage(message, 'user');
        
        // Limpar input
        this.messageInput.value = '';
        this.updateCharCounter();
        
        // Mostrar indicador de digitação
        this.showTypingIndicator();
        
        try {
            // Enviar para o servidor Django
            const response = await this.sendToServer(message);
            
            // Esconder indicador de digitação
            this.hideTypingIndicator();
            
            // Adicionar resposta do bot
            this.addMessage(response.response, 'bot');
            
            // Salvar no histórico local
            this.messageHistory.push({
                user_message: message,
                bot_response: response.response,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'bot', true);
            this.showNotification('Erro ao enviar mensagem', 'error');
            console.error('Erro ao enviar mensagem:', error);
        }
        
        // Reabilitar input
        this.setInputState(true);
        this.messageInput.focus();
    }

    // Enviar mensagem para o servidor Django
    async sendToServer(message) {
        const response = await fetch('/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.csrfToken,
            },
            body: JSON.stringify({ 
                message: message,
                session_id: this.getSessionId()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Obter ou gerar ID da sessão
    getSessionId() {
        let sessionId = localStorage.getItem('django-chat-session-id');
        if (!sessionId) {
            sessionId = this.generateUUID();
            localStorage.setItem('django-chat-session-id', sessionId);
        }
        return sessionId;
    }

    // Gerar UUID simples
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Adicionar mensagem ao chat
    addMessage(text, sender, isError = false, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (isError) {
            messageDiv.classList.add('error-message');
        }

        const avatar = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    ${this.formatMessage(text)}
                </div>
                <div class="message-time">
                    ${this.formatTime(new Date())}
                </div>
            </div>
        `;

        if (!animate) {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animação de entrada
        if (animate) {
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);
        }
    }

    // Formatar mensagem (suporte básico a HTML)
    formatMessage(text) {
        // Escapar HTML perigoso mas permitir tags básicas
        const safeText = text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Permitir algumas tags básicas
            .replace(/&lt;br&gt;/gi, '<br>')
            .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
            .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>')
            .replace(/&lt;ul&gt;/gi, '<ul>')
            .replace(/&lt;\/ul&gt;/gi, '</ul>')
            .replace(/&lt;li&gt;/gi, '<li>')
            .replace(/&lt;\/li&gt;/gi, '</li>');
        
        return this.linkify(safeText);
    }

    // Detectar e criar links
    linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    // Mostrar indicador de digitação
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    // Esconder indicador de digitação
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    // Limpar chat
    async clearChat() {
        const confirmed = await this.showConfirmDialog(
            'Tem certeza que deseja limpar a conversa?',
            'Esta ação não pode ser desfeita.'
        );
        
        if (confirmed) {
            try {
                const response = await fetch('/api/clear/', { 
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': this.csrfToken,
                    }
                });
                
                if (response.ok) {
                    // Manter apenas a mensagem de boas-vindas
                    const messages = this.chatMessages.querySelectorAll('.message');
                    for (let i = 1; i < messages.length; i++) {
                        messages[i].remove();
                    }
                    
                    this.messageHistory = [];
                    localStorage.removeItem('django-chat-session-id');
                    this.showNotification('Conversa limpa com sucesso!', 'success');
                } else {
                    throw new Error('Erro ao limpar conversa');
                }
                
            } catch (error) {
                this.showNotification('Erro ao limpar conversa.', 'error');
                console.error('Erro ao limpar chat:', error);
            }
        }
    }

    // Exportar histórico
    async exportHistory() {
        try {
            if (this.messageHistory.length === 0) {
                this.showNotification('Nenhuma conversa para exportar.', 'warning');
                return;
            }

            const data = {
                platform: 'Django ChatBot',
                export_date: new Date().toISOString(),
                session_id: this.getSessionId(),
                message_count: this.messageHistory.length,
                messages: this.messageHistory
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `django-chatbot-history-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.showNotification('Histórico exportado com sucesso!', 'success');
            
        } catch (error) {
            this.showNotification('Erro ao exportar histórico.', 'error');
            console.error('Erro ao exportar:', error);
        }
    }

    // Toggle tema
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        const icon = isDark ? 'fas fa-sun' : 'fas fa-moon';
        this.themeToggle.innerHTML = `<i class="${icon}"></i>`;
        
        localStorage.setItem('django-chatbot-theme', isDark ? 'dark' : 'light');
        
        this.showNotification(
            `Tema ${isDark ? 'escuro' : 'claro'} ativado!`, 
            'info'
        );
    }

    // Atualizar contador de caracteres
    updateCharCounter() {
        const current = this.messageInput.value.length;
        const max = this.messageInput.maxLength;
        this.charCounter.textContent = `${current}/${max}`;
        
        if (current > max * 0.9) {
            this.charCounter.style.color = 'var(--warning-color)';
        } else {
            this.charCounter.style.color = 'var(--text-secondary)';
        }
    }

    // Toggle botão de envio
    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText;
    }

    // Controlar estado do input
    setInputState(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        
        if (enabled) {
            this.toggleSendButton();
        }
    }

    // Scroll para o final
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    // Formatar hora
    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Mostrar notificação
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;
        
        this.notificationsContainer.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remover após o tempo especificado
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    // Dialog de confirmação personalizado
    showConfirmDialog(title, message) {
        return new Promise((resolve) => {
            const confirmed = confirm(`${title}\n\n${message}`);
            resolve(confirmed);
        });
    }

    // Detectar se é dispositivo móvel
    isMobile() {
        return window.innerWidth <= 768;
    }

    // Método para adicionar funcionalidades futuras
    addCustomFeature(feature) {
        console.log('Funcionalidade personalizada adicionada:', feature);
    }
}

// Utilitários específicos do Django
class DjangoUtils {
    // Obter CSRF token
    static getCSRFToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    // Fazer requisição autenticada para Django
    static async makeAuthenticatedRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'X-CSRFToken': this.getCSRFToken(),
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        return fetch(url, defaultOptions);
    }

    // Formatar dados para envio ao Django
    static formatDataForDjango(data) {
        return JSON.stringify(data);
    }

    // Detectar erros de validação do Django
    static parseDjangoErrors(errorResponse) {
        if (errorResponse.field_errors) {
            return Object.values(errorResponse.field_errors).flat();
        }
        return [errorResponse.error || 'Erro desconhecido'];
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.djangoChatBot = new DjangoChatBot();
    window.djangoUtils = DjangoUtils;
    
    console.log('Django ChatBot inicializado com sucesso!');
    
    // Adicionar informações de debug em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Modo de desenvolvimento ativo');
        window.chatBot = window.djangoChatBot; // Alias para compatibilidade
    }
});

// Tratamento de erros globais
window.addEventListener('error', (event) => {
    console.error('Erro capturado:', event.error);
    if (window.djangoChatBot) {
        window.djangoChatBot.showNotification(
            'Ocorreu um erro inesperado. Recarregue a página se necessário.', 
            'error'
        );
    }
});

// Tratamento de promessas rejeitadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejeitada:', event.reason);
    if (window.djangoChatBot) {
        window.djangoChatBot.showNotification(
            'Erro de conexão. Verifique sua internet.', 
            'warning'
        );
    }
});
