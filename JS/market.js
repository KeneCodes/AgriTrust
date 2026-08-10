"use strict";

/* ============================================================
   AGRITRUST MARKETPLACE
   Marketplace filtering, search, pagination, cart & details
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     ELEMENTS
     ========================================================== */

  const productGrid = document.querySelector(".product-grid");
  const products = Array.from(document.querySelectorAll(".product-card"));

  const searchInput = document.querySelector(".search-input");

  const categoryItems = document.querySelectorAll(".category-item");
  const regionSelect = document.querySelector(".filter-select");

  const priceInputs = document.querySelectorAll(".filter-input");

  const paginationContainer = document.querySelector(".pagination-controls");
  const paginationMarket = document.querySelector(".pagination-market");

  const cartElement = document.querySelector(".cart");

  /* ==========================================================
     CONFIG
     ========================================================== */

  const PRODUCTS_PER_PAGE = 9;

  let currentPage = 1;

  let activeCategory = "All";
  let activeRegion = "All Regions";
  let minPrice = 0;
  let maxPrice = Infinity;
  let searchTerm = "";

  /* ==========================================================
     PRODUCT DATA
     Extract information directly from existing HTML
     ========================================================== */

  const productData = products.map((card, index) => {
    const titleElement = card.querySelector(".product-title");
    const priceElement = card.querySelector(".product-price");
    const stateElement = card.querySelector(".product-state");
    const categoryElement = card.querySelector(".badge-category");
    const ratingElement = card.querySelector(".rating-score");
    const qualityElement = card.querySelector(".quality-badge");
    const imageElement = card.querySelector(".product-image");
    const specsElement = card.querySelector(".product-specs-row");

    const price =
      parseFloat(priceElement?.textContent.replace(/[^\d.]/g, "")) || 0;

    return {
      id: index + 1,
      element: card,

      title: titleElement?.textContent.trim() || "",
      category: categoryElement?.textContent.trim() || "",
      price,

      state: stateElement?.textContent.trim() || "",

      rating: ratingElement?.textContent.trim() || "",

      quality: qualityElement?.textContent.trim() || "",

      image: imageElement?.src || "",
      imageAlt: imageElement?.alt || "",

      specs: specsElement?.textContent.trim() || "",

      /*
        Region is intentionally read from a data attribute.

        Example:
        <article class="product-card" data-region="North West">
      */
      region: card.dataset.region || "All Regions",

      visible: true,
    };
  });

  /* ==========================================================
     CART
     ========================================================== */

  let cart = JSON.parse(localStorage.getItem("agritrustCart")) || [];

  function saveCart() {
    localStorage.setItem("agritrustCart", JSON.stringify(cart));
  }

  function updateCartCount() {
    if (!cartElement) return;

    let cartCount = document.querySelector("#cart-count");

    if (!cartCount) {
      cartCount = document.createElement("span");
      cartCount.id = "cart-count";
      cartElement.appendChild(cartCount);
    }

    cartCount.textContent = cart.length;

    cartCount.dataset.count = cart.length;

    if (cart.length === 0) {
      cartCount.style.display = "none";
    } else {
      cartCount.style.display = "inline-flex";
    }
  }

  function addToCart(product) {
    const alreadyInCart = cart.some((item) => item.id === product.id);

    if (alreadyInCart) {
      showToast(`${product.title} is already in your cart.`);
      return;
    }

    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    saveCart();
    updateCartCount();

    showToast(`${product.title} added to cart.`);
  }

  /* ==========================================================
     FILTERING
     ========================================================== */

  function getFilteredProducts() {
    return productData.filter((product) => {
      /* ---------------- SEARCH ---------------- */

      const searchableText = `
        ${product.title}
        ${product.category}
        ${product.state}
        ${product.quality}
        ${product.region}
      `.toLowerCase();

      const matchesSearch =
        searchTerm === "" || searchableText.includes(searchTerm.toLowerCase());

      /* ---------------- CATEGORY ---------------- */

      const matchesCategory =
        activeCategory === "All" ||
        product.category.toLowerCase() === activeCategory.toLowerCase();

      /* ---------------- REGION ---------------- */

      const matchesRegion =
        activeRegion === "All Regions" ||
        product.region.toLowerCase() === activeRegion.toLowerCase();

      /* ---------------- PRICE ---------------- */

      const matchesPrice =
        product.price >= minPrice && product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesRegion && matchesPrice;
    });
  }

  /* ==========================================================
     RENDER PRODUCTS
     ========================================================== */

  function renderProducts() {
    const filteredProducts = getFilteredProducts();

    const totalPages = Math.max(
      1,
      Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
    );

    /*
      Prevent currentPage from becoming invalid after filtering.
    */
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

    const endIndex = startIndex + PRODUCTS_PER_PAGE;

    const visibleProducts = filteredProducts.slice(startIndex, endIndex);

    /*
      Hide everything first.
    */
    productData.forEach((product) => {
      product.element.style.display = "none";
    });

    /*
      Show only current page.
    */
    visibleProducts.forEach((product) => {
      product.element.style.display = "flex";
    });

    renderEmptyState(filteredProducts.length === 0);

    renderPagination(totalPages);

    updateProductCount(filteredProducts.length);
  }

  /* ==========================================================
     EMPTY STATE
     ========================================================== */

  function renderEmptyState(isEmpty) {
    let emptyState = document.querySelector(".marketplace-empty");

    if (!isEmpty) {
      emptyState?.remove();
      return;
    }

    if (emptyState) return;

    emptyState = document.createElement("div");

    emptyState.className = "marketplace-empty";

    emptyState.innerHTML = `
      <div>
        <h2>No products found</h2>
        <p>
          Try changing your search or adjusting your filters.
        </p>
        <button type="button" class="empty-reset-btn">
          Clear Filters
        </button>
      </div>
    `;

    productGrid.appendChild(emptyState);

    emptyState
      .querySelector(".empty-reset-btn")
      .addEventListener("click", resetFilters);
  }

  /* ==========================================================
     PRODUCT COUNT
     Creates one dynamically without requiring HTML changes.
     ========================================================== */

  function updateProductCount(count) {
    let countElement = document.querySelector(".marketplace-product-count");

    if (!countElement) {
      countElement = document.createElement("span");

      countElement.className = "marketplace-product-count";

      const header = document.querySelector(".marketplace-header");

      if (header) {
        header.appendChild(countElement);
      }
    }

    countElement.textContent = `${count} product${count === 1 ? "" : "s"}`;
  }

  /* ==========================================================
     PAGINATION
     ========================================================== */

  function renderPagination(totalPages) {
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    /* ---------------- PREVIOUS ---------------- */

    const previousButton = createPageButton("← Previous", currentPage === 1);

    previousButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderProducts();
        scrollToProducts();
      }
    });

    paginationContainer.appendChild(previousButton);

    /* ---------------- PAGE NUMBERS ---------------- */

    const pages = getPaginationPages(totalPages);

    pages.forEach((page) => {
      if (page === "...") {
        const ellipsis = document.createElement("span");

        ellipsis.className = "page-ellipsis";

        ellipsis.textContent = "…";

        paginationContainer.appendChild(ellipsis);

        return;
      }

      const button = createPageButton(page, false, page === currentPage);

      button.classList.add("page-number");

      button.addEventListener("click", () => {
        currentPage = page;

        renderProducts();

        scrollToProducts();
      });

      paginationContainer.appendChild(button);
    });

    /* ---------------- NEXT ---------------- */

    const nextButton = createPageButton("Next →", currentPage === totalPages);

    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;

        renderProducts();

        scrollToProducts();
      }
    });

    paginationContainer.appendChild(nextButton);

    if (paginationMarket) {
      paginationMarket.style.display =
        totalPages <= 1 && getFilteredProducts().length <= PRODUCTS_PER_PAGE
          ? "none"
          : "flex";
    }
  }

  function createPageButton(text, disabled = false, active = false) {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "btn-page";

    button.textContent = text;

    button.disabled = disabled;

    if (active) {
      button.classList.add("active");
    }

    return button;
  }

  /* ==========================================================
     SMART PAGINATION
     ========================================================== */

  function getPaginationPages(totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [];

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);

    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((event) => {
        searchTerm = event.target.value.trim();

        currentPage = 1;

        renderProducts();
      }, 200),
    );
  }

  /* ==========================================================
     CATEGORY FILTER
     ========================================================== */

  categoryItems.forEach((category) => {
    category.addEventListener("click", () => {
      categoryItems.forEach((item) => {
        item.classList.remove("active");
      });

      category.classList.add("active");

      activeCategory = category.textContent.trim();

      currentPage = 1;

      renderProducts();
    });
  });

  /* ==========================================================
     REGION FILTER
     ========================================================== */

  if (regionSelect) {
    regionSelect.addEventListener("change", (event) => {
      activeRegion = event.target.value;

      currentPage = 1;

      renderProducts();
    });
  }

  /* ==========================================================
     PRICE FILTER
     ========================================================== */

  if (priceInputs.length >= 2) {
    const minInput = priceInputs[0];
    const maxInput = priceInputs[1];

    function applyPriceFilter() {
      minPrice = parsePrice(minInput.value);

      const parsedMax = parsePrice(maxInput.value);

      maxPrice = parsedMax === null ? Infinity : parsedMax;

      if (minPrice === null) {
        minPrice = 0;
      }

      /*
        If minimum accidentally exceeds maximum,
        correct the maximum automatically.
      */
      if (maxPrice < minPrice) {
        maxPrice = minPrice;

        maxInput.value = `₦${minPrice}`;
      }

      currentPage = 1;

      renderProducts();
    }

    minInput.addEventListener("change", applyPriceFilter);

    maxInput.addEventListener("change", applyPriceFilter);

    minInput.addEventListener("keydown", handleEnterKey);

    maxInput.addEventListener("keydown", handleEnterKey);

    function handleEnterKey(event) {
      if (event.key === "Enter") {
        event.target.blur();
      }
    }
  }

  function parsePrice(value) {
    const cleaned = String(value)
      .replace(/[₦,\s]/g, "")
      .trim();

    if (!cleaned) return null;

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;
  }

  /* ==========================================================
     PRODUCT DETAILS
     ========================================================== */

  document.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".btn-details");

    if (!detailsButton) return;

    const card = detailsButton.closest(".product-card");

    if (!card) return;

    const product = productData.find((item) => item.element === card);

    if (!product) return;

    openProductModal(product);
  });

  /* ==========================================================
     PRODUCT MODAL
     ========================================================== */

  function openProductModal(product) {
    closeProductModal();

    const modal = document.createElement("div");

    modal.className = "product-modal";

    modal.innerHTML = `
      <div class="product-modal-overlay"></div>

      <div
        class="product-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          type="button"
          class="product-modal-close"
          aria-label="Close product details"
        >
          ×
        </button>

        <div class="product-modal-image-wrapper">
          <img
            src="${product.image}"
            alt="${escapeHTML(product.imageAlt)}"
            class="product-modal-image"
          />
        </div>

        <div class="product-modal-body">
          <span class="product-modal-category">
            ${escapeHTML(product.category)}
          </span>

          <h2 id="product-modal-title">
            ${escapeHTML(product.title)}
          </h2>

          <p class="product-modal-state">
            ${escapeHTML(product.state)}
          </p>

          <div class="product-modal-price">
            ₦${formatNumber(product.price)}/kg
          </div>

          <div class="product-modal-info">
            <div>
              <span>Rating</span>
              <strong>★ ${escapeHTML(product.rating)}</strong>
            </div>

            <div>
              <span>Quality</span>
              <strong>${escapeHTML(product.quality)}</strong>
            </div>

            <div>
              <span>Region</span>
              <strong>${escapeHTML(product.region)}</strong>
            </div>
          </div>

          <p class="product-modal-specs">
            ${escapeHTML(product.specs)}
          </p>

          <button
            type="button"
            class="product-modal-cart"
          >
            Add to Cart
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });

    document.body.style.overflow = "hidden";

    modal
      .querySelector(".product-modal-close")
      .addEventListener("click", closeProductModal);

    modal
      .querySelector(".product-modal-overlay")
      .addEventListener("click", closeProductModal);

    modal.querySelector(".product-modal-cart").addEventListener("click", () => {
      addToCart(product);
    });

    document.addEventListener("keydown", handleModalEscape);
  }

  function closeProductModal() {
    const modal = document.querySelector(".product-modal");

    if (!modal) return;

    modal.remove();

    document.body.style.overflow = "";

    document.removeEventListener("keydown", handleModalEscape);
  }

  function handleModalEscape(event) {
    if (event.key === "Escape") {
      closeProductModal();
    }
  }

  /* ==========================================================
     TOAST NOTIFICATIONS
     ========================================================== */

  function showToast(message) {
    let toast = document.querySelector(".marketplace-toast");

    if (toast) {
      toast.remove();
    }

    toast = document.createElement("div");

    toast.className = "marketplace-toast";

    toast.textContent = message;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");

      setTimeout(() => {
        toast.remove();
      }, 250);
    }, 2500);
  }

  /* ==========================================================
     RESET FILTERS
     ========================================================== */

  function resetFilters() {
    searchTerm = "";

    activeCategory = "All";

    activeRegion = "All Regions";

    minPrice = 0;

    maxPrice = Infinity;

    currentPage = 1;

    if (searchInput) {
      searchInput.value = "";
    }

    if (regionSelect) {
      regionSelect.value = "All Regions";
    }

    if (priceInputs.length >= 2) {
      priceInputs[0].value = "₦0";
      priceInputs[1].value = "₦1500";
    }

    categoryItems.forEach((item) => {
      item.classList.toggle("active", item.textContent.trim() === "All");
    });

    renderProducts();
  }

  /* ==========================================================
     UTILITY FUNCTIONS
     ========================================================== */

  function debounce(callback, delay = 200) {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  }

  function formatNumber(number) {
    return new Intl.NumberFormat("en-NG").format(number);
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function scrollToProducts() {
    const marketplaceHeader = document.querySelector(".marketplace-header");

    if (!marketplaceHeader) return;

    const headerOffset = 90;

    const position =
      marketplaceHeader.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: position,
      behavior: "smooth",
    });
  }

  updateCartCount();

  renderProducts();
});
