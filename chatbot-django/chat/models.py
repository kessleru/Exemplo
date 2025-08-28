from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class ChatMessage(models.Model):
    """
    Modelo para armazenar mensagens do chat
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    user_message = models.TextField(verbose_name="Mensagem do Usuário")
    bot_response = models.TextField(verbose_name="Resposta do Bot")
    session_id = models.CharField(max_length=100, verbose_name="ID da Sessão")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Mensagem do Chat"
        verbose_name_plural = "Mensagens do Chat"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Chat {self.session_id[:8]} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"


class ChatSession(models.Model):
    """
    Modelo para armazenar sessões de chat
    """
    session_id = models.CharField(max_length=100, unique=True, verbose_name="ID da Sessão")
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    
    class Meta:
        verbose_name = "Sessão do Chat"
        verbose_name_plural = "Sessões do Chat"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Sessão {self.session_id[:8]} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def message_count(self):
        return self.chatmessage_set.count()


class BotResponse(models.Model):
    """
    Modelo para armazenar respostas pré-definidas do bot
    """
    CATEGORY_CHOICES = [
        ('greeting', 'Cumprimentos'),
        ('farewell', 'Despedida'),
        ('help', 'Ajuda'),
        ('name', 'Nome'),
        ('default', 'Padrão'),
        ('time', 'Horário'),
        ('weather', 'Clima'),
        ('other', 'Outros'),
    ]
    
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, verbose_name="Categoria")
    keywords = models.TextField(help_text="Palavras-chave separadas por vírgula", verbose_name="Palavras-chave")
    response_text = models.TextField(verbose_name="Texto da Resposta")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    priority = models.IntegerField(default=1, verbose_name="Prioridade")
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Resposta do Bot"
        verbose_name_plural = "Respostas do Bot"
        ordering = ['priority', 'category']
    
    def __str__(self):
        return f"{self.get_category_display()} - {self.response_text[:50]}..."
    
    def get_keywords_list(self):
        return [keyword.strip().lower() for keyword in self.keywords.split(',') if keyword.strip()]
