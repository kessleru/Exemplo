@echo off
echo ================================
echo  Setup do ChatBot Django
echo ================================
echo.

echo Verificando se o Python está instalado...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Python não encontrado. Por favor, instale o Python primeiro.
    pause
    exit /b 1
)

echo Python encontrado!
echo.

echo Instalando dependências...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalação das dependências.
    pause
    exit /b 1
)

echo.
echo Criando migrações do banco de dados...
python manage.py makemigrations
if %errorlevel% neq 0 (
    echo ERRO: Falha na criação das migrações.
    pause
    exit /b 1
)

echo.
echo Aplicando migrações...
python manage.py migrate
if %errorlevel% neq 0 (
    echo ERRO: Falha na aplicação das migrações.
    pause
    exit /b 1
)

echo.
echo Carregando dados iniciais...
python manage.py loaddata chat/fixtures/initial_bot_responses.json
if %errorlevel% neq 0 (
    echo Aviso: Falha no carregamento dos dados iniciais (isso é normal se já foram carregados).
)

echo.
echo ================================
echo  Setup concluído com sucesso!
echo ================================
echo.
echo Para iniciar o servidor, execute:
echo   python manage.py runserver
echo.
echo Para criar um superusuário (admin), execute:
echo   python manage.py createsuperuser
echo.
echo URLs importantes:
echo   Chat: http://localhost:8000/
echo   Admin: http://localhost:8000/admin/
echo.
pause
