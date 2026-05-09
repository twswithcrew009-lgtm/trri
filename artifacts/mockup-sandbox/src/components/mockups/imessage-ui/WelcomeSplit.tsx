import { useState } from "react";

const stages = [
  { name: "Artist Stage", live: true },
  { name: "X Stage", live: true },
  { name: "Mcountdown Stage", live: true },
];

const css = `
@keyframes drift1 {
  0%   { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.07; }
  33%  { transform: translateY(-28px) translateX(12px) scale(1.06); opacity: 0.13; }
  66%  { transform: translateY(-14px) translateX(-8px) scale(0.97); opacity: 0.09; }
  100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.07; }
}
@keyframes drift2 {
  0%   { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.05; }
  40%  { transform: translateY(20px) translateX(-18px) scale(1.1); opacity: 0.11; }
  70%  { transform: translateY(10px) translateX(10px) scale(0.94); opacity: 0.07; }
  100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.05; }
}
@keyframes drift3 {
  0%   { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.06; }
  50%  { transform: translateY(-22px) scale(1.12) rotate(6deg); opacity: 0.12; }
  100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.06; }
}
@keyframes rayPulse {
  0%, 100% { opacity: 0.04; }
  50%       { opacity: 0.10; }
}
@keyframes rayPulse2 {
  0%, 100% { opacity: 0.03; }
  50%       { opacity: 0.08; }
}
@keyframes crowdBreathe {
  0%, 100% { opacity: 0.18; transform: scaleY(1); }
  50%       { opacity: 0.26; transform: scaleY(1.015); }
}
@keyframes particleFloat {
  0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { transform: translateY(-80px) translateX(10px); opacity: 0; }
}
@keyframes bgShimmer {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

function DynamicBackground() {
  return (
    <>
      <style>{css}</style>

      {/* Animated dark gradient shimmer */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #000000 0%, #0a0a0a 30%, #050508 60%, #000000 100%)",
          backgroundSize: "300% 300%",
          animation: "bgShimmer 12s ease infinite",
        }}
      />

      {/* Spotlight ray 1 — left */}
      <div
        className="absolute"
        style={{
          top: "-60px", left: "8%",
          width: "180px", height: "110%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 70%)",
          clipPath: "polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)",
          animation: "rayPulse 5s ease-in-out infinite",
          transformOrigin: "top center",
        }}
      />
      {/* Spotlight ray 2 — centre */}
      <div
        className="absolute"
        style={{
          top: "-60px", left: "38%",
          width: "220px", height: "110%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 65%)",
          clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)",
          animation: "rayPulse2 7s ease-in-out 1s infinite",
          transformOrigin: "top center",
        }}
      />
      {/* Spotlight ray 3 — right */}
      <div
        className="absolute"
        style={{
          top: "-60px", right: "6%",
          width: "160px", height: "110%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 60%)",
          clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
          animation: "rayPulse 6s ease-in-out 2s infinite",
          transformOrigin: "top center",
        }}
      />

      {/* Large orb — top left */}
      <div
        className="absolute rounded-full"
        style={{
          width: "420px", height: "420px",
          top: "-80px", left: "-100px",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
          animation: "drift1 14s ease-in-out infinite",
        }}
      />
      {/* Large orb — bottom right */}
      <div
        className="absolute rounded-full"
        style={{
          width: "500px", height: "500px",
          bottom: "-120px", right: "-140px",
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
          animation: "drift2 18s ease-in-out infinite",
        }}
      />
      {/* Medium orb — centre */}
      <div
        className="absolute rounded-full"
        style={{
          width: "280px", height: "280px",
          top: "30%", left: "30%",
          background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
          animation: "drift3 11s ease-in-out infinite",
        }}
      />

      {/* Floating particles */}
      {[
        { left: "15%", bottom: "20%", delay: "0s" },
        { left: "28%", bottom: "30%", delay: "1.8s" },
        { left: "42%", bottom: "15%", delay: "3.2s" },
        { left: "58%", bottom: "25%", delay: "0.9s" },
        { left: "72%", bottom: "18%", delay: "2.5s" },
        { left: "85%", bottom: "35%", delay: "4s" },
        { left: "7%",  bottom: "40%", delay: "1.2s" },
        { left: "50%", bottom: "50%", delay: "5s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: "2px", height: "2px",
            left: p.left, bottom: p.bottom,
            background: "white",
            animation: `particleFloat ${6 + i * 0.7}s ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Crowd silhouette — bottom */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ animation: "crowdBreathe 4s ease-in-out infinite", transformOrigin: "bottom" }}
      >
        <svg viewBox="0 0 660 160" xmlns="http://www.w3.org/2000/svg"
          className="w-full" style={{ display: "block" }}>
          {/* Crowd heads and shoulders silhouette */}
          <path
            d="
              M0,160 L0,130
              Q10,115 20,130 Q25,110 35,118 Q42,100 52,110 Q58,95 68,105
              Q74,90 84,100 Q90,82 102,95 Q108,78 118,88
              Q126,72 138,84 Q144,68 154,80
              Q162,65 174,76 Q180,58 192,72
              Q198,55 210,68 Q218,50 230,64
              Q238,47 250,60 Q256,44 268,56
              Q276,40 288,54 Q294,37 306,50
              Q314,35 326,48 Q332,32 344,46
              Q352,30 364,44 Q370,28 382,42
              Q390,26 402,40 Q408,24 420,38
              Q428,22 440,36 Q446,20 458,34
              Q468,18 480,33 Q488,16 500,30
              Q508,14 520,28 Q530,12 542,26
              Q550,10 562,24 Q570,8  582,22
              Q592,10 604,20 Q612,6 624,18
              Q634,8 646,16 Q652,4 660,14
              L660,160 Z
            "
            fill="white"
            fillOpacity="0.14"
          />
          {/* Second, taller row — darker */}
          <path
            d="
              M0,160 L0,148
              Q16,135 32,148 Q40,128 56,140
              Q64,122 80,134 Q90,116 106,128
              Q116,112 132,124 Q142,108 158,120
              Q168,104 184,116 Q194,100 210,112
              Q220,96 236,108 Q248,92 264,104
              Q274,88 290,100 Q302,86 318,98
              Q328,82 344,94 Q356,80 372,92
              Q382,76 398,88 Q410,74 426,86
              Q438,72 454,84 Q464,68 480,80
              Q492,66 508,78 Q520,64 536,76
              Q548,62 564,74 Q576,60 592,72
              Q604,58 620,70 Q630,56 646,68
              Q652,54 660,64
              L660,160 Z
            "
            fill="white"
            fillOpacity="0.08"
          />
        </svg>
      </div>

      {/* Vignette on top of everything */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </>
  );
}

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
    if (!username || !password) { setError("Please enter your username and password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (username === "admin" && password === "admin123") { setSuccess(true); }
      else { setError("Incorrect username or password. Please try again."); }
    }, 800);
  }

  return (
    <div
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
      className="w-full h-screen bg-black flex overflow-hidden"
    >
      {/* ── LEFT: Dynamic Background + Video ── */}
      <div className="relative w-[52%] h-full overflow-hidden">
        <DynamicBackground />

        {/* Video overlay (when linked) */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          autoPlay loop muted playsInline
          style={{ zIndex: 5 }}
        >
          {/* <source src="YOUR_GITHUB_RAW_VIDEO_URL" type="video/mp4" /> */}
        </video>

        {/* Top-left branding */}
        <div className="absolute top-8 left-8 z-20">
          <p className="text-white/60 text-[12px] tracking-widest uppercase font-semibold">KCON 2026</p>
          <p className="text-white/30 text-[11px] mt-0.5">Stream Rooms</p>
        </div>

        {/* Centre label */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-center px-10 pointer-events-none">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" stroke="rgba(255,255,255,0.25)" strokeWidth="1.4"/>
              <path d="M12 9.5l10 5.5-10 5.5V9.5z" fill="white" fillOpacity="0.85"/>
            </svg>
          </div>
          <p className="text-white/35 text-[11px] tracking-widest uppercase font-medium">Video will play here</p>
        </div>

        {/* ── Dynamic Island ── */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-30 px-6">
          <div
            style={{
              background: "rgba(14,14,14,0.90)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "9999px",
              padding: "10px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
              <div className="absolute w-5 h-5 rounded-full bg-red-500 opacity-20 animate-ping" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
            <div className="flex items-center gap-2.5">
              {stages.map((s, i) => (
                <div key={s.name} className="flex items-center gap-2.5">
                  {i > 0 && <div className="w-px h-3 bg-white/12" />}
                  <span className="text-white/90 text-[12px] font-medium whitespace-nowrap">{s.name}</span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(255,59,48,0.16)", border: "1px solid rgba(255,59,48,0.32)" }}
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
        <div className="mb-10">
          <h1
            className="text-white font-bold leading-[1.08] mb-5"
            style={{ fontSize: "clamp(28px, 3.2vw, 46px)", letterSpacing: "-0.02em" }}
          >
            Your stage,{" "}
            <span style={{ color: "rgba(255,255,255,0.30)" }}>your moment.</span>
          </h1>
          <p className="text-white/40 text-[15px] leading-relaxed max-w-[320px]">
            Live performances, curated for you. Sign in to access all three stages.
          </p>
        </div>

        <div className="max-w-[340px]">
          {/* Single button — collapsed */}
          {!formOpen && !success && (
            <button
              onClick={() => setFormOpen(true)}
              className="w-full py-4 rounded-2xl text-black font-semibold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ background: "white", letterSpacing: "-0.01em", boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 8px 24px rgba(255,255,255,0.08)" }}
            >
              Login Here
            </button>
          )}

          {/* Drop-down form */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: formOpen && !success ? "440px" : "0px",
              opacity: formOpen && !success ? 1 : 0,
              transition: "max-height 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
            }}
          >
            <form onSubmit={handleLogin} className="flex flex-col gap-3 pt-1">
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-2">Username</label>
                <input
                  type="text" value={username} autoCapitalize="none" autoCorrect="off"
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                  placeholder="Enter username"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none placeholder:text-white/20"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", transition: "border 0.2s" }}
                  onFocus={e => (e.target.style.border = "1px solid rgba(255,255,255,0.35)")}
                  onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
              </div>
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-widest font-semibold block mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    className="w-full px-4 py-3.5 rounded-xl text-white text-[15px] outline-none placeholder:text-white/20 pr-16"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", transition: "border 0.2s" }}
                    onFocus={e => (e.target.style.border = "1px solid rgba(255,255,255,0.35)")}
                    onBlur={e => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-[12px] font-medium hover:text-white/60 transition-colors">
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,59,48,0.12)", border: "1px solid rgba(255,59,48,0.22)" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                    <circle cx="8" cy="8" r="8" fill="#FF3B30" fillOpacity="0.9"/>
                    <path d="M8 4.5v4" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="8" cy="11" r="0.9" fill="white"/>
                  </svg>
                  <span className="text-[13px]" style={{ color: "#FF6B6B" }}>{error}</span>
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <button type="button"
                  onClick={() => { setFormOpen(false); setError(""); setUsername(""); setPassword(""); }}
                  className="py-4 px-5 rounded-xl text-white/40 text-[14px] font-medium hover:text-white/60 transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-4 rounded-xl text-black font-semibold text-[15px] transition-all"
                  style={{ background: "white", opacity: loading ? 0.7 : 1, letterSpacing: "-0.01em" }}>
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

          {success && (
            <div className="w-full py-4 rounded-2xl text-center font-semibold text-[15px]"
              style={{ background: "#34C759", color: "black" }}>
              Welcome back ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
