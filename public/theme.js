// 在首屏渲染前定好主题，避免闪一下。用户手动选过就记住，没选过跟随系统。
(function () {
  try {
    var t = localStorage.getItem('alljiexi_theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
