/* sizechart.js — Miqasi (مقاسي) MVP
   - reads window.SizeChartApp = { enabled, buttonText, chest, waist, length, note }
   - renders a modal popup with a generated HTML table
   - no dependencies, RTL-aware, keyboard accessible
*/
(function () {
  // Guard: config & enabled
  var cfg = (typeof window !== "undefined" && window.SizeChartApp) || {};
  if (!cfg.enabled) return;

  // Find trigger
  var trigger = document.querySelector(cfg.mountSelector || "#miqasi-open");
  if (!trigger) return;

  // Parse CSV-like lists from settings
  function splitVals(v) {
    if (!v || typeof v !== "string") return [];
    return v
      .split(",")
      .map(function (s) { return s.trim(); })
      .filter(Boolean);
  }

  var sizesFallback = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  var chest = splitVals(cfg.chest || "80-85,86-91,92-99,100-107,108-114,115-122");
  var waist = splitVals(cfg.waist || "66-70,71-76,77-84,85-91,92-99,100-107");
  var length = splitVals(cfg.length || "64-66,67-69,70-74,75-79,80-84,85-89");
  var note = cfg.note || "إذا كان قياسك بين مقاسين، اختر الأكبر لمزيد من الراحة.";

  // Decide labels by the longest column we have
  var maxRows = Math.max(chest.length, waist.length, length.length, 0);
  var labels = (cfg.labels && splitVals(cfg.labels)) || sizesFallback.slice(0, maxRows || 5);

  // Basic styles (scoped)
  var modalId = "miqasi-modal";
  var styleId = "miqasi-style";
  if (!document.getElementById(styleId)) {
    var st = document.createElement("style");
    st.id = styleId;
    st.textContent =
      ".miqasi-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:999999}" +
      ".miqasi-box{background:#fff;border-radius:12px;max-width:720px;width:92%;max-height:90vh;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.15)}" +
      ".miqasi-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eee}" +
      ".miqasi-title{margin:0;font-weight:700;font-size:16px}" +
      ".miqasi-close{border:none;background:transparent;font-size:24px;cursor:pointer;line-height:1}" +
      ".miqasi-body{padding:14px 16px}" +
      ".miqasi-table{width:100%;border-collapse:collapse;text-align:center}" +
      ".miqasi-table th,.miqasi-table td{padding:9px;border-bottom:1px solid #f2f2f2}" +
      ".miqasi-table thead th{border-bottom:1px solid #e8e8e8;background:#fafafa;font-weight:700}" +
      ".miqasi-note{margin-top:10px;color:#666;font-size:14px}" +
      ".miqasi-trigger{cursor:pointer;text-decoration:underline}" +
      "@media (max-width:480px){.miqasi-title{font-size:15px}.miqasi-table th,.miqasi-table td{padding:8px;font-size:13px}}" ;
    document.head.appendChild(st);
  }

  function isRTL() {
    var d = document.documentElement;
    return (d && (d.dir === "rtl" || (document.body && document.body.dir === "rtl")));
  }

  function buildTableHTML() {
    var unit = (cfg.unit === "inch" || cfg.unit === "in") ? "in" : "سم";
    var thAlign = isRTL() ? "right" : "left";
    var cols = [
      "المقاس",
      "الصدر (" + (unit === "in" ? "in" : "سم") + ")",
      "الخصر (" + (unit === "in" ? "in" : "سم") + ")",
      "الطول (" + (unit === "in" ? "in" : "سم") + ")"
    ];

    var head =
      "<thead><tr>" +
      cols.map(function (c) {
        return '<th style="text-align:' + thAlign + '">' + c + "</th>";
      }).join("") +
      "</tr></thead>";

    var bodyRows = "";
    var rowsCount = Math.max(labels.length, chest.length, waist.length, length.length);
    for (var i = 0; i < rowsCount; i++) {
      bodyRows += "<tr>" +
        "<td>" + (labels[i] || "") + "</td>" +
        "<td>" + (chest[i] || "") + "</td>" +
        "<td>" + (waist[i] || "") + "</td>" +
        "<td>" + (length[i] || "") + "</td>" +
      "</tr>";
    }

    return '<table class="miqasi-table">' + head + "<tbody>" + bodyRows + "</tbody></table>";
  }

  function openModal() {
    // Prevent duplicates
    if (document.getElementById(modalId)) return;

    var overlay = document.createElement("div");
    overlay.className = "miqasi-overlay";
    overlay.id = modalId;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    var box = document.createElement("div");
    box.className = "miqasi-box";
    box.innerHTML =
      '<div class="miqasi-head">' +
        '<h3 class="miqasi-title">' + (cfg.buttonText || "جدول المقاسات") + '</h3>' +
        '<button class="miqasi-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div class="miqasi-body">' +
        buildTableHTML() +
        (note ? '<p class="miqasi-note">' + note + "</p>" : "") +
      "</div>";

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Close handlers
    var closeBtn = box.querySelector(".miqasi-close");
    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onEsc);
    }
    function onEsc(e) {
      if (e.key === "Escape") close();
    }
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", onEsc);
  }

  // Make trigger look clickable if not already
  if (!trigger.style.cursor) trigger.style.cursor = "pointer";
  if (!trigger.className.includes("miqasi-trigger")) trigger.className += " miqasi-trigger";

  // Click to open modal
  trigger.addEventListener("click", openModal);
})();
