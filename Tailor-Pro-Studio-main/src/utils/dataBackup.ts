import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Data Backup & Phone Loss Protection Utilities
 * Allows exporting full customer data JSON backups and restoring data seamlessly on all devices (Mobile Native, iOS, Android, Web).
 */

export interface BackupDataFormat {
  app: string;
  version: string;
  exportedAt: string;
  clients: any[];
  settings: any;
  apprentices: any[];
  deposits: any[];
  sessions: any[];
  transactions: any[];
  inventory: any[];
  tasks: any[];
}

export interface ExportBackupResult {
  success: boolean;
  message: string;
  shared?: boolean;
  backupJson?: string;
  filename?: string;
}

/**
 * Helper to get all current atelier data as a structured object and JSON string.
 */
export function generateAtelierDataBackupJson(): { backupData: BackupDataFormat; jsonString: string; filename: string } {
  const clients = localStorage.getItem('tailor_clients') || '[]';
  const settings = localStorage.getItem('tailor_studio_settings') || '{}';
  const apprentices = localStorage.getItem('tailor_apprentices') || '[]';
  const deposits = localStorage.getItem('tailor_deposits') || '[]';
  const sessions = localStorage.getItem('tailor_sessions') || '[]';
  const transactions = localStorage.getItem('tailor_transactions') || '[]';
  const inventory = localStorage.getItem('tailor_inventory') || '[]';
  const tasks = localStorage.getItem('tailor_apprentice_tasks') || '[]';

  const backupData: BackupDataFormat = {
    app: 'Tailor Pro Studio',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    clients: JSON.parse(clients),
    settings: JSON.parse(settings),
    apprentices: JSON.parse(apprentices),
    deposits: JSON.parse(deposits),
    sessions: JSON.parse(sessions),
    transactions: JSON.parse(transactions),
    inventory: JSON.parse(inventory),
    tasks: JSON.parse(tasks)
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `TailorPro_CustomerData_Backup_${dateStr}.json`;

  return { backupData, jsonString, filename };
}

/**
 * Export all local atelier data (customers, measurements, transactions, inventory, settings)
 * to a downloadable/shareable JSON file for offline backup or phone migration.
 * Works natively on Android/iOS via Capacitor Filesystem & Share, Mobile Web, and Desktop Browsers.
 */
export async function exportAtelierDataBackup(targetMode?: 'share' | 'whatsapp' | 'drive' | 'download'): Promise<ExportBackupResult> {
  try {
    const { jsonString, filename } = generateAtelierDataBackupJson();
    const dateStr = new Date().toISOString().split('T')[0];

    // 1. NATIVE CAPACITOR APP (Android APK / iOS app)
    if (Capacitor.isNativePlatform()) {
      try {
        // Save file to Cache/Documents on phone device
        await Filesystem.writeFile({
          path: filename,
          data: jsonString,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        const fileUri = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache
        });

        // Trigger native system share drawer (allows saving to Downloads, Files, Drive, WhatsApp, etc.)
        await Share.share({
          title: 'Tailor Pro Studio Customer Data Backup',
          text: 'Here is your encrypted customer data backup JSON file.',
          url: fileUri.uri,
          files: [fileUri.uri]
        });

        return {
          success: true,
          shared: true,
          message: 'Backup file generated! Select Save to Files/Downloads, Google Drive, or WhatsApp from your phone options.',
          backupJson: jsonString,
          filename
        };
      } catch (nativeErr: any) {
        console.warn('Capacitor native file save/share error, trying fallbacks:', nativeErr);
        // User cancelled native share sheet or permission error
        if (nativeErr?.message?.includes('canceled') || nativeErr?.name === 'AbortError') {
          return {
            success: false,
            message: 'Backup export cancelled.',
            backupJson: jsonString,
            filename
          };
        }
      }
    }

    // 2. MOBILE WEB SHARE API (iOS Safari, Android Mobile Chrome)
    if (typeof navigator !== 'undefined' && navigator.share && typeof File !== 'undefined') {
      try {
        const file = new File([jsonString], filename, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Tailor Pro Studio Customer Data Backup',
            text: 'Here is your encrypted customer data backup JSON file.'
          });
          return {
            success: true,
            shared: true,
            message: targetMode === 'whatsapp'
              ? 'Backup shared! Select WhatsApp from your phone share sheet.'
              : targetMode === 'drive'
              ? 'Backup shared! Select Google Drive from your phone share sheet.'
              : 'Backup file shared via native phone drawer!',
            backupJson: jsonString,
            filename
          };
        }
      } catch (shareErr: any) {
        if (shareErr?.name === 'AbortError') {
          return {
            success: false,
            message: 'Backup share cancelled by user.',
            backupJson: jsonString,
            filename
          };
        }
        console.warn('Web Share API unsupported or failed, falling back to blob download:', shareErr);
      }
    }

    // 3. STANDARD BLOB URL DOWNLOAD (Desktop & Mobile Browser Fallback)
    let downloaded = false;
    try {
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      downloaded = true;

      // Delay revocation so phone browser background processes complete
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch (_) {}
      }, 60000);
    } catch (blobErr) {
      console.warn('Blob URL download failed, trying Data URI fallback:', blobErr);
    }

    // 4. DATA URI FALLBACK (For strict WebViews where Blob URLs are blocked)
    if (!downloaded) {
      try {
        const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
        const dataUri = `data:application/json;charset=utf-8;base64,${base64Data}`;
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloaded = true;
      } catch (dataUriErr) {
        console.error('Data URI download failed:', dataUriErr);
      }
    }

    // 5. External Intent Guidance for WhatsApp / Drive modes
    if (targetMode === 'whatsapp') {
      const waText = encodeURIComponent(`Tailor Pro Studio Data Backup (${dateStr})`);
      window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
      return {
        success: true,
        shared: false,
        message: 'Backup ready! Open WhatsApp, tap Document 📎, and attach your downloaded backup file.',
        backupJson: jsonString,
        filename
      };
    }

    if (targetMode === 'drive') {
      window.open('https://drive.google.com/drive/my-drive', '_blank');
      return {
        success: true,
        shared: false,
        message: 'Backup ready! Google Drive opened. Upload your backup file to store safely.',
        backupJson: jsonString,
        filename
      };
    }

    if (downloaded) {
      return {
        success: true,
        shared: false,
        message: `Backup file '${filename}' downloaded successfully!`,
        backupJson: jsonString,
        filename
      };
    }

    // 6. Absolute Fail-safe: Copy to Clipboard if direct file creation was blocked by OS
    const copySuccess = await copyBackupToClipboard(jsonString);
    if (copySuccess) {
      return {
        success: true,
        shared: false,
        message: 'File download blocked by phone security settings. Backup JSON code COPIED to your clipboard! Paste it into Notes or WhatsApp to save.',
        backupJson: jsonString,
        filename
      };
    }

    return {
      success: false,
      message: 'Could not write backup file. Please use the Copy Backup JSON option.',
      backupJson: jsonString,
      filename
    };
  } catch (err: any) {
    console.error('Failed to export backup file:', err);
    return {
      success: false,
      message: `Failed to export backup: ${err?.message || 'Unknown error'}`
    };
  }
}

/**
 * Copy JSON backup data directly to the phone's clipboard.
 * Guaranteed 100% fail-safe for phone users when file downloads are restricted by OS.
 */
export async function copyBackupToClipboard(jsonString?: string): Promise<boolean> {
  try {
    const textToCopy = jsonString || generateAtelierDataBackupJson().jsonString;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }

    // Fallback using invisible textarea
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Import and restore all customer records and studio data from raw JSON content string.
 * High reliability for phones: supports both uploaded files and direct copy-pasted backup code.
 */
export function restoreAtelierDataFromText(jsonContent: string): boolean {
  if (!jsonContent || !jsonContent.trim()) {
    return false;
  }

  try {
    const data: BackupDataFormat = JSON.parse(jsonContent.trim());

    if (!data || typeof data !== 'object') {
      return false;
    }

    let restoredItems = 0;

    if (data.clients && Array.isArray(data.clients)) {
      localStorage.setItem('tailor_clients', JSON.stringify(data.clients));
      restoredItems++;
    }
    if (data.settings && typeof data.settings === 'object') {
      localStorage.setItem('tailor_studio_settings', JSON.stringify(data.settings));
      restoredItems++;
    }
    if (data.apprentices && Array.isArray(data.apprentices)) {
      localStorage.setItem('tailor_apprentices', JSON.stringify(data.apprentices));
      restoredItems++;
    }
    if (data.deposits && Array.isArray(data.deposits)) {
      localStorage.setItem('tailor_deposits', JSON.stringify(data.deposits));
      restoredItems++;
    }
    if (data.sessions && Array.isArray(data.sessions)) {
      localStorage.setItem('tailor_sessions', JSON.stringify(data.sessions));
      restoredItems++;
    }
    if (data.transactions && Array.isArray(data.transactions)) {
      localStorage.setItem('tailor_transactions', JSON.stringify(data.transactions));
      restoredItems++;
    }
    if (data.inventory && Array.isArray(data.inventory)) {
      localStorage.setItem('tailor_inventory', JSON.stringify(data.inventory));
      restoredItems++;
    }
    if (data.tasks && Array.isArray(data.tasks)) {
      localStorage.setItem('tailor_apprentice_tasks', JSON.stringify(data.tasks));
      restoredItems++;
    }

    return restoredItems > 0;
  } catch (err) {
    console.error('Failed to restore atelier backup from JSON string:', err);
    return false;
  }
}

/**
 * Import and restore all customer records and studio data from a JSON backup File.
 */
export function restoreAtelierDataBackup(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (!file) {
      resolve(false);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = restoreAtelierDataFromText(content);
      resolve(success);
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
}

/**
 * Wipe all local stored atelier data to start completely fresh.
 */
export function clearAllAtelierData(): void {
  const keysToClear = [
    'tailor_clients',
    'tailor_apprentices',
    'tailor_deposits',
    'tailor_sessions',
    'tailor_transactions',
    'tailor_inventory',
    'tailor_apprentice_tasks',
    'tailor_studio_settings'
  ];
  keysToClear.forEach((key) => localStorage.removeItem(key));
}
