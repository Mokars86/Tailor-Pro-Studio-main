import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Apprentice, InventoryItem } from '../types';

export interface DocumentExportOptions {
  filename: string;
  title: string;
  htmlContent: string;
  text?: string;
  printImmediately?: boolean;
}

export interface DocumentExportResult {
  success: boolean;
  message: string;
  mode?: 'capacitor' | 'web-share' | 'blob-download' | 'print-window';
}

/**
 * Universal Mobile & Desktop Document Exporter
 * Supports:
 * 1. Android / iOS Native Capacitor App: Saves HTML to Cache and triggers native share/print drawer
 * 2. Mobile Safari / Mobile Chrome: Uses Web Share API (Files) to save to Files, Downloads, Drive, WhatsApp, or Print
 * 3. Browser Fallback: Direct Blob download to phone/desktop storage
 * 4. Desktop Print: Opens formatted printable window
 */
export async function downloadOrShareDocument(
  options: DocumentExportOptions
): Promise<DocumentExportResult> {
  const { filename, title, htmlContent, text = 'Official document from Tailor Pro Studio.', printImmediately = true } = options;
  const isMobile =
    typeof navigator !== 'undefined' &&
    (/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || '') || Capacitor.isNativePlatform());

  // ─────────────────────────────────────────────────────────────
  // 1. CAPACITOR NATIVE APP (Android APK / iOS app)
  // ─────────────────────────────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    try {
      // Write HTML file to phone cache
      await Filesystem.writeFile({
        path: filename,
        data: htmlContent,
        directory: Directory.Cache,
        encoding: Encoding.UTF8
      });

      const fileUri = await Filesystem.getUri({
        path: filename,
        directory: Directory.Cache
      });

      // Open native system drawer (Save to Downloads/Files, WhatsApp, Google Drive, Print)
      await Share.share({
        title,
        text,
        url: fileUri.uri,
        files: [fileUri.uri]
      });

      return {
        success: true,
        message: 'Document ready! Select Print, Save to Files, or WhatsApp from your phone options.',
        mode: 'capacitor'
      };
    } catch (err: any) {
      if (err?.message?.includes('canceled') || err?.name === 'AbortError') {
        return { success: false, message: 'Export cancelled by user.' };
      }
      console.warn('[Doc Exporter] Capacitor share error, falling back:', err);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MOBILE WEB SHARE API (iOS Safari, Android Chrome)
  // ─────────────────────────────────────────────────────────────
  if (isMobile && typeof navigator !== 'undefined' && navigator.share && typeof File !== 'undefined') {
    try {
      const file = new File([htmlContent], filename, { type: 'text/html' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text
        });
        return {
          success: true,
          message: 'Document ready! Saved / shared via phone share drawer.',
          mode: 'web-share'
        };
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        return { success: false, message: 'Export cancelled.' };
      }
      console.warn('[Doc Exporter] Web Share failed, falling back to download:', shareErr);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BLOB DOWNLOAD (Mobile & Desktop browser download)
  // ─────────────────────────────────────────────────────────────
  let blobDownloaded = false;
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2000);
    blobDownloaded = true;
  } catch (blobErr) {
    console.warn('[Doc Exporter] Blob URL download failed:', blobErr);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. DESKTOP PRINT WINDOW (Desktop only)
  // ─────────────────────────────────────────────────────────────
  if (!isMobile && printImmediately) {
    try {
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        return {
          success: true,
          message: 'Print preview window opened.',
          mode: 'print-window'
        };
      }
    } catch (printErr) {
      console.warn('[Doc Exporter] Desktop window.open blocked or failed:', printErr);
    }
  }

  if (blobDownloaded) {
    return {
      success: true,
      message: `Document '${filename}' downloaded to your device! Open to view or print.`,
      mode: 'blob-download'
    };
  }

  return {
    success: false,
    message: 'Could not trigger automatic download. Please check browser download permissions.'
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. WORKSHOP DISPLAY POSTER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════

export function generateWorkshopPosterHtml(params: {
  studioName: string;
  ownerName: string;
  workshopCode: string;
  studioLogoUrl?: string;
  tailorProLogoUrl?: string;
}): string {
  const { studioName, ownerName, workshopCode, studioLogoUrl, tailorProLogoUrl = '/tailor_pro_logo.jpg' } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Workshop Display Poster — ${studioName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&family=Outfit:wght@600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #EBF5F0;
      color: #0D3B36;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 15px;
    }
    .poster-page {
      background: #FFFFFF;
      width: 210mm;
      min-height: 297mm;
      max-width: 100%;
      padding: 14mm 16mm 12mm 16mm;
      border-radius: 24px;
      box-shadow: 0 20px 50px rgba(13, 59, 54, 0.15);
      border: 4px solid #DCA134;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .top-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid rgba(220, 161, 52, 0.4);
      padding-bottom: 12px;
    }
    .logo-box {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: #0D3B36;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .atelier-info {
      text-align: center;
      flex: 1;
      padding: 0 10px;
    }
    .atelier-title {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .atelier-sub {
      font-size: 11px;
      font-weight: 800;
      color: #DCA134;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 3px;
    }
    .main-heading {
      font-family: 'Outfit', sans-serif;
      font-size: 26px;
      font-weight: 900;
      color: #0D3B36;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 15px;
    }
    .sub-heading {
      font-size: 13px;
      font-weight: 800;
      color: #DCA134;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 12px;
    }
    .instructions-box {
      background: #F4FAF7;
      border: 2px dashed #0D3B36;
      border-radius: 16px;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 700;
      color: #0D3B36;
      text-align: center;
      line-height: 1.4;
      margin: 10px 0;
    }
    .qr-card {
      background: #FFFFFF;
      border: 3px solid #0D3B36;
      border-radius: 24px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 10px auto;
      box-shadow: 0 10px 25px rgba(13, 59, 54, 0.08);
      max-width: 320px;
    }
    .pair-code-section {
      background: #0D3B36;
      color: #FFFFFF;
      border-radius: 18px;
      padding: 14px 20px;
      text-align: center;
      margin: 12px 0;
      border: 2px solid #DCA134;
    }
    .pair-code-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #DCA134;
      text-transform: uppercase;
    }
    .pair-code-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 2px;
      margin-top: 4px;
    }
    .trainer-card {
      background: #EBF5F0;
      border-radius: 14px;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
    }
    .poster-footer {
      border-top: 2px solid rgba(220, 161, 52, 0.4);
      padding-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 800;
      color: #0D3B36;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .poster-page { box-shadow: none; border-radius: 0; width: 100%; min-height: 100vh; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="poster-page">
    <div class="top-header">
      <div class="logo-box">
        <img src="${studioLogoUrl || tailorProLogoUrl}" alt="Studio Logo" onerror="this.src='${tailorProLogoUrl}';" />
      </div>
      <div class="atelier-info">
        <div class="atelier-title">${studioName}</div>
        <div class="atelier-sub">AUTHENTICATED TAILORING WORKSHOP</div>
      </div>
      <div class="logo-box">
        <img src="${tailorProLogoUrl}" alt="Tailor Pro Logo" />
      </div>
    </div>

    <div class="main-heading">APPRENTICE ONBOARDING</div>
    <div class="sub-heading">WORKSHOP SYNC & PAIRING POSTER</div>

    <div class="instructions-box">
      Apprentices: Open your <strong>Tailor Pro Apprentice App</strong>, tap <strong>"Sync Workshop"</strong>, and enter your Workshop Key or scan below:
    </div>

    <div class="qr-card">
      <svg width="220" height="220" viewBox="0 0 100 100" fill="#0D3B36">
        <rect width="100" height="100" fill="white"/>
        <rect x="5" y="5" width="30" height="30" fill="#0D3B36"/>
        <rect x="10" y="10" width="20" height="20" fill="white"/>
        <rect x="15" y="15" width="10" height="10" fill="#0D3B36"/>
        <rect x="65" y="5" width="30" height="30" fill="#0D3B36"/>
        <rect x="70" y="10" width="20" height="20" fill="white"/>
        <rect x="75" y="15" width="10" height="10" fill="#0D3B36"/>
        <rect x="5" y="65" width="30" height="30" fill="#0D3B36"/>
        <rect x="10" y="70" width="20" height="20" fill="white"/>
        <rect x="15" y="75" width="10" height="10" fill="#0D3B36"/>
        <rect x="42" y="10" width="6" height="6" fill="#DCA134"/>
        <rect x="52" y="10" width="6" height="6" fill="#0D3B36"/>
        <rect x="42" y="22" width="6" height="6" fill="#0D3B36"/>
        <rect x="52" y="22" width="6" height="6" fill="#DCA134"/>
        <rect x="10" y="42" width="6" height="6" fill="#0D3B36"/>
        <rect x="22" y="42" width="6" height="6" fill="#DCA134"/>
        <rect x="34" y="42" width="6" height="6" fill="#0D3B36"/>
        <rect x="46" y="42" width="6" height="6" fill="#0D3B36"/>
        <rect x="58" y="42" width="6" height="6" fill="#DCA134"/>
        <rect x="70" y="42" width="6" height="6" fill="#0D3B36"/>
        <rect x="82" y="42" width="6" height="6" fill="#0D3B36"/>
        <rect x="42" y="54" width="6" height="6" fill="#DCA134"/>
        <rect x="54" y="54" width="6" height="6" fill="#0D3B36"/>
        <rect x="66" y="54" width="6" height="6" fill="#DCA134"/>
        <rect x="42" y="66" width="6" height="6" fill="#0D3B36"/>
        <rect x="54" y="66" width="6" height="6" fill="#DCA134"/>
        <rect x="66" y="66" width="6" height="6" fill="#0D3B36"/>
        <rect x="78" y="66" width="6" height="6" fill="#0D3B36"/>
        <rect x="42" y="78" width="6" height="6" fill="#DCA134"/>
        <rect x="54" y="78" width="6" height="6" fill="#0D3B36"/>
        <rect x="66" y="78" width="6" height="6" fill="#0D3B36"/>
        <rect x="78" y="78" width="6" height="6" fill="#DCA134"/>
      </svg>
    </div>

    <div class="pair-code-section">
      <div class="pair-code-label">MASTER WORKSHOP KEY</div>
      <div class="pair-code-badge">${workshopCode}</div>
    </div>

    <div class="trainer-card">
      <span>Master Trainer / Owner:</span>
      <strong style="color:#0D3B36;">${ownerName}</strong>
    </div>

    <div class="poster-footer">
      <span>TAILOR PRO PLATFORM</span>
      <span>OFFICIAL ATELIER CREDENTIALS</span>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. MASTER CRAFTSMAN CERTIFICATE GENERATOR (LANDSCAPE)
// ═══════════════════════════════════════════════════════════════════════════

export function generateMasterCertificateHtml(params: {
  studioName: string;
  recipientTitle: string;
  masterTrainer: string;
  ceoName?: string;
  issueDate: string;
  certCode: string;
  qrCodeUrl: string;
  studioLogoUrl?: string;
}): string {
  const {
    studioName,
    recipientTitle,
    masterTrainer,
    ceoName = 'MUBARIK TUAHIR ALI',
    issueDate,
    certCode,
    qrCodeUrl,
    studioLogoUrl = '/tailor_pro_logo.jpg'
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Master Certificate — ${recipientTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
    
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #061E1B;
      color: #0F2D2A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 15px;
    }
    .cert-page {
      background: #FDFCF7;
      width: 297mm;
      min-height: 210mm;
      max-width: 100%;
      padding: 12mm 15mm;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      border: 4px solid #DCA134;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .frame-border {
      position: absolute;
      inset: 8px;
      border: 1.5px solid rgba(220, 161, 52, 0.6);
      border-radius: 14px;
      pointer-events: none;
    }
    .accent-triangle {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 22%;
      background: #0D3B36;
      clip-path: polygon(0 0, 100% 0, 36% 100%, 0% 100%);
      z-index: 1;
    }
    .accent-gold {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 23%;
      background: #DCA134;
      clip-path: polygon(0 0, 100% 0, 38% 100%, 0% 100%);
      z-index: 0;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .brand-logo-box {
      width: 68px;
      height: 68px;
      border-radius: 16px;
      background: #0D3B36;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cert-heading-area {
      text-align: center;
      position: relative;
      z-index: 10;
      margin: 8px 0;
    }
    .cert-title-sub {
      font-size: 11px;
      font-weight: 800;
      color: #DCA134;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .cert-title-main {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 2px 0;
    }
    .cert-body-area {
      text-align: center;
      position: relative;
      z-index: 10;
      padding: 0 40px;
    }
    .recipient-name {
      font-family: 'Cinzel', serif;
      font-size: 28px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 8px 0;
      border-bottom: 2px solid #DCA134;
      display: inline-block;
      padding: 0 20px 4px 20px;
    }
    .cert-description {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    .footer-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      border-top: 1.5px solid rgba(220, 161, 52, 0.4);
      padding-top: 10px;
    }
    .sig-block {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-bottom: 1.5px solid #0D3B36;
      margin-bottom: 4px;
      padding-bottom: 2px;
      font-family: 'Cinzel', serif;
      font-weight: 800;
      font-size: 11px;
      color: #0D3B36;
    }
    .sig-title {
      font-size: 9px;
      font-weight: 800;
      color: #DCA134;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .qr-box {
      text-align: center;
    }
    .qr-box img {
      width: 60px;
      height: 60px;
      border: 2px solid #DCA134;
      border-radius: 8px;
      background: white;
    }
    .qr-code-txt {
      font-family: monospace;
      font-size: 9px;
      font-weight: 800;
      color: #0D3B36;
      margin-top: 2px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .cert-page { box-shadow: none; border-radius: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="cert-page">
    <div class="frame-border"></div>
    <div class="accent-gold"></div>
    <div class="accent-triangle"></div>

    <div class="header-row">
      <div style="display:flex; align-items:center; gap:12px; margin-left:10px;">
        <div class="brand-logo-box">
          <img src="${studioLogoUrl}" alt="Logo" onerror="this.src='/tailor_pro_logo.jpg';" />
        </div>
        <div>
          <div style="font-family:'Outfit',sans-serif; font-size:15px; font-weight:900; color:#0D3B36; text-transform:uppercase;">${studioName}</div>
          <div style="font-size:10px; font-weight:800; color:#DCA134; text-transform:uppercase; letter-spacing:1px;">Master Principal Atelier</div>
        </div>
      </div>

      <div style="text-align:center;">
        <div class="brand-logo-box" style="margin:0 auto; width:54px; height:54px;">
          <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" />
        </div>
        <div style="font-size:9px; font-weight:900; color:#0D3B36; letter-spacing:2px; text-transform:uppercase; margin-top:2px;">TAILOR PRO</div>
      </div>

      <div style="text-align:right;">
        <div style="font-size:10px; font-weight:800; color:#0D3B36; text-transform:uppercase;">MOKARS TECH CORP</div>
        <div style="font-size:9px; font-weight:800; color:#DCA134; letter-spacing:1px; text-transform:uppercase;">AUTHENTICATED SEAL</div>
      </div>
    </div>

    <div class="cert-heading-area">
      <div class="cert-title-sub">CERTIFICATE OF MASTER ACCREDITATION</div>
      <div class="cert-title-main">MASTER ATELIER CRAFTSMAN</div>
    </div>

    <div class="cert-body-area">
      <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1.5px;">This official accreditation is conferred upon</div>
      <div class="recipient-name">${recipientTitle}</div>
      <p class="cert-description">
        in recognition of demonstrated mastery in bespoke tailoring, haute couture garment construction, atelier operational management, and exemplary craftsmanship in mentoring fashion apprentices.
      </p>
    </div>

    <div class="footer-row">
      <div class="sig-block">
        <div class="sig-line">${masterTrainer}</div>
        <div class="sig-title">Master Designer & Principal</div>
      </div>

      <div class="qr-box">
        <img src="${qrCodeUrl}" alt="QR Verification" />
        <div class="qr-code-txt">${certCode}</div>
        <div style="font-size:8px; color:#64748B;">Issued: ${issueDate}</div>
      </div>

      <div class="sig-block">
        <div class="sig-line">${ceoName}</div>
        <div class="sig-title">President, Mokars Tech Corp</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. APPRENTICE GRADUATION CERTIFICATE GENERATOR (LANDSCAPE)
// ═══════════════════════════════════════════════════════════════════════════

export function generateApprenticeCertificateHtml(params: {
  apprenticeName: string;
  studioName: string;
  masterTrainer: string;
  hoursCompleted: number;
  totalRequiredHours: number;
  specialty?: string;
  issueDate: string;
  certCode: string;
  qrCodeUrl: string;
  studioLogoUrl?: string;
}): string {
  const {
    apprenticeName,
    studioName,
    masterTrainer,
    hoursCompleted,
    totalRequiredHours,
    specialty = 'Haute Couture & Pattern Cutting',
    issueDate,
    certCode,
    qrCodeUrl,
    studioLogoUrl = '/tailor_pro_logo.jpg'
  } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apprentice Certificate — ${apprenticeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
    
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #041916;
      color: #0F2D2A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 15px;
    }
    .cert-page {
      background: #FDFCF7;
      width: 297mm;
      min-height: 210mm;
      max-width: 100%;
      padding: 12mm 15mm;
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5);
      border: 4px solid #DCA134;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .frame-border {
      position: absolute;
      inset: 8px;
      border: 1.5px solid rgba(220, 161, 52, 0.6);
      border-radius: 14px;
      pointer-events: none;
    }
    .accent-triangle {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 22%;
      background: #0D3B36;
      clip-path: polygon(0 0, 100% 0, 36% 100%, 0% 100%);
      z-index: 1;
    }
    .accent-gold {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 23%;
      background: #DCA134;
      clip-path: polygon(0 0, 100% 0, 38% 100%, 0% 100%);
      z-index: 0;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }
    .brand-logo-box {
      width: 66px;
      height: 66px;
      border-radius: 16px;
      background: #0D3B36;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cert-heading-area {
      text-align: center;
      position: relative;
      z-index: 10;
      margin: 8px 0;
    }
    .cert-title-sub {
      font-size: 11px;
      font-weight: 800;
      color: #DCA134;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .cert-title-main {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin: 2px 0;
    }
    .cert-body-area {
      text-align: center;
      position: relative;
      z-index: 10;
      padding: 0 40px;
    }
    .recipient-name {
      font-family: 'Cinzel', serif;
      font-size: 30px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 8px 0;
      border-bottom: 2px solid #DCA134;
      display: inline-block;
      padding: 0 24px 4px 24px;
    }
    .cert-description {
      font-size: 12.5px;
      font-weight: 600;
      color: #334155;
      line-height: 1.6;
      max-width: 820px;
      margin: 0 auto;
    }
    .footer-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      border-top: 1.5px solid rgba(220, 161, 52, 0.4);
      padding-top: 10px;
    }
    .sig-block {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-bottom: 1.5px solid #0D3B36;
      margin-bottom: 4px;
      padding-bottom: 2px;
      font-family: 'Cinzel', serif;
      font-weight: 800;
      font-size: 11px;
      color: #0D3B36;
    }
    .sig-title {
      font-size: 9px;
      font-weight: 800;
      color: #DCA134;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .qr-box {
      text-align: center;
    }
    .qr-box img {
      width: 60px;
      height: 60px;
      border: 2px solid #DCA134;
      border-radius: 8px;
      background: white;
    }
    .qr-code-txt {
      font-family: monospace;
      font-size: 9px;
      font-weight: 800;
      color: #0D3B36;
      margin-top: 2px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .cert-page { box-shadow: none; border-radius: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="cert-page">
    <div class="frame-border"></div>
    <div class="accent-gold"></div>
    <div class="accent-triangle"></div>

    <div class="header-row">
      <div style="display:flex; align-items:center; gap:12px; margin-left:10px;">
        <div class="brand-logo-box">
          <img src="${studioLogoUrl}" alt="Studio Logo" onerror="this.src='/tailor_pro_logo.jpg';" />
        </div>
        <div>
          <div style="font-family:'Outfit',sans-serif; font-size:15px; font-weight:900; color:#0D3B36; text-transform:uppercase;">${studioName}</div>
          <div style="font-size:10px; font-weight:800; color:#DCA134; text-transform:uppercase; letter-spacing:1px;">Graduating Atelier</div>
        </div>
      </div>

      <div style="text-align:center;">
        <div class="brand-logo-box" style="margin:0 auto; width:52px; height:52px;">
          <img src="/tailor_pro_logo.jpg" alt="Tailor Pro Logo" />
        </div>
        <div style="font-size:9px; font-weight:900; color:#0D3B36; letter-spacing:2px; text-transform:uppercase; margin-top:2px;">TAILOR PRO</div>
      </div>

      <div style="text-align:right;">
        <div style="font-size:10px; font-weight:800; color:#0D3B36; text-transform:uppercase;">PROFICIENCY DIPLOMA</div>
        <div style="font-size:9px; font-weight:800; color:#DCA134; letter-spacing:1px; text-transform:uppercase;">${hoursCompleted} / ${totalRequiredHours} HOURS</div>
      </div>
    </div>

    <div class="cert-heading-area">
      <div class="cert-title-sub">CERTIFICATE OF PROFICIENCY & GRADUATION</div>
      <div class="cert-title-main">GRADUATED BESPOKE TAILOR</div>
    </div>

    <div class="cert-body-area">
      <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:1.5px;">This official certificate of completion is awarded to</div>
      <div class="recipient-name">${apprenticeName}</div>
      <p class="cert-description">
        having successfully completed <strong>${hoursCompleted} hours</strong> of rigorous CAD blueprint drafting, garment pattern cutting, and bespoke tailoring in <em>${specialty}</em> under the direct mentorship of <strong>${masterTrainer}</strong> at <strong>${studioName}</strong>.
      </p>
    </div>

    <div class="footer-row">
      <div class="sig-block">
        <div class="sig-line">${masterTrainer}</div>
        <div class="sig-title">Master Trainer & Mentor</div>
      </div>

      <div class="qr-box">
        <img src="${qrCodeUrl}" alt="QR Verification" />
        <div class="qr-code-txt">${certCode}</div>
        <div style="font-size:8px; color:#64748B;">Issued: ${issueDate}</div>
      </div>

      <div class="sig-block">
        <div class="sig-line">MUBARIK TUAHIR ALI</div>
        <div class="sig-title">President, Mokars Tech Corp</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. STUDIO INVOICE GENERATOR (PORTRAIT)
// ═══════════════════════════════════════════════════════════════════════════

export function generateInvoiceHtml(params: {
  invoiceNumber: string;
  date: string;
  client: {
    name: string;
    email?: string;
    phone?: string;
    garmentTag?: string;
    totalCost: number;
    depositPaid: number;
    balanceDue: number;
    notes?: string;
  };
  studioSettings: {
    studioName?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    currency?: string;
    momoNumber?: string;
    momoName?: string;
    logoUrl?: string;
    studioLogoUrl?: string;
  };
}): string {
  const { invoiceNumber, date, client, studioSettings } = params;
  const currency = studioSettings.currency || 'GHS';
  const studioName = studioSettings.studioName || 'TAILOR PRO STUDIO';
  const logoUrl = studioSettings.logoUrl || studioSettings.studioLogoUrl;
  const totalCost = Number(client.totalCost) || 0;
  const depositPaid = Number(client.depositPaid) || 0;
  const balanceDue = Number(client.balanceDue) || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice #${invoiceNumber} — ${client.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #EBF5F0;
      color: #0D3B36;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .invoice-page {
      background: #FFFFFF;
      width: 210mm;
      min-height: 297mm;
      max-width: 100%;
      padding: 16mm;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      border: 3px solid #DCA134;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .inv-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 2px solid rgba(220, 161, 52, 0.4);
      padding-bottom: 16px;
    }
    .inv-title {
      font-family: 'Outfit', sans-serif;
      font-size: 28px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
    }
    .inv-meta {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      margin-top: 4px;
    }
    .client-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 14px 18px;
      margin: 20px 0;
    }
    .table-container {
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #0D3B36;
      color: #DCA134;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 12px 14px;
      text-align: left;
    }
    th:last-child { text-align: right; }
    td {
      padding: 14px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 13px;
      font-weight: 600;
    }
    td:last-child { text-align: right; font-weight: 800; }
    .summary-card {
      background: #F4FAF7;
      border: 2px solid #0D3B36;
      border-radius: 16px;
      padding: 16px 20px;
      max-width: 320px;
      margin-left: auto;
      margin-top: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 900;
      border-top: 2px solid #DCA134;
      padding-top: 8px;
      margin-top: 8px;
      color: #0D3B36;
    }
    .payment-card {
      background: #FFFBEB;
      border: 1.5px solid #FCD34D;
      border-radius: 14px;
      padding: 14px 18px;
      margin-top: 20px;
      font-size: 12px;
      line-height: 1.5;
    }
    .footer-note {
      border-top: 1px solid #E2E8F0;
      padding-top: 12px;
      text-align: center;
      font-size: 10px;
      color: #64748B;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .invoice-page { box-shadow: none; border-radius: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="invoice-page">
    <div>
      <div class="inv-header">
        <div>
          <div class="inv-title">INVOICE</div>
          <div class="inv-meta">Invoice #${invoiceNumber} · Date: ${date}</div>
        </div>
        <div style="text-align:right; display:flex; align-items:center; gap:12px; justify-content:flex-end;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width:48px; height:48px; object-fit:contain; border-radius:10px; border:1.5px solid #DCA134;" />` : ''}
          <div>
            <div style="font-family:'Outfit',sans-serif; font-size:18px; font-weight:900; color:#0D3B36;">${studioName}</div>
            <div style="font-size:11px; font-weight:700; color:#64748B;">${studioSettings.ownerName || 'Bespoke Atelier'}</div>
            ${studioSettings.phone ? `<div style="font-size:11px; color:#64748B;">${studioSettings.phone}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="client-card">
        <div style="font-size:10px; font-weight:800; color:#DCA134; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">BILLED TO</div>
        <div style="font-size:16px; font-weight:900; color:#0D3B36;">${client.name}</div>
        ${client.phone ? `<div style="font-size:12px; font-weight:600; color:#475569; margin-top:2px;">Phone: ${client.phone}</div>` : ''}
        ${client.email ? `<div style="font-size:12px; font-weight:600; color:#475569;">Email: ${client.email}</div>` : ''}
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Description / Garment Order</th>
              <th>Status</th>
              <th>Amount (${currency})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight:800; color:#0D3B36;">${client.garmentTag || 'Bespoke Couture Order'}</div>
                <div style="font-size:11px; color:#64748B; margin-top:2px;">Custom tailoring, fabric fitting, pattern cutting & couture assembly</div>
              </td>
              <td>
                <span style="background:#EBF5F0; color:#0D3B36; padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800;">
                  ${balanceDue <= 0 ? 'PAID IN FULL' : 'PARTIAL / PENDING'}
                </span>
              </td>
              <td>${currency} ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <div class="summary-row">
          <span>Total Order Cost:</span>
          <span>${currency} ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-row" style="color:#059669;">
          <span>Deposit Paid:</span>
          <span>- ${currency} ${depositPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div class="summary-total">
          <span>Balance Due:</span>
          <span style="color:${balanceDue > 0 ? '#DC2626' : '#059669'};">
            ${currency} ${balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      ${
        studioSettings.momoNumber
          ? `<div class="payment-card">
              <strong style="color:#92400E; display:block; margin-bottom:2px;">Mobile Money (MoMo) Payment Details:</strong>
              <div>Number: <strong>${studioSettings.momoNumber}</strong> ${studioSettings.momoName ? `(${studioSettings.momoName})` : ''}</div>
              <div style="color:#78350F; font-size:11px; margin-top:2px;">Reference your name or Invoice #${invoiceNumber} upon transfer.</div>
            </div>`
          : ''
      }
    </div>

    <div class="footer-note">
      Thank you for choosing ${studioName} · Generated by Tailor Pro Studio Platform
    </div>
  </div>

  <script>
    function startPrint() {
      setTimeout(function() {
        window.print();
      }, 400);
    }
    if (document.readyState === 'complete') {
      startPrint();
    } else {
      window.addEventListener('load', startPrint);
    }
  </script>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. INVENTORY & MATERIALS STOCK MANIFEST GENERATOR (PORTRAIT)
// ═══════════════════════════════════════════════════════════════════════════

export function generateInventoryListHtml(params: {
  items: InventoryItem[];
  categoryFilter?: string;
  studioSettings?: {
    studioName?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    studioLogoUrl?: string;
    currency?: string;
  };
}): string {
  const { items, categoryFilter = 'ALL', studioSettings = {} } = params;
  const studioName = studioSettings.studioName || 'TAILOR PRO STUDIO';
  const ownerName = studioSettings.ownerName || 'Master Atelier';
  const logoUrl = studioSettings.logoUrl || studioSettings.studioLogoUrl;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalCount = items.length;
  const lowStockCount = items.filter((i) => i.stockLevel <= (i.minThreshold || i.alertThreshold || 0)).length;
  const inStockCount = totalCount - lowStockCount;

  const itemRows = items.length > 0 ? items
    .map((item, idx) => {
      const isLow = item.stockLevel <= (item.minThreshold || item.alertThreshold || 0);
      return `
        <tr>
          <td style="text-align: center; color: #64748B; font-weight: 700; width: 40px;">${idx + 1}</td>
          <td>
            <div style="font-weight: 800; color: #0D3B36; font-size: 13px;">${item.name}</div>
            ${item.supplier ? `<div style="font-size: 10.5px; color: #64748B; margin-top: 2px;">Vendor: <strong>${item.supplier}</strong></div>` : ''}
          </td>
          <td>
            <span style="display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; background: #EBF5F0; color: #0D3B36; text-transform: uppercase;">
              ${item.category}
            </span>
          </td>
          <td style="text-align: right; font-weight: 900; color: #0D3B36; font-size: 13px;">
            ${item.stockLevel} <span style="font-size: 10.5px; font-weight: 600; color: #64748B;">${item.unit}</span>
          </td>
          <td style="text-align: right; font-size: 11px; font-weight: 700; color: #64748B;">
            &le; ${item.minThreshold || item.alertThreshold || 0} ${item.unit}
          </td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 10px; font-weight: 900; ${
              isLow
                ? 'background: #FEF3C7; color: #92400E; border: 1px solid #FCD34D;'
                : 'background: #DCFCE7; color: #166534; border: 1px solid #86EFAC;'
            }">
              ${isLow ? '⚠️ LOW STOCK' : '✓ IN STOCK'}
            </span>
          </td>
        </tr>
      `;
    })
    .join('') : `
      <tr>
        <td colspan="6" style="padding: 24px; text-align: center; color: #64748B; font-size: 12px; font-weight: 600;">
          No materials found in the current inventory catalog.
        </td>
      </tr>
    `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inventory Materials Stock List — ${studioName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #EBF5F0;
      color: #0D3B36;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .manifest-page {
      background: #FFFFFF;
      width: 210mm;
      min-height: 297mm;
      max-width: 100%;
      padding: 16mm;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.1);
      border: 3px solid #DCA134;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      border-bottom: 2.5px solid #DCA134;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title-main {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
      color: #0D3B36;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-sub {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .metrics-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 14px;
      text-align: center;
    }
    .metric-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .metric-val {
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 900;
      color: #0D3B36;
      margin-top: 3px;
    }
    .table-container {
      margin-bottom: 20px;
      flex-grow: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #0D3B36;
      color: #DCA134;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 10px 12px;
      text-align: left;
    }
    th:first-child { border-radius: 8px 0 0 8px; }
    th:last-child { border-radius: 0 8px 8px 0; text-align: center; }
    td {
      padding: 11px 12px;
      border-bottom: 1px solid #E2E8F0;
      font-size: 12px;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background-color: #FAFCFB;
    }
    .footer-section {
      border-top: 1px solid #E2E8F0;
      padding-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10px;
      color: #64748B;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    @media print {
      body { background: transparent; padding: 0; }
      .manifest-page { box-shadow: none; border-radius: 0; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="manifest-page">
    <div>
      <div class="header-row">
        <div>
          <div class="title-main">FABRICS & MATERIALS INVENTORY</div>
          <div class="title-sub">Official Stock Audit & Material Manifest · Filter: ${categoryFilter}</div>
          <div style="font-size: 11px; font-weight: 700; color: #0D3B36; margin-top: 6px;">
            Date of Audit: <strong>${currentDate}</strong>
          </div>
        </div>
        <div style="text-align: right; display: flex; align-items: center; gap: 12px; justify-content: flex-end;">
          ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="width: 46px; height: 46px; object-fit: contain; border-radius: 10px; border: 1.5px solid #DCA134;" />` : ''}
          <div>
            <div style="font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 900; color: #0D3B36;">${studioName}</div>
            <div style="font-size: 11px; font-weight: 700; color: #64748B;">${ownerName}</div>
            ${studioSettings.phone ? `<div style="font-size: 10.5px; color: #64748B;">${studioSettings.phone}</div>` : ''}
          </div>
        </div>
      </div>

      <div class="metrics-bar">
        <div class="metric-card">
          <div class="metric-title">TOTAL CATALOG SUPPLIES</div>
          <div class="metric-val">${totalCount} Items</div>
        </div>
        <div class="metric-card" style="border-color: #86EFAC; background: #F0FDF4;">
          <div class="metric-title" style="color: #166534;">IN STOCK & GOOD</div>
          <div class="metric-val" style="color: #166534;">${inStockCount} Healthy</div>
        </div>
        <div class="metric-card" style="border-color: #FCD34D; background: #FFFBEB;">
          <div class="metric-title" style="color: #92400E;">LOW STOCK ALERTS</div>
          <div class="metric-val" style="color: #92400E;">${lowStockCount} Critical</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="text-align: center;">#</th>
              <th>Material Name & Vendor</th>
              <th>Category</th>
              <th style="text-align: right;">Current Stock</th>
              <th style="text-align: right;">Min Alert</th>
              <th style="text-align: center;">Stock Status</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer-section">
      <div>Tailor Pro Atelier Inventory Management · Confidential Atelier Record</div>
      <div>Official Studio Stamp & Inventory Audit</div>
    </div>
  </div>

  <script>
    function startPrint() {
      setTimeout(function() {
        window.print();
      }, 400);
    }
    if (document.readyState === 'complete') {
      startPrint();
    } else {
      window.addEventListener('load', startPrint);
    }
  </script>
</body>
</html>`;
}
