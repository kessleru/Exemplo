# ChatBot Django

Este é um chatbot avançado desenvolvido com Django, incluindo funcionalidades de persistência de dados, administração e API RESTful.

## 🚀 Funcionalidades

### Frontend
- Interface web moderna e responsiva
- Tema claro/escuro
- Animações suaves
- Indicador de digitação em tempo real
- Contador de caracteres
- Notificações personalizadas
- Exportação de histórico

### Backend
- API RESTful com Django
- Modelos de dados para mensagens e sessões
- Sistema de respostas configuráveis
- Administração via Django Admin
- Persistência em banco de dados SQLite
- Sessões de usuário
- Proteção CSRF

### Recursos Avançados
- Histórico de conversas persistente
- Respostas baseadas em palavras-chave configuráveis
- Sistema de prioridades para respostas
- Gerenciamento de sessões
- Testes unitários incluídos

## 📦 Instalação

### Pré-requisitos
- Python 3.8+
- pip

### 1. Instalar dependências
```bash
pip install -r requirements.txt
```

### 2. Configurar banco de dados
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Criar superusuário (opcional)
```bash
python manage.py createsuperuser
```

### 4. Carregar dados iniciais
```bash
python manage.py loaddata initial_bot_responses.json
```

### 5. Executar servidor
```bash
python manage.py runserver
```

### 6. Acessar aplicação
- Chat: http://localhost:8000/
- Admin: http://localhost:8000/admin/

## 🏗️ Estrutura do Projeto

```
chatbot-django/
├── chatbot_project/          # Configurações do projeto
│   ├── settings.py          # Configurações do Django
│   ├── urls.py             # URLs principais
│   └── wsgi.py             # WSGI configuration
├── chat/                    # App principal do chat
│   ├── models.py           # Modelos de dados
│   ├── views.py            # Views e APIs
│   ├── urls.py             # URLs da app
│   ├── admin.py            # Configuração do admin
│   ├── apps.py             # Configuração da app
│   └── tests.py            # Testes unitários
├── templates/chat/          # Templates HTML
│   └── index.html          # Interface principal
├── static/                  # Arquivos estáticos
│   ├── css/
│   │   └── style.css       # Estilos CSS
│   └── js/
│       └── script.js       # JavaScript
├── manage.py               # Utilitário de gerenciamento
└── requirements.txt        # Dependências Python
```

## 📊 Modelos de Dados

### ChatMessage
- `user`: Usuário (ForeignKey)
- `user_message`: Mensagem do usuário
- `bot_response`: Resposta do bot
- `session_id`: ID da sessão
- `created_at`: Data de criação

### ChatSession
- `session_id`: ID único da sessão
- `user`: Usuário (ForeignKey)
- `is_active`: Status da sessão
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### BotResponse
- `category`: Categoria da resposta
- `keywords`: Palavras-chave (separadas por vírgula)
- `response_text`: Texto da resposta
- `is_active`: Status ativo
- `priority`: Prioridade da resposta

## 🔧 API Endpoints

### GET /
- Página principal do chatbot

### POST /api/chat/
- Enviar mensagem para o bot
- Body: `{"message": "texto", "session_id": "opcional"}`
- Response: `{"response": "texto", "session_id": "id", "timestamp": 123456}`

### POST /api/clear/
- Limpar histórico da sessão
- Response: `{"message": "Chat limpo com sucesso"}`

### GET /api/history/
- Obter histórico da sessão atual
- Response: `{"messages": [...]}`

## 🎨 Personalização

### Adicionando Novas Respostas
1. Acesse o Django Admin
2. Vá para "Bot Responses"
3. Adicione uma nova resposta com:
   - Categoria
   - Palavras-chave (separadas por vírgula)
   - Texto da resposta
   - Prioridade

### Modificando Estilos
- Edite `static/css/style.css`
- Use variáveis CSS customizadas em `:root`
- Cores do tema Django: `--django-green` e `--django-orange`

### Adicionando Funcionalidades
- Modifique `chat/views.py` para lógica do backend
- Atualize `static/js/script.js` para funcionalidades do frontend
- Adicione novos modelos em `chat/models.py`

## 🧪 Testes

### Executar todos os testes
```bash
python manage.py test
```

### Executar testes específicos
```bash
python manage.py test chat.tests.ChatModelTests
```

### Testes incluídos
- Testes de modelos
- Testes de views
- Testes de API
- Testes de lógica do bot

## 🔒 Segurança

- Proteção CSRF ativada
- Validação de entrada
- Sanitização de HTML
- Sessões seguras

## 🚀 Deploy

### Configurações de Produção
1. Altere `DEBUG = False` em settings.py
2. Configure `ALLOWED_HOSTS`
3. Use banco de dados de produção
4. Configure arquivos estáticos
5. Use servidor web (nginx + gunicorn)

### Variáveis de Ambiente
```bash
DJANGO_SECRET_KEY=sua-chave-secreta
DJANGO_DEBUG=False
DATABASE_URL=sua-url-do-banco
```

## 🔄 Comparação com Flask

| Funcionalidade | Django | Flask |
|---|---|---|
| **Estrutura** | Projeto + Apps | Arquivo único |
| **ORM** | Django ORM built-in | SQLAlchemy (opcional) |
| **Admin** | Django Admin automático | Manual |
| **Autenticação** | Sistema built-in | Manual |
| **Migrações** | Automáticas | Manuais |
| **Templates** | Sistema robusto | Jinja2 |
| **Middleware** | Sistema built-in | Decorators |
| **Testes** | Framework incluído | unittest/pytest |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 📞 Suporte

Para dúvidas ou problemas:
- Crie uma issue no GitHub
- Consulte a documentação do Django
- Verifique os logs em `debug.log`

---

**Tecnologias Utilizadas:**
- Django 5.2+
- Python 3.8+
- SQLite
- HTML5/CSS3
- JavaScript ES6+
- Font Awesome
