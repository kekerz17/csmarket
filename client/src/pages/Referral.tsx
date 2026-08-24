import { useEffect, useState } from 'react';
import { api, API_ORIGIN, ReferralStats } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useT } from '../i18n';

function StatCard({ icon, value, label, hint }: { icon: string; value: string; label: string; hint: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-900/60 p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-lg">{icon}</span>
        <span className="text-xl font-bold">{value}</span>
      </div>
      <div className="text-sm text-neutral-200">{label}</div>
      <div className="text-xs text-neutral-500">{hint}</div>
    </div>
  );
}

export default function Referral() {
  const { user, loading: authLoading } = useAuth();
  const { format } = useCurrency();
  const t = useT();

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) api.getReferralStats().then(setStats).catch(console.error);
  }, [user]);

  function copyLink() {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-2">{t('referral.title')}</h1>
      <p className="text-sm text-neutral-400 mb-2">{t('referral.intro', { percent: stats?.percent ?? '' })}</p>
      <p className="text-xs text-neutral-600 mb-6">{t('referral.rule')}</p>

      {authLoading ? (
        <div className="skeleton h-24 rounded-xl" />
      ) : !user ? (
        <a
          href={`${API_ORIGIN}/api/auth/steam`}
          className="inline-block rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-semibold px-4 py-2.5 text-sm transition-all"
        >
          {t('referral.loginPrompt')}
        </a>
      ) : !stats ? (
        <div className="skeleton h-24 rounded-xl" />
      ) : (
        <>
          <div className="mb-6">
            <div className="text-xs text-neutral-500 mb-2">{t('referral.yourLink')}</div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-lg bg-neutral-950 border border-white/10 px-3 py-2.5 text-sm break-all">
                {stats.referralLink}
              </div>
              <button
                onClick={copyLink}
                className="shrink-0 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {copied ? t('referral.copied') : t('referral.copy')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <StatCard icon="💰" value={format(stats.totalEarnedUsd)} label={t('referral.statEarned')} hint={t('referral.statEarnedHint')} />
            <StatCard icon="%" value={`${stats.percent}%`} label={t('referral.statPercent')} hint={t('referral.statPercentHint')} />
            <StatCard icon="👥" value={String(stats.referredCount)} label={t('referral.statInvited')} hint={t('referral.statInvitedHint')} />
          </div>

          <h2 className="text-sm font-semibold mb-3">{t('referral.tableTitle')}</h2>
          {stats.referrals.length === 0 ? (
            <div className="text-sm text-neutral-500 border border-dashed border-neutral-800 rounded-xl py-10 text-center">
              {t('referral.empty')}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-neutral-500 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="py-2">{t('referral.colSteamId')}</th>
                  <th>{t('referral.colJoined')}</th>
                  <th className="text-right">{t('referral.colEarned')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.referrals.map((r) => (
                  <tr key={r.steamId64} className="border-t border-white/5">
                    <td className="py-2">
                      <a
                        href={`https://steamcommunity.com/profiles/${r.steamId64}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-300 hover:text-emerald-400 underline"
                      >
                        {r.personaName}
                      </a>
                    </td>
                    <td className="text-neutral-400">{new Date(r.joinedAt).toLocaleDateString()}</td>
                    <td className="text-right text-emerald-400 font-medium">{format(r.earnedUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
