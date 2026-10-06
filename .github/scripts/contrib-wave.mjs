// Animated waveform contribution graph (dark + light SVG).
// Runs in GitHub Actions on Node 20+, no dependencies.
import { writeFileSync, mkdirSync } from 'node:fs';

const USER = process.env.USERNAME;
const TOKEN = process.env.GITHUB_TOKEN;
const OUT = process.env.OUT_DIR || 'assets';

const THEMES = {
  dark:  { bg: '#0d1117', border: '#30363d', dim: '#6e7681', bright: '#f0f6fc', bars: ['#30363d', '#484f58', '#6e7681'] },
  light: { bg: '#ffffff', border: '#d0d7de', dim: '#8c959f', bright: '#1f2328', bars: ['#d0d7de', '#afb8c1', '#8c959f'] },
};
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PLAY_DUR = 9;   // seconds for the playhead to sweep the year
const PLAY_BEGIN = 1; // starts after the bars grow in

async function fetchCalendar() {
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{
    totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user.contributionsCollection.contributionCalendar;
}

// frame = { t: seconds } renders a static snapshot (used only for previews)
export function render(cal, th, frame) {
  const weeks = cal.weeks;
  const totals = weeks.map((w) => w.contributionDays.reduce((a, d) => a + d.contributionCount, 0));
  const max = Math.max(1, ...totals);
  const W = 800, H = 250, P = 28, mid = 130, amp = 70;
  const step = (W - P * 2) / weeks.length, bw = step * 0.6, gridW = W - P * 2;
  const font = `font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"`;
  const f = (n) => n.toFixed(1);

  const growAt = (i, t) => Math.min(1, Math.max(0, (t - i * 0.012) / 0.6));
  const ease = (x) => 1 - Math.pow(1 - x, 3);
  const playX = (t) => {
    if (t < PLAY_BEGIN) return 0;
    const p = ((t - PLAY_BEGIN) % PLAY_DUR) / PLAY_DUR;
    return Math.min(1, p / 0.92) * (gridW + 8);
  };

  let base = '', played = '';
  totals.forEach((v, i) => {
    const r = v / max, h = Math.max(2, r * amp);
    const x = f(P + i * step), y = f(mid - h), hh = f(h * 2), rx = f(bw / 2);
    const tone = th.bars[r > 0.6 ? 2 : r > 0.3 ? 1 : 0];
    const op = (0.45 + 0.55 * r).toFixed(2);
    const anim = frame
      ? `transform="translate(0 ${mid}) scale(1 ${ease(growAt(i, frame.t)).toFixed(3)}) translate(0 ${-mid})"`
      : `class="b" style="animation-delay:${(i * 0.012).toFixed(3)}s"`;
    base += `<rect ${anim} x="${x}" y="${y}" width="${f(bw)}" height="${hh}" rx="${rx}" fill="${tone}"/>`;
    played += `<rect ${anim} x="${x}" y="${y}" width="${f(bw)}" height="${hh}" rx="${rx}" fill="${th.bright}" fill-opacity="${op}"/>`;
  });

  let labels = '', lastM = -1, lastW = -4;
  weeks.forEach((w, i) => {
    const m = new Date(w.contributionDays[0].date).getUTCMonth();
    if (m !== lastM && i - lastW >= 4 && i < weeks.length - 3) {
      labels += `<text x="${f(P + i * step)}" y="${H - 28}" fill="${th.dim}" font-size="11">${MONTHS[m]}</text>`;
      lastW = i;
    }
    lastM = m;
  });

  const kt = `keyTimes="0;0.92;1" dur="${PLAY_DUR}s" begin="${PLAY_BEGIN}s" repeatCount="indefinite"`;
  const clipW = frame ? `width="${f(playX(frame.t))}"` : `width="0"><animate attributeName="width" values="0;${gridW + 8};${gridW + 8}" ${kt}/></rect`;
  const headX = frame ? `x="${f(P - 4 + playX(frame.t))}"` : `x="${P - 4}"><animate attributeName="x" values="${P - 4};${P + gridW + 4};${P + gridW + 4}" ${kt}/></rect`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${font}>
<style>
.b{transform-box:fill-box;transform-origin:center;animation:grow .6s cubic-bezier(.2,.8,.2,1) both}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.b{animation:none}}
</style>
<defs><clipPath id="played"><rect x="${P - 4}" y="0" height="${H}" ${clipW}${frame ? '/>' : '>'}</clipPath></defs>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12" fill="${th.bg}" stroke="${th.border}"/>
<path d="M${P} 31 l9 5.5 l-9 5.5 Z" fill="${th.bright}"/>
<text x="${P + 18}" y="41" font-size="13"><tspan fill="${th.dim}">total </tspan><tspan fill="${th.bright}" font-weight="600">${cal.totalContributions.toLocaleString('en-US')}</tspan><tspan fill="${th.dim}"> · contributions per week, last 12 months</tspan></text>
<g>${base}</g>
<g clip-path="url(#played)">${played}</g>
<rect y="${mid - amp - 10}" width="1.5" height="${amp * 2 + 20}" fill="${th.bright}" fill-opacity=".6" ${headX}${frame ? '/>' : '>'}
${labels}
</svg>`;
}

if (process.env.PREVIEW !== '1') {
  const cal = await fetchCalendar();
  mkdirSync(OUT, { recursive: true });
  for (const [name, th] of Object.entries(THEMES)) writeFileSync(`${OUT}/contrib-${name}.svg`, render(cal, th));
  console.log(`Wrote ${OUT}/contrib-dark.svg and ${OUT}/contrib-light.svg`);
}
export { THEMES };
