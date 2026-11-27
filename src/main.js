/**
 * Synerbit OPC Private Limited — Modern Editorial Experience
 * Handles navigation, mobile drawer, idea submissions (Firebase Firestore),
 * contact modal, legal policy overlays, and recent articles.
 */

import { submitIdea, getArticles } from "./firebase.js";
import "./contactModal.js";

document.addEventListener("DOMContentLoaded", () => {
  // -------------------------------------------------------------
  // 1. Navigation & Scroll State
  // -------------------------------------------------------------
  const nav = document.getElementById("main-nav");
  const navMobileBtn = document.getElementById("btn-nav-mobile");
  const navMenu = document.getElementById("nav-menu");

  function updateNavScroll() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add("nav-scrolled");
    } else {
      nav.classList.remove("nav-scrolled");
    }
  }

  window.addEventListener("scroll", updateNavScroll, { passive: true });
  updateNavScroll();

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#" || targetId === "#content") return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navOffset = 76;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Section 05: Idea Submission Form (Firestore + Fallback)
  // -------------------------------------------------------------
  const ideaForm = document.getElementById("idea-submission-form");
  const ideaSubmitBtn = document.getElementById("btn-submit-idea");
  const ideaFeedback = document.getElementById("idea-form-feedback");

  if (ideaForm) {
    ideaForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("idea-founder-name");
      const emailInput = document.getElementById("idea-founder-email");
      const descInput = document.getElementById("idea-problem-desc");

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const description = descInput ? descInput.value.trim() : "";

      if (!name || !email || !description) {
        showIdeaFeedback("Please complete all fields before submitting.", "error");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showIdeaFeedback("Please provide a valid email address.", "error");
        return;
      }

      if (ideaSubmitBtn) {
        ideaSubmitBtn.disabled = true;
        ideaSubmitBtn.innerHTML = "<span>Submitting to Ecosystem...</span>";
      }

      try {
        const result = await submitIdea({
          founderName: name,
          founderEmail: email,
          description: description,
          source: "homepage-editorial-section"
        });

        if (result && result.success) {
          showIdeaFeedback("Your proposal was received. Our architecture and incubation team will review it within 48 hours.", "success");
          ideaForm.reset();
        } else {
          showIdeaFeedback("Received submission via backup channel. You can also write to us at contact@synerbit.in.", "success");
          ideaForm.reset();
        }
      } catch (err) {
        console.warn("Direct submission notice:", err);
        showIdeaFeedback("Connecting to backup channel. You can also reach us directly at contact@synerbit.in.", "info");
      } finally {
        if (ideaSubmitBtn) {
          ideaSubmitBtn.disabled = false;
          ideaSubmitBtn.innerHTML = "<span>Submit idea for review</span> <span>→</span>";
        }
      }
    });
  }

  function showIdeaFeedback(msg, type) {
    if (!ideaFeedback) return;
    ideaFeedback.textContent = msg;
    ideaFeedback.className = "ed-form-feedback " + type;
    ideaFeedback.style.display = "block";
  }

  // -------------------------------------------------------------
  // 3. Section 07: Homepage Recent Articles & Dispatches
  // -------------------------------------------------------------
  const homeArticlesGrid = document.getElementById("homepage-articles-grid");
  if (homeArticlesGrid) {
    async function loadHomepageArticles() {
      try {
        const articles = await getArticles();
        if (!articles || articles.length === 0) {
          homeArticlesGrid.innerHTML = `
            <a href="/articles" class="ed-article-card" style="grid-column: 1 / -1; max-width: 600px; margin: 0 auto; text-align: center;">
              <div class="ed-article-card-top" style="justify-content: center;">
                <span class="ed-article-category">Product Thinking</span>
              </div>
              <h3 class="ed-article-title" style="font-size: 1.6rem;">Good software starts with a better question.</h3>
              <p class="ed-article-excerpt">
                We are not interested in adding more noise to the digital world. Read our foundational perspective on solving practical friction.
              </p>
              <div class="ed-article-card-footer" style="justify-content: center; gap: 8px;">
                <span style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--c-orange); text-transform: uppercase;">
                  Explore All Dispatches
                </span>
                <span class="ed-article-arrow">→</span>
              </div>
            </a>
          `;
          return;
        }

        const latestThree = articles.slice(0, 3);
        homeArticlesGrid.innerHTML = latestThree.map(art => {
          const dateStr = art.publishedAt || art.createdAt
            ? new Date(art.publishedAt || art.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "";
          const readUrl = `/article?slug=${encodeURIComponent(art.slug || art.id)}`;
          const initials = (art.author || "Synerbit").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

          return `
            <a href="${readUrl}" class="ed-article-card">
              <div>
                <div class="ed-article-card-top">
                  <span class="ed-article-category">${art.category || "General"}</span>
                  <span class="ed-article-readtime">${art.readTime || "4 min read"}</span>
                </div>
                <h3 class="ed-article-title">${art.title}</h3>
                <p class="ed-article-excerpt">${art.excerpt || ""}</p>
              </div>
              <div class="ed-article-card-footer">
                <div class="ed-article-author-info">
                  <div class="ed-article-avatar">${initials}</div>
                  <div>
                    <div class="ed-article-author-name">${art.author || "Synerbit Team"}</div>
                    <div class="ed-article-date">${dateStr}</div>
                  </div>
                </div>
                <span class="ed-article-arrow">→</span>
              </div>
            </a>
          `;
        }).join("");
      } catch (err) {
        console.warn("Failed to load homepage articles:", err);
      }
    }

    loadHomepageArticles();
  }

  // -------------------------------------------------------------
  // 4. Legal Policies Modal Dialog
  // -------------------------------------------------------------
  const legalModal = document.getElementById("legal-modal");
  const legalTitle = document.getElementById("legal-modal-title");
  const legalBody = document.getElementById("legal-modal-body");
  const legalTabs = document.querySelectorAll(".legal-tab");
  const btnCloseLegal = document.getElementById("btn-close-legal");
  const btnDismissLegal = document.getElementById("btn-dismiss-legal");

  const legalContentMap = {
    privacy: `
      <h4>1. Information We Collect</h4>
      <p>Synerbit OPC Private Limited collects only necessary operational telemetry, contact inquiries, application records, and ideas explicitly submitted by users.</p>
      <h4>2. Zero Third-Party Advertising</h4>
      <p>We do not sell personal information or share candidate resumes with third-party advertising brokers.</p>
      <h4>3. Security & Compliance</h4>
      <p>All data submitted to Synerbit platforms is encrypted in transit and handled under modern access control standards.</p>
    `,
    terms: `
      <h4>1. Agreement to Terms</h4>
      <p>By accessing synerbit.in and ecosystem products, you agree to comply with applicable intellectual property and service terms.</p>
      <h4>2. Intellectual Property</h4>
      <p>PulsePM, Habitpot, Busview, and associated designs and trademarks are proprietary assets of Synerbit OPC Private Limited.</p>
      <h4>3. Limitation of Liability</h4>
      <p>Platforms are provided on an as-is, as-available basis with enterprise-grade availability targets.</p>
    `,
    cookies: `
      <h4>1. Cookie Usage</h4>
      <p>We use essential session tokens and anonymous traffic measurement cookies to ensure reliability, security, and responsive performance.</p>
      <h4>2. User Control</h4>
      <p>You may restrict or disable non-essential cookies at any time via your browser settings.</p>
    `
  };

  function openLegalModal(policyKey) {
    if (!legalModal) return;
    const key = policyKey || "privacy";
    if (legalTitle) {
      legalTitle.textContent = key === "terms" ? "Terms & Conditions" : key === "cookies" ? "Cookie Policy" : "Privacy Policy";
    }
    if (legalBody) {
      legalBody.innerHTML = legalContentMap[key] || legalContentMap.privacy;
    }
    legalTabs.forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-target") === key);
    });
    legalModal.classList.add("active");
    legalModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLegalModal() {
    if (legalModal) {
      legalModal.classList.remove("active");
      legalModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll(".open-legal-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const policyKey = btn.getAttribute("data-policy") || "privacy";
      openLegalModal(policyKey);
    });
  });

  legalTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetKey = tab.getAttribute("data-target");
      openLegalModal(targetKey);
    });
  });

  if (btnCloseLegal) btnCloseLegal.addEventListener("click", closeLegalModal);
  if (btnDismissLegal) btnDismissLegal.addEventListener("click", closeLegalModal);

  if (legalModal) {
    legalModal.addEventListener("click", (e) => {
      if (e.target === legalModal) closeLegalModal();
    });
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && legalModal && legalModal.classList.contains("active")) {
      closeLegalModal();
    }
  });
});
