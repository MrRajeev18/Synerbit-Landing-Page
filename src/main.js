/**
 * Synerbit OPC Private Limited — Modern Editorial Experience
 * Handles navigation, mobile drawer, idea submissions (Firebase Firestore),
 * contact modal, and legal policy overlays.
 */

import { submitIdea } from './firebase.js';
import './contactModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Navigation & Scroll State
  // -------------------------------------------------------------
  const nav = document.getElementById('main-nav');
  const navToggle = document.getElementById('btn-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link-item');

  function updateNavScroll() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }

  window.addEventListener('scroll', updateNavScroll, { passive: true });
  updateNavScroll();

  // Mobile Drawer Toggle
  if (navToggle && mobileDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileDrawer.classList.add('open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        navToggle.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '#content') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navOffset = 76;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // -------------------------------------------------------------
  // 2. Section 05: Idea Submission Form (Firestore + Fallback)
  // -------------------------------------------------------------
  const ideaForm = document.getElementById('idea-submission-form');
  const ideaSubmitBtn = document.getElementById('btn-submit-idea');
  const ideaFeedback = document.getElementById('idea-form-feedback');

  if (ideaForm) {
    ideaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('idea-founder-name');
      const emailInput = document.getElementById('idea-founder-email');
      const descInput = document.getElementById('idea-problem-desc');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const description = descInput ? descInput.value.trim() : '';

      if (!name || !email || !description) {
        showIdeaFeedback('Please complete all fields before submitting.', 'error');
        return;
      }

      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showIdeaFeedback('Please provide a valid email address.', 'error');
        return;
      }

      if (ideaSubmitBtn) {
        ideaSubmitBtn.disabled = true;
        ideaSubmitBtn.innerHTML = '<span>Submitting to Ecosystem...</span>';
      }

      try {
        const payload = {
          founderName: name,
          founderEmail: email,
          conceptName: `Collaboration / Friction: ${name}`,
          problem: description,
          productType: 'Co-Creation / Idea Submission',
          source: 'editorial-landing-section-05'
        };

        const res = await submitIdea(payload);

        if (res && res.success) {
          ideaForm.reset();
          showIdeaFeedback(
            `Thank you, ${name}! Your submission has been saved directly to our system (Ref: ${res.id.slice(0, 8)}). Our engineering team will review it.`,
            'success'
          );
        } else {
          fallbackMailto(name, email, description);
        }
      } catch (err) {
        console.warn('Direct Firestore submission note:', err);
        fallbackMailto(name, email, description);
      } finally {
        if (ideaSubmitBtn) {
          ideaSubmitBtn.disabled = false;
          ideaSubmitBtn.innerHTML = '<span>Submit Problem or Concept</span><span aria-hidden="true">→</span>';
        }
      }
    });
  }

  function showIdeaFeedback(msg, type) {
    if (!ideaFeedback) return;
    ideaFeedback.textContent = msg;
    ideaFeedback.className = `ed-form-feedback ${type}`;
    ideaFeedback.style.display = 'block';
  }

  function fallbackMailto(name, email, description) {
    const mailtoUrl = `mailto:contact@synerbit.in?subject=${encodeURIComponent(
      `Collaboration Proposal from ${name}`
    )}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nProblem / Idea:\n${description}`
    )}`;
    showIdeaFeedback(
      `Direct cloud submission reached fallback mode. Opening your email client to send to contact@synerbit.in...`,
      'error'
    );
    window.location.href = mailtoUrl;
  }

  // -------------------------------------------------------------
  // 3. Legal Policies Content & Interactive Modal Logic
  // -------------------------------------------------------------
  const legalPolicies = {
    privacy: {
      title: 'Privacy Policy — Synerbit OPC Private Limited',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> Synerbit OPC Private Limited &bull; <strong>Updated:</strong> 2026<br>
            <a href="/privacy" style="color: #FF6038; text-decoration: underline; font-weight: 500;">Open Standalone Privacy Policy Page ↗</a>
          </p>
          <h4>1. Introduction</h4>
          <p>Synerbit OPC Private Limited ("Synerbit", "we", "us", or "our") respects your privacy and is committed to handling personal information responsibly. This Privacy Policy explains how we collect, use, and protect information when you visit or interact with our corporate website.</p>
        </div>
        <div class="legal-section-block">
          <h4>2. Information We Collect</h4>
          <p>When you contact us or submit an idea, we receive your name, email address, and message contents. We do not sell your personal data to any third party.</p>
        </div>
        <div class="legal-section-block">
          <h4>3. Contact & Grievances</h4>
          <p><strong>Synerbit OPC Private Limited</strong><br>
          Email: <a href="mailto:contact@synerbit.in">contact@synerbit.in</a><br>
          Registered Office: A606 PNTC, Times Of India Press Road, Manekbag, Ahmedabad – 380015, Gujarat, India.</p>
        </div>
      `
    },
    terms: {
      title: 'Terms & Conditions — Synerbit OPC Private Limited',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> Synerbit OPC Private Limited &bull; <strong>Updated:</strong> 2026<br>
            <a href="/terms" style="color: #FF6038; text-decoration: underline; font-weight: 500;">Open Standalone Terms &amp; Conditions Page ↗</a>
          </p>
          <h4>1. Permitted Use</h4>
          <p>These Terms govern your use of the Synerbit website and digital services. All proprietary code, brand assets, and product architectures remain the intellectual property of Synerbit OPC Private Limited.</p>
        </div>
        <div class="legal-section-block">
          <h4>2. Governing Law</h4>
          <p>These Terms are governed by and construed in accordance with the laws of India, with jurisdiction in Ahmedabad, Gujarat.</p>
        </div>
      `
    },
    cookies: {
      title: 'Cookie Policy — Synerbit OPC Private Limited',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> Synerbit OPC Private Limited &bull; <strong>Updated:</strong> 2026<br>
            <a href="/cookies" style="color: #FF6038; text-decoration: underline; font-weight: 500;">Open Standalone Cookie Policy Page ↗</a>
          </p>
          <h4>1. Cookies & Analytics</h4>
          <p>We use essential cookies and Google Analytics 4 (_ga) to understand website performance and improve user experience. You can adjust cookie preferences in your browser at any time.</p>
        </div>
      `
    }
  };

  const legalModal = document.getElementById('legal-modal');
  const legalModalTitle = document.getElementById('legal-modal-title');
  const legalModalBody = document.getElementById('legal-modal-body');
  const btnCloseLegal = document.getElementById('btn-close-legal');
  const btnDismissLegal = document.getElementById('btn-dismiss-legal');
  const legalTabs = document.querySelectorAll('.legal-tab');

  function openLegalModal(policyKey) {
    const key = policyKey in legalPolicies ? policyKey : 'privacy';
    const policy = legalPolicies[key];

    if (legalModalTitle) legalModalTitle.textContent = policy.title;
    if (legalModalBody) legalModalBody.innerHTML = policy.content;

    legalTabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-target') === key);
    });

    if (legalModal) {
      legalModal.classList.add('active');
      legalModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLegalModal() {
    if (legalModal) {
      legalModal.classList.remove('active');
      legalModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.open-legal-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const policyKey = btn.getAttribute('data-policy') || 'privacy';
      openLegalModal(policyKey);
    });
  });

  legalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetKey = tab.getAttribute('data-target');
      openLegalModal(targetKey);
    });
  });

  if (btnCloseLegal) btnCloseLegal.addEventListener('click', closeLegalModal);
  if (btnDismissLegal) btnDismissLegal.addEventListener('click', closeLegalModal);

  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) closeLegalModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal && legalModal.classList.contains('active')) {
      closeLegalModal();
    }
  });
});
