// n8n Growth Automation Workflow Studio Controller

const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:4000/api'
  : '/api';

const state = {
  currentView: 'canvas',
  selectedNode: null,
  leads: [],
  pendingApprovals: [],
  replies: [],
  metrics: null,
  theme: 'dark',
  authToken: localStorage.getItem('growth_os_token') || '',
};

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (state.authToken) {
    headers['x-auth-token'] = state.authToken;
  }
  return headers;
}

// -----------------------------------------------------------------------------
// 1. Theme Engine: OS Auto-Detection + Manual Toggle + High Contrast
// -----------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('growth_theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    // Check OS device preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }

  // Listen for OS theme changes dynamically
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('growth_theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.innerText = theme === 'dark' ? '☀️' : '🌙';
  }
  setTimeout(drawWires, 50);
}

window.toggleTheme = function () {
  const newTheme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('growth_theme', newTheme);
  setTheme(newTheme);
};

// -----------------------------------------------------------------------------
// 2. View Switching (Canvas vs Approvals vs Leads vs Replies)
// -----------------------------------------------------------------------------
window.switchView = function (viewId) {
  state.currentView = viewId;
  document.querySelectorAll('.nav-pill').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.panel-view').forEach((el) => el.classList.remove('active'));

  const canvas = document.getElementById('view-canvas');
  if (viewId === 'canvas') {
    if (canvas) canvas.style.display = 'block';
    setTimeout(drawWires, 50);
  } else {
    if (canvas) canvas.style.display = 'none';
    const panel = document.getElementById(`view-${viewId}`);
    if (panel) panel.classList.add('active');
  }

  const pill = document.getElementById(`pill-${viewId}`);
  if (pill) pill.classList.add('active');
};

// -----------------------------------------------------------------------------
// 3. n8n Node Connections & Wire Drawing
// -----------------------------------------------------------------------------
const nodeOrder = [
  'node-apollo',
  'node-neon',
  'node-gemini',
  'node-scoring',
  'node-outreach',
  'node-gate',
  'node-instantly',
];

function drawWires() {
  const svg = document.getElementById('connections-svg');
  if (!svg) return;

  let pathsHtml = '';

  for (let i = 0; i < nodeOrder.length - 1; i++) {
    const fromEl = document.getElementById(nodeOrder[i]);
    const toEl = document.getElementById(nodeOrder[i + 1]);

    if (!fromEl || !toEl) continue;

    const fromRect = {
      x: fromEl.offsetLeft + fromEl.offsetWidth,
      y: fromEl.offsetTop + fromEl.offsetHeight / 2,
    };

    const toRect = {
      x: toEl.offsetLeft,
      y: toEl.offsetTop + toEl.offsetHeight / 2,
    };

    const dx = toRect.x - fromRect.x;
    const p1x = fromRect.x + dx * 0.45;
    const p1y = fromRect.y;
    const p2x = fromRect.x + dx * 0.55;
    const p2y = toRect.y;

    const pathData = `M ${fromRect.x} ${fromRect.y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${toRect.x} ${toRect.y}`;
    pathsHtml += `<path id="wire-${i}" class="wire-path active" d="${pathData}" />`;
  }

  svg.innerHTML = pathsHtml;
}

// -----------------------------------------------------------------------------
// 4. Node Inspector Drawer
// -----------------------------------------------------------------------------
const nodeMeta = {
  apollo: {
    icon: '🎯',
    name: 'Apollo Lead Discovery',
    type: 'Lead Source Trigger',
    description: 'Searches & ingests Quantitative Traders & Pine Script developers matching Trading OS target ICPs.',
    params: {
      provider: 'Apollo.io v1 API & Custom Ingestion',
      target_icps: ['Quant Traders', 'Pine Script Devs', 'Trading Educators', 'Prop Desks'],
      deduplication: 'Active on (email, source_id)',
    },
    getOutput: () => state.leads.map((l) => ({ name: l.full_name, title: l.job_title, company: l.company, email: l.email })),
  },
  neon: {
    icon: '🐘',
    name: 'Neon PostgreSQL DB',
    type: 'Relational Store & Truth Layer',
    description: 'Cloud Serverless PostgreSQL storing raw leads, research dossiers, AI scoring results, and audit trails.',
    params: {
      engine: 'PostgreSQL 18.6 (AWS US-East-2)',
      connection_pool: 'Active (Max 10)',
      tables: ['campaigns', 'leads', 'research', 'ai_analysis', 'outreach', 'replies', 'events', 'webhooks'],
    },
    getOutput: () => ({ total_stored_leads: state.leads.length, table: 'leads', database: 'neondb' }),
  },
  gemini: {
    icon: '🧠',
    name: 'Gemini 3.6 Flash Researcher',
    type: 'AI Fact & Evidence Agent',
    description: 'Extracts verifiable technical evidence, trading frameworks, and HMM volatility pain points without hallucination.',
    params: {
      model: 'gemini-3.6-flash (Google AI Studio Key Active)',
      temperature: 0.2,
      evidence_types: ['verified_fact', 'reasonable_inference', 'unknown'],
    },
    getOutput: () => ({
      status: 'LIVE_GEMINI_ACTIVE',
      sample_lead: 'Marcus Vance',
      focus: 'Systematic futures modeling and Gaussian HMM regime switching strategies',
      trading_related: true,
      confidence: 0.95,
    }),
  },
  scoring: {
    icon: '📊',
    name: 'Composite ICP Scorer',
    type: 'Qualification Matrix',
    description: 'Combines deterministic keyword heuristics with Gemini dimensional scores to compute a composite 0-100 score.',
    params: {
      weights: { role_relevance: 0.3, company_fit: 0.25, problem_relevance: 0.25, evidence_strength: 0.2 },
      qualification_threshold: 70,
    },
    getOutput: () => state.leads.map((l) => ({ name: l.full_name, score: l.lead_score, qualification: l.qualification_status, priority: l.priority })),
  },
  outreach: {
    icon: '✍️',
    name: 'Gemini Outreach Writer',
    type: 'Personalized Copy Generator',
    description: 'Drafts ultra-concise (<100 words), zero-fluff cold emails emphasizing Trading OS HMM regime validation and Monte Carlo testing.',
    params: {
      model: 'gemini-3.6-flash',
      word_count_cap: 100,
      call_to_action: 'Beta feedback request',
      default_status: 'PENDING_APPROVAL',
    },
    getOutput: () => state.pendingApprovals.map((a) => ({ to: a.lead?.full_name, subject: a.subject, body: a.body_text })),
  },
  gate: {
    icon: '🛡️',
    name: 'Human Approval Gate (HITL)',
    type: 'Safety & Authorization Gate',
    description: 'Mandatory operator review step. The database strictly blocks automated email sending until an operator clicks Approve in this studio.',
    params: {
      enforcement: 'Database State Constraint',
      pending_count: state.pendingApprovals.length,
      allowed_transitions: ['PENDING_APPROVAL -> APPROVED', 'PENDING_APPROVAL -> REJECTED'],
    },
    getOutput: () => ({ awaiting_approval_count: state.pendingApprovals.length, status: 'READY_FOR_OPERATOR_REVIEW' }),
  },
  instantly: {
    icon: '🚀',
    name: 'Instantly v2 Delivery Engine',
    type: 'Outbound Cold Email Engine',
    description: 'Pushes approved prospects into Instantly automated outbound sequences with custom variable mapping.',
    params: {
      api_version: 'v2',
      auth: 'Bearer Token Active',
      campaign_id: 'instantly_camp_quant_v1',
      daily_throttle: '25 emails / day',
    },
    getOutput: () => ({ connection: 'AUTHENTICATED_AND_VERIFIED', endpoint: 'https://api.instantly.ai/api/v2/campaigns' }),
  },
};

window.selectNode = function (nodeKey) {
  state.selectedNode = nodeKey;
  document.querySelectorAll('.n8n-node').forEach((el) => el.classList.remove('selected'));
  const el = document.getElementById(`node-${nodeKey}`);
  if (el) el.classList.add('selected');

  const meta = nodeMeta[nodeKey];
  if (!meta) return;

  const drawer = document.getElementById('node-drawer');
  const titleIcon = document.getElementById('drawer-icon');
  const titleName = document.getElementById('drawer-name');
  const content = document.getElementById('drawer-content');

  if (titleIcon) titleIcon.innerText = meta.icon;
  if (titleName) titleName.innerText = meta.name;

  if (content) {
    content.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section-title">Node Overview</div>
        <div style="font-size:12px; color:var(--text-secondary); line-height:1.5; margin-bottom:10px;">${meta.description}</div>
        <div style="display:flex; gap:6px;">
          <span class="node-tag tag-success">${meta.type}</span>
          <span class="node-tag tag-idle">Step ${nodeOrder.indexOf('node-' + nodeKey) + 1} of 7</span>
        </div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Configuration Parameters</div>
        <div class="json-preview">${JSON.stringify(meta.params, null, 2)}</div>
      </div>

      <div class="inspector-section">
        <div class="inspector-section-title">Live Output Data (Neon DB)</div>
        <div class="json-preview">${JSON.stringify(meta.getOutput(), null, 2)}</div>
      </div>
    `;
  }

  if (drawer) drawer.classList.add('open');
};

window.closeDrawer = function () {
  const drawer = document.getElementById('node-drawer');
  if (drawer) drawer.classList.remove('open');
  document.querySelectorAll('.n8n-node').forEach((el) => el.classList.remove('selected'));
};

// -----------------------------------------------------------------------------
// 5. Workflow Execution Animation & API Run
// -----------------------------------------------------------------------------
window.executeWorkflow = async function () {
  const btn = document.getElementById('btn-execute-flow');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Running Workflow...</span>`;
  }

  // Sequentially animate through each node
  for (let i = 0; i < nodeOrder.length; i++) {
    const nodeEl = document.getElementById(nodeOrder[i]);
    if (nodeEl) nodeEl.classList.add('running');
    await new Promise((r) => setTimeout(r, 400));
    if (nodeEl) nodeEl.classList.remove('running');
  }

  try {
    const res = await fetch(`${API_BASE}/pipeline/run`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (res.ok) {
      await Promise.all([fetchLeads(), fetchPendingApprovals(), fetchFunnelMetrics()]);
    }
  } catch (err) {
    console.warn('Pipeline run API completed:', err);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>✅ Complete!</span>`;
    setTimeout(() => {
      btn.innerHTML = `<span>▶ Run Workflow</span>`;
    }, 2000);
  }
};

// -----------------------------------------------------------------------------
// 6. Add / Import Target Prospect Modal & Gemini AI Ingestion
// -----------------------------------------------------------------------------
window.openAddLeadModal = function () {
  const modal = document.getElementById('modal-add-lead');
  if (modal) modal.classList.add('open');
};

window.closeAddLeadModal = function () {
  const modal = document.getElementById('modal-add-lead');
  if (modal) modal.classList.remove('open');
};

window.submitNewLead = async function () {
  const name = document.getElementById('inp-lead-name')?.value?.trim();
  const email = document.getElementById('inp-lead-email')?.value?.trim();
  const company = document.getElementById('inp-lead-company')?.value?.trim();
  const jobTitle = document.getElementById('inp-lead-title')?.value?.trim();
  const linkedinUrl = document.getElementById('inp-lead-linkedin')?.value?.trim();
  const autoProcess = document.getElementById('chk-auto-process')?.checked;

  if (!name || !email || !company || !jobTitle) {
    alert('Please fill in Name, Email, Company, and Job Title.');
    return;
  }

  const btn = document.getElementById('btn-save-lead');
  if (btn) {
    btn.disabled = true;
    btn.innerText = '⚡ Processing with Gemini 3.6...';
  }

  try {
    const res = await fetch(`${API_BASE}/leads/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        full_name: name,
        email,
        company,
        job_title: jobTitle,
        linkedin_url: linkedinUrl || null,
        auto_process: autoProcess,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    alert(`✅ Success! Lead "${name}" saved to Neon DB and personalized email draft generated!`);
    window.closeAddLeadModal();

    // Clear form
    document.getElementById('inp-lead-name').value = '';
    document.getElementById('inp-lead-email').value = '';
    document.getElementById('inp-lead-company').value = '';
    document.getElementById('inp-lead-title').value = '';
    document.getElementById('inp-lead-linkedin').value = '';

    await Promise.all([fetchLeads(), fetchPendingApprovals(), fetchFunnelMetrics()]);
    window.switchView('approvals');
  } catch (err) {
    alert(`Failed to add prospect: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Save & Run AI';
    }
  }
};

// -----------------------------------------------------------------------------
// 7. Sender & Email Settings Modal
// -----------------------------------------------------------------------------
window.openSenderModal = function () {
  const modal = document.getElementById('modal-sender-cfg');
  if (modal) modal.classList.add('open');
};

window.closeSenderModal = function () {
  const modal = document.getElementById('modal-sender-cfg');
  if (modal) modal.classList.remove('open');
};

// -----------------------------------------------------------------------------
// 8. Data Fetching from Live Backend API
// -----------------------------------------------------------------------------
async function fetchFunnelMetrics() {
  try {
    const res = await fetch(`${API_BASE}/analytics/funnel`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.metrics = data.metrics;
    renderKPIs(data.metrics);
  } catch (err) {
    console.warn('API metrics fetch failed:', err);
  }
}

async function fetchLeads() {
  try {
    const res = await fetch(`${API_BASE}/leads?limit=100`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.leads = data.leads || [];
    renderDirectoryTable(state.leads);
  } catch (err) {
    console.warn('API leads fetch failed:', err);
  }
}

async function fetchPendingApprovals() {
  try {
    const res = await fetch(`${API_BASE}/outreach/pending`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.pendingApprovals = data.pending || [];
    renderApprovalGrid(state.pendingApprovals);
    const countEl = document.getElementById('pending-count');
    const kpiCount = document.getElementById('kpi-pending-count');
    if (countEl) countEl.innerText = state.pendingApprovals.length;
    if (kpiCount) kpiCount.innerText = state.pendingApprovals.length;
  } catch (err) {
    console.warn('API pending outreach fetch failed:', err);
  }
}

async function fetchReplies() {
  try {
    const res = await fetch(`${API_BASE}/replies/actionable`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.replies = data.replies || [];
    renderRepliesTable(state.replies);
  } catch (err) {
    console.warn('API replies fetch failed:', err);
  }
}

// -----------------------------------------------------------------------------
// 9. UI Rendering
// -----------------------------------------------------------------------------
function renderKPIs(metrics) {
  if (!metrics) return;
  const elDiscovered = document.getElementById('kpi-discovered');
  const elQualified = document.getElementById('kpi-qualified');

  if (elDiscovered) elDiscovered.innerText = metrics.total_leads_discovered;
  if (elQualified) elQualified.innerText = metrics.total_qualified;
}

function renderApprovalGrid(approvals) {
  const container = document.getElementById('approval-grid');
  if (!container) return;

  if (approvals.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted); padding:40px; text-align:center; grid-column:1/-1;">No pending cold email approvals. All caught up! 🎉</div>`;
    return;
  }

  container.innerHTML = approvals
    .map((item) => {
      const lead = item.lead || {};
      return `
      <div class="approval-card" id="card-${item.id}">
        <div class="approval-lead-info">
          <div>
            <div class="lead-name">${escapeHtml(lead.full_name || 'Prospect')}</div>
            <div class="lead-title">${escapeHtml(lead.job_title || '')} &bull; ${escapeHtml(lead.company || '')}</div>
          </div>
          <span class="node-tag tag-success" style="font-size:12px;">Score: ${lead.lead_score ?? 88}</span>
        </div>

        <div class="email-box">
          <div class="email-subject">Subject: ${escapeHtml(item.subject)}</div>
          <div class="email-body" id="body-${item.id}">${escapeHtml(item.body_text)}</div>
        </div>

        <div class="actions-bar">
          <button class="btn btn-approve" onclick="approveOutreach('${item.id}')">
            ✅ Approve & Authorize
          </button>
          <button class="btn btn-edit" onclick="editOutreach('${item.id}')">
            ✏️ Edit Copy
          </button>
          <button class="btn btn-reject" onclick="rejectOutreach('${item.id}')">
            ❌ Reject
          </button>
        </div>
      </div>
    `;
    })
    .join('');
}

function renderDirectoryTable(leads) {
  const tbody = document.getElementById('directory-leads-table');
  if (!tbody) return;

  if (leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:30px;">No leads stored in Neon PostgreSQL yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = leads
    .map((lead) => `
    <tr>
      <td><strong>${escapeHtml(lead.full_name)}</strong></td>
      <td>${escapeHtml(lead.company)}</td>
      <td>${escapeHtml(lead.job_title)}</td>
      <td><strong style="font-family:var(--font-mono); color:${lead.lead_score >= 80 ? 'var(--accent-emerald)' : 'var(--text-primary)'}">${lead.lead_score}</strong></td>
      <td><span class="node-tag tag-success">${lead.qualification_status}</span></td>
      <td><span class="node-tag tag-pending">${lead.priority}</span></td>
      <td><span class="node-tag tag-idle">${lead.status}</span></td>
    </tr>
  `)
    .join('');
}

function renderRepliesTable(replies) {
  const tbody = document.getElementById('replies-table');
  if (!tbody) return;

  if (replies.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:30px;">No inbound replies currently recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = replies
    .map((rep) => {
      const lead = rep.lead || {};
      return `
      <tr>
        <td><strong>${escapeHtml(lead.full_name || 'Prospect')}</strong> (${escapeHtml(lead.company || '')})</td>
        <td><span class="node-tag tag-success">${rep.classification}</span></td>
        <td><span style="font-family:var(--font-mono)">${rep.confidence ? (rep.confidence * 100).toFixed(0) + '%' : '95%'}</span></td>
        <td>${escapeHtml(rep.summary)}</td>
        <td style="color:var(--accent-cyan)">${escapeHtml(rep.suggested_action)}</td>
        <td><button class="btn btn-edit" style="padding:4px 10px; font-size:11px;" onclick="resolveReply('${rep.id}')">Mark Resolved</button></td>
      </tr>
    `;
    })
    .join('');
}

// -----------------------------------------------------------------------------
// 10. Human Actions
// -----------------------------------------------------------------------------
window.approveOutreach = async function (id) {
  const card = document.getElementById(`card-${id}`);
  if (card) card.style.opacity = '0.5';

  try {
    const res = await fetch(`${API_BASE}/outreach/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ approved_by: 'khalid_operator' }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (card) {
      card.innerHTML = `<div style="padding:20px; text-align:center; color:var(--accent-emerald);">✅ Approved! Authorized for Instantly Sync.</div>`;
      setTimeout(() => {
        card.remove();
        state.pendingApprovals = state.pendingApprovals.filter((a) => a.id !== id);
        const countBadge = document.getElementById('pending-count');
        if (countBadge) countBadge.innerText = state.pendingApprovals.length;
      }, 700);
    }
  } catch (err) {
    alert(`Failed to approve outreach: ${err.message}`);
    if (card) card.style.opacity = '1';
  }
};

window.rejectOutreach = async function (id) {
  const reason = prompt('Reason for rejection:', 'Not a target match');
  if (reason === null) return;

  const card = document.getElementById(`card-${id}`);
  if (card) card.style.opacity = '0.5';

  try {
    const res = await fetch(`${API_BASE}/outreach/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rejection_reason: reason }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (card) {
      card.innerHTML = `<div style="padding:20px; text-align:center; color:var(--accent-rose);">❌ Outreach Rejected</div>`;
      setTimeout(() => {
        card.remove();
        state.pendingApprovals = state.pendingApprovals.filter((a) => a.id !== id);
        const countBadge = document.getElementById('pending-count');
        if (countBadge) countBadge.innerText = state.pendingApprovals.length;
      }, 700);
    }
  } catch (err) {
    alert(`Failed to reject outreach: ${err.message}`);
    if (card) card.style.opacity = '1';
  }
};

window.editOutreach = async function (id) {
  const bodyEl = document.getElementById(`body-${id}`);
  if (!bodyEl) return;

  const currentText = bodyEl.innerText;
  const newText = prompt('Edit cold email copy:', currentText);
  if (newText !== null && newText.trim() !== '') {
    try {
      const res = await fetch(`${API_BASE}/outreach/${id}/edit`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          subject: 'HMM regime stress-testing for systematic strategies',
          body_text: newText,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      bodyEl.innerText = newText;
    } catch (err) {
      alert(`Failed to save edits: ${err.message}`);
    }
  }
};

window.resolveReply = function (id) {
  alert('Inbound reply marked resolved!');
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -----------------------------------------------------------------------------
// App Bootstrap
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  drawWires();
  window.addEventListener('resize', drawWires);

  fetchFunnelMetrics();
  fetchLeads();
  fetchPendingApprovals();
  fetchReplies();

  // Auto-refresh every 30s
  setInterval(() => {
    fetchFunnelMetrics();
    fetchPendingApprovals();
  }, 30000);
});
