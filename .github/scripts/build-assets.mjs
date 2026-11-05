// Generates assets/header.svg, assets/badges/*.svg and assets/projects/*.svg
// Run: node .github/scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const FONT = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
mkdirSync("assets/badges", { recursive: true });
mkdirSync("assets/projects", { recursive: true });

// ---------- header ----------
const header = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="260" viewBox="0 0 1000 260" role="img" aria-label="Nazmul Hossain Adnan — Full Stack Developer">
<style>
:root{--bg:#f6f8fa;--bg2:#eaeef2;--fg:#1f2328;--mute:#59636e;--acc:#1a7f37;--grid:#d0d7de}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--bg2:#161b22;--fg:#f0f6fc;--mute:#9198a1;--acc:#3fb950;--grid:#21262d}}
.n{font:700 46px ${SANS};fill:var(--fg)}
.r{font:500 20px ${FONT};fill:var(--acc)}
.s{font:400 15px ${FONT};fill:var(--mute)}
.c{animation:b 1.1s steps(1) infinite}@keyframes b{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.c{animation:none}}
</style>
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--bg)"/><stop offset="1" stop-color="var(--bg2)"/></linearGradient>
<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="var(--grid)" stroke-width="1"/></pattern>
</defs>
<rect width="1000" height="260" rx="14" fill="url(#g)"/>
<rect width="1000" height="260" rx="14" fill="url(#p)" opacity=".7"/>
<rect x="0.5" y="0.5" width="999" height="259" rx="13.5" fill="none" stroke="var(--grid)"/>
<text x="60" y="108" class="s">~/adnan <tspan fill="var(--acc)">$</tspan> whoami</text>
<text x="60" y="165" class="n">Nazmul Hossain Adnan</text>
<text x="60" y="206" class="r">Full Stack Developer<tspan class="c"> ▌</tspan></text>
<text x="60" y="236" class="s">React · Next.js · Node.js · TypeScript · Turning ideas into reality</text>
</svg>
`;
writeFileSync("assets/header.svg", header);

// ---------- badges ----------
// [file, label, dot-colour]
const badges = [
  ["portfolio", "Portfolio", "#2ea043"],
  ["linkedin", "LinkedIn", "#0a66c2"],
  ["email", "Email", "#d14836"],
  ["react", "React", "#61dafb"],
  ["nextjs", "Next.js", "#8b949e"],
  ["typescript", "TypeScript", "#3178c6"],
  ["javascript", "JavaScript", "#f7df1e"],
  ["tailwind", "Tailwind", "#38bdf8"],
  ["framer-motion", "Framer Motion", "#ff0099"],
  ["shadcn", "shadcn/ui", "#8b949e"],
  ["nodejs", "Node.js", "#5fa04e"],
  ["express", "Express", "#8b949e"],
  ["firebase", "Firebase", "#ffca28"],
  ["mongodb", "MongoDB", "#47a248"],
  ["mongoose", "Mongoose", "#b3322f"],
  ["postgresql", "PostgreSQL", "#4169e1"],
  ["prisma", "Prisma", "#5a67d8"],
  ["react-query", "React Query", "#ff4154"],
  ["stripe", "Stripe", "#635bff"],
  ["gemini", "Gemini API", "#8e75ff"],
  ["groq", "Groq", "#f55036"],
  ["vite", "Vite", "#646cff"],
  ["git", "Git", "#f05032"],
  ["figma", "Figma", "#f24e1e"],
  ["photoshop", "Photoshop", "#31a8ff"],
  ["chrome-extensions", "Chrome Extensions", "#4285f4"],
  ["vscode", "VS Code API", "#007acc"],
  ["github-actions", "GitHub Actions", "#2088ff"],
];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
for (const [file, label, dot] of badges) {
  const w = Math.round(label.length * 7.6 + 38);
  writeFileSync(
    `assets/badges/${file}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="28" viewBox="0 0 ${w} 28" role="img" aria-label="${esc(label)}">
<style>
:root{--bg:#f6f8fa;--bd:#d0d7de;--fg:#1f2328}
@media (prefers-color-scheme:dark){:root{--bg:#161b22;--bd:#30363d;--fg:#e6edf3}}
text{font:500 12.5px ${FONT};fill:var(--fg)}
</style>
<rect x=".5" y=".5" width="${w - 1}" height="27" rx="14" fill="var(--bg)" stroke="var(--bd)"/>
<circle cx="15" cy="14" r="4" fill="${dot}"/>
<text x="26" y="18.2">${esc(label)}</text>
</svg>
`
  );
}

// ---------- project cards ----------
const cards = [
  ["mnemo", "Mnemo", "voice-first memory app", ["capture < 1 tap", "Gemini + Groq Whisper", "offline fallback"]],
  ["netlens", "NetLens", "Chrome side-panel network inspector", ["fetch / XHR / WS / SSE", "replay + diff", "no DevTools needed"]],
  ["caloriemeter", "CalorieMeter", "AI calorie tracker (PWA)", ["photo → nutrition", "NL corrections", "privacy-first, offline"]],
  ["expresslane", "ExpressLane", "parcel delivery platform", ["React + Express + Prisma", "Stripe payments", "live tracking"]],
  ["smart-class-lookup", "Smart Class Search", "VS Code extension", ["DevTools classes → component", "cn / clsx / template literals", "worker-thread indexing"]],
  ["devradar", "DevRadar", "job application tracker", ["Next.js + MongoDB", "stage pipeline", "CSV import"]],
];
for (const [file, title, sub, lines] of cards) {
  writeFileSync(
    `assets/projects/${file}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="380" height="190" viewBox="0 0 380 190" role="img" aria-label="${esc(title)} — ${esc(sub)}">
<style>
:root{--bg:#f6f8fa;--bd:#d0d7de;--fg:#1f2328;--mute:#59636e;--acc:#1a7f37}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--bd:#30363d;--fg:#f0f6fc;--mute:#9198a1;--acc:#3fb950}}
.t{font:700 24px ${SANS};fill:var(--fg)}.s{font:400 13px ${FONT};fill:var(--mute)}.l{font:400 13.5px ${FONT};fill:var(--fg)}.a{fill:var(--acc);font:700 13.5px ${FONT}}
</style>
<rect x=".5" y=".5" width="379" height="189" rx="12" fill="var(--bg)" stroke="var(--bd)"/>
<circle cx="22" cy="22" r="5" fill="#ff5f56"/><circle cx="40" cy="22" r="5" fill="#ffbd2e"/><circle cx="58" cy="22" r="5" fill="#27c93f"/>
<line x1="0" y1="40" x2="380" y2="40" stroke="var(--bd)"/>
<text x="24" y="78" class="t">${esc(title)}</text>
<text x="24" y="100" class="s">${esc(sub)}</text>
${lines.map((l, i) => `<text x="24" y="${132 + i * 22}" class="l"><tspan class="a">›</tspan> ${esc(l)}</text>`).join("\n")}
</svg>
`
  );
}
console.log("assets generated");
