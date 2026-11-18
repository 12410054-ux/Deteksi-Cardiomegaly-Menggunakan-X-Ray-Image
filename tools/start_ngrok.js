const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const ngrok = require('@ngrok/ngrok');

const BASE_DIR = path.resolve(__dirname, '..');
const PYTHON_EXE = path.join(BASE_DIR, '.venv', 'Scripts', 'python.exe');

// Baca authtoken secara aman dari environment variable atau file .env
function getAuthToken() {
    if (process.env.NGROK_AUTHTOKEN) {
        return process.env.NGROK_AUTHTOKEN.trim();
    }
    const envPath = path.join(BASE_DIR, '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*NGROK_AUTHTOKEN\s*=\s*(.*)\s*$/);
            if (match && match[1]) {
                return match[1].trim().replace(/^['"]|['"]$/g, '');
            }
        }
    }
    return '';
}

const AUTHTOKEN = getAuthToken();

async function main() {
    console.log('='.repeat(65));
    console.log('🏥 RUANG RONTGEN - SISTEM ONLINE VIA NGROK');
    console.log('='.repeat(65));

    // 1. Jalankan Backend Flask
    console.log('\n[1/2] Menyalakan Backend Flask di http://127.0.0.1:5000 ...');
    const flaskProcess = spawn(PYTHON_EXE, ['app.py'], {
        cwd: BASE_DIR,
        stdio: ['ignore', 'inherit', 'inherit']
    });

    flaskProcess.on('error', (err) => {
        console.error('Gagal menjalankan Flask:', err.message);
    });

    // Tunggu 2 detik agar Flask siap
    await new Promise(resolve => setTimeout(resolve, 2500));

    // 2. Buka ngrok tunnel
    console.log('[2/2] Membuka Tunnel Publik ngrok...');
    if (!AUTHTOKEN) {
        console.warn('⚠️  Peringatan: NGROK_AUTHTOKEN belum diatur dalam file .env atau variabel sistem.');
        console.warn('👉  Silakan isi NGROK_AUTHTOKEN pada file .env jika tunnel memerlukan login.\n');
    }
    try {
        const forwardOptions = { addr: 5000 };
        if (AUTHTOKEN) forwardOptions.authtoken = AUTHTOKEN;
        const listener = await ngrok.forward(forwardOptions);

        const publicUrl = listener.url();
        console.log('\n' + '='.repeat(65));
        console.log('🎉 APLIKASI WEB BERHASIL ONLINE VIA NGROK!');
        console.log('🔗 Link Publik (Bisa dibuka di HP / Laptop teman / Dosen):');
        console.log(`\n👉 \x1b[32m\x1b[1m${publicUrl}\x1b[0m 👈\n`);
        console.log('='.repeat(65));
        console.log('💡 Informasi:');
        console.log('- Aplikasi siap menerima upload rontgen & prediksi AI secara live.');
        console.log('- Jangan tutup jendela terminal ini agar aplikasi tetap online.');
        console.log('- Tekan Ctrl + C untuk mematikan server.');
        console.log('='.repeat(65) + '\n');

        // Tangani penutupan proses
        const cleanup = async () => {
            console.log('\nMematikan server dan tunnel ngrok...');
            try { await listener.close(); } catch (e) {}
            flaskProcess.kill();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (err) {
        console.error('❌ Gagal membuka tunnel ngrok:', err.message);
        flaskProcess.kill();
        process.exit(1);
    }
}

main();
