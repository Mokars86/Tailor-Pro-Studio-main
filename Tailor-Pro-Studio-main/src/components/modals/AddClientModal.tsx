import React, { useState, useEffect } from 'react';
import { X, User, DollarSign, AlertCircle, Camera, Upload, Trash2 } from 'lucide-react';
import { Client } from '../../types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClient: (client: Client) => void;
  editingClient?: Client | null;
  artistsList: string[];
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSaveClient,
  editingClient,
  artistsList
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [status, setStatus] = useState<Client['status']>('Active');
  const [assignedArtist, setAssignedArtist] = useState(artistsList[0] || 'Master Atelier');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [depositPaid, setDepositPaid] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name || '');
      setPhone(editingClient.phone || '');
      setStylePreference(editingClient.garmentTag || editingClient.stylePreference || '');
      setStatus(editingClient.status || 'Active');
      setAssignedArtist(editingClient.assignedDesigner || artistsList[0] || 'Master Atelier');
      setTotalCost(editingClient.totalCost ?? '');
      setDepositPaid(editingClient.depositPaid ?? '');
      setNotes(editingClient.notes || '');
      setAvatarUrl(editingClient.avatarUrl || '');
    } else {
      setName('');
      setPhone('');
      setStylePreference('');
      setStatus('Active');
      setAssignedArtist(artistsList[0] || 'Master Atelier');
      setTotalCost('');
      setDepositPaid('');
      setNotes('');
      setAvatarUrl('');
    }
  }, [editingClient, isOpen, artistsList]);

  if (!isOpen) return null;

  const calculatedBalance = Math.max(0, (Number(totalCost) || 0) - (Number(depositPaid) || 0));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const clientData: Client = {
      id: editingClient ? editingClient.id : `cli-${Date.now()}`,
      name: name.trim(),
      initials: name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'CL',
      garmentTag: stylePreference.trim() || 'Custom Garment',
      timestamp: 'Just now',
      email: editingClient?.email || (name.trim() ? `${name.trim().toLowerCase().replace(/\s+/g, '.')}@client.com` : ''),
      phone: phone.trim(),
      avatarUrl: avatarUrl || '',
      status: calculatedBalance > 0 && Number(depositPaid || 0) === 0 ? 'Pending Deposit' : status,
      runwayStage: editingClient ? editingClient.runwayStage : 'CONSULT',
      totalCost: Number(totalCost) || 0,
      depositPaid: Number(depositPaid) || 0,
      balanceDue: calculatedBalance,
      notes: notes.trim(),
      assignedDesigner: assignedArtist || artistsList[0] || 'Master Atelier',
      tags: editingClient?.tags || []
    };

    onSaveClient(clientData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto font-['Outfit']">
      <div className="glass-card bg-white/95 dark:bg-[#092825]/95 rounded-[24px] sm:rounded-3xl p-4 sm:p-6 max-w-lg w-full relative shadow-2xl border border-white/80 dark:border-white/10 my-auto max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6 pr-8">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0E3832] dark:bg-[#12423D] text-amber-300 flex items-center justify-center font-bold shrink-0 border border-white/20">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#DCA134]" />
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-lg sm:text-xl text-[#0E3832] dark:text-[#DCA134] leading-tight">
              {editingClient ? 'Edit Client Dossier' : 'New Client Consultation'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">
              Client profile, style preference & financial terms
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
          {/* Client Image / Photo Section (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                <span>Client Photo / Image</span>
                <span className="text-[9px] font-normal text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  Optional
                </span>
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              {/* Photo Preview Thumbnail */}
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Client Photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )}
              </div>

              {/* Upload Action & Presets */}
              <div className="flex-1 space-y-2 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="px-3 py-1.5 rounded-xl bg-[#0E3832] dark:bg-amber-400 hover:bg-[#0A2B26] dark:hover:bg-amber-300 text-white dark:text-[#0E3832] font-bold text-[10px] sm:text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-xs shrink-0">
                    <Camera className="w-3.5 h-3.5 text-amber-300 dark:text-[#0E3832]" />
                    <span>Upload Client Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[9px] text-slate-400 font-medium">PNG, JPG, WEBP</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mr-1 shrink-0">Presets:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {sampleAvatars.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="preset"
                        onClick={() => setAvatarUrl(url)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl object-cover cursor-pointer border-2 transition-all shrink-0 ${
                          avatarUrl === url ? 'border-[#0E3832] dark:border-amber-400 scale-110 shadow-xs ring-2 ring-[#0E3832]/20 dark:ring-amber-400/20' : 'border-white dark:border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ama Mensah"
              className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 24 000 0000"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Assigned Artist / Tailor</label>
              <select
                value={assignedArtist}
                onChange={(e) => setAssignedArtist(e.target.value)}
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              >
                {artistsList && artistsList.length > 0 ? (
                  artistsList.map((artist) => (
                    <option key={artist} value={artist}>
                      {artist}
                    </option>
                  ))
                ) : (
                  <option value="Master Atelier">Master Atelier</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Client Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Client['status'])}
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              >
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Pending Deposit">Pending Deposit</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Style Preference / Garment Tag</label>
              <input
                type="text"
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                placeholder="e.g. Vlisco Kente Gown, Corset Evening Dress"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Total Amount & Deposit Paid Side-by-Side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Total Amount ($)</label>
              <input
                type="number"
                min="0"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Deposit Paid ($)</label>
              <input
                type="number"
                min="0"
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Automatic Remaining Balance Calculation & Alert */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 flex flex-row items-center justify-between gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs">
              <AlertCircle className="w-4 h-4 text-[#DCA134] shrink-0" />
              <span>Remaining Balance to Collect:</span>
            </span>
            <span className="text-xs sm:text-sm font-black text-[#0E3832] dark:text-amber-300 bg-white dark:bg-slate-800 px-2.5 py-0.5 sm:py-1 rounded-xl border border-amber-300 dark:border-amber-400/40 shadow-2xs shrink-0">
              ${calculatedBalance}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Studio Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add project details, placement notes, fitting preferences..."
              className="w-full px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0E3832] dark:focus:ring-amber-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#0E3832] dark:bg-amber-400 hover:bg-[#0A2B26] dark:hover:bg-amber-300 text-white dark:text-[#0E3832] font-bold text-xs fab-shadow transition-all hover:scale-105 cursor-pointer"
            >
              {editingClient ? 'Update Client' : 'Create Client Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

