import { submitContactMessage } from './firebase.js';

let modalInstance = null;

function createContactModal() {
  if (modalInstance) return modalInstance;
  if (document.getElementById('contact-modal')) {
    modalInstance = {
      open: () => document.getElementById('contact-modal').classList.add('active'),
      close: () => document.getElementById('contact-modal').classList.remove('active')
    };
    return modalInstance;
  }

  const modalHtml = `
  <div class="contact-modal-backdrop" id="contact-modal" aria-hidden="true">
    <div class="contact-modal-card" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div class="contact-modal-header">
        <div class="contact-header-meta">
          <span class="contact-badge">DIRECT INQUIRY</span>
          <h3 class="contact-modal-title" id="contact-modal-title">Get in Touch</h3>
          <p class="contact-modal-subtitle">Have a question, feedback, or business proposal? Reach our team directly.</p>
        </div>
        <button type="button" class="btn-contact-close" id="btn-close-contact" aria-label="Close modal">✕</button>
      </div>

      <div class="contact-modal-body">
        <form id="contact-modal-form" class="contact-form">
          <div class="contact-form-row">
            <div class="contact-form-group">
              <label for="contact-field-name" class="contact-form-label">Full Name *</label>
              <input type="text" id="contact-field-name" class="contact-form-input" required placeholder="Your full name" autocomplete="name" />
            </div>
            <div class="contact-form-group">
              <label for="contact-field-email" class="contact-form-label">Email Address *</label>
              <input type="email" id="contact-field-email" class="contact-form-input" required placeholder="you@example.com" autocomplete="email" />
            </div>
          </div>

          <div class="contact-form-group">
            <label for="contact-field-subject" class="contact-form-label">Subject *</label>
            <input type="text" id="contact-field-subject" class="contact-form-input" required placeholder="What is this inquiry about?" />
          </div>

          <div class="contact-form-group">
            <label for="contact-field-message" class="contact-form-label">Message *</label>
            <textarea id="contact-field-message" class="contact-form-textarea" rows="4" required placeholder="Write your message here..."></textarea>
          </div>

          <div id="contact-form-alert" class="contact-alert" style="display: none;"></div>

          <div class="contact-modal-footer">
            <span class="contact-footer-note">Or email directly at <a href="mailto:contact@synerbit.in">contact@synerbit.in</a></span>
            <button type="submit" class="btn-contact-submit" id="btn-contact-submit">
              <span>Send Message</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>
        </form>

        <div id="contact-success-view" class="contact-success-view" style="display: none;">
          <div class="contact-success-icon">✓</div>
          <h4 class="contact-success-title">Message Sent Successfully!</h4>
          <p class="contact-success-text">Thank you for reaching out. Your message has been logged in our system and our team will get back to your email shortly.</p>
          <button type="button" class="btn-contact-done" id="btn-contact-done">Done</button>
        </div>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const backdrop = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('btn-close-contact');
  const doneBtn = document.getElementById('btn-contact-done');
  const form = document.getElementById('contact-modal-form');
  const successView = document.getElementById('contact-success-view');
  const alertBox = document.getElementById('contact-form-alert');
  const submitBtn = document.getElementById('btn-contact-submit');

  function openContactModal() {
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Reset view
    form.reset();
    form.style.display = 'block';
    successView.style.display = 'none';
    alertBox.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span>Send Message</span> <span class="btn-arrow">→</span>';

    setTimeout(() => {
      document.getElementById('contact-field-name')?.focus();
    }, 120);
  }

  function closeContactModal() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeContactModal);
  doneBtn?.addEventListener('click', closeContactModal);

  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeContactModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeContactModal();
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contact-field-name').value.trim();
    const email = document.getElementById('contact-field-email').value.trim();
    const subject = document.getElementById('contact-field-subject').value.trim();
    const message = document.getElementById('contact-field-message').value.trim();

    if (!name || !email || !message) {
      alertBox.textContent = 'Please fill out all required fields.';
      alertBox.className = 'contact-alert error';
      alertBox.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending Message...</span>';
    alertBox.style.display = 'none';

    try {
      const res = await submitContactMessage({
        name,
        email,
        subject: subject || 'General Inquiry',
        message
      });

      if (res && res.success) {
        form.style.display = 'none';
        successView.style.display = 'flex';
      } else {
        throw new Error('Failed to submit message');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      alertBox.textContent = 'Could not send message. Please try again or email contact@synerbit.in.';
      alertBox.className = 'contact-alert error';
      alertBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Send Message</span> <span class="btn-arrow">→</span>';
    }
  });

  modalInstance = { open: openContactModal, close: closeContactModal };
  return modalInstance;
}

let isInitialized = false;

export function initContactModal() {
  const modal = createContactModal();
  if (isInitialized) return modal;
  isInitialized = true;

  // Intercept click on any contact triggers (buttons, footer links, mailto)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(
      '.btn-nav-glass, [data-open-contact], a[data-open-contact], button[data-open-contact], a[href="#contact"], a[href^="mailto:contact@synerbit.in"], a[href^="mailto:legal@synerbit.in"]'
    );
    if (trigger) {
      e.preventDefault();
      modal.open();
    }
  });

  window.openContactModal = () => modal.open();
  return modal;
}

// Auto-run if loaded as a module
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactModal);
  } else {
    initContactModal();
  }
}
