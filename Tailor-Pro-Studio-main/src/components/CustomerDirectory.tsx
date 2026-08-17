import React, { useState } from 'react';
import { Ruler, FileText, Layers, MoreVertical, Plus, Pencil, Trash2, Maximize2, Scissors } from 'lucide-react';
import { Client, UnpaidDeposit } from '../types';

interface CustomerDirectoryProps {
  clients: Client[];
  unpaidDeposits: UnpaidDeposit[];
  onOpenCollectDeposit: (deposit?: UnpaidDeposit) => void;
  onOpenBookSessionForClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onOpenMeasurements: (client: Client) => void;
  onOpenFullMeasurements?: (client: Client) => void;
  onOpenInvoice: (client: Client) => void;
  onOpenNewConsult: () => void;
  onSelectClient?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
  onAssignDuty?: (client: Client) => void;
}

export const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({
  clients,
  onOpenCollectDeposit,
  onEditClient,
  onOpenMeasurements,
  onOpenFullMeasurements,
  onOpenInvoice,
  onOpenNewConsult,
  onSelectClient,
  onDeleteClient,
  onAssignDuty
}) => {
  const [openMenuClientId, setOpenMenuClientId] = useState<string | null>(null);

  return (
    <div className="my-6 space-y-4 font-['Outfit']">
      {/* Directory Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-black text-lg sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase">
          CUSTOMER DIRECTORY
        </h2>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {clients.length} Active Dossiers
        </span>
      </div>

      {/* List of Client Cards */}
      {clients.length === 0 ? (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center space-y-4 border border-dashed border-slate-300 dark:border-slate-700">
          <div className="w-14 h-14 rounded-2xl bg-[#0D3B36]/10 dark:bg-amber-400/10 text-[#0D3B36] dark:text-amber-300 flex items-center justify-center mx-auto">
            <Scissors className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              No Client Dossiers Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              Your customer directory is clean and ready. Click below to add your first bespoke client consultation and measurements.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewConsult}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create First Client Consult</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
          const isMenuOpen = openMenuClientId === client.id;

          return (
            <div
              key={client.id}
              onClick={() => {
                if (onSelectClient) {
                  onSelectClient(client);
                }
              }}
              className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all border border-white/80 dark:border-white/10 cursor-pointer hover:border-[#0D3B36]/30 dark:hover:border-amber-400/40 active:scale-[0.99] relative"
            >
              {/* Left Avatar & Client Details */}
              <div className="flex items-center gap-3">
                {/* Initial Badge */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D3B36] dark:bg-[#12423D] text-white font-black text-sm flex items-center justify-center shadow-xs border border-white/40 dark:border-white/20">
                    {client.initials || client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
                </div>

                {/* Name & Subtext */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {client.name}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0D3B36] dark:text-amber-300 border border-slate-200 dark:border-slate-700">
                      {client.garmentTag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>{client.timestamp || 'Just now'}</span>
                    <span>•</span>
                    <span className="text-[#DCA134] font-bold">
                      Balance: GH₵ {client.balanceDue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Capsule Group */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 self-end sm:self-auto glass-capsule px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-white/90 dark:border-slate-700 shadow-2xs relative"
              >
                {/* Ruler / Garment Measurements */}
                <button
                  type="button"
                  onClick={() => onOpenMeasurements(client)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 transition-colors cursor-pointer"
                  title="Garment Measurements"
                >
                  <Ruler className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
                </button>

                {/* Full Measurements Shortcut Button */}
                <button
                  type="button"
                  onClick={() => onOpenFullMeasurements ? onOpenFullMeasurements(client) : onSelectClient && onSelectClient(client)}
                  className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                  title="View Full Measurements"
                >
                  <Maximize2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                </button>

                {/* Document / Invoice */}
                <button
                  type="button"
                  onClick={() => onOpenInvoice(client)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 transition-colors cursor-pointer"
                  title="View Client Invoice"
                >
                  <FileText className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
                </button>

                {/* Stack / Runway Stage */}
                <button
                  type="button"
                  onClick={() => onOpenCollectDeposit()}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0D3B36] dark:text-amber-300 transition-colors cursor-pointer"
                  title="Runway Stage & Financials"
                >
                  <Layers className="w-4 h-4 text-[#0D3B36] dark:text-amber-300" />
                </button>

                {/* Three Dot Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuClientId(isMenuOpen ? null : client.id);
                    }}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Client Options Menu"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Popover Menu matching the screenshot */}
                  {isMenuOpen && (
                    <>
                      {/* Fixed backdrop for dismissing menu */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuClientId(null);
                        }}
                      />

                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 bottom-full mb-2 z-50 w-48 bg-white dark:bg-[#0D2E2B] rounded-2xl p-2 shadow-2xl border border-slate-100 dark:border-slate-700/80 space-y-1 font-['Outfit'] animate-fade-in text-slate-800 dark:text-slate-100"
                      >
                        {/* 1. Assign Duty */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuClientId(null);
                            if (onAssignDuty) {
                              onAssignDuty(client);
                            } else {
                              onOpenCollectDeposit();
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-slate-700 dark:text-amber-300 shrink-0" />
                          <span>Assign Duty</span>
                        </button>

                        {/* 2. Full Measurements */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuClientId(null);
                            if (onOpenFullMeasurements) {
                              onOpenFullMeasurements(client);
                            } else if (onSelectClient) {
                              onSelectClient(client);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-[#0D3B36] dark:text-amber-300 cursor-pointer"
                        >
                          <Maximize2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span>Full Measurements</span>
                        </button>

                        {/* 3. Edit Measurements */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuClientId(null);
                            onOpenMeasurements(client);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Ruler className="w-4 h-4 text-slate-700 dark:text-amber-300 shrink-0" />
                          <span className="leading-tight">
                            Edit<br />Measurements
                          </span>
                        </button>

                        {/* 3. Edit Client Info */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuClientId(null);
                            onEditClient(client);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-slate-700 dark:text-amber-300 shrink-0" />
                          <span>Edit Client Info</span>
                        </button>

                        {/* 4. Delete */}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuClientId(null);
                            if (onDeleteClient) {
                              if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                                onDeleteClient(client.id);
                              }
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-left transition-colors text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>
      )}

      {/* Floating Consult Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onOpenNewConsult}
          className="px-5 py-3 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-bold shadow-lg flex items-center gap-2 fab-shadow hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DCA134] dark:text-[#0D3B36]" />
          <span>+ New Consult</span>
        </button>
      </div>
    </div>
  );
};

