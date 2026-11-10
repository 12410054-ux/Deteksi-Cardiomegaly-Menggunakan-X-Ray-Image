// Elements DOM
const form = document.querySelector('#prediction-form');
const input = document.querySelector('#image-input');
const dropzone = document.querySelector('#dropzone');
const previewWrap = document.querySelector('#preview-wrap');
const preview = document.querySelector('#preview');
const errorBox = document.querySelector('#error-message');
const alertDesc = document.querySelector('#alert-desc');
const submitButton = document.querySelector('#submit-button');

const emptyState = document.querySelector('#empty-state');
const loadingState = document.querySelector('#loading-state');
const resultContent = document.querySelector('#result-content');
const statusText = document.querySelector('#result-status');

let currentObjectUrl = '';

// Reset views
function clearResult() {
  resultContent.hidden = true;
  emptyState.hidden = false;
  loadingState.hidden = true;
  statusText.textContent = 'MENUNGGU PEMERIKSAAN';
}

function showError(message) {
  alertDesc.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
}

// Client-side instant pre-validation for non-Xray colored pictures
function checkImageGrayscale(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Create off-screen canvas to sample pixels
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const sampleSize = 80;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const data = imageData.data;
      let totalDiff = 0;
      let pixelCount = sampleSize * sampleSize;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const diff = Math.abs(r - g) + Math.abs(g - b);
        totalDiff += diff;
      }

      const avgColorDiff = totalDiff / pixelCount;
      // If average channel divergence is significant, image is clearly colored (not an X-ray)
      if (avgColorDiff > 14) {
        callback(false, 'Gambar terdeteksi berwarna! Sistem hanya menerima citra rontgen X-ray (grayscale). Foto umum, selfie, atau dokumen dilarang.');
      } else {
        callback(true, '');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Handle File Selection
function chooseFile(file) {
  hideError();
  if (!file) return;

  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showError('Format berkas tidak valid. Harap gunakan format gambar PNG, JPG, JPEG, atau WEBP.');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showError('Ukuran berkas melebihi 10 MB. Silakan kompres atau unggah berkas yang lebih kecil.');
    return;
  }

  // Pre-check grayscale on client
  checkImageGrayscale(file, (isValid, errMsg) => {
    if (!isValid) {
      showError(errMsg);
      input.value = '';
      return;
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
    }
    currentObjectUrl = URL.createObjectURL(file);
    preview.src = currentObjectUrl;
    previewWrap.hidden = false;
    dropzone.hidden = true;
    clearResult();
  });
}

// Input change listener
input.addEventListener('change', () => {
  if (input.files && input.files[0]) {
    chooseFile(input.files[0]);
  }
});

// Remove / change image
document.querySelector('#remove-image').addEventListener('click', () => {
  input.value = '';
  previewWrap.hidden = true;
  dropzone.hidden = false;
  clearResult();
  hideError();
});

// Drag and drop events
['dragenter', 'dragover'].forEach(name => {
  dropzone.addEventListener(name, (e) => {
    e.preventDefault();
    dropzone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach(name => {
  dropzone.addEventListener(name, (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragging');
  });
});

dropzone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    chooseFile(file);
  }
});

// Form submission & inference request
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  if (!input.files[0]) {
    showError('Silakan pilih atau unggah citra rontgen dada terlebih dahulu.');
    return;
  }

  const formData = new FormData(form);
  submitButton.disabled = true;
  emptyState.hidden = true;
  resultContent.hidden = true;
  loadingState.hidden = false;
  statusText.textContent = 'SEDANG MEMINDAI...';

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Terjadi kesalahan saat memproses citra.');
    }

    // Set Image and Results
    document.querySelector('#result-image').src = data.image_url;
    document.querySelector('#diagnosis').textContent = data.label;
    document.querySelector('#confidence').textContent = `${data.confidence.toFixed(1)}%`;
    document.querySelector('#model-name').textContent = data.model_name;

    // Clinical note & badge styling
    const badge = document.querySelector('#report-badge');
    const noteBox = document.querySelector('#clinical-note-box');
    const noteText = document.querySelector('#clinical-note');

    badge.className = 'report-badge';
    noteBox.className = 'clinical-note';
    noteText.textContent = data.clinical_note || '';

    if (data.status_type === 'warning') {
      badge.classList.add('is-warning');
      noteBox.classList.add('is-warning');
    } else {
      badge.classList.add('is-normal');
      noteBox.classList.add('is-normal');
    }

    // Meters
    document.querySelector('#normal-value').textContent = `${data.normal_probability.toFixed(1)}%`;
    document.querySelector('#cardio-value').textContent = `${data.cardiomegaly_probability.toFixed(1)}%`;

    setTimeout(() => {
      document.querySelector('#normal-bar').style.width = `${data.normal_probability}%`;
      document.querySelector('#cardio-bar').style.width = `${data.cardiomegaly_probability}%`;
    }, 100);

    loadingState.hidden = true;
    resultContent.hidden = false;
    statusText.textContent = 'PEMERIKSAAN SELESAI';
  } catch (err) {
    loadingState.hidden = true;
    emptyState.hidden = false;
    statusText.textContent = 'MENUNGGU PEMERIKSAAN';
    showError(err.message);
  } finally {
    submitButton.disabled = false;
  }
});

// Reset Button
document.querySelector('#reset-button').addEventListener('click', () => {
  input.value = '';
  previewWrap.hidden = true;
  dropzone.hidden = false;
  clearResult();
  hideError();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
