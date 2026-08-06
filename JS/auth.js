"use strict";

// =============================== Account Type Page ===============================

const individualCard = document.querySelector("#individual-card");
const companyCard = document.querySelector("#company-card");
const cooperativeCard = document.querySelector("#cooperative-card");

const continueBtn = document.querySelector("#account-continue-btn");
const errorMessage = document.querySelector("#account-error");

if (individualCard && companyCard && cooperativeCard && continueBtn) {
  const cards = [individualCard, companyCard, cooperativeCard];

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      // Remove active class from all cards
      cards.forEach(function (c) {
        c.classList.remove("selected");
      });

      // Add active class to clicked card
      card.classList.add("selected");

      // Check the radio button inside the card
      card.querySelector('input[type="radio"]').checked = true;
    });
  });

  continueBtn.addEventListener("click", function () {
    const selectedRole = document.querySelector('input[name="role"]:checked');

    if (!selectedRole) {
      errorMessage.textContent = "⚠️ Please select an account type.";
      return;
    }

    // Remove error if user selected something
    errorMessage.textContent = "";

    if (selectedRole.value === "individual") {
      window.location.href = "register-individual.html";
    } else {
      window.location.href = "register-company.html";
    }
  });
}

// =============================== Register Individual ===============================

const individualForm = document.querySelector("#register-individual-form");

if (individualForm) {
  individualForm.addEventListener("submit", function (e) {
    e.preventDefault();

    window.location.href = "verification.html";
  });
}

// =============================== Register Company ===============================

const companyForm = document.querySelector("#register-company-form");

if (companyForm) {
  companyForm.addEventListener("submit", function (e) {
    e.preventDefault();

    window.location.href = "verification.html";
  });
}

// =============================== Verification Page ===============================

const verificationForm = document.querySelector("#verification-form");
const otpInputs = document.querySelectorAll(".otp-container input");
const verifyBtn = document.querySelector("#verify-btn");

if (verificationForm && otpInputs.length && verifyBtn) {
  // Button starts disabled
  verifyBtn.disabled = true;

  otpInputs.forEach((input, index) => {
    // Allow only numbers
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");

      // Move to next input automatically
      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      // Check if all boxes are filled
      const complete = [...otpInputs].every((box) => box.value.length === 1);
      verifyBtn.disabled = !complete;
    });

    // Backspace moves to previous box
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && input.value === "" && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  // click button to go to dashboard
  verificationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    window.location.href = "sign-in.html";
  });
}

// =============================== Forgot Password ===============================

const forgotPasswordForm = document.querySelector("#forgot-password-form");
const resetMessage = document.querySelector("#reset-message");

if (forgotPasswordForm && resetMessage) {
  forgotPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();

    resetMessage.textContent =
      "Password reset link sent successfully. Redirecting to Sign In...";

    setTimeout(function () {
      window.location.href = "sign-in.html";
    }, 2000);
  });
}

// =============================== Sign In ===============================

const signinForm = document.getElementById("signin-form");

if (signinForm) {
  const signinMessage = document.getElementById("signin-message");

  signinForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      signinMessage.textContent = "Please fill in all fields.";
      signinMessage.style.color = "red";
      return;
    }

    signinMessage.textContent = "Signing you in...";
    signinMessage.style.color = "green";

    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 1200);
  });
}
