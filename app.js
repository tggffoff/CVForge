const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const defaultState = {
  firstName: "Jean",
  lastName: "Dupont",
  jobTitle: "Développeur web",
  city: "Paris",
  email: "jean@example.com",
  phone: "+33 6 00 00 00 00",
  website: "linkedin.com/in/jean",
  summary:
    "Développeur curieux et rigoureux, passionné par la création de produits numériques simples et efficaces.",
  accent: "#2563eb",

  experiences: [
    {
      role: "Développeur web",
      company: "Entreprise",
      date: "2024 — Aujourd'hui",
      desc:
        "Développement et maintenance d'applications web.\nTravail en équipe et amélioration continue.",
    },
  ],

  education: [
    {
      degree: "Licence Informatique",
      school: "Université",
      date: "2021 — 2024",
    },
  ],

  skills: ["JavaScript", "HTML / CSS", "Git"],
};

let state = loadState();

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

function loadState() {
  try {
    const saved = localStorage.getItem("cvforge");

    if (saved) {
      return {
        ...structuredClone(defaultState),
        ...JSON.parse(saved),
      };
    }
  } catch (error) {
    console.warn("Impossible de charger le CV sauvegardé.", error);
  }

  return structuredClone(defaultState);
}

function saveState() {
  localStorage.setItem("cvforge", JSON.stringify(state));

  const savedState = $("#savedState");

  if (savedState) {
    savedState.textContent = "Sauvegardé ✓";

    setTimeout(() => {
      savedState.textContent = "";
    }, 2000);
  }
}

function syncInputs() {
  $$("[data-field]").forEach((element) => {
    const field = element.dataset.field;

    element.value = state[field] ?? "";

    element.addEventListener("input", () => {
      state[field] = element.value;
      renderPreview();
    });
  });

  const accent = $("#accent");

  if (accent) {
    accent.value = state.accent;

    accent.addEventListener("change", () => {
      state.accent = accent.value;
      renderPreview();
    });
  }
}

function renderExperiences() {
  const container = $("#experiences");

  if (!container) return;

  container.innerHTML = state.experiences
    .map(
      (experience, index) => `
        <div class="item">
          <button
            class="remove"
            type="button"
            onclick="removeExperience(${index})"
            aria-label="Supprimer cette expérience"
          >
            ×
          </button>

          <div class="item-grid">
            <label>
              Poste
              <input
                data-list="experiences"
                data-index="${index}"
                data-key="role"
                value="${escapeHTML(experience.role)}"
              />
            </label>

            <label>
              Entreprise
              <input
                data-list="experiences"
                data-index="${index}"
                data-key="company"
                value="${escapeHTML(experience.company)}"
              />
            </label>

            <label>
              Période
              <input
                data-list="experiences"
                data-index="${index}"
                data-key="date"
                value="${escapeHTML(experience.date)}"
              />
            </label>

            <label>
              Description
              <textarea
                data-list="experiences"
                data-index="${index}"
                data-key="desc"
                rows="3"
              >${escapeHTML(experience.desc)}</textarea>
            </label>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderEducation() {
  const container = $("#education");

  if (!container) return;

  container.innerHTML = state.education
    .map(
      (education, index) => `
        <div class="item">
          <button
            class="remove"
            type="button"
            onclick="removeEducation(${index})"
            aria-label="Supprimer cette formation"
          >
            ×
          </button>

          <div class="item-grid">
            <label>
              Diplôme
              <input
                data-list="education"
                data-index="${index}"
                data-key="degree"
                value="${escapeHTML(education.degree)}"
              />
            </label>

            <label>
              Établissement
              <input
                data-list="education"
                data-index="${index}"
                data-key="school"
                value="${escapeHTML(education.school)}"
              />
            </label>

            <label>
              Période
              <input
                data-list="education"
                data-index="${index}"
                data-key="date"
                value="${escapeHTML(education.date)}"
              />
            </label>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderSkills() {
  const container = $("#skills");

  if (!container) return;

  container.innerHTML = state.skills
    .map(
      (skill, index) => `
        <div class="skills">
          <input
            data-skill="${index}"
            value="${escapeHTML(skill)}"
          />

          <button
            class="remove"
            type="button"
            onclick="removeSkill(${index})"
            aria-label="Supprimer cette compétence"
          >
            ×
          </button>
        </div>
      `,
    )
    .join("");
}

function attachDynamicListeners() {
  $$("[data-list]").forEach((element) => {
    element.addEventListener("input", () => {
      const list = element.dataset.list;
      const index = Number(element.dataset.index);
      const key = element.dataset.key;

      state[list][index][key] = element.value;

      renderPreview();
    });
  });

  $$("[data-skill]").forEach((element) => {
    element.addEventListener("input", () => {
      const index = Number(element.dataset.skill);

      state.skills[index] = element.value;

      renderPreview();
    });
  });
}

function renderLists() {
  renderExperiences();
  renderEducation();
  renderSkills();
  attachDynamicListeners();
}

function renderPreview() {
  const fullName =
    `${state.firstName} ${state.lastName}`.trim() || "Votre nom";

  const initials =
    `${state.firstName?.[0] ?? ""}${state.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "CV";

  $("#rName").textContent = fullName;
  $("#rTitle").textContent = state.jobTitle || "";
  $("#avatar").textContent = initials;

  $("#rSummary").textContent = state.summary || "";

  const summarySection = $("#summarySection");

  if (summarySection) {
    summarySection.style.display = state.summary ? "" : "none";
  }

  $("#sideContact").innerHTML = [
    state.city,
    state.email,
    state.phone,
    state.website,
  ]
    .filter(Boolean)
    .map(
      (value) =>
        `<p class="contact-row">${escapeHTML(value)}</p>`,
    )
    .join("");

  $("#sideSkills").innerHTML = state.skills
    .filter(Boolean)
    .map((skill) => `<li>${escapeHTML(skill)}</li>`)
    .join("");

  $("#rExperience").innerHTML = state.experiences
    .map(
      (experience) => `
        <div class="entry">
          <div class="entry-top">
            <h3>${escapeHTML(experience.role)}</h3>
            <span class="date">${escapeHTML(experience.date)}</span>
          </div>

          <div class="org">
            ${escapeHTML(experience.company)}
          </div>

          <p class="desc">
            ${escapeHTML(experience.desc)}
          </p>
        </div>
      `,
    )
    .join("");

  $("#rEducation").innerHTML = state.education
    .map(
      (education) => `
        <div class="entry">
          <div class="entry-top">
            <h3>${escapeHTML(education.degree)}</h3>
            <span class="date">${escapeHTML(education.date)}</span>
          </div>

          <div class="org">
            ${escapeHTML(education.school)}
          </div>
        </div>
      `,
    )
    .join("");

  document.documentElement.style.setProperty(
    "--accent",
    state.accent,
  );

  $("#resume").style.setProperty("--accent", state.accent);
}

function render() {
  renderLists();
  renderPreview();
}

function removeExperience(index) {
  state.experiences.splice(index, 1);
  render();
}

function removeEducation(index) {
  state.education.splice(index, 1);
  render();
}

function removeSkill(index) {
  state.skills.splice(index, 1);
  render();
}

$("#addExperience")?.addEventListener("click", () => {
  state.experiences.push({
    role: "Nouveau poste",
    company: "Entreprise",
    date: "2026 —",
    desc: "",
  });

  render();
});

$("#addEducation")?.addEventListener("click", () => {
  state.education.push({
    degree: "Nouvelle formation",
    school: "Établissement",
    date: "2026 —",
  });

  render();
});

$("#addSkill")?.addEventListener("click", () => {
  state.skills.push("Nouvelle compétence");
  render();
});

$("#saveBtn")?.addEventListener("click", saveState);

$("#newBtn")?.addEventListener("click", () => {
  const confirmed = confirm("Créer un nouveau CV ?");

  if (!confirmed) return;

  localStorage.removeItem("cvforge");
  location.reload();
});

$("#printBtn")?.addEventListener("click", () => {
  window.print();
});

syncInputs();
render();
