/**
 * Tusky Docs — Local Search
 *
 * Self-contained search that replaces Mintlify's cloud-dependent search.
 * Uses Fuse.js (loaded from CDN) for fuzzy matching against a pre-built
 * index generated from MDX files at Docker build time.
 *
 * Activated via Cmd+K / Ctrl+K, same as Mintlify's native shortcut.
 */
(function () {
  "use strict";

  var INDEX_URL = "/static/search-index.json";
  var FUSE_CDN = "https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.mjs";

  var searchIndex = null;
  var fuse = null;
  var overlay = null;
  var input = null;
  var results = null;
  var loaded = false;

  // ── Load dependencies ──────────────────────────────────────────────

  function loadFuseAndIndex() {
    if (loaded) return Promise.resolve();
    loaded = true;
    return Promise.all([
      import(FUSE_CDN).then(function (m) { return m.default || m; }),
      fetch(INDEX_URL).then(function (r) { return r.json(); }),
    ]).then(function (values) {
      var Fuse = values[0];
      searchIndex = values[1];
      fuse = new Fuse(searchIndex, {
        keys: [
          { name: "title", weight: 3 },
          { name: "description", weight: 2 },
          { name: "sections", weight: 1.5 },
          { name: "content", weight: 1 },
        ],
        threshold: 0.35,
        includeMatches: true,
        minMatchCharLength: 2,
      });
    });
  }

  // ── Build UI ───────────────────────────────────────────────────────

  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "tusky-search-overlay";
    overlay.innerHTML = [
      '<div id="tusky-search-backdrop"></div>',
      '<div id="tusky-search-modal">',
      '  <div id="tusky-search-header">',
      '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      '    <input id="tusky-search-input" type="text" placeholder="Search docs..." autocomplete="off" spellcheck="false" />',
      '    <kbd>esc</kbd>',
      '  </div>',
      '  <div id="tusky-search-results"></div>',
      '  <div id="tusky-search-footer">',
      '    <span><kbd>&uarr;</kbd><kbd>&darr;</kbd> navigate</span>',
      '    <span><kbd>&crarr;</kbd> open</span>',
      '  </div>',
      '</div>',
    ].join("\n");

    document.body.appendChild(overlay);
    injectStyles();

    input = document.getElementById("tusky-search-input");
    results = document.getElementById("tusky-search-results");

    input.addEventListener("input", onInput);
    document.getElementById("tusky-search-backdrop").addEventListener("click", close);
  }

  function injectStyles() {
    if (document.getElementById("tusky-search-styles")) return;
    var style = document.createElement("style");
    style.id = "tusky-search-styles";
    style.textContent = [
      "#tusky-search-overlay { display:none; position:fixed; inset:0; z-index:99999; }",
      "#tusky-search-overlay.open { display:block; }",
      "#tusky-search-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.5); backdrop-filter:blur(2px); }",
      "#tusky-search-modal { position:relative; max-width:640px; margin:80px auto 0; background:var(--bg-card,#fff); border-radius:12px; box-shadow:0 25px 50px rgba(0,0,0,0.25); overflow:hidden; font-family:system-ui,-apple-system,sans-serif; }",
      "@media(prefers-color-scheme:dark){#tusky-search-modal{background:#1a1a2e;color:#e0e0e0;}}",
      "#tusky-search-header { display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid rgba(128,128,128,0.2); }",
      "#tusky-search-header svg { flex-shrink:0; opacity:0.5; }",
      "#tusky-search-input { flex:1; border:none; outline:none; font-size:16px; background:transparent; color:inherit; }",
      "#tusky-search-header kbd { font-size:11px; padding:2px 6px; border-radius:4px; border:1px solid rgba(128,128,128,0.3); opacity:0.6; font-family:inherit; }",
      "#tusky-search-results { max-height:400px; overflow-y:auto; }",
      "#tusky-search-results:empty::after { content:'Type to search...'; display:block; padding:40px 16px; text-align:center; opacity:0.4; }",
      ".tusky-sr { display:block; padding:12px 16px; text-decoration:none; color:inherit; border-bottom:1px solid rgba(128,128,128,0.1); cursor:pointer; }",
      ".tusky-sr:hover,.tusky-sr.active { background:rgba(4,105,148,0.08); }",
      "@media(prefers-color-scheme:dark){.tusky-sr:hover,.tusky-sr.active{background:rgba(165,226,252,0.08);}}",
      ".tusky-sr-title { font-weight:600; font-size:14px; margin-bottom:2px; }",
      ".tusky-sr-path { font-size:12px; opacity:0.5; }",
      ".tusky-sr-desc { font-size:13px; opacity:0.7; margin-top:2px; }",
      "#tusky-search-footer { display:flex; gap:16px; padding:10px 16px; border-top:1px solid rgba(128,128,128,0.2); font-size:12px; opacity:0.5; }",
      "#tusky-search-footer kbd { font-size:11px; padding:1px 4px; border-radius:3px; border:1px solid rgba(128,128,128,0.3); margin:0 2px; }",
    ].join("\n");
    document.head.appendChild(style);
  }

  // ── Search logic ───────────────────────────────────────────────────

  var activeIndex = -1;

  function onInput() {
    var query = input.value.trim();
    if (!query || !fuse) {
      results.innerHTML = "";
      activeIndex = -1;
      return;
    }

    var hits = fuse.search(query, { limit: 12 });
    activeIndex = -1;

    if (hits.length === 0) {
      results.innerHTML = '<div style="padding:40px 16px;text-align:center;opacity:0.4;">No results found</div>';
      return;
    }

    results.innerHTML = hits
      .map(function (hit, i) {
        var item = hit.item;
        var desc = item.description
          ? '<div class="tusky-sr-desc">' + escapeHtml(item.description) + "</div>"
          : "";
        return (
          '<a class="tusky-sr" href="' + escapeHtml(item.slug) + '" data-idx="' + i + '">' +
          '<div class="tusky-sr-title">' + escapeHtml(item.title) + "</div>" +
          '<div class="tusky-sr-path">' + escapeHtml(item.slug) + "</div>" +
          desc +
          "</a>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ── Keyboard navigation ────────────────────────────────────────────

  function onKeyDown(e) {
    if (!overlay || !overlay.classList.contains("open")) return;

    var items = results.querySelectorAll(".tusky-sr");
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      updateActive(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive(items);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        window.location.href = items[activeIndex].href;
        close();
      } else if (items.length > 0) {
        window.location.href = items[0].href;
        close();
      }
    }
  }

  function updateActive(items) {
    items.forEach(function (el, i) {
      el.classList.toggle("active", i === activeIndex);
    });
    if (items[activeIndex]) {
      items[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  // ── Open / Close ───────────────────────────────────────────────────

  function open() {
    createOverlay();
    loadFuseAndIndex().then(function () {
      overlay.classList.add("open");
      input.value = "";
      results.innerHTML = "";
      activeIndex = -1;
      setTimeout(function () { input.focus(); }, 50);
    });
  }

  function close() {
    if (overlay) {
      overlay.classList.remove("open");
    }
  }

  // ── Global shortcut (Cmd+K / Ctrl+K) ──────────────────────────────

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (overlay && overlay.classList.contains("open")) {
        close();
      } else {
        open();
      }
    }
    onKeyDown(e);
  }, true); // useCapture=true to intercept before Mintlify

  // ── Also hijack Mintlify's search button if present ────────────────

  function hijackSearchButton() {
    // Mintlify renders a search button in the nav — click it to open our search
    var btn = document.querySelector('[aria-label="Search"]') ||
              document.querySelector('[class*="SearchButton"]') ||
              document.querySelector('button[data-testid="search"]');
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      }, true);
    }
  }

  // Run after page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hijackSearchButton);
  } else {
    hijackSearchButton();
  }

  // Re-hijack on SPA navigation (Mintlify uses Next.js client-side routing)
  var observer = new MutationObserver(function () {
    hijackSearchButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
