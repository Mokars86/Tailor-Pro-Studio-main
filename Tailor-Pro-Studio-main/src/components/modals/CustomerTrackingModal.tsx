import React, { useState } from 'react';
import { ArrowLeft, Search, Scissors, Phone, CreditCard, Sparkles, CheckCircle2, Clock, Calendar, Shirt, UserCheck, Tag } from 'lucide-react';
import { Client } from '../../types';

interface CustomerTrackingModalProps {
  clients: Client[];
  onClose: () => void;
}

export const CustomerTrackingModal: React.FC<CustomerTrackingModalProps> = ({
  clients,
  onClose
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundClients, setFoundClients] = useState<Client[]>([]);

  const performSearch = (inputVal: string) => {
    if (!inputVal || !inputVal.trim()) {
      setFoundClients([]);
      setHasSearched(false);
      return;
    }

    const queryRaw = inputVal.trim();
    const queryLower = queryRaw.toLowerCase();
    const queryDigits = queryRaw.replace(/\D/g, '');

    const pool = clients;

    // Remove duplicates by id or phone+garmentTag
    const uniquePool = pool.filter((client, index, self) =>
      index === self.findIndex((c) => c.id === client.id || (c.phone === client.phone && c.garmentTag === client.garmentTag))
    );

    const matches = uniquePool.filter((c) => {
      const cPhoneDigits = (c.phone || '').replace(/\D/g, '');
      
      const phoneDigitMatch =
        queryDigits.length >= 3 &&
        (cPhoneDigits.includes(queryDigits) ||
          (queryDigits.length >= 7 && cPhoneDigits.slice(-7) === queryDigits.slice(-7)));

      const phoneRawMatch = (c.phone || '').toLowerCase().includes(queryLower);
      const nameMatch = (c.name || '').toLowerCase().includes(queryLower);
      const tagMatch = (c.garmentTag || '').toLowerCase().includes(queryLower);

      return phoneDigitMatch || phoneRawMatch || nameMatch || tagMatch;
    });

    setFoundClients(matches);
    setHasSearched(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(phoneNumber);
  };

  const handleInputChange = (val: string) => {
    setPhoneNumber(val);
    if (val.trim().length >= 3) {
      performSearch(val);
    } else if (val.trim().length === 0) {
      setHasSearched(false);
      setFoundClients([]);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#EBF5F0] text-[#0D3B36] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg mx-auto space-y-5 my-auto py-4">
        
        {/* Top Back Navigation Link */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0D3B36] hover:text-emerald-800 transition-colors cursor-pointer py-1.5 px-4 rounded-full bg-white/60 hover:bg-white shadow-2xs border border-white/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Studio Login</span>
          </button>
        </div>

        {/* Center Logo Icon Box */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center relative">
            <Scissors className="w-8 h-8 text-[#0D3B36]" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DCA134] text-[#061E1B] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#061E1B]" />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-1.5">
          <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0D3B36] tracking-tight uppercase">
            Order Status Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#0D3B36]/80 font-semibold max-w-sm mx-auto">
            Enter your registered telephone number or garment tag below to check live atelier production status.
          </p>
        </div>

        {/* Telephone Number Search Input Form */}
        <div className="space-y-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-[#0D3B36]/50 absolute left-4 top-4" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter Telephone Number or Garment Tag"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/90 text-sm font-extrabold text-[#0D3B36] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#0D3B36] shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 sm:px-6 py-3.5 rounded-2xl bg-[#0D3B36] hover:bg-[#082824] text-amber-300 font-black text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>Track</span>
            </button>
          </form>
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="space-y-4 animate-fade-in pt-2">
            {foundClients.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white/90 border border-slate-200 text-center space-y-2 shadow-sm">
                <p className="font-extrabold text-sm text-[#0D3B36]">No Active Orders Found</p>
                <p className="text-xs text-slate-500 font-medium">
                  We couldn't find any active garment fitting associated with "{phoneNumber}". Please verify your telephone number or contact our atelier manager.
                </p>
              </div>
            ) : (
              foundClients.map((client) => {
                const isCompleted = client.runwayStage === 'COMPLETED' || client.runwayStage === 'DELIVERED';
                return (
                  <div
                    key={client.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-4 text-left font-['Outfit']"
                  >
                    {/* Header: Client Name & Garment Tag */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#0D3B36] text-amber-300 font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                          {client.initials || client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900">{client.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                            <Tag className="w-3.5 h-3.5 text-[#0D3B36]" />
                            <span className="font-mono font-bold text-[#0D3B36]">{client.garmentTag}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {client.runwayStage}
                      </span>
                    </div>

                    {/* Progress Pipeline */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <div className="flex justify-between text-xs font-extrabold text-slate-700">
                        <span>Production Stage</span>
                        <span className="text-[#0D3B36] font-black">{client.runwayStage}</span>
                      </div>
                      
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0D3B36] transition-all duration-500 rounded-full"
                          style={{
                            width:
                              (client.runwayStage || 'CONSULT') === 'CONSULT'
                                ? '16%'
                                : client.runwayStage === 'CUTTING'
                                ? '33%'
                                : client.runwayStage === 'SEWING'
                                ? '50%'
                                : client.runwayStage === 'FITTING'
                                ? '66%'
                                : client.runwayStage === 'COMPLETED'
                                ? '83%'
                                : '100%'
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] xs:text-[10px] font-bold text-slate-400 pt-1 flex-wrap gap-1">
                        <span className={(client.runwayStage || 'CONSULT') === 'CONSULT' ? 'text-[#0D3B36] font-black' : ''}>1. Consult</span>
                        <span className={client.runwayStage === 'CUTTING' ? 'text-[#0D3B36] font-black' : ''}>2. Cutting</span>
                        <span className={client.runwayStage === 'SEWING' ? 'text-[#0D3B36] font-black' : ''}>3. Sewing</span>
                        <span className={client.runwayStage === 'FITTING' ? 'text-[#0D3B36] font-black' : ''}>4. Fitting</span>
                        <span className={client.runwayStage === 'COMPLETED' ? 'text-emerald-700 font-black' : ''}>5. Ready</span>
                        <span className={client.runwayStage === 'DELIVERED' ? 'text-emerald-700 font-black' : ''}>6. Delivered</span>
                      </div>
                    </div>

                    {/* Garment Notes / Description if available */}
                    {client.notes && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300/40 text-xs space-y-0.5">
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">
                          Garment Specifications:
                        </span>
                        <p className="text-slate-800 font-medium text-xs leading-snug">
                          {client.notes}
                        </p>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Assigned Master / Stylist
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {client.assignedDesigner || 'Kausar Mohammed'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                          Expected Fitting Date
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>{client.fittingDate || '2026-08-20'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Balance & MoMo Payment */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-emerald-800 font-semibold block text-[11px]">Outstanding Balance Due:</span>
                        <span className="font-black text-[#DCA134] text-base">
                          GH₵ {client.balanceDue}
                        </span>
                      </div>

                      <div className="text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-300">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>MoMo: <strong>0555733036</strong> (Kausar Mohammed)</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};
