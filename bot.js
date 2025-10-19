const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const pacarData = {
  name: "Anak Cantik",
  yourName: "Mas", 
  anniversary: "2024-02-14"
};

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "bot-romantis-24-7",
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
    ],
    executablePath: '/usr/bin/google-chrome-stable'
  }
});

// ========== VARIABEL SISTEM ==========
let botStartTime = Date.now();
let messageCount = 0;
let isOwnerOnline = false;
let lastOwnerActivity = Date.now();
const ONLINE_TIMEOUT = 3 * 60 * 1000; // 3 menit

// ========== DATABASE PESAN ROMANTIS ==========
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

// QR Code Generator
client.on('qr', (qr) => {
  console.log('💖 SCAN QR CODE INI DI WHATSAPP:');
  console.log('📱 Buka WhatsApp → Settings → Linked Devices → Link a Device');
  qrcode.generate(qr, { small: true });
  console.log('⏰ QR Code dibuat:', new Date().toLocaleString('id-ID'));
});

// Bot Ready
client.on('ready', () => {
  console.log('🤖 BOT ROMANTIS AKTIF 24/7!');
  console.log('✅ Berhasil terhubung ke WhatsApp');
  console.log('⏰ Waktu mulai:', new Date().toLocaleString('id-ID'));
  console.log(`💕 Ditujukan untuk: ${pacarData.name}`);
  console.log(`🤵 Dari: ${pacarData.yourName}`);
});

// Handle Incoming Messages
client.on('message', async (msg) => {
  const text = msg.body.toLowerCase();
  messageCount++;
  
  console.log(`📨 [${messageCount}] Pesan dari ${msg.from}: ${text}`);
  
  // Deteksi jika pesan dari owner (kamu)
  if (isMessageFromOwner(msg)) {
    isOwnerOnline = true;
    lastOwnerActivity = Date.now();
    console.log(`✅ ${pacarData.yourName} ONLINE - Bot non-aktif`);
    return;
  }
  
  // Cek status online/offline owner
  checkOnlineStatus();
  
  // Handle pesan dari pacar
  if (isMessageFromGirlfriend(msg)) {
    if (!isOwnerOnline) {
      await handleGirlfriendMessage(msg);
    }
  }
});

// ========== FUNGSI UTILITAS ==========

function isMessageFromGirlfriend(msg) {
  const girlfriendNumbers = [
    '6281317146323@c.us' // GANTI dengan nomor pacar
  ];
  return girlfriendNumbers.includes(msg.from);
}

function isMessageFromOwner(msg) {
  const ownerNumbers = [
    '6285711890730@c.us' // GANTI dengan nomor kamu
  ];
  return ownerNumbers.includes(msg.from);
}

function checkOnlineStatus() {
  const now = Date.now();
  if (now - lastOwnerActivity > ONLINE_TIMEOUT) {
    isOwnerOnline = false;
  }
}

// ========== HANDLE PESAN DARI PACAR ==========
async function handleGirlfriendMessage(msg) {
  const text = msg.body.toLowerCase();
  
  try {
    if (text === 'menu' || text === 'help') {
      await msg.reply(
        `💖 *BOT ${pacarData.yourName.toUpperCase()}* 💖\n\n` +
        `📋 Menu:\n` +
        `💝 gombal - Gombalan manis\n` +
        `🎮 game - Game seru\n` +
        `📅 countdown - Hari spesial\n` +
        `📸 foto - Minta foto\n` +
        `💌 surprise - Kejutan\n\n` +
        `💬 Chat: halo, rindu, love you, cantik`
      );
    }
    else if (text === 'gombal') {
      const randomGombal = romanticMessages.gombalan[Math.floor(Math.random() * romanticMessages.gombalan.length)];
      await msg.reply(`💝 ${randomGombal}\n\n_Dari ${pacarData.yourName} 💕_`);
    }
    else if (text === 'game') {
      await msg.reply(`🎮 Main game yuk! ${pacarData.yourName} lagi mikirin kamu! 😊`);
    }
    else if (text === 'countdown') {
      const diffDays = Math.ceil((new Date(pacarData.anniversary) - new Date()) / (1000 * 60 * 60 * 24));
      await msg.reply(`📅 ${diffDays} hari menuju anniversary kita! 💕`);
    }
    else if (text === 'foto') {
      await msg.reply(`📸 ${pacarData.yourName} pasti seneng liat foto terbaru kamu! 😍`);
    }
    else if (text.includes('halo')) {
      const randomSapaan = romanticMessages.sapaan[Math.floor(Math.random() * romanticMessages.sapaan.length)];
      await msg.reply(randomSapaan);
    }
    else if (text.includes('rindu')) {
      await msg.reply(`💕 ${pacarData.yourName} juga kangen banget sama kamu! 😔`);
    }
    else if (text.includes('love you')) {
      await msg.reply(`💝 ${pacarData.yourName} juga sayang banget sama kamu! 🌟`);
    }
    else if (text.length > 2) {
      await msg.reply(`💬 Wah seru banget obrolannya! ${pacarData.yourName} pasti suka ini! 😊`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ========== ERROR HANDLING ==========
client.on('auth_failure', (msg) => {
  console.log('❌ Auth failure, restarting...');
  setTimeout(() => client.initialize(), 15000);
});

client.on('disconnected', (reason) => {
  console.log('❌ Bot disconnected, reconnecting...');
  setTimeout(() => client.initialize(), 10000);
});

// ========== START BOT ==========
console.log('🚀 MEMULAI BOT WHATSAPP ROMANTIS...');
console.log('================================');
console.log(`💕 Untuk: ${pacarData.name}`);
console.log(`🤵 Dari: ${pacarData.yourName}`);
console.log('☁️  Deploy: Railway.app');
console.log('================================');

client.initialize();