
const roleMap = {
  admin: '/console/',
  admissions: '/admissions/',
  faculty: '/faculty/',
  parent: '/parents/',
  student: '/students/',
  finance: '/finance/'
};

function pathNormalize(path){
  if(!path) return '/';
  const cleaned = path.replace(/index\.html$/, '');
  return cleaned.endsWith('/') ? cleaned : cleaned + '/';
}

function currentRoute(){
  const match = window.location.pathname.match(/\/(login|console|admissions|students|parents|faculty|finance|transport|communications|reports|settings|fault-desk|sitemap)(\/|$)/);
  return match ? `/${match[1]}/` : '/';
}

function sitePrefix(){
  return currentRoute() === '/' ? '' : '../';
}

function markActiveNav(){
  const links = document.querySelectorAll('[data-nav-path]');
  const current = currentRoute();
  links.forEach(link => {
    const target = pathNormalize(link.getAttribute('data-nav-path'));
    if(current === target || (target !== '/' && current.startsWith(target))){
      link.classList.add('active');
    }
  });
}

function setupLogin(){
  const form = document.querySelector('[data-login-form]');
  const roleCards = document.querySelectorAll('[data-role-card]');
  const roleInput = document.querySelector('[name="role"]');
  if(!form || !roleInput) return;

  function syncCredentials(role){
    const email = form.querySelector('input[type="email"]');
    const password = form.querySelector('input[type="password"]');
    const credentials = {
      admin:['admin@samvida-demo.com','Samvida@123'],
      admissions:['admissions@samvida-demo.com','Admit@123'],
      faculty:['faculty@samvida-demo.com','Faculty@123'],
      parent:['parent@samvida-demo.com','Parent@123'],
      student:['student@samvida-demo.com','Student@123'],
      finance:['finance@samvida-demo.com','Finance@123']
    };
    const pair = credentials[role] || credentials.admin;
    if(email) email.value = pair[0];
    if(password) password.value = pair[1];
  }

  function selectRole(value){
    roleInput.value = value;
    roleCards.forEach(card => {
      card.classList.toggle('selected', card.dataset.roleCard === value);
    });
    syncCredentials(value);
  }

  roleCards.forEach(card => {
    card.addEventListener('click', () => selectRole(card.dataset.roleCard));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const role = roleInput.value || 'admin';
    const destination = relativeLink(roleMap[role] || '/console/');
    window.location.href = destination;
  });

  selectRole(roleInput.value || 'admin');
}

function setupTabs(){
  document.querySelectorAll('[data-tabs]').forEach(group => {
    const buttons = group.querySelectorAll('[data-tab-button]');
    const panels = group.parentElement.querySelectorAll('[data-tab-panel]');
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.dataset.tabButton;
        buttons.forEach(btn => btn.classList.toggle('active', btn === button));
        panels.forEach(panel => panel.classList.toggle('active', panel.dataset.tabPanel === target));
      });
    });
  });
}

function relativeLink(target){
  const prefix = sitePrefix();
  return prefix + target.replace(/^\//, '');
}

let tooltipEl;
function ensureTooltip(){
  if(!tooltipEl){
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip-bubble';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function positionTooltip(event){
  const tip = ensureTooltip();
  const offset = 16;
  let x = event.clientX + offset;
  let y = event.clientY + offset;
  const maxX = window.innerWidth - tip.offsetWidth - 12;
  const maxY = window.innerHeight - tip.offsetHeight - 12;
  if(x > maxX) x = maxX;
  if(y > maxY) y = event.clientY - tip.offsetHeight - 12;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}

function attachTooltips(){
  const elements = document.querySelectorAll('[data-tooltip]');
  if(!elements.length) return;
  const show = (el, event) => {
    const tip = ensureTooltip();
    tip.textContent = el.dataset.tooltip;
    tip.classList.add('visible');
    positionTooltip(event);
  };
  const hide = () => {
    if(tooltipEl) tooltipEl.classList.remove('visible');
  };
  elements.forEach(el => {
    el.addEventListener('mouseenter', event => show(el, event));
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', hide);
    el.addEventListener('focus', event => show(el, event));
    el.addEventListener('blur', hide);
  });
}

let toastStack;
function ensureToastStack(){
  if(!toastStack){
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    document.body.appendChild(toastStack);
  }
  return toastStack;
}

function showToast(title, message){
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  stack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 220);
  }, 2600);
}

function setupToggles(){
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('tabindex', '0');
    toggle.setAttribute('aria-checked', toggle.classList.contains('on') ? 'true' : 'false');
    const row = toggle.closest('.toggle-row, .preview-setting');
    let label = 'Setting';
    if(row){
      const strong = row.querySelector('strong');
      if(strong) label = strong.textContent.trim();
      else {
        const first = row.querySelector('span, div');
        if(first) label = first.textContent.trim().replace(/\s+/g,' ');
      }
    }
    const activate = () => {
      toggle.classList.toggle('on');
      const enabled = toggle.classList.contains('on');
      toggle.setAttribute('aria-checked', enabled ? 'true' : 'false');
      showToast(enabled ? 'Setting enabled' : 'Setting disabled', `${label} updated for the walkthrough preview.`);
    };
    toggle.addEventListener('click', activate);
    toggle.addEventListener('keydown', event => {
      if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        activate();
      }
    });
  });
}

function setupSearch(){
  document.querySelectorAll('.search input').forEach(input => {
    input.addEventListener('keydown', event => {
      if(event.key === 'Enter'){
        event.preventDefault();
        const value = input.value.trim();
        showToast('Search preview', value ? `Showing where “${value}” would surface in the live product.` : 'Use the sidebar to open the main journeys in this demonstration.');
      }
    });
  });
}

function setupIconButtons(){
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Activity center', 'Notifications, approvals, and reminders would appear here in the live product.');
    });
  });
}

function guideConfig(){
  const current = currentRoute();
  const common = {
    title: 'Walkthrough guide',
    intro: 'Use this page to tell a clear, business-friendly product story.',
    steps: [
      'Start with the top panel to frame the operational problem this screen solves.',
      'Use one or two visible interactions so the audience feels the product is responsive.',
      'Move to the suggested next screen while keeping the same student, parent, or campus story alive.'
    ],
    links: [
      {label: 'Administrator console', href: '/console/'},
      {label: 'Admissions', href: '/admissions/'},
      {label: 'Parent app', href: '/parents/'}
    ],
    meta: 'Tip: keep the story role-based. Buyers remember outcomes more than menus.'
  };
  const map = {
    '/': {
      title: 'Executive overview',
      intro: 'This page works best as the opening scene for trustees, school leaders, and operations heads.',
      steps: [
        'Start with the “real problems, visible solutions” section to anchor the business value.',
        'Use the complete demo map to choose the next journey based on the audience: admissions, finance, parent, or operations.',
        'Close on the module preview to show that the ERP is broad but still easy to navigate.'
      ],
      links: [
        {label: 'Open administrator console', href: '/console/'},
        {label: 'Open admissions console', href: '/admissions/'},
        {label: 'View demo access', href: '/login/'}
      ],
      meta: 'Best opener for leadership conversations and product introductions.'
    },
    '/console/': {
      title: 'Administrator story',
      intro: 'Use this page to show that school leadership can monitor academics, admissions, finance, and operations from one calm workspace.',
      steps: [
        'Read the KPI row first and explain how leaders get a quick operational pulse.',
        'Move to admissions funnel and AI insights to show guided prioritization.',
        'Use quick launch to drill into the next role-specific journey.'
      ],
      links: [
        {label: 'Open admissions console', href: '/admissions/'},
        {label: 'Open configuration center', href: '/settings/'},
        {label: 'Open reports', href: '/reports/'}
      ],
      meta: 'Great page for principals, COO-style roles, and school groups managing multiple functions.'
    },
    '/admissions/': {
      title: 'Admissions story',
      intro: 'Show how enquiry-to-enrollment moves through one guided pipeline with fewer missed follow-ups.',
      steps: [
        'Walk the pipeline counts first so the audience immediately sees the conversion funnel.',
        'Use the form preview to explain grade-specific forms and document capture.',
        'Close on offer readiness and next-step actions.'
      ],
      links: [
        {label: 'Open administrator console', href: '/console/'},
        {label: 'Open configuration center', href: '/settings/'},
        {label: 'Open parent app', href: '/parents/'}
      ],
      meta: 'Strong for school groups that feel admissions leakage or slow manual follow-up.'
    },
    '/settings/': {
      title: 'Configuration story',
      intro: 'This page proves the product is governable. It should feel controlled and easy, not deeply technical.',
      steps: [
        'Start with campus structure and explain that these rules power every downstream module.',
        'Click one or two policy switches so the page feels interactive during the demo.',
        'Use the role matrix and suggested next clicks to move into Finance, Parent App, or Fault Desk.'
      ],
      links: [
        {label: 'Open finance console', href: '/finance/'},
        {label: 'Open parent app', href: '/parents/'},
        {label: 'Open fault desk', href: '/fault-desk/'}
      ],
      meta: 'Especially useful for trustees, principals, finance heads, and operations leaders.'
    },
    '/finance/': {
      title: 'Finance story',
      intro: 'Use this page to show clear fee visibility, policy-led collections, and parent-friendly payment journeys.',
      steps: [
        'Open with collection health and installment visibility.',
        'Use the policy controls to show how finance settings shape the parent experience.',
        'Close with receipts, waivers, and reminders as operational simplifiers.'
      ],
      links: [
        {label: 'Open parent app', href: '/parents/'},
        {label: 'Open configuration center', href: '/settings/'},
        {label: 'Open reports', href: '/reports/'}
      ],
      meta: 'Ideal for accounts teams and school groups focused on fee collection discipline.'
    },
    '/parents/': {
      title: 'Parent experience story',
      intro: 'This page should feel simple, trustworthy, and action-oriented. Parents should know what to do immediately.',
      steps: [
        'Point out the action center and daily clarity around fees, approvals, and transport.',
        'Show how meeting requests and consent flows reduce front-desk calls.',
        'Explain how the same policies shown in Configuration shape what parents see here.'
      ],
      links: [
        {label: 'Open finance console', href: '/finance/'},
        {label: 'Open transport', href: '/transport/'},
        {label: 'Open communications hub', href: '/communications/'}
      ],
      meta: 'Strong page for PTA groups, parent committees, and school leadership focused on service quality.'
    },
    '/students/': {
      title: 'Student experience story',
      intro: 'Use this page to show a focused learning dashboard rather than a cluttered ERP portal.',
      steps: [
        'Open with timetable, homework, and assessment clarity.',
        'Call out attendance, learning tasks, and study support as daily student needs.',
        'Connect the experience back to faculty workflows and configuration choices.'
      ],
      links: [
        {label: 'Open faculty app', href: '/faculty/'},
        {label: 'Open reports', href: '/reports/'},
        {label: 'Open overview', href: '/'}
      ],
      meta: 'Useful when presenting to academic leadership or product-minded school groups.'
    },
    '/faculty/': {
      title: 'Faculty workflow story',
      intro: 'Faculty should feel that one workspace covers class preparation, attendance, grading, and communication.',
      steps: [
        'Start with timetable-to-class action flow.',
        'Show how attendance, lesson planning, and grading stay connected.',
        'Finish with the approval rules that keep faculty work governed but not slowed down.'
      ],
      links: [
        {label: 'Open student app', href: '/students/'},
        {label: 'Open communications hub', href: '/communications/'},
        {label: 'Open configuration center', href: '/settings/'}
      ],
      meta: 'This page lands well with academic coordinators and teacher-facing decision makers.'
    },
    '/transport/': {
      title: 'Transport operations story',
      intro: 'Use this page to show that route communication and pickup visibility are treated as critical operations.',
      steps: [
        'Highlight route delays and parent notifications first.',
        'Show how approvals and temporary stop requests are managed.',
        'Connect route incidents to the fault desk or communications hub.'
      ],
      links: [
        {label: 'Open parent app', href: '/parents/'},
        {label: 'Open fault desk', href: '/fault-desk/'},
        {label: 'Open communications hub', href: '/communications/'}
      ],
      meta: 'Strong for operations-heavy schools or institutions with transport complexity.'
    },
    '/communications/': {
      title: 'Communications story',
      intro: 'Demonstrate how schools can move from fragmented messaging to approved, trackable communication.',
      steps: [
        'Open with channel mix and audience control.',
        'Use approval and translation controls to show governance.',
        'Close with engagement signals and escalation rules.'
      ],
      links: [
        {label: 'Open parent app', href: '/parents/'},
        {label: 'Open administrator console', href: '/console/'},
        {label: 'Open configuration center', href: '/settings/'}
      ],
      meta: 'Great for explaining trust, policy, and parent engagement in the same story.'
    },
    '/reports/': {
      title: 'Reporting story',
      intro: 'Use reporting to show that the ERP is not just operational—it also supports leadership decisions.',
      steps: [
        'Show the most decision-ready reports first: fees, admissions, attendance, and incidents.',
        'Point out that every chart is grounded in the same school data story.',
        'Finish by returning to the console or configuration center for actionability.'
      ],
      links: [
        {label: 'Open administrator console', href: '/console/'},
        {label: 'Open finance console', href: '/finance/'},
        {label: 'Open overview', href: '/'}
      ],
      meta: 'Useful for leadership teams who care about outcomes and governance.'
    },
    '/fault-desk/': {
      title: 'Fault desk story',
      intro: 'This page shows that facilities and incident workflows are treated as first-class operations.',
      steps: [
        'Start with issue categories, SLA, and assignment visibility.',
        'Show how evidence-based closure improves accountability.',
        'Connect the workflow back to configuration and communications.'
      ],
      links: [
        {label: 'Open configuration center', href: '/settings/'},
        {label: 'Open administrator console', href: '/console/'},
        {label: 'Open transport', href: '/transport/'}
      ],
      meta: 'Strong differentiator when schools care about campus operations and service quality.'
    }
  };
  return map[current] || common;
}

function setupDemoGuide(){
  const guide = guideConfig();
  const overlay = document.createElement('div');
  overlay.className = 'demo-guide-overlay';
  const panel = document.createElement('aside');
  panel.className = 'demo-guide-panel';
  panel.innerHTML = `
    <div class="row" style="align-items:flex-start">
      <div>
        <div class="eyebrow">Walkthrough guide</div>
        <h3>${guide.title}</h3>
      </div>
      <button class="icon-btn" type="button" aria-label="Close walkthrough">×</button>
    </div>
    <p>${guide.intro}</p>
    <div class="demo-guide-list">
      ${guide.steps.map((step, index) => `<div class="demo-guide-item"><strong>Step ${index + 1}</strong>${step}</div>`).join('')}
    </div>
    <div class="demo-guide-links">
      ${guide.links.map(link => `<a href="${relativeLink(link.href)}"><span>${link.label}</span><span>→</span></a>`).join('')}
    </div>
    <div class="demo-guide-meta">${guide.meta}</div>
  `;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'demo-guide-btn';
  button.innerHTML = '<span>?</span> Walkthrough';

  const close = () => {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  };
  const open = () => {
    panel.classList.add('open');
    overlay.classList.add('open');
  };
  button.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
  overlay.addEventListener('click', close);
  panel.querySelector('.icon-btn').addEventListener('click', close);
  document.body.append(overlay, panel, button);
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  setupLogin();
  setupTabs();
  attachTooltips();
  setupToggles();
  setupSearch();
  setupIconButtons();
  setupDemoGuide();
});
