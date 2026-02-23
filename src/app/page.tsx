"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RadarChart from "@/components/RadarChart";

interface SkillData {
  name: string;
  category: string;
  demand: string;
  value: number;
}

interface AnalysisResult {
  employabilityScore: number;
  skills: SkillData[];
  topSkills: string[];
  gaps: string[];
  prediction: string;
  salaryEstimate: string;
  formations: string[];
  marketComparison: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [cvText, setCvText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setCvText("");
    }
  };

  const handleAnalyze = async () => {
    setError("");
    if (!cvText.trim() && !pdfFile) {
      setError(t("form.errorEmpty"));
      return;
    }

    setLoading(true);
    try {
      let response: Response;

      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        response = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cvText }),
        });
      }

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      setResult(data);

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } catch {
      setError(t("form.errorAnalysis"));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Checkout failed");
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setCvText("");
    setPdfFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shareText = result
    ? `I scored ${result.employabilityScore}/100 on SkillPunch! Discover your employability score too.`
    : "";

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return "text-emerald-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDemandLabel = (demand: string) => {
    switch (demand) {
      case "high":
        return t("result.demandHigh");
      case "medium":
        return t("result.demandMedium");
      case "low":
        return t("result.demandLow");
      default:
        return demand;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-emerald-600";
    if (score >= 60) return "from-cyan-400 to-blue-600";
    if (score >= 40) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-16">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mb-6 text-6xl sm:text-7xl"
          >
            📡
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 inline-block rounded-full bg-cyan-400/10 px-4 py-1.5 text-sm font-medium text-cyan-400 border border-cyan-400/20"
          >
            {t("hero.badge")}
          </motion.span>

          <h1 className="mb-4 text-3xl font-bold sm:text-5xl lg:text-6xl">
            <span className="gradient-text-cyan">{t("hero.title")}</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-gray-400 sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </motion.section>

        {/* Form Section */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-16"
            >
              <div className="glass glow-cyan rounded-2xl p-6 sm:p-8">
                {/* PDF Upload */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t("form.uploadLabel")}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition-all hover:border-cyan-400/50 hover:bg-white/10"
                  >
                    <svg
                      className="mb-3 h-10 w-10 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {pdfFile ? (
                      <p className="text-sm text-cyan-400 font-medium">{pdfFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-300">
                          {t("form.uploadButton")}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{t("form.uploadHint")}</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Separator */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-sm font-medium text-gray-500">{t("form.or")}</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Paste Text */}
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t("form.pasteLabel")}
                  </label>
                  <textarea
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      setPdfFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    placeholder={t("form.pastePlaceholder")}
                    rows={8}
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/25"
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 text-center text-sm text-red-400"
                  >
                    {error}
                  </motion.p>
                )}

                {/* Analyze Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {t("form.analyzing")}
                    </span>
                  ) : (
                    <>📡 {t("form.analyzeButton")}</>
                  )}
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.section
              key="results"
              ref={resultRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
                <span className="gradient-text-cyan">{t("result.title")}</span>
              </h2>

              {/* Employability Score */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 glass glow-cyan-strong rounded-2xl p-8 text-center"
              >
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-400">
                  {t("result.score")}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span
                    className={`text-6xl font-black sm:text-7xl bg-gradient-to-r ${getScoreColor(result.employabilityScore)} bg-clip-text text-transparent`}
                  >
                    {result.employabilityScore}
                  </span>
                  <span className="text-2xl text-gray-500">{t("result.scoreOut")}</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.employabilityScore}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(result.employabilityScore)}`}
                  />
                </div>
              </motion.div>

              {/* Radar Chart */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8 glass rounded-2xl p-6 sm:p-8"
              >
                <h3 className="mb-6 text-center text-lg font-semibold text-white">
                  {t("result.radar")}
                </h3>
                <RadarChart
                  skills={result.skills.slice(0, 8).map((s) => ({
                    name: s.name,
                    value: s.value,
                  }))}
                />
              </motion.div>

              {/* Top Skills & Gaps */}
              <div className="mb-8 grid gap-6 sm:grid-cols-2">
                {/* Top Skills */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="mb-4 text-lg font-semibold text-emerald-400">
                    {t("result.topSkills")}
                  </h3>
                  <ul className="space-y-3">
                    {result.topSkills.map((skill, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-bold text-emerald-400">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-200">{skill}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Gaps */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="mb-4 text-lg font-semibold text-amber-400">
                    {t("result.gaps")}
                  </h3>
                  <ul className="space-y-3">
                    {result.gaps.map((gap, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/10 text-xs font-bold text-amber-400">
                          !
                        </span>
                        <span className="text-sm text-gray-200">{gap}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Career Prediction */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-8 glass rounded-2xl p-6"
              >
                <h3 className="mb-3 text-lg font-semibold text-cyan-400">
                  {t("result.prediction")}
                </h3>
                <p className="text-sm leading-relaxed text-gray-300">{result.prediction}</p>
              </motion.div>

              {/* Skills Detail Table */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mb-8 glass rounded-2xl p-6 overflow-x-auto"
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-3 font-medium text-gray-400">Skill</th>
                      <th className="pb-3 font-medium text-gray-400">{t("result.category")}</th>
                      <th className="pb-3 font-medium text-gray-400">Demand</th>
                      <th className="pb-3 font-medium text-gray-400 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.skills.map((skill, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-2.5 text-white font-medium">{skill.name}</td>
                        <td className="py-2.5 text-gray-400">{skill.category}</td>
                        <td className={`py-2.5 ${getDemandColor(skill.demand)}`}>
                          {getDemandLabel(skill.demand)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className="font-mono text-cyan-400">{skill.value}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>

              {/* Premium Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-8 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 p-6 sm:p-8"
              >
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  {/* Salary Estimate */}
                  <div className="rounded-xl bg-white/5 p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-medium text-cyan-400">
                        {t("result.premiumLock")}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-400">
                      {t("result.salaryEstimate")}
                    </h4>
                    <p className="mt-2 text-lg font-bold text-white blur-sm">$85,000 - $120,000</p>
                  </div>

                  {/* Formations */}
                  <div className="rounded-xl bg-white/5 p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-medium text-cyan-400">
                        {t("result.premiumLock")}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-400">
                      {t("result.formations")}
                    </h4>
                    <p className="mt-2 text-sm text-white blur-sm">3 recommended courses</p>
                  </div>

                  {/* Market Comparison */}
                  <div className="rounded-xl bg-white/5 p-4 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-medium text-cyan-400">
                        {t("result.premiumLock")}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-400">
                      {t("result.marketComparison")}
                    </h4>
                    <p className="mt-2 text-sm text-white blur-sm">Top 15% of candidates</p>
                  </div>
                </div>

                <p className="mb-6 text-center text-sm text-gray-400">
                  {t("result.premiumDescription")}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
                >
                  {t("result.premiumCta")} — {t("result.premiumPrice")}€
                </motion.button>
              </motion.div>

              {/* Share & New Analysis */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-sm font-medium text-gray-400">{t("result.shareTitle")}</p>
                <div className="flex gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://skillpunch.pro")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                  >
                    {t("result.shareTwitter")}
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://skillpunch.pro")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
                  >
                    {t("result.shareLinkedin")}
                  </a>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNewAnalysis}
                  className="mt-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-cyan-400/50 hover:text-white"
                >
                  {t("result.newAnalysis")}
                </motion.button>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {!result && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
              <span className="gradient-text-cyan">{t("features.title")}</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="glass rounded-2xl p-6 transition-all hover:glow-cyan"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400/20 to-blue-600/20">
                    {i === 1 && (
                      <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    {i === 2 && (
                      <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                    {i === 3 && (
                      <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    {i === 4 && (
                      <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="mb-2 font-semibold text-white">
                    {t(`features.feature${i}.title`)}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {t(`features.feature${i}.description`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Pricing Section */}
        {!result && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
              <span className="gradient-text-cyan">{t("pricing.title")}</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
              <div className="glass rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-1">{t("pricing.freeTitle")}</h3>
                <p className="text-3xl font-black gradient-text-cyan mb-4">{t("pricing.freePrice")}</p>
                <ul className="space-y-2 mb-6">
                  {(Array.isArray(t("pricing.freeFeatures")) ? t("pricing.freeFeatures") as unknown as string[] : []).map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-green-400">{"\u2713"}</span> {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 text-center">{t("pricing.freeCta")}</p>
              </div>
              <div className="glass rounded-2xl p-6 border border-cyan-400/50 glow-cyan relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-600 text-xs font-bold px-3 py-1 rounded-full text-white">PREMIUM</div>
                <h3 className="text-lg font-bold mb-1 mt-2">{t("pricing.premiumTitle")}</h3>
                <p className="text-3xl font-black gradient-text-cyan mb-1">{t("pricing.premiumPrice")}</p>
                <p className="text-xs text-gray-500 mb-4">{t("pricing.premiumOnce")}</p>
                <ul className="space-y-2 mb-6">
                  {(Array.isArray(t("pricing.premiumFeatures")) ? t("pricing.premiumFeatures") as unknown as string[] : []).map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <span className="text-cyan-400">{"\u2713"}</span> {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 text-center">{t("pricing.premiumCta")}</p>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <Footer />
    </div>
  );
}
