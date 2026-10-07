import { createBulbScene } from './bulbScene.js';
import { createProductMobileScene } from './productMobileScene.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Glowing Bulb Scene
  const bulbScene = createBulbScene('bulb-canvas-container');

  // 2. Initialize 3D Mobile Phone Scene
  const productMobileScene = createProductMobileScene('product-mobile-canvas-container');

  // DOM Elements for About Stages
  const heroContent = document.querySelector('.hero-center-content');
  const arenaSection = document.querySelector('.about-overlap-arena');
  const storyCards = document.querySelectorAll('.story-card');
  const stageIndicators = document.querySelectorAll('.stage-indicator');

  let currentStage = -1;

  function setStage(stageIndex) {
    if (stageIndex === currentStage) return;
    currentStage = stageIndex;

    // Update Story Cards (left side content)
    storyCards.forEach((card, idx) => {
      card.classList.toggle('active', idx === stageIndex);
    });

    // Update Top Pill Buttons
    stageIndicators.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === stageIndex);
    });

    // Update 3D revolving text badges inside Three.js
    if (bulbScene) {
      bulbScene.setActiveStage(stageIndex);
    }
  }

  // Click on About pill buttons to manually jump
  stageIndicators.forEach((btn) => {
    btn.addEventListener('click', () => {
      const stage = parseInt(btn.getAttribute('data-stage'), 10);
      setStage(stage);
      if (arenaSection) {
        const arenaRect = arenaSection.getBoundingClientRect();
        const scrollableDist = arenaRect.height - window.innerHeight;
        const stageDist = Math.max(scrollableDist - window.innerHeight, 1);
        const targetScroll = window.scrollY + arenaRect.top + (stageDist * (stage * 0.22 + 0.05));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  // DOM Elements for Products Stage
  const productsArenaSection = document.querySelector('.products-overlap-arena');
  const productIndicators = document.querySelectorAll('.product-indicator');
  const card0 = document.getElementById('product-card-0'); // PulsePM (Left)
  const card1 = document.getElementById('product-card-1'); // GoalSync (Right)
  const card2 = document.getElementById('product-card-2'); // Busly (Left)

  function applyCardStyle(card, opacity, transX) {
    if (!card) return;
    card.style.opacity = opacity.toFixed(3);
    card.style.transform = `translate3d(${transX.toFixed(1)}px, -50%, 0)`;
    card.style.visibility = opacity > 0.005 ? 'visible' : 'hidden';
    card.style.pointerEvents = opacity > 0.6 ? 'auto' : 'none';
    if (opacity < 0.9) {
      const b = ((1 - opacity) * 8).toFixed(1);
      card.style.filter = `blur(${b}px)`;
    } else {
      card.style.filter = 'none';
    }
  }

  function updateProductCards(p) {
    let op0 = 0, tx0 = 0;
    let op1 = 0, tx1 = 0;
    let op2 = 0, tx2 = 0;

    if (p < 0.28) {
      // Stage 1: PulsePM (Phone on Right, Text on Left)
      op0 = 1;
      tx0 = 0;
    } else if (p < 0.52) {
      // Transition 1 -> 2: Phone glides Right to Left
      const t = (p - 0.28) / 0.24;
      // PulsePM (Left) disappears immediately as phone leaves Right
      if (t < 0.40) {
        const fadeT = t / 0.40;
        op0 = 1 - fadeT;
        tx0 = -60 * fadeT;
      } else {
        op0 = 0;
        tx0 = -60;
      }

      // GoalSync (Right) reveals smoothly as phone clears Center and reaches Left
      if (t > 0.60) {
        const inT = (t - 0.60) / 0.40;
        op1 = inT;
        tx1 = 60 * (1 - inT);
      } else {
        op1 = 0;
        tx1 = 60;
      }
    } else if (p < 0.72) {
      // Stage 2: GoalSync (Phone on Left, Text on Right)
      op1 = 1;
      tx1 = 0;
    } else if (p < 0.96) {
      // Transition 2 -> 3: Phone glides Left to Right
      const t = (p - 0.72) / 0.24;
      // GoalSync (Right) disappears immediately as phone leaves Left
      if (t < 0.40) {
        const fadeT = t / 0.40;
        op1 = 1 - fadeT;
        tx1 = 60 * fadeT;
      } else {
        op1 = 0;
        tx1 = 60;
      }

      // Busly (Left) reveals smoothly as phone clears Center and reaches Right
      if (t > 0.60) {
        const inT = (t - 0.60) / 0.40;
        op2 = inT;
        tx2 = -60 * (1 - inT);
      } else {
        op2 = 0;
        tx2 = -60;
      }
    } else {
      // Stage 3: Busly (Phone on Right, Text on Left)
      op2 = 1;
      tx2 = 0;
    }

    applyCardStyle(card0, op0, tx0);
    applyCardStyle(card1, op1, tx1);
    applyCardStyle(card2, op2, tx2);

    // Update Pill Indicators
    let activeProductIndex = 0;
    if (p >= 0.74) {
      activeProductIndex = 2; // Busly
    } else if (p >= 0.40) {
      activeProductIndex = 1; // GoalSync
    } else {
      activeProductIndex = 0; // PulsePM
    }

    productIndicators.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === activeProductIndex);
    });

    const pSheet = document.querySelector('.products-sheet');
    if (pSheet) {
      const themes = ['theme-pulsepm', 'theme-goalsync', 'theme-busly'];
      pSheet.classList.remove('theme-pulsepm', 'theme-goalsync', 'theme-busly');
      pSheet.classList.add(themes[activeProductIndex]);
    }

    return activeProductIndex;
  }

  // Adaptive Navbar Theme Controller
  const navbar = document.querySelector('.navbar');
  const productsSheet = document.querySelector('.products-sheet');
  const navLinks = document.querySelectorAll('.nav-link-smooth');
  const productsNavLink = document.querySelector('.nav-link-smooth-product');
  const ideaNavLink = document.querySelector('.nav-link-smooth-idea');
  const ideaArenaSection = document.querySelector('.idea-overlap-arena');
  const navBrand = document.querySelector('.nav-brand');

  const allNavThemes = [
    'theme-hero',
    'theme-about',
    'theme-pulsepm',
    'theme-goalsync',
    'theme-busly',
    'theme-idea',
    'theme-footer'
  ];
  let activeNavTheme = '';
  function setNavbarTheme(themeName) {
    if (activeNavTheme === themeName) return;
    if (navbar) {
      allNavThemes.forEach((t) => navbar.classList.remove(t));
      if (themeName) {
        navbar.classList.add(themeName);
      }
    }
    activeNavTheme = themeName;
  }

  // Click on Product pill buttons
  productIndicators.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pIdx = parseInt(btn.getAttribute('data-product'), 10);
      if (productsArenaSection) {
        const pRect = productsArenaSection.getBoundingClientRect();
        const pScrollableDist = pRect.height - window.innerHeight;
        const pStageDist = Math.max(pScrollableDist - window.innerHeight, 1);
        const targetProgress = pIdx === 0 ? 0.15 : pIdx === 1 ? 0.55 : 0.88;
        const targetScroll = window.scrollY + pRect.top + (pStageDist * targetProgress);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  // Smooth navigation clicks without URL hash jumping
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const stageIdx = parseInt(link.getAttribute('data-stage') || '0', 10);
      setStage(stageIdx);
      if (arenaSection) {
        const arenaRect = arenaSection.getBoundingClientRect();
        const scrollableDist = arenaRect.height - window.innerHeight;
        const stageDist = Math.max(scrollableDist - window.innerHeight, 1);
        const targetScroll = window.scrollY + arenaRect.top + (stageDist * (stageIdx * 0.22 + 0.05));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });


  if (ideaNavLink && ideaArenaSection) {
    ideaNavLink.addEventListener('click', (e) => {
      e.preventDefault();
      const ideaRect = ideaArenaSection.getBoundingClientRect();
      window.scrollTo({ top: window.scrollY + ideaRect.top + 5, behavior: 'smooth' });
    });
  }

  if (navBrand) {
    navBrand.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Continuous Scroll Controller across hero, About stages, and Products arena
  function handleScroll() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // Sticky hero text fade: stays 100% visible on load, then fades gracefully as overlap sheet approaches
    if (heroContent) {
      const heroFadeProgress = Math.min(Math.max((scrollY - windowH * 0.12) / (windowH * 0.7), 0), 1);
      heroContent.style.opacity = (1 - heroFadeProgress * 0.95).toString();
      heroContent.style.transform = `translateY(${scrollY * 0.15 - 10}px) scale(${1 - heroFadeProgress * 0.06})`;
    }

    // 1. About Arena Scroll Calculation
    let activeStage = 0;
    if (arenaSection) {
      const arenaRect = arenaSection.getBoundingClientRect();
      const arenaTop = arenaRect.top;
      const arenaHeight = arenaRect.height;
      const scrollableDist = arenaHeight - windowH;

      if (scrollableDist > 0) {
        // Active 5 stages animate over the first section of scroll; the remaining 100vh holds the pinned sheet as Products sheet slides over
        const stageDist = Math.max(scrollableDist - windowH, 1);
        const stageProgress = Math.min(Math.max(-arenaTop / stageDist, 0), 1);

        if (bulbScene) {
          bulbScene.updateScrollProgress(stageProgress);
        }

        if (stageProgress > 0.80) {
          activeStage = 4;
        } else if (stageProgress > 0.60) {
          activeStage = 3;
        } else if (stageProgress > 0.40) {
          activeStage = 2;
        } else if (stageProgress > 0.20) {
          activeStage = 1;
        } else {
          activeStage = 0;
        }

        setStage(activeStage);
      }
    }

    // 2. Products Arena Scroll Calculation
    let activeProduct = 0;
    if (productsArenaSection) {
      const pRect = productsArenaSection.getBoundingClientRect();
      const pTop = pRect.top;
      const pHeight = pRect.height;
      const pScrollableDist = pHeight - windowH;

      if (pScrollableDist > 0) {
        // Products animate over the first section of scroll; the remaining 100vh holds pinned Busly as Footer slides over
        const pStageDist = Math.max(pScrollableDist - windowH, 1);
        const pProgress = Math.min(Math.max(-pTop / pStageDist, 0), 1);

        if (productMobileScene) {
          productMobileScene.updateScrollProgress(pProgress);
        }

        activeProduct = updateProductCards(pProgress);
      }
    }


    // 4. Dynamically adapt Header color based on the section currently beneath it
    const navThreshold = 75; // Height offset of fixed navbar
    const siteFooter = document.querySelector('.site-footer-arena');
    const inFooter = siteFooter && siteFooter.getBoundingClientRect().top <= navThreshold;
    const inIdea = ideaArenaSection && ideaArenaSection.getBoundingClientRect().top <= navThreshold;
    const inProducts = productsArenaSection && productsArenaSection.getBoundingClientRect().top <= navThreshold;
    const inAbout = arenaSection && arenaSection.getBoundingClientRect().top <= navThreshold;

    if (inFooter) {
      setNavbarTheme('theme-footer');
      navLinks.forEach(link => link.classList.remove('active'));
      if (productsNavLink) productsNavLink.classList.remove('active');
      if (ideaNavLink) ideaNavLink.classList.remove('active');
    } else if (inIdea) {
      setNavbarTheme('theme-idea');
      navLinks.forEach(link => link.classList.remove('active'));
      if (productsNavLink) productsNavLink.classList.remove('active');
      if (ideaNavLink) ideaNavLink.classList.add('active');
    } else if (inProducts) {
      if (activeProduct === 2) {
        setNavbarTheme('theme-busly');
        if (productsSheet) {
          productsSheet.className = 'overlap-sheet products-sheet theme-busly';
        }
      } else if (activeProduct === 1) {
        setNavbarTheme('theme-goalsync');
        if (productsSheet) {
          productsSheet.className = 'overlap-sheet products-sheet theme-goalsync';
        }
      } else {
        setNavbarTheme('theme-pulsepm');
        if (productsSheet) {
          productsSheet.className = 'overlap-sheet products-sheet theme-pulsepm';
        }
      }
      navLinks.forEach(link => link.classList.remove('active'));
      if (productsNavLink) productsNavLink.classList.add('active');
      if (ideaNavLink) ideaNavLink.classList.remove('active');
    } else if (inAbout) {
      setNavbarTheme('theme-about');
      if (productsNavLink) productsNavLink.classList.remove('active');
      if (ideaNavLink) ideaNavLink.classList.remove('active');
      navLinks.forEach((link, idx) => {
        link.classList.toggle('active', idx === activeStage);
      });
    } else {
      setNavbarTheme('theme-hero');
      if (productsNavLink) productsNavLink.classList.remove('active');
      if (ideaNavLink) ideaNavLink.classList.remove('active');
      navLinks.forEach(link => link.classList.remove('active'));
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // -------------------------------------------------------------
  // Legal Policies Content & Interactive Modal Logic
  // -------------------------------------------------------------
  const legalPolicies = {
    privacy: {
      title: 'Privacy Policy — Synerbit OPC Private Limited',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> Synerbit OPC Private Limited &bull; <strong>Last Updated:</strong> 6 October 2026<br>
            <a href="/privacy.html" style="color: #38bdf8; text-decoration: underline; font-weight: 500;">Open Standalone Privacy Policy Page ↗</a>
          </p>
          <h4>1. Introduction</h4>
          <p>Synerbit OPC Private Limited ("Synerbit", "we", "us", or "our") respects your privacy and is committed to handling personal information responsibly. This Privacy Policy explains how we collect, use, disclose, retain, and protect information when you visit or interact with the Synerbit corporate website (the "Website").</p>
          <p>This policy applies specifically to the Synerbit corporate Website. Individual products and services operated by Synerbit may have separate privacy policies and terms applicable to those products.</p>
        </div>

        <div class="legal-section-block">
          <h4>2. Information We Collect</h4>
          <p><strong>2.1 Information You Voluntarily Provide:</strong> If you contact us by email or otherwise voluntarily provide information, we may receive:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Company or organization name</li>
            <li>Information contained in your message</li>
            <li>Product or business ideas you choose to share</li>
            <li>Other information you voluntarily provide</li>
          </ul>
          <p style="color: #fbbf24; font-size: 0.88rem; background: rgba(245, 158, 11, 0.08); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2);">
            Please do not send passwords, payment-card information, government identification numbers, confidential credentials, or other highly sensitive information through the Website or ordinary email unless specifically requested through an appropriate secure channel.
          </p>
          <p><strong>2.2 Automatically Collected Technical Information:</strong> Depending on technical services enabled (hosting, CDN, analytics, security), we may collect: IP address, browser type/version, device type, operating system, approximate location, pages visited, access times, referring website, and diagnostic logs.</p>
        </div>

        <div class="legal-section-block">
          <h4>3. How We Use Information</h4>
          <ul>
            <li>Responding to inquiries and communications</li>
            <li>Reviewing product or business ideas voluntarily submitted to us</li>
            <li>Communicating with people who contact us</li>
            <li>Understanding and improving the Website</li>
            <li>Maintaining Website security, detecting/preventing fraud or abuse</li>
            <li>Troubleshooting technical problems and complying with legal obligations</li>
          </ul>
        </div>

        <div class="legal-section-block">
          <h4>4. Product Ideas and Other Submissions</h4>
          <p>If you voluntarily submit an idea, feedback, or suggestion, we may review it for business, product, or development purposes. Submission does not create a confidentiality agreement, partnership, employment, or investment relationship.</p>
          <p><strong>This Privacy Policy does not constitute a Non-Disclosure Agreement (NDA).</strong> If you require confidential treatment, contact Synerbit regarding a separate confidentiality arrangement prior to disclosure.</p>
        </div>

        <div class="legal-section-block">
          <h4>5. Cookies and Similar Technologies</h4>
          <p>Used to enable essential functionality, maintain security, understand usage, improve performance, and remember preferences. Manage cookies via your browser settings.</p>
        </div>

        <div class="legal-section-block">
          <h4>6. Third-Party Services & 7. Information Sharing</h4>
          <p>We may use third-party providers for hosting, CDN, analytics, and security. <strong>We do not sell your personal information.</strong> Disclosures are limited to service providers, legal compliance, fraud/security prevention, or corporate transactions.</p>
        </div>

        <div class="legal-section-block">
          <h4>8. Data Security & 9. Data Retention</h4>
          <p>We implement reasonable technical and organizational measures. However, no internet transmission is 100% secure. Information is retained only as long as reasonably necessary for business, legal, and operational purposes.</p>
        </div>

        <div class="legal-section-block">
          <h4>10. Your Rights & 11. Consent Withdrawal</h4>
          <p>Under applicable law, you may request access, correction, deletion, or withdrawal of consent regarding personal data by contacting us at <a href="mailto:legal@synerbit.in">legal@synerbit.in</a>.</p>
        </div>

        <div class="legal-section-block">
          <h4>15. Contact Us & 16. Grievance Redressal</h4>
          <p><strong>Synerbit OPC Private Limited</strong><br>
          Email: <a href="mailto:legal@synerbit.in">legal@synerbit.in</a><br>
          Website: <a href="https://synerbit.in" target="_blank">synerbit.in</a><br>
          Registered Office: A606 PNTC, PNTC, Times Of India Press Road, Manekbag, Ahmedabad – 380015, Gujarat, India.<br>
          Privacy / Data Protection Contact: <a href="mailto:legal@synerbit.in">legal@synerbit.in</a></p>
        </div>
      `
    },
    terms: {
      title: 'Terms & Conditions — Synerbit OPC Private Limited',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> Synerbit OPC Private Limited &bull; <strong>Last Updated:</strong> 6 October 2026<br>
            <a href="/terms.html" style="color: #38bdf8; text-decoration: underline; font-weight: 500;">Open Standalone Terms &amp; Conditions Page ↗</a>
          </p>
          <h4>1. Introduction</h4>
          <p>Welcome to the website of Synerbit OPC Private Limited ("Synerbit", "we", "us", or "our"). These Terms &amp; Conditions ("Terms") govern your access to and use of the Synerbit corporate website (the "Website").</p>
          <p>By accessing or using the Website, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
        </div>
        <div class="legal-section-block">
          <h4>2. Permitted Use &amp; Account Integrity</h4>
          <p>You agree to use our services solely for lawful, authorized purposes. You are responsible for safeguarding your credentials and for all actions taken under your authenticated accounts.</p>
          <ul>
            <li>You may not reverse-engineer, decompile, or tamper with our codebase or proprietary 3D rendering engines.</li>
            <li>You may not use our infrastructure to transmit malware, conduct denial-of-service attempts, or harvest unauthorized user data.</li>
          </ul>
        </div>
        <div class="legal-section-block">
          <h4>3. Intellectual Property Rights</h4>
          <p>All trademarks, graphics, logos, 3D models, user interfaces, documentation, and proprietary software algorithms are the exclusive intellectual property of Synerbit OPC Private Limited and its licensors.</p>
        </div>
        <div class="legal-section-block">
          <h4>4. Service Availability &amp; SLA</h4>
          <p>Synerbit strives to ensure 99.9% service availability for commercial SaaS tiers. Periodic scheduled maintenance windows will be communicated in advance via workspace notifications.</p>
        </div>
        <div class="legal-section-block">
          <h4>5. Limitation of Liability</h4>
          <p>To the maximum extent permitted by applicable law, Synerbit shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your access or inability to access our services.</p>
        </div>
        <div class="legal-section-block">
          <h4>23. Contact Us</h4>
          <p><strong>Synerbit OPC Private Limited</strong><br>
          Email: <a href="mailto:legal@synerbit.in">legal@synerbit.in</a><br>
          Website: <a href="https://synerbit.in" target="_blank">synerbit.in</a><br>
          Registered Office: A606 PNTC, PNTC, Times Of India Press Road, Manekbag, Ahmedabad – 380015, Gujarat, India.</p>
        </div>
      `
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      content: `
        <div class="legal-section-block">
          <h4>1. Subscription Cycles & Billing</h4>
          <p>Synerbit SaaS products are offered on monthly and annual recurring subscription schedules. Subscriptions renew automatically unless cancelled prior to the subsequent billing cycle.</p>
        </div>
        <div class="legal-section-block">
          <h4>2. 14-Day Money-Back Guarantee</h4>
          <p>We want you to be fully confident in our products. For all first-time annual subscriptions and new paid workspace deployments, Synerbit offers an unconditional 14-day money-back guarantee from the initial timestamp of payment.</p>
        </div>
        <div class="legal-section-block">
          <h4>3. Cancellation Policy</h4>
          <p>You can cancel your subscription at any time directly through your billing portal settings or by reaching out to our support desk. Upon cancellation, you retain full access to your workspace until the end of your current active billing period.</p>
        </div>
        <div class="legal-section-block">
          <h4>4. Refund Processing & Timelines</h4>
          <p>Eligible refund requests are processed within 5 to 7 business days back to the original method of payment (credit/debit card, bank transfer, or payment gateway). Processing times may vary depending on your financial institution.</p>
        </div>
        <div class="legal-section-block">
          <h4>5. Dispute & Support Inquiries</h4>
          <p>If you believe there was an error in billing or duplicate charges, please contact our billing support team immediately at <a href="mailto:billing@synerbit.com">billing@synerbit.com</a>.</p>
        </div>
      `
    },
    cookies: {
      title: 'Cookie Policy — SYNERBIT (OPC) PRIVATE LIMITED',
      content: `
        <div class="legal-section-block">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 14px;">
            <strong>Entity:</strong> SYNERBIT (OPC) PRIVATE LIMITED &bull; <strong>Last Updated:</strong> 6 October 2026<br>
            <a href="/cookies.html" style="color: #38bdf8; text-decoration: underline; font-weight: 500;">Open Standalone Cookie Policy Page ↗</a>
          </p>
          <h4>1. What Are Cookies?</h4>
          <p>Cookies are small text files placed on your device when you visit a website. They help websites operate, remember information, understand how visitors use the website, and improve website performance and user experience.</p>
        </div>
        <div class="legal-section-block">
          <h4>2. Google Analytics &amp; Technologies</h4>
          <p>We use Google Analytics 4 (_ga, _ga_&lt;container-id&gt;) to measure website traffic and trends. Analytics information is collected in accordance with applicable consent settings. We do not sell personal data for monetary consideration.</p>
        </div>
        <div class="legal-section-block">
          <h4>3. Managing Your Preferences</h4>
          <p>You can control or delete cookies through your browser settings, or use available Google Analytics opt-out tools. Disabling cookies may affect certain website functionality.</p>
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

  // Open modal triggers from footer buttons
  document.querySelectorAll('.open-legal-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const policyKey = btn.getAttribute('data-policy') || 'privacy';
      openLegalModal(policyKey);
    });
  });

  // Modal tab switching
  legalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetKey = tab.getAttribute('data-target');
      openLegalModal(targetKey);
    });
  });

  // Close buttons
  if (btnCloseLegal) btnCloseLegal.addEventListener('click', closeLegalModal);
  if (btnDismissLegal) btnDismissLegal.addEventListener('click', closeLegalModal);

  // Close on backdrop click
  if (legalModal) {
    legalModal.addEventListener('click', (e) => {
      if (e.target === legalModal) {
        closeLegalModal();
      }
    });
  }

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalModal && legalModal.classList.contains('active')) {
      closeLegalModal();
    }
  });

  // -------------------------------------------------------------
  // Footer Link Smooth Navigation
  // -------------------------------------------------------------
  document.querySelectorAll('.footer-link-stage').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const stageIdx = parseInt(link.getAttribute('data-stage') || '0', 10);
      if (arenaSection) {
        const arenaRect = arenaSection.getBoundingClientRect();
        const absoluteArenaTop = window.scrollY + arenaRect.top;
        const scrollableDist = arenaSection.offsetHeight - window.innerHeight;
        const stageDist = Math.max(scrollableDist - window.innerHeight, 1);
        const stageFractions = [0.05, 0.28, 0.48, 0.68, 0.88];
        const targetScroll = absoluteArenaTop + (stageDist * (stageFractions[stageIdx] ?? 0));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.footer-link-product').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pIdx = parseInt(link.getAttribute('data-product') || '0', 10);
      if (productsArenaSection) {
        const pRect = productsArenaSection.getBoundingClientRect();
        const absolutePTop = window.scrollY + pRect.top;
        const pScrollableDist = productsArenaSection.offsetHeight - window.innerHeight;
        const pStageDist = Math.max(pScrollableDist - window.innerHeight, 1);
        const prodFractions = [0.1, 0.5, 0.9];
        const targetScroll = absolutePTop + (pStageDist * (prodFractions[pIdx] ?? 0));
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.footer-link-idea').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (ideaArenaSection) {
        const ideaRect = ideaArenaSection.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + ideaRect.top + 5, behavior: 'smooth' });
      }
    });
  });

  // Ensure page always starts at the very top (hero section) on initial load / refresh
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
    handleScroll();
  });
  window.addEventListener('pageshow', () => {
    window.scrollTo(0, 0);
    handleScroll();
  });
  setTimeout(() => {
    window.scrollTo(0, 0);
    handleScroll();
  }, 0);
  setTimeout(() => {
    window.scrollTo(0, 0);
    handleScroll();
  }, 80);

  setStage(0);
  updateProductCards(0);
  handleScroll();
});
