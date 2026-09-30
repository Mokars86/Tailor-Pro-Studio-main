import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle2, Ruler, BookOpen, Clock, Scissors, Award, Sparkles } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationToastBannerProps {
  notification: AppNotification | null;
  onClose: () => void;
  onClickNotification?: (notification: AppNotification) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  notification,
  onClose,
  onClickNotification
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 7000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'TASK_ASSIGNED':
        return <BookOpen className="w-5 h-5 text-amber-300" />;
      case 'TASK_SUBMITTED':
        return <Clock className="w-5 h-5 text-indigo-300" />;
      case 'TASK_PASSED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-300" />;
      case 'MEASUREMENT_RECORDED':
        return <Ruler className="w-5 h-5 text-emerald-300" />;
      case 'GARMENT_STAGE_UPDATED':
        return <Scissors className="w-5 h-5 text-cyan-300" />;
      case 'CERTIFICATE_UNLOCKED':
        return <Award className="w-5 h-5 text-amber-300" />;
      default:
        return <Bell className="w-5 h-5 text-amber-300" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.type) {
      case 'TASK_ASSIGNED':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      case 'TASK_SUBMITTED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40';
      case 'TASK_PASSED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      case 'MEASUREMENT_RECORDED':
        return 'bg-teal-500/20 text-teal-300 border-teal-400/40';
      case 'GARMENT_STAGE_UPDATED':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
    }
  };

  return (
    <div
      className={`fixed top-4 right-3 sm:right-6 z-[100] max-w-sm sm:max-w-md w-full transition-all duration-300 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        onClick={() => {
          if (onClickNotification) onClickNotification(notification);
          onClose();
        }}
        className="glass-card bg-[#0D3B36]/95 dark:bg-[#061E1B]/95 text-white p-3.5 sm:p-4 rounded-3xl border-2 border-[#DCA134] shadow-2xl backdrop-blur-xl cursor-pointer hover:border-amber-300 transition-all space-y-2 font-['Outfit']"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#061E1B] border border-[#DCA134]/40 flex items-center justify-center shrink-0 shadow-sm">
              {getIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getBadgeColor()}`}>
                  {notification.senderRole} Alert
                </span>
                <span className="text-[10px] text-slate-300 font-semibold">Just now</span>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-white tracking-tight leading-snug mt-0.5 truncate">
                {notification.title}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 200);
            }}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-200 font-medium pl-11 leading-relaxed line-clamp-2">
          {notification.body}
        </p>

        <div className="pl-11 flex items-center justify-between text-[10px] text-[#DCA134] font-extrabold pt-0.5">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Tap to view in Atelier</span>
          </span>
          <span className="text-slate-400 font-semibold">{notification.senderName}</span>
        </div>
      </div>
    </div>
  );
};
