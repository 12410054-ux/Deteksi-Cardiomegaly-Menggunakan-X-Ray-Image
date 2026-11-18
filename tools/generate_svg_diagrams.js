const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const XRAY_PATH = path.join(BASE_DIR, 'testing', 'cardiomegaly.png');
let xrayBase64 = '';

try {
    if (fs.existsSync(XRAY_PATH)) {
        const xrayBuffer = fs.readFileSync(XRAY_PATH);
        xrayBase64 = `data:image/png;base64,${xrayBuffer.toString('base64')}`;
    }
} catch (e) {
    console.warn("Could not read sample x-ray image:", e.message);
}

// -------------------------------------------------------------------------
// SVG 1: Full 3D Volumetric Feature Map Architecture Diagram
// -------------------------------------------------------------------------
function generateArchitectureSVG() {
    const width = 3200;
    const height = 1350;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .mono { font-family: 'JetBrains Mono', Consolas, "Courier New", monospace; }
      .title { font-size: 42px; font-weight: 800; fill: #0F172A; letter-spacing: -0.5px; }
      .subtitle { font-size: 22px; font-weight: 500; fill: #475569; }
      .badge { font-size: 15px; font-weight: 700; fill: #FFFFFF; }
      .section-hdr { font-size: 18px; font-weight: 700; fill: #1E293B; letter-spacing: 0.5px; text-transform: uppercase; }
      .layer-title { font-size: 16px; font-weight: 700; fill: #0F172A; }
      .layer-desc { font-size: 13px; font-weight: 500; fill: #64748B; }
      .dim-label { font-size: 15px; font-weight: 700; fill: #1E293B; }
      .param-label { font-size: 13px; font-weight: 600; fill: #2563EB; }
      .footer-title { font-size: 16px; font-weight: 700; fill: #0F172A; }
      .footer-text { font-size: 13px; font-weight: 400; fill: #475569; line-height: 1.5; }
    </style>

    <!-- Drop Shadows -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.06"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.04"/>
    </filter>
    <filter id="cubeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="10" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.12"/>
    </filter>
    <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#2563EB" flood-opacity="0.25"/>
    </filter>

    <!-- Gradients for Blocks -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F8FAFC"/>
    </linearGradient>

    <!-- Conv Block Gradients (Blue) -->
    <linearGradient id="convFront" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="convTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
    <linearGradient id="convSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E40AF"/>
      <stop offset="100%" stop-color="#1E3A8A"/>
    </linearGradient>

    <!-- MaxPool Gradients (Amber/Orange) -->
    <linearGradient id="poolFront" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="poolTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <linearGradient id="poolSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B45309"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>

    <!-- Flatten Gradient (Purple) -->
    <linearGradient id="flatFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#A855F7"/>
      <stop offset="100%" stop-color="#7E22CE"/>
    </linearGradient>
    <linearGradient id="flatTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
    <linearGradient id="flatSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6B21A8"/>
      <stop offset="100%" stop-color="#581C87"/>
    </linearGradient>

    <!-- Dense Gradient (Emerald) -->
    <linearGradient id="denseFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="denseTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#10B981"/>
    </linearGradient>
    <linearGradient id="denseSide" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#065F46"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>

    <!-- Arrow Markers -->
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
    </marker>
    <marker id="arrowhead-blue" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#3B82F6" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>

  <!-- ===================================================================== -->
  <!-- HEADER SECTION                                                        -->
  <!-- ===================================================================== -->
  <g transform="translate(60, 50)">
    <rect x="0" y="0" width="160" height="34" rx="17" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
    <text x="80" y="22" font-size="13" font-weight="700" fill="#1D4ED8" text-anchor="middle" letter-spacing="0.5">RESEARCH MANUSCRIPT</text>
    
    <text x="0" y="78" class="title">Custom CNN Architecture for Cardiomegaly Detection</text>
    <text x="0" y="112" class="subtitle">A 4-Block Hierarchical Deep Convolutional Neural Network with 2,485,825 Parameters</text>

    <!-- Quick Metrics Badges Top Right -->
    <g transform="translate(${width - 860}, 10)">
      <!-- Badge 1: Input -->
      <g transform="translate(0, 0)">
        <rect width="180" height="64" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>
        <text x="18" y="26" font-size="12" font-weight="600" fill="#64748B">INPUT RESOLUTION</text>
        <text x="18" y="50" font-size="18" font-weight="700" fill="#0F172A" class="mono">160 × 160 × 3</text>
      </g>
      <!-- Badge 2: Total Params -->
      <g transform="translate(195, 0)">
        <rect width="180" height="64" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
        <text x="18" y="26" font-size="12" font-weight="600" fill="#1E40AF">TOTAL PARAMETERS</text>
        <text x="18" y="50" font-size="18" font-weight="700" fill="#1D4ED8" class="mono">2,485,825</text>
      </g>
      <!-- Badge 3: Accuracy -->
      <g transform="translate(390, 0)">
        <rect width="180" height="64" rx="12" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5"/>
        <text x="18" y="26" font-size="12" font-weight="600" fill="#065F46">TEST ACCURACY</text>
        <text x="18" y="50" font-size="18" font-weight="700" fill="#059669" class="mono">75.49%</text>
      </g>
      <!-- Badge 4: ROC-AUC -->
      <g transform="translate(585, 0)">
        <rect width="180" height="64" rx="12" fill="#FAF5FF" stroke="#E9D5FF" stroke-width="1.5"/>
        <text x="18" y="26" font-size="12" font-weight="600" fill="#6B21A8">ROC-AUC SCORE</text>
        <text x="18" y="50" font-size="18" font-weight="700" fill="#7E22CE" class="mono">0.8350</text>
      </g>
    </g>
  </g>

  <line x1="60" y1="185" x2="${width - 60}" y2="185" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- ===================================================================== -->
  <!-- MAIN PIPELINE CONTAINER (Y: 200 to 930)                                -->
  <!-- ===================================================================== -->

  <!-- STAGE 0: INPUT IMAGE -->
  <g transform="translate(60, 210)">
    <!-- Stage Card Background -->
    <rect width="300" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <rect x="20" y="20" width="120" height="28" rx="8" fill="#F1F5F9"/>
    <text x="80" y="39" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">STAGE 0 : INPUT</text>

    <!-- X-Ray Image Preview Box -->
    <g transform="translate(50, 70)">
      <rect width="200" height="200" rx="16" fill="#0F172A" stroke="#CBD5E1" stroke-width="2"/>
      ${xrayBase64 ? `<image href="${xrayBase64}" x="10" y="10" width="180" height="180" preserveAspectRatio="xMidYMid slice" clip-path="url(#xrayClip)"/>
      <clipPath id="xrayClip"><rect x="10" y="10" width="180" height="180" rx="10"/></clipPath>` : `
      <rect x="10" y="10" width="180" height="180" rx="10" fill="#1E293B"/>
      <text x="100" y="105" font-size="14" fill="#94A3B8" text-anchor="middle">Chest X-Ray (PA)</text>`}
      
      <!-- Coordinate overlay badge -->
      <rect x="30" y="170" width="140" height="24" rx="6" fill="rgba(15, 23, 42, 0.8)"/>
      <text x="100" y="186" font-size="11" font-weight="600" fill="#38BDF8" text-anchor="middle" class="mono">160 × 160 × 3 (RGB)</text>
    </g>

    <text x="150" y="305" class="dim-label" text-anchor="middle">Input Radiograph</text>
    <text x="150" y="328" font-size="13" fill="#64748B" text-anchor="middle">Chest X-Ray Image</text>

    <!-- Data Preprocessing Specs -->
    <g transform="translate(25, 355)">
      <rect width="250" height="330" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="30" font-size="14" font-weight="700" fill="#0F172A">Preprocessing Pipeline:</text>
      
      <!-- Bullet 1 -->
      <circle cx="28" cy="62" r="5" fill="#3B82F6"/>
      <text x="42" y="66" font-size="13" font-weight="600" fill="#1E293B">Target Resolution:</text>
      <text x="42" y="86" font-size="12" fill="#64748B" class="mono">160 × 160 pixels</text>

      <!-- Bullet 2 -->
      <circle cx="28" cy="116" r="5" fill="#3B82F6"/>
      <text x="42" y="120" font-size="13" font-weight="600" fill="#1E293B">Normalization:</text>
      <text x="42" y="140" font-size="12" fill="#64748B" class="mono">Pixel scaling [0, 1] (1/255)</text>

      <!-- Bullet 3 -->
      <circle cx="28" cy="170" r="5" fill="#3B82F6"/>
      <text x="42" y="174" font-size="13" font-weight="600" fill="#1E293B">Resampling Filter:</text>
      <text x="42" y="194" font-size="12" fill="#64748B">Nearest-Neighbor (Edge preserving)</text>

      <!-- Bullet 4 -->
      <circle cx="28" cy="224" r="5" fill="#3B82F6"/>
      <text x="42" y="228" font-size="13" font-weight="600" fill="#1E293B">Augmentation (Train only):</text>
      <text x="42" y="248" font-size="12" fill="#64748B">Rotation: ±5°, Zoom: 5%</text>
      <text x="42" y="268" font-size="12" fill="#64748B">Horizontal Flip: Enabled</text>

      <!-- Class Distribution Tag -->
      <rect x="20" y="285" width="210" height="30" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="125" y="305" font-size="11" font-weight="600" fill="#1D4ED8" text-anchor="middle">Balanced: 2,776 / class (N=5,552)</text>
    </g>
  </g>

  <!-- Flow Arrow from Input to Block 1 -->
  <line x1="370" y1="565" x2="400" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- ===================================================================== -->
  <!-- FEATURE EXTRACTOR: 4 CONVOLUTIONAL BLOCKS                             -->
  <!-- ===================================================================== -->

  <!-- FUNCTION TO DRAW 3D CUBOID IN SVG -->
  <!-- We'll generate the 4 blocks systematically -->

  <!-- BLOCK 1 (X: 410, W: 450) -->
  <g transform="translate(410, 210)">
    <rect width="450" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <!-- Stage Header -->
    <rect x="20" y="20" width="160" height="28" rx="8" fill="#DBEAFE"/>
    <text x="100" y="39" font-size="12" font-weight="700" fill="#1D4ED8" text-anchor="middle">BLOCK 1 : CONV &amp; POOL</text>
    <text x="430" y="39" font-size="13" font-weight="700" fill="#2563EB" text-anchor="end" class="mono">896 Params</text>

    <!-- Sub-Block 1A: Conv2D (32, 3x3) -->
    <!-- Front: x=50, y=90, w=140, h=140. Top/Side dx=18, dy=-12 -->
    <g transform="translate(20, 70)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,90 68,78 208,78 190,90" fill="url(#convTop)"/>
      <!-- Side -->
      <polygon points="190,90 208,78 208,218 190,230" fill="url(#convSide)"/>
      <!-- Front -->
      <rect x="50" y="90" width="140" height="140" rx="4" fill="url(#convFront)"/>
      <!-- Grid pattern hint on front -->
      <line x1="96" y1="90" x2="96" y2="230" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <line x1="142" y1="90" x2="142" y2="230" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <line x1="50" y1="136" x2="190" y2="136" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <line x1="50" y1="182" x2="190" y2="182" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
      <text x="120" y="165" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">158 × 158</text>
      <text x="120" y="185" font-size="13" font-weight="600" fill="#BFDBFE" text-anchor="middle">32 filters</text>
    </g>

    <!-- Conv Specs Label -->
    <text x="140" y="335" class="layer-title" text-anchor="middle">Conv2D Layer</text>
    <text x="140" y="355" class="layer-desc" text-anchor="middle">32 filters (3×3), ReLU, Stride 1</text>
    <text x="140" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 158 × 158 × 32</text>
    <text x="140" y="395" class="param-label" text-anchor="middle">Params: (3×3×3+1)×32 = 896</text>

    <!-- Transition Arrow inside Block 1 -->
    <line x1="225" y1="230" x2="255" y2="230" stroke="#F59E0B" stroke-width="3" marker-end="url(#arrowhead)"/>

    <!-- Sub-Block 1B: MaxPool2D (2x2) -->
    <!-- Downsampled to 79x79 -->
    <g transform="translate(205, 85)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,90 68,78 168,78 150,90" fill="url(#poolTop)"/>
      <!-- Side -->
      <polygon points="150,90 168,78 168,198 150,210" fill="url(#poolSide)"/>
      <!-- Front -->
      <rect x="50" y="90" width="100" height="120" rx="4" fill="url(#poolFront)"/>
      <text x="100" y="155" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">79 × 79</text>
      <text x="100" y="175" font-size="12" font-weight="600" fill="#FEF3C7" text-anchor="middle">32 channels</text>
    </g>

    <!-- Pool Specs Label -->
    <text x="305" y="335" class="layer-title" text-anchor="middle">MaxPooling2D</text>
    <text x="305" y="355" class="layer-desc" text-anchor="middle">Pool 2×2, Stride 2 (Valid)</text>
    <text x="305" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 79 × 79 × 32</text>
    <text x="305" y="395" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">Params: 0 (Downsample /2)</text>

    <!-- Biological Feature Box -->
    <g transform="translate(25, 430)">
      <rect width="400" height="255" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="15" y="15" width="220" height="26" rx="6" fill="#EFF6FF"/>
      <text x="25" y="32" font-size="12" font-weight="700" fill="#1D4ED8">REPRESENTATION EXTRACTED</text>
      
      <text x="20" y="70" font-size="14" font-weight="700" fill="#0F172A">Low-Level Thoracic Primitives:</text>
      <text x="20" y="95" font-size="13" fill="#475569">• Gabor-like edge filters across radiograph</text>
      <text x="20" y="120" font-size="13" fill="#475569">• Thoracic cavity periphery &amp; clavicle lines</text>
      <text x="20" y="145" font-size="13" fill="#475569">• Sharp contrast boundaries: bone vs air</text>
      <text x="20" y="170" font-size="13" fill="#475569">• Suppression of radiographic noise</text>

      <line x1="20" y1="195" x2="380" y2="195" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="220" font-size="12" font-weight="600" fill="#64748B">Downsampling Factor: 2× (160 → 79)</text>
      <text x="20" y="240" font-size="12" font-weight="600" fill="#10B981">Receptive Field: 3×3 → 5×5 pixels</text>
    </g>
  </g>

  <!-- Flow Arrow from Block 1 to Block 2 -->
  <line x1="870" y1="565" x2="900" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- BLOCK 2 (X: 910, W: 450) -->
  <g transform="translate(910, 210)">
    <rect width="450" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <!-- Stage Header -->
    <rect x="20" y="20" width="160" height="28" rx="8" fill="#DBEAFE"/>
    <text x="100" y="39" font-size="12" font-weight="700" fill="#1D4ED8" text-anchor="middle">BLOCK 2 : CONV &amp; POOL</text>
    <text x="430" y="39" font-size="13" font-weight="700" fill="#2563EB" text-anchor="end" class="mono">18,496 Params</text>

    <!-- Sub-Block 2A: Conv2D (64, 3x3) -->
    <!-- Front: x=50, y=105, w=115, h=115. Top/Side dx=26, dy=-16 (wider depth: 64 channels) -->
    <g transform="translate(20, 70)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,105 76,89 191,89 165,105" fill="url(#convTop)"/>
      <!-- Side -->
      <polygon points="165,105 191,89 191,204 165,220" fill="url(#convSide)"/>
      <!-- Front -->
      <rect x="50" y="105" width="115" height="115" rx="4" fill="url(#convFront)"/>
      <text x="107" y="165" font-size="15" font-weight="700" fill="#FFFFFF" text-anchor="middle">77 × 77</text>
      <text x="107" y="185" font-size="13" font-weight="600" fill="#BFDBFE" text-anchor="middle">64 filters</text>
    </g>

    <!-- Conv Specs Label -->
    <text x="140" y="335" class="layer-title" text-anchor="middle">Conv2D Layer</text>
    <text x="140" y="355" class="layer-desc" text-anchor="middle">64 filters (3×3), ReLU, Stride 1</text>
    <text x="140" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 77 × 77 × 64</text>
    <text x="140" y="395" class="param-label" text-anchor="middle">Params: (3×3×32+1)×64 = 18,496</text>

    <!-- Transition Arrow inside Block 2 -->
    <line x1="225" y1="230" x2="255" y2="230" stroke="#F59E0B" stroke-width="3" marker-end="url(#arrowhead)"/>

    <!-- Sub-Block 2B: MaxPool2D (2x2) -->
    <!-- Downsampled to 38x38 -->
    <g transform="translate(205, 95)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,105 76,89 156,89 130,105" fill="url(#poolTop)"/>
      <!-- Side -->
      <polygon points="130,105 156,89 156,189 130,205" fill="url(#poolSide)"/>
      <!-- Front -->
      <rect x="50" y="105" width="80" height="100" rx="4" fill="url(#poolFront)"/>
      <text x="90" y="160" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">38 × 38</text>
      <text x="90" y="180" font-size="12" font-weight="600" fill="#FEF3C7" text-anchor="middle">64 channels</text>
    </g>

    <!-- Pool Specs Label -->
    <text x="305" y="335" class="layer-title" text-anchor="middle">MaxPooling2D</text>
    <text x="305" y="355" class="layer-desc" text-anchor="middle">Pool 2×2, Stride 2 (Valid)</text>
    <text x="305" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 38 × 38 × 64</text>
    <text x="305" y="395" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">Params: 0 (Downsample /2)</text>

    <!-- Biological Feature Box -->
    <g transform="translate(25, 430)">
      <rect width="400" height="255" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="15" y="15" width="220" height="26" rx="6" fill="#EFF6FF"/>
      <text x="25" y="32" font-size="12" font-weight="700" fill="#1D4ED8">REPRESENTATION EXTRACTED</text>
      
      <text x="20" y="70" font-size="14" font-weight="700" fill="#0F172A">Anatomical Mid-Level Structures:</text>
      <text x="20" y="95" font-size="13" fill="#475569">• Posterior &amp; anterior rib arches</text>
      <text x="20" y="120" font-size="13" fill="#475569">• Right &amp; left hemidiaphragm curvature</text>
      <text x="20" y="145" font-size="13" fill="#475569">• Costophrenic angle integrity</text>
      <text x="20" y="170" font-size="13" fill="#475569">• Mediastinal lateral borders</text>

      <line x1="20" y1="195" x2="380" y2="195" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="220" font-size="12" font-weight="600" fill="#64748B">Downsampling Factor: 4× (160 → 38)</text>
      <text x="20" y="240" font-size="12" font-weight="600" fill="#10B981">Cumulative Params: 19,392</text>
    </g>
  </g>

  <!-- Flow Arrow from Block 2 to Block 3 -->
  <line x1="1370" y1="565" x2="1400" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- BLOCK 3 (X: 1410, W: 450) -->
  <g transform="translate(1410, 210)">
    <rect width="450" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <!-- Stage Header -->
    <rect x="20" y="20" width="160" height="28" rx="8" fill="#DBEAFE"/>
    <text x="100" y="39" font-size="12" font-weight="700" fill="#1D4ED8" text-anchor="middle">BLOCK 3 : CONV &amp; POOL</text>
    <text x="430" y="39" font-size="13" font-weight="700" fill="#2563EB" text-anchor="end" class="mono">73,856 Params</text>

    <!-- Sub-Block 3A: Conv2D (128, 3x3) -->
    <!-- Front: x=50, y=120, w=90, h=90. Top/Side dx=38, dy=-22 (wider depth: 128 channels) -->
    <g transform="translate(20, 70)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,120 88,98 178,98 140,120" fill="url(#convTop)"/>
      <!-- Side -->
      <polygon points="140,120 178,98 178,188 140,210" fill="url(#convSide)"/>
      <!-- Front -->
      <rect x="50" y="120" width="90" height="90" rx="4" fill="url(#convFront)"/>
      <text x="95" y="165" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">36 × 36</text>
      <text x="95" y="185" font-size="12" font-weight="600" fill="#BFDBFE" text-anchor="middle">128 filters</text>
    </g>

    <!-- Conv Specs Label -->
    <text x="140" y="335" class="layer-title" text-anchor="middle">Conv2D Layer</text>
    <text x="140" y="355" class="layer-desc" text-anchor="middle">128 filters (3×3), ReLU, Stride 1</text>
    <text x="140" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 36 × 36 × 128</text>
    <text x="140" y="395" class="param-label" text-anchor="middle">Params: (3×3×64+1)×128 = 73,856</text>

    <!-- Transition Arrow inside Block 3 -->
    <line x1="225" y1="230" x2="255" y2="230" stroke="#F59E0B" stroke-width="3" marker-end="url(#arrowhead)"/>

    <!-- Sub-Block 3B: MaxPool2D (2x2) -->
    <!-- Downsampled to 18x18 -->
    <g transform="translate(205, 105)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,120 88,98 153,98 115,120" fill="url(#poolTop)"/>
      <!-- Side -->
      <polygon points="115,120 153,98 153,178 115,200" fill="url(#poolSide)"/>
      <!-- Front -->
      <rect x="50" y="120" width="65" height="80" rx="4" fill="url(#poolFront)"/>
      <text x="82" y="165" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">18 × 18</text>
      <text x="82" y="183" font-size="11" font-weight="600" fill="#FEF3C7" text-anchor="middle">128 ch</text>
    </g>

    <!-- Pool Specs Label -->
    <text x="305" y="335" class="layer-title" text-anchor="middle">MaxPooling2D</text>
    <text x="305" y="355" class="layer-desc" text-anchor="middle">Pool 2×2, Stride 2 (Valid)</text>
    <text x="305" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 18 × 18 × 128</text>
    <text x="305" y="395" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">Params: 0 (Downsample /2)</text>

    <!-- Biological Feature Box -->
    <g transform="translate(25, 430)">
      <rect width="400" height="255" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="15" y="15" width="220" height="26" rx="6" fill="#EFF6FF"/>
      <text x="25" y="32" font-size="12" font-weight="700" fill="#1D4ED8">REPRESENTATION EXTRACTED</text>
      
      <text x="20" y="70" font-size="14" font-weight="700" fill="#0F172A">Cardiac Silhouette Geometry:</text>
      <text x="20" y="95" font-size="13" fill="#475569">• Left ventricular contour &amp; apex position</text>
      <text x="20" y="120" font-size="13" fill="#475569">• Right atrium expansion boundaries</text>
      <text x="20" y="145" font-size="13" fill="#475569">• Aortic knob prominence</text>
      <text x="20" y="170" font-size="13" fill="#475569">• Thoracic width normalization basis</text>

      <line x1="20" y1="195" x2="380" y2="195" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="220" font-size="12" font-weight="600" fill="#64748B">Downsampling Factor: 8× (160 → 18)</text>
      <text x="20" y="240" font-size="12" font-weight="600" fill="#10B981">Cumulative Params: 93,248</text>
    </g>
  </g>

  <!-- Flow Arrow from Block 3 to Block 4 -->
  <line x1="1870" y1="565" x2="1900" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- BLOCK 4 (X: 1910, W: 450) -->
  <g transform="translate(1910, 210)">
    <rect width="450" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <!-- Stage Header -->
    <rect x="20" y="20" width="160" height="28" rx="8" fill="#DBEAFE"/>
    <text x="100" y="39" font-size="12" font-weight="700" fill="#1D4ED8" text-anchor="middle">BLOCK 4 : CONV &amp; POOL</text>
    <text x="430" y="39" font-size="13" font-weight="700" fill="#2563EB" text-anchor="end" class="mono">295,168 Params</text>

    <!-- Sub-Block 4A: Conv2D (256, 3x3) -->
    <!-- Front: x=50, y=135, w=65, h=65. Top/Side dx=54, dy=-30 (very wide depth: 256 channels) -->
    <g transform="translate(20, 70)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,135 104,105 169,105 115,135" fill="url(#convTop)"/>
      <!-- Side -->
      <polygon points="115,135 169,105 169,170 115,200" fill="url(#convSide)"/>
      <!-- Front -->
      <rect x="50" y="135" width="65" height="65" rx="4" fill="url(#convFront)"/>
      <text x="82" y="168" font-size="13" font-weight="700" fill="#FFFFFF" text-anchor="middle">16 × 16</text>
      <text x="82" y="186" font-size="11" font-weight="600" fill="#BFDBFE" text-anchor="middle">256 flt</text>
    </g>

    <!-- Conv Specs Label -->
    <text x="140" y="335" class="layer-title" text-anchor="middle">Conv2D Layer</text>
    <text x="140" y="355" class="layer-desc" text-anchor="middle">256 filters (3×3), ReLU, Stride 1</text>
    <text x="140" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 16 × 16 × 256</text>
    <text x="140" y="395" class="param-label" text-anchor="middle">Params: (3×3×128+1)×256 = 295,168</text>

    <!-- Transition Arrow inside Block 4 -->
    <line x1="225" y1="230" x2="255" y2="230" stroke="#F59E0B" stroke-width="3" marker-end="url(#arrowhead)"/>

    <!-- Sub-Block 4B: MaxPool2D (2x2) -->
    <!-- Downsampled to 8x8 -->
    <g transform="translate(205, 115)" filter="url(#cubeShadow)">
      <!-- Top -->
      <polygon points="50,135 104,105 154,105 100,135" fill="url(#poolTop)"/>
      <!-- Side -->
      <polygon points="100,135 154,105 154,155 100,185" fill="url(#poolSide)"/>
      <!-- Front -->
      <rect x="50" y="135" width="50" height="50" rx="4" fill="url(#poolFront)"/>
      <text x="75" y="165" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle">8 × 8</text>
      <text x="75" y="180" font-size="10" font-weight="600" fill="#FEF3C7" text-anchor="middle">256 ch</text>
    </g>

    <!-- Pool Specs Label -->
    <text x="305" y="335" class="layer-title" text-anchor="middle">MaxPooling2D (Terminal)</text>
    <text x="305" y="355" class="layer-desc" text-anchor="middle">Pool 2×2, Stride 2 (Valid)</text>
    <text x="305" y="375" class="dim-label" text-anchor="middle" class="mono">Tensor: 8 × 8 × 256</text>
    <text x="305" y="395" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">Params: 0 (Terminal feature map)</text>

    <!-- Biological Feature Box -->
    <g transform="translate(25, 430)">
      <rect width="400" height="255" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="15" y="15" width="220" height="26" rx="6" fill="#EFF6FF"/>
      <text x="25" y="32" font-size="12" font-weight="700" fill="#1D4ED8">REPRESENTATION EXTRACTED</text>
      
      <text x="20" y="70" font-size="14" font-weight="700" fill="#0F172A">High-Level Pathology Semantics:</text>
      <text x="20" y="95" font-size="13" fill="#475569">• Cardiothoracic Ratio (CTR &gt; 0.50 threshold)</text>
      <text x="20" y="120" font-size="13" fill="#475569">• Global transverse cardiac diameter</text>
      <text x="20" y="145" font-size="13" fill="#475569">• Inter-thoracic ratio discrimination</text>
      <text x="20" y="170" font-size="13" fill="#475569">• Shift of cardiac apex toward axillary line</text>

      <line x1="20" y1="195" x2="380" y2="195" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="220" font-size="12" font-weight="600" fill="#64748B">Total Downsampling: 20× (160 → 8)</text>
      <text x="20" y="240" font-size="12" font-weight="600" fill="#10B981">Conv Params: 388,416 (15.6%)</text>
    </g>
  </g>

  <!-- Flow Arrow from Block 4 to Classifier -->
  <line x1="2370" y1="565" x2="2400" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- ===================================================================== -->
  <!-- CLASSIFIER HEAD: FLATTEN, DENSE 128, DROPOUT, OUTPUT                   -->
  <!-- ===================================================================== -->

  <!-- CLASSIFIER (X: 2410, W: 450) -->
  <g transform="translate(2410, 210)">
    <rect width="450" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <!-- Stage Header -->
    <rect x="20" y="20" width="180" height="28" rx="8" fill="#F3E8FF"/>
    <text x="110" y="39" font-size="12" font-weight="700" fill="#7E22CE" text-anchor="middle">STAGE 2 : CLASSIFIER HEAD</text>
    <text x="430" y="39" font-size="13" font-weight="700" fill="#7E22CE" text-anchor="end" class="mono">2,097,409 Params</text>

    <!-- Dense Architecture Diagram (Visual Strip) -->
    <g transform="translate(30, 75)">
      <!-- 1. Flatten Layer (Purple Strip) -->
      <g transform="translate(10, 15)">
        <polygon points="10,20 18,12 28,12 20,20" fill="url(#flatTop)"/>
        <polygon points="20,20 28,12 28,172 20,180" fill="url(#flatSide)"/>
        <rect x="10" y="20" width="10" height="160" rx="2" fill="url(#flatFront)"/>
        <text x="15" y="210" font-size="12" font-weight="700" fill="#7E22CE" text-anchor="middle">Flatten</text>
        <text x="15" y="228" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle" class="mono">16,384</text>
        <text x="15" y="244" font-size="10" fill="#94A3B8" text-anchor="middle">(8×8×256)</text>
      </g>

      <!-- Arrow to Dense 128 -->
      <line x1="55" y1="100" x2="80" y2="100" stroke="#CBD5E1" stroke-width="2" marker-end="url(#arrowhead)"/>

      <!-- 2. Dense 128 Layer (Green Strip / Neurons) -->
      <g transform="translate(90, 15)">
        <polygon points="10,35 22,23 38,23 26,35" fill="url(#denseTop)"/>
        <polygon points="26,35 38,23 38,158 26,170" fill="url(#denseSide)"/>
        <rect x="10" y="35" width="16" height="135" rx="3" fill="url(#denseFront)"/>
        
        <!-- Individual neuron dots inside -->
        <circle cx="18" cy="55" r="3" fill="#A7F3D0"/>
        <circle cx="18" cy="75" r="3" fill="#A7F3D0"/>
        <circle cx="18" cy="95" r="3" fill="#A7F3D0"/>
        <circle cx="18" cy="115" r="3" fill="#A7F3D0"/>
        <circle cx="18" cy="135" r="3" fill="#A7F3D0"/>
        <circle cx="18" cy="155" r="3" fill="#A7F3D0"/>

        <text x="18" y="210" font-size="12" font-weight="700" fill="#047857" text-anchor="middle">Dense</text>
        <text x="18" y="228" font-size="11" font-weight="600" fill="#065F46" text-anchor="middle" class="mono">128 units</text>
        <text x="18" y="244" font-size="10" fill="#94A3B8" text-anchor="middle">ReLU</text>
      </g>

      <!-- Arrow to Dropout -->
      <line x1="140" y1="100" x2="165" y2="100" stroke="#CBD5E1" stroke-width="2" marker-end="url(#arrowhead)"/>

      <!-- 3. Dropout 0.50 (Dotted Rose Border) -->
      <g transform="translate(175, 25)">
        <rect x="0" y="25" width="40" height="135" rx="8" fill="#FDF2F8" stroke="#F472B6" stroke-width="2" stroke-dasharray="4,4"/>
        <text x="20" y="75" font-size="11" font-weight="700" fill="#DB2777" text-anchor="middle">DROP</text>
        <text x="20" y="95" font-size="14" font-weight="800" fill="#BE185D" text-anchor="middle">50%</text>
        <text x="20" y="115" font-size="9" font-weight="600" fill="#9D174D" text-anchor="middle">Rate 0.5</text>

        <text x="20" y="200" font-size="12" font-weight="700" fill="#DB2777" text-anchor="middle">Dropout</text>
        <text x="20" y="218" font-size="11" font-weight="600" fill="#64748B" text-anchor="middle">p = 0.50</text>
        <text x="20" y="234" font-size="10" fill="#94A3B8" text-anchor="middle">Regularize</text>
      </g>

      <!-- Arrow to Dense 1 -->
      <line x1="225" y1="100" x2="250" y2="100" stroke="#CBD5E1" stroke-width="2" marker-end="url(#arrowhead)"/>

      <!-- 4. Output Neuron (Dense 1, Sigmoid) -->
      <g transform="translate(260, 25)">
        <circle cx="28" cy="92" r="24" fill="#FEF2F2" stroke="#EF4444" stroke-width="3" filter="url(#cubeShadow)"/>
        <text x="28" y="99" font-size="18" font-weight="800" fill="#DC2626" text-anchor="middle">σ</text>

        <text x="28" y="200" font-size="12" font-weight="700" fill="#DC2626" text-anchor="middle">Output Unit</text>
        <text x="28" y="218" font-size="11" font-weight="600" fill="#991B1B" text-anchor="middle" class="mono">1 unit</text>
        <text x="28" y="234" font-size="10" fill="#94A3B8" text-anchor="middle">Sigmoid</text>
      </g>
    </g>

    <!-- Parameter Detail Lines -->
    <g transform="translate(25, 345)">
      <rect width="400" height="340" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <text x="20" y="30" font-size="14" font-weight="700" fill="#0F172A">Classifier Parameter Breakdown:</text>

      <!-- Row 1: Flatten -->
      <text x="20" y="65" font-size="13" font-weight="600" fill="#1E293B">1. Flatten Layer:</text>
      <text x="20" y="85" font-size="12" fill="#64748B">8 × 8 × 256 → 16,384 nodes (0 params)</text>

      <!-- Row 2: Dense 128 -->
      <text x="20" y="120" font-size="13" font-weight="600" fill="#1E293B">2. Dense (128 units, ReLU):</text>
      <text x="20" y="140" font-size="12" fill="#64748B" class="mono">Weights: 16,384 × 128 = 2,097,152</text>
      <text x="20" y="158" font-size="12" fill="#64748B" class="mono">Biases: 128 | Subtotal: 2,097,280 params</text>

      <!-- Row 3: Dropout -->
      <text x="20" y="193" font-size="13" font-weight="600" fill="#1E293B">3. Dropout Regularization:</text>
      <text x="20" y="213" font-size="12" fill="#64748B">Rate = 0.50 (active during train, 0 params)</text>

      <!-- Row 4: Dense 1 (Sigmoid) -->
      <text x="20" y="248" font-size="13" font-weight="600" fill="#1E293B">4. Dense Output (1 unit, Sigmoid):</text>
      <text x="20" y="268" font-size="12" fill="#64748B" class="mono">Weights: 128 × 1 + 1 bias = 129 params</text>

      <line x1="20" y1="290" x2="380" y2="290" stroke="#CBD5E1" stroke-width="1"/>
      <text x="20" y="318" font-size="13" font-weight="700" fill="#7E22CE">Classifier Total: 2,097,409 params (84.4%)</text>
    </g>
  </g>

  <!-- Flow Arrow from Classifier to Decision Output -->
  <line x1="2870" y1="565" x2="2900" y2="565" stroke="#94A3B8" stroke-width="3" marker-end="url(#arrowhead)"/>

  <!-- ===================================================================== -->
  <!-- PREDICTION OUTPUT & CLINICAL TRIAGE DECISION                           -->
  <!-- ===================================================================== -->

  <!-- OUTPUT STAGE (X: 2910, W: 230) -->
  <g transform="translate(2910, 210)">
    <rect width="230" height="710" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    
    <rect x="20" y="20" width="130" height="28" rx="8" fill="#FEE2E2"/>
    <text x="85" y="39" font-size="12" font-weight="700" fill="#991B1B" text-anchor="middle">STAGE 3 : OUTPUT</text>

    <!-- Score Formula Box -->
    <g transform="translate(20, 70)">
      <rect width="190" height="110" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <text x="95" y="30" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">PROBABILITY SCORE</text>
      <text x="95" y="65" font-size="22" font-weight="800" fill="#0F172A" text-anchor="middle" class="mono">ŷ = σ(z)</text>
      <text x="95" y="92" font-size="12" font-weight="600" fill="#64748B" text-anchor="middle">Range: [0.00 , 1.00]</text>
    </g>

    <!-- Decision Threshold Line -->
    <g transform="translate(20, 200)">
      <line x1="10" y1="0" x2="180" y2="0" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>
      <rect x="45" y="-12" width="100" height="24" rx="12" fill="#0F172A"/>
      <text x="95" y="4" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle">THRESHOLD τ = 0.50</text>
    </g>

    <!-- Class 1: Cardiomegaly (Positive) -->
    <g transform="translate(20, 235)">
      <rect width="190" height="150" rx="14" fill="#FEF2F2" stroke="#F87171" stroke-width="2"/>
      <circle cx="35" cy="35" r="14" fill="#EF4444"/>
      <text x="35" y="40" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">+</text>
      <text x="60" y="35" font-size="11" font-weight="700" fill="#991B1B">POSITIVE CLASS (1)</text>
      <text x="60" y="52" font-size="16" font-weight="800" fill="#DC2626">Cardiomegaly</text>

      <line x1="20" y1="75" x2="170" y2="75" stroke="#FECACA" stroke-width="1"/>
      <text x="20" y="98" font-size="12" font-weight="600" fill="#7F1D1D">Condition: ŷ ≥ 0.50</text>
      <text x="20" y="118" font-size="11" fill="#991B1B">Cardiac Enlargement</text>
      <text x="20" y="136" font-size="11" font-weight="700" fill="#B91C1C">Test TP: 436 | FN: 121</text>
    </g>

    <!-- Class 0: Normal (Negative) -->
    <g transform="translate(20, 410)">
      <rect width="190" height="150" rx="14" fill="#ECFDF5" stroke="#34D399" stroke-width="2"/>
      <circle cx="35" cy="35" r="14" fill="#10B981"/>
      <text x="35" y="40" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">✓</text>
      <text x="60" y="35" font-size="11" font-weight="700" fill="#065F46">NEGATIVE CLASS (0)</text>
      <text x="60" y="52" font-size="16" font-weight="800" fill="#059669">Normal</text>

      <line x1="20" y1="75" x2="170" y2="75" stroke="#A7F3D0" stroke-width="1"/>
      <text x="20" y="98" font-size="12" font-weight="600" fill="#064E3B">Condition: ŷ &lt; 0.50</text>
      <text x="20" y="118" font-size="11" fill="#065F46">Normal Heart Size</text>
      <text x="20" y="136" font-size="11" font-weight="700" fill="#047857">Test TN: 405 | FP: 152</text>
    </g>

    <!-- Clinical Triage Flag -->
    <g transform="translate(20, 580)">
      <rect width="190" height="105" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
      <text x="95" y="25" font-size="11" font-weight="700" fill="#0F172A" text-anchor="middle">CLINICAL TRIAGE AID</text>
      <text x="20" y="50" font-size="11" fill="#475569">• Triage sensitivity: 78.28%</text>
      <text x="20" y="70" font-size="11" fill="#475569">• Rapid automated alert</text>
      <text x="20" y="90" font-size="11" fill="#475569">• Verified on 1,114 test CT/XR</text>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- FOOTER PANEL: LEGEND, SUMMARY TABLE & TRAINING DETAILS                 -->
  <!-- ===================================================================== -->

  <!-- Card 1: Operation Legend (Left) -->
  <g transform="translate(60, 950)">
    <rect width="900" height="340" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="30" y="40" class="footer-title">Layer Operation Color Legend</text>
    <line x1="30" y1="55" x2="870" y2="55" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Legend Item 1: Conv2D -->
    <g transform="translate(30, 80)">
      <rect width="36" height="36" rx="8" fill="url(#convFront)"/>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Convolutional Layer (Conv2D)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">3×3 spatial kernels, Stride 1, Valid padding, ReLU activation</text>
    </g>

    <!-- Legend Item 2: MaxPool2D -->
    <g transform="translate(470, 80)">
      <rect width="36" height="36" rx="8" fill="url(#poolFront)"/>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Max-Pooling Layer (MaxPooling2D)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">2×2 spatial pool window, Stride 2, spatial downsampling /2</text>
    </g>

    <!-- Legend Item 3: Flatten -->
    <g transform="translate(30, 160)">
      <rect width="36" height="36" rx="8" fill="url(#flatFront)"/>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Tensor Flattening (Flatten)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">Reshapes 3D tensor (8×8×256) into 1D feature vector (16,384)</text>
    </g>

    <!-- Legend Item 4: Dense -->
    <g transform="translate(470, 160)">
      <rect width="36" height="36" rx="8" fill="url(#denseFront)"/>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Fully Connected Layer (Dense)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">128 neurons, ReLU non-linearity, feature integration</text>
    </g>

    <!-- Legend Item 5: Dropout -->
    <g transform="translate(30, 240)">
      <rect width="36" height="36" rx="8" fill="#FDF2F8" stroke="#F472B6" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Dropout Regularization (Rate 0.50)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">50% stochastic neuron deactivation during training to prevent overfit</text>
    </g>

    <!-- Legend Item 6: Sigmoid Output -->
    <g transform="translate(470, 240)">
      <circle cx="18" cy="18" r="18" fill="#FEF2F2" stroke="#EF4444" stroke-width="2"/>
      <text x="18" y="24" font-size="14" font-weight="800" fill="#DC2626" text-anchor="middle">σ</text>
      <text x="50" y="22" font-size="14" font-weight="700" fill="#0F172A">Terminal Classification (Sigmoid)</text>
      <text x="50" y="40" font-size="12" fill="#64748B">1 unit, Logistic Sigmoid activation, output cardiomegaly probability</text>
    </g>
  </g>

  <!-- Card 2: Training Hyperparameters & Protocol (Middle) -->
  <g transform="translate(990, 950)">
    <rect width="1180" height="340" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="30" y="40" class="footer-title">Training Protocol &amp; Optimization Specifications</text>
    <line x1="30" y1="55" x2="1150" y2="55" stroke="#E2E8F0" stroke-width="1"/>

    <g transform="translate(30, 75)">
      <!-- Col 1 -->
      <g transform="translate(0, 0)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">OPTIMIZER</text>
        <text x="0" y="45" font-size="16" font-weight="700" fill="#0F172A">Adam (Adaptive Moment)</text>
        <text x="0" y="70" font-size="13" fill="#475569">Learning Rate η = 1 × 10⁻⁴ (0.0001)</text>
        <text x="0" y="90" font-size="13" fill="#475569">β₁ = 0.90 , β₂ = 0.999 , ε = 10⁻⁷</text>
      </g>

      <!-- Col 2 -->
      <g transform="translate(380, 0)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">LOSS FUNCTION</text>
        <text x="0" y="45" font-size="16" font-weight="700" fill="#0F172A">Binary Cross-Entropy</text>
        <text x="0" y="70" font-size="13" fill="#475569" class="mono">ℒ = -[y·log(ŷ) + (1-y)·log(1-ŷ)]</text>
        <text x="0" y="90" font-size="13" fill="#475569">Log-loss penalization for probability divergence</text>
      </g>

      <!-- Col 3 -->
      <g transform="translate(760, 0)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">REGULARIZATION &amp; STOPPING</text>
        <text x="0" y="45" font-size="16" font-weight="700" fill="#0F172A">EarlyStopping (Patience 4)</text>
        <text x="0" y="70" font-size="13" fill="#475569">Monitored Metric: Validation Loss (val_loss)</text>
        <text x="0" y="90" font-size="13" fill="#475569">restore_best_weights = True (Optimal weights)</text>
      </g>

      <!-- Row 2 -->
      <line x1="0" y1="120" x2="1120" y2="120" stroke="#F1F5F9" stroke-width="1"/>

      <g transform="translate(0, 140)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">TRAINING DATA PARTITION</text>
        <text x="0" y="42" font-size="15" font-weight="700" fill="#0F172A">4,438 Images (80%)</text>
        <text x="0" y="62" font-size="12" fill="#64748B">2,219 Cardiomegaly + 2,219 Normal</text>
        <text x="0" y="82" font-size="12" fill="#64748B">Batch size: 16 | Epochs: 15 max</text>
      </g>

      <g transform="translate(380, 140)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">INDEPENDENT TEST PARTITION</text>
        <text x="0" y="42" font-size="15" font-weight="700" fill="#0F172A">1,114 Images (20%)</text>
        <text x="0" y="62" font-size="12" fill="#64748B">557 Cardiomegaly + 557 Normal</text>
        <text x="0" y="82" font-size="12" fill="#64748B">Hold-out strictly for final validation</text>
      </g>

      <g transform="translate(760, 140)">
        <text x="0" y="20" font-size="13" font-weight="600" fill="#64748B">TOTAL DATASET SCOPE</text>
        <text x="0" y="42" font-size="15" font-weight="700" fill="#0F172A">5,552 Balanced Radiographs</text>
        <text x="0" y="62" font-size="12" fill="#64748B">Kaggle Biomedical Repository</text>
        <text x="0" y="82" font-size="12" fill="#10B981" font-weight="600">Zero class imbalance bias</text>
      </g>
    </g>
  </g>

  <!-- Card 3: Quantitative Performance Summary (Right) -->
  <g transform="translate(2200, 950)">
    <rect width="940" height="340" rx="18" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="30" y="40" class="footer-title">Hold-Out Test Performance (N = 1,114)</text>
    <line x1="30" y1="55" x2="910" y2="55" stroke="#E2E8F0" stroke-width="1"/>

    <!-- Comparison Table Header -->
    <g transform="translate(30, 75)">
      <rect width="880" height="32" rx="6" fill="#F1F5F9"/>
      <text x="20" y="21" font-size="12" font-weight="700" fill="#475569">METRIC</text>
      <text x="320" y="21" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">CUSTOM CNN (PROPOSED)</text>
      <text x="580" y="21" font-size="12" font-weight="700" fill="#64748B" text-anchor="middle">MOBILENETV2 (TRANSFER)</text>
      <text x="790" y="21" font-size="12" font-weight="700" fill="#047857" text-anchor="middle">DIFFERENCE (Δ)</text>

      <!-- Row 1: Accuracy -->
      <g transform="translate(0, 42)">
        <text x="20" y="18" font-size="14" font-weight="600" fill="#0F172A">Classification Accuracy</text>
        <text x="320" y="18" font-size="15" font-weight="700" fill="#1D4ED8" text-anchor="middle" class="mono">75.49%</text>
        <text x="580" y="18" font-size="14" fill="#64748B" text-anchor="middle" class="mono">70.20%</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">+5.29%</text>
      </g>

      <!-- Row 2: ROC-AUC -->
      <g transform="translate(0, 78)">
        <text x="20" y="18" font-size="14" font-weight="600" fill="#0F172A">Area Under Curve (ROC-AUC)</text>
        <text x="320" y="18" font-size="15" font-weight="700" fill="#1D4ED8" text-anchor="middle" class="mono">0.8350</text>
        <text x="580" y="18" font-size="14" fill="#64748B" text-anchor="middle" class="mono">0.7867</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">+0.0483 (+6.1%)</text>
      </g>

      <!-- Row 3: Precision -->
      <g transform="translate(0, 114)">
        <text x="20" y="18" font-size="14" font-weight="600" fill="#0F172A">Precision (Positive Predictive)</text>
        <text x="320" y="18" font-size="15" font-weight="700" fill="#1D4ED8" text-anchor="middle" class="mono">74.15%</text>
        <text x="580" y="18" font-size="14" fill="#64748B" text-anchor="middle" class="mono">68.23%</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">+5.92%</text>
      </g>

      <!-- Row 4: Sensitivity (Recall) -->
      <g transform="translate(0, 150)">
        <text x="20" y="18" font-size="14" font-weight="600" fill="#0F172A">Recall (Clinical Sensitivity)</text>
        <text x="320" y="18" font-size="15" font-weight="700" fill="#1D4ED8" text-anchor="middle" class="mono">78.28%</text>
        <text x="580" y="18" font-size="14" fill="#64748B" text-anchor="middle" class="mono">75.58%</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">+2.70%</text>
      </g>

      <!-- Row 5: False Negatives (Missed) -->
      <g transform="translate(0, 186)">
        <text x="20" y="18" font-size="14" font-weight="700" fill="#B91C1C">Missed Pathologies (FN)</text>
        <text x="320" y="18" font-size="15" font-weight="800" fill="#B91C1C" text-anchor="middle" class="mono">121 / 557</text>
        <text x="580" y="18" font-size="14" fill="#DC2626" text-anchor="middle" class="mono">136 / 557</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">-15 Missed Cases</text>
      </g>

      <!-- Row 6: False Positives -->
      <g transform="translate(0, 222)">
        <text x="20" y="18" font-size="14" font-weight="600" fill="#0F172A">False Alarms (FP)</text>
        <text x="320" y="18" font-size="15" font-weight="700" fill="#1D4ED8" text-anchor="middle" class="mono">152 / 557</text>
        <text x="580" y="18" font-size="14" fill="#64748B" text-anchor="middle" class="mono">196 / 557</text>
        <text x="790" y="18" font-size="14" font-weight="700" fill="#059669" text-anchor="middle" class="mono">-44 False Alarms</text>
      </g>
    </g>
  </g>

</svg>`;
}

// -------------------------------------------------------------------------
// SVG 2: Clean Modular Layer Flowchart (Standard IEEE / Journal style)
// -------------------------------------------------------------------------
function generateLayerFlowchartSVG() {
    const width = 2800;
    const height = 980;

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@500;700&amp;display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .mono { font-family: 'JetBrains Mono', Consolas, monospace; }
      .title { font-size: 34px; font-weight: 800; fill: #0F172A; }
      .subtitle { font-size: 18px; font-weight: 500; fill: #64748B; }
      .layer-card-title { font-size: 17px; font-weight: 700; fill: #0F172A; }
      .layer-sub { font-size: 13px; font-weight: 500; fill: #475569; }
      .shape-badge { font-size: 14px; font-weight: 700; fill: #1D4ED8; }
      .param-badge { font-size: 13px; font-weight: 600; fill: #059669; }
    </style>

    <filter id="cardShadow2" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>

    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#64748B"/>
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#F8FAFC"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="20" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>

  <!-- Title Section -->
  <g transform="translate(60, 50)">
    <text x="0" y="32" class="title">Layer-by-Layer Architectural Specification: Custom CNN</text>
    <text x="0" y="65" class="subtitle">Complete tensor dimensionality, filter configurations, activations, and parameter distribution</text>
  </g>

  <line x1="60" y1="135" x2="${width - 60}" y2="135" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Pipeline Horizontal Layout: 10 Major Steps -->
  <!-- Step width: 230, gap: 35 -->

  <!-- STEP 1: Input -->
  <g transform="translate(60, 160)" filter="url(#cardShadow2)">
    <rect width="235" height="480" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect width="235" height="42" rx="16" fill="#F1F5F9"/>
    <text x="117" y="27" font-size="14" font-weight="700" fill="#334155" text-anchor="middle">INPUT LAYER</text>

    <g transform="translate(20, 60)">
      <rect width="195" height="150" rx="12" fill="#0F172A"/>
      ${xrayBase64 ? `<image href="${xrayBase64}" x="10" y="10" width="175" height="130" preserveAspectRatio="xMidYMid slice"/>` : `<text x="97" y="80" font-size="14" fill="#94A3B8" text-anchor="middle">Chest X-Ray</text>`}
    </g>

    <g transform="translate(20, 230)">
      <text x="0" y="20" class="layer-card-title">Input Tensor</text>
      <text x="0" y="42" class="layer-sub">Posteroanterior X-ray</text>

      <rect x="0" y="60" width="195" height="40" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="97" y="85" class="shape-badge" text-anchor="middle" class="mono">(None, 160, 160, 3)</text>

      <text x="0" y="125" font-size="12" font-weight="600" fill="#64748B">Channels: 3 (RGB)</text>
      <text x="0" y="145" font-size="12" fill="#64748B">Range: [0.0 , 1.0]</text>
      <text x="0" y="165" font-size="12" fill="#64748B">Interpolation: Nearest</text>

      <rect x="0" y="185" width="195" height="34" rx="8" fill="#F1F5F9"/>
      <text x="97" y="207" font-size="12" font-weight="700" fill="#475569" text-anchor="middle">Params: 0</text>
    </g>
  </g>

  <line x1="305" y1="400" x2="330" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 2: Conv Block 1 -->
  <g transform="translate(340, 160)" filter="url(#cardShadow2)">
    <rect width="250" height="480" rx="16" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
    <rect width="250" height="42" rx="16" fill="#DBEAFE"/>
    <text x="125" y="27" font-size="14" font-weight="700" fill="#1D4ED8" text-anchor="middle">CONV BLOCK 1</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Conv2D (32@3×3)</text>
      <text x="0" y="40" class="layer-sub">Activation: ReLU | Stride: 1</text>
      <rect x="0" y="50" width="210" height="36" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="105" y="73" class="shape-badge" text-anchor="middle" class="mono">(None, 158, 158, 32)</text>
      <text x="0" y="106" font-size="12" font-weight="600" fill="#2563EB">Params: (3×3×3+1)×32 = 896</text>

      <line x1="0" y1="125" x2="210" y2="125" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="150" class="layer-card-title">MaxPooling2D (2×2)</text>
      <text x="0" y="170" class="layer-sub">Pool: 2×2 | Stride: 2 (Valid)</text>
      <rect x="0" y="180" width="210" height="36" rx="8" fill="#FEF3C7" stroke="#FDE68A"/>
      <text x="105" y="203" font-size="14" font-weight="700" fill="#D97706" text-anchor="middle" class="mono">(None, 79, 79, 32)</text>
      <text x="0" y="236" font-size="12" fill="#64748B">Params: 0 (Downsampling)</text>

      <line x1="0" y1="255" x2="210" y2="255" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="280" font-size="12" font-weight="700" fill="#0F172A">Extracted Features:</text>
      <text x="0" y="300" font-size="12" fill="#475569">• Low-level edge detectors</text>
      <text x="0" y="320" font-size="12" fill="#475569">• Rib boundaries &amp; clavicle</text>
      <text x="0" y="340" font-size="12" fill="#475569">• Lung-pleura contrast</text>

      <rect x="0" y="360" width="210" height="34" rx="8" fill="#F1F5F9"/>
      <text x="105" y="382" font-size="12" font-weight="700" fill="#1E40AF" text-anchor="middle">Total Block 1: 896 Params</text>
    </g>
  </g>

  <line x1="600" y1="400" x2="625" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 3: Conv Block 2 -->
  <g transform="translate(635, 160)" filter="url(#cardShadow2)">
    <rect width="250" height="480" rx="16" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
    <rect width="250" height="42" rx="16" fill="#DBEAFE"/>
    <text x="125" y="27" font-size="14" font-weight="700" fill="#1D4ED8" text-anchor="middle">CONV BLOCK 2</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Conv2D (64@3×3)</text>
      <text x="0" y="40" class="layer-sub">Activation: ReLU | Stride: 1</text>
      <rect x="0" y="50" width="210" height="36" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="105" y="73" class="shape-badge" text-anchor="middle" class="mono">(None, 77, 77, 64)</text>
      <text x="0" y="106" font-size="12" font-weight="600" fill="#2563EB">Params: (3×3×32+1)×64 = 18,496</text>

      <line x1="0" y1="125" x2="210" y2="125" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="150" class="layer-card-title">MaxPooling2D (2×2)</text>
      <text x="0" y="170" class="layer-sub">Pool: 2×2 | Stride: 2 (Valid)</text>
      <rect x="0" y="180" width="210" height="36" rx="8" fill="#FEF3C7" stroke="#FDE68A"/>
      <text x="105" y="203" font-size="14" font-weight="700" fill="#D97706" text-anchor="middle" class="mono">(None, 38, 38, 64)</text>
      <text x="0" y="236" font-size="12" fill="#64748B">Params: 0 (Downsampling)</text>

      <line x1="0" y1="255" x2="210" y2="255" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="280" font-size="12" font-weight="700" fill="#0F172A">Extracted Features:</text>
      <text x="0" y="300" font-size="12" fill="#475569">• Diaphragm dome curves</text>
      <text x="0" y="320" font-size="12" fill="#475569">• Spine alignment lines</text>
      <text x="0" y="340" font-size="12" fill="#475569">• Costophrenic recesses</text>

      <rect x="0" y="360" width="210" height="34" rx="8" fill="#F1F5F9"/>
      <text x="105" y="382" font-size="12" font-weight="700" fill="#1E40AF" text-anchor="middle">Total Block 2: 18,496 Params</text>
    </g>
  </g>

  <line x1="895" y1="400" x2="920" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 4: Conv Block 3 -->
  <g transform="translate(930, 160)" filter="url(#cardShadow2)">
    <rect width="250" height="480" rx="16" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
    <rect width="250" height="42" rx="16" fill="#DBEAFE"/>
    <text x="125" y="27" font-size="14" font-weight="700" fill="#1D4ED8" text-anchor="middle">CONV BLOCK 3</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Conv2D (128@3×3)</text>
      <text x="0" y="40" class="layer-sub">Activation: ReLU | Stride: 1</text>
      <rect x="0" y="50" width="210" height="36" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="105" y="73" class="shape-badge" text-anchor="middle" class="mono">(None, 36, 36, 128)</text>
      <text x="0" y="106" font-size="12" font-weight="600" fill="#2563EB">Params: (3×3×64+1)×128 = 73,856</text>

      <line x1="0" y1="125" x2="210" y2="125" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="150" class="layer-card-title">MaxPooling2D (2×2)</text>
      <text x="0" y="170" class="layer-sub">Pool: 2×2 | Stride: 2 (Valid)</text>
      <rect x="0" y="180" width="210" height="36" rx="8" fill="#FEF3C7" stroke="#FDE68A"/>
      <text x="105" y="203" font-size="14" font-weight="700" fill="#D97706" text-anchor="middle" class="mono">(None, 18, 18, 128)</text>
      <text x="0" y="236" font-size="12" fill="#64748B">Params: 0 (Downsampling)</text>

      <line x1="0" y1="255" x2="210" y2="255" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="280" font-size="12" font-weight="700" fill="#0F172A">Extracted Features:</text>
      <text x="0" y="300" font-size="12" fill="#475569">• Cardiac apex &amp; left ventricle</text>
      <text x="0" y="320" font-size="12" fill="#475569">• Right cardiac margin</text>
      <text x="0" y="340" font-size="12" fill="#475569">• Aortic knob silhouette</text>

      <rect x="0" y="360" width="210" height="34" rx="8" fill="#F1F5F9"/>
      <text x="105" y="382" font-size="12" font-weight="700" fill="#1E40AF" text-anchor="middle">Total Block 3: 73,856 Params</text>
    </g>
  </g>

  <line x1="1190" y1="400" x2="1215" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 5: Conv Block 4 -->
  <g transform="translate(1225, 160)" filter="url(#cardShadow2)">
    <rect width="250" height="480" rx="16" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
    <rect width="250" height="42" rx="16" fill="#DBEAFE"/>
    <text x="125" y="27" font-size="14" font-weight="700" fill="#1D4ED8" text-anchor="middle">CONV BLOCK 4</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Conv2D (256@3×3)</text>
      <text x="0" y="40" class="layer-sub">Activation: ReLU | Stride: 1</text>
      <rect x="0" y="50" width="210" height="36" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="105" y="73" class="shape-badge" text-anchor="middle" class="mono">(None, 16, 16, 256)</text>
      <text x="0" y="106" font-size="12" font-weight="600" fill="#2563EB">Params: (3×3×128+1)×256 = 295,168</text>

      <line x1="0" y1="125" x2="210" y2="125" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="150" class="layer-card-title">MaxPooling2D (Terminal)</text>
      <text x="0" y="170" class="layer-sub">Pool: 2×2 | Stride: 2 (Valid)</text>
      <rect x="0" y="180" width="210" height="36" rx="8" fill="#FEF3C7" stroke="#FDE68A"/>
      <text x="105" y="203" font-size="14" font-weight="700" fill="#D97706" text-anchor="middle" class="mono">(None, 8, 8, 256)</text>
      <text x="0" y="236" font-size="12" fill="#64748B">Params: 0 (Terminal feature map)</text>

      <line x1="0" y1="255" x2="210" y2="255" stroke="#E2E8F0" stroke-width="1"/>

      <text x="0" y="280" font-size="12" font-weight="700" fill="#0F172A">Extracted Features:</text>
      <text x="0" y="300" font-size="12" fill="#475569">• Global Cardiothoracic Ratio</text>
      <text x="0" y="320" font-size="12" fill="#475569">• Pathological heart enlargement</text>
      <text x="0" y="340" font-size="12" fill="#475569">• High-level thoracic geometry</text>

      <rect x="0" y="360" width="210" height="34" rx="8" fill="#F1F5F9"/>
      <text x="105" y="382" font-size="12" font-weight="700" fill="#1E40AF" text-anchor="middle">Total Block 4: 295,168 Params</text>
    </g>
  </g>

  <line x1="1485" y1="400" x2="1510" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 6: Flatten -->
  <g transform="translate(1520, 160)" filter="url(#cardShadow2)">
    <rect width="230" height="480" rx="16" fill="#FFFFFF" stroke="#E9D5FF" stroke-width="1.5"/>
    <rect width="230" height="42" rx="16" fill="#FAF5FF"/>
    <text x="115" y="27" font-size="14" font-weight="700" fill="#7E22CE" text-anchor="middle">FLATTEN LAYER</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Flatten Reshape</text>
      <text x="0" y="40" class="layer-sub">Converts 3D → 1D Vector</text>

      <rect x="0" y="60" width="190" height="44" rx="8" fill="#FAF5FF" stroke="#E9D5FF"/>
      <text x="95" y="87" font-size="15" font-weight="700" fill="#7E22CE" text-anchor="middle" class="mono">(None, 16,384)</text>

      <g transform="translate(0, 130)">
        <text x="0" y="20" font-size="12" font-weight="700" fill="#0F172A">Dimensional Calculation:</text>
        <text x="0" y="45" font-size="13" font-weight="600" fill="#6B21A8" class="mono">8 × 8 × 256 = 16,384</text>
        <text x="0" y="70" font-size="12" fill="#64748B">Preserves all spatial activations</text>
        <text x="0" y="90" font-size="12" fill="#64748B">without information loss</text>
        
        <text x="0" y="130" font-size="12" font-weight="700" fill="#0F172A">Trainable Weights:</text>
        <text x="0" y="150" font-size="12" fill="#64748B">0 parameters (Reshape only)</text>
      </g>

      <rect x="0" y="360" width="190" height="34" rx="8" fill="#F1F5F9"/>
      <text x="95" y="382" font-size="12" font-weight="700" fill="#7E22CE" text-anchor="middle">Params: 0</text>
    </g>
  </g>

  <line x1="1760" y1="400" x2="1785" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 7: Dense 128 -->
  <g transform="translate(1795, 160)" filter="url(#cardShadow2)">
    <rect width="240" height="480" rx="16" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="1.5"/>
    <rect width="240" height="42" rx="16" fill="#ECFDF5"/>
    <text x="120" y="27" font-size="14" font-weight="700" fill="#047857" text-anchor="middle">DENSE HIDDEN LAYER</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Fully Connected</text>
      <text x="0" y="40" class="layer-sub">Activation: ReLU</text>

      <rect x="0" y="60" width="200" height="44" rx="8" fill="#ECFDF5" stroke="#A7F3D0"/>
      <text x="100" y="87" font-size="15" font-weight="700" fill="#047857" text-anchor="middle" class="mono">(None, 128)</text>

      <g transform="translate(0, 130)">
        <text x="0" y="20" font-size="12" font-weight="700" fill="#0F172A">Connection Matrix:</text>
        <text x="0" y="45" font-size="12" fill="#64748B" class="mono">Weights: 16,384 × 128</text>
        <text x="0" y="65" font-size="12" fill="#64748B" class="mono">= 2,097,152 weights</text>
        <text x="0" y="85" font-size="12" fill="#64748B" class="mono">Biases: 128</text>
        
        <text x="0" y="125" font-size="12" font-weight="700" fill="#047857">Layer Parameters:</text>
        <text x="0" y="145" font-size="14" font-weight="800" fill="#065F46" class="mono">2,097,280 params</text>
        <text x="0" y="165" font-size="11" fill="#64748B">(84.37% of model)</text>
      </g>

      <rect x="0" y="360" width="200" height="34" rx="8" fill="#F1F5F9"/>
      <text x="100" y="382" font-size="12" font-weight="700" fill="#065F46" text-anchor="middle">Params: 2,097,280</text>
    </g>
  </g>

  <line x1="2045" y1="400" x2="2070" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 8: Dropout -->
  <g transform="translate(2080, 160)" filter="url(#cardShadow2)">
    <rect width="210" height="480" rx="16" fill="#FFFFFF" stroke="#FBCFE8" stroke-width="1.5"/>
    <rect width="210" height="42" rx="16" fill="#FDF2F8"/>
    <text x="105" y="27" font-size="14" font-weight="700" fill="#BE185D" text-anchor="middle">DROPOUT LAYER</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Regularization</text>
      <text x="0" y="40" class="layer-sub">Rate = 0.50 (50%)</text>

      <rect x="0" y="60" width="170" height="44" rx="8" fill="#FDF2F8" stroke="#FBCFE8"/>
      <text x="85" y="87" font-size="15" font-weight="700" fill="#BE185D" text-anchor="middle" class="mono">(None, 128)</text>

      <g transform="translate(0, 130)">
        <text x="0" y="20" font-size="12" font-weight="700" fill="#0F172A">Mechanism:</text>
        <text x="0" y="45" font-size="12" fill="#475569">• Randomly deactivates</text>
        <text x="0" y="65" font-size="12" fill="#475569">  50% of hidden neurons</text>
        <text x="0" y="85" font-size="12" fill="#475569">  during each train batch</text>
        <text x="0" y="110" font-size="12" fill="#475569">• Prevents complex co-</text>
        <text x="0" y="130" font-size="12" fill="#475569">  adaptation &amp; memorization</text>
        <text x="0" y="155" font-size="12" fill="#475569">• Inactive during inference</text>
      </g>

      <rect x="0" y="360" width="170" height="34" rx="8" fill="#F1F5F9"/>
      <text x="85" y="382" font-size="12" font-weight="700" fill="#BE185D" text-anchor="middle">Params: 0</text>
    </g>
  </g>

  <line x1="2300" y1="400" x2="2325" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 9: Output Layer -->
  <g transform="translate(2335, 160)" filter="url(#cardShadow2)">
    <rect width="210" height="480" rx="16" fill="#FFFFFF" stroke="#FECACA" stroke-width="1.5"/>
    <rect width="210" height="42" rx="16" fill="#FEF2F2"/>
    <text x="105" y="27" font-size="14" font-weight="700" fill="#991B1B" text-anchor="middle">OUTPUT LAYER</text>

    <g transform="translate(20, 60)">
      <text x="0" y="20" class="layer-card-title">Dense (Sigmoid)</text>
      <text x="0" y="40" class="layer-sub">Binary Classification</text>

      <rect x="0" y="60" width="170" height="44" rx="8" fill="#FEF2F2" stroke="#FECACA"/>
      <text x="85" y="87" font-size="15" font-weight="700" fill="#DC2626" text-anchor="middle" class="mono">(None, 1)</text>

      <g transform="translate(0, 130)">
        <text x="0" y="20" font-size="12" font-weight="700" fill="#0F172A">Sigmoid Formulation:</text>
        <text x="0" y="45" font-size="13" font-weight="700" fill="#B91C1C" class="mono">ŷ = 1 / (1 + e⁻ᶻ)</text>
        
        <text x="0" y="80" font-size="12" font-weight="700" fill="#0F172A">Parameters:</text>
        <text x="0" y="100" font-size="12" fill="#64748B" class="mono">128 weights + 1 bias</text>
        <text x="0" y="120" font-size="13" font-weight="700" fill="#DC2626" class="mono">= 129 params</text>

        <text x="0" y="155" font-size="12" font-weight="700" fill="#0F172A">Output Probability:</text>
        <text x="0" y="175" font-size="12" fill="#64748B">ŷ ∈ [0.00, 1.00]</text>
      </g>

      <rect x="0" y="360" width="170" height="34" rx="8" fill="#F1F5F9"/>
      <text x="85" y="382" font-size="12" font-weight="700" fill="#DC2626" text-anchor="middle">Params: 129</text>
    </g>
  </g>

  <line x1="2555" y1="400" x2="2580" y2="400" stroke="#94A3B8" stroke-width="2.5" marker-end="url(#arrow)"/>

  <!-- STEP 10: Triage Decision -->
  <g transform="translate(2590, 160)" filter="url(#cardShadow2)">
    <rect width="150" height="480" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect width="150" height="42" rx="16" fill="#F8FAFC"/>
    <text x="75" y="27" font-size="13" font-weight="700" fill="#334155" text-anchor="middle">DECISION</text>

    <g transform="translate(15, 60)">
      <!-- Cardiomegaly -->
      <rect width="120" height="150" rx="10" fill="#FEF2F2" stroke="#F87171"/>
      <text x="60" y="25" font-size="10" font-weight="700" fill="#991B1B" text-anchor="middle">ŷ ≥ 0.50</text>
      <text x="60" y="48" font-size="13" font-weight="800" fill="#DC2626" text-anchor="middle">Cardiomegaly</text>
      <text x="60" y="70" font-size="10" fill="#7F1D1D" text-anchor="middle">(Enlarged Heart)</text>
      <line x1="10" y1="85" x2="110" y2="85" stroke="#FECACA"/>
      <text x="60" y="105" font-size="10" font-weight="600" fill="#991B1B" text-anchor="middle">TP: 436</text>
      <text x="60" y="125" font-size="10" font-weight="600" fill="#B91C1C" text-anchor="middle">FN: 121</text>
      <text x="60" y="140" font-size="9" fill="#64748B" text-anchor="middle">Recall: 78.28%</text>

      <!-- Normal -->
      <g transform="translate(0, 170)">
        <rect width="120" height="150" rx="10" fill="#ECFDF5" stroke="#34D399"/>
        <text x="60" y="25" font-size="10" font-weight="700" fill="#065F46" text-anchor="middle">ŷ &lt; 0.50</text>
        <text x="60" y="48" font-size="13" font-weight="800" fill="#059669" text-anchor="middle">Normal</text>
        <text x="60" y="70" font-size="10" fill="#064E3B" text-anchor="middle">(Healthy Silhouette)</text>
        <line x1="10" y1="85" x2="110" y2="85" stroke="#A7F3D0"/>
        <text x="60" y="105" font-size="10" font-weight="600" fill="#065F46" text-anchor="middle">TN: 405</text>
        <text x="60" y="125" font-size="10" font-weight="600" fill="#047857" text-anchor="middle">FP: 152</text>
        <text x="60" y="140" font-size="9" fill="#64748B" text-anchor="middle">Spec: 72.71%</text>
      </g>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- BOTTOM SUMMARY TABLE                                                  -->
  <!-- ===================================================================== -->
  <g transform="translate(60, 680)">
    <rect width="${width - 120}" height="240" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5"/>

    <!-- Table Header -->
    <g transform="translate(30, 25)">
      <text x="0" y="20" font-size="16" font-weight="700" fill="#0F172A">Mathematical Parameter Accounting Table</text>
      
      <!-- Columns -->
      <g transform="translate(0, 45)">
        <rect width="${width - 180}" height="32" rx="6" fill="#E2E8F0"/>
        <text x="20" y="21" font-size="12" font-weight="700" fill="#334155">STAGE / BLOCK</text>
        <text x="400" y="21" font-size="12" font-weight="700" fill="#334155">LAYER TYPE &amp; SPECS</text>
        <text x="850" y="21" font-size="12" font-weight="700" fill="#334155">OUTPUT TENSOR SHAPE</text>
        <text x="1300" y="21" font-size="12" font-weight="700" fill="#334155">WEIGHT FORMULA</text>
        <text x="1800" y="21" font-size="12" font-weight="700" fill="#334155">LAYER PARAMETERS</text>
        <text x="2200" y="21" font-size="12" font-weight="700" fill="#334155">CUMULATIVE PARAMS</text>

        <!-- Rows -->
        <g transform="translate(0, 40)">
          <text x="20" y="18" font-size="13" font-weight="600" fill="#0F172A">Conv Block 1</text>
          <text x="400" y="18" font-size="13" fill="#475569">Conv2D (32, 3×3, ReLU) + MaxPool (2×2)</text>
          <text x="850" y="18" font-size="13" fill="#1E40AF" class="mono">(158, 158, 32) → (79, 79, 32)</text>
          <text x="1300" y="18" font-size="13" fill="#475569" class="mono">(3 × 3 × 3 + 1) × 32</text>
          <text x="1800" y="18" font-size="13" font-weight="700" fill="#0F172A" class="mono">896</text>
          <text x="2200" y="18" font-size="13" fill="#64748B" class="mono">896 (0.04%)</text>
        </g>

        <g transform="translate(0, 68)">
          <text x="20" y="18" font-size="13" font-weight="600" fill="#0F172A">Conv Block 2</text>
          <text x="400" y="18" font-size="13" fill="#475569">Conv2D (64, 3×3, ReLU) + MaxPool (2×2)</text>
          <text x="850" y="18" font-size="13" fill="#1E40AF" class="mono">(77, 77, 64) → (38, 38, 64)</text>
          <text x="1300" y="18" font-size="13" fill="#475569" class="mono">(3 × 3 × 32 + 1) × 64</text>
          <text x="1800" y="18" font-size="13" font-weight="700" fill="#0F172A" class="mono">18,496</text>
          <text x="2200" y="18" font-size="13" fill="#64748B" class="mono">19,392 (0.78%)</text>
        </g>

        <g transform="translate(0, 96)">
          <text x="20" y="18" font-size="13" font-weight="600" fill="#0F172A">Conv Block 3</text>
          <text x="400" y="18" font-size="13" fill="#475569">Conv2D (128, 3×3, ReLU) + MaxPool (2×2)</text>
          <text x="850" y="18" font-size="13" fill="#1E40AF" class="mono">(36, 36, 128) → (18, 18, 128)</text>
          <text x="1300" y="18" font-size="13" fill="#475569" class="mono">(3 × 3 × 64 + 1) × 128</text>
          <text x="1800" y="18" font-size="13" font-weight="700" fill="#0F172A" class="mono">73,856</text>
          <text x="2200" y="18" font-size="13" fill="#64748B" class="mono">93,248 (3.75%)</text>
        </g>

        <g transform="translate(0, 124)">
          <text x="20" y="18" font-size="13" font-weight="600" fill="#0F172A">Conv Block 4</text>
          <text x="400" y="18" font-size="13" fill="#475569">Conv2D (256, 3×3, ReLU) + MaxPool (2×2)</text>
          <text x="850" y="18" font-size="13" fill="#1E40AF" class="mono">(16, 16, 256) → (8, 8, 256)</text>
          <text x="1300" y="18" font-size="13" fill="#475569" class="mono">(3 × 3 × 128 + 1) × 256</text>
          <text x="1800" y="18" font-size="13" font-weight="700" fill="#0F172A" class="mono">295,168</text>
          <text x="2200" y="18" font-size="13" fill="#64748B" class="mono">388,416 (15.63%)</text>
        </g>

        <g transform="translate(0, 152)">
          <text x="20" y="18" font-size="13" font-weight="700" fill="#7E22CE">Classifier Head</text>
          <text x="400" y="18" font-size="13" fill="#475569">Flatten + Dense (128) + Dropout (0.50) + Dense (1)</text>
          <text x="850" y="18" font-size="13" fill="#7E22CE" class="mono">16,384 → 128 → 1</text>
          <text x="1300" y="18" font-size="13" fill="#475569" class="mono">(16,384 + 1) × 128 + (128 + 1) × 1</text>
          <text x="1800" y="18" font-size="13" font-weight="800" fill="#7E22CE" class="mono">2,097,409</text>
          <text x="2200" y="18" font-size="14" font-weight="800" fill="#0F172A" class="mono">2,485,825 (100.0%)</text>
        </g>
      </g>
    </g>
  </g>

</svg>`;
}

// Write the SVGs to destination folders
const TARGET_DIRS = [
    path.join(BASE_DIR, 'docs', 'manuscript'),
    path.join(BASE_DIR, 'evaluation_reports'),
    path.resolve(BASE_DIR, '..') // root workspace
];

TARGET_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const svg1 = generateArchitectureSVG();
const svg2 = generateLayerFlowchartSVG();

TARGET_DIRS.forEach(dir => {
    fs.writeFileSync(path.join(dir, 'cnn_architecture_diagram.svg'), svg1, 'utf8');
    fs.writeFileSync(path.join(dir, 'cnn_layers_flowchart.svg'), svg2, 'utf8');
    console.log(`Saved SVGs to: ${dir}`);
});

console.log("SVG generation completed successfully.");
