import React, { useState } from 'react';
import { X, Ruler, Search, Plus, Camera, Sparkles } from 'lucide-react';
import { Client } from '../../../types';

interface ClientMeasurementPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSelectClientForTape: (client: Client) => void;
  onOpenAddNewClient: () => void;
}

export const ClientMeasurementPickerModal: React.FC<ClientMeasurementPickerModalProps> = ({
  isOpen,
  onClose,
  clients,
  onSelectClientForTape,
  onOpenAddNewClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = clients.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.garmentTag.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-[32px] p-5 sm:p-6 space-y-4 shadow-2xl border border-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-100 text-[#DCA134]">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Outfit'] font-black text-lg text-[#0D3B36] tracking-tight">
                Select Client to Measure
              </h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Manual Tape or Camera AI Scan
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add New Client Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search client by name or phone..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D3B36]"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddNewClient();
            }}
            className="px-3 py-2.5 rounded-xl bg-[#082824] hover:bg-[#051c19] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#DCA134]" />
            <span>+ New Client</span>
          </button>
        </div>

        {/* Client Selection List */}
        <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl border border-dashed">
              No matching clients found.
            </div>
          ) : (
            filtered.map((client) => (
              <div
                key={client.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-[#0D3B36]/30 transition-all"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{client.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {client.garmentTag} · {client.phone}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onClose();
                      onSelectClientForTape(client);
                    }}
                    className="px-3 py-2 rounded-xl bg-[#082824] hover:bg-[#051c19] text-white font-extrabold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Ruler className="w-3.5 h-3.5 text-[#DCA134]" />
                    <span>Tape / AI Scan</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

