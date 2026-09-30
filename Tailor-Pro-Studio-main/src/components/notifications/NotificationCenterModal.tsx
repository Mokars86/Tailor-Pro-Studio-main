import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Ruler,
  BookOpen,
  Clock,
  Scissors,
  Award,
  Volume2,
  VolumeX,
  Smartphone,
  Trash2,
  CheckCheck,
  Send,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { AppNotification } from '../../types';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationSoundEnabled,
  setNotificationSoundEnabled,
  sendTestPushNotification
} from '../../services/pushNotificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (notification: AppNotification) => void;
  currentUserRole?: string;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification,
  currentUserRole = 'Master'
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TASKS' | 'MEASUREMENTS' | 'STUDIO'>('ALL');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(getNotificationPermissionStatus());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(isNotificationSoundEnabled());
  const [testSentNotice, setTestSentNotice] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(getNotificationPermissionStatus());
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setNotificationSoundEnabled(next);
  };

  const handleSendTest = async () => {
    const role = currentUserRole.startsWith('Apprentice') ? 'apprentice' : 'master';
    await sendTestPushNotification(role);
    setTestSentNotice(true);
    setTimeout(() => setTestSentNotice(false), 3000);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TASKS') {
      return n.type === 'TASK_ASSIGNED' || n.type === 'TASK_SUBMITTED' || n.type === 'TASK_PASSED';
    }
    if (activeFilter === 'MEASUREMENTS') {
      return n.type === 'MEASUREMENT_RECORDED';
    }
    if (activeFilter === 'STUDIO') {
      return n.type === 'GARMENT_STAGE_UPDATED' || n.type === 'APPRENTICE_LINKED' || n.type === 'CERTIFICATE_UNLOCKED';
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'TASK_SUBMITTED':
        return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'TASK_PASSED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'MEASUREMENT_RECORDED':
        return <Ruler className="w-4 h-4 text-teal-600" />;
      case 'GARMENT_STAGE_UPDATED':
        return <Scissors className="w-4 h-4 text-cyan-600" />;
      case 'CERTIFICATE_UNLOCKED':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#DCA134]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in font-['Outfit']">
      <div className="w-full max-w-xl bg-[#ECF3F1] dark:bg-[#061E1B] rounded-[32px] sm:rounded-[36px] p-4 sm:p-6 space-y-4 shadow-2xl border border-white dark:border-white/10 max-h-[92vh] flex flex-col my-auto relative">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-white/10 pb-3.5 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0D3B36] text-[#DCA134] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-black text-base sm:text-lg text-[#0D3B36] dark:text-slate-100 uppercase tracking-tight">
                STUDIO PUSH NOTIFICATIONS
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold pl-10">
              Live alerts for task assignments, task completions & client measurements
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Settings & Push Permission Controls */}
        <div className="bg-white/80 dark:bg-[#092825] rounded-2xl p-3 border border-slate-200 dark:border-white/10 space-y-2.5 shrink-0 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Native Push Status */}
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#DCA134]" />
              <div className="text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Phone Push: </span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-full ${
                    permissionStatus === 'granted'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40'
                      : permissionStatus === 'denied'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-400/40'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40'
                  }`}
                >
                  {permissionStatus === 'granted' ? 'Active ✓' : permissionStatus === 'denied' ? 'Blocked ✗' : 'Needs Permission'}
                </span>
              </div>
            </div>

            {/* Permission Action Button */}
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enable Phone Alerts</span>
              </button>
            )}

            {/* Audio Chime & Test Push Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/10 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 border-slate-300 text-slate-500'
                }`}
                title={soundEnabled ? 'Chime Sound Enabled' : 'Chime Sound Muted'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[10px] hidden sm:inline">{soundEnabled ? 'Sound On' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTest}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-300 dark:border-white/10 text-[#0D3B36] dark:text-amber-300 text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer"
                title="Send a sample test push alert to verify phone/browser reception"
              >
                <Send className="w-3 h-3 text-[#DCA134]" />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {testSentNotice && (
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-400/40">
              Test push notification dispatched! Check your phone / screen.
            </div>
          )}
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-white/70 dark:bg-[#092825] p-1 rounded-2xl border border-slate-200 dark:border-white/10">
            {(['ALL', 'TASKS', 'MEASUREMENTS', 'STUDIO'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#0D3B36] text-amber-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? `All (${notifications.length})` : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[#0D3B36] dark:text-amber-300 font-extrabold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 custom-scrollbar min-h-[220px] max-h-[380px]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center bg-white/60 dark:bg-[#092825]/60 rounded-3xl border border-slate-200 dark:border-white/10 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-sm text-[#0D3B36] dark:text-slate-100">No Notifications Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                When duties are assigned, completed, or client measurements are taken, push notifications will appear here.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (onSelectNotification) onSelectNotification(item);
                  onClose();
                }}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  item.read
                    ? 'bg-white/70 dark:bg-[#092825]/60 border-slate-200 dark:border-white/5 opacity-85'
                    : 'bg-white dark:bg-[#092825] border-amber-400/60 dark:border-amber-400/40 shadow-xs'
                } hover:border-[#0D3B36] dark:hover:border-amber-300`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-2 rounded-xl bg-[#061E1B] text-[#DCA134] shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0D3B36] text-amber-300">
                          {item.senderRole}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </div>
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium pl-9 leading-relaxed">
                  {item.body}
                </p>

                <div className="pl-9 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>From: {item.senderName}</span>
                  <span className="text-[#0D3B36] dark:text-amber-300 font-extrabold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>View</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200 dark:border-white/10">
          TailorPro Realtime Push Notification Engine · Connected via Supabase & Web Push API
        </div>
      </div>
    </div>
  );
};
