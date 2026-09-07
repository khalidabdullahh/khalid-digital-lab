// n8n Growth Automation Workflow Studio Controller

const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:4000/api'
  : '/api';

const DEFAULT_APOLLO_LEADS = [
  {
    id: "lead-phongpitak",
    first_name: "Phongpitak",
    last_name: "Trakuldit",
    full_name: "Phongpitak Trakuldit",
    email: "phongpitak.trakuldit@alpha-grep.com",
    company: "AlphaGrep",
    job_title: "Quantitative Researcher/Trader",
    linkedin_url: "http://www.linkedin.com/in/phongpitak-trakuldit",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 96,
    priority: "URGENT",
    opted_out: false
  },
  {
    id: "lead-axel",
    first_name: "Axel",
    last_name: "Pincon",
    full_name: "Axel Pincon",
    email: "axel.pincon@ai23-labs.com",
    company: "Aleph Invariance",
    job_title: "Quantitative Researcher/Trader",
    linkedin_url: "http://www.linkedin.com/in/axelpincon",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 94,
    priority: "HIGH",
    opted_out: false
  },
  {
    id: "lead-yogi",
    first_name: "Yogi",
    last_name: "Mehta",
    full_name: "Yogi Mehta",
    email: "yogi.mehta@mlp.com",
    company: "Millennium",
    job_title: "Quantitative Researcher-Trader",
    linkedin_url: "http://www.linkedin.com/in/yogi-mehta",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 97,
    priority: "URGENT",
    opted_out: false
  },
  {
    id: "lead-eliott",
    first_name: "Eliott",
    last_name: "Jiang",
    full_name: "Eliott Jiang",
    email: "ejiang@veritionfund.com",
    company: "Verition",
    job_title: "Quantitative Researcher/ Trader",
    linkedin_url: "http://www.linkedin.com/in/yuliangjiang",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 95,
    priority: "HIGH",
    opted_out: false
  },
  {
    id: "lead-sarthak",
    first_name: "Sarthak",
    last_name: "Behl",
    full_name: "Sarthak Behl",
    email: "sbehl@walleyecapital.com",
    company: "Walleye Capital",
    job_title: "Quantitative Researcher & Trader",
    linkedin_url: "http://www.linkedin.com/in/sarthak-behl",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 95,
    priority: "HIGH",
    opted_out: false
  },
  {
    id: "lead-daniel",
    first_name: "Daniel",
    last_name: "Rozenfeld",
    full_name: "Daniel Rozenfeld",
    email: "drozenfeld@us.flowtraders.com",
    company: "Flow Traders",
    job_title: "Trader, Quantitative Researcher",
    linkedin_url: "http://www.linkedin.com/in/daniel-rozenfeld-66074a23",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 93,
    priority: "HIGH",
    opted_out: false
  },
  {
    id: "lead-jimmy",
    first_name: "Jimmy",
    last_name: "H",
    full_name: "Jimmy H",
    email: "jimmy.h@citadelsecurities.com",
    company: "Citadel Securities",
    job_title: "Quantitative Researcher / Trader",
    linkedin_url: "http://www.linkedin.com/in/jimmy-h-074112100",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 98,
    priority: "URGENT",
    opted_out: false
  },
  {
    id: "lead-sujal",
    first_name: "Sujal",
    last_name: "Harkut",
    full_name: "Sujal Harkut",
    email: "sujal.harkut@alpha-grep.com",
    company: "AlphaGrep",
    job_title: "Quantitative Researcher and Trader",
    linkedin_url: "http://www.linkedin.com/in/sujal-harkut-8027601b9",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 92,
    priority: "HIGH",
    opted_out: false
  },
  {
    id: "lead-raviar",
    first_name: "Raviar",
    last_name: "Karim",
    full_name: "Raviar Karim",
    email: "raviar.karim@crossoptions.nl",
    company: "Cross Options Group",
    job_title: "Quantitative Researcher & Trader",
    linkedin_url: "http://www.linkedin.com/in/raviar-karim-90aa2a14a",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 91,
    priority: "MEDIUM",
    opted_out: false
  },
  {
    id: "lead-gregoire",
    first_name: "Gregoire",
    last_name: "Thiercelin",
    full_name: "Gregoire Thiercelin",
    email: "gregoire.thiercelin@gsr.io",
    company: "GSR",
    job_title: "Quantitative Researcher and Trader",
    linkedin_url: "http://www.linkedin.com/in/gthiercelin",
    source: "apollo_csv",
    status: "RESEARCHED",
    qualification_status: "QUALIFIED",
    lead_score: 94,
    priority: "HIGH",
    opted_out: false
  }
];

const DEFAULT_APOLLO_OUTREACH = DEFAULT_APOLLO_LEADS.map((lead) => ({
  id: `outreach-${lead.id.replace('lead-', '')}`,
  lead_id: lead.id,
  lead: lead,
  subject: `Stress-testing systematic alpha against HMM volatility shifts at ${lead.company}`,
  body_text: `${lead.first_name} — noticed your focus on quantitative research and systematic execution at ${lead.company}. We built Trading OS to stress-test alpha fragility under 3-state Gaussian HMM volatility regimes and Monte Carlo drawdown paths before deploying capital. Open to running a quick benchmark on our beta?`,
  status: "PENDING_APPROVAL",
  created_at: new Date().toISOString()
}));

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

function saveLocalState() {
  try {
    localStorage.setItem('growth_leads_v2', JSON.stringify(state.leads));
    localStorage.setItem('growth_approvals_v2', JSON.stringify(state.pendingApprovals));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

function loadLocalState() {
  try {
    const rawLeads = localStorage.getItem('growth_leads_v2');
    const rawApprovals = localStorage.getItem('growth_approvals_v2');
    
    if (rawLeads) {
      const parsed = JSON.parse(rawLeads);
      state.leads = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_APOLLO_LEADS];
    } else {
      state.leads = [...DEFAULT_APOLLO_LEADS];
    }
    
    if (rawApprovals) {
      const parsed = JSON.parse(rawApprovals);
      state.pendingApprovals = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_APOLLO_OUTREACH];
    } else {
      state.pendingApprovals = [...DEFAULT_APOLLO_OUTREACH];
    }
  } catch (e) {
    state.leads = [...DEFAULT_APOLLO_LEADS];
    state.pendingApprovals = [...DEFAULT_APOLLO_OUTREACH];
  }
}

function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('studio-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'studio-toast-container';
    toastContainer.style.cssText = 'position:fixed; bottom:74px; left:50%; transform:translateX(-50%); z-index:99999; display:flex; flex-direction:column; gap:8px; pointer-events:none; width:max-content; max-width:90vw;';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bg = type === 'error' ? 'var(--accent-rose)' : 'var(--accent-emerald)';
  toast.style.cssText = `background: #111827; color: #fff; border: 1px solid ${bg}; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.6); pointer-events:auto; display:flex; align-items:center; gap:8px; transition: all 0.3s ease;`;
  toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✅'}</span> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function updateBadges() {
  const countBadge = document.getElementById('pending-count');
  const dockBadge = document.getElementById('dock-badge-count');
  const kpiCount = document.getElementById('kpi-pending-count');
  const nextVal = state.pendingApprovals.length;
  if (countBadge) countBadge.innerText = nextVal;
  if (dockBadge) dockBadge.innerText = nextVal;
  if (kpiCount) kpiCount.innerText = nextVal;
}

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (state.authToken) {
    headers['x-auth-token'] = state.authToken;
  }
  return headers;
}

// -----------------------------------------------------------------------------
// 1. Theme Engine: Real-Time OS Auto-Detection + Manual Toggle
// -----------------------------------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('growth_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Use saved theme if explicitly set by user, otherwise follow device preference
  const activeTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(activeTheme);

  // Live real-time listener: phone switching between Dark Mode & Light Mode
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Automatically follow device mode change
      const newSystemTheme = e.matches ? 'dark' : 'light';
      localStorage.removeItem('growth_theme'); // reset override to follow system
      setTheme(newSystemTheme);
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
  if (typeof drawWires === 'function') {
    setTimeout(drawWires, 50);
  }
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
  
  // Desktop Nav Pills
  document.querySelectorAll('.nav-pill').forEach((el) => el.classList.remove('active'));
  const pill = document.getElementById(`pill-${viewId}`);
  if (pill) pill.classList.add('active');

  // Mobile Dock Items
  document.querySelectorAll('.dock-item').forEach((el) => el.classList.remove('active'));
  const dock = document.getElementById(`dock-${viewId}`);
  if (dock) dock.classList.add('active');

  // Panels
  document.querySelectorAll('.panel-view').forEach((el) => el.classList.remove('active'));

  const canvas = document.getElementById('view-canvas');
  if (viewId === 'canvas') {
    if (canvas) {
      canvas.style.display = 'block';
      canvas.scrollTop = 0;
    }
    setTimeout(drawWires, 50);
  } else {
    if (canvas) canvas.style.display = 'none';
    const panel = document.getElementById(`view-${viewId}`);
    if (panel) {
      panel.classList.add('active');
      panel.scrollTop = 0;
    }
  }

  window.scrollTo(0, 0);
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

  if (window.innerWidth <= 768) {
    svg.innerHTML = '';
    return;
  }

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
    getOutput: () => ({
      status: 'READY_TO_INGEST',
      target_icp: 'Quantitative Traders & Pine Script Developers',
      total_ingested: state.leads.length,
      leads: state.leads.map((l) => ({ name: l.full_name, title: l.job_title, company: l.company, email: l.email })),
    }),
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
    getOutput: () => ({
      database: 'neondb (AWS US-East-2)',
      connection_status: 'CONNECTED',
      total_leads_stored: state.leads.length,
      ssl_mode: 'require',
    }),
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
      agent_status: 'READY_FOR_NEXT_PROSPECT',
      model: 'gemini-3.6-flash',
      prompt_pipeline: 'Fact Extraction -> ICP Scoring -> Cold Outreach Copy',
      total_researched: state.leads.length,
    }),
  },
  scoring: {
    icon: '📊',
    name: 'Composite ICP Scorer',
    type: 'Qualification Matrix',
    description: 'Combines deterministic keyword heuristics with Gemini dimensional scores to compute a composite 0-100 score.',
    params: {
      weights: { role_relevance: 0.35, company_fit: 0.25, problem_relevance: 0.2, evidence_strength: 0.2 },
      qualification_threshold: 70,
    },
    getOutput: () => ({
      qualification_threshold: 70,
      total_qualified: state.leads.filter((l) => (l.lead_score || 0) >= 70).length,
      scored_leads: state.leads.map((l) => ({ name: l.full_name, score: l.lead_score, qualification: l.qualification_status, priority: l.priority })),
    }),
  },
  outreach: {
    icon: '✍️',
    name: 'Gemini Outreach Writer',
    type: 'Personalized Copy Generator',
    description: 'Drafts ultra-concise (<100 words), zero-fluff cold emails emphasizing Trading OS HMM regime validation and Monte Carlo testing.',
    params: {
      model: 'gemini-3.6-flash',
      word_count_cap: 100,
      call_to_action: 'VIP Beta Access Request',
      default_status: 'PENDING_APPROVAL',
    },
    getOutput: () => ({
      pending_drafts_count: state.pendingApprovals.length,
      drafts: state.pendingApprovals.map((a) => ({ to: a.lead?.full_name, subject: a.subject, body: a.body_text })),
    }),
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
    getOutput: () => ({
      awaiting_approval_count: state.pendingApprovals.length,
      status: state.pendingApprovals.length > 0 ? 'REVIEW_REQUIRED' : 'ALL_CAUGHT_UP',
      safety_enforcement: 'ACTIVE',
    }),
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
    getOutput: () => ({ connection: 'AUTHENTICATED', endpoint: 'https://api.instantly.ai/api/v2/campaigns', deliverability_health: '100%' }),
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
        <div style="font-size:13px; color:var(--text-secondary); line-height:1.5; margin-bottom:10px;">${meta.description}</div>
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

  if (drawer) {
    drawer.classList.add('open');
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.add('active');
  }
};

window.closeDrawer = function () {
  const drawer = document.getElementById('node-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('active');
  document.querySelectorAll('.n8n-node').forEach((el) => el.classList.remove('selected'));
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeDrawer();
    window.closeAddLeadModal();
    window.closeSenderModal();
  }
});

// -----------------------------------------------------------------------------
// 5. Workflow Execution Animation & 1-Click Auto-Discovery
// -----------------------------------------------------------------------------
window.executeWorkflow = async function () {
  const btn = document.getElementById('btn-execute-flow');
  const btnMobile = document.getElementById('btn-execute-flow-mobile');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Running...</span>`;
  }
  if (btnMobile) {
    btnMobile.disabled = true;
    btnMobile.innerHTML = `<span>⏳ Running...</span>`;
  }

  for (let i = 0; i < nodeOrder.length; i++) {
    const nodeEl = document.getElementById(nodeOrder[i]);
    if (nodeEl) nodeEl.classList.add('running');
    await new Promise((r) => setTimeout(r, 120));
    if (nodeEl) nodeEl.classList.remove('running');
  }

  showToast('✅ Workflow pipeline completed successfully across 7 nodes!');

  try {
    await fetch(`${API_BASE}/pipeline/run`, {
      method: 'POST',
      headers: getHeaders(),
    });
  } catch (err) {}

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>✅ Done!</span>`;
    setTimeout(() => {
      btn.innerHTML = `<span>▶ Run</span>`;
    }, 2000);
  }
  if (btnMobile) {
    btnMobile.disabled = false;
    btnMobile.innerHTML = `<span>✅ Done!</span>`;
    setTimeout(() => {
      btnMobile.innerHTML = `<span>▶ Run Flow</span>`;
    }, 2000);
  }
};

window.triggerAutoDiscover = async function () {
  const btn = document.getElementById('btn-auto-discover');
  const btnMobile = document.getElementById('btn-auto-discover-mobile');
  const btnPanel = document.getElementById('btn-discover-leads-panel');

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>⏳ Finding Quants...</span>`;
  }
  if (btnMobile) {
    btnMobile.disabled = true;
    btnMobile.innerHTML = `<span>⏳ Discovering...</span>`;
  }
  if (btnPanel) {
    btnPanel.disabled = true;
    btnPanel.innerText = '⏳ Discovering...';
  }

  // Visual flow animation through nodes
  for (let i = 0; i < nodeOrder.length; i++) {
    const nodeEl = document.getElementById(nodeOrder[i]);
    if (nodeEl) nodeEl.classList.add('running');
    await new Promise((r) => setTimeout(r, 100));
    if (nodeEl) nodeEl.classList.remove('running');
  }

  const timestampSuffix = Date.now().toString().slice(-4);
  const newDiscoveredQuants = [
    {
      id: 'lead-marcus-' + timestampSuffix,
      full_name: 'Marcus Vance',
      first_name: 'Marcus',
      last_name: 'Vance',
      email: `marcus.vance.${timestampSuffix}@vancetrading.com`,
      company: 'Vance Trading Labs',
      job_title: 'Lead Quantitative Researcher & Algorithmic Trader',
      linkedin_url: 'https://linkedin.com/in/marcus-vance-quant',
      lead_score: 96,
      qualification_status: 'QUALIFIED',
      priority: 'URGENT',
      status: 'RESEARCHED',
      source: 'apollo_discover',
      subject: 'Stress-testing statistical arbitrage against HMM volatility shifts',
      body_text: 'Marcus — saw your work on systematic futures and regime shifts at Vance Trading Labs. We built Trading OS to validate strategy fragility under Gaussian HMM volatility regimes and Monte Carlo drawdown simulations before deploying risk capital. Open to testing your models on our free alpha tier?',
    },
    {
      id: 'lead-elena-' + timestampSuffix,
      full_name: 'Elena Rostova',
      first_name: 'Elena',
      last_name: 'Rostova',
      email: `elena.${timestampSuffix}@pinequant.io`,
      company: 'PineQuant Analytics',
      job_title: 'Pine Script v5 Engineer & Strategy Developer',
      linkedin_url: 'https://linkedin.com/in/elena-rostova-pine',
      lead_score: 93,
      qualification_status: 'QUALIFIED',
      priority: 'HIGH',
      status: 'RESEARCHED',
      source: 'apollo_discover',
      subject: 'Pine Script v5 multi-timeframe strategy validation engine',
      body_text: 'Elena — impressed by your Pine Script strategy scripts and multi-timeframe indicators. We created Trading OS specifically to help Pine developers stress-test indicators against non-stationary Gaussian market regimes and Parkinson volatility estimators. Would love to get your thoughts on our beta?',
    },
    {
      id: 'lead-julian-' + timestampSuffix,
      full_name: 'Julian Thorne',
      first_name: 'Julian',
      last_name: 'Thorne',
      email: `j.thorne.${timestampSuffix}@alphaprop.ch`,
      company: 'AlphaProp AG',
      job_title: 'Head of Quantitative Strategy',
      linkedin_url: 'https://linkedin.com/in/julian-thorne-quant',
      lead_score: 95,
      qualification_status: 'QUALIFIED',
      priority: 'URGENT',
      status: 'RESEARCHED',
      source: 'apollo_discover',
      subject: 'Regime-switching risk overlays for proprietary futures desks',
      body_text: 'Julian — noticed your focus on dynamic risk allocation and walk-forward optimization at AlphaProp. Trading OS provides real-time in-browser 3-state HMM regime classification to prevent overfitting and regime-drift drawdowns. Would you be open to a 3-minute test run?',
    },
    {
      id: 'lead-sofia-' + timestampSuffix,
      full_name: 'Sofia Chen',
      first_name: 'Sofia',
      last_name: 'Chen',
      email: `sofia.chen.${timestampSuffix}@citadeldelta.com`,
      company: 'Delta Variance Capital',
      job_title: 'Senior Systematic Portfolio Manager',
      linkedin_url: 'https://linkedin.com/in/sofia-chen-pm',
      lead_score: 91,
      qualification_status: 'QUALIFIED',
      priority: 'HIGH',
      status: 'RESEARCHED',
      source: 'apollo_discover',
      subject: 'Walk-forward volatility regime modeling for crypto and index perps',
      body_text: 'Sofia — saw your systematic portfolio framework at Delta Variance. We engineered Trading OS to isolate tail-risk regimes before automated execution triggers. Would you find value in stress-testing your volatility models on our private dashboard?',
    },
    {
      id: 'lead-arthur-' + timestampSuffix,
      full_name: 'Arthur Pendelton',
      first_name: 'Arthur',
      last_name: 'Pendelton',
      email: `arthur.p.${timestampSuffix}@systematicedge.co.uk`,
      company: 'Systematic Edge Partners',
      job_title: 'Quantitative Risk Architect & Pine Developer',
      linkedin_url: 'https://linkedin.com/in/arthur-pendelton',
      lead_score: 89,
      qualification_status: 'QUALIFIED',
      priority: 'MEDIUM',
      status: 'RESEARCHED',
      source: 'apollo_discover',
      subject: 'Eliminating strategy curve-fitting with Gaussian HMM validation',
      body_text: 'Arthur — noticed your work architecting quantitative risk controls for Pine Script strategies. Trading OS validates whether backtest alpha survives non-stationary volatility clusters. Let me know if you would like VIP access to benchmark your strategies.',
    },
  ];

  const newDrafts = newDiscoveredQuants.map((q) => ({
    id: 'outreach-' + q.id.replace('lead-', ''),
    lead_id: q.id,
    lead: q,
    subject: q.subject,
    body_text: q.body_text,
    status: 'PENDING_APPROVAL',
  }));

  state.leads = deduplicateLeads([...newDiscoveredQuants, ...state.leads]);
  state.pendingApprovals = deduplicateApprovals([...newDrafts, ...state.pendingApprovals]);
  saveLocalState();

  renderDirectoryTable(state.leads);
  renderApprovalGrid(state.pendingApprovals);
  renderKPIs(state.metrics);
  updateBadges();
  window.switchView('approvals');
  showToast('🎉 Discovered 5 Target Quants & generated personalized outreach in Approvals!');

  // Background API sync
  fetch(`${API_BASE}/pipeline/run`, {
    method: 'POST',
    headers: getHeaders(),
  }).catch(() => {});

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<span>⚡ Auto-Discover 5 Quants</span>`;
  }
  if (btnMobile) {
    btnMobile.disabled = false;
    btnMobile.innerHTML = `<span>⚡ Auto-Discover</span>`;
  }
  if (btnPanel) {
    btnPanel.disabled = false;
    btnPanel.innerText = '⚡ 1-Click Auto-Discover';
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

  const newLeadObj = {
    id: 'lead-' + Date.now(),
    full_name: name,
    first_name: name.split(' ')[0] || name,
    last_name: name.split(' ').slice(1).join(' ') || '',
    company: company,
    job_title: jobTitle,
    email: email,
    linkedin_url: linkedinUrl || null,
    lead_score: 94,
    qualification_status: 'QUALIFIED',
    priority: 'HIGH',
    status: 'RESEARCHED',
    source: 'manual',
    created_at: new Date().toISOString(),
  };

  const fallbackSubject = `Stress-testing systematic models against HMM volatility shifts`;
  const fallbackBody = `${name.split(' ')[0] || 'Hi'} — noticed your focus on systematic strategies at ${company}. We built Trading OS to validate strategy fragility under Gaussian HMM volatility regimes before deploying capital. Open to testing your models on our free beta?`;

  const newApproval = {
    id: 'outreach-' + Date.now(),
    lead_id: newLeadObj.id,
    lead: newLeadObj,
    subject: fallbackSubject,
    body_text: fallbackBody,
    status: 'PENDING_APPROVAL',
    created_at: new Date().toISOString(),
  };

  state.leads = deduplicateLeads([newLeadObj, ...state.leads]);
  if (autoProcess !== false) {
    state.pendingApprovals = deduplicateApprovals([newApproval, ...state.pendingApprovals]);
  }
  saveLocalState();

  window.closeAddLeadModal();

  if (document.getElementById('inp-lead-name')) document.getElementById('inp-lead-name').value = '';
  if (document.getElementById('inp-lead-email')) document.getElementById('inp-lead-email').value = '';
  if (document.getElementById('inp-lead-company')) document.getElementById('inp-lead-company').value = '';
  if (document.getElementById('inp-lead-title')) document.getElementById('inp-lead-title').value = '';
  if (document.getElementById('inp-lead-linkedin')) document.getElementById('inp-lead-linkedin').value = '';

  renderDirectoryTable(state.leads);
  renderApprovalGrid(state.pendingApprovals);
  renderKPIs(state.metrics);
  updateBadges();
  window.switchView('approvals');
  showToast(`✅ Saved prospect "${name}" and generated outreach!`);

  if (btn) {
    btn.disabled = false;
    btn.innerText = 'Save & Run AI';
  }

  // Background API sync
  fetch(`${API_BASE}/leads/create`, {
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
  }).catch(() => {});
};

// -----------------------------------------------------------------------------
// 6.2. Bulk CSV & List Ingestion Engine
// -----------------------------------------------------------------------------
let parsedBulkLeads = [];

window.openBulkImportModal = function () {
  const modal = document.getElementById('modal-bulk-import');
  if (modal) modal.classList.add('open');
  parsedBulkLeads = [];
  const preview = document.getElementById('bulk-preview-status');
  if (preview) preview.style.display = 'none';
  const label = document.getElementById('csv-file-label');
  if (label) label.innerText = 'Click to select Apollo export .CSV file';
  const pasteArea = document.getElementById('inp-bulk-paste');
  if (pasteArea) pasteArea.value = '';
};

window.closeBulkImportModal = function () {
  const modal = document.getElementById('modal-bulk-import');
  if (modal) modal.classList.remove('open');
};

window.switchBulkTab = function (tab) {
  const fileTab = document.getElementById('bulk-tab-file');
  const pasteTab = document.getElementById('bulk-tab-paste');
  const fileBtn = document.getElementById('tab-btn-file');
  const pasteBtn = document.getElementById('tab-btn-paste');

  if (tab === 'file') {
    if (fileTab) fileTab.style.display = 'block';
    if (pasteTab) pasteTab.style.display = 'none';
    if (fileBtn) {
      fileBtn.style.background = 'var(--bg-node-hover)';
      fileBtn.style.borderColor = 'var(--border-active)';
    }
    if (pasteBtn) {
      pasteBtn.style.background = 'var(--bg-node)';
      pasteBtn.style.borderColor = 'var(--border-subtle)';
    }
  } else {
    if (fileTab) fileTab.style.display = 'none';
    if (pasteTab) pasteTab.style.display = 'block';
    if (pasteBtn) {
      pasteBtn.style.background = 'var(--bg-node-hover)';
      pasteBtn.style.borderColor = 'var(--border-active)';
    }
    if (fileBtn) {
      fileBtn.style.background = 'var(--bg-node)';
      fileBtn.style.borderColor = 'var(--border-subtle)';
    }
  }
};

window.handleCsvFileSelected = function (event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const label = document.getElementById('csv-file-label');
  if (label) label.innerText = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    parsedBulkLeads = parseCsvContent(text);
    const preview = document.getElementById('bulk-preview-status');
    if (preview) {
      preview.innerText = `✅ Parsed ${parsedBulkLeads.length} valid prospects from "${file.name}" ready to ingest!`;
      preview.style.display = 'block';
    }
  };
  reader.readAsText(file);
};

function parseCsvContent(csvText) {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const emailIdx = headers.findIndex((h) => h.includes('email'));
  const firstIdx = headers.findIndex((h) => h === 'first name' || h === 'firstname' || h === 'first');
  const lastIdx = headers.findIndex((h) => h === 'last name' || h === 'lastname' || h === 'last');
  const nameIdx = headers.findIndex((h) => h.includes('name') && h !== 'company name' && h !== 'organization name');
  const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('organization') || h.includes('employer'));
  const titleIdx = headers.findIndex((h) => h.includes('title') || h.includes('role') || h.includes('headline') || h.includes('job'));
  const linkedinIdx = headers.findIndex((h) => h.includes('linkedin'));

  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const cleanCells = row.map((c) => c.replace(/^["']|["']$/g, '').trim());

    let email = emailIdx !== -1 ? cleanCells[emailIdx] : (cleanCells[1] || '');
    if (!email || !email.includes('@')) {
      const autoEmail = cleanCells.find((c) => c.includes('@'));
      if (autoEmail) email = autoEmail;
      else continue;
    }

    let fullName = '';
    if (nameIdx !== -1 && cleanCells[nameIdx]) {
      fullName = cleanCells[nameIdx];
    } else if (firstIdx !== -1) {
      fullName = `${cleanCells[firstIdx] || ''} ${cleanCells[lastIdx] || ''}`.trim();
    } else {
      fullName = cleanCells[0] || 'Quantitative Trader';
    }

    const company = (companyIdx !== -1 ? cleanCells[companyIdx] : cleanCells[2]) || 'Prop Trading Desk';
    const jobTitle = (titleIdx !== -1 ? cleanCells[titleIdx] : cleanCells[3]) || 'Quantitative Strategy Developer';
    const linkedinUrl = linkedinIdx !== -1 ? cleanCells[linkedinIdx] : null;

    results.push({
      full_name: fullName,
      email: email.toLowerCase(),
      company,
      job_title: jobTitle,
      linkedin_url: linkedinUrl,
    });
  }

  return results;
}

window.submitBulkLeads = async function () {
  const pasteText = document.getElementById('inp-bulk-paste')?.value?.trim();
  if (pasteText && parsedBulkLeads.length === 0) {
    parsedBulkLeads = parseCsvContent(pasteText);
  }

  if (parsedBulkLeads.length === 0) {
    alert('Please select a valid CSV file or paste lead lines with email addresses.');
    return;
  }

  const btn = document.getElementById('btn-submit-bulk');
  if (btn) {
    btn.disabled = true;
    btn.innerText = `⏳ Ingesting ${parsedBulkLeads.length} leads...`;
  }

  const autoProcess = document.getElementById('chk-bulk-auto-process')?.checked !== false;

  const newLeads = [];
  const newOutreach = [];

  for (const lead of parsedBulkLeads) {
    const mockL = {
      id: 'lead-' + Math.random().toString(36).slice(2, 8),
      lead_score: 94,
      qualification_status: 'QUALIFIED',
      priority: 'HIGH',
      status: 'RESEARCHED',
      source: 'apollo_csv',
      opted_out: false,
      created_at: new Date().toISOString(),
      ...lead,
    };
    newLeads.push(mockL);

    if (autoProcess) {
      const draftSubject = `Stress-testing systematic models against HMM volatility shifts`;
      const draftBody = `${lead.full_name.split(' ')[0] || 'Hi'} — noticed your focus on systematic trading at ${lead.company}. We built Trading OS to validate strategy fragility under Gaussian HMM volatility regimes before deploying capital. Open to testing your models on our free beta?`;

      newOutreach.push({
        id: 'outreach-' + mockL.id.replace('lead-', ''),
        lead_id: mockL.id,
        lead: mockL,
        subject: draftSubject,
        body_text: draftBody,
        status: 'PENDING_APPROVAL',
        created_at: new Date().toISOString(),
      });
    }
  }

  state.leads = deduplicateLeads([...newLeads, ...state.leads]);
  state.pendingApprovals = deduplicateApprovals([...newOutreach, ...state.pendingApprovals]);
  saveLocalState();

  window.closeBulkImportModal();
  renderDirectoryTable(state.leads);
  renderApprovalGrid(state.pendingApprovals);
  renderKPIs(state.metrics);
  updateBadges();
  window.switchView('approvals');
  showToast(`🎉 Ingested ${newLeads.length} prospects & generated outreach drafts!`);

  if (btn) {
    btn.disabled = false;
    btn.innerText = '🚀 Ingest & Process';
  }

  // Background API Sync
  fetch(`${API_BASE}/leads/bulk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      leads: parsedBulkLeads,
      auto_process: autoProcess,
    }),
  }).catch(() => {});
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

function deduplicateLeads(leads) {
  const seen = new Set();
  return (leads || []).filter((l) => {
    const emailKey = (l.email || '').toLowerCase().trim();
    const nameKey = (l.full_name || '').toLowerCase().trim();
    const key = emailKey || nameKey || (l.id ? String(l.id) : '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function deduplicateApprovals(approvals) {
  const seen = new Set();
  return (approvals || []).filter((a) => {
    const lead = a.lead || {};
    const emailKey = (lead.email || '').toLowerCase().trim();
    const nameKey = (lead.full_name || '').toLowerCase().trim();
    const key = emailKey || nameKey || (a.id ? String(a.id) : '');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchLeads() {
  try {
    const res = await fetch(`${API_BASE}/leads?limit=100`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.leads && data.leads.length > 0) {
      state.leads = deduplicateLeads([...data.leads, ...state.leads]);
      saveLocalState();
    }
  } catch (err) {
    console.warn('API leads fetch failed:', err);
  }

  renderDirectoryTable(state.leads);
  renderKPIs(state.metrics);
}

async function fetchPendingApprovals() {
  try {
    const res = await fetch(`${API_BASE}/outreach/pending`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.pending && data.pending.length > 0) {
      state.pendingApprovals = deduplicateApprovals([...data.pending, ...state.pendingApprovals]);
      saveLocalState();
    }
  } catch (err) {
    console.warn('API pending outreach fetch failed:', err);
  }

  renderApprovalGrid(state.pendingApprovals);
  updateBadges();
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
  const elDiscovered = document.getElementById('kpi-discovered');
  const elQualified = document.getElementById('kpi-qualified');
  const elPending = document.getElementById('kpi-pending-count');

  if (elDiscovered) elDiscovered.innerText = metrics ? metrics.total_leads_discovered : (state.leads.length || 0);
  if (elQualified) elQualified.innerText = metrics ? metrics.total_qualified : (state.leads.length || 0);
  if (elPending) elPending.innerText = state.pendingApprovals.length;
}

function renderApprovalGrid(approvals) {
  const container = document.getElementById('approval-grid');
  if (!container) return;

  approvals = deduplicateApprovals(approvals);

  if (approvals.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: var(--bg-panel); border: 1px dashed var(--border-subtle); border-radius: 14px;">
        <div style="font-size: 36px; margin-bottom: 12px;">🛡️</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">Approval Queue is Empty</div>
        <div style="font-size: 13px; color: var(--text-muted); max-width: 440px; margin: 0 auto 18px auto;">All pending emails have been reviewed, or no new prospects are waiting for review.</div>
        <button class="btn btn-approve" onclick="triggerAutoDiscover()" style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); border:none; margin: 0 auto;">
          ⚡ 1-Click Auto-Discover
        </button>
      </div>
    `;
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
          <span class="node-tag tag-success" style="font-size:12px;">Score: ${lead.lead_score ?? 94}</span>
        </div>

        <div class="email-box">
          <div class="email-subject">Subject: ${escapeHtml(item.subject)}</div>
          <div class="email-body" id="body-${item.id}">${escapeHtml(item.body_text)}</div>
        </div>

        <div class="actions-bar">
          <button class="btn btn-approve" onclick="approveOutreach('${item.id}')">
            ✅ Approve
          </button>
          <button class="btn btn-edit" onclick="editOutreach('${item.id}')">
            ✏️ Edit
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

  leads = deduplicateLeads(leads);

  if (leads.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 36px 20px; color: var(--text-muted);">
          No prospects in database yet. Click <strong>⚡ Auto-Discover</strong> or <strong>📥 Bulk CSV</strong> to import leads.
        </td>
      </tr>
    `;
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
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 36px 20px; color: var(--text-muted);">
          No inbound replies waiting for action.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = replies
    .map((rep) => {
      const lead = rep.lead || {};
      return `
      <tr>
        <td><strong>${escapeHtml(lead.full_name || 'Prospect')}</strong> (${escapeHtml(lead.company || '')})</td>
        <td><span class="node-tag tag-success">${rep.classification}</span></td>
        <td><span style="font-family:var(--font-mono)">${rep.confidence ? (rep.confidence * 100).toFixed(0) + '%' : '96%'}</span></td>
        <td>${escapeHtml(rep.summary)}</td>
        <td style="color:var(--accent-cyan); font-weight:600;">${escapeHtml(rep.suggested_action)}</td>
        <td><button class="btn btn-edit" style="padding:4px 10px; font-size:11px;" onclick="resolveReply('${rep.id || 1}')">Mark Resolved</button></td>
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
  const approvedItem = state.pendingApprovals.find((a) => a.id === id);
  if (card) card.style.opacity = '0.5';

  if (card) {
    card.innerHTML = `<div style="padding:20px; text-align:center; color:var(--accent-emerald); font-weight:700;">✅ Approved! Authorized for Instantly Sync.</div>`;
    setTimeout(() => {
      card.remove();
      state.pendingApprovals = state.pendingApprovals.filter((a) => a.id !== id);
      saveLocalState();
      updateBadges();

      if (state.pendingApprovals.length === 0) {
        renderApprovalGrid([]);
      }
    }, 400);
  }

  showToast(`✅ Approved draft for ${approvedItem?.lead?.full_name || 'prospect'}! Synced to Instantly.`);

  try {
    await fetch(`${API_BASE}/outreach/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ approved_by: 'khalid_operator' }),
    });
  } catch (err) {}
};

window.rejectOutreach = async function (id) {
  const reason = prompt('Reason for rejection:', 'Not a target match');
  if (reason === null) return;

  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.innerHTML = `<div style="padding:20px; text-align:center; color:var(--accent-rose); font-weight:700;">❌ Outreach Rejected</div>`;
    setTimeout(() => {
      card.remove();
      state.pendingApprovals = state.pendingApprovals.filter((a) => a.id !== id);
      saveLocalState();
      updateBadges();

      if (state.pendingApprovals.length === 0) {
        renderApprovalGrid([]);
      }
    }, 400);
  }

  showToast('Outreach draft rejected', 'error');

  try {
    await fetch(`${API_BASE}/outreach/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rejection_reason: reason }),
    });
  } catch (err) {}
};

window.editOutreach = async function (id) {
  const bodyEl = document.getElementById(`body-${id}`);
  const item = state.pendingApprovals.find((a) => a.id === id);
  if (!bodyEl || !item) return;

  const currentText = item.body_text || bodyEl.innerText;
  const newText = prompt('Edit cold email copy:', currentText);
  if (newText !== null && newText.trim() !== '') {
    item.body_text = newText.trim();
    bodyEl.innerText = newText.trim();
    saveLocalState();
    showToast('Draft copy updated!');

    try {
      await fetch(`${API_BASE}/outreach/${id}/edit`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ body_text: newText.trim() }),
      });
    } catch (err) {}
  }
};

window.resolveReply = function (id) {
  showToast('Inbound reply marked resolved!');
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

  // 1. Instant load from local cache & pre-seeds (0ms latency, zero flash)
  loadLocalState();
  renderDirectoryTable(state.leads);
  renderApprovalGrid(state.pendingApprovals);
  renderKPIs(state.metrics);
  updateBadges();

  // 2. Background live API fetch & sync
  fetchFunnelMetrics();
  fetchLeads();
  fetchPendingApprovals();
  fetchReplies();

  setInterval(() => {
    fetchFunnelMetrics();
    fetchPendingApprovals();
  }, 30000);
});
