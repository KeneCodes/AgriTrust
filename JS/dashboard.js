"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const cartButton = document.getElementById("cart-btn");
  const cartCountElement = document.getElementById("cart-count");

  const navRight = document.querySelector(".nav-right");
  const notificationButton = document.getElementById("notification-btn");
  const accountButton = document.getElementById("account-btn");

  const dashboardSearch = document.getElementById("dashboard-search");
  const orderSearch = document.getElementById("order-search");

  const orderFilterButton = document.getElementById("order-filter-btn");

  const productCards = document.querySelectorAll(".product-card");
  const orderRows = document.querySelectorAll(".table-row");

  /* ++++++++++++ CART ++++++++++++++++++ */

  let cartCount = Number(localStorage.getItem("agritrustCartCount")) || 0;

  updateCartCount();

  function updateCartCount() {
    if (!cartCountElement) return;

    cartCountElement.textContent = cartCount;
  }

  function saveCartCount() {
    localStorage.setItem("agritrustCartCount", cartCount);
  }

  function addToCart(productCard) {
    if (!productCard) return;

    const productName =
      productCard.querySelector(".product-title")?.textContent.trim() ||
      "Product";

    cartCount += 1;

    updateCartCount();
    saveCartCount();

    showToast(`${productName} added to cart.`);
  }

  /* +++++++++++++ ADD TO CART BUTTONS +++++++++++++++++++ */

  document.querySelectorAll('[data-action="add-to-cart"]').forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest(".product-card");

      addToCart(productCard);
    });
  });

  /* +++++++++++++++ CART BUTTON +++++++++++++++++ */

  cartButton?.addEventListener("click", () => {
    window.location.href = "marketplace.html";
  });

  /* ++++++++++++++++ BULK QUOTE REQUESTS +++++++++++++++++++ */

  document.querySelectorAll('[data-action="quote"]').forEach((button) => {
    button.addEventListener("click", () => {
      const productCard = button.closest(".product-card");

      if (!productCard) return;

      const productName =
        productCard.querySelector(".product-title")?.textContent.trim() ||
        "Agricultural product";

      const productId = productCard.dataset.product || "";

      const params = new URLSearchParams({
        product: productId,
        productName: productName,
      });

      window.location.href = `support.html?${params.toString()}`;
    });
  });

  /* ++++++++++++ DASHBOARD SEARCH ++++++++++++++++++ */

  dashboardSearch?.addEventListener("input", () => {
    const searchTerm = dashboardSearch.value.trim().toLowerCase();

    productCards.forEach((card) => {
      const productText = card.textContent.toLowerCase();

      const matches = productText.includes(searchTerm);

      card.style.display = matches ? "" : "none";
    });
  });

  dashboardSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;

    const searchTerm = dashboardSearch.value.trim();

    if (!searchTerm) return;

    window.location.href = `marketplace.html?search=${encodeURIComponent(
      searchTerm,
    )}`;
  });

  /* +++++++++++++++ ORDER SEARCH ++++++++++++++++++++ */

  orderSearch?.addEventListener("input", () => {
    const searchTerm = orderSearch.value.trim().toLowerCase();

    orderRows.forEach((row) => {
      const rowText = row.textContent.toLowerCase();

      row.style.display = rowText.includes(searchTerm) ? "" : "none";
    });
  });

  /* ++++++++++++++++++ ORDER FILTER ++++++++++++++++++++ */

  orderFilterButton?.addEventListener("click", () => {
    toggleOrderFilterMenu();
  });

  function toggleOrderFilterMenu() {
    let filterMenu = document.querySelector(".dashboard-filter-menu");

    if (filterMenu) {
      filterMenu.remove();
      return;
    }

    filterMenu = document.createElement("div");

    filterMenu.className = "dashboard-filter-menu";

    filterMenu.innerHTML = `
      <button type="button" data-status="all">
        All Orders
      </button>

      <button type="button" data-status="pending">
        Pending
      </button>

      <button type="button" data-status="processing">
        Processing
      </button>

      <button type="button" data-status="dispatched">
        Dispatched
      </button>

      <button type="button" data-status="delivered">
        Delivered
      </button>

      <button type="button" data-status="cancelled">
        Cancelled
      </button>
    `;

    orderFilterButton.parentElement.appendChild(filterMenu);

    filterMenu.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const status = button.dataset.status;

        filterOrders(status);

        filterMenu.remove();
      });
    });

    function closeFilter(event) {
      if (
        !filterMenu.contains(event.target) &&
        !orderFilterButton.contains(event.target)
      ) {
        filterMenu.remove();
        document.removeEventListener("click", closeFilter);
      }
    }

    document.addEventListener("click", closeFilter);
  }

  function filterOrders(status) {
    orderRows.forEach((row) => {
      if (status === "all") {
        row.style.display = "";
        return;
      }

      const statusBadge = row.querySelector(".badge-status");

      const rowStatus = statusBadge?.textContent.trim().toLowerCase() || "";

      row.style.display = rowStatus.includes(status) ? "" : "none";
    });
  }

  /* ++++++++++++ VIEW ORDER DETAILS +++++++++++++++++ */

  document.querySelectorAll('[data-action="view-order"]').forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".table-row");

      if (!row) return;

      const orderId = row.dataset.orderId;

      if (!orderId) return;

      window.location.href = `orders.html?order=${encodeURIComponent(orderId)}`;
    });
  });

  /* +++++++++++++++ DOWNLOAD INVOICE ++++++++++++++++++++++++ */

  document
    .querySelectorAll('[data-action="download-invoice"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        const row = button.closest(".table-row");

        if (!row) return;

        const orderNumber =
          row.querySelector(".order-id")?.textContent.trim() || "this order";

        showToast(
          `Invoice for ${orderNumber} will be available here once invoices are connected.`,
        );
      });
    });

  /* +++++++++++++++ NOTIFICATIONS ++++++++++++++++++++++++ */

  notificationButton?.addEventListener("click", (event) => {
    event.stopPropagation();

    toggleNotificationPanel();
  });

  function toggleNotificationPanel() {
    let panel = document.querySelector(".notification-panel");

    if (panel) {
      panel.remove();
      return;
    }

    panel = document.createElement("div");

    panel.className = "notification-panel";

    panel.innerHTML = `
      <div class="notification-panel-header">
        <strong>Notifications</strong>

        <button
          type="button"
          class="notification-close"
          aria-label="Close notifications"
        >
          &times;
        </button>
      </div>

      <div class="notification-item">
        <strong>Order dispatched</strong>
        <p>
          Your order #AT-84920 has been dispatched.
        </p>
        <span>Today</span>
      </div>

      <div class="notification-item">
        <strong>Payment reminder</strong>
        <p>
          You have an outstanding payment due soon.
        </p>
        <span>Yesterday</span>
      </div>

      <div class="notification-item">
        <strong>Market update</strong>
        <p>
          Maize demand is currently strong.
        </p>
        <span>2 days ago</span>
      </div>
    `;

    document.body.appendChild(panel);

    positionNotificationPanel(panel);

    /* Close button */
    panel
      .querySelector(".notification-close")
      ?.addEventListener("click", () => {
        panel.remove();
      });
  }

  function positionNotificationPanel(panel) {
    if (!notificationButton || !panel) return;

    const buttonRect = notificationButton.getBoundingClientRect();

    const panelWidth = Math.min(360, window.innerWidth - 32);

    let left = buttonRect.right - panelWidth;

    left = Math.max(16, left);

    left = Math.min(left, window.innerWidth - panelWidth - 16);

    panel.style.position = "fixed";
    panel.style.top = `${buttonRect.bottom + 12}px`;
    panel.style.left = `${left}px`;
    panel.style.width = `${panelWidth}px`;
  }

  /* Reposition notification panel */
  window.addEventListener("resize", () => {
    const panel = document.querySelector(".notification-panel");

    if (!panel) return;

    positionNotificationPanel(panel);
  });

  /* +++++++++++++++++++++ ACCOUNT MENU +++++++++++++++++++++++ */

  accountButton?.addEventListener("click", () => {
    toggleAccountMenu();
  });

  function toggleAccountMenu() {
    let menu = document.querySelector(".account-menu");

    if (menu) {
      menu.remove();
      return;
    }

    menu = document.createElement("div");

    menu.className = "account-menu";

    menu.innerHTML = `
      <div class="account-menu-header">
        <strong>Green Ltd</strong>
        <span>Verified Company</span>
      </div>

      <a href="profile.html">
        Profile
      </a>

      <a href="settings.html">
        Account Settings
      </a>

      <button type="button" data-account-action="logout">
        Sign Out
      </button>
    `;

    document.body.appendChild(menu);

    positionAccountMenu(menu);

    menu
      .querySelector('[data-account-action="logout"]')
      ?.addEventListener("click", () => {
        handleLogout();
      });
  }

  function positionAccountMenu(menu) {
    const buttonRect = accountButton.getBoundingClientRect();

    menu.style.position = "absolute";
    menu.style.top = `${buttonRect.bottom + window.scrollY + 8}px`;
    menu.style.right = `${window.innerWidth - buttonRect.right}px`;
  }

  /*  ++++++++++++++++++ LOGOUT ++++++++++++++++++  */

  function handleLogout() {
    localStorage.removeItem("agritrustCartCount");

    showToast("You have been signed out.");

    setTimeout(() => {
      window.location.href = "sign-in.html";
    }, 1200);
  }

  /*  ++++++++++++++++++ PRICE TREND COMMODITY PILLS ++++++++++++++++++  */

  const commodityPills = document.querySelectorAll(".commodity-pills .pill");

  commodityPills.forEach((pill) => {
    pill.setAttribute("role", "button");
    pill.setAttribute("tabindex", "0");

    pill.addEventListener("click", () => {
      selectCommodity(pill);
    });

    pill.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        selectCommodity(pill);
      }
    });
  });

  function selectCommodity(selectedPill) {
    commodityPills.forEach((pill) => {
      pill.classList.remove("active");
    });

    selectedPill.classList.add("active");

    const commodity = selectedPill.textContent.trim();

    showToast(`${commodity} price trend selected.`);
  }

  /* +++++++++++++++ TOAST NOTIFICATION +++++++++++++++ */

  function showToast(message) {
    const existingToast = document.querySelector(".dashboard-toast");

    existingToast?.remove();

    const toast = document.createElement("div");

    toast.className = "dashboard-toast";

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
    }, 3000);
  }

  /* +++++++++++++++ CLOSE FLOATING MENUS WHEN CLICKING ELSEWHERE +++++++++++++++ */

  document.addEventListener("click", (event) => {
    const accountMenu = document.querySelector(".account-menu");
    const notificationPanel = document.querySelector(".notification-panel");

    if (
      accountMenu &&
      !accountMenu.contains(event.target) &&
      !accountButton?.contains(event.target)
    ) {
      accountMenu.remove();
    }

    if (
      notificationPanel &&
      !notificationPanel.contains(event.target) &&
      !notificationButton?.contains(event.target)
    ) {
      notificationPanel.remove();
    }
  });
});
