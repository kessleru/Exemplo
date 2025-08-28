from flask import Flask, render_template, request, jsonify
import random
import time

app = Flask(__name__)

# Respostas predefinidas do chatbot (você pode expandir isso)
RESPOSTAS_BOT = {
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
        'Eu sou o ChatBot Assistant!',
        'Meu nome é ChatBot, prazer em conhecer você!',
        'Sou o seu assistente virtual ChatBot.'
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

def obter_resposta_bot(mensagem):
    """
    Função simples para gerar respostas do chatbot
    Você pode substituir isso por IA mais avançada como OpenAI, etc.
    """
    mensagem = mensagem.lower().strip()
    
    # Verificar cumprimentos
    if any(palavra in mensagem for palavra in ['oi', 'olá', 'hello', 'ola', 'bom dia', 'boa tarde', 'boa noite']):
        return random.choice(RESPOSTAS_BOT['cumprimentos'])
    
    # Verificar despedidas
    elif any(palavra in mensagem for palavra in ['tchau', 'adeus', 'bye', 'até logo', 'falou']):
        return random.choice(RESPOSTAS_BOT['despedida'])
    
    # Verificar pedidos de ajuda
    elif any(palavra in mensagem for palavra in ['ajuda', 'help', 'socorro', 'como']):
        return random.choice(RESPOSTAS_BOT['ajuda'])
    
    # Verificar perguntas sobre nome
    elif any(palavra in mensagem for palavra in ['nome', 'quem é você', 'quem você é', 'seu nome']):
        return random.choice(RESPOSTAS_BOT['nome'])
    
    # Resposta padrão
    else:
        return random.choice(RESPOSTAS_BOT['default'])

@app.route('/')
def index():
    """Página principal do chatbot"""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint para processar mensagens do chat"""
    try:
        data = request.get_json()
        mensagem_usuario = data.get('message', '').strip()
        
        if not mensagem_usuario:
            return jsonify({'error': 'Mensagem vazia'}), 400
        
        # Simular um pequeno delay para parecer mais realista
        time.sleep(0.5)
        
        # Obter resposta do bot
        resposta_bot = obter_resposta_bot(mensagem_usuario)
        
        return jsonify({
            'response': resposta_bot,
            'timestamp': time.time()
        })
    
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/clear', methods=['POST'])
def clear_chat():
    """Endpoint para limpar o histórico do chat"""
    return jsonify({'message': 'Chat limpo com sucesso'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
