import React, { useState, useRef, useEffect } from 'react';
import { X, Printer, Upload, CreditCard, User, Calendar, MapPin, BadgeCheck, Hash, Layers, Sparkles, Camera } from 'lucide-react';
import { StudioSettings } from '../../types';

interface TailorProMembershipCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioSettings?: StudioSettings;
  userRole?: string;
}

export const TailorProMembershipCardModal: React.FC<TailorProMembershipCardModalProps> = ({
  isOpen,
  onClose,
  studioSettings,
  userRole = 'VIP Master Tailor & Designer'
}) => {
  // Helper to format today's date automatically
  const getFormattedTodayDate = () => {
    try {
      return new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '19th August, 2026';
    }
  };

  // Helper to clean up verbose role strings for badge display
  const formatCleanBadgeRole = (roleStr?: string) => {
    if (!roleStr) return 'VIP MASTER TAILOR & DESIGNER';
    if (roleStr.includes('Master')) return 'MASTER STUDIO OWNER';
    if (roleStr.includes('Head Designer')) return 'HEAD TAILOR & DESIGNER';
    if (roleStr.includes('Apprentice')) return 'APPRENTICE TAILOR';
    return roleStr.replace(/\s*\([^)]*\)/g, '').toUpperCase();
  };

  const formatCleanDetailRole = (roleStr?: string) => {
    if (!roleStr) return 'Master Tailor & Designer';
    if (roleStr.includes('Master')) return 'Master Studio Owner';
    if (roleStr.includes('Head Designer')) return 'Head Designer';
    if (roleStr.includes('Apprentice')) return 'Apprentice Trainee';
    return roleStr.replace(/\s*\([^)]*\)/g, '');
  };

  // Auto-populated Fields from App State / User Login
  const [memberName, setMemberName] = useState<string>(() => studioSettings?.ownerName || 'KAUSARA MOHAMMED');
  const [idNumber, setIdNumber] = useState<string>(() => studioSettings?.pairCode || 'TPW-2026-8892');
  const [category, setCategory] = useState<string>(() => userRole || 'VIP MASTER TAILOR & DESIGNER');
  const [issueDate, setIssueDate] = useState<string>(() => getFormattedTodayDate());
  const [venue, setVenue] = useState<string>(() => studioSettings?.studioName || 'MOKARS STITCHES STUDIO');
  const [studioBrandTitle, setStudioBrandTitle] = useState<string>(() => studioSettings?.studioName || 'MOKARS STITCHES STUDIO');
  
  // Logos & Photos (Photo is uploaded by user)
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [studioLogoUrl, setStudioLogoUrl] = useState<string>(() => studioSettings?.logoUrl || '/tailor_pro_logo.jpg');
  const [appLogoUrl, setAppLogoUrl] = useState<string>('/tailor_pro_logo.jpg');

  // Update states if studioSettings or userRole props change
  useEffect(() => {
    if (studioSettings?.ownerName) setMemberName(studioSettings.ownerName);
    if (studioSettings?.pairCode) setIdNumber(studioSettings.pairCode);
    if (studioSettings?.studioName) {
      setVenue(studioSettings.studioName);
      setStudioBrandTitle(studioSettings.studioName);
    }
    if (studioSettings?.logoUrl) setStudioLogoUrl(studioSettings.logoUrl);
    if (userRole) setCategory(userRole);
  }, [studioSettings, userRole]);

  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Open Self-Contained Perfect 1-Page Printable PDF & Badge Popup
  const handlePrintCard = () => {
    const printWin = window.open('', '_blank', 'width=780,height=920');
    if (!printWin) return;

    const effectiveStudioLogo = studioLogoUrl || `${window.location.origin}/tailor_pro_logo.jpg`;
    const effectiveAppLogo = appLogoUrl || `${window.location.origin}/tailor_pro_logo.jpg`;
    const badgeRoleTitle = formatCleanBadgeRole(category);
    const detailRoleTitle = formatCleanDetailRole(category);

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <base href="${window.location.origin}/" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tailor Pro Official Membership Badge — ${memberName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=JetBrains+Mono:wght@700;800&family=Outfit:wght@400;600;700;800;900&display=swap');

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #041614;
            color: #0F2D2A;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 65px 20px 20px 20px;
          }

          .top-bar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: rgba(4, 22, 20, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 2px solid #DCA134;
            padding: 12px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .btn-print {
            background: linear-gradient(135deg, #DCA134, #C98A2B);
            color: #041614;
            font-weight: 900;
            font-size: 12px;
            padding: 8px 22px;
            border-radius: 99px;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(220,161,52,0.4);
          }

          .btn-close {
            background: rgba(255,255,255,0.15);
            color: #FFFFFF;
            font-weight: 800;
            font-size: 12px;
            padding: 8px 16px;
            border-radius: 99px;
            border: 1px solid rgba(255,255,255,0.3);
            cursor: pointer;
          }

          /* Badge Card Frame */
          .badge-card {
            width: 375px;
            max-width: 100%;
            height: 660px;
            background: linear-gradient(180deg, #FFFFFF 0%, #F4F7F6 100%);
            border-radius: 28px;
            border: 5px solid #DCA134;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            margin: 0 auto;
          }

          /* Header */
          .badge-header {
            background: linear-gradient(180deg, #0D3B36 0%, #061E1B 100%);
            color: #FFFFFF;
            padding: 12px 16px 14px 16px;
            text-align: center;
            border-bottom: 3.5px solid #DCA134;
            border-radius: 0 0 20px 20px;
            position: relative;
          }

          .lanyard-hole {
            width: 56px;
            height: 11px;
            background: #041614;
            border: 2px solid #DCA134;
            border-radius: 99px;
            margin: 0 auto 8px auto;
          }

          .logos-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
          }

          .logo-box {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: #041614;
            border: 2px solid #DCA134;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .logo-box img { width: 100%; height: 100%; object-fit: cover; }

          .header-text {
            flex: 1;
            text-align: center;
          }
          .studio-title {
            font-family: 'Cinzel', serif;
            font-size: 13.5px;
            font-weight: 900;
            color: #DCA134;
            text-transform: uppercase;
            line-height: 1.15;
          }
          .studio-sub {
            font-size: 7.5px;
            font-weight: 800;
            color: #CBD5E1;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            margin-top: 2px;
          }

          .pill-banner {
            display: inline-block;
            background: linear-gradient(135deg, #DCA134 0%, #C98A2B 100%);
            color: #041614;
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            padding: 3.5px 16px;
            border-radius: 99px;
          }

          /* Photo & Role Section */
          .photo-section {
            padding: 16px 14px 8px 14px;
            text-align: center;
          }

          .avatar-wrapper {
            position: relative;
            width: 124px;
            height: 124px;
            margin: 0 auto 8px auto;
          }

          .avatar-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #E2E8F0;
            border: 4px solid #DCA134;
            box-shadow: 0 8px 20px rgba(6,30,27,0.22);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .avatar-circle img { width: 100%; height: 100%; object-fit: cover; }

          /* Dark Green Circular Sparkle Corner Badge matching uploaded icon */
          .corner-sparkle-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #041614;
            border: 2px solid #FFFFFF;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .role-title {
            font-size: 14.5px;
            font-weight: 900;
            color: #0D3B36;
            text-transform: uppercase;
            letter-spacing: 1px;
            line-height: 1.2;
          }

          .verified-line {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 9px;
            font-weight: 800;
            color: #DCA134;
            letter-spacing: 1.8px;
            margin: 4px 0 10px 0;
          }
          .verified-line::before, .verified-line::after {
            content: '';
            width: 36px;
            height: 1.5px;
            background: #DCA134;
          }

          /* Details Rows */
          .details-box {
            padding: 0 18px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
            flex-grow: 1;
            justify-content: center;
          }

          .detail-row {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-left: 4px solid #DCA134;
            border-radius: 12px;
            padding: 7px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11.5px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
          }

          .detail-left {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 10px;
            font-weight: 900;
            color: #64748B;
            text-transform: uppercase;
          }

          .icon-bubble {
            width: 26px;
            height: 26px;
            border-radius: 8px;
            background: #EBF5F0;
            color: #0D3B36;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .detail-val {
            font-weight: 800;
            color: #0D3B36;
            text-align: right;
            max-width: 170px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .detail-val.mono {
            font-family: 'JetBrains Mono', monospace;
            color: #DCA134;
            background: #061E1B;
            padding: 2px 8px;
            border-radius: 5px;
            font-size: 11px;
          }

          /* Footer */
          .badge-footer {
            background: linear-gradient(180deg, #0D3B36 0%, #041614 100%);
            border-top: 3.5px solid #DCA134;
            padding: 10px 12px 12px 12px;
            text-align: center;
          }

          .slogan {
            font-size: 10px;
            font-weight: 900;
            color: #DCA134;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            margin-bottom: 6px;
          }

          .barcode-wrap {
            background: #FFFFFF;
            padding: 4px 12px;
            border-radius: 8px;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5px;
          }

          .barcode-bar {
            width: 160px;
            height: 20px;
            background: repeating-linear-gradient(
              90deg,
              #000 0, #000 2px,
              #fff 2px, #fff 4px,
              #000 4px, #000 7px,
              #fff 7px, #fff 9px,
              #000 9px, #000 10px,
              #fff 10px, #fff 13px,
              #000 13px, #000 16px
            );
          }

          .barcode-num {
            font-family: 'JetBrains Mono', monospace;
            font-size: 8.5px;
            font-weight: 800;
            color: #041614;
            letter-spacing: 1.8px;
          }

          /* Strict 1-Page Print Media Rule */
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media (max-width: 480px) {
            body {
              padding: 55px 10px 15px 10px !important;
            }
            .top-bar {
              padding: 8px 12px !important;
              flex-wrap: wrap !important;
              gap: 6px !important;
            }
            .top-bar > div:first-child {
              font-size: 10px !important;
              width: 100% !important;
              text-align: center !important;
            }
            .top-bar > div:last-child {
              width: 100% !important;
              justify-content: center !important;
            }
            .btn-print, .btn-close {
              padding: 6px 14px !important;
              font-size: 11px !important;
            }
            .badge-card {
              width: 100% !important;
              max-width: 350px !important;
              height: auto !important;
              min-height: 600px !important;
              border-width: 3.5px !important;
              border-radius: 22px !important;
            }
            .avatar-wrapper {
              width: 100px !important;
              height: 100px !important;
            }
            .details-box {
              padding: 0 10px !important;
              gap: 6px !important;
            }
            .detail-row {
              padding: 5px 8px !important;
              font-size: 10.5px !important;
            }
            .detail-val {
              max-width: 120px !important;
              font-size: 10.5px !important;
            }
          }

          @media print {
            .no-print { display: none !important; }
            html, body {
              background: #FFFFFF !important;
              padding: 0 !important;
              margin: 0 !important;
              height: auto !important;
            }
            .badge-card {
              box-shadow: none !important;
              margin: 10px auto !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>

        <!-- Sticky Navigation & Print Bar -->
        <div class="top-bar no-print">
          <div style="color: #DCA134; font-weight: 900; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase;">
            ★ TAILOR PRO VIP MEMBERSHIP BADGE PRINT PREVIEW
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" class="btn-print">
              🖨️ Print Badge / Save PDF
            </button>
            <button onclick="window.close()" class="btn-close">
              ✕ Close
            </button>
          </div>
        </div>

        <!-- Single Page Printable Badge Card -->
        <div class="badge-card">
          
          <!-- Header -->
          <div class="badge-header">
            <div class="lanyard-hole"></div>

            <div class="logos-row">
              <div class="logo-box">
                <img src="${effectiveStudioLogo}" alt="Studio Logo" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div style="display:none; width:100%; height:100%; background:#041614; color:#DCA134; align-items:center; justify-content:center; font-weight:900; font-size:16px;">M</div>
              </div>

              <div class="header-text">
                <div class="studio-title">${studioBrandTitle}</div>
                <div class="studio-sub">AUTHENTICATED TAILORING ATELIER</div>
              </div>

              <div class="logo-box">
                <img src="${effectiveAppLogo}" alt="Tailor Pro Logo" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div style="display:none; width:100%; height:100%; background:#041614; color:#DCA134; align-items:center; justify-content:center; font-weight:900; font-size:14px;">TP</div>
              </div>
            </div>

            <div class="pill-banner">★ OFFICIAL MEMBERSHIP & ID BADGE ★</div>
          </div>

          <!-- Photo & Role -->
          <div class="photo-section">
            <div class="avatar-wrapper">
              <div class="avatar-circle">
                ${avatarUrl ? `<img src="${avatarUrl}" alt="${memberName}" />` : `
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                `}
              </div>
              <div class="corner-sparkle-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>

            <div class="role-title">${badgeRoleTitle}</div>
            <div class="verified-line">VERIFIED MEMBER</div>
          </div>

          <!-- Details Rows with Modern Lucide SVG Icon Bubbles -->
          <div class="details-box">
            <div class="detail-row">
              <div class="detail-left">
                <div class="icon-bubble">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <span>MEMBER NAME</span>
              </div>
              <div class="detail-val">${memberName}</div>
            </div>

            <div class="detail-row">
              <div class="detail-left">
                <div class="icon-bubble">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                </div>
                <span>BADGE ID</span>
              </div>
              <div class="detail-val mono">${idNumber}</div>
            </div>

            <div class="detail-row">
              <div class="detail-left">
                <div class="icon-bubble">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                </div>
                <span>ROLE / CLASS</span>
              </div>
              <div class="detail-val">${detailRoleTitle}</div>
            </div>

            <div class="detail-row">
              <div class="detail-left">
                <div class="icon-bubble">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <span>ISSUE DATE</span>
              </div>
              <div class="detail-val">${issueDate}</div>
            </div>

            <div class="detail-row">
              <div class="detail-left">
                <div class="icon-bubble">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <span>LOCATION</span>
              </div>
              <div class="detail-val">${venue}</div>
            </div>
          </div>

          <!-- Footer Barcode & Motto -->
          <div class="badge-footer">
            <div class="slogan">MODERNIZE YOUR CRAFT. GROW YOUR BUSINESS.</div>

            <div class="barcode-wrap">
              <div class="barcode-bar"></div>
              <div class="barcode-num">${idNumber}</div>
            </div>
          </div>

        </div>

      </body>
      </html>
    `);
    printWin.document.close();
  };

  const badgeRoleTitle = formatCleanBadgeRole(category);
  const detailRoleTitle = formatCleanDetailRole(category);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-start sm:justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none min-h-screen">
      <div className="w-full max-w-4xl my-auto space-y-3 sm:space-y-4 max-h-full">

        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900/95 border border-amber-400/30 rounded-2xl p-3 sm:px-4 sm:py-3 text-white shadow-2xl gap-2.5 sm:gap-3 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase text-amber-300 flex items-center gap-1.5 flex-wrap truncate">
                Official Tailor Pro Membership & ID Badge
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold truncate leading-tight">
                Auto-populated from studio settings. Upload participant photo below.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800 sm:border-transparent">
            <button
              type="button"
              onClick={handlePrintCard}
              className="flex-1 sm:flex-none px-3.5 sm:px-4.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#061E1B] text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer truncate"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Preview & Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0"
              title="Close Modal"
            >
              <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Live Interactive Card Preview Container */}
        <div className="flex flex-col items-center justify-center p-1 sm:p-2 w-full">
          
          {/* Quick Photo Upload Action Banner */}
          <div className="mb-2 sm:mb-3 flex flex-col xs:flex-row items-center justify-between gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 p-2.5 sm:px-4.5 sm:py-2.5 rounded-2xl text-[11px] sm:text-xs font-bold shadow-xs w-full max-w-[370px] text-center xs:text-left">
            <div className="flex items-center gap-2 min-w-0">
              <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400 shrink-0" />
              <span className="truncate">Upload participant photo:</span>
            </div>
            <label className="w-full xs:w-auto px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#061E1B] font-black text-[11px] sm:text-xs cursor-pointer transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>

          {/* Modal Preview Card */}
          <div
            ref={cardRef}
            className="w-full max-w-[370px] min-h-[600px] xs:h-[660px] bg-gradient-to-b from-white via-slate-50 to-slate-100 rounded-[24px] sm:rounded-[32px] border-[4px] sm:border-[5px] border-[#DCA134] shadow-2xl overflow-hidden flex flex-col justify-between relative font-['Outfit'] select-none transition-transform hover:scale-[1.01] my-1"
          >
            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#DCA134_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            {/* Header Top Section */}
            <div className="relative z-10 bg-gradient-to-b from-[#0D3B36] to-[#061E1B] text-white px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-4 text-center border-b-4 border-[#DCA134] rounded-b-[18px] sm:rounded-b-[22px] shadow-lg">
              
              {/* Lanyard Slot */}
              <div className="w-12 sm:w-14 h-2 sm:h-2.5 bg-[#041614] border-2 border-[#DCA134] rounded-full mx-auto mb-2 sm:mb-2.5 shadow-inner" />

              {/* Logos Row */}
              <div className="flex items-center justify-between gap-2 sm:gap-2.5 mb-1.5 sm:mb-2">
                {/* Studio Logo Left */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#041614] border-2 border-[#DCA134] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={studioLogoUrl || '/tailor_pro_logo.jpg'}
                    alt="Studio Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      if ((e.target as HTMLElement).nextElementSibling) {
                        ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-full h-full bg-[#041614] text-[#DCA134] items-center justify-center font-black text-sm sm:text-base">
                    M
                  </div>
                </div>

                {/* Studio Title Middle */}
                <div className="flex-1 min-w-0 text-center">
                  <h2 className="font-serif font-black text-[11px] sm:text-sm text-[#DCA134] tracking-wide uppercase leading-tight truncate">
                    {studioBrandTitle}
                  </h2>
                  <p className="text-[6.5px] sm:text-[7.5px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 truncate">
                    AUTHENTICATED TAILORING ATELIER
                  </p>
                </div>

                {/* Tailor Pro App Logo Right */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#041614] border-2 border-[#DCA134] overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={appLogoUrl || '/tailor_pro_logo.jpg'}
                    alt="Tailor Pro Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      if ((e.target as HTMLElement).nextElementSibling) {
                        ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-full h-full bg-[#041614] text-[#DCA134] items-center justify-center font-black text-xs">
                    TP
                  </div>
                </div>
              </div>

              {/* Official Badge Pill Banner */}
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#DCA134] to-[#C98A2B] text-[#041614] text-[8px] sm:text-[9px] font-black tracking-[1.5px] sm:tracking-[2px] uppercase px-3 sm:px-4 py-0.5 rounded-full shadow-md">
                <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#041614] shrink-0" />
                <span>OFFICIAL MEMBERSHIP & ID BADGE</span>
              </div>
            </div>

            {/* Photo & Security Badge Section */}
            <div className="relative z-10 pt-3 sm:pt-4 pb-1.5 sm:pb-2 text-center px-3 sm:px-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-1.5 sm:mb-2">
                <div className="w-full h-full rounded-full bg-slate-200 border-4 border-[#DCA134] ring-4 ring-white shadow-xl overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={memberName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 sm:w-16 sm:h-16 text-slate-400" />
                  )}
                </div>

                {/* Dark Green Circular Sparkle Corner Badge matching uploaded image */}
                <div className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#041614] border-2 border-white ring-1 ring-[#DCA134] flex items-center justify-center shadow-md">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#34D399]" />
                </div>
              </div>

              <h3 className="text-xs sm:text-base font-black text-[#0D3B36] uppercase tracking-wider leading-snug px-2 truncate">
                {badgeRoleTitle}
              </h3>

              <div className="flex items-center justify-center gap-2 my-1">
                <span className="w-8 sm:w-10 h-[1.5px] bg-gradient-to-r from-transparent to-[#DCA134]" />
                <span className="text-[8.5px] sm:text-[9px] font-extrabold text-[#DCA134] uppercase tracking-widest">VERIFIED MEMBER</span>
                <span className="w-8 sm:w-10 h-[1.5px] bg-gradient-to-l from-transparent to-[#DCA134]" />
              </div>
            </div>

            {/* Glassmorphic Details Cards */}
            <div className="relative z-10 px-3.5 sm:px-5 space-y-2 sm:space-y-2.5 my-auto py-1 flex-1 flex flex-col justify-center">
              <div className="bg-white border border-slate-200 border-l-4 border-l-[#DCA134] rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EBF5F0] text-[#0D3B36] flex items-center justify-center font-extrabold text-xs shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">MEMBER NAME</span>
                </div>
                <span className="text-[11px] sm:text-xs font-black text-[#0D3B36] truncate max-w-[130px] sm:max-w-[170px]">{memberName}</span>
              </div>

              <div className="bg-white border border-slate-200 border-l-4 border-l-[#DCA134] rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EBF5F0] text-[#0D3B36] flex items-center justify-center font-extrabold text-xs shrink-0">
                    <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">BADGE ID</span>
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-black text-[#DCA134] bg-[#061E1B] px-2 py-0.5 rounded-md tracking-wider">
                  {idNumber}
                </span>
              </div>

              <div className="bg-white border border-slate-200 border-l-4 border-l-[#DCA134] rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EBF5F0] text-[#0D3B36] flex items-center justify-center font-extrabold text-xs shrink-0">
                    <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">ROLE / CLASS</span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[170px]">{detailRoleTitle}</span>
              </div>

              <div className="bg-white border border-slate-200 border-l-4 border-l-[#DCA134] rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EBF5F0] text-[#0D3B36] flex items-center justify-center font-extrabold text-xs shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">ISSUE DATE</span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800">{issueDate}</span>
              </div>

              <div className="bg-white border border-slate-200 border-l-4 border-l-[#DCA134] rounded-xl p-2 sm:p-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EBF5F0] text-[#0D3B36] flex items-center justify-center font-extrabold text-xs shrink-0">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider">LOCATION</span>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate max-w-[130px] sm:max-w-[170px]">{venue}</span>
              </div>
            </div>

            {/* Footer Section */}
            <div className="relative z-10 bg-gradient-to-b from-[#0D3B36] to-[#041614] border-t-4 border-[#DCA134] p-2.5 sm:p-3 text-center text-white">
              <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#DCA134] uppercase mb-1 sm:mb-1.5">
                MODERNIZE YOUR CRAFT. GROW YOUR BUSINESS.
              </p>

              <div className="bg-white py-1 sm:py-1.5 px-3 sm:px-4 rounded-lg inline-flex flex-col items-center gap-0.5 shadow-sm">
                <div
                  className="w-32 sm:w-40 h-3.5 sm:h-4.5 bg-[#000]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px, #000 4px, #000 7px, #fff 7px, #fff 9px, #000 9px, #000 10px, #fff 10px, #fff 13px, #000 13px, #000 16px)'
                  }}
                />
                <span className="font-mono text-[8px] sm:text-[8.5px] font-bold text-slate-900 tracking-widest">
                  {idNumber}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
