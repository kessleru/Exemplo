from django.contrib import admin
from .models import ChatMessage, ChatSession, BotResponse


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session_id_short', 'user', 'user_message_short', 'bot_response_short', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['user_message', 'bot_response', 'session_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def session_id_short(self, obj):
        return obj.session_id[:8] + '...' if len(obj.session_id) > 8 else obj.session_id
    session_id_short.short_description = 'Sessão'
    
    def user_message_short(self, obj):
        return obj.user_message[:50] + '...' if len(obj.user_message) > 50 else obj.user_message
    user_message_short.short_description = 'Mensagem do Usuário'
    
    def bot_response_short(self, obj):
        return obj.bot_response[:50] + '...' if len(obj.bot_response) > 50 else obj.bot_response
    bot_response_short.short_description = 'Resposta do Bot'


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id_short', 'user', 'message_count', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = ['session_id', 'user__username']
    readonly_fields = ['created_at', 'updated_at', 'message_count']
    ordering = ['-updated_at']
    
    def session_id_short(self, obj):
        return obj.session_id[:8] + '...' if len(obj.session_id) > 8 else obj.session_id
    session_id_short.short_description = 'Sessão'


@admin.register(BotResponse)
class BotResponseAdmin(admin.ModelAdmin):
    list_display = ['category', 'response_text_short', 'keywords_short', 'is_active', 'priority', 'created_at']
    list_filter = ['category', 'is_active', 'priority']
    search_fields = ['response_text', 'keywords']
    readonly_fields = ['created_at']
    ordering = ['priority', 'category']
    
    def response_text_short(self, obj):
        return obj.response_text[:50] + '...' if len(obj.response_text) > 50 else obj.response_text
    response_text_short.short_description = 'Resposta'
    
    def keywords_short(self, obj):
        return obj.keywords[:30] + '...' if len(obj.keywords) > 30 else obj.keywords
    keywords_short.short_description = 'Palavras-chave'
