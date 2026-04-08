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
  return path.endsWith('/') ? path : path + '/';
}

function markActiveNav(){
  const links = document.querySelectorAll('[data-nav-path]');
  const current = pathNormalize(window.location.pathname.replace(/index\.html$/, ''));
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

  function selectRole(value){
    roleInput.value = value;
    roleCards.forEach(card => {
      card.classList.toggle('selected', card.dataset.roleCard === value);
    });
  }

  roleCards.forEach(card => {
    card.addEventListener('click', () => selectRole(card.dataset.roleCard));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const role = roleInput.value || 'admin';
    const destination = roleMap[role] || '/console/';
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

function attachTooltips(){
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.title = el.dataset.tooltip;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
  setupLogin();
  setupTabs();
  attachTooltips();
});