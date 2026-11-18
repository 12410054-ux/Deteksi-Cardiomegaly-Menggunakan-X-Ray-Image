"""
Modul Validasi Citra Radiografi Toraks Dada (Chest X-Ray Pre-Screening Validator).

Memverifikasi citra sebelum inferensi CNN untuk memastikan berkas yang diunggah
benar-benar citra rontgen toraks dada (Chest X-Ray), bukan foto selfie, hewan,
pemandangan, dokumen teks/kertas, sketsa biner, atau citra Out-Of-Distribution (OOD).
"""
from __future__ import annotations

import cv2
import numpy as np
from PIL import Image


def validate_chest_xray(image: Image.Image) -> tuple[bool, str]:
    """
    Sistem Validasi Multi-Tahap Radiografi Dada (Chest X-Ray Pre-Screening).
    
    Tahapan Pemeriksaan:
    1. Integritas Dimensi & Aspek Rasio (mendeteksi resolusi rendah / rasio tidak wajar)
    2. Deteksi Warna & Saturasi (mendeteksi foto berwarna non-medis)
    3. Deteksi Dokumen Kertas & Latar Putih (mendeteksi scan teks, surat, resep, sertifikat)
    4. Kontras & Rentang Dinamis Jaringan (mendeteksi blank, overexposed, sketsa biner)
    5. Analisis Kontur Tulang & Paru (Sobel Gradient Magnitude)
    6. Verifikasi Struktur Kavitas Toraks (Perifer vs Pusat Dada)
    
    Returns:
        tuple[bool, str]: (is_valid, pesan_evaluasi)
    """
    # --- TAHAP 1: Integritas Dimensi & Aspek Rasio ---
    w, h = image.size
    if w < 100 or h < 100:
        return (
            False,
            "Dimensi citra terlalu kecil (minimal 100x100 piksel). Harap unggah citra rontgen dengan resolusi yang memadai.",
        )

    aspect = w / float(h)
    if aspect < 0.45 or aspect > 2.20:
        return (
            False,
            f"Aspek rasio citra ({aspect:.2f}) tidak wajar untuk foto rontgen dada. Radiografi toraks standar (PA/AP) memiliki proporsi mendekati bujur sangkar atau tegak (portrait).",
        )

    # Konversi ke RGB dan Array
    img_rgb = image.convert("RGB")
    arr = np.asarray(img_rgb, dtype=np.float32)

    # --- TAHAP 2: Deteksi Warna & Saturasi (Monochromaticity Check) ---
    # Sinar-X adalah radiasi pengion monokromatik (skala abu-abu).
    diff_rg = np.abs(arr[:, :, 0] - arr[:, :, 1])
    diff_gb = np.abs(arr[:, :, 1] - arr[:, :, 2])
    diff_rb = np.abs(arr[:, :, 0] - arr[:, :, 2])
    color_diff = float((np.mean(diff_rg) + np.mean(diff_gb) + np.mean(diff_rb)) / 3.0)

    # Perhitungan saturasi HSV
    max_c = np.maximum(np.maximum(arr[:, :, 0], arr[:, :, 1]), arr[:, :, 2])
    min_c = np.minimum(np.minimum(arr[:, :, 0], arr[:, :, 1]), arr[:, :, 2])
    delta = max_c - min_c
    sat = np.zeros_like(max_c)
    mask = max_c > 0
    sat[mask] = delta[mask] / max_c[mask]
    mean_sat = float(np.mean(sat) * 100.0)
    high_sat_pixels = float(np.mean(sat > 0.15))

    if color_diff > 4.0 or mean_sat > 6.0 or high_sat_pixels > 0.02:
        return (
            False,
            "Berkas terdeteksi sebagai gambar berwarna non-medis! Sistem Ruang Rontgen hanya memproses citra radiografi X-Ray dada toraks monokromatik (skala abu-abu). Foto umum, selfie, atau objek berwarna tidak dapat dianalisis.",
        )

    # --- TAHAP 3: Deteksi Dokumen Kertas, Teks, & Latar Belakang Putih ---
    gray = np.mean(arr, axis=2)
    white_ratio = float(np.mean(gray > 240))
    cw, ch = max(int(w * 0.12), 1), max(int(h * 0.12), 1)
    corner_mean = float((
        np.mean(gray[:ch, :cw]) +
        np.mean(gray[:ch, -cw:]) +
        np.mean(gray[-ch:, :cw]) +
        np.mean(gray[-ch:, -cw:])
    ) / 4.0)

    if white_ratio > 0.45 or (corner_mean > 215 and white_ratio > 0.25):
        return (
            False,
            "Berkas terdeteksi sebagai dokumen kertas, teks, invoice, atau tangkapan layar berlatar putih. Harap unggah citra rontgen toraks dada yang valid.",
        )

    # --- TAHAP 4: Kontras, Rentang Dinamis, & Karakteristik Jaringan ---
    std_val = float(np.std(gray))
    mean_val = float(np.mean(gray))

    if std_val < 22.0:
        return (
            False,
            "Kontras citra terlalu rendah atau gambar kosong/polos. Citra tidak memenuhi standar visual radiografi dada.",
        )

    if mean_val < 30.0 or mean_val > 225.0:
        return (
            False,
            "Intensitas pencahayaan citra berada di luar batas wajar radiografi dada (terlalu gelap gulita atau overexposed).",
        )

    midtone_ratio = float(np.mean((gray >= 30) & (gray <= 225)))
    if midtone_ratio < 0.32:
        return (
            False,
            "Distribusi intensitas citra terdeteksi sebagai sketsa biner atau ilustrasi, bukan citra jaringan radiografi toraks.",
        )

    # --- TAHAP 5: Analisis Kontur Tulang & Paru (Sobel Gradient Magnitude) ---
    gray_uint8 = np.uint8(gray)
    sx = cv2.Sobel(gray_uint8, cv2.CV_32F, 1, 0, ksize=3)
    sy = cv2.Sobel(gray_uint8, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.sqrt(sx**2 + sy**2)
    grad_mean = float(np.mean(mag))
    if grad_mean < 15.0:
        return (
            False,
            "Tekstur kontur citra terlalu minim/halus untuk struktur anatomi dada (tulang rusuk & kavitas toraks).",
        )

    # --- TAHAP 6: Verifikasi Struktur Kavitas Toraks (Perifer vs Pusat) ---
    std_gray = cv2.resize(gray, (160, 160), interpolation=cv2.INTER_LINEAR)
    corner_box = (
        np.mean(std_gray[:20, :20]) + np.mean(std_gray[:20, -20:]) +
        np.mean(std_gray[-20:, :20]) + np.mean(std_gray[-20:, -20:])
    ) / 4.0
    center_box = np.mean(std_gray[40:120, 40:120])
    if corner_box > center_box + 50.0:
        return (
            False,
            "Distribusi spasial densitas perifer tidak sesuai radiografi dada (sudut luar lebih terang dari kavitas toraks).",
        )

    return True, "Valid"
