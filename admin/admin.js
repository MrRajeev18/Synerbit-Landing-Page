/**
 * Synerbit Admin Console Engine
 * Includes Role-Based Access Control (RBAC), Firebase Integration,
 * and CRUD operations for Products, Jobs, Applications, and Ideas.
 */

import { firebaseConfig, isFirebaseConfigured } from '/src/firebase.js';

// Local storage helper
const getLocal = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(`synerbit_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setLocal = (key, val) => {
  try {
    localStorage.setItem(`synerbit_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key}:`, err);
  }
};

// State
let currentUser = null;
let currentProducts = [];
let currentJobs = [];
let currentApplications = [];
let currentIdeas = [];
let currentContacts = [];
let currentTeam = [];

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const adminApp = document.getElementById('admin-app');
const loginForm = document.getElementById('admin-login-form');
const authError = document.getElementById('auth-error-msg');
const logoutBtn = document.getElementById('btn-admin-logout');

// Sidebar user info
const userNameEl = document.getElementById('sidebar-user-name');
const userRoleEl = document.getElementById('sidebar-user-role');
const userAvatarEl = document.getElementById('sidebar-user-avatar');

// Navigation tabs
const navTabs = document.querySelectorAll('.nav-tab');
const contentPanels = document.querySelectorAll('.content-panel');
const viewTitle = document.getElementById('current-view-title');
const viewDesc = document.getElementById('current-view-desc');

// View descriptions map
const VIEW_META = {
  dashboard: { title: 'Dashboard Overview', desc: 'High-level ecosystem telemetry and active queues.' },
  products: { title: 'Products Catalog', desc: 'Manage software platforms displayed on synerbit.in/products.html' },
  jobs: { title: 'Career Openings', desc: 'Post, edit, or close roles displayed on synerbit.in/jobs.html' },
  applications: { title: 'Job Applications Inbox', desc: 'Review candidates who applied on the careers page.' },
  ideas: { title: 'SaaS Concept Pitches', desc: 'Submissions received from synerbit.in/submit-idea.html' },
  contacts: { title: 'Contact Messages', desc: 'Inquiries sent via contact buttons and forms.' },
  team: { title: 'Team & Role Permissions', desc: 'Grant or restrict module-level permissions for console users.' }
};

/* ==========================================================================
   AUTHENTICATION & RBAC PERMISSION ENFORCEMENT
   ========================================================================== */

function initAuth() {
  // Bind Logout Listener Unconditionally
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleSignOut);
  }
  window.handleAdminSignOut = handleSignOut;

  // Handle Login Form Submit (Strict Firebase Authentication Only)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      authError.style.display = 'none';

      const btnSubmit = document.getElementById('btn-login-submit');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Verifying with Firebase...';
      }

      try {
        const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        resolveUserPermissions(userCred.user.email);
      } catch (err) {
        console.error('Firebase Auth error:', err);
        let friendlyMsg = err.message || 'Firebase login failed';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          friendlyMsg = 'Invalid email or password. Please check your credentials.';
        } else if (err.code === 'auth/network-request-failed') {
          friendlyMsg = 'Network error connecting to Firebase. Check internet connection.';
        }
        authError.textContent = friendlyMsg;
        authError.style.display = 'block';
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Sign In to Console';
        }
      }
    });
  }

  // Check stored session on startup
  const storedSession = sessionStorage.getItem('synerbit_admin_session');
  if (storedSession) {
    try {
      currentUser = JSON.parse(storedSession);
      enterAdminApp();
    } catch (e) {
      sessionStorage.removeItem('synerbit_admin_session');
    }
  }
}

async function handleSignOut() {
  sessionStorage.removeItem('synerbit_admin_session');
  currentUser = null;

  if (isFirebaseConfigured()) {
    try {
      const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const auth = getAuth(app);
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
  }

  adminApp.style.display = 'none';
  authScreen.style.display = 'flex';
  if (loginForm) loginForm.reset();
  if (authError) authError.style.display = 'none';
}

function resolveUserPermissions(email) {
  const team = getLocal('team', []);
  const found = team.find(m => m.email.toLowerCase() === email.toLowerCase());

  if (found) {
    loginUser(found);
  } else if (email.toLowerCase() === 'rajeev@synerbit.in' || email.includes('admin')) {
    // Default Super Admin fallback
    const superAdmin = {
      id: 'admin-super',
      name: 'Rajeev Ranjan',
      email: email,
      role: 'Super Admin',
      isSuperAdmin: true,
      permissions: {
        products: true,
        jobs: true,
        applications: true,
        ideas: true,
        contacts: true,
        team: true
      }
    };
    loginUser(superAdmin);
  } else {
    authError.textContent = `No authorized account found for ${email}. Contact the Super Admin.`;
    authError.style.display = 'block';
  }
}

function loginUser(user) {
  currentUser = user;
  sessionStorage.setItem('synerbit_admin_session', JSON.stringify(user));
  enterAdminApp();
}

function enterAdminApp() {
  authScreen.style.display = 'none';
  adminApp.style.display = 'flex';

  // Render User Pill
  userNameEl.textContent = currentUser.name || currentUser.email;
  userRoleEl.textContent = currentUser.role || 'Team Member';
  userAvatarEl.textContent = (currentUser.name || currentUser.email)[0].toUpperCase();

  // Enforce Granular RBAC on Sidebar Tabs
  enforcePermissions();

  // Load All Collections
  loadAllData();
}

/**
 * Dynamically hide / show sidebar tabs based on the user's permissions
 */
function enforcePermissions() {
  const p = currentUser.permissions || {};
  const isSuper = currentUser.isSuperAdmin === true;

  document.getElementById('tab-btn-products').style.display = (p.products || isSuper) ? 'flex' : 'none';
  document.getElementById('tab-btn-jobs').style.display = (p.jobs || isSuper) ? 'flex' : 'none';
  document.getElementById('tab-btn-applications').style.display = (p.applications || isSuper) ? 'flex' : 'none';
  document.getElementById('tab-btn-ideas').style.display = (p.ideas || isSuper) ? 'flex' : 'none';
  document.getElementById('tab-btn-contacts').style.display = (p.contacts || isSuper) ? 'flex' : 'none';
  
  // Team Management is strictly Super Admin
  const teamSection = document.getElementById('section-admin-only');
  const teamTab = document.getElementById('tab-btn-team');
  teamSection.style.display = isSuper ? 'block' : 'none';
  teamTab.style.display = isSuper ? 'flex' : 'none';
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    switchTab(target);
  });
});

function switchTab(tabId) {
  navTabs.forEach(t => t.classList.remove('active'));
  contentPanels.forEach(p => p.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  const activePanel = document.getElementById(`panel-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');

  if (VIEW_META[tabId]) {
    viewTitle.textContent = VIEW_META[tabId].title;
    viewDesc.textContent = VIEW_META[tabId].desc;
  }
}

/* ==========================================================================
   DATA LOADING & RENDERING
   ========================================================================== */

async function loadAllData() {
  currentProducts = getLocal('products', []);
  currentJobs = getLocal('jobs', []);
  currentApplications = getLocal('applications', []);
  currentIdeas = getLocal('ideas', []);
  currentContacts = getLocal('contacts', []);
  currentTeam = getLocal('team', []);

  // Live Firebase sync if configured
  if (isFirebaseConfigured()) {
    try {
      const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
      const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const [pSnap, jSnap, aSnap, iSnap] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "jobs")),
        getDocs(collection(db, "job_applications")),
        getDocs(collection(db, "idea_submissions"))
      ]);

      if (!pSnap.empty) currentProducts = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!jSnap.empty) currentJobs = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!aSnap.empty) currentApplications = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!iSnap.empty) currentIdeas = iSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Live Firebase fetch error in Admin Console:", err);
    }
  }

  // Update KPI counters
  document.getElementById('kpi-products-count').textContent = currentProducts.length;
  document.getElementById('kpi-jobs-count').textContent = currentJobs.length;
  document.getElementById('kpi-apps-count').textContent = currentApplications.length;
  document.getElementById('kpi-ideas-count').textContent = currentIdeas.length;

  document.getElementById('badge-applications-count').textContent = currentApplications.length;
  document.getElementById('badge-ideas-count').textContent = currentIdeas.length;

  // Render lists
  renderDashboardActivity();
  renderProductsTable();
  renderJobsTable();
  renderApplicationsTable();
  renderIdeasTable();
  renderContactsTable();
  renderTeamTable();
}

function renderDashboardActivity() {
  const appsBox = document.getElementById('dashboard-recent-apps');
  const ideasBox = document.getElementById('dashboard-recent-ideas');

  if (currentApplications.length === 0) {
    appsBox.innerHTML = '<div class="recent-list-empty">No applications received yet.</div>';
  } else {
    appsBox.innerHTML = currentApplications.slice(0, 4).map(app => `
      <div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; color: #ffffff;">${escapeHtml(app.applicantName)}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">${escapeHtml(app.jobTitle)} &bull; ${new Date(app.submittedAt).toLocaleDateString()}</div>
        </div>
        <span class="badge ${app.status === 'New' ? 'cyan' : 'emerald'}">${app.status}</span>
      </div>
    `).join('');
  }

  if (currentIdeas.length === 0) {
    ideasBox.innerHTML = '<div class="recent-list-empty">No SaaS ideas submitted yet.</div>';
  } else {
    ideasBox.innerHTML = currentIdeas.slice(0, 4).map(idea => `
      <div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; color: #ffffff;">${escapeHtml(idea.conceptName)}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">by ${escapeHtml(idea.founderName)} &bull; ${new Date(idea.submittedAt).toLocaleDateString()}</div>
        </div>
        <span class="badge amber">${idea.stage || 'Concept'}</span>
      </div>
    `).join('');
  }
}

/* ==========================================================================
   PRODUCTS MANAGEMENT (CRUD)
   ========================================================================== */

function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  if (currentProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No products found.</td></tr>';
    return;
  }

  tbody.innerHTML = currentProducts.map(p => `
    <tr>
      <td>
        <strong style="color: #ffffff;">${escapeHtml(p.name)}</strong>
        <div style="font-size: 0.78rem; color: #94a3b8;">${escapeHtml(p.tagline || '')}</div>
      </td>
      <td>${escapeHtml(p.category || 'Platform')}</td>
      <td><span class="badge ${p.statusColor || 'cyan'}">${p.status}</span></td>
      <td><a href="${p.url || '#'}" target="_blank" style="color: #38bdf8; text-decoration: none;">${p.url || 'None'}</a></td>
      <td>
        <button class="btn-table-action" onclick="window.editProduct('${p.id}')">Edit</button>
        <button class="btn-table-action delete" onclick="window.deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('btn-open-create-product').addEventListener('click', () => {
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  openModal('modal-product');
});

document.getElementById('product-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('prod-id').value || `prod-${Date.now()}`;
  const product = {
    id,
    name: document.getElementById('prod-name').value.trim(),
    tagline: document.getElementById('prod-tagline').value.trim(),
    category: document.getElementById('prod-category').value.trim(),
    status: document.getElementById('prod-status').value,
    statusColor: document.getElementById('prod-color').value,
    url: document.getElementById('prod-url').value.trim(),
    description: document.getElementById('prod-desc').value.trim(),
    updatedAt: new Date().toISOString()
  };

  const existingIdx = currentProducts.findIndex(p => p.id === id);
  if (existingIdx >= 0) {
    currentProducts[existingIdx] = product;
  } else {
    currentProducts.push(product);
  }

  setLocal('products', currentProducts);
  closeModal('modal-product');
  renderProductsTable();
});

window.editProduct = (id) => {
  const p = currentProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prod-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-tagline').value = p.tagline || '';
  document.getElementById('prod-category').value = p.category || '';
  document.getElementById('prod-status').value = p.status || 'Live';
  document.getElementById('prod-color').value = p.statusColor || 'cyan';
  document.getElementById('prod-url').value = p.url || '';
  document.getElementById('prod-desc').value = p.description || '';
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  openModal('modal-product');
};

window.deleteProduct = (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  currentProducts = currentProducts.filter(p => p.id !== id);
  setLocal('products', currentProducts);
  renderProductsTable();
};

/* ==========================================================================
   JOBS MANAGEMENT (CRUD)
   ========================================================================== */

function renderJobsTable() {
  const tbody = document.getElementById('jobs-table-body');
  if (currentJobs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No jobs posted yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentJobs.map(j => `
    <tr>
      <td><strong style="color: #ffffff;">${escapeHtml(j.title)}</strong></td>
      <td>${escapeHtml(j.department)}</td>
      <td>${escapeHtml(j.location)}</td>
      <td>${escapeHtml(j.experience || 'Experienced')}</td>
      <td><span class="badge ${j.status === 'Active' ? 'emerald' : 'rose'}">${j.status}</span></td>
      <td>
        <button class="btn-table-action" onclick="window.editJob('${j.id}')">Edit</button>
        <button class="btn-table-action delete" onclick="window.deleteJob('${j.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('btn-open-create-job').addEventListener('click', () => {
  document.getElementById('job-form').reset();
  document.getElementById('job-id-input').value = '';
  document.getElementById('job-modal-title').textContent = 'Post New Career Position';
  openModal('modal-job');
});

document.getElementById('job-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('job-id-input').value || `job-${Date.now()}`;
  const reqs = document.getElementById('job-reqs-input').value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const job = {
    id,
    title: document.getElementById('job-title-input').value.trim(),
    department: document.getElementById('job-dept-input').value.trim(),
    location: document.getElementById('job-location-input').value.trim(),
    type: document.getElementById('job-type-input').value,
    experience: document.getElementById('job-exp-input').value.trim(),
    status: document.getElementById('job-status-input').value,
    description: document.getElementById('job-desc-input').value.trim(),
    requirements: reqs,
    postedAt: new Date().toISOString()
  };

  const existingIdx = currentJobs.findIndex(j => j.id === id);
  if (existingIdx >= 0) {
    currentJobs[existingIdx] = job;
  } else {
    currentJobs.unshift(job);
  }

  setLocal('jobs', currentJobs);
  closeModal('modal-job');
  renderJobsTable();
});

window.editJob = (id) => {
  const j = currentJobs.find(x => x.id === id);
  if (!j) return;
  document.getElementById('job-id-input').value = j.id;
  document.getElementById('job-title-input').value = j.title;
  document.getElementById('job-dept-input').value = j.department;
  document.getElementById('job-location-input').value = j.location;
  document.getElementById('job-type-input').value = j.type || 'Full-Time';
  document.getElementById('job-exp-input').value = j.experience || '';
  document.getElementById('job-status-input').value = j.status || 'Active';
  document.getElementById('job-desc-input').value = j.description || '';
  document.getElementById('job-reqs-input').value = (j.requirements || []).join('\n');
  document.getElementById('job-modal-title').textContent = 'Edit Career Position';
  openModal('modal-job');
};

window.deleteJob = (id) => {
  if (!confirm('Are you sure you want to delete this job posting?')) return;
  currentJobs = currentJobs.filter(j => j.id !== id);
  setLocal('jobs', currentJobs);
  renderJobsTable();
};

/* ==========================================================================
   APPLICATIONS INBOX
   ========================================================================== */

function renderApplicationsTable() {
  const tbody = document.getElementById('applications-table-body');
  if (currentApplications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No applications received yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentApplications.map(app => `
    <tr>
      <td><strong style="color: #ffffff;">${escapeHtml(app.applicantName)}</strong></td>
      <td>${escapeHtml(app.jobTitle)}</td>
      <td>
        <div>${escapeHtml(app.applicantEmail)}</div>
        <div style="font-size: 0.78rem; color: #94a3b8;">${escapeHtml(app.applicantPhone || 'N/A')}</div>
      </td>
      <td>
        ${app.resumeUrl ? `<a href="${app.resumeUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">View Resume ↗</a>` : 'No file'}
      </td>
      <td style="font-size: 0.8rem; color: #94a3b8;">${new Date(app.submittedAt).toLocaleDateString()}</td>
      <td>
        <select class="form-select-sm" onchange="window.updateAppStatus('${app.id}', this.value)">
          <option value="New" ${app.status === 'New' ? 'selected' : ''}>New</option>
          <option value="Reviewing" ${app.status === 'Reviewing' ? 'selected' : ''}>Reviewing</option>
          <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
          <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
        </select>
      </td>
      <td>
        <button class="btn-table-action" onclick="window.viewApplication('${app.id}')">View Note</button>
      </td>
    </tr>
  `).join('');
}

window.updateAppStatus = (id, newStatus) => {
  const app = currentApplications.find(a => a.id === id);
  if (app) {
    app.status = newStatus;
    setLocal('applications', currentApplications);
    renderDashboardActivity();
  }
};

window.viewApplication = (id) => {
  const app = currentApplications.find(a => a.id === id);
  if (!app) return;
  const body = document.getElementById('view-app-body');
  body.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h4 style="color: #ffffff; font-size: 1.1rem; margin-bottom: 4px;">${escapeHtml(app.applicantName)}</h4>
      <div style="color: #38bdf8; font-size: 0.88rem;">Applying for: ${escapeHtml(app.jobTitle)}</div>
    </div>
    <p><strong>Email:</strong> ${escapeHtml(app.applicantEmail)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(app.applicantPhone || 'Not provided')}</p>
    <p><strong>Portfolio / Profile:</strong> <a href="${app.portfolioUrl}" target="_blank" style="color: #38bdf8;">${escapeHtml(app.portfolioUrl)}</a></p>
    <p style="margin-top: 14px;"><strong>Applicant Cover Note:</strong></p>
    <div style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; margin-top: 6px; font-style: italic;">
      "${escapeHtml(app.notes || 'No note provided.')}"
    </div>
    <div style="margin-top: 20px;">
      <a href="${app.resumeUrl || '#'}" target="_blank" class="btn-primary-action" style="display: inline-block; text-decoration: none;">Download / Open Resume Document ↗</a>
    </div>
  `;
  openModal('modal-view-app');
};

/* ==========================================================================
   SAAS IDEA PITCHES INBOX
   ========================================================================== */

function renderIdeasTable() {
  const tbody = document.getElementById('ideas-table-body');
  if (currentIdeas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No SaaS ideas submitted yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentIdeas.map(idea => `
    <tr>
      <td><strong style="color: #ffffff;">${escapeHtml(idea.conceptName)}</strong></td>
      <td>
        <div>${escapeHtml(idea.founderName)}</div>
        <div style="font-size: 0.78rem; color: #94a3b8;">${escapeHtml(idea.founderEmail)}</div>
      </td>
      <td><span class="badge amber">${idea.stage}</span></td>
      <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(idea.elevatorPitch || '')}</td>
      <td style="font-size: 0.8rem; color: #94a3b8;">${new Date(idea.submittedAt).toLocaleDateString()}</td>
      <td>
        <button class="btn-table-action" onclick="window.viewIdea('${idea.id}')">View Pitch</button>
      </td>
    </tr>
  `).join('');
}

window.viewIdea = (id) => {
  const idea = currentIdeas.find(i => i.id === id);
  if (!idea) return;
  const body = document.getElementById('view-idea-body');
  body.innerHTML = `
    <h4 style="color: #ffffff; font-size: 1.25rem; margin-bottom: 4px;">${escapeHtml(idea.conceptName)}</h4>
    <div style="color: #38bdf8; font-size: 0.88rem; margin-bottom: 16px;">
      Founder: ${escapeHtml(idea.founderName)} &bull; <a href="mailto:${idea.founderEmail}" style="color: #38bdf8;">${escapeHtml(idea.founderEmail)}</a>
      ${idea.background ? `<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">Background: ${escapeHtml(idea.background)}</div>` : ''}
    </div>
    
    <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
      <span class="badge amber">Stage: ${escapeHtml(idea.stage || 'Concept')}</span>
      ${idea.productType ? `<span class="badge cyan">Type: ${escapeHtml(idea.productType)}</span>` : ''}
      <span class="badge emerald">Terms Agreed: ✓</span>
    </div>

    <p style="margin-top: 10px;"><strong>Core Problem:</strong><br />${escapeHtml(idea.problem)}</p>
    <p style="margin-top: 10px;"><strong>Proposed Solution:</strong><br />${escapeHtml(idea.solution)}</p>
    ${idea.targetAudience ? `<p style="margin-top: 10px;"><strong>Target Audience / Users:</strong><br />${escapeHtml(idea.targetAudience)}</p>` : ''}
    ${idea.successReason ? `<p style="margin-top: 10px;"><strong>Why it could succeed (Potential):</strong><br />${escapeHtml(idea.successReason)}</p>` : ''}
    ${idea.additionalContext ? `<p style="margin-top: 10px;"><strong>Additional Context / Links:</strong><br />${escapeHtml(idea.additionalContext)}</p>` : ''}
    ${idea.deckUrl ? `<p style="margin-top: 14px;"><strong>Deck / Prototype:</strong> <a href="${idea.deckUrl}" target="_blank" style="color: #38bdf8;">${escapeHtml(idea.deckUrl)} ↗</a></p>` : ''}
    
    <div style="margin-top: 24px;">
      <a href="mailto:${idea.founderEmail}?subject=Re:%20Synerbit%20Incubation%20Proposal%20-%20${encodeURIComponent(idea.conceptName)}" class="btn-primary-action" style="display: inline-block; text-decoration: none;">Reply to Founder via Email ✉️</a>
    </div>
  `;
  openModal('modal-view-idea');
};

/* ==========================================================================
   CONTACT MESSAGES
   ========================================================================== */

function renderContactsTable() {
  const tbody = document.getElementById('contacts-table-body');
  if (currentContacts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No contact messages yet.</td></tr>';
    return;
  }

  tbody.innerHTML = currentContacts.map(c => `
    <tr>
      <td><strong style="color: #ffffff;">${escapeHtml(c.name || 'Anonymous')}</strong></td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.subject || 'Inquiry')}</td>
      <td>${escapeHtml(c.message)}</td>
      <td style="font-size: 0.8rem; color: #94a3b8;">${new Date(c.submittedAt).toLocaleDateString()}</td>
    </tr>
  `).join('');
}

/* ==========================================================================
   TEAM & GRANULAR ROLE-BASED ACCESS (SUPER ADMIN)
   ========================================================================== */

function renderTeamTable() {
  const tbody = document.getElementById('team-table-body');
  if (currentTeam.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No team members found.</td></tr>';
    return;
  }

  tbody.innerHTML = currentTeam.map(member => {
    const p = member.permissions || {};
    const permsList = [
      p.products ? '<span class="badge cyan">Products</span>' : '',
      p.jobs ? '<span class="badge emerald">Jobs</span>' : '',
      p.applications ? '<span class="badge cyan">Applications</span>' : '',
      p.ideas ? '<span class="badge amber">Ideas</span>' : '',
      p.contacts ? '<span class="badge emerald">Contacts</span>' : '',
      member.isSuperAdmin ? '<span class="badge rose">Super Admin</span>' : ''
    ].filter(Boolean).join(' ');

    return `
      <tr>
        <td><strong style="color: #ffffff;">${escapeHtml(member.name)}</strong></td>
        <td>${escapeHtml(member.email)}</td>
        <td>${escapeHtml(member.role)}</td>
        <td>${permsList || '<span style="color: #64748b;">No permissions</span>'}</td>
        <td>
          ${member.isSuperAdmin ? '<span style="color: #64748b; font-size: 0.78rem;">Protected</span>' : `
            <button class="btn-table-action" onclick="window.editMember('${member.id}')">Edit Permissions</button>
            <button class="btn-table-action delete" onclick="window.deleteMember('${member.id}')">Remove</button>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('btn-open-add-member').addEventListener('click', () => {
  document.getElementById('team-form').reset();
  document.getElementById('team-user-id').value = '';
  document.getElementById('team-modal-title').textContent = 'Add Team Member & Assign Access';
  openModal('modal-team');
});

document.getElementById('team-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('team-user-id').value || `member-${Date.now()}`;
  const member = {
    id,
    name: document.getElementById('team-user-name').value.trim(),
    email: document.getElementById('team-user-email').value.trim(),
    role: document.getElementById('team-user-role').value.trim(),
    isSuperAdmin: false,
    permissions: {
      products: document.getElementById('perm-products').checked,
      jobs: document.getElementById('perm-jobs').checked,
      applications: document.getElementById('perm-applications').checked,
      ideas: document.getElementById('perm-ideas').checked,
      contacts: document.getElementById('perm-contacts').checked,
      team: false
    },
    createdAt: new Date().toISOString()
  };

  const existingIdx = currentTeam.findIndex(m => m.id === id);
  if (existingIdx >= 0) {
    currentTeam[existingIdx] = member;
  } else {
    currentTeam.push(member);
  }

  setLocal('team', currentTeam);
  closeModal('modal-team');
  renderTeamTable();
});

window.editMember = (id) => {
  const m = currentTeam.find(x => x.id === id);
  if (!m) return;
  document.getElementById('team-user-id').value = m.id;
  document.getElementById('team-user-name').value = m.name;
  document.getElementById('team-user-email').value = m.email;
  document.getElementById('team-user-role').value = m.role;
  const p = m.permissions || {};
  document.getElementById('perm-products').checked = !!p.products;
  document.getElementById('perm-jobs').checked = !!p.jobs;
  document.getElementById('perm-applications').checked = !!p.applications;
  document.getElementById('perm-ideas').checked = !!p.ideas;
  document.getElementById('perm-contacts').checked = !!p.contacts;
  document.getElementById('team-modal-title').textContent = 'Edit Member Permissions';
  openModal('modal-team');
};

window.deleteMember = (id) => {
  if (!confirm('Are you sure you want to remove this team member?')) return;
  currentTeam = currentTeam.filter(m => m.id !== id);
  setLocal('team', currentTeam);
  renderTeamTable();
};

/* ==========================================================================
   MODAL UTILITIES
   ========================================================================== */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(btn.dataset.closeModal);
  });
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.classList.remove('active');
  });
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Bootstrap Console
initAuth();
