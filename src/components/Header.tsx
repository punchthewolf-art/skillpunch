"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { motion } from "framer-motion";

export default function Header() {
  const { t } = useLanguage();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">📡</span>
          <span className="gradient-text-cyan text-xl font-bold">
            {t("header.title")}
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-gray-400">
            {t("header.tagline")}
          </span>
          <LanguageToggle />
        </div>
      </div>
    </motion.header>
  );
}
