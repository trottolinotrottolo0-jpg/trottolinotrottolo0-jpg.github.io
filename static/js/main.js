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
})();
