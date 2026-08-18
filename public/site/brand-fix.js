/* Brand + label overrides for the lobby.
   The lobby script is minified, so labels are rewritten in the DOM instead. */
(function () {
  var RULES = [
    [/رهان\s*1\s*win/gi, "رهانات أخرى"],
    [/\b1\s*win\b/gi, "رهانات أخرى"],
    [/Cassa\s*Predictor/gi, "NOVA VIP"],
    [/PREDICTOR/g, "NOVA VIP"],
    [/Predictor/g, "NOVA VIP"],
    [/بريديكتور/g, "NOVA VIP"],
  ];

  function fixText(value) {
    var out = value;
    for (var i = 0; i < RULES.length; i++) out = out.replace(RULES[i][0], RULES[i][1]);
    return out;
  }

  function walk(root) {
    if (!root) return;
    var it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = it.nextNode())) {
      var next = fixText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function apply() {
    walk(document.body);
    if (document.title !== "NOVA VIP") document.title = "NOVA VIP";
    var logos = document.querySelectorAll(".intro-logo, .brand-logo");
    for (var i = 0; i < logos.length; i++) {
      if (logos[i].textContent.trim() === "P") logos[i].textContent = "N";
    }
    // Avoid two tabs sharing the exact same label.
    var other = document.getElementById("tab-other");
    if (other && other.textContent.indexOf("رهانات أخرى") === 0) {
      other.textContent = other.textContent.replace("رهانات أخرى", "رهانات متنوعة");
    }
  }

  function start() {
    apply();
    new MutationObserver(function () {
      apply();
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
