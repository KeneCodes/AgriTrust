/* ---------- Navbar scroll ---------- */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

/* ---------- Mobile nav ---------- */
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("mobileNav").classList.toggle("open");
});

document.querySelectorAll(".mobile-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("mobileNav").classList.remove("open");
  });
});

/* ---------- Smooth scroll helpers ---------- */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

document
  .getElementById("findCropBtn")
  .addEventListener("click", () => scrollToId("crops"));
document
  .getElementById("startSellingBtn")
  .addEventListener("click", () => scrollToId("cta"));
document
  .getElementById("ctaFindCrop")
  .addEventListener("click", () => scrollToId("crops"));
document.getElementById("ctaStartSelling").addEventListener("click", () => {
  alert("Seller registration coming soon! Stay tuned.");
});

/* ---------- Crops Data ---------- */
const crops = [
  {
    name: "White Maize",
    weight: "500kg min",
    price: "&#8358;85,000/ton",
    rating: 4.8,
    reviews: 142,
    badge: "Hot",
    img: "images/white_maize.jpg",
  },
  {
    name: "Soybeans",
    weight: "500kg min",
    price: "&#8358;120,000/ton",
    rating: 4.9,
    reviews: 98,
    badge: "New",
    img: "images/soybeans.jpg",
  },
  {
    name: "Brown Beans",
    weight: "500kg min",
    price: "&#8358;230,000/ton",
    rating: 4.7,
    reviews: 76,
    badge: "Popular",
    img: "images/brown_beans.jpg",
  },
  {
    name: "Local Rice",
    weight: "500kg min",
    price: "&#8358;340,000/ton",
    rating: 4.6,
    reviews: 210,
    badge: "Hot",
    img: "images/rice_grains.jpg",
  },
  {
    name: "Yellow Maize",
    weight: "500kg min",
    price: "&#8358;78,000/ton",
    rating: 4.5,
    reviews: 88,
    badge: "Available",
    img: "images/hero_grains.jpg",
  },
];

function renderStars(rating) {
  const full = Math.floor(rating);
  let html = "";
  for (let i = 0; i < 5; i++) {
    if (i < full) html += '<span class="star">&#9733;</span>';
    else html += '<span class="star" style="opacity:.25">&#9733;</span>';
  }
  return html;
}

function renderCrops() {
  const grid = document.getElementById("cropsGrid");
  grid.innerHTML = crops
    .map(
      (c, i) => `
        <div class="crop-card fade-in" style="transition-delay:${i * 0.08}s" data-crop="${c.name}">
          <div class="crop-img-wrap">
            <img src="${c.img}" alt="${c.name}" loading="lazy" />
          </div>
          <div class="crop-info">
            <div class="crop-name">${c.name}</div>
            <div class="crop-weight">${c.weight} &nbsp;&bull;&nbsp; ${c.price}</div>
          </div>
          <div class="crop-footer">
            <div>
              <div class="stars">${renderStars(c.rating)}</div>
              <small style="color:var(--text-muted);font-size:.72rem">${c.rating} (${c.reviews} reviews)</small>
            </div>
            <span class="crop-badge">${c.badge}</span>
          </div>
        </div>
    `,
    )
    .join("");

  document.querySelectorAll(".crop-card").forEach((card) => {
    card.addEventListener("click", () => {
      const name = card.dataset.crop;
      const crop = crops.find((c) => c.name === name);
      alert(
        `${name}\nMin Order: ${crop.weight}\nPrice: ${crop.price.replace(/&#8358;/g, "NGN")}\n\nContact a verified seller to place your order!`,
      );
    });
  });
}

renderCrops();

/* ---------- Intersection Observer (fade-in) ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

function initObserver() {
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}
initObserver();

/* ---------- Counter animation ---------- */
let counted = false;

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || "";
  const isDecimal = el.dataset.decimal === "10";
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);

    if (isDecimal) {
      el.textContent = (value / 10).toFixed(1) + "%";
    } else {
      el.textContent = value.toLocaleString() + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll("[data-target]").forEach(animateCounter);
      }
    });
  },
  { threshold: 0.5 },
);

const statsBar = document.querySelector(".stats-bar");
if (statsBar) statsObserver.observe(statsBar);

/* ---------- Re-observe after dynamic content ---------- */
setTimeout(initObserver, 150);
