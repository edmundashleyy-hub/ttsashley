import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE;

const VOICES = [
  "Joanna", "Matthew", "Amy", "Ivy", "Justin", "Kendra", "Stephen", "Aditi",
];

const sampleLines = [
  "The morning spills gold across the roof of the world,",
  "A soft hush where day and night softly unfurl,",
  "Leaves whisper secrets only wind can keep,",
  "In the quiet place where memories sleep,",
  "Moonlight stitches silver seams on the sea,",
  "Every small moment folds into eternity.",
];

function pickPoem(lines = sampleLines, count = 3) {
  const used = new Set();
  const out = [];
  while (out.length < count) {
    const i = Math.floor(Math.random() * lines.length);
    if (!used.has(i)) {
      used.add(i);
      out.push(lines[i]);
    }
  }
  return out.join(" ");
}

export default function App() {
  const [text, setText] = useState("Hello — type or generate a poem!");
  const [voice, setVoice] = useState(VOICES[0]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [lastUrl, setLastUrl] = useState("");
  const [dark, setDark] = useState(true); // dark mode toggle
  const audioRef = useRef(null);

  async function handleSpeak() {
    if (!text || !text.trim()) {
      setStatus("Please type or generate some text first.");
      return;
    }
    setLoading(true);
    setStatus("Generating audio...");
    try {
      const res = await fetch(API_BASE + "/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || JSON.stringify(payload));
      const url = payload.url;
      setLastUrl(url);
      setStatus("Playing audio — enjoy!");
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error(err);
      setStatus("Error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  }

  function handleGenerate() {
    const poem = pickPoem();
    setText(poem);
    setStatus("Poem generated — click Speak to hear it.");
  }

  function handleClear() {
    setText("");
    setStatus("");
    setLastUrl("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
  }

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Gradient blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[10%] right-[-20%] w-[40rem] h-[40rem] bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-[40rem] h-[40rem] bg-purple-400 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-3xl w-full bg-white/70 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20"
        >
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="w-full text-center text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
              ✨ Ashley&apos;s Poetic TTS ✨
            </h1>

            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="absolute right-6 top-6 px-3 py-1 text-sm rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </header>

          {/* Main */}
          <main>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Text input */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 dark:text-gray-200 mb-2">
                  Text to speak
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/40 outline-none focus:ring-2 focus:ring-pink-400 transition"
                />

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                  >
                    🎨 Generate Poem
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSpeak}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg hover:from-indigo-600 hover:to-blue-600 disabled:opacity-60 transition-all"
                  >
                    {loading ? "🔄 Generating..." : "🔊 Speak"}
                  </motion.button>

                  <button
                    onClick={handleClear}
                    className="ml-auto px-3 py-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition"
                  >
                    ❌ Clear
                  </button>
                </div>

                <div className="mt-3 text-sm text-gray-600 dark:text-white/70">
                  {status}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="md:col-span-1 bg-gray-100 dark:bg-white/5 p-4 rounded-xl shadow-inner border border-white/10">
                {/* Voice select */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Voice
                  </h3>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full mt-2 rounded-lg p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-400"
                  >
                    {VOICES.map((v) => (
                      <option key={v} value={v} className="text-black">
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick samples */}
                <div>
                  <h4 className="text-xs text-gray-700 dark:text-white/80 font-medium">
                    Quick samples
                  </h4>
                  <div className="mt-2 text-sm space-y-2">
                    {sampleLines.slice(0, 3).map((l, i) => (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={i}
                        onClick={() => setText(l)}
                        className="w-full text-left p-2 rounded-lg bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20 transition"
                      >
                        {l}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Last audio */}
                <div className="mt-4 text-xs text-gray-600 dark:text-white/60">
                  Last generated audio:{" "}
                  {lastUrl ? (
                    <a
                      href={lastUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-pink-500"
                    >
                      Open
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </aside>
            </div>

            {/* Audio Player */}
            <div className="mt-6 bg-gray-100 dark:bg-white/10 p-4 rounded-xl shadow-lg border border-white/10">
              <audio ref={audioRef} controls className="w-full" />
            </div>

            {/* Footer */}
            <footer className="mt-6 text-xs text-gray-600 dark:text-white/60 text-center italic">
              “Built with AWS Lambda • Polly • S3 — Dreamy gradients powered UI 🎨”
            </footer>
          </main>
        </motion.div>
      </div>
    </div>
  );
}
