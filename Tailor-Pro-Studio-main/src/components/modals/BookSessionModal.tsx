import React, { useState, useEffect } from 'react';
import { X, Calendar, Sparkles, Clock, DollarSign } from 'lucide-react';
import { Client, RunwaySession } from '../../types';

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientsList: Client[];
  preselectedClient?: Client | null;
  artistsList: string[];
  onBookSession: (session: RunwaySession) => void;
}

export const BookSessionModal: React.FC<BookSessionModalProps> = ({
  isOpen,
  onClose,
  clientsList,
  preselectedClient,
  artistsList,
  onBookSession
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [serviceTitle, setServiceTitle] = useState('');
  const [artistName, setArtistName] = useState(artistsList[0] || 'Master Atelier');
  const [timeSlot, setTimeSlot] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [durationHours, setDurationHours] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [depositPaid, setDepositPaid] = useState<number | ''>('');

  useEffect(() => {
    if (preselectedClient) {
      setClientId(preselectedClient.id);
      setArtistName(preselectedClient.assignedDesigner || artistsList[0] || 'Master Atelier');
    } else if (clientsList.length > 0) {
      setClientId(clientsList[0].id);
    }
  }, [preselectedClient, clientsList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clientsList.find((c) => c.id === clientId) || clientsList[0];

    const newSession: RunwaySession = {
      id: `run-${Date.now()}`,
      clientId: selectedClient ? selectedClient.id : '',
      clientName: selectedClient ? selectedClient.name : 'Walk-In Client',
      clientAvatar: selectedClient ? selectedClient.avatarUrl : '',
      artistName: artistName || artistsList[0] || 'Master Atelier',
      serviceTitle: serviceTitle || 'Bespoke Garment Fitting',
      timeSlot: timeSlot || 'TBD',
      durationHours: Number(durationHours) || 1,
      status: Number(depositPaid) > 0 ? 'Confirmed' : 'Deposit Pending',
      price: Number(price) || 0,
      depositPaid: Number(depositPaid) || 0
    };

    onBookSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl border border-white/80">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#0E3832] text-amber-300 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5 text-[#DCA134]" />
          </div>
          <div>
            <h3 className="font-['Outfit'] font-bold text-xl text-[#0E3832]">
              Book Runway Session
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Schedule session slot, station assignment & deposit
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            >
              {clientsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stylePreference})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Service Title / Garment Style</label>
            <input
              type="text"
              required
              value={serviceTitle}
              onChange={(e) => setServiceTitle(e.target.value)}
              placeholder="e.g. Kente Gown Fitting & Alterations"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Artist / Tailor</label>
              <select
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              >
                {artistsList.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Session Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="10:00 AM - 02:00 PM"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Est. Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Session Price ($)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Deposit Collected ($)</label>
              <input
                type="number"
                value={depositPaid}
                onChange={(e) => setDepositPaid(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-300 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E3832]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0E3832] hover:bg-[#0A2B26] text-white font-bold text-xs fab-shadow transition-all hover:scale-105"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
