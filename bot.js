const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Setup Express untuk menampilkan QR Code sebagai gambar
const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static('public'));

// Variabel untuk menyimpan QR code terbaru
let currentQR = null;
let qrGenerated = false;

// Route untuk menampilkan QR Code sebagai gambar
app.get('/qr', (req, res) => {
    if (currentQR) {
        res.send(`
            <!DOCTYPE html>
            <html lang="id">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Scan QR Code Bot Romantis</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                    }
                    
                    .container {
                        background: rgba(255, 255, 255, 0.95);
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 500px;
                        width: 100%;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }
                    
                    .heart {
                        font-size: 3rem;
                        color: #e91e63;
                        margin-bottom: 10px;
                        animation: heartbeat 1.5s ease-in-out infinite;
                    }
                    
                    @keyframes heartbeat {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    
                    h1 {
                        color: #333;
                        margin-bottom: 10px;
                        font-size: 1.8rem;
                    }
                    
                    .subtitle {
                        color: #666;
                        margin-bottom: 30px;
                        font-size: 1.1rem;
                    }
                    
                    .qr-container {
                        background: white;
                        padding: 20px;
                        border-radius: 15px;
                        display: inline-block;
                        margin: 20px 0;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                        border: 3px solid #e91e63;
                    }
                    
                    .qr-image {
                        max-width: 300px;
                        width: 100%;
                        height: auto;
                        border-radius: 10px;
                    }
                    
                    .instructions {
                        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                        color: white;
                        padding: 25px;
                        border-radius: 15px;
                        margin: 25px 0;
                        text-align: left;
                    }
                    
                    .instructions h3 {
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .instructions ol {
                        margin-left: 20px;
                    }
                    
                    .instructions li {
                        margin-bottom: 10px;
                        line-height: 1.5;
                    }
                    
                    .status {
                        background: #e8f5e8;
                        color: #2e7d32;
                        padding: 15px;
                        border-radius: 10px;
                        margin: 20px 0;
                        border-left: 4px solid #4caf50;
                    }
                    
                    .footer {
                        margin-top: 20px;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    
                    .highlight {
                        color: #e91e63;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="heart">💖</div>
                    <h1>Scan QR Code Bot Romantis</h1>
                    <p class="subtitle">Untuk <span class="highlight">${pacarData.name}</span> dari <span class="highlight">${pacarData.yourName}</span></p>
                    
                    <div class="qr-container">
                        <img src="${currentQR}" alt="QR Code WhatsApp" class="qr-image" />
                    </div>
                    
                    <div class="status">
                        <strong>✅ QR Code Siap Digunakan!</strong>
                        <p>Bot akan aktif 24/7 setelah scan berhasil</p>
                    </div>
                    
                    <div class="instructions">
                        <h3>📱 Cara Scan QR Code:</h3>
                        <ol>
                            <li>Buka <strong>WhatsApp</strong> di smartphone Anda</li>
                            <li>Tap ikon <strong>⋮ (titik tiga)</strong> di pojok kanan atas</li>
                            <li>Pilih <strong>"Linked Devices"</strong></li>
                            <li>Tap <strong>"Link a Device"</strong></li>
                            <li><strong>Scan QR Code</strong> di atas dengan kamera</li>
                            <li>Tunggu hingga terhubung (biasanya 5-10 detik)</li>
                        </ol>
                    </div>
                    
                    <div class="footer">
                        <p>✨ Bot akan aktif otomatis ketika <span class="highlight">${pacarData.yourName}</span> offline</p>
                        <p>⏰ Status: <span class="highlight">Menunggu Scan QR Code</span></p>
                    </div>
                </div>
                
                <script>
                    // Auto-refresh setiap 30 detik untuk update status
                    setTimeout(() => {
                        window.location.reload();
                    }, 30000);
                    
                    // Tambah efek interaktif
                    document.addEventListener('DOMContentLoaded', function() {
                        const qrImage = document.querySelector('.qr-image');
                        qrImage.addEventListener('click', function() {
                            this.style.transform = 'scale(1.05)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 200);
                        });
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Loading QR Code</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .loading {
                        text-align: center;
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                    }
                    .spinner {
                        border: 4px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        border-top: 4px solid white;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="loading">
                    <div class="spinner"></div>
                    <h2>⏳ Generating QR Code...</h2>
                    <p>Silakan tunggu beberapa saat</p>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                </script>
            </body>
            </html>
        `);
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: qrGenerated ? 'QR_READY' : 'GENERATING_QR',
        service: 'WhatsApp Bot Romantis',
        untuk: pacarData.name,
        dari: pacarData.yourName,
        qr_available: !!currentQR,
        timestamp: new Date().toLocaleString('id-ID')
    });
});

app.listen(PORT, () => {
    console.log(`🌐 QR Code Server berjalan di port ${PORT}`);
    console.log(`📱 Buka http://localhost:${PORT}/qr untuk scan QR Code`);
});

// ========== KONFIGURASI BOT ==========
const pacarData = {
    name: "Anak Cantik",
    yourName: "Mas", 
    anniversary: "2024-02-14"
};

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "bot-romantis",
        dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Sistem variables
let isOwnerOnline = false;
let lastOwnerActivity = Date.now();
const ONLINE_TIMEOUT = 3 * 60 * 1000;

// Database pesan romantis
const romanticMessages = {
    sapaan: [
        `Halo ${pacarData.name}! 😊 ${pacarData.yourName} lagi sibuk nih, tapi aku (bot) siap nemenin kamu!`,
        `Hi cantik! 👋 ${pacarData.yourName} lagi offline, tapi jangan sedih ya!`,
        `Hai sayangku! 💖 ${pacarData.yourName} mungkin lagi kerja, tapi aku di sini buat kamu!`
    ],
    
    gombalan: [
        "Kalau kamu itu bintang, aku mau jadi langitnya. Biar aku bisa peluk kamu setiap malam. ✨",
        "Aku nggak butuh matahari, soalnya senyummu udah bisa nerangi hariku. ☀️",
        "Coba deh kamu jangan manis-manis gitu, aku jadi pengen terus sama kamu. 🍯",
        "Kamu tuh kayak WiFi, dari jauh aja bikin aku susah move on. 📶"
    ]
};

// ========== EVENT HANDLERS ==========

client.on('qr', async (qr) => {
    console.log('🎯 Generating QR Code Image...');
    
    try {
        // Generate QR Code sebagai data URL (gambar)
        const qrImageUrl = await QRCode.toDataURL(qr, {
            width: 400,
            margin: 2,
            color: {
                dark: '#e91e63',
                light: '#FFFFFF'
            }
        });
        
        currentQR = qrImageUrl;
        qrGenerated = true;
        
        console.log('💖 QR CODE IMAGE READY!');
        console.log(`📱 Buka link ini untuk scan QR Code: http://localhost:${PORT}/qr`);
        console.log('✨ QR Code dalam bentuk gambar yang cantik!');
        console.log('⏰ QR Code dibuat:', new Date().toLocaleString('id-ID'));
        
    } catch (error) {
        console.log('❌ Error generating QR image:', error);
        // Fallback ke terminal QR jika error
        console.log('💖 SCAN QR CODE INI DI WHATSAPP:');
        require('qrcode-terminal').generate(qr, { small: true });
    }
});

client.on('ready', () => {
    console.log('🤖 BOT ROMANTIS AKTIF 24/7!');
    console.log('✅ Berhasil terhubung ke WhatsApp');
    console.log(`💕 Ditujukan untuk: ${pacarData.name}`);
    console.log(`🤵 Dari: ${pacarData.yourName}`);
    console.log('🎉 Bot siap menerima pesan!');
    
    // Update status di memory
    currentQR = null;
    qrGenerated = true;
});

client.on('message', async (msg) => {
    const text = msg.body.toLowerCase();
    
    console.log(`📨 Pesan dari ${msg.from}: ${text}`);
    
    // Deteksi pesan dari owner (kamu)
    if (isMessageFromOwner(msg)) {
        isOwnerOnline = true;
        lastOwnerActivity = Date.now();
        console.log(`✅ ${pacarData.yourName} ONLINE - Bot non-aktif`);
        return;
    }
    
    // Cek status online/offline
    checkOnlineStatus();
    
    // Handle pesan dari pacar
    if (isMessageFromGirlfriend(msg)) {
        if (!isOwnerOnline) {
            await handleGirlfriendMessage(msg);
        }
    }
});

// ========== FUNGSI UTAMA ==========

function isMessageFromGirlfriend(msg) {
    const girlfriendNumbers = ['6281317146323@c.us'];
    return girlfriendNumbers.includes(msg.from);
}

function isMessageFromOwner(msg) {
    const ownerNumbers = ['6285711890730@c.us'];
    return ownerNumbers.includes(msg.from);
}

function checkOnlineStatus() {
    const now = Date.now();
    if (now - lastOwnerActivity > ONLINE_TIMEOUT) {
        isOwnerOnline = false;
        console.log(`🔄 Status: ${pacarData.yourName} OFFLINE - Bot aktif`);
    }
}

async function handleGirlfriendMessage(msg) {
    const text = msg.body.toLowerCase();
    
    try {
        if (text === 'menu' || text === 'help' || text === 'bantuan') {
            await msg.reply(
                `💖 *BOT ${pacarData.yourName.toUpperCase()}* 💖\n\n` +
                `${pacarData.yourName} sedang OFFLINE, tapi cintanya ONLINE terus! 💕\n\n` +
                `📋 *MENU ROMANTIS:*\n` +
                `💝 gombal - Gombalan manis buat kamu\n` +
                `🎮 game - Game seru berdua\n` +
                `💌 surprise - Kejutan spesial!\n` +
                `📅 countdown - Hitung mundur hari spesial\n` +
                `📸 foto - Minta foto terbaru\n\n` +
                `💬 *CHAT NATURAL:*\n` +
                `"halo", "rindu", "love you", "cantik", "lagi apa"\n\n` +
                `⚡ *STATUS:* ${pacarData.yourName} OFFLINE\n` +
                `🤖 Bot aktif nemenin kamu!`
            );
        }
        else if (text === 'gombal' || text === '!gombal') {
            const randomGombal = romanticMessages.gombalan[Math.floor(Math.random() * romanticMessages.gombalan.length)];
            await msg.reply(`💝 *Gombalan Manis*\n\n${randomGombal}\n\n_Dari ${pacarData.yourName} via bot_`);
        }
        else if (text === 'game' || text === '!game') {
            await msg.reply(`🎮 ${pacarData.yourName} lagi mikirin kamu! Main game yuk! 😊`);
        }
        else if (text === 'countdown' || text === '!countdown') {
            const anniversary = new Date(pacarData.anniversary);
            const today = new Date();
            const diffTime = anniversary - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            await msg.reply(`📅 *COUNTDOWN HARI SPESIAL*\n\n⏳ ${diffDays} hari menuju anniversary kita! 💕`);
        }
        else if (text === 'foto' || text === '!foto') {
            await msg.reply(`📸 ${pacarData.yourName} pasti seneng banget liat foto terbaru kamu! 😍`);
        }
        else if (text === 'surprise' || text === '!surprise') {
            await msg.reply(`💌 ${pacarData.yourName} bilang dia punya kejutan spesial buat kamu! 😏`);
        }
        else if (text.includes('halo') || text.includes('hai') || text.includes('hi')) {
            const randomSapaan = romanticMessages.sapaan[Math.floor(Math.random() * romanticMessages.sapaan.length)];
            await msg.reply(randomSapaan);
        }
        else if (text.includes('rindu') || text.includes('kangen') || text.includes('miss you')) {
            await msg.reply(`💕 ${pacarData.yourName} juga kangen banget sama kamu! Lagi mikirin kamu sekarang... 😔`);
        }
        else if (text.includes('love you') || text.includes('sayang') || text.includes('cinta')) {
            await msg.reply(`💝 ${pacarData.yourName} juga sayang banget sama kamu! Lebih dari apapun di dunia ini! 🌟`);
        }
        else if (text.includes('cantik') || text.includes('ganteng')) {
            await msg.reply(`💖 Makasih sayang! Tapi kamu yang lebih cantik/ganteng! ${pacarData.yourName} selalu bilang gitu kok! 😊`);
        }
        else if (text.length > 3) {
            await msg.reply(`💬 Wah seru banget obrolannya! ${pacarData.yourName} pasti suka denger ini! 😊`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// ========== ERROR HANDLING ==========

client.on('auth_failure', (msg) => {
    console.log('❌ Auth failure:', msg);
    console.log('🔄 Restarting in 15 seconds...');
    setTimeout(() => {
        client.initialize();
    }, 15000);
});

client.on('disconnected', (reason) => {
    console.log('❌ Bot disconnected:', reason);
    console.log('🔄 Reconnecting in 10 seconds...');
    setTimeout(() => {
        client.initialize();
    }, 10000);
});

// ========== START BOT ==========

console.log('🚀 MEMULAI BOT WHATSAPP ROMANTIS DENGAN QR GAMBAR...');
console.log('==================================================');
console.log(`💕 Untuk: ${pacarData.name}`);
console.log(`🤵 Dari: ${pacarData.yourName}`);
console.log('🌐 QR Code: Akan muncul sebagai gambar HTML');
console.log('☁️  Deploy: Railway.app');
console.log('⏰  Target: 24/7 Aktif');
console.log('==================================================');

client.initialize();