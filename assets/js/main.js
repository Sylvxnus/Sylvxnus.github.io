/* ============================================================
   SHARED SITE BEHAVIOUR
   ============================================================ */

const PAGES = [
  { name: "about.md",        href: "index.html",       tag: "home" },
  { name: "academics.log",   href: "academics.html",   tag: "grades" },
  { name: "experience.sh",   href: "experience.html",  tag: "work" },
  { name: "ctf/",            href: "ctf.html",         tag: "competitions" },
  { name: "blog/",           href: "blog.html",        tag: "exploits, writeups" },
  { name: "projects/",       href: "projects.html",    tag: "builds" },
  { name: "skills.json",     href: "skills.html",      tag: "stack" },
  { name: "contact.md",      href: "contact.html",     tag: "get in touch" },
];

/* ---------- mobile sidebar drawer ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".mobile-nav-toggle");
  const sidebar = document.querySelector(".sidebar");
  const backdrop = document.querySelector(".sidebar-backdrop");
  if (!toggle || !sidebar || !backdrop) return;

  const open = () => { sidebar.classList.add("open"); backdrop.classList.add("open"); };
  const close = () => { sidebar.classList.remove("open"); backdrop.classList.remove("open"); };

  toggle.addEventListener("click", () => {
    sidebar.classList.contains("open") ? close() : open();
  });
  backdrop.addEventListener("click", close);
}

/* ---------- toast ---------- */
let toastTimer;
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* ---------- copy to clipboard ---------- */
function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach(el => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const text = el.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied: ${text}`);
      } catch {
        showToast(text);
      }
    });
  });
}

/* ---------- command palette (Ctrl+K / Cmd+K) ---------- */
function initCommandPalette() {
  const overlay = document.createElement("div");
  overlay.className = "palette-overlay";
  overlay.innerHTML = `
    <div class="palette-box">
      <div class="palette-input-row">
        <span>&gt;</span>
        <input type="text" placeholder="cd into a page… (about, ctf, blog, contact)" autocomplete="off" />
      </div>
      <div class="palette-results"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  const input = overlay.querySelector("input");
  const results = overlay.querySelector(".palette-results");
  let selected = 0;
  let filtered = PAGES;

  function render() {
    results.innerHTML = "";
    filtered.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "palette-item" + (i === selected ? " sel" : "");
      row.innerHTML = `<span>${p.name}</span><span class="tag">${p.tag}</span>`;
      row.addEventListener("mouseenter", () => { selected = i; render(); });
      row.addEventListener("click", () => { window.location.href = p.href; });
      results.appendChild(row);
    });
    if (filtered.length === 0) {
      results.innerHTML = `<div class="palette-item">no matches</div>`;
    }
  }

  function open() {
    overlay.classList.add("open");
    input.value = "";
    filtered = PAGES;
    selected = 0;
    render();
    setTimeout(() => input.focus(), 30);
  }
  function close() { overlay.classList.remove("open"); }

  input.addEventListener("input", () => {
    const q = input.value.toLowerCase();
    filtered = PAGES.filter(p => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q));
    selected = 0;
    render();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); selected = Math.min(selected + 1, filtered.length - 1); render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); selected = Math.max(selected - 1, 0); render(); }
    if (e.key === "Enter" && filtered[selected]) { window.location.href = filtered[selected].href; }
    if (e.key === "Escape") { close(); }
  });

  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.classList.contains("open") ? close() : open();
    }
    if (e.key === "Escape") close();
  });

  document.querySelectorAll("[data-open-palette]").forEach(btn => {
    btn.addEventListener("click", open);
  });
}

/* ---------- topbar command typing effect ---------- */
function initTopbarTyping() {
  const el = document.querySelector(".topbar-cmd .path");
  if (!el) return;
  const full = el.getAttribute("data-command") || "";
  el.textContent = "";
  let i = 0;
  function type() {
    if (i <= full.length) {
      el.textContent = full.slice(0, i);
      i++;
      setTimeout(type, 22);
    }
  }
  type();
}

/* ---------- konami code easter egg ---------- */
function initKonami() {
  const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let pos = 0;
  document.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === seq[pos]) {
      pos++;
      if (pos === seq.length) {
        pos = 0;
        showToast("flag{k0n4mi_c0d3_still_w0rks} — nice instincts");
      }
    } else {
      pos = (key === seq[0]) ? 1 : 0;
    }
  });
}

/* ---------- animated bar fill on scroll into view ---------- */
function initBarReveal() {
  const bars = document.querySelectorAll("[data-fill]");
  if (!bars.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.getAttribute("data-fill");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => io.observe(b));
}

/* ---------- experience.sh — ls -la row toggle ---------- */
function initLsToggle() {
  const rows = document.querySelectorAll(".ls-row[data-toggle]");
  if (!rows.length) return;
  rows.forEach(row => {
    row.setAttribute("tabindex", "0");
    row.setAttribute("role", "button");
    const detail = row.nextElementSibling;
    row.setAttribute("aria-expanded", "false");

    function toggle() {
      const isOpen = detail.classList.contains("show");
      document.querySelectorAll(".ls-detail.show").forEach(d => d.classList.remove("show"));
      document.querySelectorAll(".ls-row.open").forEach(r => { r.classList.remove("open"); r.setAttribute("aria-expanded", "false"); });
      if (!isOpen) {
        detail.classList.add("show");
        row.classList.add("open");
        row.setAttribute("aria-expanded", "true");
      }
    }
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initCommandPalette();
  initTopbarTyping();
  initCopyButtons();
  initKonami();
  initBarReveal();
  initLsToggle();
});
