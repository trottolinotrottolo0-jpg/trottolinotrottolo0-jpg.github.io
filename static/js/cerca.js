/* Tony Wrestling – ricerca lato client su search.json (generato da build.py) */
(function () {
  var form = document.getElementById("search-form");
  if (!form) return;
  var input = form.querySelector("input"), list = document.getElementById("results"),
      status = document.getElementById("search-status"), root = form.getAttribute("data-root"), idx = null;
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function h(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function card(a) {
    var media = a.i
      ? '<img src="' + root + a.i + '" alt="" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async">'
      : '<div class="tcard" aria-hidden="true"><span class="tcard__kicker">' + h(a.r) + '</span><span class="tcard__title">' + h(a.t) + '</span><span class="tcard__logo">TONY WRESTLING</span></div>';
    return '<li class="card"><a class="card__link" href="' + root + a.u + '"><div class="card__media">' + media +
      '<span class="card__title">' + h(a.t) + '</span></div><div class="card__info"><span class="card__rub">' + h(a.r) +
      '</span><span>' + h(a.d) + '</span><span>' + a.m + ' min</span></div></a></li>';
  }
  function run() {
    var raw = input.value.trim(), q = norm(raw);
    try { history.replaceState(null, "", raw ? "?q=" + encodeURIComponent(raw) : location.pathname); } catch (e) {}
    if (!q) { list.innerHTML = ""; status.textContent = ""; return; }
    var terms = q.split(/\s+/);
    var res = idx.map(function (a) {
      var s = 0;
      for (var i = 0; i < terms.length; i++) {
        if (a._h.indexOf(terms[i]) < 0) return null;
        s += a._t.indexOf(terms[i]) >= 0 ? 3 : 1;
      }
      return { a: a, s: s };
    }).filter(Boolean).sort(function (x, y) { return y.s - x.s; });
    list.innerHTML = res.map(function (r) { return card(r.a); }).join("");
    status.textContent = res.length ? (res.length === 1 ? "1 articolo trovato" : res.length + " articoli trovati")
      : "Nessun articolo trovato per “" + raw + "”.";
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); if (idx) run(); });
  input.addEventListener("input", function () { if (idx) run(); });
  fetch(form.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (data) {
    idx = data.map(function (a) { a._t = norm(a.t); a._h = norm([a.t, a.e, a.r, a.k].join(" ")); return a; });
    var p = new URLSearchParams(location.search).get("q");
    if (p) { input.value = p; run(); }
  }).catch(function () { status.textContent = "Ricerca non disponibile: apri il sito da un server (vedi README)."; });
})();
