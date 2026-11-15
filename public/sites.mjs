// 各解析站的配置。新增或改网址只改这里。
// hosts：按 hostname 后缀精确匹配（等于该域名或以 .域名 结尾），不做子串包含。
// enabled=false 的站点能识别出来，但不跳转，只提示「还没上线」。
export const SITES = [
  {
    id: 'douyin', name: '抖音', desc: '视频、图集去水印',
    url: 'https://douyinqushuiyin.pages.dev/', color: '#d3123a', enabled: true,
    hosts: ['douyin.com', 'iesdouyin.com', 'douyinvod.com', 'amemv.com'],
  },
  {
    id: 'kuaishou', name: '快手', desc: '视频、图集去水印',
    url: 'https://kuaishoujiexi.pages.dev/', color: '#c2410c', enabled: true,
    hosts: ['kuaishou.com', 'kuaishou.cn', 'chenzhongtech.com', 'gifshow.com', 'kuaishouapp.com'],
  },
  {
    id: 'xiaohongshu', name: '小红书', desc: '笔记图片、视频、实况',
    url: 'https://xiaohongshuqushuiyin.pages.dev/', color: '#be123c', enabled: true,
    hosts: ['xiaohongshu.com', 'xhslink.com', 'xhslink.cn', 'rednote.com', 'xhscdn.com'],
  },
  {
    id: 'bilibili', name: 'B站', desc: '视频下载',
    url: 'https://bilibilishipinjiexi.pages.dev/', color: '#0369a1', enabled: true,
    hosts: ['bilibili.com', 'b23.tv', 'bili2233.cn', 'bili22.cn', 'bili23.cn', 'bili33.cn'],
  },
  {
    id: 'youtube', name: 'YouTube', desc: '视频、Shorts 下载',
    url: 'https://youtubejiexisite.pages.dev/', color: '#b91c1c', enabled: true,
    hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'],
  },
  {
    id: 'tiktok', name: 'TikTok', desc: '视频、图集去水印',
    url: 'https://tiktokshipingjiexi.pages.dev/', color: '#d3123a', enabled: true,
    hosts: ['tiktok.com', 'tiktokv.com'],
  },
  {
    id: 'weibo', name: '微博', desc: '图片、实况、视频',
    url: 'https://weibojiexiceshi.xiweiniboss.workers.dev/', color: '#be123c', enabled: false,
    hosts: ['weibo.com', 'weibo.cn', 't.cn', 'sina.cn'],
  },
];
