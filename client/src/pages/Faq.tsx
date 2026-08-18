import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useT } from '../i18n';

interface QA {
  q: string;
  a: string;
}

function FaqItem({ q, a }: QA) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/5 bg-neutral-900/60 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-neutral-100">{q}</span>
        <span
          className={`shrink-0 w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 transition-transform ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && <div className="px-5 pb-4 text-sm text-neutral-400 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function Faq() {
  const t = useT();
  const faq: QA[] = Array.from({ length: 10 }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
        {t('orderPage.back')}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mt-4 mb-2">{t('faq.title')}</h1>
      <p className="text-neutral-500 text-sm mb-6">{t('faq.subtitle')}</p>

      <div className="space-y-3">
        {faq.map((item) => (
          <FaqItem key={item.q} {...item} />
        ))}
      </div>
    </div>
  );
}
