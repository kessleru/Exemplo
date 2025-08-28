from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
import json
from .models import ChatMessage, ChatSession, BotResponse


class ChatModelTests(TestCase):
    """Testes para os modelos do chat"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.session = ChatSession.objects.create(
            session_id='test-session-123',
            user=self.user
        )
    
    def test_chat_message_creation(self):
        """Teste de criação de mensagem"""
        message = ChatMessage.objects.create(
            user=self.user,
            user_message="Olá!",
            bot_response="Oi! Como posso ajudar?",
            session_id="test-session-123"
        )
        
        self.assertEqual(message.user_message, "Olá!")
        self.assertEqual(message.bot_response, "Oi! Como posso ajudar?")
        self.assertEqual(message.user, self.user)
    
    def test_chat_session_creation(self):
        """Teste de criação de sessão"""
        self.assertEqual(self.session.session_id, 'test-session-123')
        self.assertEqual(self.session.user, self.user)
        self.assertTrue(self.session.is_active)
    
    def test_bot_response_creation(self):
        """Teste de criação de resposta do bot"""
        response = BotResponse.objects.create(
            category='greeting',
            keywords='oi, olá, hello',
            response_text='Olá! Como posso ajudar você hoje?',
            priority=1
        )
        
        keywords = response.get_keywords_list()
        self.assertIn('oi', keywords)
        self.assertIn('olá', keywords)
        self.assertIn('hello', keywords)


class ChatViewTests(TestCase):
    """Testes para as views do chat"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_chat_page_loads(self):
        """Teste se a página do chat carrega"""
        response = self.client.get(reverse('chat:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'ChatBot Django')
    
    def test_chat_api_post(self):
        """Teste da API do chat"""
        data = {
            'message': 'Olá',
            'session_id': 'test-session-123'
        }
        
        response = self.client.post(
            reverse('chat:chat_api'),
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('response', response_data)
    
    def test_clear_chat_api(self):
        """Teste da API de limpeza do chat"""
        response = self.client.post(reverse('chat:clear_chat'))
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.content)
        self.assertIn('message', response_data)
    
    def test_chat_history_api(self):
        """Teste da API de histórico"""
        response = self.client.get(reverse('chat:chat_history'))
        self.assertEqual(response.status_code, 200)
        
        response_data = json.loads(response.content)
        self.assertIn('messages', response_data)


class BotResponseLogicTests(TestCase):
    """Testes para a lógica de resposta do bot"""
    
    def setUp(self):
        # Criar algumas respostas de teste
        BotResponse.objects.create(
            category='greeting',
            keywords='oi, olá, hello',
            response_text='Olá! Como posso ajudar você hoje?',
            priority=1
        )
        
        BotResponse.objects.create(
            category='farewell',
            keywords='tchau, adeus, bye',
            response_text='Tchau! Foi um prazer conversar com você.',
            priority=1
        )
    
    def test_greeting_response(self):
        """Teste de resposta para cumprimentos"""
        data = {'message': 'Olá'}
        
        response = self.client.post(
            '/api/chat/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('Olá', response_data['response'])
    
    def test_farewell_response(self):
        """Teste de resposta para despedidas"""
        data = {'message': 'tchau'}
        
        response = self.client.post(
            '/api/chat/',
            data=json.dumps(data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = json.loads(response.content)
        self.assertIn('Tchau', response_data['response'])
