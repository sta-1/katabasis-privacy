/* Katabasis website i18n engine
 * Lazy-loads the active language file and applies it to [data-i18n] / [data-i18n-html] nodes.
 * Default (English) ships inline in the HTML, so the page is readable even if JS fails.
 */
(function () {
  "use strict";

  var LANGS = [
    { code: "en", name: "English" },
    { code: "tr", name: "Türkçe" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "ru", name: "Русский" },
    { code: "zh", name: "中文" },
    { code: "ko", name: "한국어" },
    { code: "ja", name: "日本語" },
    { code: "el", name: "Ελληνικά" }
  ];
  var CODES = LANGS.map(function (l) { return l.code; });
  var STORAGE_KEY = "kat_lang";
  var registry = {};   // code -> strings object
  var current = "en";

  // Expose for language files: registerLang('tr', { ... })
  window.registerLang = function (code, strings) {
    registry[code] = strings;
    if (code === current) apply(strings);
  };

  function pickInitial() {
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && CODES.indexOf(saved) !== -1) return saved;
    var navs = navigator.languages || [navigator.language || navigator.userLanguage || "en"];
    for (var i = 0; i < navs.length; i++) {
      var base = String(navs[i] || "").toLowerCase().split("-")[0];
      if (CODES.indexOf(base) !== -1) return base;
    }
    return "en";
  }

  function apply(strings) {
    if (!strings) return;
    // text nodes
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (strings[key] != null) el.textContent = strings[key];
    });
    // html blocks (legal text, line breaks, links)
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (strings[key] != null) el.innerHTML = strings[key];
    });
    // <title>
    if (strings["meta.title"]) document.title = strings["meta.title"];
    // <meta name="description">
    if (strings["meta.desc"]) {
      var m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", strings["meta.desc"]);
    }
    document.documentElement.setAttribute("lang", current);
  }

  function loadLang(code) {
    if (code === "en" || registry[code]) { // en ships inline; already-loaded langs cached
      if (registry[code]) apply(registry[code]);
      else applyInlineEnglish();
      return;
    }
    var s = document.createElement("script");
    s.src = "/assets/lang/" + code + ".js";
    s.async = true;
    s.onerror = function () { /* fall back to whatever is shown */ };
    document.head.appendChild(s);
  }

  // For English we re-read nothing — inline DOM is the English source.
  // But if the user switched away and back, we need English strings; en.js provides them.
  function applyInlineEnglish() {
    if (registry["en"]) { apply(registry["en"]); return; }
    var s = document.createElement("script");
    s.src = "/assets/lang/en.js";
    s.async = true;
    document.head.appendChild(s);
  }

  function setLang(code) {
    if (CODES.indexOf(code) === -1) code = "en";
    current = code;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) {}
    var sel = document.getElementById("langSelect");
    if (sel) sel.value = code;
    loadLang(code);
  }

  function buildSwitcher() {
    var sel = document.getElementById("langSelect");
    if (!sel) return;
    LANGS.forEach(function (l) {
      var opt = document.createElement("option");
      opt.value = l.code;
      opt.textContent = l.name;
      sel.appendChild(opt);
    });
    sel.value = current;
    sel.addEventListener("change", function () { setLang(sel.value); });
  }

  function init() {
    current = pickInitial();
    buildSwitcher();
    if (current !== "en") loadLang(current);
    else document.documentElement.setAttribute("lang", "en");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
