/* Makes every in-game back button return to the games lobby,
   keeping the profile query params from the current URL. */
(function () {
  function lobbyUrl() {
    var search = window.location.search || "";
    return "/site/index.html" + search;
  }

  function goBack(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    window.location.href = lobbyUrl();
  }

  function bind() {
    var nodes = document.querySelectorAll(
      "#back-btn, #error-return-btn, #return-button, .back-btn, .btn-back",
    );
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.dataset.backFixed) continue;
      el.dataset.backFixed = "1";
      el.addEventListener("click", goBack, true);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
})();
