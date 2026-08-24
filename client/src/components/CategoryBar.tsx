import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CategoryCount } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../i18n';

function IconKnife() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M4 20L17 7" strokeLinecap="round" />
      <path d="M14 4l6 6-3 1-4-4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPistol() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M3 13h9v-3a1 1 0 011-1h6v4h-2v3H9v3H5v-3H3z" strokeLinejoin="round" />
    </svg>
  );
}
function IconRifle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M2 15h4v-2h13v2h2v2h-2v1h-5v-3H9v3H6v-3H2z" strokeLinejoin="round" />
      <path d="M9 13v-3h6v3" strokeLinejoin="round" />
    </svg>
  );
}
function IconSniper() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M1 15h6v-2h14v3h-2v1h-6v-3H10v3H6v-3H1z" strokeLinejoin="round" />
      <circle cx="16" cy="7" r="2.4" />
      <path d="M16 9.4V13" />
    </svg>
  );
}
function IconSMG() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M3 14h11v-2h6v3h-2v1h-4v-2H9v3H6v-3H3z" strokeLinejoin="round" />
      <path d="M9 14v4H7" strokeLinecap="round" />
    </svg>
  );
}
function IconShotgun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M2 14h16v-2.5h4v3.5h-2v1h-5v-2.5H10V17H6v-3H2z" strokeLinejoin="round" />
    </svg>
  );
}
function IconMachinegun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M2 13h14v-2h6v3h-2v1h-5v-2h-2v5H9v-5H7v3H4v-3H2z" strokeLinejoin="round" />
      <circle cx="9" cy="17.5" r="1.8" />
    </svg>
  );
}
function IconGloves() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M7 21V9a1.5 1.5 0 013 0v5M10 14V6a1.5 1.5 0 013 0v6M13 12V7a1.5 1.5 0 013 0v7M16 13V9a1.5 1.5 0 013 0v6c0 3-2 6-5 6H9c-2 0-2-2-2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSticker() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <path d="M3 11.5L11.5 3H19a2 2 0 012 2v7.5L12.5 21a2 2 0 01-2.8 0L3 13.8a2 2 0 010-2.3z" strokeLinejoin="round" />
      <circle cx="15.5" cy="7.5" r="1.4" />
    </svg>
  );
}
function IconOther() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4">
      <rect x="4" y="4" width="7" height="7" rx="1.2" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" />
    </svg>
  );
}

const OTHER_CATEGORIES = ['Container', 'Agent', 'Collectible', 'Graffiti', 'Music Kit', 'Patch', 'Key'];

const PRIMARY = [
  { tag: 'Knife', Icon: IconKnife },
  { tag: 'Pistol', Icon: IconPistol },
  { tag: 'Rifle', Icon: IconRifle },
  { tag: 'Sniper Rifle', Icon: IconSniper },
  { tag: 'SMG', Icon: IconSMG },
  { tag: 'Shotgun', Icon: IconShotgun },
  { tag: 'Machinegun', Icon: IconMachinegun },
  { tag: 'Gloves', Icon: IconGloves },
  { tag: 'Sticker', Icon: IconSticker },
];

export default function CategoryBar() {
  const { language } = useLanguage();
  const [groups, setGroups] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [openTag, setOpenTag] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getCategoryGroups().then(setGroups).catch(console.error);
    api.listCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!openTag) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenTag(null);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [openTag]);

  const knownTags = new Set([...PRIMARY.map((p) => p.tag), ...OTHER_CATEGORIES]);
  const availableTags = new Set(categories.map((c) => c.category));
  const otherCategoriesPresent = categories.filter((c) => OTHER_CATEGORIES.includes(c.category));
  const extraUnknownCategories = categories.filter((c) => !knownTags.has(c.category));

  const entries = PRIMARY.filter((p) => availableTags.has(p.tag) || (groups[p.tag]?.length ?? 0) > 0);

  if (entries.length === 0 && otherCategoriesPresent.length === 0 && extraUnknownCategories.length === 0) return null;

  return (
    <div className="border-b border-white/5 bg-neutral-950/50">
      <div ref={ref} className="max-w-6xl mx-auto px-6 flex items-center gap-1 overflow-x-auto text-sm">
        {entries.map(({ tag, Icon }) => {
          const weapons = groups[tag] ?? [];
          return (
            <div key={tag} className="relative shrink-0">
              <button
                onClick={() => setOpenTag((v) => (v === tag ? null : tag))}
                className="flex items-center gap-1.5 px-3 py-2.5 text-neutral-400 hover:text-neutral-100 transition-colors whitespace-nowrap"
              >
                <Icon />
                <Link to={`/?category=${encodeURIComponent(tag)}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                  {translate(language, `category.${tag}`)}
                </Link>
                {weapons.length > 0 && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`w-3 h-3 transition-transform ${openTag === tag ? 'rotate-180' : ''}`}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              {openTag === tag && weapons.length > 0 && (
                <div className="absolute left-0 top-full z-20 w-56 max-h-80 overflow-y-auto rounded-lg border border-white/10 bg-neutral-900 shadow-xl shadow-black/40 py-1">
                  {weapons.map((weapon) => (
                    <Link
                      key={weapon}
                      to={`/?category=${encodeURIComponent(tag)}&search=${encodeURIComponent(weapon)}`}
                      onClick={() => setOpenTag(null)}
                      className="block px-3 py-2 text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {weapon}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {(otherCategoriesPresent.length > 0 || extraUnknownCategories.length > 0) && (
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenTag((v) => (v === 'other' ? null : 'other'))}
              className="flex items-center gap-1.5 px-3 py-2.5 text-neutral-400 hover:text-neutral-100 transition-colors whitespace-nowrap"
            >
              <IconOther />
              {translate(language, 'category.other')}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-3 h-3 transition-transform ${openTag === 'other' ? 'rotate-180' : ''}`}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {openTag === 'other' && (
              <div className="absolute left-0 top-full z-20 w-56 rounded-lg border border-white/10 bg-neutral-900 shadow-xl shadow-black/40 py-1">
                {[...otherCategoriesPresent, ...extraUnknownCategories].map((c) => (
                  <Link
                    key={c.category}
                    to={`/?category=${encodeURIComponent(c.category)}`}
                    onClick={() => setOpenTag(null)}
                    className="block px-3 py-2 text-neutral-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {(() => {
                      const key = `category.${c.category}`;
                      const translated = translate(language, key);
                      return translated === key ? c.category : translated;
                    })()}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
