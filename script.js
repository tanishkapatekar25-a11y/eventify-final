const appState = {
  mode: localStorage.getItem("eventify-mode") || "light",
  palette: localStorage.getItem("eventify-palette") || "teal"
};

const categoryDescriptions = {
  Sports: "Competitive, energetic experiences for players and fans.",
  Music: "Live performances, elegant nights, and crowd-ready entertainment.",
  Education: "Curiosity-led academic and technical events with strong learning value.",
  Travel: "Immersive outdoor and city experiences for explorers.",
  Seminar: "Insight-driven talks and workshops for professional growth."
};

const page = document.body.dataset.page;

function applyTheme() {
  document.body.dataset.mode = appState.mode;
  document.body.dataset.palette = appState.palette;
  const modeToggle = document.getElementById("modeToggle");
  const themeToggle = document.getElementById("themeToggle");
  if (modeToggle) {
    modeToggle.textContent = appState.mode === "dark" ? "☀️" : "🌙";
    modeToggle.setAttribute("aria-label", appState.mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
  if (themeToggle) {
    themeToggle.textContent = appState.palette === "teal" ? "Neutral Mode" : "Teal Mode";
  }
}

function setupNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const modeToggle = document.getElementById("modeToggle");
  const themeToggle = document.getElementById("themeToggle");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("open");
    });
  }

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      appState.mode = appState.mode === "light" ? "dark" : "light";
      localStorage.setItem("eventify-mode", appState.mode);
      applyTheme();
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      appState.palette = appState.palette === "teal" ? "neutral" : "teal";
      localStorage.setItem("eventify-palette", appState.palette);
      applyTheme();
    });
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getCountdownParts(targetDate) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

function renderCountdown(element, targetDate) {
  if (!element) return;

  function update() {
    const { expired, days, hours, minutes, seconds } = getCountdownParts(targetDate);
    if (expired) {
      element.innerHTML = '<div class="countdown-item"><strong>Live</strong><span>Event started</span></div>';
      return;
    }
    element.innerHTML = `
      <div class="countdown-item"><strong>${days}</strong><span>Days</span></div>
      <div class="countdown-item"><strong>${hours}</strong><span>Hours</span></div>
      <div class="countdown-item"><strong>${minutes}</strong><span>Minutes</span></div>
      <div class="countdown-item"><strong>${seconds}</strong><span>Seconds</span></div>
    `;
  }

  update();
  setInterval(update, 1000);
}

function findNextEvent() {
  return [...EVENT_DATA]
    .filter((event) => new Date(event.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function getEventUrl(slug) {
  return `events/${slug}.html`;
}

function renderHomePage() {
  const slidesEl = document.getElementById("heroSlides");
  const dotsEl = document.getElementById("heroDots");
  const categoriesEl = document.getElementById("homeCategories");
  const nextEvent = findNextEvent();

  if (nextEvent) {
    const title = document.getElementById("nextEventTitle");
    const meta = document.getElementById("nextEventMeta");
    const link = document.getElementById("nextEventLink");
    title.textContent = nextEvent.title;
    meta.textContent = `${formatDate(nextEvent.date)} | ${nextEvent.venue}`;
    link.href = getEventUrl(nextEvent.slug);
    renderCountdown(document.getElementById("nextEventCountdown"), nextEvent.date);
  }

  if (slidesEl && dotsEl) {
    const highlights = EVENT_DATA.slice(0, 5);
    slidesEl.innerHTML = highlights.map((event, index) => `
      <article class="slide ${index === 0 ? "active" : ""}">
        <span class="chip">${event.category}</span>
        <h2>${event.title}</h2>
        <p>${event.highlight}</p>
        <small>${formatDate(event.date)} | ${event.venue}</small>
      </article>
    `).join("");

    dotsEl.innerHTML = highlights.map((_, index) => `
      <button class="dot ${index === 0 ? "active" : ""}" type="button" aria-label="Go to slide ${index + 1}"></button>
    `).join("");

    let activeSlide = 0;
    const slides = [...slidesEl.children];
    const dots = [...dotsEl.children];

    function showSlide(index) {
      slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
      dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      activeSlide = index;
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => showSlide(index));
    });

    setInterval(() => {
      showSlide((activeSlide + 1) % slides.length);
    }, 4000);
  }

  if (categoriesEl) {
    const grouped = [...new Set(EVENT_DATA.map((event) => event.category))];
    categoriesEl.innerHTML = grouped.map((category) => {
      const items = EVENT_DATA.filter((event) => event.category === category).slice(0, 3);
      return `
        <article class="card category-card">
          <p class="eyebrow">${category}</p>
          <h3>${items.length} events</h3>
          <p>${categoryDescriptions[category]}</p>
          <ul class="mini-list">
            ${items.map((item) => `<li>${item.title}</li>`).join("")}
          </ul>
          <a class="text-link" href="categories.html#${category.toLowerCase()}">Open ${category}</a>
        </article>
      `;
    }).join("");
  }
}

function createEventCard(event) {
  return `
    <article class="card event-card" tabindex="0">
      <span class="chip">${event.category}</span>
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <div class="event-meta">
        <span>${formatDate(event.date)}</span>
        <span>${event.venue}</span>
      </div>
      <div class="event-card-footer">
        <div class="inline-countdown" data-countdown="${event.date}"></div>
        <a class="btn btn-secondary" href="${getEventUrl(event.slug)}">View & Register</a>
      </div>
    </article>
  `;
}

function renderCategoriesPage() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const dateFilter = document.getElementById("dateFilter");
  const sections = document.getElementById("categorySections");

  if (!sections) return;

  const months = [...new Set(EVENT_DATA.map((event) => new Date(event.date).toLocaleString("en-IN", { month: "long" })))];
  const categories = [...new Set(EVENT_DATA.map((event) => event.category))];

  categoryFilter.innerHTML += categories.map((category) => `<option value="${category}">${category}</option>`).join("");
  dateFilter.innerHTML += months.map((month) => `<option value="${month}">${month}</option>`).join("");

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const categoryValue = categoryFilter.value;
    const monthValue = dateFilter.value;

    const filtered = EVENT_DATA.filter((event) => {
      const matchesQuery = [event.title, event.venue, event.description, event.category].join(" ").toLowerCase().includes(query);
      const matchesCategory = categoryValue === "all" || event.category === categoryValue;
      const matchesMonth = monthValue === "all" || new Date(event.date).toLocaleString("en-IN", { month: "long" }) === monthValue;
      return matchesQuery && matchesCategory && matchesMonth;
    });

    sections.innerHTML = categories.map((category) => {
      const events = filtered.filter((event) => event.category === category);
      if (!events.length) return "";
      return `
        <section class="category-section" id="${category.toLowerCase()}">
          <div class="section-heading compact">
            <p class="eyebrow">${category}</p>
            <h2>${categoryDescriptions[category]}</h2>
          </div>
          <div class="event-grid">
            ${events.map(createEventCard).join("")}
          </div>
        </section>
      `;
    }).join("");

    if (!sections.innerHTML.trim()) {
      sections.innerHTML = `
        <article class="card">
          <h2>No matching events found</h2>
          <p class="muted">Try changing the keyword, category, or month filter to see more Eventify listings.</p>
        </article>
      `;
    }

    document.querySelectorAll("[data-countdown]").forEach((element) => {
      renderCountdown(element, element.dataset.countdown);
    });
  }

  [searchInput, categoryFilter, dateFilter].forEach((control) => {
    control.addEventListener("input", render);
    control.addEventListener("change", render);
  });
  render();
}

function badgeForTicket(ticketType) {
  if (/vip|premium|front row|backstage|pro/i.test(ticketType)) return "VIP Ticket Holder";
  if (/student|participant|runner|walker|camper|delegate|entry|explorer|general|standard/i.test(ticketType)) return "Early Bird Registered";
  return "Eventify Member";
}

function openModal(title, text, badge) {
  const modal = document.getElementById("confirmationModal");
  if (!modal) return;
  modal.querySelector("#modalTitle").textContent = title;
  modal.querySelector("#modalText").textContent = text;
  modal.querySelector("#modalBadge").textContent = badge;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function setupModal() {
  const modal = document.getElementById("confirmationModal");
  if (!modal) return;
  const closeBtn = modal.querySelector(".modal-close");
  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };
  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
}

function setupGenericForms() {
  document.querySelectorAll("form[data-form-type='newsletter'], form[data-form-type='contact']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "Guest";
      openModal("Thanks for reaching out!", `${name}, your submission has been recorded in this static demo.`, "Eventify Insider");
      form.reset();
    });
  });

  document.querySelectorAll(".registration-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const attendee = data.get("name");
      const ticket = data.get("ticket");
      const eventTitle = form.dataset.eventTitle;
      openModal(`Ticket reserved for ${eventTitle}`, `${attendee}, your ${ticket} registration is confirmed. A confirmation email would be sent in a live system.`, badgeForTicket(ticket));
      form.reset();
    });
  });
}

function renderEventPage() {
  const root = document.querySelector("[data-event-slug]");
  if (!root) return;
  const event = EVENT_DATA.find((item) => item.slug === root.dataset.eventSlug);
  if (!event) return;

  document.title = `Eventify | ${event.title}`;
  document.getElementById("eventCategory").textContent = event.category;
  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventDate").textContent = formatDate(event.date);
  document.getElementById("eventVenue").textContent = event.venue;
  document.getElementById("eventDescription").textContent = event.description;
  document.getElementById("eventHighlight").textContent = event.highlight;
  document.getElementById("eventHeroLabel").textContent = event.image;
  document.getElementById("registrationForm").dataset.eventTitle = event.title;

  const ticketSelect = document.getElementById("ticketType");
  ticketSelect.innerHTML = event.tickets.map((ticket) => `<option value="${ticket}">${ticket}</option>`).join("");

  renderCountdown(document.getElementById("eventCountdown"), event.date);
}

function renderDashboard() {
  const statsEl = document.getElementById("dashboardStats");
  if (!statsEl) return;

  const totalRegistrations = EVENT_DATA.reduce((sum, event) => sum + event.registrations, 0);
  const totalEvents = EVENT_DATA.length;
  const categories = [...new Set(EVENT_DATA.map((event) => event.category))].length;
  const avgRegistrations = Math.round(totalRegistrations / totalEvents);

  statsEl.innerHTML = `
    <article class="card stat-card"><strong>${totalEvents}</strong><span>Total Events</span></article>
    <article class="card stat-card"><strong>${categories}</strong><span>Categories</span></article>
    <article class="card stat-card"><strong>${totalRegistrations}</strong><span>Projected Registrations</span></article>
    <article class="card stat-card"><strong>${avgRegistrations}</strong><span>Average per Event</span></article>
  `;

  const categoryStats = document.getElementById("categoryStats");
  const ticketStats = document.getElementById("ticketStats");
  const grouped = EVENT_DATA.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + event.registrations;
    return acc;
  }, {});
  categoryStats.innerHTML = Object.entries(grouped).map(([category, value]) => `
    <div class="stat-row"><span>${category}</span><strong>${value}</strong></div>
  `).join("");

  const ticketCounts = {};
  EVENT_DATA.forEach((event) => {
    event.tickets.forEach((ticket) => {
      ticketCounts[ticket] = (ticketCounts[ticket] || 0) + 1;
    });
  });
  ticketStats.innerHTML = Object.entries(ticketCounts).slice(0, 8).map(([ticket, count]) => `
    <div class="stat-row"><span>${ticket}</span><strong>${count} events</strong></div>
  `).join("");
}

function setupFaq() {
  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.parentElement.classList.toggle("open");
    });
  });
}

applyTheme();
setupNav();
setupModal();
setupGenericForms();
setupFaq();

if (page === "home") renderHomePage();
if (page === "categories") renderCategoriesPage();
if (page === "dashboard") renderDashboard();
renderEventPage();
