/* Tony Wrestling – ricerca lato client su search.json (generato da build.py) */
(function () {
  var form = document.getElementById("search-form");
  if (!form) return;
  var input = form.querySelector("input"), list = document.getElementById("results"),
      status = document.getElementById("search-status"), root = form.getAttribute("data-root"), idx = null,
      did = document.getElementById("search-did"), relBox = document.getElementById("search-rel"),
      relList = document.getElementById("results-rel"), vocab = [];
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= b.length; i++) m[i] = [i];
    for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[b.length][a.length];
  }
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
    if (!q) { list.innerHTML = ""; status.textContent = ""; did.hidden = true; relBox.hidden = true; return; }
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
    // Forse cercavi: parola più vicina tra nomi, titoli e parole chiave (errori di battitura)
    did.hidden = true;
    if (res.length < 3) {
      var best = null;
      terms.forEach(function (w) {
        if (w.length < 3) return;
        vocab.forEach(function (v) {
          if (v === w || Math.abs(v.length - w.length) > 3) return;
          var d = lev(w, v), lim = w.length > 6 ? 2 : 1;
          if (d <= lim && (!best || d < best.d)) best = { d: d, w: w, v: v };
        });
      });
      if (best) {
        var sug = raw.toLowerCase().replace(best.w, best.v);
        did.innerHTML = 'Forse cercavi: <a href="?q=' + encodeURIComponent(sug) + '">' + h(sug) + '</a>';
        did.hidden = false;
      }
    }
    // Correlati: articoli che parlano degli stessi wrestler dei primi risultati
    var tags = {}, seen = {};
    res.slice(0, 3).forEach(function (r) { (r.a.g || []).forEach(function (t) { tags[t] = 1; }); seen[r.a.u] = 1; });
    res.forEach(function (r) { seen[r.a.u] = 1; });
    var rel = idx.filter(function (a) { return !seen[a.u] && (a.g || []).some(function (t) { return tags[t]; }); }).slice(0, 6);
    relBox.hidden = !rel.length;
    relList.innerHTML = rel.map(card).join("");
  }
  form.addEventListener("submit", function (e) { e.preventDefault(); if (idx) run(); });
  input.addEventListener("input", function () { if (idx) run(); });
  fetch(form.getAttribute("data-index")).then(function (r) { return r.json(); }).then(function (data) {
    idx = data.map(function (a) { a._t = norm(a.t); a._h = norm([a.t, a.e, a.r, a.k].join(" ")); return a; });
    var vs = {};
    idx.forEach(function (a) { norm(a.t + " " + a.k).split(/[^a-z0-9]+/).forEach(function (w) { if (w.length > 3) vs[w] = 1; }); });
    vocab = Object.keys(vs);
    var p = new URLSearchParams(location.search).get("q");
    if (p) { input.value = p; run(); }
  }).catch(function () { status.textContent = "Ricerca non disponibile: apri il sito da un server (vedi README)."; });
})();
