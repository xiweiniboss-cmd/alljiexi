import { SITES } from './sites.mjs';
import { detect, targetHref } from './detect.mjs';

const $ = (id) => document.getElementById(id);
const input = $('input');
const result = $('result');

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

/* ---------- 站点卡片 ---------- */
const grid = $('grid');
for (const s of SITES) {
  const li = el('li');
  const a = el(s.enabled ? 'a' : 'div', 'site' + (s.enabled ? '' : ' off'));
  a.style.setProperty('--c', s.color);
  if (s.enabled) { a.href = s.url; a.rel = 'noopener'; }
  a.appendChild(el('span', 'dot'));
  const body = el('span', 'site-body');
  body.appendChild(el('span', 'site-name', s.name));
  body.appendChild(el('span', 'site-desc', s.enabled ? s.desc : '即将上线'));
  a.appendChild(body);
  if (s.enabled) a.appendChild(el('span', 'arrow', '→'));
  li.appendChild(a);
  grid.appendChild(li);
}

/* ---------- 识别 ---------- */
const MSG = {
  empty: '先粘贴分享文字或链接。',
  nourl: '没在这段文字里找到链接。请在 App 里点「分享」→「复制链接」，再整段粘进来。',
  unknown: '这个链接不是目前支持的平台。支持：' + SITES.filter((s) => s.enabled).map((s) => s.name).join('、') + '。',
};

function show(kind, nodes) {
  result.hidden = false;
  result.className = 'result ' + kind;
  result.replaceChildren(...nodes);
}

function shortUrl(u) {
  return u.length > 80 ? u.slice(0, 77) + '…' : u;
}

function run(navigate) {
  const r = detect(input.value);
  if (r.ok) {
    const href = targetHref(r.site, r.url);
    const head = el('p', 'r-head');
    const chip = el('span', 'chip', r.site.name);
    chip.style.setProperty('--c', r.site.color);
    head.append('识别为 ', chip);
    const link = el('p', 'r-url', shortUrl(r.url));
    const go = el('a', 'btn primary', '前往' + r.site.name + '解析站');
    go.href = href; go.rel = 'noopener';
    const tip = el('p', 'r-tip', '到那边链接已经填好，点「解析」并完成人机验证即可。');
    show('ok', [head, link, go, tip]);
    if (navigate) location.assign(href);
    return;
  }
  if (r.reason === 'disabled') {
    show('warn', [el('p', 'r-head', '识别为' + r.site.name + '，但' + r.site.name + '解析站还没上线，敬请期待。')]);
    return;
  }
  const nodes = [el('p', 'r-head', MSG[r.reason] || MSG.unknown)];
  if (r.reason === 'unknown' && r.url) nodes.push(el('p', 'r-url', shortUrl(r.url)));
  show(r.reason === 'empty' ? 'warn' : 'err', nodes);
}

$('form').addEventListener('submit', (e) => { e.preventDefault(); run(true); });
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(true); }
});
let t = 0;
input.addEventListener('input', () => {
  clearTimeout(t);
  t = setTimeout(() => { if (input.value.trim()) run(false); else result.hidden = true; }, 200);
});
$('clearBtn').addEventListener('click', () => { input.value = ''; result.hidden = true; input.focus(); });

const pasteBtn = $('pasteBtn');
if (!navigator.clipboard || !navigator.clipboard.readText) pasteBtn.hidden = true;
pasteBtn.addEventListener('click', async () => {
  try {
    const txt = await navigator.clipboard.readText();
    if (txt) { input.value = txt.slice(0, 5000); run(false); }
  } catch {
    show('warn', [el('p', 'r-head', '浏览器没允许读取剪贴板，请长按输入框手动粘贴。')]);
  }
});

/* ---------- 主题 ---------- */
const root = document.documentElement;
$('themeBtn').addEventListener('click', () => {
  const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = cur === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('alljiexi_theme', next); } catch {}
});
