/* ============================================================
   CYBER BLOG — root@MSI terminal + exploit feed
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ---- typewriter: keep the root@MSI prompt ---- */
  const termText = document.getElementById("terminal-text");
  const caret = document.getElementById("terminal-caret");
  if (termText) {
    const text = "(root㉿MSI)-[/home/aidan/portfolio/cyber_blog]";
    let i = 0;
    (function type() {
      if (i < text.length) {
        termText.textContent += text.charAt(i);
        i++;
        setTimeout(type, 45);
      } else if (caret) {
        caret.style.display = "inline-block";
      }
    })();
  }

  /* ---- exploit feed ---- */
  const cardsContainer = document.getElementById("cards-container");
  const currentDateSpan = document.getElementById("current-date");
  const prevBtn = document.getElementById("prev-day");
  const nextBtn = document.getElementById("next-day");
  const modal = document.getElementById("exploit-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-description");
  const modalDetails = document.getElementById("modal-details");
  const modalLink = document.getElementById("modal-link");
  const closeModalBtn = document.getElementById("modal-close");

  if (!cardsContainer) return;

  let exploitData = {};
  let dates = [];
  let currentDate;

  function closeModal() { modal.classList.remove("open"); }
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  function updateNavButtons() {
    const index = dates.indexOf(currentDate);
    prevBtn.disabled = index >= dates.length - 1;
    nextBtn.disabled = index <= 0;
  }

  function formatDate(d) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderCards(date) {
    cardsContainer.innerHTML = "";
    currentDateSpan.textContent = formatDate(date);
    const exploits = exploitData[date] || [];
    if (!exploits.length) {
      cardsContainer.innerHTML = `<div class="exploit-empty">No entries logged for this day.</div>`;
      return;
    }
    exploits.forEach(exp => {
      const card = document.createElement("div");
      card.className = `card exploit-card ${exp.severity}`;
      card.innerHTML = `
        <div class="title">${exp.title}</div>
        <div class="desc">${exp.description}</div>
        <span class="pill ${exp.severity === 'high' ? 'red' : exp.severity === 'low' ? 'green' : 'amber'}" style="margin-top:12px;">${exp.severity} severity</span>
      `;
      card.addEventListener("click", () => {
        modalTitle.textContent = exp.title;
        modalDesc.textContent = exp.description;
        modalDetails.innerHTML = (exp.details || "No additional details available.").replace(/\n/g, "<br>");
        if (exp.link) {
          modalLink.href = exp.link;
          modalLink.style.display = "inline-flex";
        } else {
          modalLink.style.display = "none";
        }
        modal.classList.add("open");
      });
      cardsContainer.appendChild(card);
    });
  }

  function navigate(direction) {
    let index = dates.indexOf(currentDate);
    if (direction === "prev" && index < dates.length - 1) index++;
    if (direction === "next" && index > 0) index--;
    currentDate = dates[index];
    renderCards(currentDate);
    updateNavButtons();
  }

  prevBtn.addEventListener("click", () => navigate("prev"));
  nextBtn.addEventListener("click", () => navigate("next"));

  fetch("data/exploits.json")
    .then(res => {
      if (!res.ok) throw new Error("network");
      return res.json();
    })
    .then(data => {
      exploitData = data;
      dates = Object.keys(exploitData).sort().reverse();
      if (!dates.length) throw new Error("empty");
      currentDate = dates[0];
      renderCards(currentDate);
      updateNavButtons();
    })
    .catch(() => {
      cardsContainer.innerHTML = `<div class="exploit-empty">Could not load the exploit feed. If you're viewing this from disk, serve the folder over a local server instead of opening the file directly.</div>`;
    });
});
