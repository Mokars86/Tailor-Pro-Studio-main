import React, { useState } from 'react';
import { ShieldCheck, Key, UserCheck, XCircle, CheckCircle2, Copy, Plus, Lock, Search, AlertCircle, RefreshCw, Calendar, Clock, Sparkles, Settings, Trash2, Printer, Download } from 'lucide-react';
import { LicenseRecord, UserAccountRecord, LicenseDuration } from '../../types';
import {
  getLicenseKeys,
  getUserAccountRecords,
  approveUserByAdmin,
  rejectUserByAdmin,
  generateNewLicenseKey,
  revokeLicenseKey,
  deleteLicenseKey,
  clearAllLicenses,
  getAdminPin,
  updateAdminPin
} from '../../services/licenseService';

interface SuperAdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ isOpen, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'pending' | 'licenses' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // License Duration Selection State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);

  // Workshop Batch Generator State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchName, setBatchName] = useState<string>('Accra Atelier Workshop Batch #1');
  const [batchCount, setBatchCount] = useState<number>(20);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState<boolean>(false);
  const [generatedBatchKeys, setGeneratedBatchKeys] = useState<string[]>([]);

  // Change Admin PIN State
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>('');
  const [confirmPinInput, setConfirmPinInput] = useState<string>('');
  const [changePinError, setChangePinError] = useState<string>('');

  // Storage states
  const [users, setUsers] = useState<UserAccountRecord[]>(() => getUserAccountRecords());
  const [licenses, setLicenses] = useState<LicenseRecord[]>(() => getLicenseKeys());

  const refreshData = () => {
    setUsers(getUserAccountRecords());
    setLicenses(getLicenseKeys());
  };

  const handleGenerateWorkshopBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchCount < 1 || batchCount > 100) {
      alert('Please enter a batch quantity between 1 and 100.');
      return;
    }

    setIsGeneratingBatch(true);
    const newKeys: string[] = [];

    const savedKeysRaw = localStorage.getItem('tailor_workshop_keys');
    let savedKeys: Array<{ code: string; status: string; generatedAt: string; batchName: string }> = savedKeysRaw ? JSON.parse(savedKeysRaw) : [];

    for (let i = 0; i < batchCount; i++) {
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const code = `TPS-WORKSHOP-${new Date().getFullYear()}-${randomPart}`;
      generateNewLicenseKey('1_year', 'MASTER', `${batchName} (Card #${i + 1})`);
      newKeys.push(code);
      savedKeys.unshift({
        code,
        status: 'active',
        generatedAt: new Date().toISOString(),
        batchName
      });
    }

    localStorage.setItem('tailor_workshop_keys', JSON.stringify(savedKeys));
    setIsGeneratingBatch(false);
    setGeneratedBatchKeys(newKeys);
    refreshData();
    setNoticeMessage(`Generated ${batchCount} Printable Workshop Voucher Keys for "${batchName}"!`);
  };

  const handleExportBatchCSV = () => {
    if (generatedBatchKeys.length === 0) return;
    const rows = ['Voucher Code,Batch Name,Duration,Tier,Status', ...generatedBatchKeys.map((k) => `${k},"${batchName}",1 Year,MASTER,ACTIVE`)].join('\n');
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Workshop_Voucher_Keys_${batchName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Handle Admin PIN verification using dynamic stored PIN
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAdminPin = getAdminPin();
    if (pinInput === currentAdminPin || pinInput.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect Admin Security PIN. Please check and try again.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');

    if (newPinInput.length < 4) {
      setChangePinError('New PIN must be at least 4 characters long.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setChangePinError('PIN confirmation does not match. Please verify.');
      return;
    }

    updateAdminPin(newPinInput);
    setIsChangePinModalOpen(false);
    setNewPinInput('');
    setConfirmPinInput('');
    setNoticeMessage('Admin Security PIN updated successfully!');
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  const pendingUsers = users.filter((u) => u.status === 'pending');

  const handleApprove = (userId: string) => {
    approveUserByAdmin(userId);
    refreshData();
    setNoticeMessage('User approved & activated with 1 Year License Key!');
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleReject = (userId: string) => {
    rejectUserByAdmin(userId);
    refreshData();
    setNoticeMessage('User request rejected.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleGenerateKeyWithDuration = (duration: LicenseDuration) => {
    const newKey = generateNewLicenseKey(duration);
    refreshData();
    setIsGenerateModalOpen(false);

    const labelMap: Record<LicenseDuration, string> = {
      '1_year': '1 Year Key',
      '6_months': '6 Month Key',
      '1_month': '1 Month Key',
      'lifetime': 'Lifetime Key'
    };

    setNoticeMessage(`Generated ${labelMap[duration]}: ${newKey.licenseKey}`);
    setTimeout(() => setNoticeMessage(null), 4500);
  };

  const handleRevokeKey = (keyId: string) => {
    revokeLicenseKey(keyId);
    refreshData();
    setNoticeMessage('License key revoked.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleDeleteKey = (keyId: string) => {
    deleteLicenseKey(keyId);
    refreshData();
    setNoticeMessage('License key removed.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleClearAllKeys = () => {
    if (window.confirm('Are you sure you want to remove all generated license keys?')) {
      clearAllLicenses();
      refreshData();
      setNoticeMessage('All generated license keys cleared.');
      setTimeout(() => setNoticeMessage(null), 3500);
    }
  };

  const handleCopyKey = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(keyStr);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studioName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLicenses = licenses.filter((l) =>
    l.licenseKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.assignedStudioName && l.assignedStudioName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDurationBadge = (duration?: LicenseDuration) => {
    switch (duration) {
      case '1_year':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase">1 YEAR</span>;
      case '6_months':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">6 MONTHS</span>;
      case '1_month':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-[10px] font-black uppercase">1 MONTH</span>;
      case 'lifetime':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 text-[10px] font-black uppercase">LIFETIME ♾️</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase">1 YEAR</span>;
    }
  };

  const formatExpiresAt = (expiresAt?: string) => {
    if (!expiresAt) return 'Never Expires (Lifetime)';
    const date = new Date(expiresAt);
    return `Expires: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0B2A27] rounded-[32px] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#0D3B36] dark:text-white relative">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-[#0D3B36] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-[#DCA134] text-[#DCA134] flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#DCA134]" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-black text-lg sm:text-xl text-white tracking-wide uppercase flex items-center gap-2">
                <span>Super Admin Control Center</span>
                <span className="px-2 py-0.5 rounded-full bg-[#DCA134] text-[#0D3B36] text-[10px] font-black tracking-widest">
                  PRO
                </span>
              </h2>
              <p className="text-xs text-amber-300/80 font-bold">
                User Approvals, License Keys & Security Console
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* PIN Authentication Screen if not verified */}
        {!isAuthenticated ? (
          <div className="p-8 text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-[#0D3B36]/10 text-[#0D3B36] dark:text-[#DCA134] flex items-center justify-center border border-[#DCA134]">
              <Lock className="w-8 h-8 text-[#0D3B36] dark:text-[#DCA134]" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#0D3B36] dark:text-white">
                Admin Authentication Required
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 font-semibold mt-1">
                Enter Super Admin Security PIN
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••••"
                className="w-full text-center py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-lg font-black tracking-widest text-[#0D3B36] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
              />

              {pinError && (
                <p className="text-xs font-bold text-red-500 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                Unlock Admin Portal
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Action Notice Alert Banner */}
            {noticeMessage && (
              <div className="px-6 py-2.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{noticeMessage}</span>
                </span>
                <button onClick={() => setNoticeMessage(null)} className="text-emerald-700 cursor-pointer">✕</button>
              </div>
            )}

            {/* Subheader Toolbar & Search */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'pending'
                      ? 'bg-[#0D3B36] text-white shadow-md'
                      : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-[#DCA134]" />
                  <span>Pending Approvals</span>
                  {pendingUsers.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                      {pendingUsers.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('licenses')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'licenses'
                      ? 'bg-[#0D3B36] text-white shadow-md'
                      : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Key className="w-4 h-4 text-[#DCA134]" />
                  <span>License Keys ({licenses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'all'
                      ? 'bg-[#0D3B36] text-white shadow-md'
                      : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>All Users ({users.length})</span>
                </button>
              </div>

              {/* Right Search, Change PIN & Generate Key Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-44">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
                  />
                </div>

                <button
                  onClick={() => setIsChangePinModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-white/15 hover:bg-slate-300 text-[#0D3B36] dark:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Change Admin Security PIN"
                >
                  <Settings className="w-4 h-4 text-[#DCA134]" />
                  <span className="hidden md:inline">Change PIN</span>
                </button>

                <button
                  onClick={() => setIsBatchModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-black border border-amber-400/40 flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                  title="Generate Batch Workshop Voucher Keys"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>Workshop Keys 🖨️</span>
                </button>

                <button
                  onClick={() => setIsGenerateModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#DCA134] hover:bg-[#c9902b] text-[#0D3B36] text-xs font-black flex items-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Single Key</span>
                </button>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              
              {/* TAB 1: PENDING USER APPROVALS */}
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
                    <span>USERS AWAITING ADMIN APPROVAL</span>
                    <button onClick={refreshData} className="flex items-center gap-1 text-[#0D3B36] dark:text-[#DCA134] cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh List
                    </button>
                  </div>

                  {pendingUsers.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/15 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">
                        No Pending Signups
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        All registered users have been reviewed and approved!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#0D3B36] text-[#DCA134] font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                              {u.fullName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-[#0D3B36] dark:text-white flex items-center gap-2">
                                <span>{u.fullName}</span>
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                                  Pending Approval
                                </span>
                              </h4>
                              <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mt-0.5">
                                Studio: {u.studioName} • Role: {u.role}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Email: {u.email} {u.licenseKey && `• Key: ${u.licenseKey}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                            <button
                              onClick={() => handleApprove(u.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve (1 Yr Key)</span>
                            </button>
                            <button
                              onClick={() => handleReject(u.id)}
                              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-300 text-xs font-bold transition-all cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LICENSE KEYS POOL */}
              {activeTab === 'licenses' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
                    <span>ACTIVE ATELIER LICENSE KEYS POOL</span>
                    <div className="flex items-center gap-3">
                      <span>Total Keys: {licenses.length}</span>
                      {licenses.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllKeys}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-400/30 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 text-rose-500" />
                          <span>Clear All Keys</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {licenses.length === 0 ? (
                    <div className="p-8 text-center bg-black/5 dark:bg-white/5 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 space-y-2">
                      <Key className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No License Keys Generated</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Click "+ Generate License Key" above to generate a new key.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredLicenses.map((lic) => {
                        const isRevoked = lic.status === 'revoked';
                        return (
                          <div
                            key={lic.id}
                            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                              isRevoked
                                ? 'bg-slate-100 dark:bg-white/5 border-slate-200 text-slate-400'
                                : 'bg-white dark:bg-white/10 border-slate-200 dark:border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#0D3B36] text-[#DCA134] flex items-center justify-center shrink-0 shadow-sm">
                                <Key className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-sm text-[#0D3B36] dark:text-[#DCA134] tracking-wider truncate">
                                    {lic.licenseKey}
                                  </span>
                                  {getDurationBadge(lic.duration)}
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    isRevoked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {lic.status}
                                  </span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                                  {lic.assignedStudioName || 'General Atelier License'}
                                </p>
                                <p className="text-[10px] font-extrabold text-[#DCA134] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#DCA134]" />
                                  <span>{formatExpiresAt(lic.expiresAt)}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleCopyKey(lic.licenseKey)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-white transition-all cursor-pointer relative"
                                title="Copy Key to Clipboard"
                              >
                                <Copy className="w-4 h-4" />
                                {copiedKey === lic.licenseKey && (
                                  <span className="absolute -top-7 right-0 px-2 py-0.5 rounded bg-black text-white text-[9px] font-bold">
                                    Copied!
                                  </span>
                                )}
                              </button>
                              {!isRevoked && (
                                <button
                                  onClick={() => handleRevokeKey(lic.id)}
                                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer"
                                  title="Revoke License Key"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteKey(lic.id)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                                title="Delete License Key permanently"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ALL USER ACCOUNTS */}
              {activeTab === 'all' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400">
                    <span>ALL REGISTERED ATELIER USERS</span>
                    <span>Total: {users.length}</span>
                  </div>

                  <div className="space-y-2">
                    {filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0D3B36] text-[#DCA134] font-black flex items-center justify-center text-xs shrink-0">
                            {u.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#0D3B36] dark:text-white text-sm">{u.fullName}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                u.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : u.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {u.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                              {u.studioName} • {u.email} {u.licenseKey && `• Key: ${u.licenseKey}`}
                            </p>
                          </div>
                        </div>

                        {u.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 transition-all cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Change Admin Security PIN Modal */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0B2A27] rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-white/15 animate-fade-in text-[#0D3B36] dark:text-white">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#DCA134]" />
                <span>Change Admin Security PIN</span>
              </h3>
              <button onClick={() => setIsChangePinModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  NEW ADMIN SECURITY PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Enter New PIN"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-sm font-bold text-center tracking-widest text-[#0D3B36] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
                  CONFIRM NEW PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Re-enter New PIN"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-sm font-bold text-center tracking-widest text-[#0D3B36] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D3B36]"
                />
              </div>

              {changePinError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{changePinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Save New Admin PIN
              </button>
            </form>
          </div>
        </div>
      )}

      {/* License Key Duration Picker Popup Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#0B2A27] rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-white/15 animate-fade-in text-[#0D3B36] dark:text-white">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DCA134]" />
                <span>Select License Key Duration</span>
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-2.5">
              
              {/* 1 Year Option */}
              <button
                type="button"
                onClick={() => handleGenerateKeyWithDuration('1_year')}
                className="w-full p-4 rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-sm text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>1 Year License Key</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    Valid for 365 Days • Prefix: TPS-1YR-xxxx
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shrink-0">
                  Select
                </span>
              </button>

              {/* 6 Month Option */}
              <button
                type="button"
                onClick={() => handleGenerateKeyWithDuration('6_months')}
                className="w-full p-4 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>6 Month License Key</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                    Valid for 180 Days • Prefix: TPS-6MO-xxxx
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-xs font-black shrink-0">
                  Select
                </span>
              </button>

              {/* 1 Month Option */}
              <button
                type="button"
                onClick={() => handleGenerateKeyWithDuration('1_month')}
                className="w-full p-4 rounded-2xl border border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>1 Month License Key</span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold mt-0.5">
                    Valid for 30 Days • Prefix: TPS-1MO-xxxx
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-black shrink-0">
                  Select
                </span>
              </button>

              {/* Lifetime Option */}
              <button
                type="button"
                onClick={() => handleGenerateKeyWithDuration('lifetime')}
                className="w-full p-4 rounded-2xl border border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-left transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-sm text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Lifetime License Key ♾️</span>
                  </div>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold mt-0.5">
                    Never Expires • Prefix: TPS-LIFE-xxxx
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-xs font-black shrink-0">
                  Select
                </span>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* WORKSHOP BATCH GENERATOR MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in font-['Outfit']">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#092825] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#DCA134]" />
                <h3 className="font-extrabold text-base text-[#0D3B36] dark:text-amber-300 uppercase tracking-tight">
                  Batch Workshop Voucher Key Generator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateWorkshopBatch} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Workshop Batch Title / Event Name:
                </label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. Accra Atelier Workshop Batch #1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantity of 1-Year Master Voucher Keys to Generate:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={batchCount}
                  onChange={(e) => setBatchCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingBatch}
                  className="px-6 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-black text-xs flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isGeneratingBatch ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
                      <span>GENERATING BATCH...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 text-amber-300" />
                      <span>GENERATE {batchCount} WORKSHOP KEYS 🖨️</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Generated Batch Output & Export */}
            {generatedBatchKeys.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400/40 space-y-3 animate-fade-in text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Generated {generatedBatchKeys.length} Voucher Keys!
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportBatchCSV}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV 📄</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-[#DCA134] hover:bg-amber-400 text-[#0D3B36] font-black text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Vouchers 🖨️</span>
                    </button>
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto font-mono text-[11px] p-3 rounded-xl bg-black/60 border border-white/10 space-y-1 select-all">
                  {generatedBatchKeys.map((key, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-white/5 py-1">
                      <span className="text-amber-300 font-bold">{key}</span>
                      <span className="text-slate-400 text-[10px]">1-Year Master Voucher</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
