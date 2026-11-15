// 从杂乱的分享文字里抽出链接，并识别是哪个平台。纯函数，浏览器和 Node 都能用。
import { SITES } from './sites.mjs';

// 链接里允许出现的字符（RFC 3986 的子集）；中文、空格、中文标点都算链接结束
const URL_CHARS = "[A-Za-z0-9\\-._~:/?#\\[\\]@!$&'*+,;=%]";
const SCHEME_RE = new RegExp('https?://' + URL_CHARS + '+', 'gi');
// 没写 http 的裸域名，比如「v.douyin.com/iABC123/」
const BARE_RE = new RegExp('(?:^|[^A-Za-z0-9.@/-])((?:[A-Za-z0-9-]+\\.)+[A-Za-z]{2,}(?::\\d+)?/' + URL_CHARS + '*)', 'g');
const TRAIL_RE = /[.,;:!?'*\]]+$/;

function tidy(u) {
  let s = u.replace(TRAIL_RE, '');
  // 去掉末尾不配对的右括号（分享文字常见「(链接)」）
  while (s.endsWith(')') && (s.match(/\(/g) || []).length < (s.match(/\)/g) || []).length) s = s.slice(0, -1);
  return s;
}

export function hostMatches(host, list) {
  host = String(host || '').toLowerCase().replace(/\.$/, '');
  return list.some((d) => host === d || host.endsWith('.' + d));
}

export function siteForHost(host) {
  return SITES.find((s) => hostMatches(host, s.hosts)) || null;
}

function parseUrl(u) {
  try {
    const x = new URL(u);
    if (x.protocol !== 'http:' && x.protocol !== 'https:') return null;
    if (x.username || x.password) return null;
    return x;
  } catch { return null; }
}

// 返回文字里出现的所有链接（按出现顺序，去重）
export function extractUrls(text) {
  const src = String(text == null ? '' : text).slice(0, 5000)
    .replace(/[\u200b-\u200f\u2028\u2029\ufeff]/g, '')
    .replace(/：\/\//g, '://').replace(/[ｈＨ][ｔＴ][ｔＴ][ｐＰ]/g, 'http');
  const found = [];
  const seen = new Set();
  const push = (raw, idx) => {
    const u = tidy(raw);
    const x = parseUrl(u);
    if (!x || seen.has(x.href)) return;
    seen.add(x.href);
    found.push({ url: x.href, idx });
  };
  const spans = [];
  for (const m of src.matchAll(SCHEME_RE)) { push(m[0], m.index); spans.push([m.index, m.index + m[0].length]); }
  for (const m of src.matchAll(BARE_RE)) {
    const start = m.index + m[0].indexOf(m[1]);
    if (spans.some(([a, b]) => start >= a && start < b)) continue;
    push('https://' + m[1], start);
  }
  return found.sort((a, b) => a.idx - b.idx).map((f) => f.url);
}

// B站只贴了 BV 号 / av 号时也能认
function bareBilibili(text) {
  const m = String(text || '').match(/(?:^|[^A-Za-z0-9])(BV1[0-9A-Za-z]{9})(?![0-9A-Za-z])/);
  if (m) return 'https://www.bilibili.com/video/' + m[1];
  return '';
}

// 结果：{ ok, site, url, reason }
//   ok=true：认出平台，url 是要交给解析站的链接
//   reason: 'empty' | 'nourl' | 'unknown' | 'disabled'
export function detect(text) {
  const t = String(text == null ? '' : text).trim();
  if (!t) return { ok: false, reason: 'empty' };
  const urls = extractUrls(t);
  for (const u of urls) {
    const site = siteForHost(new URL(u).hostname);
    if (site) return site.enabled ? { ok: true, site, url: u } : { ok: false, reason: 'disabled', site, url: u };
  }
  const bv = bareBilibili(t);
  if (bv) {
    const site = SITES.find((s) => s.id === 'bilibili');
    return { ok: true, site, url: bv };
  }
  if (!urls.length) return { ok: false, reason: 'nourl' };
  return { ok: false, reason: 'unknown', url: urls[0] };
}

// 跳转地址：解析站首页 + #url=<链接>（用 hash，不进服务器日志）
export function targetHref(site, url) {
  return site.url.replace(/#.*$/, '') + '#url=' + encodeURIComponent(url);
}
