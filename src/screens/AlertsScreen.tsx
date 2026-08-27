import { Bell, BellOff, TrendingDown } from 'lucide-react';
import type { AlertItem } from '@/types';

interface AlertsScreenProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

export function AlertsScreen({ alerts, onDismiss }: AlertsScreenProps) {
  const unread = alerts.filter((a) => !a.read);
  const read = alerts.filter((a) => a.read);

  return (
    <div className="pb-24 animate-fade-in">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold">Alertes</h1>
        <p className="text-sm text-slate-400 mt-1">
          Soyez prévenu dès qu'une meilleure affaire apparaît.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 mt-20 px-5">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
            <BellOff className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-sm text-slate-400 text-center">
            Aucune alerte pour le moment.<br />
            Analysez un produit puis touchez « Alerte » pour être notifié.
          </p>
        </div>
      ) : (
        <div className="px-5 space-y-5">
          {unread.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Nouvelles</p>
              <div className="space-y-2">
                {unread.map((a) => (
                  <AlertCard key={a.id} alert={a} onDismiss={onDismiss} />
                ))}
              </div>
            </div>
          )}
          {read.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Plus tôt</p>
              <div className="space-y-2">
                {read.map((a) => (
                  <AlertCard key={a.id} alert={a} onDismiss={onDismiss} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, onDismiss }: { alert: AlertItem; onDismiss: (id: string) => void }) {
  return (
    <div className={`flex gap-3 bg-slate-800/60 border rounded-2xl p-3 ${alert.read ? 'border-slate-700/30' : 'border-emerald-500/30'}`}>
      <img src={alert.image} alt={alert.productTitle} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{alert.productTitle}</p>
        <p className="text-xs text-slate-400 mt-0.5">{alert.message}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-xs">
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{alert.newPrice.toLocaleString('fr-FR')} €</span>
            <span className="text-slate-600 line-through">{alert.oldPrice.toLocaleString('fr-FR')} €</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Bell className="w-3 h-3" />
            Score {alert.oldScore} → {alert.newScore}
          </div>
        </div>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="self-start text-xs text-slate-500 hover:text-slate-300 transition"
      >
        Ignorer
      </button>
    </div>
  );
}
