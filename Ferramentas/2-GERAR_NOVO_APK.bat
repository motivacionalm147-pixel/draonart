@echo off
setlocal
cd /d "%~dp0.."
echo ==========================================
echo    GERADOR DE INSTALADOR - DRAGON ART
echo ==========================================
echo.

:: 1. Build Web
echo [1/4] Construindo projeto web...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao construir o projeto web (npm run build).
    echo Verifique se ha erros no codigo acima.
    pause
    exit /b %ERRORLEVEL%
)

:: 2. Sync
echo.
echo [2/4] Sincronizando com Capacitor...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Falha ao sincronizar com Capacitor (npx cap sync).
    pause
    exit /b %ERRORLEVEL%
)

:: 3. APK build
echo.
echo [3/4] Gerando APK (Android)...
echo Isso pode demorar alguns minutos na primeira vez...

:: Tenta deletar o APK antigo para garantir que o novo sera criado
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    del "android\app\build\outputs\apk\debug\app-debug.apk"
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        echo.
        echo [ERRO] Nao foi possivel deletar o APK antigo. 
        echo O Android Studio ou outro programa pode estar usando o arquivo.
        echo Feche o Android Studio e tente novamente.
        pause
        exit /b 1
    )
)

cd android
call gradlew.bat assembleDebug
set GRADLE_EXIT=%ERRORLEVEL%
cd ..

if %GRADLE_EXIT% NEQ 0 (
    echo.
    echo [ERRO] O Gradle falhou ao gerar o APK.
    echo Verifique as mensagens de erro vermelhas acima.
    pause
    exit /b %GRADLE_EXIT%
)

echo.
echo ==============================================
echo [4/4] COPIANDO PARA A PASTA DE DOWNLOAD v1.7.1...
echo ==============================================
copy /y "android\app\build\outputs\apk\debug\app-debug.apk" "Ferramentas\interno\download_server\DragonArt_v1_7_1.apk"
echo.
echo O arquivo atualizado esta em: Ferramentas\interno\download_server\DragonArt_v1_7_1.apk
echo.
echo Agora voce pode fechar esta janela e abrir o "SERVIDOR_DOWNLOAD.bat".
echo.
pause
