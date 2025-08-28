// Classe principal do ChatBot
class ChatBot {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setupTheme();
        this.setupWelcomeMessage();
        this.messageHistory = [];
    }

    // Inicializar elementos DOM
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearChat');
        this.themeToggle = document.getElementById('toggleTheme');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.charCounter = document.getElementById('charCounter');
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

        // Toggle tema
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Auto-resize do input
        this.messageInput.addEventListener('input', () => this.autoResize());
    }

    // Configurar tema inicial
    setupTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme') || 'light';
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
            // Enviar para o servidor
            const response = await this.sendToServer(message);
            
            // Esconder indicador de digitação
            this.hideTypingIndicator();
            
            // Adicionar resposta do bot
            this.addMessage(response.response, 'bot');
            
            // Salvar no histórico
            this.messageHistory.push({
                user: message,
                bot: response.response,
                timestamp: new Date()
            });
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'bot', true);
            console.error('Erro ao enviar mensagem:', error);
        }
        
        // Reabilitar input
        this.setInputState(true);
        this.messageInput.focus();
    }

    // Enviar mensagem para o servidor
    async sendToServer(message) {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Adicionar mensagem ao chat
    addMessage(text, sender, isError = false) {
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
                    ${this.escapeHtml(text)}
                </div>
                <div class="message-time">
                    ${this.formatTime(new Date())}
                </div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Animação de entrada
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
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
        if (confirm('Tem certeza que deseja limpar a conversa?')) {
            try {
                await fetch('/clear', { method: 'POST' });
                
                // Manter apenas a mensagem de boas-vindas
                const messages = this.chatMessages.querySelectorAll('.message');
                for (let i = 1; i < messages.length; i++) {
                    messages[i].remove();
                }
                
                this.messageHistory = [];
                this.showNotification('Conversa limpa com sucesso!', 'success');
                
            } catch (error) {
                this.showNotification('Erro ao limpar conversa.', 'error');
                console.error('Erro ao limpar chat:', error);
            }
        }
    }

    // Toggle tema
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        const icon = isDark ? 'fas fa-sun' : 'fas fa-moon';
        this.themeToggle.innerHTML = `<i class="${icon}"></i>`;
        
        localStorage.setItem('chatbot-theme', isDark ? 'dark' : 'light');
        
        this.showNotification(
            `Tema ${isDark ? 'escuro' : 'claro'} ativado!`, 
            'success'
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

    // Auto-resize do textarea
    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
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

    // Escapar HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        `;

        // Cores por tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animação de entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Exportar histórico de mensagens
    exportHistory() {
        if (this.messageHistory.length === 0) {
            this.showNotification('Nenhuma conversa para exportar.', 'warning');
            return;
        }

        const data = {
            export_date: new Date().toISOString(),
            messages: this.messageHistory
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatbot-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Histórico exportado com sucesso!', 'success');
    }
}

// Utilitários adicionais
class ChatUtils {
    // Detectar se é dispositivo móvel
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Formatear texto com markdown básico
    static formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Detectar links e torná-los clicáveis
    static linkify(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    }

    // Copiar texto para área de transferência
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erro ao copiar:', err);
            return false;
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.chatBot = new ChatBot();
    
    // Adicionar funcionalidades extras para desenvolvimento
    if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
        window.chatUtils = ChatUtils;
        console.log('ChatBot Flask inicializado em modo de desenvolvimento');
    }
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(error => {
                console.log('SW falhou:', error);
            });
    });
}
