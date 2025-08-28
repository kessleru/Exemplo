from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
import json
import random
import time
import uuid
from .models import ChatMessage, ChatSession, BotResponse


class ChatBotView(View):
    """
    View principal do chatbot
    """
    def get(self, request):
        """Renderizar a página do chatbot"""
        return render(request, 'chat/index.html')


@method_decorator(csrf_exempt, name='dispatch')
class ChatAPIView(View):
    """
    API para processar mensagens do chat
    """
    
    def post(self, request):
        """Processar mensagem do usuário e retornar resposta do bot"""
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '').strip()
            session_id = data.get('session_id') or self._get_or_create_session_id(request)
            
            if not user_message:
                return JsonResponse({'error': 'Mensagem vazia'}, status=400)
            
            # Simular delay para parecer mais realista
            time.sleep(0.5)
            
            # Obter resposta do bot
            bot_response = self._get_bot_response(user_message)
            
            # Salvar no banco de dados
            self._save_chat_message(user_message, bot_response, session_id, request.user)
            
            return JsonResponse({
                'response': bot_response,
                'session_id': session_id,
                'timestamp': time.time()
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Erro interno do servidor'}, status=500)
    
    def _get_or_create_session_id(self, request):
        """Obter ou criar ID da sessão"""
        session_id = request.session.get('chat_session_id')
        if not session_id:
            session_id = str(uuid.uuid4())
            request.session['chat_session_id'] = session_id
            
            # Criar sessão no banco
            ChatSession.objects.create(
                session_id=session_id,
                user=request.user if request.user.is_authenticated else None
            )
        
        return session_id
    
    def _get_bot_response(self, message):
        """
        Gerar resposta do bot baseada na mensagem do usuário
        """
        message_lower = message.lower().strip()
        
        # Buscar respostas do banco de dados
        bot_responses = BotResponse.objects.filter(is_active=True).order_by('priority')
        
        # Procurar por correspondências de palavras-chave
        for bot_response in bot_responses:
            keywords = bot_response.get_keywords_list()
            if any(keyword in message_lower for keyword in keywords):
                return bot_response.response_text
        
        # Se não encontrar correspondência, usar respostas padrão hardcoded
        return self._get_default_response(message_lower)
    
    def _get_default_response(self, message):
        """
        Respostas padrão caso não haja no banco de dados
        """
        responses = {
            'cumprimentos': [
                'Olá! Como posso ajudar você hoje?',
                'Oi! Em que posso ser útil?',
                'Olá! Estou aqui para ajudar.',
                'Oi! Como você está?'
            ],
            'despedida': [
                'Tchau! Foi um prazer conversar com você.',
                'Até logo! Volte sempre que precisar.',
                'Adeus! Tenha um ótimo dia!',
                'Tchau! Espero ter ajudado.'
            ],
            'ajuda': [
                'Posso ajudar com informações gerais, responder perguntas simples e manter uma conversa.',
                'Estou aqui para conversar e ajudar no que for possível!',
                'Pode me fazer perguntas ou apenas conversar comigo.'
            ],
            'nome': [
                'Eu sou o ChatBot Django!',
                'Meu nome é ChatBot Django, prazer em conhecer você!',
                'Sou o seu assistente virtual Django.'
            ],
            'default': [
                'Interessante! Pode me contar mais sobre isso?',
                'Entendo. O que mais você gostaria de saber?',
                'Hmm, essa é uma pergunta interessante.',
                'Posso não ter a resposta exata, mas estou aqui para conversar!',
                'Conte-me mais sobre o que você está pensando.',
                'Essa é uma perspectiva interessante!'
            ]
        }
        
        # Verificar cumprimentos
        if any(palavra in message for palavra in ['oi', 'olá', 'hello', 'ola', 'bom dia', 'boa tarde', 'boa noite']):
            return random.choice(responses['cumprimentos'])
        
        # Verificar despedidas
        elif any(palavra in message for palavra in ['tchau', 'adeus', 'bye', 'até logo', 'falou']):
            return random.choice(responses['despedida'])
        
        # Verificar pedidos de ajuda
        elif any(palavra in message for palavra in ['ajuda', 'help', 'socorro', 'como']):
            return random.choice(responses['ajuda'])
        
        # Verificar perguntas sobre nome
        elif any(palavra in message for palavra in ['nome', 'quem é você', 'quem você é', 'seu nome']):
            return random.choice(responses['nome'])
        
        # Resposta padrão
        else:
            return random.choice(responses['default'])
    
    def _save_chat_message(self, user_message, bot_response, session_id, user):
        """Salvar mensagem no banco de dados"""
        ChatMessage.objects.create(
            user=user if user.is_authenticated else None,
            user_message=user_message,
            bot_response=bot_response,
            session_id=session_id
        )


@method_decorator(csrf_exempt, name='dispatch')
class ClearChatView(View):
    """
    View para limpar o histórico do chat
    """
    
    def post(self, request):
        """Limpar histórico do chat da sessão atual"""
        try:
            session_id = request.session.get('chat_session_id')
            if session_id:
                # Marcar mensagens como inativas ao invés de deletar
                ChatMessage.objects.filter(session_id=session_id).delete()
                
                # Atualizar sessão
                ChatSession.objects.filter(session_id=session_id).update(is_active=False)
                
                # Remover da sessão
                if 'chat_session_id' in request.session:
                    del request.session['chat_session_id']
            
            return JsonResponse({'message': 'Chat limpo com sucesso'})
            
        except Exception as e:
            return JsonResponse({'error': 'Erro ao limpar chat'}, status=500)


class ChatHistoryView(View):
    """
    View para exibir histórico de conversas
    """
    
    def get(self, request):
        """Obter histórico de mensagens da sessão atual"""
        session_id = request.session.get('chat_session_id')
        if not session_id:
            return JsonResponse({'messages': []})
        
        messages = ChatMessage.objects.filter(session_id=session_id).order_by('created_at')
        
        history = []
        for message in messages:
            history.append({
                'user_message': message.user_message,
                'bot_response': message.bot_response,
                'timestamp': message.created_at.isoformat()
            })
        
        return JsonResponse({'messages': history})
