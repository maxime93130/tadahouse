(function () {
  "use strict";
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Le mot qui change dans le titre */
  var mot = document.querySelector(".mot-change");
  if (mot && !calme) {
    var mots = mot.getAttribute("data-mots").split("|");
    var i = 0;
    setInterval(function () {
      i = (i + 1) % mots.length;
      var cible = mots[i];
      var actuel = mot.textContent;
      var n = actuel.length;
      var efface = setInterval(function () {
        n -= 1;
        mot.textContent = actuel.slice(0, Math.max(n, 0));
        if (n <= 0) {
          clearInterval(efface);
          var k = 0;
          var ecrit = setInterval(function () {
            k += 1;
            mot.textContent = cible.slice(0, k);
            if (k >= cible.length) clearInterval(ecrit);
          }, 55);
        }
      }, 35);
    }, 2600);
  }

  /* 2. Démo : un site par métier */
  var SITES = {
    pain: { adresse: "maison-pain.fr", nom: "Maison Pain", titre: "Le pain du quartier, cuit deux fois par jour.", info: "Ouvert du mardi au dimanche, 7 h à 19 h 30", bouton: "Commander pour demain" },
    fleur: { adresse: "atelier-petale.fr", nom: "Atelier Pétale", titre: "Des bouquets de saison, composés devant vous.", info: "Livraison dans le quartier le jour même", bouton: "Choisir un bouquet" },
    garage: { adresse: "garage-des-lilas.fr", nom: "Garage des Lilas", titre: "Entretien et réparation, sans mauvaise surprise.", info: "Devis en ligne sous 24 h, toutes marques", bouton: "Prendre rendez-vous" }
  };
  var demo = document.querySelector("[data-demo-site]");
  var onglets = Array.prototype.slice.call(document.querySelectorAll("[data-site]"));
  var auto = null;
  function montre(cle) {
    var s = SITES[cle];
    if (!s || !demo) return;
    var mini = demo.querySelector(".mini-site");
    mini.setAttribute("data-site-theme", cle);
    demo.querySelector("[data-site-adresse]").textContent = s.adresse;
    demo.querySelector("[data-site-nom]").textContent = s.nom;
    demo.querySelector("[data-site-titre]").textContent = s.titre;
    demo.querySelector("[data-site-info]").textContent = s.info;
    demo.querySelector("[data-site-bouton]").textContent = s.bouton;
    mini.classList.remove("change");
    void mini.offsetWidth;
    mini.classList.add("change");
    onglets.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-site") === cle)); });
  }
  onglets.forEach(function (b) {
    b.addEventListener("click", function () {
      if (auto) { clearInterval(auto); auto = null; }
      montre(b.getAttribute("data-site"));
    });
  });
  if (demo && !calme) {
    var ordre = ["pain", "fleur", "garage"], j = 0;
    auto = setInterval(function () { j = (j + 1) % ordre.length; montre(ordre[j]); }, 3600);
  }

  /* 3. Démo : la discussion de prise de rendez-vous */
  var fil = document.querySelector("[data-discussion]");
  if (fil && !calme && "IntersectionObserver" in window) {
    var messages = Array.prototype.slice.call(fil.querySelectorAll(".message"));
    var enCours = false;
    function joue() {
      if (enCours) return;
      enCours = true;
      messages.forEach(function (m) { m.classList.add("cache"); m.classList.remove("entre"); });
      var etape = 0;
      function suivant() {
        if (etape >= messages.length) {
          setTimeout(function () { enCours = false; joue(); }, 4200);
          return;
        }
        var m = messages[etape];
        var auto = m.classList.contains("message--auto");
        var points = null;
        if (auto) {
          points = document.createElement("li");
          points.className = "message message--auto message--points entre";
          points.innerHTML = "<i></i><i></i><i></i>";
          fil.insertBefore(points, m);
        }
        setTimeout(function () {
          if (points) points.remove();
          m.classList.remove("cache");
          m.classList.add("entre");
          etape += 1;
          setTimeout(suivant, 900);
        }, auto ? 1100 : 500);
      }
      suivant();
    }
    var vu = new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting) { joue(); vu.disconnect(); }
    }, { threshold: 0.4 });
    vu.observe(fil);
  }

  /* 4. Tada : confettis pixel */
  var couleurs = ["#C9D86A", "#4E2342", "#F5F1E6", "#E9C9DC", "#2B3BEE", "#F2C230"];
  function confettis(x, y) {
    if (calme) return;
    for (var c = 0; c < 36; c++) {
      var p = document.createElement("span");
      p.className = "confetti";
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.style.background = couleurs[c % couleurs.length];
      document.body.appendChild(p);
      var angle = Math.random() * Math.PI * 2;
      var force = 80 + Math.random() * 180;
      var dx = Math.cos(angle) * force;
      var dy = Math.sin(angle) * force - 120;
      var anim = p.animate([
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + dx + "px," + (dy + 260) + "px) rotate(" + (Math.random() * 540 - 270) + "deg)", opacity: 0 }
      ], { duration: 1100 + Math.random() * 600, easing: "cubic-bezier(.2,.7,.4,1)" });
      anim.onfinish = (function (el) { return function () { el.remove(); }; })(p);
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-confettis]"), function (b) {
    b.addEventListener("click", function () {
      var r = b.getBoundingClientRect();
      confettis(r.left + r.width / 2, r.top + r.height / 3);
    });
  });

  /* 5. Hero : la maison se construit, fait tada, et les écrans suivent la souris */
  var scene = document.querySelector("[data-scene]");
  if (scene) {
    var maison = scene.querySelector(".scene__maison");
    function tadaAuto() {
      var r = maison.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) confettis(r.left + r.width * 0.62, r.top + r.height * 0.1);
    }
    if (!calme) setTimeout(tadaAuto, 1850);
    var rejoue = scene.querySelector("[data-rejouer]");
    rejoue.addEventListener("click", function () {
      if (calme) return;
      scene.classList.remove("joue");
      void scene.offsetWidth;
      scene.classList.add("joue");
    });
    if (!calme && window.matchMedia("(pointer: fine)").matches) {
      scene.addEventListener("pointermove", function (e) {
        var r = scene.getBoundingClientRect();
        scene.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        scene.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      scene.addEventListener("pointerleave", function () {
        scene.style.setProperty("--px", 0);
        scene.style.setProperty("--py", 0);
      });
    }
  }
})();
