"""
Script Peluncur Otomatis Ruang Rontgen + Public Tunnel
"""

import os
import sys
import time
import subprocess
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PYTHON_EXE = os.path.join(BASE_DIR, ".venv", "Scripts", "python.exe")
if not os.path.exists(PYTHON_EXE):
    PYTHON_EXE = sys.executable

def main():
    print("=" * 60)
    print("🏥 RUANG RONTGEN - PELUNCIAN ONLINE (PUBLIC ACCESS)")
    print("=" * 60)

    # 1. Jalankan Flask App
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

    # 2. Buka Public Tunnel via localtunnel (instant, no signup, no token)
    print("[2/2] Membuka Public HTTPS Tunnel...")
    lt_proc = subprocess.Popen(
        ["npx.cmd", "--yes", "localtunnel", "--port", "5000"],
        cwd=BASE_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    public_url = None
    start_time = time.time()
    while time.time() - start_time < 20:
        line = lt_proc.stdout.readline()
        if not line:
            break
        print(line.strip())
        match = re.search(r'(https://[^\s]+)', line)
        if match:
            public_url = match.group(1)
            break

    print("\n" + "=" * 60)
    if public_url:
        print("🎉 APLIKASI WEB SUDAH BISA DIAKSES SECARA PUBLIK / ONLINE!")
        print(f"🔗 Link Akses:")
        print(f"👉 {public_url} 👈")
        print("=" * 60)
        print("💡 Catatan:")
        print("- Buka link di atas di Browser Laptop atau HP.")
        print("- Jika muncul layar konfirmasi 'Click to Continue' atau IP password, klik tombol 'Click to Continue'.")
        print("- Jangan tutup jendela ini selama ingin aplikasi tetap online.")
        print("- Tekan Ctrl + C untuk mematikan server.")
    else:
        print("⚠️ Tunnel sedang mencoba terhubung...")

    try:
        while True:
            time.sleep(1)
            if flask_proc.poll() is not None:
                print("Server Flask berhenti.")
                break
    except KeyboardInterrupt:
        print("\nMematikan server dan tunnel...")
    finally:
        flask_proc.terminate()
        lt_proc.terminate()
        print("Server offline.")

if __name__ == "__main__":
    main()
