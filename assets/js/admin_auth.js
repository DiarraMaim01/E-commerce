// helpers -----------------------------------------------------
function makeErrorUi(form) {
  let box = form.querySelector('.error-messages');
  if (!box) {
    box = document.createElement('div');
    box.className = 'error-messages';
    box.style.color = '#b71c1c';
    box.style.margin = '8px 0';
    form.prepend(box);
  }
  const showErrors = (msgs) => {
    if (!Array.isArray(msgs)) msgs = [String(msgs || 'Erreur inconnue')];
    box.innerHTML = msgs.map(m => `<div>❌ ${m}</div>`).join('');
  };
  const clearErrors = () => { box.innerHTML = ''; };
  return { showErrors, clearErrors };
}

function validateEmail(email) {
  const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return rx.test(email);
}

// INSCRIPTION ADMIN ------------------------------------------
async function initAdminRegister() {
  const form = document.getElementById('AdminRegister-form');
  if (!form) return;

  const { showErrors, clearErrors } = makeErrorUi(form);
  const email    = form.querySelector('#email');
  const password = form.querySelector('#password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const emailValue = email.value.trim();
    const passValue  = password.value.trim();
    const errs = [];

    if (!emailValue || !passValue) errs.push('Tous les champs sont requis.');
    if (!validateEmail(emailValue)) errs.push('Adresse email invalide.');
    if (passValue.length < 8) errs.push('Mot de passe : 8 caractères minimum.');

    if (errs.length) return showErrors(errs);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Inscription…";

    try {
      const res = await fetch('/E-commerce/api/admin/admin_register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, password: passValue })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const msg = data.message || `Erreur réseau (${res.status})`;
        return showErrors(msg);
      }

      // succès
      window.location.href = '/E-commerce/admin/admin_login.html';
    } catch (err) {
      showErrors('Erreur réseau. Réessaie.');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "S'inscrire";
    }
  });
}

// CONNEXION ADMIN --------------------------------------------
async function initAdminLogin() {
  const form = document.getElementById('AdminLogin-form');
  if (!form) return;

  const { showErrors, clearErrors } = makeErrorUi(form);
  const email    = form.querySelector('#email');
  const password = form.querySelector('#password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const emailValue = email.value.trim();
    const passValue  = password.value.trim();
    const errs = [];

    if (!emailValue || !passValue) errs.push('Tous les champs sont requis.');
    if (!validateEmail(emailValue)) errs.push('Adresse email invalide.');
    if (passValue.length < 8) errs.push('Mot de passe : 8 caractères minimum.');

    if (errs.length) return showErrors(errs);

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Connexion…';

    try {
      const res = await fetch('/E-commerce/api/admin/admin_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValue, password: passValue })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const msg = data.message || `Erreur réseau (${res.status})`;
        return showErrors(msg);
      }

      // succès
      window.location.href = '/E-commerce/admin/dashboard.html';
    } catch (err) {
      showErrors('Erreur réseau. Réessaie.');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Se connecter';
    }
  });
}

// BOOT --------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initAdminRegister();
  initAdminLogin();
});
