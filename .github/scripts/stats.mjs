// Generates assets/stats.svg (light + dark adaptive) from the public GitHub REST API.
// Runs in GitHub Actions on Node 20+, no dependencies. Replaces github-readme-stats.
// Set STATS_JSON='{"commits":1,"prs":2}' to render from supplied numbers instead of fetching.
import { writeFileSync, mkdirSync } from "node:fs";

const USER = process.env.USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.env.OUT_DIR || "assets";
const FONT = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace";
const LANG_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c", SCSS: "#c6538c",
  Python: "#3572a5", Java: "#b07219", PHP: "#4f5d95", Dart: "#00b4ab", Kotlin: "#a97bff",
  Go: "#00add8", Shell: "#89e051", Vue: "#41b883", C: "#555555", "C++": "#f34b7d",
};

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Accept: "application/vnd.github+json", ...(TOKEN && { Authorization: `Bearer ${TOKEN}` }) },
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};
const attempt = async (fn) => { try { return await fn(); } catch (e) { console.warn(String(e)); return undefined; } };

async function collect() {
  if (process.env.STATS_JSON) return JSON.parse(process.env.STATS_JSON);
  const q = encodeURIComponent;
  const [commits, prs, user, repos] = await Promise.all([
    attempt(async () => (await api(`/search/commits?q=${q(`author:${USER}`)}&per_page=1`)).total_count),
    attempt(async () => (await api(`/search/issues?q=${q(`author:${USER} type:pr`)}&per_page=1`)).total_count),
    attempt(() => api(`/users/${USER}`)),
    attempt(() => api(`/users/${USER}/repos?per_page=100&type=owner&sort=pushed`)),
  ]);
  const own = (repos || []).filter((r) => !r.fork);
  const langs = {};
  if (repos) {
    for (const r of own.slice(0, 40)) {
      const l = await attempt(() => api(`/repos/${USER}/${r.name}/languages`));
      for (const [k, v] of Object.entries(l || {})) langs[k] = (langs[k] || 0) + v;
    }
  }
  return {
    commits, prs,
    stars: repos ? own.reduce((a, r) => a + r.stargazers_count, 0) : undefined,
    repos: user?.public_repos,
    langs: Object.keys(langs).length ? langs : undefined,
  };
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function render(d) {
  const tiles = [
    ["Commits", d.commits], ["Pull requests", d.prs], ["Stars earned", d.stars], ["Public repos", d.repos],
  ].filter(([, v]) => typeof v === "number");
  const W = 700, P = 24, gap = 12;
  const tw = (W - P * 2 - gap * (tiles.length - 1)) / tiles.length;
  const langs = d.langs
    ? Object.entries(d.langs).sort((a, b) => b[1] - a[1]).slice(0, 6)
    : null;
  const H = 40 + 92 + (langs ? 112 : 0);
  let y = 24, body = "";
  body += `<text x="${P}" y="${y + 10}" class="h">Public GitHub activity</text>`;
  y += 28;
  tiles.forEach(([label, v], i) => {
    const x = P + i * (tw + gap);
    body += `<rect x="${x}" y="${y}" width="${tw}" height="68" rx="10" class="tile"/>
<text x="${x + 16}" y="${y + 34}" class="num">${v.toLocaleString("en-US")}</text>
<text x="${x + 16}" y="${y + 55}" class="lab">${esc(label)}</text>`;
  });
  y += 68 + 28;
  if (langs) {
    const total = langs.reduce((a, [, v]) => a + v, 0);
    body += `<text x="${P}" y="${y}" class="h">Most used languages</text>`;
    y += 14;
    const bw = W - P * 2;
    body += `<clipPath id="c"><rect x="${P}" y="${y}" width="${bw}" height="10" rx="5"/></clipPath><g clip-path="url(#c)">`;
    let x = P;
    langs.forEach(([k, v]) => {
      const w = (v / total) * bw;
      body += `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="10" fill="${LANG_COLORS[k] || "#8b949e"}"/>`;
      x += w;
    });
    body += `</g>`;
    y += 34;
    const colW = bw / 3;
    langs.forEach(([k, v], i) => {
      const cx = P + (i % 3) * colW, cy = y + Math.floor(i / 3) * 24;
      body += `<circle cx="${cx + 5}" cy="${cy - 4}" r="5" fill="${LANG_COLORS[k] || "#8b949e"}"/>
<text x="${cx + 18}" y="${cy}" class="lab">${esc(k)} <tspan class="dim">${((v / total) * 100).toFixed(1)}%</tspan></text>`;
    });
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" role="img" aria-label="Public GitHub activity: ${tiles.map(([l, v]) => `${v} ${l.toLowerCase()}`).join(", ")}">
<style>
:root{--bg:#ffffff;--bd:#d0d7de;--tile:#f6f8fa;--fg:#1f2328;--mute:#59636e;--acc:#1a7f37}
@media (prefers-color-scheme:dark){:root{--bg:#0d1117;--bd:#30363d;--tile:#161b22;--fg:#f0f6fc;--mute:#9198a1;--acc:#3fb950}}
.h{font-size:13px;fill:var(--mute);letter-spacing:.04em;text-transform:uppercase}
.num{font-size:26px;font-weight:700;fill:var(--acc)}.lab{font-size:12.5px;fill:var(--fg)}.dim{fill:var(--mute)}
.tile{fill:var(--tile);stroke:var(--bd)}
</style>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="var(--bg)" stroke="var(--bd)"/>
${body}
</svg>
`;
}

const data = await collect();
mkdirSync(OUT, { recursive: true });
writeFileSync(`${OUT}/stats.svg`, render(data));
console.log("stats.svg written", JSON.stringify({ ...data, langs: data.langs && Object.keys(data.langs).length + " languages" }));
