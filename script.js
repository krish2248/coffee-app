(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */

  var menuBtn = $("#menuBtn");
  var navLinks = $("#navLinks");

  function closeMenu() {
    if (!navLinks || !menuBtn) return;
    navLinks.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", navLinks).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Active section highlight ---------- */

  var sectionIds = ["v60", "recipes", "roast", "beans", "flavor", "why", "history", "data"];
  var navAnchors = {};
  sectionIds.forEach(function (id) {
    var link = $('.nav-links a[href="#' + id + '"]');
    if (link) navAnchors[id] = link;
  });

  var ticking = false;
  function updateActive() {
    ticking = false;
    var current = null;
    var y = window.scrollY + 140;
    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section && section.offsetTop <= y) current = id;
    });
    sectionIds.forEach(function (id) {
      if (navAnchors[id]) navAnchors[id].classList.toggle("is-active", id === current);
    });
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateActive);
    }
  }, { passive: true });
  updateActive();

  /* ---------- Scroll reveals ---------- */

  var revealObserver = null;
  if ("IntersectionObserver" in window && !reduceMotion) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) { revealObserver.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    function render(value) {
      el.textContent = prefix + value.toFixed(decimals) + suffix;
    }

    if (reduceMotion) { render(target); return; }

    var duration = 1500;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      render(target * eased);
      if (p < 1) window.requestAnimationFrame(frame);
      else render(target);
    }
    window.requestAnimationFrame(frame);
  }

  var counterObserver = null;
  if ("IntersectionObserver" in window) {
    counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    $$(".kpi-value").forEach(function (el) { counterObserver.observe(el); });
  }

  /* ---------- Segment bars ---------- */

  var segmentObserver = null;
  if ("IntersectionObserver" in window) {
    segmentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        $$(".seg-fill", entry.target).forEach(function (fill) {
          fill.style.width = (fill.getAttribute("data-w") || "0") + "%";
        });
        segmentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    $$(".takeaways, .chart-card").forEach(function (el) {
      if ($(".seg-fill", el)) segmentObserver.observe(el);
    });
  }

  /* ---------- Brew calculator ---------- */

  var dose = $("#dose");
  var doseOut = $("#doseOut");
  var waterOut = $("#waterOut");
  var bloomOut = $("#bloomOut");
  var calcNotes = $("#calcNotes");
  var ratio = 16;

  function updateCalc() {
    if (!dose) return;
    var grams = parseInt(dose.value, 10);
    var water = grams * ratio;
    var bloom = grams * 2;

    if (doseOut) doseOut.textContent = grams + " g";
    if (waterOut) waterOut.textContent = water + " g";
    if (bloomOut) bloomOut.textContent = bloom + " g";

    if (calcNotes) {
      var items = $$("li", calcNotes);
      if (items[0]) items[0].innerHTML = "<span>0:00</span> Bloom with " + bloom + " g, swirl gently";
      if (items[1]) items[1].innerHTML = "<span>0:45</span> Pour to " + Math.round(water * 0.6) + " g";
      if (items[2]) items[2].innerHTML = "<span>1:15</span> Finish the pour at " + water + " g";
    }

    var pct = ((grams - 10) / 30) * 100;
    dose.style.background = "linear-gradient(90deg, var(--accent) 0%, var(--accent) " + pct + "%, rgba(244,234,217,.16) " + pct + "%)";
  }

  if (dose) {
    dose.addEventListener("input", updateCalc);
    $$(".ratio-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ratio = parseInt(btn.getAttribute("data-ratio"), 10);
        $$(".ratio-btn").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        updateCalc();
      });
    });
    updateCalc();
  }

  /* ---------- Chart helpers ---------- */

  var COLORS = {
    accent: "#d99a5b",
    accentSoft: "rgba(217,154,91,.8)",
    grid: "rgba(244,234,217,.09)",
    label: "rgba(184,166,145,.75)",
    labelDim: "rgba(141,125,107,.9)",
    cream: "#f4ead9"
  };

  function fitCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, rect.width);
    var h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function roundTopRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  function easeOutCubic(p) { return 1 - Math.pow(1 - p, 3); }

  function makeTip(canvas, tip) {
    var wrap = canvas.parentElement;
    canvas.addEventListener("mousemove", function (e) {
      var hit = canvas._hit;
      if (!hit || !tip) return;
      var rect = wrap.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      if (mx < hit.pad.l || mx > hit.w - hit.pad.r || my < 0 || my > hit.h) {
        tip.classList.remove("is-on");
        return;
      }
      var best = null;
      var bestDist = Infinity;
      hit.points.forEach(function (pt) {
        var d = Math.abs(pt.x - mx);
        if (d < bestDist) { bestDist = d; best = pt; }
      });
      if (!best || bestDist > 40) {
        tip.classList.remove("is-on");
        return;
      }
      tip.textContent = best.text;
      tip.style.left = best.x + "px";
      tip.style.top = best.y + "px";
      tip.classList.add("is-on");
    });
    canvas.addEventListener("mouseleave", function () {
      if (tip) tip.classList.remove("is-on");
    });
  }

  /* ---------- Market line chart ---------- */

  var marketData = {
    labels: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
    values: [34, 37, 40, 43, 38, 45, 51, 56, 61, 68, 76, 85, 95, 106, 118],
    forecastFrom: 8
  };

  function drawMarket(canvas, progress) {
    var f = fitCanvas(canvas);
    var ctx = f.ctx, w = f.w, h = f.h;
    var pad = { l: 46, r: 18, t: 20, b: 34 };
    var max = 120;
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    var n = marketData.values.length;

    function xAt(i) { return pad.l + (i / (n - 1)) * plotW; }
    function yAt(v) { return pad.t + plotH - (v / max) * plotH; }

    ctx.font = '10px "SFMono-Regular", Consolas, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var val = (max / 4) * g;
      var gy = yAt(val);
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(w - pad.r, gy);
      ctx.stroke();
      ctx.fillStyle = COLORS.labelDim;
      ctx.fillText("$" + val + "B", pad.l - 8, gy);
    }

    var step = w < 520 ? 4 : 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (var i = 0; i < n; i++) {
      if (i % step !== 0 && i !== n - 1) continue;
      if (i === n - 1 && (n - 1) % step !== 0) {
        // always show the final year
      }
      ctx.fillStyle = COLORS.labelDim;
      ctx.fillText(String(marketData.labels[i]), xAt(i), h - pad.b + 10);
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.l, 0, plotW * progress + 1, h);
    ctx.clip();

    var area = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    area.addColorStop(0, "rgba(217,154,91,.26)");
    area.addColorStop(1, "rgba(217,154,91,0)");
    ctx.beginPath();
    ctx.moveTo(xAt(0), h - pad.b);
    for (var a = 0; a <= marketData.forecastFrom; a++) {
      ctx.lineTo(xAt(a), yAt(marketData.values[a]));
    }
    ctx.lineTo(xAt(marketData.forecastFrom), h - pad.b);
    ctx.closePath();
    ctx.fillStyle = area;
    ctx.fill();

    ctx.beginPath();
    for (var s = 0; s <= marketData.forecastFrom; s++) {
      var px = xAt(s), py = yAt(marketData.values[s]);
      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(217,154,91,.45)";
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    for (var d = marketData.forecastFrom; d < n; d++) {
      var dx = xAt(d), dy = yAt(marketData.values[d]);
      if (d === marketData.forecastFrom) ctx.moveTo(dx, dy); else ctx.lineTo(dx, dy);
    }
    ctx.strokeStyle = "rgba(231,187,133,.75)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.setLineDash([]);

    for (var p = 0; p < n; p++) {
      var cx = xAt(p), cy = yAt(marketData.values[p]);
      var forecast = p >= marketData.forecastFrom;
      ctx.beginPath();
      ctx.arc(cx, cy, forecast ? 3.2 : 3.8, 0, Math.PI * 2);
      if (forecast) {
        ctx.fillStyle = "#0f0b08";
        ctx.fill();
        ctx.strokeStyle = COLORS.accentSoft;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else {
        ctx.fillStyle = COLORS.accent;
        ctx.fill();
      }
    }
    ctx.restore();

    canvas._hit = {
      pad: pad, w: w, h: h,
      points: marketData.labels.map(function (label, idx) {
        return {
          x: xAt(idx),
          y: yAt(marketData.values[idx]),
          text: label + " · $" + marketData.values[idx] + "B" + (idx >= marketData.forecastFrom ? " (forecast)" : "")
        };
      })
    };
  }

  /* ---------- Region bar chart ---------- */

  var regionData = {
    labels: ["Europe", "Asia-Pac", "N. America", "S. America", "Africa", "C. America"],
    values: [54, 39, 29, 24, 12, 6]
  };

  function drawRegion(canvas, progress) {
    var f = fitCanvas(canvas);
    var ctx = f.ctx, w = f.w, h = f.h;
    var pad = { l: 34, r: 10, t: 24, b: 34 };
    var max = 60;
    var plotW = w - pad.l - pad.r;
    var plotH = h - pad.t - pad.b;
    var n = regionData.values.length;
    var slot = plotW / n;
    var barW = Math.min(42, slot * 0.56);

    ctx.font = '10px "SFMono-Regular", Consolas, monospace';
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var val = (max / 4) * g;
      var gy = pad.t + plotH - (val / max) * plotH;
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, gy);
      ctx.lineTo(w - pad.r, gy);
      ctx.stroke();
      ctx.fillStyle = COLORS.labelDim;
      ctx.fillText(String(val), pad.l - 7, gy);
    }

    var grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + plotH);
    grad.addColorStop(0, "#e2ab6d");
    grad.addColorStop(1, "rgba(217,154,91,.35)");

    for (var i = 0; i < n; i++) {
      var value = regionData.values[i];
      var barH = (value / max) * plotH * progress;
      var bx = pad.l + slot * i + (slot - barW) / 2;
      var by = pad.t + plotH - barH;
      roundTopRect(ctx, bx, by, barW, barH, 5);
      ctx.fillStyle = grad;
      ctx.fill();

      if (progress > 0.85) {
        ctx.fillStyle = COLORS.accent;
        ctx.font = '10px "SFMono-Regular", Consolas, monospace';
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(value), bx + barW / 2, by - 5);

        ctx.fillStyle = COLORS.label;
        ctx.font = (w < 430 ? "9px" : "10px") + ' "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(regionData.labels[i], pad.l + slot * i + slot / 2, pad.t + plotH + 10);
      }
    }

    canvas._hit = {
      pad: pad, w: w, h: h,
      points: regionData.values.map(function (value, idx) {
        return {
          x: pad.l + slot * idx + slot / 2,
          y: pad.t + plotH - (value / max) * plotH,
          text: regionData.labels[idx] + " · " + value + "M bags"
        };
      })
    };
  }

  /* ---------- Donut chart ---------- */

  var beanData = {
    segments: [
      { label: "Arabica", value: 60, color: "#d99a5b" },
      { label: "Robusta", value: 40, color: "#7f5a3f" }
    ]
  };

  function drawDonut(canvas, progress) {
    var f = fitCanvas(canvas);
    var ctx = f.ctx, w = f.w, h = f.h;
    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.min(w, h) / 2 - 30;
    var thickness = Math.max(18, radius * 0.32);
    var total = beanData.segments.reduce(function (sum, seg) { return sum + seg.value; }, 0);
    var start = -Math.PI / 2;
    var maxSweep = Math.PI * 2 * progress;
    var gap = 0.05;

    ctx.lineWidth = thickness;
    ctx.lineCap = "butt";

    beanData.segments.forEach(function (seg) {
      var sweep = (seg.value / total) * Math.PI * 2;
      var segStart = start;
      var segEnd = start + sweep;
      var visibleEnd = Math.min(segEnd - gap / 2, -Math.PI / 2 + maxSweep - gap / 2);
      if (visibleEnd > segStart + gap / 2) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, segStart + gap / 2, visibleEnd);
        ctx.strokeStyle = seg.color;
        ctx.stroke();
      }
      start = segEnd;
    });

    if (progress > 0.9) {
      var alpha = Math.min(1, (progress - 0.9) / 0.1);
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = COLORS.cream;
      ctx.font = '600 ' + Math.round(radius * 0.42) + 'px "Iowan Old Style", Georgia, serif';
      ctx.fillText("60%", cx, cy - 8);
      ctx.fillStyle = COLORS.label;
      ctx.font = '600 10px "Segoe UI", system-ui, sans-serif';
      ctx.fillText("ARABICA", cx, cy + radius * 0.26);
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- Chart bootstrapping ---------- */

  var charts = [
    { canvas: $("#marketChart"), tip: $("#marketTip"), draw: drawMarket },
    { canvas: $("#regionChart"), tip: $("#regionTip"), draw: drawRegion },
    { canvas: $("#beanChart"), tip: null, draw: drawDonut }
  ].filter(function (c) { return c.canvas; });

  charts.forEach(function (chart) {
    makeTip(chart.canvas, chart.tip);
  });

  function animateChart(chart) {
    var canvas = chart.canvas;
    canvas._started = true;
    if (reduceMotion) {
      chart.draw(canvas, 1);
      return;
    }
    var duration = 1100;
    var startTime = null;
    function frame(now) {
      if (startTime === null) startTime = now;
      var p = Math.min(1, (now - startTime) / duration);
      chart.draw(canvas, easeOutCubic(p));
      if (p < 1) window.requestAnimationFrame(frame);
      else chart.draw(canvas, 1);
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var chartObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var chart = entry.target._chart;
        if (chart && !chart.canvas._started) animateChart(chart);
        chartObserver.unobserve(entry.target);
      });
    }, { threshold: 0.25 });

    charts.forEach(function (chart) {
      var wrap = chart.canvas.closest(".chart-card") || chart.canvas.parentElement;
      wrap._chart = chart;
      chartObserver.observe(wrap);
    });
  } else {
    charts.forEach(function (chart) { chart.draw(chart.canvas, 1); });
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      charts.forEach(function (chart) {
        if (chart.canvas._started) chart.draw(chart.canvas, 1);
      });
    }, 160);
  });
})();
