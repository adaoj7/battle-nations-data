const elements = {
  statUnits: document.querySelector("#statUnits"),
  statAffiliations: document.querySelector("#statAffiliations"),
  statCategories: document.querySelector("#statCategories"),
  statUnlock: document.querySelector("#statUnlock"),
  searchInput: document.querySelector("#searchInput"),
  affiliationSelect: document.querySelector("#affiliationSelect"),
  categorySelect: document.querySelector("#categorySelect"),
  unitTypeSelect: document.querySelector("#unitTypeSelect"),
  resetButton: document.querySelector("#resetButton"),
  resultsMeta: document.querySelector("#resultsMeta"),
  resultsGrid: document.querySelector("#resultsGrid"),
};

const DEFAULT_SORT_DIR = {
  name: "asc",
  id: "asc",
  affiliation: "asc",
  category: "asc",
  unitType: "asc",
  unlock: "asc",
  rank: "desc",
  actions: "desc",
};

const state = {
  units: [],
  filteredUnits: [],
  selectedId: null,
  filters: {
    search: "",
    affiliation: "",
    category: "",
    unitType: "",
    sort: "name",
    direction: "asc",
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMinutes(minutes) {
  if (!minutes) {
    return "Instant";
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes < 60 * 24) {
    return `${(minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1)} hr`;
  }
  return `${(minutes / (60 * 24)).toFixed(1)} d`;
}

function getLatestRank(unit) {
  const ranks = unit?.stats?.ranks ?? [];
  return ranks[ranks.length - 1] ?? null;
}

function uniqueValues(units, key) {
  return [...new Set(units.map((unit) => unit[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function unitSearchBlob(unit) {
  return [
    unit.name,
    unit.description,
    unit.affiliation,
    unit.category,
    unit.unitType,
    unit.building,
    ...(unit.immunities ?? []),
    ...(unit.actions ?? []).map((action) => `${action.name} ${action.damageType ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();
}

function sortUnits(units, mode, direction = "asc") {
  const copy = [...units];
  const flip = direction === "desc" ? -1 : 1;
  const byName = (a, b) => a.name.localeCompare(b.name);
  const cmpStr = (a, b) => (a ?? "").localeCompare(b ?? "");

  copy.sort((left, right) => {
    let primary = 0;
    switch (mode) {
      case "id":
        primary = left.id - right.id;
        break;
      case "affiliation":
        primary = cmpStr(left.affiliation, right.affiliation);
        break;
      case "category":
        primary = cmpStr(left.category, right.category);
        break;
      case "unitType":
        primary = cmpStr(left.unitType, right.unitType);
        break;
      case "unlock":
        primary = (left.unlockLevel ?? 0) - (right.unlockLevel ?? 0);
        break;
      case "rank":
        primary = (left.maxRank ?? 0) - (right.maxRank ?? 0);
        break;
      case "actions":
        primary = (left.actions?.length ?? 0) - (right.actions?.length ?? 0);
        break;
      case "name":
      default:
        primary = byName(left, right);
        break;
    }
    if (primary !== 0) return primary * flip;
    return mode === "name" ? 0 : byName(left, right);
  });
  return copy;
}

function selectDefaultUnit() {
  if (!state.filteredUnits.length) {
    state.selectedId = null;
    return;
  }

  const currentStillVisible = state.filteredUnits.some((unit) => unit.id === state.selectedId);
  if (!currentStillVisible) {
    state.selectedId = null;
  }
}

function buildQueryString() {
  const params = new URLSearchParams();
  if (state.filters.search) params.set("search", state.filters.search);
  if (state.filters.affiliation) params.set("affiliation", state.filters.affiliation);
  if (state.filters.category) params.set("category", state.filters.category);
  if (state.filters.unitType) params.set("unitType", state.filters.unitType);
  if (state.filters.sort !== "name") params.set("sort", state.filters.sort);
  if (state.filters.direction !== (DEFAULT_SORT_DIR[state.filters.sort] ?? "asc")) {
    params.set("dir", state.filters.direction);
  }
  if (state.selectedId) params.set("id", String(state.selectedId));
  return params.toString();
}

function syncUrl() {
  const query = buildQueryString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function renderSummaryStats() {
  const unlockValues = state.units.map((unit) => unit.unlockLevel ?? 0);
  elements.statUnits.textContent = String(state.units.length);
  elements.statAffiliations.textContent = String(uniqueValues(state.units, "affiliation").length);
  elements.statCategories.textContent = String(uniqueValues(state.units, "category").length);
  elements.statUnlock.textContent = `Lv ${Math.max(...unlockValues)}`;
}

function renderSelectOptions(select, values) {
  const current = select.value;
  select.innerHTML = `<option value="">All</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
  select.value = current;
}

function updateFilterState() {
  state.filters.search = elements.searchInput.value.trim();
  state.filters.affiliation = elements.affiliationSelect.value;
  state.filters.category = elements.categorySelect.value;
  state.filters.unitType = elements.unitTypeSelect.value;
}

function applyFilters() {
  const search = state.filters.search.toLowerCase();
  const filtered = state.units.filter((unit) => {
    if (state.filters.affiliation && unit.affiliation !== state.filters.affiliation) return false;
    if (state.filters.category && unit.category !== state.filters.category) return false;
    if (state.filters.unitType && unit.unitType !== state.filters.unitType) return false;
    if (search && !unitSearchBlob(unit).includes(search)) return false;
    return true;
  });

  state.filteredUnits = sortUnits(filtered, state.filters.sort, state.filters.direction);
  selectDefaultUnit();
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    window.prompt("Copy this value", value);
  }
}

function buildDetailHTML(unit) {
  const latestRank = getLatestRank(unit);
  const rawPath = `./data/units/${unit.id}.json`;
  const absoluteRawUrl = new URL(rawPath, window.location.href).href;
  const actionPreview = (unit.actions ?? []).slice(0, 4);
  const resistances = Object.entries(unit.resistances?.hp ?? {});

  return `
    <div class="detail-inner">
      <div class="detail-header">
        <div class="detail-summary">
          <p class="detail-note">${escapeHtml(unit.description)}</p>
        </div>
        <div class="detail-actions">
          <a class="button-secondary" href="${rawPath}">Raw JSON</a>
          <button class="button-secondary" type="button" data-copy-url="${escapeHtml(absoluteRawUrl)}">Copy URL</button>
        </div>
      </div>

      <div class="detail-stack">
        <section class="detail-box">
          <span class="meta-label">Quick facts</span>
          <div class="fact-grid">
            <article><span class="meta-label">ID</span><strong>#${unit.id}</strong></article>
            <article><span class="meta-label">Affiliation</span><strong>${escapeHtml(unit.affiliation)}</strong></article>
            <article><span class="meta-label">Category</span><strong>${escapeHtml(unit.category)}</strong></article>
            <article><span class="meta-label">Unit type</span><strong>${escapeHtml(unit.unitType)}</strong></article>
            <article><span class="meta-label">Building</span><strong>${escapeHtml(unit.building)}</strong></article>
            <article><span class="meta-label">Unlock</span><strong>Lv ${unit.unlockLevel}</strong></article>
            <article><span class="meta-label">Production</span><strong>${formatMinutes(unit.productionTime)}</strong></article>
            <article><span class="meta-label">Latest HP</span><strong>${latestRank?.health ?? "-"}</strong></article>
          </div>
        </section>

        <section class="detail-box">
          <span class="meta-label">Action snapshot</span>
          <ul class="action-list">
            ${actionPreview
              .map((action) => {
                const topRank = action.ranks?.[action.ranks.length - 1];
                const damageRange = topRank?.damage ? `${topRank.damage.min}-${topRank.damage.max}` : "n/a";
                return `<li><strong>${escapeHtml(action.name)}</strong> — ${escapeHtml(action.damageType ?? "Unknown")} damage, cooldown ${action.cooldown}, rank-top damage ${escapeHtml(damageRange)}</li>`;
              })
              .join("")}
          </ul>
        </section>

        <section class="detail-box">
          <span class="meta-label">Defense notes</span>
          <p class="detail-note">${unit.immunities?.length ? `Immunities: ${unit.immunities.join(", ")}.` : "No immunities listed."}</p>
          <p class="detail-note">${resistances.length ? `HP resistances: ${resistances.map(([key, value]) => `${key} ${value}`).join(", ")}.` : "No HP resistance map listed."}</p>
        </section>

        <section class="detail-box">
          <span class="meta-label">Public file path</span>
          <p><code>${escapeHtml(rawPath)}</code></p>
          <p class="detail-note">Absolute: <code>${escapeHtml(absoluteRawUrl)}</code></p>
        </section>

        <section class="detail-box">
          <span class="meta-label">JSON preview</span>
          <pre class="detail-json">${escapeHtml(JSON.stringify(unit, null, 2))}</pre>
        </section>
      </div>
    </div>
  `;
}

function renderResults() {
  const count = state.filteredUnits.length;
  elements.resultsMeta.textContent = count === 1 ? "1 unit" : `${count} units`;

  if (!count) {
    elements.resultsGrid.innerHTML = `<div class="status-message">No units match that filter set. Try clearing one of the narrower selectors.</div>`;
    return;
  }

  const sortHeader = (key, label, extraClass = "") => {
    const isActive = state.filters.sort === key;
    const arrow = isActive ? (state.filters.direction === "asc" ? "▲" : "▼") : "";
    const ariaSort = isActive ? (state.filters.direction === "asc" ? "ascending" : "descending") : "none";
    return `
      <th class="${extraClass}" aria-sort="${ariaSort}">
        <button type="button" class="sort-button${isActive ? " is-active" : ""}" data-sort="${key}">
          <span>${label}</span>
          <span class="sort-arrow" aria-hidden="true">${arrow}</span>
        </button>
      </th>
    `;
  };

  const tableHTML = `
    <table class="unit-table" role="grid">
      <thead>
        <tr>
          ${sortHeader("id", "ID", "col-id")}
          ${sortHeader("name", "Name", "col-name")}
          ${sortHeader("affiliation", "Affiliation", "col-aff")}
          ${sortHeader("category", "Category", "col-cat")}
          ${sortHeader("unitType", "Unit type", "col-type")}
          ${sortHeader("unlock", "Unlock", "col-unlock")}
          ${sortHeader("rank", "Rank", "col-rank")}
          ${sortHeader("actions", "Actions", "col-actions")}
        </tr>
      </thead>
      <tbody>
        ${state.filteredUnits
          .map((unit) => {
            const isOpen = unit.id === state.selectedId;
            const detailRow = isOpen
              ? `<tr class="unit-detail-row"><td colspan="8">${buildDetailHTML(unit)}</td></tr>`
              : "";
            return `
              <tr class="unit-row${isOpen ? " is-open" : ""}" data-unit-id="${unit.id}" tabindex="0" role="row" aria-expanded="${isOpen}">
                <td class="col-id"><span class="cell-id">#${unit.id}</span></td>
                <td class="col-name">
                  <span class="cell-caret" aria-hidden="true">${isOpen ? "▾" : "▸"}</span>
                  <span class="cell-name">${escapeHtml(unit.name)}</span>
                </td>
                <td class="col-aff">${escapeHtml(unit.affiliation ?? "")}</td>
                <td class="col-cat">${escapeHtml(unit.category ?? "")}</td>
                <td class="col-type">${escapeHtml(unit.unitType ?? "")}</td>
                <td class="col-unlock"><span class="cell-mono">Lv ${unit.unlockLevel ?? "-"}</span></td>
                <td class="col-rank"><span class="cell-mono">R${unit.maxRank}</span></td>
                <td class="col-actions"><span class="cell-mono">${unit.actions.length}</span></td>
              </tr>
              ${detailRow}
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  elements.resultsGrid.innerHTML = tableHTML;
  elements.resultsGrid.classList.toggle("has-open", state.selectedId !== null);

  if (state.selectedId !== null) {
    const openRow = elements.resultsGrid.querySelector(`.unit-row[data-unit-id="${state.selectedId}"]`);
    if (openRow) {
      const grid = elements.resultsGrid;
      const headerOffset = grid.querySelector("thead")?.offsetHeight ?? 0;
      grid.scrollTop = openRow.offsetTop - headerOffset;
    }
  }

  elements.resultsGrid.querySelectorAll(".unit-row").forEach((row) => {
    const handler = () => {
      const id = Number(row.getAttribute("data-unit-id"));
      state.selectedId = state.selectedId === id ? null : id;
      render();
    };
    row.addEventListener("click", handler);
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handler();
      }
    });
  });

  elements.resultsGrid.querySelectorAll("[data-copy-url]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      copyText(button.getAttribute("data-copy-url"));
    });
  });

  elements.resultsGrid.querySelectorAll(".detail-actions a").forEach((link) => {
    link.addEventListener("click", (event) => event.stopPropagation());
  });

  elements.resultsGrid.querySelectorAll(".sort-button").forEach((button) => {
    button.addEventListener("click", () => {
      setSort(button.getAttribute("data-sort"));
    });
  });
}

function render() {
  syncUrl();
  renderResults();
}

function loadStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  state.filters.search = params.get("search") ?? "";
  state.filters.affiliation = params.get("affiliation") ?? "";
  state.filters.category = params.get("category") ?? "";
  state.filters.unitType = params.get("unitType") ?? "";
  state.filters.sort = params.get("sort") ?? "name";
  state.filters.direction = params.get("dir") ?? DEFAULT_SORT_DIR[state.filters.sort] ?? "asc";
  state.selectedId = params.get("id") ? Number(params.get("id")) : null;

  elements.searchInput.value = state.filters.search;
  elements.affiliationSelect.value = state.filters.affiliation;
  elements.categorySelect.value = state.filters.category;
  elements.unitTypeSelect.value = state.filters.unitType;
}

function setSort(column) {
  if (state.filters.sort === column) {
    state.filters.direction = state.filters.direction === "asc" ? "desc" : "asc";
  } else {
    state.filters.sort = column;
    state.filters.direction = DEFAULT_SORT_DIR[column] ?? "asc";
  }
  applyFilters();
  render();
}

function attachEvents() {
  [
    elements.searchInput,
    elements.affiliationSelect,
    elements.categorySelect,
    elements.unitTypeSelect,
  ].forEach((element) => {
    element.addEventListener("input", () => {
      updateFilterState();
      applyFilters();
      render();
    });
    element.addEventListener("change", () => {
      updateFilterState();
      applyFilters();
      render();
    });
  });

  elements.resetButton.addEventListener("click", () => {
    state.filters = {
      search: "",
      affiliation: "",
      category: "",
      unitType: "",
      sort: "name",
      direction: "asc",
    };
    elements.searchInput.value = "";
    elements.affiliationSelect.value = "";
    elements.categorySelect.value = "";
    elements.unitTypeSelect.value = "";
    applyFilters();
    render();
  });
}

function getCurrentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "dark" || explicit === "light") return explicit;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setupThemeToggle() {
  const buttons = document.querySelectorAll(".theme-toggle");
  if (buttons.length === 0) return;

  const updateLabel = () => {
    const current = getCurrentTheme();
    const next = current === "dark" ? "light" : "dark";
    buttons.forEach((button) => {
      button.setAttribute("aria-label", `Switch to ${next} mode`);
      button.dataset.theme = current;
    });
  };

  updateLabel();

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = getCurrentTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("bn-theme", next);
      } catch (_) {}
      updateLabel();
    });
  });

  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (!document.documentElement.dataset.theme) updateLabel();
  });
}

async function loadTypesBlock() {
  const codeEl = document.querySelector("#typesCode");
  const copyButton = document.querySelector("#copyTypesButton");
  if (!codeEl) return;

  try {
    const response = await fetch("./types/unit.d.ts", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    codeEl.textContent = text;

    if (copyButton) {
      copyButton.addEventListener("click", () => {
        copyText(text);
        const original = copyButton.textContent;
        copyButton.textContent = "Copied";
        setTimeout(() => {
          copyButton.textContent = original;
        }, 1200);
      });
    }
  } catch (error) {
    codeEl.textContent = `// Could not load types/unit.d.ts: ${error.message}`;
  }
}

async function init() {
  setupThemeToggle();
  loadTypesBlock();
  try {
    const response = await fetch("./data/units.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }

    state.units = await response.json();
    renderSummaryStats();
    renderSelectOptions(elements.affiliationSelect, uniqueValues(state.units, "affiliation"));
    renderSelectOptions(elements.categorySelect, uniqueValues(state.units, "category"));
    renderSelectOptions(elements.unitTypeSelect, uniqueValues(state.units, "unitType"));
    loadStateFromUrl();
    attachEvents();
    applyFilters();
    render();
  } catch (error) {
    elements.resultsGrid.innerHTML = `<div class="status-message">Could not load the unit dataset. ${escapeHtml(error.message)} — make sure you are serving this repo over HTTP rather than opening the file directly from disk.</div>`;
  }
}

init();
