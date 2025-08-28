# 🤖 ChatBot Comparativo: Flask vs Django

Este projeto contém duas implementações completas de chatbot para demonstrar as diferenças entre Flask e Django.

## 📁 Estrutura do Projeto

```
Exemplo/
├── chatbot-flask/          # Implementação em Flask
│   ├── app.py             # Aplicação principal
│   ├── templates/         # Templates HTML
│   ├── static/           # CSS e JavaScript
│   └── requirements.txt   # Dependências
├── chatbot-django/        # Implementação em Django
│   ├── chatbot_project/   # Configurações
│   ├── chat/             # App do chat
│   ├── templates/        # Templates
│   ├── static/          # Arquivos estáticos
│   ├── manage.py        # Gerenciador Django
│   └── setup.bat        # Script de configuração
└── COMPARACAO.md         # Análise comparativa
```

## 🚀 Como Executar

### ChatBot Flask

1. **Navegar para a pasta:**
   ```bash
   cd chatbot-flask
   ```

2. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Executar:**
   ```bash
   python app.py
   ```

4. **Acessar:**
   ```
   http://localhost:5000
   ```

### ChatBot Django

#### Opção 1: Script Automático (Windows)
```bash
cd chatbot-django
setup.bat
python manage.py runserver
```

#### Opção 2: Manual
1. **Navegar para a pasta:**
   ```bash
   cd chatbot-django
   ```

2. **Instalar dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configurar banco de dados:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Carregar dados iniciais:**
   ```bash
   python manage.py loaddata chat/fixtures/initial_bot_responses.json
   ```

5. **Criar superusuário (opcional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Executar:**
   ```bash
   python manage.py runserver
   ```

7. **Acessar:**
   ```
   Chat: http://localhost:8000/
   Admin: http://localhost:8000/admin/
   ```

## ⚡ Teste Rápido

### Flask
```bash
# Terminal 1
cd chatbot-flask
python app.py

# Acesse: http://localhost:5000
```

### Django
```bash
# Terminal 2
cd chatbot-django
python manage.py runserver 8001

# Acesse: http://localhost:8001
```

## 🔍 Principais Diferenças

### Flask (Porta 5000)
- ✅ Interface simples e limpa
- ✅ Respostas rápidas
- ✅ Código fácil de entender
- ❌ Sem persistência de dados
- ❌ Sem painel administrativo

### Django (Porta 8000)
- ✅ Interface avançada com mais recursos
- ✅ Persistência no banco de dados
- ✅ Painel administrativo completo
- ✅ Histórico de conversas
- ✅ Respostas configuráveis
- ❌ Setup mais complexo

## 🎯 Recursos para Testar

### Ambos os Chatbots
- Digite "oi" ou "olá" para cumprimentos
- Digite "tchau" para despedidas
- Digite "ajuda" para obter ajuda
- Digite "nome" para saber o nome do bot
- Teste o tema claro/escuro
- Experimente limpar a conversa

### Exclusivo do Django
- Acesse `/admin/` para gerenciar respostas
- As conversas são salvas no banco
- Exporte o histórico de conversas
- Teste palavras como "django", "python"

## 🛠️ Personalização

### Flask
Edite `app.py` na seção `RESPOSTAS_BOT` para adicionar novas respostas.

### Django
1. Acesse http://localhost:8000/admin/
2. Faça login com superusuário
3. Vá em "Bot Responses"
4. Adicione novas respostas com palavras-chave

## 📚 Aprendizado

Este projeto é ideal para:
- 🎓 Estudantes aprendendo web development
- 💼 Desenvolvedores comparando frameworks
- 🏗️ Arquitetos decidindo tecnologias
- 🚀 Empresas avaliando soluções

## 🔧 Troubleshooting

### Problemas Comuns

**Porta em uso:**
```bash
# Flask - usar porta diferente
python app.py --port 5001

# Django - usar porta diferente
python manage.py runserver 8001
```

**Dependências não instaladas:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Django - Erro de migração:**
```bash
python manage.py makemigrations --empty chat
python manage.py migrate
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se Python 3.8+ está instalado
2. Confirme que todas as dependências foram instaladas
3. Verifique se as portas 5000 e 8000 estão livres
4. Consulte os logs de erro no terminal

## 🎉 Próximos Passos

Após testar ambos:
1. Leia `COMPARACAO.md` para análise detalhada
2. Escolha o framework mais adequado para seu projeto
3. Explore o código para entender as diferenças
4. Personalize conforme suas necessidades

---

**Divirta-se explorando as duas implementações! 🚀**
