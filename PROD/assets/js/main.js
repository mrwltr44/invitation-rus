/* Появление элементов по мере прокрутки.
   Каждый .reveal получает .is-in, когда входит в кадр; data-delay задаёт
   задержку в миллисекундах, чтобы строки проявлялись друг за другом.
   by MRWLTR */

(function () {
  'use strict';

  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // Без IntersectionObserver просто показываем всё — страница остаётся читаемой.
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
    return;
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      var delay = reduced ? 0 : parseInt(el.dataset.delay || '0', 10);

      setTimeout(function () {
        el.classList.add('is-in');
      }, delay);

      observer.unobserve(el);
    });
  }, {
    // элемент считается показанным, немного не доехав до края экрана
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.08
  });

  for (var j = 0; j < items.length; j++) observer.observe(items[j]);
})();

/* Окно выбора мессенджера: открывается кнопкой внизу страницы,
   закрывается крестиком, щелчком по завесе и клавишей Esc. */
(function () {
  'use strict';

  var button = document.querySelector('.cta');
  var modal = document.getElementById('reply');
  if (!button || !modal) return;

  var card = modal.querySelector('.modal__card');
  var opened = false;

  function open() {
    modal.hidden = false;
    // класс вешаем следующим кадром, иначе переход не с чего начинать
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });
    opened = true;
    button.setAttribute('aria-expanded', 'true');

    var first = modal.querySelector('.way');
    if (first) first.focus();
  }

  function close() {
    if (!opened) return;
    modal.classList.remove('is-open');
    opened = false;
    button.setAttribute('aria-expanded', 'false');
    button.focus();

    // прячем после того, как окно уехало
    window.setTimeout(function () {
      if (!opened) modal.hidden = true;
    }, 300);
  }

  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', open);

  modal.addEventListener('click', function (e) {
    if (e.target.hasAttribute('data-close')) close();
  });

  document.addEventListener('keydown', function (e) {
    if (!opened) return;

    if (e.key === 'Escape') {
      close();
      return;
    }

    // не выпускаем фокус из окна, пока оно открыто
    if (e.key !== 'Tab') return;

    var stops = card.querySelectorAll('a[href], button');
    if (!stops.length) return;

    var first = stops[0];
    var last = stops[stops.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();
