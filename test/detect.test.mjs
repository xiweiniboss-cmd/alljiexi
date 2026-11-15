import test from 'node:test';
import assert from 'node:assert/strict';
import { detect, extractUrls, targetHref, hostMatches } from '../public/detect.mjs';

const cases = [
  ['douyin', '7.43 复制打开抖音，看看【小明的作品】今天天气真好 # 日常 # vlog  https://v.douyin.com/iRNBho6u/ s@E.uf 09/24 cAa:/ ', 'https://v.douyin.com/iRNBho6u/'],
  ['douyin', '6.66 yTL:/ 01/17 L@J.Vy 这也太好看了吧！%旅行  v.douyin.com/iABCdEf/ 复制此链接，打开Dou音搜索，直接观看视频！', 'https://v.douyin.com/iABCdEf/'],
  ['douyin', 'https://www.douyin.com/video/7301234567890123456?modeFrom=userPost', 'https://www.douyin.com/video/7301234567890123456?modeFrom=userPost'],
  ['douyin', 'https://www.iesdouyin.com/share/video/7301234567890123456/?region=CN', 'https://www.iesdouyin.com/share/video/7301234567890123456/?region=CN'],
  ['kuaishou', 'https://v.kuaishou.com/2xYzAbC 看看这个作品\u201c标题\u201d复制此消息，打开【快手】直接观看！', 'https://v.kuaishou.com/2xYzAbC'],
  ['kuaishou', '“快手用户的作品” https://v.kuaishou.com/JmP3kq 复制此链接，打开【快手极速版】直接观看！', 'https://v.kuaishou.com/JmP3kq'],
  ['kuaishou', 'https://www.kuaishou.com/short-video/3xabc123def?authorId=3x', 'https://www.kuaishou.com/short-video/3xabc123def?authorId=3x'],
  ['kuaishou', 'https://v.m.chenzhongtech.com/fw/photo/3xabc?cc=share_copylink', 'https://v.m.chenzhongtech.com/fw/photo/3xabc?cc=share_copylink'],
  ['xiaohongshu', '62 【秋天的第一杯奶茶 - 小红薯的笔记 | 小红书 - 你的生活指南】 😆 Ab1Cd2Ef3Gh 😆 http://xhslink.com/a/AbCdEfGh123，复制本条信息，打开【小红书】App查看精彩内容！', 'http://xhslink.com/a/AbCdEfGh123'],
  ['xiaohongshu', 'http://xhslink.com/o/8xYzAb 复制后打开【小红书】查看笔记！', 'http://xhslink.com/o/8xYzAb'],
  ['xiaohongshu', 'https://www.xiaohongshu.com/explore/6540a1b2000000001e03c4d5?xsec_token=ABc_123&xsec_source=pc_share', 'https://www.xiaohongshu.com/explore/6540a1b2000000001e03c4d5?xsec_token=ABc_123&xsec_source=pc_share'],
  ['bilibili', '【【4K】这就是秋天-哔哩哔哩】 https://b23.tv/AbCdE12', 'https://b23.tv/AbCdE12'],
  ['bilibili', 'https://www.bilibili.com/video/BV1GJ411x7h7/?spm_id_from=333.1007&vd_source=abc', 'https://www.bilibili.com/video/BV1GJ411x7h7/?spm_id_from=333.1007&vd_source=abc'],
  ['bilibili', 'https://m.bilibili.com/video/BV1GJ411x7h7', 'https://m.bilibili.com/video/BV1GJ411x7h7'],
  ['bilibili', '这个视频 BV1GJ411x7h7 好看', 'https://www.bilibili.com/video/BV1GJ411x7h7'],
  ['bilibili', '【标题】 https://bili2233.cn/xYz9876', 'https://bili2233.cn/xYz9876'],
  ['youtube', 'https://youtu.be/dQw4w9WgXcQ?si=AbCdEfGhIjKlMn', 'https://youtu.be/dQw4w9WgXcQ?si=AbCdEfGhIjKlMn'],
  ['youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s'],
  ['youtube', 'https://youtube.com/shorts/AbCdEfGhIjK?si=xyz', 'https://youtube.com/shorts/AbCdEfGhIjK?si=xyz'],
  ['youtube', 'https://m.youtube.com/watch?v=dQw4w9WgXcQ。', 'https://m.youtube.com/watch?v=dQw4w9WgXcQ'],
  ['tiktok', 'https://vm.tiktok.com/ZMabc123/ ', 'https://vm.tiktok.com/ZMabc123/'],
  ['tiktok', 'Check out this video! #fyp https://www.tiktok.com/@user.name/video/7301234567890123456?is_from_webapp=1&sender_device=pc', 'https://www.tiktok.com/@user.name/video/7301234567890123456?is_from_webapp=1&sender_device=pc'],
  ['tiktok', 'https://vt.tiktok.com/ZSabc123/', 'https://vt.tiktok.com/ZSabc123/'],
  ['tiktok', 'https://www.tiktok.com/@a/photo/7301234567890123456', 'https://www.tiktok.com/@a/photo/7301234567890123456'],
];

for (const [site, text, url] of cases) {
  test(site + ': ' + text.slice(0, 40), () => {
    const r = detect(text);
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.site.id, site);
    assert.equal(r.url, new URL(url).href);
  });
}

test('微博识别出来但未上线时不跳转', () => {
  for (const t of ['https://weibo.com/1234567890/NabCdEfGh', 'https://m.weibo.cn/status/4950000000000000', '分享自微博 http://t.cn/A6abcDEF', 'https://video.weibo.com/show?fid=1034:4950000000000000']) {
    const r = detect(t);
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'disabled');
    assert.equal(r.site.id, 'weibo');
  }
});

test('不认识的平台、没有链接、空输入', () => {
  assert.equal(detect('https://example.com/video/1').reason, 'unknown');
  assert.equal(detect('今天天气真好').reason, 'nourl');
  assert.equal(detect('   ').reason, 'empty');
  assert.equal(detect(null).reason, 'empty');
});

test('子串冒充的域名不算', () => {
  assert.equal(detect('https://douyin.com.evil.example/x').reason, 'unknown');
  assert.equal(detect('https://notyoutube.com/watch?v=1').reason, 'unknown');
  assert.equal(detect('https://evil.com/?u=https%3A%2F%2Fv.douyin.com%2Fabc').reason, 'unknown');
  assert.equal(hostMatches('fakeb23.tv', ['b23.tv']), false);
  assert.equal(hostMatches('m.b23.tv', ['b23.tv']), true);
});

test('非 http 协议和带账号密码的链接丢掉', () => {
  assert.equal(detect('javascript:alert(1)').reason, 'nourl');
  assert.equal(detect('javascript:alert(1)//v.douyin.com/x').ok, false);
  assert.equal(detect('ftp://v.douyin.com/x').ok, false);
  assert.equal(detect('https://user:pw@v.douyin.com/abc').ok, false);
});

test('文字里有多条链接时取第一条能认出的', () => {
  const r = detect('先看这个 https://example.com/a 再看 https://b23.tv/xyz 还有 https://v.douyin.com/abc/');
  assert.equal(r.site.id, 'bilibili');
  assert.equal(r.url, 'https://b23.tv/xyz');
});

test('全角冒号和中文标点结尾', () => {
  assert.equal(detect('链接：https：//v.douyin.com/abc/，快看！').url, 'https://v.douyin.com/abc/');
  assert.equal(detect('看这个（https://b23.tv/abc）').url, 'https://b23.tv/abc');
  assert.equal(detect('see https://youtu.be/abc).').url, 'https://youtu.be/abc');
});

test('extractUrls 去重并按顺序', () => {
  assert.deepEqual(extractUrls('https://b23.tv/a https://b23.tv/a v.douyin.com/b/'), ['https://b23.tv/a', 'https://v.douyin.com/b/']);
});

test('targetHref 用 hash 传参并编码', () => {
  const site = detect('https://b23.tv/a?x=1&y=2').site;
  assert.equal(targetHref(site, 'https://b23.tv/a?x=1&y=2'), 'https://bilibilishipinjiexi.pages.dev/#url=https%3A%2F%2Fb23.tv%2Fa%3Fx%3D1%26y%3D2');
});
