import React, { useState } from 'react';
import { Plus, Scissors, Users, Eye, X, Search, Sparkles } from 'lucide-react';
import { Client, UnpaidDeposit } from '../types';
import { SwipeableClientCard } from './common/SwipeableClientCard';
import { useTranslation } from '../i18n/useTranslation';

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
  unpaidDeposits = [],
  onOpenCollectDeposit,
  onEditClient,
  onOpenMeasurements,
  onOpenFullMeasurements,
  onOpenInvoice,
  onOpenNewConsult,
  onSelectClient,
  onDeleteClient
}) => {
  const { t } = useTranslation();
  const [isAllClientsModalOpen, setIsAllClientsModalOpen] = useState<boolean>(false);
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  const handleCollectDepositForClient = (client: Client) => {
    const existing = unpaidDeposits?.find(
      (d) => d.clientId === client.id || d.clientName?.toLowerCase() === client.name.toLowerCase()
    );
    const depositToOpen: UnpaidDeposit = existing || {
      id: `dep-${client.id}`,
      clientId: client.id,
      clientName: client.name,
      garmentTag: client.garmentTag || 'Custom Order',
      amount: (client.balanceDue && client.balanceDue > 0) ? client.balanceDue : Math.max(0, (client.totalCost || 0) - (client.depositPaid || 0)),
      daysOverdue: 0,
      phone: client.phone || ''
    };
    onOpenCollectDeposit(depositToOpen);
  };

  const hasMoreThanThree = clients.length > 3;
  const visibleClients = hasMoreThanThree ? clients.slice(0, 3) : clients;

  const modalFilteredClients = clients.filter((c) => {
    if (!modalSearchQuery.trim()) return true;
    const q = modalSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.garmentTag.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="my-6 space-y-4 font-['Outfit']">
      {/* Directory Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg sm:text-xl text-[#0D3B36] dark:text-[#DCA134] tracking-tight uppercase">
            {t('customerDirectory')}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {t('swipeTip')}
          </p>
        </div>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {clients.length} {t('activeCount')}
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
              {t('noClientsYet')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              {t('noClientsDesc')}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewConsult}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D3B36] hover:bg-[#082824] dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createFirstClient')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleClients.map((client) => (
            <SwipeableClientCard
              key={client.id}
              client={client}
              onSelectClient={(c) => onSelectClient && onSelectClient(c)}
              onEditClient={onEditClient}
              onOpenMeasurements={onOpenMeasurements}
              onOpenFullMeasurements={onOpenFullMeasurements}
              onOpenInvoice={onOpenInvoice}
              onOpenCollectDeposit={handleCollectDepositForClient}
              onDeleteClient={onDeleteClient}
            />
          ))}

          {/* View All Clients Footer Action */}
          {hasMoreThanThree && (
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/70 dark:bg-[#092825]/70 p-3.5 rounded-2xl border border-slate-200 dark:border-amber-400/30 shadow-xs">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-amber-200 font-semibold min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/10 border border-[#0D3B36]/20 dark:border-amber-400/30 flex items-center justify-center text-[#0D3B36] dark:text-amber-300 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm truncate">
                    {t('showingOf', { shown: 3, total: clients.length })}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-amber-200/70 font-normal block truncate">
                    {t('openFullDirectory')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAllClientsModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0D3B36] hover:bg-[#082824] dark:bg-[#DCA134] dark:hover:bg-[#c9902b] text-white dark:text-[#0D3B36] font-black text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
                <span>{t('viewAllClients', { count: clients.length })}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Consult Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onOpenNewConsult}
          className="px-5 py-3 rounded-full bg-[#0D3B36] dark:bg-amber-400 hover:bg-[#082824] dark:hover:bg-amber-300 text-white dark:text-[#0D3B36] text-xs font-bold shadow-lg flex items-center gap-2 fab-shadow hover:scale-105 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#DCA134] dark:text-[#0D3B36]" />
          <span>{t('newConsult')}</span>
        </button>
      </div>

      {/* Dedicated Full-Screen All Clients Directory Modal */}
      {isAllClientsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-2.5 sm:p-4 pt-10 sm:pt-12 pb-6 sm:pb-8 animate-fade-in font-['Outfit'] select-none h-screen w-screen overflow-hidden">
          <div className="w-full max-w-4xl h-full flex flex-col gap-2.5 sm:gap-3.5 overflow-hidden">
            {/* Modal Header Bar */}
            <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-amber-400/30 rounded-2xl p-3 sm:p-4 sm:px-5 text-slate-900 dark:text-white shadow-2xl space-y-2 sm:space-y-2.5 w-full shrink-0">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2.5 rounded-xl bg-[#0D3B36]/10 dark:bg-amber-400/20 border border-[#0D3B36]/20 dark:border-amber-400/40 text-[#0D3B36] dark:text-amber-300 shrink-0">
                    <Users className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs xs:text-sm sm:text-base font-black tracking-wide uppercase text-[#0D3B36] dark:text-amber-300 leading-snug break-words">
                      ALL BESPOKE CLIENT DOSSIERS ({clients.length})
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold leading-tight mt-0.5 hidden xs:block">
                      Swipe left for WhatsApp & call • Tap to inspect client measurements.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAllClientsModalOpen(false);
                    setModalSearchQuery('');
                  }}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
                  title="Close All Clients Modal"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Modal Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client dossiers by name, tag, phone..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#DCA134]"
                />
              </div>
            </div>

            {/* Modal Body: Scrollable Client List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 pb-4">
              {modalFilteredClients.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 border border-slate-200 dark:border-slate-800">
                  <Users className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p className="text-xs sm:text-sm font-bold">No clients match "{modalSearchQuery}"</p>
                </div>
              ) : (
                modalFilteredClients.map((client) => (
                  <SwipeableClientCard
                    key={client.id}
                    client={client}
                    onSelectClient={(c) => {
                      setIsAllClientsModalOpen(false);
                      onSelectClient && onSelectClient(c);
                    }}
                    onEditClient={(c) => {
                      setIsAllClientsModalOpen(false);
                      onEditClient(c);
                    }}
                    onOpenMeasurements={(c) => {
                      setIsAllClientsModalOpen(false);
                      onOpenMeasurements(c);
                    }}
                    onOpenFullMeasurements={(c) => {
                      setIsAllClientsModalOpen(false);
                      onOpenFullMeasurements && onOpenFullMeasurements(c);
                    }}
                    onOpenInvoice={(c) => {
                      setIsAllClientsModalOpen(false);
                      onOpenInvoice(c);
                    }}
                    onOpenCollectDeposit={(c) => {
                      setIsAllClientsModalOpen(false);
                      handleCollectDepositForClient(c);
                    }}
                    onDeleteClient={(id) => {
                      setIsAllClientsModalOpen(false);
                      onDeleteClient && onDeleteClient(id);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
