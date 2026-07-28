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
