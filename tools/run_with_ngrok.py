"""
Script Peluncur Otomatis Ruang Rontgen + ngrok Tunnel
"""

import os
import sys
import time
import subprocess
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PYTHON_EXE = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(PYTHON_EXE):
    PYTHON_EXE = sys.executable

def main():
    print("=" * 60)
    print("🚀 RUANG RONTGEN - PELUNCUR SERVER & NGROK TUNNEL")
    print("=" * 60)

    # 1. Pastikan Authtoken Terpasang
    from pyngrok import conf, ngrok
    config = conf.get_default()
    
    if not config.auth_token:
        print("\n⚠️ Authtoken ngrok belum terpasang.")
        token = input("👉 Silakan Paste Authtoken Anda di sini lalu tekan Enter: ").strip()
        if token:
            ngrok.set_auth_token(token)
            print("✅ Authtoken berhasil disimpan!")
        else:
            print("❌ Authtoken tidak boleh kosong!")
            return

    # 2. Jalankan Flask App
    print("\n[1/2] Menjalankan Server Flask di http://127.0.0.1:5000 ...")
    flask_proc = subprocess.Popen(
        [PYTHON_EXE, "app.py"],
        cwd=BASE_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    time.sleep(3)

    # 3. Buka ngrok tunnel
    print("[2/2] Membuka ngrok tunnel publik...")
    try:
        tunnel = ngrok.connect(5000)
        public_url = tunnel.public_url
        print("\n" + "=" * 60)
        print("🎉 APLIKASI WEB BERHASIL ONLINE VIA NGROK!")
        print("🔗 Link Akses Publik (Bisa dibuka di HP / Laptop lain):")
        print(f"👉 \033[1;32m{public_url}\033[0m 👈")
        print("=" * 60)
        print("Catatan: Biarkan jendela ini tetap terbuka. Tekan Ctrl + C untuk berhenti.")
        
        while True:
            time.sleep(1)
            if flask_proc.poll() is not None:
                print("Server Flask berhenti.")
                break
    except Exception as e:
        print(f"\n❌ Terjadi kendala saat membuka ngrok tunnel: {e}")
        print("\n💡 Tips Jika Diblokir Windows Defender:")
        print("1. Buka Windows Security -> 'Virus & threat protection'")
        print("2. Pada 'Protection history', pilih peringatan ngrok lalu klik 'Allow on device'")
        print("3. Atau gunakan alternatif instan tanpa registrasi: jalankan 'jalankan_online.bat'")
    finally:
        flask_proc.terminate()
        try:
            ngrok.kill()
        except Exception:
            pass

if __name__ == "__main__":
    main()
