import { Link } from 'react-router-dom';
import { useT } from '../i18n';

export default function Privacy() {
  const t = useT();
  const sections = Array.from({ length: 7 }, (_, i) => ({
    title: t(`privacy.title${i + 1}`),
    body: t(`privacy.body${i + 1}`),
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
        {t('orderPage.back')}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mt-4 mb-2">{t('privacy.pageTitle')}</h1>
      <p className="text-neutral-500 text-sm mb-8">{t('privacy.intro')}</p>

      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-sm font-semibold text-neutral-100 mb-2">{s.title}</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
