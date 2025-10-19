const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Data pacar - GANTI DENGAN DATA KAMU
const pacarData = {
  name: "Anak Cantik",        // Ganti nama pacar
  yourName: "Mas",           // Ganti nama kamu
  anniversary: "2024-02-14"  // Ganti tanggal anniversary
};

// KONFIGURASI KHUSUS UNTUK RAILWAY - 100% WORK
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
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--window-size=1920,1080'
    ]
  }
});

// Sistem variables
let isOwnerOnline = false;
let lastOwnerActivity = Date.now();
const ONLINE_TIMEOUT = 3 * 60 * 1000; // 3 menit

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

// ==================== EVENT HANDLERS ====================

client.on('qr', (qr) => {
  console.log('💖 SCAN QR CODE INI DI WHATSAPP:');
  console.log('📱 Buka WhatsApp → Settings → Linked Devices → Link a Device');
  qrcode.generate(qr, { small: true });
  console.log('⏰ QR Code dibuat:', new Date().toLocaleString('id-ID'));
});

client.on('ready', () => {
  console.log('🤖 BOT ROMANTIS AKTIF 24/7!');
  console.log('✅ Berhasil terhubung ke WhatsApp');
  console.log(`💕 Ditujukan untuk: ${pacarData.name}`);
  console.log(`🤵 Dari: ${pacarData.yourName}`);
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

// ==================== FUNGSI UTAMA ====================

function isMessageFromGirlfriend(msg) {
  // GANTI dengan nomor pacar (format: 628xxxxxxx@c.us)
  const girlfriendNumbers = [
    '6281317146323@c.us'  // CONTOH: ganti dengan nomor pacar kamu
  ];
  return girlfriendNumbers.includes(msg.from);
}

function isMessageFromOwner(msg) {
  // GANTI dengan nomor kamu (format: 628xxxxxxx@c.us)
  const ownerNumbers = [
    '6285711890730@c.us'  // CONTOH: ganti dengan nomor kamu
  ];
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

// ==================== ERROR HANDLING ====================

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

// ==================== START BOT ====================

console.log('🚀 MEMULAI BOT WHATSAPP ROMANTIS 24/7...');
console.log('================================');
console.log(`💕 Untuk: ${pacarData.name}`);
console.log(`🤵 Dari: ${pacarData.yourName}`);
console.log('☁️  Deploy: Railway.app');
console.log('⏰  Target: 24/7 Aktif');
console.log('================================');

client.initialize();