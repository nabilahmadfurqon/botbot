const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// Setup Express untuk health check
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ 
    status: 'AKTIF', 
    service: 'WhatsApp Bot Romantis',
    uptime: Math.floor(process.uptime()) + ' detik',
    timestamp: new Date().toLocaleString('id-ID'),
    message: 'Bot aktif 24/7 untuk pacar tercantik! 💖'
  });
});

app.listen(PORT, () => {
  console.log(`🟢 Health check server ready pada port ${PORT}`);
});

// ========== KONFIGURASI BOT ==========
const pacarData = {
  name: "Anak Cantik", // GANTI dengan nama pacar
  yourName: "Mas", // GANTI dengan nama kamu
  anniversary: "2024-02-14" // GANTI dengan tanggal anniversary
};

// Konfigurasi WhatsApp Client untuk Railway
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
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--window-size=1920,1080'
    ]
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
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
    `Hai sayangku! 💖 ${pacarData.yourName} mungkin lagi kerja, tapi aku di sini buat kamu!`,
    `Halo my love! 💕 ${pacarData.yourName} sedang tidak di depan HP, tapi aku bisa nemenin kamu chat!`
  ],
  
  gombalan: [
    "Kalau kamu itu bintang, aku mau jadi langitnya. Biar aku bisa peluk kamu setiap malam. ✨",
    "Aku nggak butuh matahari, soalnya senyummu udah bisa nerangi hariku. ☀️",
    "Coba deh kamu jangan manis-manis gitu, aku jadi pengen terus sama kamu. 🍯",
    "Kamu tuh kayak WiFi, dari jauh aja bikin aku susah move on. 📶",
    "Matahari aja cuma satu, tapi kenapa cantiknya kamu bisa ada dimana-mana? 🌟",
    "Kalo kamu jadi charger, aku jadi HP-nya. Biar aku nggak pernah lepas dari kamu. 🔋",
    "Aku rela jadi pensiunan, asal pensiunannya di hatimu. ❤️"
  ],
  
  quotes: [
    "Cinta itu bukan tentang menemukan yang sempurna, tapi tentang melihat ketidaksempurnaan dengan sempurna. 🤗",
    "Kamu adalah alasan kenapa aku tersenyum setiap hari. 😊",
    "Cintaku padamu tumbuh lebih dalam setiap harinya. 🌱",
    "Di dunia yang penuh dengan orang, hanya kamu yang membuatku merasa lengkap. 🌍"
  ],
  
  rindu: [
    "Aku kangen banget sama kamu hari ini... 😔",
    "Pengen peluk kamu sekarang... 🫂",
    "Rasanya lama banget nggak ketemu, padahal baru beberapa jam aja. ⏳",
    "Kamu tau nggak? Aku senyum-senyum sendiri ingat kamu. 😊"
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
  console.log('🔧 Sistem deteksi online/offline: AKTIF');
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
    } else {
      console.log(`❌ Bot NON-AKTIF - ${pacarData.yourName} sedang online`);
    }
  }
});

// ========== FUNGSI UTILITAS ==========

function isMessageFromGirlfriend(msg) {
  // GANTI dengan nomor pacar (format: 628xxxxxxx@c.us)
  const girlfriendNumbers = [
    '6281317146323@c.us' // CONTOH: ganti dengan nomor pacar
  ];
  return girlfriendNumbers.includes(msg.from);
}

function isMessageFromOwner(msg) {
  // GANTI dengan nomor kamu (format: 628xxxxxxx@c.us)
  const ownerNumbers = [
    '6285711890730@c.us' // CONTOH: ganti dengan nomor kamu
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

// ========== HANDLE PESAN DARI PACAR ==========
async function handleGirlfriendMessage(msg) {
  const text = msg.body.toLowerCase();
  
  try {
    // 🎯 PERINTAH UTAMA
    if (text === 'menu' || text === 'help' || text === 'bantuan') {
      await sendMainMenu(msg);
    }
    
    else if (text === 'gombal' || text === '!gombal') {
      const randomGombal = romanticMessages.gombalan[Math.floor(Math.random() * romanticMessages.gombalan.length)];
      await msg.reply(`💝 *Gombalan Manis*\n\n${randomGombal}\n\n_Dari ${pacarData.yourName} 💕_`);
    }
    
    else if (text === 'quotes' || text === '!quotes') {
      const randomQuote = romanticMessages.quotes[Math.floor(Math.random() * romanticMessages.quotes.length)];
      await msg.reply(`📝 *Quotes Cinta*\n\n"${randomQuote}"\n\n_Always for you, sayang_`);
    }
    
    else if (text === 'rindu' || text === 'kangen' || text === '!rindu') {
      const randomRindu = romanticMessages.rindu[Math.floor(Math.random() * romanticMessages.rindu.length)];
      await msg.reply(`🌹 *Rindu Kamu*\n\n${randomRindu}\n\n_Aku serius nggak bohong_`);
    }
    
    else if (text === 'game' || text === '!game') {
      await msg.reply(
        `🎮 *GAME SERU BERSAMA ${pacarData.yourName.toUpperCase()}* 🎮\n\n` +
        `Pilih game:\n` +
        `1. Tebak perasaan ${pacarData.yourName} sekarang\n` +
        `2. Truth or Dare romantis\n` +
        `3. Tebak kenangan favorit\n` +
        `4. Would you rather cinta\n\n` +
        `Reply angka 1-4 ya sayang!`
      );
    }
    
    else if (text === '1') {
      await msg.reply(`🎯 ${pacarData.yourName} lagi mikirin kamu sambil senyum-senyum! 😊`);
    }
    else if (text === '2') {
      await msg.reply(`🤔 Truth: ${pacarData.yourName} sayang banget sama kamu!\nDare: Kirim voice note "Aku sayang ${pacarData.yourName}"! 🎤`);
    }
    else if (text === '3') {
      await msg.reply(`💭 Kenangan favorit ${pacarData.yourName} pasti pas pertama kali ketemu kamu! ✨`);
    }
    else if (text === '4') {
      await msg.reply(`❓ Would you rather:\nA) Peluk ${pacarData.yourName} seharian\nB) Cium ${pacarData.yourName} selamanya\n\nPilih A atau B!`);
    }
    
    else if (text === 'countdown' || text === '!countdown') {
      const anniversary = new Date(pacarData.anniversary);
      const today = new Date();
      const diffTime = anniversary - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      await msg.reply(
        `📅 *COUNTDOWN HARI SPESIAL* 📅\n\n` +
        `⏳ ${diffDays} hari menuju anniversary kita!\n` +
        `💕 ${pacarData.yourName} udah nggak sabar nunggu hari itu!\n\n` +
        `_Every day with you is special_`
      );
    }
    
    else if (text === 'foto' || text === '!foto') {
      await msg.reply(
        `📸 *MINTA FOTO DONG!* 📸\n\n` +
        `${pacarData.yourName} pasti seneng banget liat foto terbaru kamu!\n` +
        `Boleh kirim foto selfie terbaru?\n\n` +
        `_Dia janji bakal senyum-senyum liatnya!_`
      );
    }
    
    else if (text === 'surprise' || text === '!surprise') {
      await msg.reply(
        `💌 *KEJUTAN SPESIAL!* 💌\n\n` +
        `${pacarData.yourName} bilang dia punya kejutan buat kamu!\n` +
        `Tunggu aja pas dia online nanti 😏\n\n` +
        `_Dijamin bikin senyum-senyum!_`
      );
    }
    
    else if (text === 'lagu' || text === '!lagu') {
      await msg.reply(
        `🎵 *REKOMENDASI LAGU ROMANTIS* 🎵\n\n` +
        `Dari ${pacarData.yourName} buat kamu:\n` +
        `• Perfect - Ed Sheeran\n` +
        `• I Love You 3000 - Stephanie Poetri\n` +
        `• Can't Help Falling in Love\n` +
        `• All of Me - John Legend\n\n` +
        `💕 Dengerin sambil inget ${pacarData.yourName} ya!`
      );
    }
    
    else if (text === 'status' || text === '!status') {
      const uptime = Math.floor((Date.now() - botStartTime) / 1000 / 60);
      await msg.reply(
        `📊 *STATUS BOT 24/7*\n\n` +
        `🟢 Status: AKTIF\n` +
        `⏰ Uptime: ${uptime} menit\n` +
        `💌 Pesan ditangani: ${messageCount}\n` +
        `🤵 ${pacarData.yourName}: ${isOwnerOnline ? 'ONLINE' : 'OFFLINE'}\n\n` +
        `_Bot jalan di cloud 24/7_`
      );
    }
    
    // 💬 AUTO-REPLY NATURAL
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
    
    else if (text.includes('lagi apa') || text.includes('what are you doing')) {
      await msg.reply(`${pacarData.yourName} lagi sibuk nih, tapi pasti lagi mikirin kamu! 😊\nSambil nunggu dia online, mau main game? Ketik "game" ya!`);
    }
    
    else if (text.includes('pengen ketemu') || text.includes('mau ketemu')) {
      await msg.reply(`🏃‍♂️ ${pacarData.yourName} juga pengen banget ketemu kamu!\nDia pasti udah nggak sabar buat peluk kamu!\n_Cepat-cepat ketemu ya sayang!_`);
    }
    
    else if (text.includes('malam') || text.includes('selamat malam')) {
      await msg.reply(`🌙 Selamat malam sayangku! Mimpi indah tentang aku ya! 😴\nJangan lupa matiin lampu dan selimutan!`);
    }
    
    else if (text.includes('pagi') || text.includes('selamat pagi')) {
      await msg.reply(`🌞 Selamat pagi cantik! Semoga harimu menyenangkan ya! 😊\nJangan lupa sarapan dan senyum!`);
    }
    
    else if (text.includes('terima kasih') || text.includes('makasih') || text.includes('thanks')) {
      await msg.reply(`Sama-sama sayang! 😊 Senang bisa nemenin kamu! 💕`);
    }
    
    // ❤️ RESPON DEFAULT
    else if (text.length > 3) {
      const defaultReplies = [
        `Wah, seru banget obrolannya! ${pacarData.yourName} pasti suka denger ini! 😊`,
        `Awww, kamu manis banget! ${pacarData.yourName} bakal seneng baca pesan ini! 💌`,
        `Asik banget ngobrol sama kamu! Mau coba fitur lain? Ketik "menu" ya! 🎮`,
        `Pesan kamu udah aku terima nih! ${pacarData.yourName} bakal baca pas online nanti! 📱`
      ];
      const randomReply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
      await msg.reply(randomReply);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    await msg.reply(`❌ Maaf sayang, ada error sedikit. Tapi cinta ${pacarData.yourName} sama kamu nggak pernah error! 💖`);
  }
}

// ========== FUNGSI BANTUAN ==========
async function sendMainMenu(msg) {
  const menu = `💖 *BOT CINTA ${pacarData.yourName.toUpperCase()}* 💖

${pacarData.yourName} sedang OFFLINE, tapi cintanya ONLINE terus! 💕

🎁 *MENU ROMANTIS:*
💝 gombal - Gombalan manis buat kamu
📝 quotes - Quotes cinta romantis
🌹 rindu - Ungkapan rasa rindu
🎮 game - Game seru berdua
💌 surprise - Kejutan spesial!
📅 countdown - Hitung mundur hari spesial
🎵 lagu - Rekomendasi lagu romantis
📸 foto - Minta foto terbaru
📊 status - Status bot 24/7

💬 *CHAT NATURAL:*
"halo", "rindu", "love you", "cantik", "lagi apa"

⚡ *STATUS:* ${pacarData.yourName} ${isOwnerOnline ? 'ONLINE' : 'OFFLINE'}
🤖 Bot aktif nemenin kamu!`;
  
  await msg.reply(menu);
}

// ========== ERROR HANDLING & AUTO-RESTART ==========
client.on('auth_failure', (msg) => {
  console.log('❌ Auth failure:', msg);
  console.log('🔄 Restarting in 15 seconds...');
  setTimeout(() => client.initialize(), 15000);
});

client.on('disconnected', (reason) => {
  console.log('❌ Bot disconnected:', reason);
  console.log('🔄 Reconnecting in 10 seconds...');
  setTimeout(() => client.initialize(), 10000);
});

// ========== HEALTH MONITORING ==========
setInterval(() => {
  const uptime = Math.floor((Date.now() - botStartTime) / 1000 / 60);
  console.log(`📊 [HEALTH] Uptime: ${uptime}m | Messages: ${messageCount} | Owner: ${isOwnerOnline ? 'ONLINE' : 'OFFLINE'}`);
}, 5 * 60 * 1000); // Log setiap 5 menit

// ========== START BOT ==========
console.log('🚀 MEMULAI BOT WHATSAPP ROMANTIS 24/7...');
console.log('================================');
console.log(`💕 Untuk: ${pacarData.name}`);
console.log(`🤵 Dari: ${pacarData.yourName}`);
console.log('📅 Anniversary:', pacarData.anniversary);
console.log('☁️  Deploy: Railway.app');
console.log('⏰  Target: 24/7 Aktif');
console.log('================================');

client.initialize();