document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const grid = document.getElementById("craft-grid");

  function buildSlots(n) {
    grid.innerHTML = "";
    grid.classList.remove("grid-2", "grid-3");
    grid.classList.add(`grid-${n}`);

    for (let i = 1; i <= n; i++) {
      const slot = document.createElement("div");
      slot.className = "slot zona-soltar";
      slot.id = `silaba${i}`;
      grid.appendChild(slot);
    }

    if (typeof initializeDragDrop === "function") {
      initializeDragDrop();
    } else {
      console.warn("Função initializeDragDrop não encontrada");
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.toggle("active", t === tab));

      buildSlots(tab.dataset.slots);
    });
  });

  buildSlots(2);
});
