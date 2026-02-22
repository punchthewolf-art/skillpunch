"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-sm border border-white/10">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage("fr")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
          language === "fr"
            ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            : "text-gray-400 hover:text-white"
        }`}
      >
        FR
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-200 ${
          language === "en"
            ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            : "text-gray-400 hover:text-white"
        }`}
      >
        EN
      </motion.button>
    </div>
  );
}
