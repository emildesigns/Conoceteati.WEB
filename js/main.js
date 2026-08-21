(function () {
  "use strict";

  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  var fab = document.getElementById("fabWhatsapp");
  var hero = document.querySelector(".hero");

  function onScroll() {
    var scrolled = window.scrollY > 40;
    nav.classList.toggle("is-scrolled", scrolled);

    if (fab && hero) {
      var heroBottom = hero.getBoundingClientRect().bottom;
      fab.classList.toggle("is-visible", heroBottom < 0);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealItems.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              entry.target.classList.add("is-visible");
            }, i * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  // ---------------------------------------------------------
  // Chip spark — infinity glyph flash on tap
  // ---------------------------------------------------------
  var INFINITY_PATH = "M18.178 8c5.096 0 5.096 8 0 8-5.095 0-6.598-8-12.539-8-4.577 0-4.577 8 0 8 5.941 0 7.444-8 12.539-8z";
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var chips = document.querySelectorAll(".chips li");

  if (chips.length && !reduceMotion) {
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var rect = chip.getBoundingClientRect();
        var spark = document.createElement("span");
        spark.className = "chip-spark";
        spark.style.left = (rect.left + rect.width / 2) + "px";
        spark.style.top = (rect.top + rect.height / 2) + "px";
        spark.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path pathLength="1" d="' + INFINITY_PATH + '" fill="none" stroke="#B98A3D" stroke-width="1.6"/>' +
          "</svg>";
        document.body.appendChild(spark);
        setTimeout(function () {
          if (spark.parentNode) spark.parentNode.removeChild(spark);
        }, 2500);
      });
    });
  }

  // ---------------------------------------------------------
  // Turno modal
  // ---------------------------------------------------------
  var WHATSAPP_NUMBER = "5493517021592";
  var CONTACT_EMAIL = "Ezecornaglia.0@gmail.com";

  var overlay = document.getElementById("turnoOverlay");
  var modalCloseBtn = document.getElementById("turnoClose");
  var form = document.getElementById("turnoForm");
  var terapiaCualWrap = document.getElementById("f-terapiaCualWrap");
  var terapiaCualInput = document.getElementById("f-terapiaCual");
  var errorEl = document.getElementById("turnoError");
  var sendWhatsappBtn = document.getElementById("turnoSendWhatsapp");
  var sendEmailBtn = document.getElementById("turnoSendEmail");
  var openTriggers = document.querySelectorAll(".js-open-turno");

  if (overlay && form) {
    var lastFocused = null;

    function openModal() {
      lastFocused = document.activeElement;
      overlay.hidden = false;
      void overlay.offsetWidth; // force reflow so the opacity transition runs
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      errorEl.hidden = true;
      var firstField = document.getElementById("f-nombre");
      if (firstField) firstField.focus();
    }

    function closeModal() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () {
        overlay.hidden = true;
      }, 250);
      if (lastFocused) lastFocused.focus();
    }

    openTriggers.forEach(function (btn) {
      btn.addEventListener("click", openModal);
    });

    modalCloseBtn.addEventListener("click", closeModal);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });

    form.querySelectorAll('input[name="terapiaPrevia"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        var showCual = radio.value === "Sí" && radio.checked;
        terapiaCualWrap.hidden = !showCual;
        if (!showCual) terapiaCualInput.value = "";
      });
    });

    function buildMessage() {
      var data = new FormData(form);
      var nombre = (data.get("nombre") || "").trim();
      var genero = data.get("genero") || "";
      var edad = data.get("edad") || "";
      var terapiaPrevia = data.get("terapiaPrevia") || "";
      var terapiaCual = (data.get("terapiaCual") || "").trim();
      var modalidad = data.get("modalidad") || "";
      var horario = data.get("horario") || "";
      var motivo = (data.get("motivo") || "").trim();

      var terapiaLine = terapiaPrevia;
      if (terapiaPrevia === "Sí" && terapiaCual) {
        terapiaLine += " (" + terapiaCual + ")";
      }

      var lines = [
        "Hola Ezequiel! Quiero coordinar un turno.",
        "",
        "Nombre y apellido: " + nombre,
        "Género: " + genero,
        "Edad: " + edad,
        "¿Asistió a terapia antes?: " + terapiaLine,
        "Modalidad preferida: " + modalidad,
        "Franja horaria: " + horario,
        "Motivo de consulta: " + (motivo || "No especificado")
      ];
      return lines.join("\n");
    }

    function validate() {
      var valid = form.checkValidity();
      errorEl.hidden = valid;
      if (!valid) form.reportValidity();
      return valid;
    }

    sendWhatsappBtn.addEventListener("click", function () {
      if (!validate()) return;
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildMessage());
      window.open(url, "_blank", "noopener");
      closeModal();
    });

    sendEmailBtn.addEventListener("click", function () {
      if (!validate()) return;
      var subject = "Turno - " + (form.querySelector("#f-nombre").value.trim() || "Nueva consulta");
      var url = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(buildMessage());
      window.location.href = url;
      closeModal();
    });
  }
})();
