/* Tony Wrestling – piccoli comportamenti (il contenuto e' tutto HTML statico) */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header: diventa solido quando si scorre
  var header = document.querySelector(".header");
  function onScroll() {
    if (header) header.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu mobile
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("menu");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
      if (header) header.classList.toggle("is-solid", !open || window.scrollY > 40);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        btn.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        btn.focus();
      }
    });
  }

  // Caroselli: frecce su desktop, swipe nativo su mobile
  Array.prototype.forEach.call(document.querySelectorAll(".row__wrap"), function (wrap) {
    var track = wrap.querySelector(".row__track");
    var prev = wrap.querySelector(".row__arrow--prev");
    var next = wrap.querySelector(".row__arrow--next");
    if (!track || !prev || !next) return;
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.hidden = track.scrollLeft <= 2;
      next.hidden = track.scrollLeft >= max;
    }
    function go(dir) {
      track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
    }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  // Bottoni "Presto disponibile": niente salto in cima alla pagina
  Array.prototype.forEach.call(document.querySelectorAll("[data-soon]"), function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  // Copia link
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
    b.addEventListener("click", function () {
      var url = b.getAttribute("data-copy");
      var ok = b.parentNode.querySelector(".share__ok");
      function done(msg) { if (ok) { ok.textContent = msg; setTimeout(function () { ok.textContent = ""; }, 2500); } }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(function () { done("Link copiato!"); }, function () { done(url); });
      } else {
        var t = document.createElement("textarea");
        t.value = url; t.setAttribute("readonly", ""); t.style.position = "absolute"; t.style.left = "-9999px";
        document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); done("Link copiato!"); } catch (err) { done(url); }
        document.body.removeChild(t);
      }
    });
  });

  // Video YouTube: si carica solo al click (youtube-nocookie)
  Array.prototype.forEach.call(document.querySelectorAll("[data-yt]"), function (b) {
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(b.getAttribute("data-yt")) + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label") || "Video YouTube";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      b.parentNode.replaceChild(f, b);
    });
  });
  // Video in sovrimpressione: il player youtube-nocookie si carica solo al clic
  var lastFocus = null;
  function closeVideo() {
    var m = document.querySelector(".vmodal");
    if (!m) return;
    m.parentNode.removeChild(m);
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-ytmodal]"), function (b) {
    b.addEventListener("click", function () {
      lastFocus = b;
      var vert = b.hasAttribute("data-vertical");
      var id = encodeURIComponent(b.getAttribute("data-ytmodal"));
      var m = document.createElement("div");
      m.className = "vmodal" + (vert ? " vmodal--v" : "");
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      m.setAttribute("aria-label", b.getAttribute("aria-label") || "Video");
      m.innerHTML = '<div class="vmodal__box"><a class="vmodal__yt" href="https://www.youtube.com/watch?v=' + id +
        '" target="_blank" rel="noopener">Apri su YouTube ↗</a><button class="vmodal__x" type="button" aria-label="Chiudi il video">×</button>' +
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="Video YouTube" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
      m.addEventListener("click", function (e) { if (e.target === m) closeVideo(); });
      m.querySelector(".vmodal__x").addEventListener("click", closeVideo);
      document.body.appendChild(m);
      document.body.style.overflow = "hidden";
      requestAnimationFrame(function () { m.classList.add("is-open"); });
      m.querySelector(".vmodal__x").focus();
    });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeVideo(); });

  // Animazioni allo scorrimento
  if ("IntersectionObserver" in window && !reduce) {
    var targets = document.querySelectorAll(".rows > .row, .rubsec, .vsec, .shop-sec, .about__sec, .faq, .related, .parere, .prose > h2, .prose > .table-wrap, .prose > figure, .doclist, .rgrid, .grid, .pgrid");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) {
      var grid = el.matches(".rgrid, .grid, .pgrid, .doclist");
      el.classList.add(grid ? "reveal-stagger" : "reveal");
      if (grid) Array.prototype.forEach.call(el.children, function (c, i) { c.style.transitionDelay = Math.min(i, 10) * 60 + "ms"; });
      io.observe(el);
    });
  }

  // Pop-up merch: una volta per visita, dopo 25 secondi o a metà pagina
  var pop = document.querySelector(".mpop");
  if (pop && typeof pop.showModal === "function") {
    var seen = false;
    try { seen = sessionStorage.getItem("tw-mpop") === "1"; } catch (err) {}
    var items = pop.querySelectorAll(".mpop__item");
    if (items.length) items[Math.floor(Math.random() * items.length)].hidden = false;
    var shown = false;
    var show = function () {
      if (shown || seen || document.querySelector(".vmodal") || document.querySelector("dialog[open]")) return;
      shown = true;
      try { sessionStorage.setItem("tw-mpop", "1"); } catch (err) {}
      pop.showModal();
    };
    if (!seen) {
      setTimeout(show, 25000);
      window.addEventListener("scroll", function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 600 && window.scrollY / h > 0.55) show();
      }, { passive: true });
    }
    pop.addEventListener("click", function (e) {
      var r = pop.getBoundingClientRect();
      var fuori = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if ((e.target === pop && fuori) || e.target.hasAttribute("data-mpop-close")) pop.close();
    });
  }
  // Pagina prodotto: scelta colore e taglia -> link Stripe della variante giusta
  var pick = document.querySelector(".pick[data-varianti]");
  if (pick) {
    var vars = JSON.parse(pick.getAttribute("data-varianti"));
    var img = document.getElementById("pdp-img"), price = document.getElementById("pdp-price");
    var buy = document.getElementById("pdp-buy"), note = document.getElementById("pdp-note");
    var lc = document.getElementById("pdp-color"), ls = document.getElementById("pdp-size");
    var colorBtns = pick.querySelectorAll("[data-color]"), sizeBtns = pick.querySelectorAll("[data-size]");
    var color = colorBtns.length ? colorBtns[0].getAttribute("data-color") : "", size = "";
    function find() {
      for (var i = 0; i < vars.length; i++) if (vars[i].c === color && (vars[i].t || "") === size) return vars[i];
      return null;
    }
    function refresh() {
      Array.prototype.forEach.call(sizeBtns, function (b) {
        var t = b.getAttribute("data-size"), ok = vars.some(function (v) { return v.c === color && v.t === t; });
        b.disabled = !ok;
        if (!ok && size === t) size = "";
        b.setAttribute("aria-pressed", String(t === size));
      });
      if (ls) ls.textContent = size || "scegli";
      var v = (size || !sizeBtns.length) ? find() : null;
      if (v) {
        price.textContent = v.p; buy.href = v.u; buy.removeAttribute("aria-disabled");
        buy.textContent = "Compra ora · " + v.p; note.textContent = color + (size ? " / " + size : "") + ": paghi in sicurezza su Stripe.";
      } else {
        buy.href = "#"; buy.setAttribute("aria-disabled", "true"); buy.textContent = "Scegli la taglia";
        note.textContent = "Scegli colore e taglia, poi paghi su Stripe.";
      }
    }
    Array.prototype.forEach.call(colorBtns, function (b) {
      b.addEventListener("click", function () {
        color = b.getAttribute("data-color");
        Array.prototype.forEach.call(colorBtns, function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        if (lc) lc.textContent = color;
        if (img && img.getAttribute("src") !== b.getAttribute("data-img")) {
          img.classList.add("is-loading");
          img.onload = function () { img.classList.remove("is-loading"); };
          img.src = b.getAttribute("data-img");
        }
        refresh();
      });
    });
    Array.prototype.forEach.call(sizeBtns, function (b) {
      b.addEventListener("click", function () { size = b.getAttribute("data-size"); refresh(); });
    });
    buy.addEventListener("click", function (e) {
      if (buy.getAttribute("aria-disabled") === "true") { e.preventDefault(); note.textContent = "Prima scegli la taglia."; }
    });
    refresh();
  }
  // Shorts: anteprime mute che partono da sole quando sono sullo schermo
  var clips = document.querySelectorAll("video.vcard__clip[data-src]");
  if (clips.length && "IntersectionObserver" in window && !reduce) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) v.src = v.getAttribute("data-src");
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (!v.paused) v.pause();
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(clips, function (v) { vio.observe(v); });
  }
})();
