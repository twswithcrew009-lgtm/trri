import { useState } from "react";

const stages = [
  { name: "Artist Stage", live: true },
  { name: "X Stage", live: true },
  { name: "Mcountdown Stage", live: true },
];

export function WelcomeSplit() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === "admin" && password === "admin123") {
        setSuccess(true);
      } else {
        setError("Incorrect username or password. Please try again.");
      }
    }, 800);
  }

  return (
    <div
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
      className="w-full h-screen bg-black flex overflow-hidden"
    >
      {/* ── LEFT: Video Display ── */}
      <div className="relative w-[52%] h-full flex items-center justify-center bg-black overflow-hidden">
        {/* Vignette */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }}
        />

        {/* Video slot */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          autoPlay loop muted playsInline
        >
          {/* <source src="YOUR_GITHUB_RAW_VIDEO_URL" type="video/mp4" /> */}
        </video>

        {/* Centre placeholder */}
        <div className="relative z-20 flex flex-col items-center gap-4 text-center px-8">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="18" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <path d="M15 12.5l13 6.5-13 6.5V12.5z" fill="white"/>
            </svg>
          </div>
          <p className="text-white/40 text-[13px] tracking-widest uppercase font-medium">Video will play here</p>
          <p className="text-white/25 text-[11px] leading-relaxed max-w-[180px]">
            Upload your video to GitHub and link it in the source
          </p>
        </div>

        {/* Top-left branding */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-white/50 text-[12px] tracking-widest uppercase font-medium">KCON 2026</p>
          <p className="text-white/30 text-[11px] mt-0.5">Stream Rooms</p>
        </div>

        {/* ── Dynamic Island — bottom centre ── */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 px-6">
          <div
            style={{
              background: "rgba(20,20,20,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "9999px",
              padding: "10px 20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            className="flex items-center gap-4"
          >
            {/* Pulsing red live dot (left anchor) */}
            <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
              <div className="absolute w-5 h-5 rounded-full bg-red-500 opacity-25 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>

            {/* Stage names */}
            <div className="flex items-center gap-3">
              {stages.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2">
                  {i > 0 && <div className="w-px h-3 bg-white/15" />}
                  <span className="text-white text-[12px] font-medium whitespace-nowrap">{s.name}</span>
                </div>
              ))}
            </div>

            {/* LIVE badge (right anchor) */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(255,59,48,0.18)", border: "1px solid rgba(255,59,48,0.35)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-red-400 text-[11px] font-semibold uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* ── RIGHT: Login Panel ── */}
      <div className="flex-1 h-full flex flex-col justify-center px-14 bg-black">
        {/* Headline */}
        <div className="mb-10">
          <h1
            className="text-white font-bold leading-[1.08] mb-5"
            style={{ fontSize: "clamp(28px, 3.2vw, 46px)", letterSpacing: "-0.02em" }}
          >
            Your stage,{" "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>your moment.</span>
          </h1>
          <p className="text-white/40 text-[15px] leading-relaxed max-w-[320px]">
            Live performances, curated for you. Sign in to access all three stages.
          </p>
        </div>

        {/* Login area */}
        <div className="max-w-[340px]">
          {/* ── Collapsed: single button ── */}
          {!formOpen && !success && (
            <button
              onClick={() => setFormOpen(true)}
              className="w-full py-4 rounded-2xl text-black font-semibold text-[15px] transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "white",
                letterSpacing: "-0.01em",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 8px 24px rgba(255,255,255,0.08)",
              }}
            >
              Login Here
            </button>
          )}

          {/* ── Expanded: drop-down form ── */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: formOpen && !success ? "420px" : "0px",
              opacity: formOpen && !success ? 1 : 0,
              transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
            }}
          >
            <form onSubmit={handleLogin} className="flex flex-col gap-3 pt-1">
              {/* Username */}
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  placeholder="Enter username"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", transition: "border 0.2s" }}
                  onFocus={e => (e.target.style.border = "1px solid rgba(255,255,255,0.35)")}
                  onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    className="w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none placeholder:text-white/20 pr-16"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", transition: "border 0.2s" }}
                    onFocus={e => (e.target.style.border = "1px solid rgba(255,255,255,0.35)")}
                    onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-[12px] font-medium hover:text-white/60 transition-colors"
                  >
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.22)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <circle cx="8" cy="8" r="8" fill="#FF3B30" fillOpacity="0.9"/>
                    <path d="M8 4.5v4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.9" fill="white"/>
                  </svg>
                  <span className="text-[13px]" style={{ color: "#FF6B6B" }}>{error}</span>
                </div>
              )}

              {/* Buttons row */}
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setFormOpen(false); setError(""); setUsername(""); setPassword(""); }}
                  className="py-4 px-5 rounded-xl text-white/40 text-[14px] font-medium transition-all hover:text-white/60"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl text-black font-semibold text-[15px] transition-all"
                  style={{ background: "white", opacity: loading ? 0.7 : 1, letterSpacing: "-0.01em" }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5"/>
                        <path d="M8 2a6 6 0 016 6" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                      Signing in…
                    </span>
                  ) : "Sign In"}
                </button>
              </div>
            </form>
          </div>

          {/* ── Success state ── */}
          {success && (
            <div
              className="w-full py-4 rounded-2xl text-center font-semibold text-[15px]"
              style={{ background: "#34C759", color: "black" }}
            >
              Welcome back ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
