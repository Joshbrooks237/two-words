"use client";

import { useState, useRef, useEffect } from "react";

const EXAMPLES = [
  ["raccoon", "mortgage"],
  ["elevator", "kumquat"],
  ["senator", "mayonnaise"],
  ["velvet", "chainsaw"],
  ["penguin", "bankruptcy"],
  ["doorknob", "symphony"],
];

const LS_KEY = "two_words_saved_stories";

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function Home() {
  const [word1, setWord1] = useState("");
  const [word2, setWord2] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayedStory, setDisplayedStory] = useState("");
  const [wordPair, setWordPair] = useState(["", ""]);
  const [saved, setSaved] = useState([]);
  const [justSaved, setJustSaved] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const storyRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  useEffect(() => {
    if (!story) return;
    setDisplayedStory("");
    setIsTyping(true);
    let i = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedStory(story.slice(0, i));
      if (i >= story.length) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
    }, 12);
    return () => clearInterval(intervalRef.current);
  }, [story]);

  useEffect(() => {
    if (displayedStory && storyRef.current) {
      storyRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [displayedStory]);

  async function generate(w1, w2) {
    if (!w1.trim() || !w2.trim()) return;
    setLoading(true);
    setStory("");
    setDisplayedStory("");
    setError("");
    setJustSaved(false);
    setWordPair([w1.trim(), w2.trim()]);

    try {
      const res = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word1: w1, word2: w2 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStory(data.story);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    generate(word1, word2);
  }

  function useExample(pair) {
    setWord1(pair[0]);
    setWord2(pair[1]);
    generate(pair[0], pair[1]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit(e);
  }

  function saveStory() {
    const entry = {
      id: Date.now().toString(),
      word1: wordPair[0],
      word2: wordPair[1],
      story,
      timestamp: Date.now(),
    };
    const updated = [entry, ...loadSaved()];
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setSaved(updated);
    setJustSaved(true);
  }

  function deleteStory(id) {
    const updated = saved.filter((s) => s.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setSaved(updated);
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>✦ AI Story Generator ✦</div>
          <h1 style={styles.title}>
            Two<br />
            <span style={styles.titleAccent}>Words</span>
          </h1>
          <p style={styles.subtitle}>
            Enter any two words. Get a completely unhinged story.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputRow}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>WORD ONE</label>
              <input
                style={styles.input}
                type="text"
                value={word1}
                onChange={(e) => setWord1(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="raccoon"
                maxLength={40}
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div style={styles.ampersand}>+</div>

            <div style={styles.inputWrapper}>
              <label style={styles.label}>WORD TWO</label>
              <input
                style={styles.input}
                type="text"
                value={word2}
                onChange={(e) => setWord2(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="mortgage"
                maxLength={40}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonLoading : {}),
            }}
            disabled={loading || !word1.trim() || !word2.trim()}
          >
            {loading ? (
              <span style={styles.loadingInner}>
                <span style={styles.spinner} /> Generating...
              </span>
            ) : (
              "Tell Me a Story →"
            )}
          </button>
        </form>

        {/* Example prompts */}
        <div style={styles.examples}>
          <span style={styles.examplesLabel}>Try these:</span>
          <div style={styles.exampleChips}>
            {EXAMPLES.map((pair) => (
              <button
                key={pair.join("-")}
                style={styles.chip}
                onClick={() => useExample(pair)}
                disabled={loading}
              >
                {pair[0]} + {pair[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Story output */}
        {(displayedStory || loading || error) && (
          <div style={styles.storyCard} ref={storyRef}>
            {loading && !displayedStory && (
              <div style={styles.loadingPlaceholder}>
                <div style={styles.loadingDots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
                <p style={styles.loadingText}>
                  Consulting the absurdist muse...
                </p>
              </div>
            )}

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠</span> {error}
              </div>
            )}

            {displayedStory && (
              <>
                <div style={styles.storyMeta}>
                  <span style={styles.storyWord}>{wordPair[0]}</span>
                  <span style={styles.storyPlus}> × </span>
                  <span style={styles.storyWord}>{wordPair[1]}</span>
                </div>
                <div style={styles.storyDivider} />
                <p style={styles.storyText}>{displayedStory}</p>

                {!isTyping && (
                  <div style={styles.saveRow}>
                    <button
                      style={justSaved ? styles.savedButton : styles.saveButton}
                      onClick={saveStory}
                      disabled={justSaved}
                    >
                      {justSaved ? "✓ Saved" : "Save Story"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Saved Stories */}
        {saved.length > 0 && (
          <div style={styles.savedSection}>
            <div style={styles.savedHeader}>
              <span style={styles.savedHeaderLabel}>SAVED STORIES</span>
              <span style={styles.savedCount}>{saved.length}</span>
            </div>

            <div style={styles.savedList}>
              {saved.map((entry) => (
                <div key={entry.id} style={styles.savedCard}>
                  <div style={styles.savedCardHeader}>
                    <div style={styles.savedMeta}>
                      <span style={styles.storyWord}>{entry.word1}</span>
                      <span style={styles.storyPlus}> × </span>
                      <span style={styles.storyWord}>{entry.word2}</span>
                    </div>
                    <button
                      style={styles.deleteButton}
                      onClick={() => deleteStory(entry.id)}
                      title="Delete story"
                    >
                      ✕
                    </button>
                  </div>
                  <div style={styles.savedTimestamp}>{formatDate(entry.timestamp)}</div>
                  <div style={styles.storyDivider} />
                  <p style={styles.savedStoryText}>{entry.story}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer style={styles.footer}>
          Made with two words and zero restraint.
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)",
    fontFamily: "'Inter', sans-serif",
    color: "#f0f0f0",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 20px 60px",
  },
  container: {
    width: "100%",
    maxWidth: "660px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  badge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.15em",
    color: "#fbbf24",
    marginBottom: "20px",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(60px, 12vw, 100px)",
    fontWeight: 700,
    lineHeight: 0.95,
    margin: "0 0 20px",
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  titleAccent: {
    fontStyle: "italic",
    color: "#fbbf24",
  },
  subtitle: {
    fontSize: "16px",
    color: "#9ca3af",
    margin: 0,
    fontWeight: 400,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
  },
  inputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    fontSize: "20px",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    background: "#16161e",
    border: "1.5px solid #2a2a35",
    borderRadius: "10px",
    color: "#f9fafb",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  ampersand: {
    fontSize: "24px",
    fontWeight: 300,
    color: "#4b5563",
    paddingBottom: "14px",
    userSelect: "none",
  },
  button: {
    padding: "16px 28px",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    color: "#0a0a0f",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    animation: "pulse-glow 2.5s ease-in-out infinite",
  },
  buttonLoading: {
    background: "#2a2a35",
    color: "#6b7280",
    animation: "none",
  },
  loadingInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #4b5563",
    borderTopColor: "#9ca3af",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  examples: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px",
  },
  examplesLabel: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: "#4b5563",
    textTransform: "uppercase",
  },
  exampleChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 500,
    background: "#16161e",
    border: "1px solid #2a2a35",
    borderRadius: "999px",
    color: "#9ca3af",
  },
  storyCard: {
    marginTop: "36px",
    background: "#16161e",
    border: "1px solid #2a2a35",
    borderRadius: "14px",
    padding: "32px",
  },
  storyMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginBottom: "16px",
  },
  storyWord: {
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.05em",
    color: "#fbbf24",
    textTransform: "uppercase",
    background: "rgba(251, 191, 36, 0.1)",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  storyPlus: {
    color: "#4b5563",
    fontSize: "14px",
    margin: "0 4px",
  },
  storyDivider: {
    height: "1px",
    background: "#2a2a35",
    marginBottom: "24px",
  },
  storyText: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#d1d5db",
    margin: 0,
    whiteSpace: "pre-wrap",
    fontWeight: 400,
  },
  saveRow: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "flex-end",
  },
  saveButton: {
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: 600,
    background: "transparent",
    border: "1.5px solid #fbbf24",
    borderRadius: "8px",
    color: "#fbbf24",
    cursor: "pointer",
    letterSpacing: "0.03em",
  },
  savedButton: {
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: 600,
    background: "rgba(251, 191, 36, 0.1)",
    border: "1.5px solid #4b5563",
    borderRadius: "8px",
    color: "#6b7280",
    cursor: "not-allowed",
    letterSpacing: "0.03em",
  },
  savedSection: {
    marginTop: "52px",
  },
  savedHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  savedHeaderLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "#4b5563",
    textTransform: "uppercase",
  },
  savedCount: {
    fontSize: "11px",
    fontWeight: 700,
    background: "#2a2a35",
    color: "#6b7280",
    padding: "2px 8px",
    borderRadius: "999px",
  },
  savedList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  savedCard: {
    background: "#16161e",
    border: "1px solid #2a2a35",
    borderRadius: "14px",
    padding: "24px 28px",
  },
  savedCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  savedMeta: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  savedTimestamp: {
    fontSize: "11px",
    color: "#4b5563",
    marginBottom: "16px",
    fontStyle: "italic",
  },
  savedStoryText: {
    fontSize: "15px",
    lineHeight: "1.75",
    color: "#9ca3af",
    margin: 0,
    whiteSpace: "pre-wrap",
    fontWeight: 400,
  },
  deleteButton: {
    background: "transparent",
    border: "1px solid #2a2a35",
    borderRadius: "6px",
    color: "#4b5563",
    fontSize: "12px",
    padding: "4px 8px",
    cursor: "pointer",
    lineHeight: 1,
    flexShrink: 0,
  },
  loadingPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "20px 0",
  },
  loadingDots: {
    display: "flex",
    gap: "8px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#fbbf24",
    display: "inline-block",
    animation: "bounce 1.4s ease-in-out infinite",
  },
  loadingText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
    fontStyle: "italic",
  },
  errorBox: {
    color: "#f87171",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  errorIcon: {
    fontSize: "16px",
  },
  footer: {
    textAlign: "center",
    marginTop: "48px",
    fontSize: "12px",
    color: "#374151",
    fontStyle: "italic",
  },
};
