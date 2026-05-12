const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9090;
// Prioritize the APK in download_server, fallback to build folder
const APK_NAME = 'DragonArt_v185_20260511_1217.apk';
const LOCAL_APK_PATH = path.join(__dirname, 'download_server', APK_NAME);
const BUILD_APK_PATH = path.join(__dirname, '..', '..', 'android/app/build/outputs/apk/debug/app-debug.apk');
const INDEX_HTML_PATH = path.join(__dirname, 'download_server', 'index.html');

const server = http.createServer((req, res) => {
    const url = req.url;

    if (url === '/' || url === '/index.html') {
        if (fs.existsSync(INDEX_HTML_PATH)) {
            res.writeHead(200, { 
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            return fs.createReadStream(INDEX_HTML_PATH).pipe(res);
        } else {
            res.writeHead(404);
            return res.end('Index not found');
        }
    }

    if (url.endsWith('.apk')) {
        let finalPath = fs.existsSync(LOCAL_APK_PATH) ? LOCAL_APK_PATH : BUILD_APK_PATH;
        
        if (fs.existsSync(finalPath)) {
            const stat = fs.statSync(finalPath);
            res.writeHead(200, {
                'Content-Type': 'application/vnd.android.package-archive',
                'Content-Length': stat.size,
                'Content-Disposition': `attachment; filename="${APK_NAME}"`
            });
            return fs.createReadStream(finalPath).pipe(res);
        } else {
            res.writeHead(404);
            return res.end('APK not found. Please run GERAR_APP.bat first.');
        }
    }

    res.writeHead(404);
    res.end('Not found');
});

function getIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

function startServer(p) {
    server.listen(p, '0.0.0.0', () => {
        const ip = getIP();
        console.log('==========================================');
        console.log('🚀 SERVIDOR DE DOWNLOAD ATIVO!');
        console.log('==========================================');
        console.log('\nNo seu celular, acesse:');
        console.log(`👉 http://${ip}:${p}`);
        console.log('\nMantenha esta janela aberta.');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Porta ${p} ocupada, tentando ${p + 1}...`);
            startServer(p + 1);
        }
    });
}

startServer(PORT);
