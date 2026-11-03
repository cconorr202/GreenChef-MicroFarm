/* GreenChef MicroFarm — front-end interactions for the GitHub Pages demo. */

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Відкрити меню' : 'Закрити меню');
    siteNav.classList.toggle('is-open', !isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Відкрити меню');
      siteNav.classList.remove('is-open');
    });
  });
}

// Catalogue category filters.
const filterButtons = document.querySelectorAll('[data-filter]');
const catalogCards = document.querySelectorAll('.catalog-card[data-category]');

if (filterButtons.length && catalogCards.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      catalogCards.forEach((card) => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
    });
  });
}

// Set the date field's minimum to today's date in the visitor's local timezone.
const deliveryDate = document.querySelector('#delivery-date');
if (deliveryDate) {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  deliveryDate.min = localDate;
}

// Catalogue links can preselect a product when the user reaches the B2B form.
document.querySelectorAll('[data-product]').forEach((link) => {
  link.addEventListener('click', () => {
    try { sessionStorage.setItem('greenchef-prefill-product', link.dataset.product); } catch (_) { /* Storage may be unavailable; the form still works. */ }
  });
});

// Demo configuration. Replace the address with a real order inbox before launch.
const ORDER_EMAIL = 'orders@greenchef.example';
const orderForm = document.querySelector('#order-form');
const orderResult = document.querySelector('#order-result');

if (orderForm && orderResult) {
  const productSelect = document.querySelector('#order-product');
  const sampleLink = document.querySelector('[data-prefill]');
  if (sampleLink) {
    sampleLink.addEventListener('click', () => {
      if (productSelect) productSelect.value = sampleLink.dataset.prefill;
    });
  }

  if (productSelect) {
    try {
      const savedProduct = sessionStorage.getItem('greenchef-prefill-product');
      if (savedProduct) {
        const matchingOption = [...productSelect.options].find((option) => option.text === savedProduct);
        if (matchingOption) productSelect.value = matchingOption.value;
        sessionStorage.removeItem('greenchef-prefill-product');
      }
    } catch (_) { /* The user can select a product manually. */ }
  }

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!orderForm.reportValidity()) return;

    const formData = new FormData(orderForm);
    const fields = {
      restaurant: String(formData.get('restaurant') || '').trim(),
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      product: String(formData.get('product') || '').trim(),
      quantity: String(formData.get('quantity') || '').trim(),
      date: String(formData.get('date') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      comment: String(formData.get('comment') || '').trim()
    };

    const lines = [
      'Заявка GreenChef MicroFarm',
      '',
      `Заклад: ${fields.restaurant}`,
      `Контактна особа: ${fields.name}`,
      `Телефон: ${fields.phone}`,
      `Email: ${fields.email || 'Не вказано'}`,
      `Продукція: ${fields.product}`,
      `Кількість упаковок по 50 г: ${fields.quantity || 'Не вказано'}`,
      `Бажана дата: ${fields.date || 'Не визначена'}`,
      `Адреса: ${fields.address || 'Буде уточнена'}`,
      `Коментар: ${fields.comment || 'Немає'}`
    ];

    const subject = `Заявка GreenChef MicroFarm — ${fields.restaurant}`;
    const mailto = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;

    orderResult.hidden = false;
    orderResult.replaceChildren();
    const message = document.createElement('p');
    message.textContent = 'Заявку сформовано. Натисніть кнопку нижче, щоб відкрити поштову програму з готовим листом.';
    const emailLink = document.createElement('a');
    emailLink.href = mailto;
    emailLink.textContent = 'Відкрити лист із заявкою ↗';
    const note = document.createElement('p');
    note.className = 'result-note';
    note.textContent = `Демо-адреса одержувача: ${ORDER_EMAIL}. Перед реальним запуском замініть її в assets/js/main.js на робочу пошту бізнесу.`;
    orderResult.append(message, emailLink, note);
    orderResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
