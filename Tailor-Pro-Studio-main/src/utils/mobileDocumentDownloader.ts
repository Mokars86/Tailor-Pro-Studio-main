import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Apprentice, InventoryItem } from '../types';
import { TAILOR_PRO_LOGO_BASE64, MOKARS_TECH_LOGO_BASE64 } from './brandLogos';

export function resolveImageSrc(url?: string, fallback: string = TAILOR_PRO_LOGO_BASE64): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
  if (url === '/tailor_pro_logo.jpg' || url.includes('tailor_pro_logo')) return TAILOR_PRO_LOGO_BASE64;
  if (url === '/mokars_tech_logo.png' || url.includes('mokars_tech_logo')) return MOKARS_TECH_LOGO_BASE64;
  return url;
}

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
    studioLogoUrl
  } = params;

  const studioLogoSrc = resolveImageSrc(studioLogoUrl, TAILOR_PRO_LOGO_BASE64);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Master Certificate — ${recipientTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,700;1,800;1,900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
    
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
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      background: #041916;
      color: #072C27;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 15px;
    }
    .cert-page {
      background: #FFFFFF;
      width: 297mm;
      min-height: 210mm;
      max-width: 100%;
      padding: 10mm 14mm 10mm 14mm;
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
      z-index: 5;
    }
    .corner-tl {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 32px;
      height: 32px;
      border-top: 2.5px solid #DCA134;
      border-left: 2.5px solid #DCA134;
      border-top-left-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-tr {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-top: 2.5px solid #DCA134;
      border-right: 2.5px solid #DCA134;
      border-top-right-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-bl {
      position: absolute;
      bottom: 14px;
      left: 14px;
      width: 32px;
      height: 32px;
      border-bottom: 2.5px solid #DCA134;
      border-left: 2.5px solid #DCA134;
      border-bottom-left-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-br {
      position: absolute;
      bottom: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-bottom: 2.5px solid #DCA134;
      border-right: 2.5px solid #DCA134;
      border-bottom-right-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .accent-triangle {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 120px;
      background: #072C27;
      clip-path: polygon(0 0, 100% 0, 20% 100%, 0% 100%);
      -webkit-clip-path: polygon(0 0, 100% 0, 20% 100%, 0% 100%);
      z-index: 1;
    }
    .accent-gold {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 132px;
      background: #DCA134;
      clip-path: polygon(0 0, 100% 0, 22% 100%, 0% 100%);
      -webkit-clip-path: polygon(0 0, 100% 0, 22% 100%, 0% 100%);
      z-index: 0;
    }
    .cert-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      gap: 8px;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }
    .brand-logo-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .brand-logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .center-logo-box {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: #072C27;
      border: 3.5px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    }
    .center-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .corp-logo-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .corp-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .cert-heading-area {
      text-align: center;
      margin: 4px 0 2px 0;
    }
    .cert-title-main {
      font-family: 'Outfit', sans-serif;
      font-size: 44px;
      font-weight: 900;
      color: #072C27;
      text-transform: uppercase;
      letter-spacing: 5px;
      margin: 0;
      line-height: 1;
    }
    .cert-title-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #DCA134;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .cert-grant-text {
      font-family: 'Outfit', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      color: #1E293B;
      letter-spacing: 5px;
      text-transform: uppercase;
      margin-top: 7px;
    }
    .recipient-area {
      text-align: center;
      margin: 4px 0;
    }
    .recipient-name {
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      font-size: 38px;
      font-weight: 900;
      color: #072C27;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: inline-block;
      line-height: 1.1;
      padding: 0 15px;
    }
    .recipient-underline {
      height: 5px;
      width: 100%;
      max-width: 580px;
      background: #DCA134;
      border-radius: 3px;
      margin: 6px auto 0;
    }
    .cert-body-area {
      text-align: center;
      padding: 6px 20px;
      margin: 4px 0;
    }
    .cert-description {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15.5px;
      font-weight: 600;
      color: #1E293B;
      line-height: 1.85;
      letter-spacing: 0.3px;
      max-width: 900px;
      margin: 0 auto;
    }
    .credentials-card {
      background: #FAFAFA;
      border: 2px solid rgba(220, 161, 52, 0.8);
      border-radius: 14px;
      padding: 9px 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 3px 0;
    }
    .cred-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 8px;
    }
    .cred-item:not(:last-child) {
      border-right: 1.5px solid rgba(220, 161, 52, 0.4);
    }
    .cred-label {
      font-size: 10px;
      font-weight: 900;
      color: #DCA134;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cred-value {
      font-size: 13px;
      font-weight: 900;
      color: #072C27;
      margin-top: 3px;
      line-height: 1.25;
    }
    .footer-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 15px;
      border-top: 1.5px solid rgba(220, 161, 52, 0.5);
      padding-top: 8px;
      margin-top: 2px;
    }
    .sig-block {
      display: flex;
      flex-direction: column;
    }
    .sig-name {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-weight: 900;
      font-size: 17px;
      color: #072C27;
      text-transform: uppercase;
      line-height: 1;
    }
    .sig-line {
      height: 2px;
      width: 170px;
      background: #072C27;
      margin: 5px 0;
      border-radius: 2px;
    }
    .sig-title {
      font-size: 9px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .qr-container {
      background: #FFFFFF;
      border: 2px solid #DCA134;
      border-radius: 14px;
      padding: 5px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .qr-img-box {
      width: 50px;
      height: 50px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      flex-shrink: 0;
    }
    .qr-img-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-details {
      display: flex;
      flex-direction: column;
      text-align: left;
      line-height: 1.2;
    }
    .qr-status {
      font-size: 10px;
      font-weight: 900;
      color: #059669;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .qr-code-text {
      font-family: monospace;
      font-size: 11px;
      font-weight: 900;
      color: #072C27;
      margin: 1.5px 0;
    }
    .qr-scan-label {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    @media print {
      body { background: transparent !important; padding: 0 !important; margin: 0 !important; }
      .no-print { display: none !important; }
      .cert-page {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 297mm !important;
        height: 210mm !important;
        min-height: 210mm !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
        margin: 0 !important;
        padding: 12mm 16mm !important;
        border: 4.5px solid #DCA134 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Print / Save button for screen viewing -->
  <div class="no-print" style="position:fixed; top:12px; right:12px; z-index:9999;">
    <button onclick="window.print()" style="background:#DCA134; color:#072C27; border:none; padding:8px 16px; border-radius:10px; font-family:'Outfit',sans-serif; font-weight:900; font-size:12px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.25); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:6px;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="cert-page">
    <div class="frame-border"></div>
    <div class="corner-tl"></div>
    <div class="corner-tr"></div>
    <div class="corner-bl"></div>
    <div class="corner-br"></div>
    <div class="accent-gold"></div>
    <div class="accent-triangle"></div>

    <div class="cert-content">
      <!-- Top Header Row -->
      <div class="header-row">
        <!-- Left: Studio Logo & Name -->
        <div style="display:flex; align-items:center; gap:14px; z-index:2;">
          <div class="brand-logo-circle">
            <img src="${studioLogoSrc}" alt="Master Studio Logo" onerror="this.src='${TAILOR_PRO_LOGO_BASE64}';" />
          </div>
          <div>
            <div style="font-family:'Outfit',sans-serif; font-size:17px; font-weight:900; color:#072C27; text-transform:uppercase; letter-spacing:0.5px; line-height:1.2;">${studioName}</div>
            <div style="font-size:11.5px; font-weight:600; color:#64748B; margin-top:2px;">Master Principal &amp; Founder</div>
          </div>
        </div>

        <!-- Center: Official Tailor Pro Logo & Subtitle -->
        <div style="text-align:center;">
          <div class="center-logo-box">
            <img src="${TAILOR_PRO_LOGO_BASE64}" alt="Tailor Pro Logo" />
          </div>
          <div style="font-size:11.5px; font-weight:900; color:#072C27; letter-spacing:4px; text-transform:uppercase; margin-top:4px; text-align:center;">TAILOR PRO</div>
        </div>

        <!-- Right: Mokars Tech Corp & Corporate Logo -->
        <div style="display:flex; align-items:center; gap:14px; justify-content:flex-end;">
          <div style="text-align:right;">
            <div style="font-family:'Outfit',sans-serif; font-size:17px; font-weight:900; color:#072C27; text-transform:uppercase; line-height:1.2;">MOKARS TECH CORP</div>
            <div style="font-size:11.5px; font-weight:600; color:#64748B; margin-top:2px;">Engineering Suite</div>
          </div>
          <div class="corp-logo-box">
            <img src="${MOKARS_TECH_LOGO_BASE64}" alt="Mokars Tech Corp Logo" />
          </div>
        </div>
      </div>

      <!-- Center Title Area -->
      <div class="cert-heading-area">
        <h1 class="cert-title-main">MASTER CRAFTSMAN</h1>
        <div class="cert-title-sub">C E R T I F I C A T E &nbsp; O F &nbsp; T A I L O R I N G &nbsp; E X C E L L E N C E</div>
        <div class="cert-grant-text">T H I S &nbsp; O F F I C I A L &nbsp; A C C R E D I T A T I O N &nbsp; I S &nbsp; G R A N T E D &nbsp; T O</div>
      </div>

      <!-- Recipient Area with Gold Accent Underline -->
      <div class="recipient-area">
        <div class="recipient-name">${recipientTitle.toUpperCase()}</div>
        <div class="recipient-underline"></div>
      </div>

      <!-- Body Narrative Description -->
      <div class="cert-body-area">
        <p class="cert-description">
          is hereby certified as an accredited <strong style="color:#072C27; font-weight:800;">Master Tailor &amp; Studio Principal of ${studioName}</strong>, recognized for exemplary craftsmanship, CAD silhouette blueprinting, and digital fashion studio leadership authorized by <strong style="color:#072C27; font-weight:800;">Mokars Tech Corp (MTC)</strong> and <strong style="color:#072C27; font-weight:800;">Tailor Pro Engineering Suite</strong>.
        </p>
      </div>

      <!-- 4 Highlighted Credential Cards -->
      <div class="credentials-card">
        <div class="cred-item">
          <span class="cred-label">📅 GRADUATION DATE</span>
          <p class="cred-value">${issueDate}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">✂️ MASTER TRAINER</span>
          <p class="cred-value">${masterTrainer.toUpperCase()}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">📍 GRADUATION STUDIO</span>
          <p class="cred-value">${studioName.toUpperCase()}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">👥 CERTIFICATION</span>
          <p class="cred-value">Master Studio Principal</p>
        </div>
      </div>

      <!-- Bottom Dual Signatures & Scannable QR Matrix -->
      <div class="footer-row">
        <!-- Left: CEO Signature -->
        <div class="sig-block" style="align-items:flex-start; text-align:left;">
          <div class="sig-name">${ceoName.toUpperCase()}</div>
          <div class="sig-line"></div>
          <div class="sig-title">CEO, MOKARS TECH CORP<br/>(MTC)</div>
        </div>

        <!-- Center: Verification QR Badge -->
        <div class="qr-container">
          <div class="qr-img-box">
            <img src="${qrCodeUrl}" alt="QR Verification" />
          </div>
          <div class="qr-details">
            <div class="qr-status">
              <span>🟢</span>
              <span>100% VERIFIED</span>
            </div>
            <div class="qr-code-text">${certCode}</div>
            <div class="qr-scan-label">SCAN TO VERIFY CERTIFICATE</div>
          </div>
        </div>

        <!-- Right: Master Trainer Signature -->
        <div class="sig-block" style="align-items:flex-end; text-align:right;">
          <div class="sig-name">${masterTrainer.toUpperCase()}</div>
          <div class="sig-line" style="margin-left:auto;"></div>
          <div class="sig-title">MASTER DESIGNER &amp; TRAINER<br/>(${studioName})</div>
        </div>
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
    studioLogoUrl
  } = params;

  const studioLogoSrc = resolveImageSrc(studioLogoUrl, TAILOR_PRO_LOGO_BASE64);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apprentice Certificate — ${apprenticeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@1,700;1,800;1,900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap');
    
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
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      background: #041916;
      color: #072C27;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 15px;
    }
    .cert-page {
      background: #FFFFFF;
      width: 297mm;
      min-height: 210mm;
      max-width: 100%;
      padding: 10mm 14mm 10mm 14mm;
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
      z-index: 5;
    }
    .corner-tl {
      position: absolute;
      top: 14px;
      left: 14px;
      width: 32px;
      height: 32px;
      border-top: 2.5px solid #DCA134;
      border-left: 2.5px solid #DCA134;
      border-top-left-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-tr {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-top: 2.5px solid #DCA134;
      border-right: 2.5px solid #DCA134;
      border-top-right-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-bl {
      position: absolute;
      bottom: 14px;
      left: 14px;
      width: 32px;
      height: 32px;
      border-bottom: 2.5px solid #DCA134;
      border-left: 2.5px solid #DCA134;
      border-bottom-left-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .corner-br {
      position: absolute;
      bottom: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-bottom: 2.5px solid #DCA134;
      border-right: 2.5px solid #DCA134;
      border-bottom-right-radius: 10px;
      z-index: 6;
      pointer-events: none;
    }
    .accent-triangle {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 120px;
      background: #072C27;
      clip-path: polygon(0 0, 100% 0, 20% 100%, 0% 100%);
      -webkit-clip-path: polygon(0 0, 100% 0, 20% 100%, 0% 100%);
      z-index: 1;
    }
    .accent-gold {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 132px;
      background: #DCA134;
      clip-path: polygon(0 0, 100% 0, 22% 100%, 0% 100%);
      -webkit-clip-path: polygon(0 0, 100% 0, 22% 100%, 0% 100%);
      z-index: 0;
    }
    .cert-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      gap: 8px;
    }
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }
    .brand-logo-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .brand-logo-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .center-logo-box {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: #072C27;
      border: 3.5px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    }
    .center-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .corp-logo-box {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 3px solid #DCA134;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .corp-logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .cert-heading-area {
      text-align: center;
      margin: 4px 0 2px 0;
    }
    .cert-title-main {
      font-family: 'Outfit', sans-serif;
      font-size: 44px;
      font-weight: 900;
      color: #072C27;
      text-transform: uppercase;
      letter-spacing: 5px;
      margin: 0;
      line-height: 1;
    }
    .cert-title-sub {
      font-family: 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #DCA134;
      letter-spacing: 6px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .cert-grant-text {
      font-family: 'Outfit', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      color: #1E293B;
      letter-spacing: 5px;
      text-transform: uppercase;
      margin-top: 7px;
    }
    .recipient-area {
      text-align: center;
      margin: 4px 0;
    }
    .recipient-name {
      font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
      font-size: 38px;
      font-weight: 900;
      color: #072C27;
      text-transform: uppercase;
      letter-spacing: 2px;
      display: inline-block;
      line-height: 1.1;
      padding: 0 15px;
    }
    .recipient-underline {
      height: 5px;
      width: 100%;
      max-width: 580px;
      background: #DCA134;
      border-radius: 3px;
      margin: 6px auto 0;
    }
    .cert-body-area {
      text-align: center;
      padding: 6px 20px;
      margin: 4px 0;
    }
    .cert-description {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 15.5px;
      font-weight: 600;
      color: #1E293B;
      line-height: 1.85;
      letter-spacing: 0.3px;
      max-width: 900px;
      margin: 0 auto;
    }
    .credentials-card {
      background: #FAFAFA;
      border: 2px solid rgba(220, 161, 52, 0.8);
      border-radius: 14px;
      padding: 9px 16px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 3px 0;
    }
    .cred-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 8px;
    }
    .cred-item:not(:last-child) {
      border-right: 1.5px solid rgba(220, 161, 52, 0.4);
    }
    .cred-label {
      font-size: 10px;
      font-weight: 900;
      color: #DCA134;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .cred-value {
      font-size: 13px;
      font-weight: 900;
      color: #072C27;
      margin-top: 3px;
      line-height: 1.25;
    }
    .footer-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 15px;
      border-top: 1.5px solid rgba(220, 161, 52, 0.5);
      padding-top: 8px;
      margin-top: 2px;
    }
    .sig-block {
      display: flex;
      flex-direction: column;
    }
    .sig-name {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-weight: 900;
      font-size: 17px;
      color: #072C27;
      text-transform: uppercase;
      line-height: 1;
    }
    .sig-line {
      height: 2px;
      width: 170px;
      background: #072C27;
      margin: 5px 0;
      border-radius: 2px;
    }
    .sig-title {
      font-size: 9px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.3;
    }
    .qr-container {
      background: #FFFFFF;
      border: 2px solid #DCA134;
      border-radius: 14px;
      padding: 5px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .qr-img-box {
      width: 50px;
      height: 50px;
      border: 1px solid #CBD5E1;
      border-radius: 8px;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
      flex-shrink: 0;
    }
    .qr-img-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .qr-details {
      display: flex;
      flex-direction: column;
      text-align: left;
      line-height: 1.2;
    }
    .qr-status {
      font-size: 10px;
      font-weight: 900;
      color: #059669;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .qr-code-text {
      font-family: monospace;
      font-size: 11px;
      font-weight: 900;
      color: #072C27;
      margin: 1.5px 0;
    }
    .qr-scan-label {
      font-size: 8px;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    @media print {
      body { background: transparent !important; padding: 0 !important; margin: 0 !important; }
      .no-print { display: none !important; }
      .cert-page {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 297mm !important;
        height: 210mm !important;
        min-height: 210mm !important;
        max-width: 297mm !important;
        max-height: 210mm !important;
        margin: 0 !important;
        padding: 12mm 16mm !important;
        border: 4.5px solid #DCA134 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Print / Save button for screen viewing -->
  <div class="no-print" style="position:fixed; top:12px; right:12px; z-index:9999;">
    <button onclick="window.print()" style="background:#DCA134; color:#072C27; border:none; padding:8px 16px; border-radius:10px; font-family:'Outfit',sans-serif; font-weight:900; font-size:12px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.25); text-transform:uppercase; letter-spacing:1px; display:flex; align-items:center; gap:6px;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="cert-page">
    <div class="frame-border"></div>
    <div class="corner-tl"></div>
    <div class="corner-tr"></div>
    <div class="corner-bl"></div>
    <div class="corner-br"></div>
    <div class="accent-gold"></div>
    <div class="accent-triangle"></div>

    <div class="cert-content">
      <!-- Top Header Row -->
      <div class="header-row">
        <!-- Left: Studio Logo & Name -->
        <div style="display:flex; align-items:center; gap:14px; z-index:2;">
          <div class="brand-logo-circle">
            <img src="${studioLogoSrc}" alt="Studio Logo" onerror="this.src='${TAILOR_PRO_LOGO_BASE64}';" />
          </div>
          <div>
            <div style="font-family:'Outfit',sans-serif; font-size:17px; font-weight:900; color:#072C27; text-transform:uppercase; letter-spacing:0.5px; line-height:1.2;">${studioName}</div>
            <div style="font-size:11.5px; font-weight:600; color:#64748B; margin-top:2px;">Graduating Atelier</div>
          </div>
        </div>

        <!-- Center: Official Tailor Pro Logo & Subtitle -->
        <div style="text-align:center;">
          <div class="center-logo-box">
            <img src="${TAILOR_PRO_LOGO_BASE64}" alt="Tailor Pro Logo" />
          </div>
          <div style="font-size:11.5px; font-weight:900; color:#072C27; letter-spacing:4px; text-transform:uppercase; margin-top:4px; text-align:center;">TAILOR PRO</div>
        </div>

        <!-- Right: Mokars Tech Corp & Corporate Logo -->
        <div style="display:flex; align-items:center; gap:14px; justify-content:flex-end;">
          <div style="text-align:right;">
            <div style="font-family:'Outfit',sans-serif; font-size:17px; font-weight:900; color:#072C27; text-transform:uppercase; line-height:1.2;">MOKARS TECH CORP</div>
            <div style="font-size:11.5px; font-weight:600; color:#64748B; margin-top:2px;">Engineering Suite</div>
          </div>
          <div class="corp-logo-box">
            <img src="${MOKARS_TECH_LOGO_BASE64}" alt="Mokars Tech Corp Logo" />
          </div>
        </div>
      </div>

      <!-- Center Title Area -->
      <div class="cert-heading-area">
        <h1 class="cert-title-main">CERTIFICATE</h1>
        <div class="cert-title-sub">O F &nbsp; P R O F I C I E N C Y &nbsp; A N D &nbsp; G R A D U A T I O N</div>
        <div class="cert-grant-text">T H I S &nbsp; O F F I C I A L &nbsp; D I P L O M A &nbsp; I S &nbsp; A W A R D E D &nbsp; T O</div>
      </div>

      <!-- Recipient Area with Gold Accent Underline -->
      <div class="recipient-area">
        <div class="recipient-name">${apprenticeName.toUpperCase()}</div>
        <div class="recipient-underline"></div>
      </div>

      <!-- Body Narrative Description -->
      <div class="cert-body-area">
        <p class="cert-description">
          having successfully completed <strong style="color:#072C27; font-weight:800;">${hoursCompleted} hours</strong> of intensive CAD blueprint drafting, garment pattern cutting, and bespoke tailoring in <strong style="color:#072C27; font-weight:800;">${specialty}</strong> under the direct mentorship of <strong style="color:#072C27; font-weight:800;">${masterTrainer}</strong> at <strong style="color:#072C27; font-weight:800;">${studioName}</strong>.
        </p>
      </div>

      <!-- 4 Highlighted Credential Cards -->
      <div class="credentials-card">
        <div class="cred-item">
          <span class="cred-label">📅 GRADUATION DATE</span>
          <p class="cred-value">${issueDate}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">✂️ MASTER TRAINER</span>
          <p class="cred-value">${masterTrainer.toUpperCase()}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">📍 GRADUATION STUDIO</span>
          <p class="cred-value">${studioName.toUpperCase()}</p>
        </div>
        <div class="cred-item">
          <span class="cred-label">👥 CERTIFICATION</span>
          <p class="cred-value">Accredited Bespoke Tailor</p>
        </div>
      </div>

      <!-- Bottom Dual Signatures & Scannable QR Matrix -->
      <div class="footer-row">
        <!-- Left: CEO Signature -->
        <div class="sig-block" style="align-items:flex-start; text-align:left;">
          <div class="sig-name">MUBARIK TUAHIR ALI</div>
          <div class="sig-line"></div>
          <div class="sig-title">CEO, MOKARS TECH CORP<br/>(MTC)</div>
        </div>

        <!-- Center: Verification QR Badge -->
        <div class="qr-container">
          <div class="qr-img-box">
            <img src="${qrCodeUrl}" alt="QR Verification" />
          </div>
          <div class="qr-details">
            <div class="qr-status">
              <span>🟢</span>
              <span>100% VERIFIED</span>
            </div>
            <div class="qr-code-text">${certCode}</div>
            <div class="qr-scan-label">SCAN TO VERIFY CERTIFICATE</div>
          </div>
        </div>

        <!-- Right: Master Trainer Signature -->
        <div class="sig-block" style="align-items:flex-end; text-align:right;">
          <div class="sig-name">${masterTrainer.toUpperCase()}</div>
          <div class="sig-line" style="margin-left:auto;"></div>
          <div class="sig-title">MASTER DESIGNER &amp; TRAINER<br/>(${studioName})</div>
        </div>
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
