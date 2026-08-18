/**
 * Site access guard: the predictions site can only be opened from the bot.
 * The bot appends a signed token (?tk=...) to the Mini App URL; this script
 * validates it server-side and blocks the page otherwise.
 */
(function () {
  var KEY = "novaAccessToken";

  function param(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function block() {
    try {
      sessionStorage.removeItem(KEY);
      localStorage.removeItem(KEY);
    } catch (e) {}
    document.documentElement.innerHTML =
      '<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
      'background:#080810;color:#fff;font-family:system-ui,Segoe UI,Arial,sans-serif;text-align:center">' +
      '<div style="padding:28px;max-width:420px">' +
      '<div style="font-size:44px;margin-bottom:14px">🔒</div>' +
      '<h2 style="margin:0 0 10px;font-size:20px">الوصول مرفوض</h2>' +
      '<p style="margin:0;opacity:.8;line-height:1.7;font-size:15px">هذا الموقع يعمل من داخل البوت فقط.<br>' +
      'افتح البوت واضغط زر «فتح التطبيق» للدخول.</p></div></body>';
    try {
      window.stop();
    } catch (e) {}
  }

  var token = param("tk");
  if (token) {
    try {
      sessionStorage.setItem(KEY, token);
      localStorage.setItem(KEY, token);
    } catch (e) {}
  } else {
    try {
      token = sessionStorage.getItem(KEY) || localStorage.getItem(KEY);
    } catch (e) {}
  }

  function renew(onFail) {
    var initData =
      (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || "";
    if (!initData) return onFail();
    fetch("/api/public/telegram/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: initData }),
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok && d.token) {
          try {
            sessionStorage.setItem(KEY, d.token);
            localStorage.setItem(KEY, d.token);
          } catch (e) {}
          window.NOVA_USER_ID = d.userId || window.NOVA_USER_ID;
        } else onFail();
      })
      .catch(onFail);
  }

  if (!token) {
    renew(block);
    return;
  }

  // Hide content until the token is confirmed.
  var style = document.createElement("style");
  style.textContent = "html{visibility:hidden}";
  (document.head || document.documentElement).appendChild(style);

  fetch("/api/public/telegram/verify-access?tk=" + encodeURIComponent(token), {
    cache: "no-store",
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      if (data && data.ok) {
        style.remove();
        window.NOVA_USER_ID = data.userId || window.NOVA_USER_ID;
      } else {
        style.remove();
        renew(block);
      }
    })
    .catch(function () {
      style.remove();
      block();
    });
})();
