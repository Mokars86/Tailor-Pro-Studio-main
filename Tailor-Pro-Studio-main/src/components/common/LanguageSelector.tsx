import React, { useState, useEffect } from 'react';
import { Globe, Check, X } from 'lucide-react';
import { useTranslation, SupportedLanguage } from '../../i18n/useTranslation';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  subtext: string;
  flag: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  direction: 'ltr' | 'rtl';
}

const EXTENDED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (UK / US)',
    subtext: 'Standard Atelier English',
    flag: '🇬🇧',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    badgeLabel: 'EN',
    direction: 'ltr'
  },
  {
    code: 'tw',
    name: 'Twi (Akan)',
    nativeName: 'Twi / Akan',
    subtext: 'Ghana Atelier • Kwesefoɔ & Adwuma',
    flag: '🇬🇭',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-amber-300',
    badgeLabel: 'GH',
    direction: 'ltr'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    subtext: 'Haute Couture & Atelier Français',
    flag: '🇫🇷',
    badgeBg: 'bg-indigo-600',
    badgeText: 'text-white',
    badgeLabel: 'FR',
    direction: 'ltr'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    subtext: 'اللغة العربية • واجهة اليمين لليسار (RTL)',
    flag: '🇸🇦',
    badgeBg: 'bg-[#0D3B36]',
    badgeText: 'text-amber-300',
    badgeLabel: 'AR',
    direction: 'rtl'
  }
];

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = ''
}) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = EXTENDED_LANGUAGES.find((l) => l.code === language) || EXTENDED_LANGUAGES[0];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button in Header */}
      <div className={`inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 border border-white/90 dark:border-slate-700 text-[10px] sm:text-xs font-bold transition-all shadow-2xs cursor-pointer select-none shrink-0 ${
            isOpen ? 'ring-2 ring-[#DCA134]' : ''
          }`}
          title={`Change Language: Current is ${currentOption.name}`}
        >
          <span className="text-xs sm:text-sm leading-none">{currentOption.flag}</span>
          <span className="font-black uppercase tracking-wider text-[10px] sm:text-[11px]">
            {compact ? currentOption.badgeLabel : currentOption.nativeName}
          </span>
          <Globe className="w-3 h-3 text-[#DCA134] opacity-90" />
        </button>
      </div>

      {/* Responsive Language Sheet & Modal (iPhone SE + Desktop Optimized) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[300] bg-slate-950/70 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit'] select-none"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-[#072421] border-t-2 sm:border-2 border-[#DCA134] rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto pb-[max(24px,calc(16px+env(safe-area-inset-bottom,0px)))] sm:pb-6 relative my-0 sm:my-auto transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Indicator Pill */}
            <div className="sm:hidden flex justify-center pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#0D3B36]/10 dark:bg-amber-400/20 text-[#0D3B36] dark:text-amber-300 flex items-center justify-center border border-[#0D3B36]/20 dark:border-amber-400/30">
                  <Globe className="w-5 h-5 text-[#DCA134]" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight">
                    Select Language / Kasa
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Choose your studio display language
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="space-y-2 sm:space-y-2.5">
              {EXTENDED_LANGUAGES.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D3B36] dark:bg-amber-400 text-amber-300 dark:text-[#061E1B] border-[#DCA134] border-2 shadow-md transform scale-[1.01]'
                        : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Flag + Badge */}
                      <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs">
                        <span className="text-xl sm:text-2xl leading-none">{item.flag}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-xs sm:text-sm truncate leading-tight">
                            {item.nativeName}
                          </p>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                              isSelected
                                ? 'bg-amber-400/30 text-amber-200 dark:bg-[#061E1B]/30 dark:text-[#061E1B]'
                                : `${item.badgeBg} ${item.badgeText}`
                            }`}
                          >
                            {item.badgeLabel}
                          </span>
                        </div>
                        <p
                          className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate ${
                            isSelected ? 'opacity-90 font-bold' : 'text-slate-500 dark:text-slate-400 font-medium'
                          }`}
                        >
                          {item.subtext}
                        </p>
                      </div>
                    </div>

                    {/* Checkmark Status Indicator */}
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-amber-400 dark:bg-[#061E1B] text-[#061E1B] dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
