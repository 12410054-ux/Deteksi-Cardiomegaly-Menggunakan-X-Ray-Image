const form = document.querySelector('#prediction-form');
const input = document.querySelector('#image-input');
const dropzone = document.querySelector('#dropzone');
const previewWrap = document.querySelector('#preview-wrap');
const preview = document.querySelector('#preview');
const errorBox = document.querySelector('#error-message');
const submitButton = document.querySelector('#submit-button');
const emptyState = document.querySelector('#empty-state');
const loadingState = document.querySelector('#loading-state');
const resultContent = document.querySelector('#result-content');
const statusText = document.querySelector('#result-status');
const normalRow = document.querySelector('#normal-row');
const cardioRow = document.querySelector('#cardio-row');
const clinicalNote = document.querySelector('#clinical-note');
let objectUrl = '';

function clearResult() {
    resultContent.hidden = true;
    emptyState.hidden = false;
    loadingState.hidden = true;
    statusText.textContent = 'MENUNGGU CITRA';
    statusText.style.color = '';
    document.querySelector('#disclaimer-empty').hidden = false;
    if (normalRow) normalRow.hidden = true;
    if (cardioRow) cardioRow.hidden = true;
    if (clinicalNote) clinicalNote.textContent = '';
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
}

function chooseFile(file) {
    errorBox.hidden = true;
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        showError('Gunakan gambar PNG, JPG, JPEG, atau WEBP.');
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        showError('Ukuran gambar maksimal 10 MB.');
        return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    previewWrap.hidden = false;
    dropzone.hidden = true;
    document.querySelector('#file-title').textContent = file.name;
    clearResult();
}

input.addEventListener('change', () => chooseFile(input.files[0]));
document.querySelector('#remove-image').addEventListener('click', () => {
    input.value = '';
    previewWrap.hidden = true;
    dropzone.hidden = false;
    clearResult();
});

for (const name of ['dragenter', 'dragover']) {
    dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragging');
    });
}
for (const name of ['dragleave', 'drop']) {
    dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
    });
}
dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (file) {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        chooseFile(file);
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;
    if (!input.files[0]) {
        showError('Pilih gambar rontgen terlebih dahulu.');
        return;
    }

    const body = new FormData(form);
    submitButton.disabled = true;
    emptyState.hidden = true;
    resultContent.hidden = true;
    loadingState.hidden = false;
    statusText.textContent = 'SEDANG MENGANALISIS';
    document.querySelector('#disclaimer-empty').hidden = true;

    try {
        const response = await fetch('/predict', { method: 'POST', body });
        const data = await response.json();
        if (!response.ok) {
            const err = new Error(data.error || 'Prediksi gagal.');
            err.isValidationError = Boolean(data.is_validation_error);
            throw err;
        }

        document.querySelector('#result-image').src = data.image_url;
        document.querySelector('#diagnosis').textContent = data.label;
        document.querySelector('#confidence').textContent = `${data.confidence.toFixed(1)}%`;
        document.querySelector('#model-name').textContent = data.model_name;

        // Hanya tampilkan baris kelas yang terdeteksi
        if (data.label === 'Kardiomegali') {
            cardioRow.hidden = false;
            normalRow.hidden = true;
            document.querySelector('#cardio-value').textContent = `${data.confidence.toFixed(1)}%`;
            document.querySelector('#cardio-bar').style.width = `${data.confidence}%`;
        } else {
            normalRow.hidden = false;
            cardioRow.hidden = true;
            document.querySelector('#normal-value').textContent = `${data.confidence.toFixed(1)}%`;
            document.querySelector('#normal-bar').style.width = `${data.confidence}%`;
        }

        if (clinicalNote) {
            clinicalNote.textContent = data.clinical_note || '';
        }

        loadingState.hidden = true;
        resultContent.hidden = false;
        statusText.textContent = 'ANALISIS SELESAI';
        statusText.style.color = '';
    } catch (error) {
        loadingState.hidden = true;
        emptyState.hidden = false;
        document.querySelector('#disclaimer-empty').hidden = false;
        if (error.isValidationError) {
            statusText.textContent = 'CITRA DITOLAK';
            statusText.style.color = '#c84b31';
        } else {
            statusText.textContent = 'MENUNGGU CITRA';
            statusText.style.color = '';
        }
        showError(error.message);
    } finally {
        submitButton.disabled = false;
    }
});

document.querySelector('#reset-button').addEventListener('click', () => {
    input.value = '';
    previewWrap.hidden = true;
    dropzone.hidden = false;
    clearResult();
    errorBox.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
