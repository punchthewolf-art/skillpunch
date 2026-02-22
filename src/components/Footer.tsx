"use client";

import { useLanguage } from "@/i18n/LanguageContext";

const promoLinks = [
  {
    key: "roastmyresume",
    url: "https://roastmyresume.pro",
    descKey: "roastmyresumeDesc",
  },
  {
    key: "copypunch",
    url: "https://copypunch.pro",
    descKey: "copypunchDesc",
  },
  {
    key: "astrocareer",
    url: "https://astropunch.pro",
    descKey: "astrocareerDesc",
  },
  {
    key: "graphotype",
    url: "https://graphopunch.pro",
    descKey: "graphotypeDesc",
  },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="mb-8 text-center text-sm text-cyan-400 font-medium uppercase tracking-wider">
          {t("footer.discover")}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {promoLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-all hover:border-cyan-400/50 hover:bg-white/10"
            >
              <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {t(`footer.${link.key}`)}
              </p>
              <p className="mt-1 text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                {t(`footer.${link.descKey}`)}
              </p>
            </a>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>📡</span>
          <p>
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
