from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Página principal do chatbot
    path('', views.ChatBotView.as_view(), name='index'),
    
    # API endpoints
    path('api/chat/', views.ChatAPIView.as_view(), name='chat_api'),
    path('api/clear/', views.ClearChatView.as_view(), name='clear_chat'),
    path('api/history/', views.ChatHistoryView.as_view(), name='chat_history'),
]
