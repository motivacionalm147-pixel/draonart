const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const APK_NAME = 'DragonArt_Ultra_v1.8.8.apk';

const PATHS = [
    path.join(__dirname, '..', 'interno', 'download_server', 'DragonArt_v1_8_8.apk'),
    path.join(__dirname, '..', '..', 'android/app/build/outputs/apk/debug/app-debug.apk'),
    path.join(__dirname, 'DragonArt_Ultra_v1.8.8.apk')
];

const INDEX_HTML = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dragon Art Ultra - Download</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #10b981;
            --accent: #34d399;
            --bg: #050505;
            --surface: #0f172a;
            --text: #f8fafc;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
        }

        .card {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            padding: 3rem;
            border-radius: 2.5rem;
            border: 1px solid rgba(16, 185, 129, 0.2);
            text-align: center;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            display: block;
            filter: drop-shadow(0 0 15px var(--primary));
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
            background: linear-gradient(to right, #fff, var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .badge {
            background: rgba(16, 185, 129, 0.1);
            color: var(--accent);
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            display: inline-block;
            margin-bottom: 2rem;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        p {
            color: #94a3b8;
            margin-bottom: 2.5rem;
            line-height: 1.6;
        }

        .btn {
            background: linear-gradient(to bottom right, var(--primary), #059669);
            color: #000;
            padding: 1.25rem 2.5rem;
            border-radius: 1.25rem;
            font-weight: 900;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }

        .btn:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4);
            filter: brightness(1.1);
        }

        .btn:active { transform: translateY(0); }

        .features {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            text-align: left;
        }

        .feature-item {
            font-size: 0.75rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .feature-item svg { width: 14px; height: 14px; color: var(--primary); }
    </style>
</head>
<body>
    <div class="card">
        <span class="icon">🐉</span>
        <h1>Dragon Art Ultra</h1>
        <div class="badge">Versão 1.8.8 Standalone</div>
        
        <p>A versão definitiva e otimizada. Sem comunidade, sem distrações. Apenas você e sua arte.</p>

        <a href="${APK_NAME}" class="btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            BAIXAR APK AGORA
        </a>

        <div class="features">
            <div class="feature-item">
                <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Sem Comunidade
            </div>
            <div class="feature-item">
                <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Super Leve
            </div>
            <div class="feature-item">
                <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Modo Offline
            </div>
            <div class="feature-item">
                <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Privacidade Total
            </div>
        </div>
    </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(INDEX_HTML);
    }

    if (req.url.endsWith('.apk')) {
        let finalPath = null;
        for (const p of PATHS) {
            if (fs.existsSync(p)) {
                finalPath = p;
                break;
            }
        }

        if (finalPath) {
            const stat = fs.statSync(finalPath);
            res.writeHead(200, {
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename="${APK_NAME}"`
            });
            return fs.createReadStream(finalPath).pipe(res);
        } else {
            res.writeHead(404);
            return res.end('APK não encontrado.');
        }
    }

    res.writeHead(404);
    res.end('Não encontrado');
});

function getIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return 'localhost';
}

function start(p) {
    server.listen(p, '0.0.0.0', () => {
        const ip = getIP();
        console.clear();
        console.log('==============================================');
        console.log('🐉 DRAGON ART ULTRA - SERVIDOR DE DOWNLOAD');
        console.log('==============================================');
        console.log('\nLink para o seu celular:');
        console.log(`👉 http://${ip}:${p}`);
        console.log('\n(Mantenha esta janela aberta para o download funcionar)\n');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') start(p + 1);
    });
}

start(PORT);
