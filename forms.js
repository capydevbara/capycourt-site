(function () {
  // Reveal-on-scroll (skipped when the visitor prefers reduced motion)
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Forms are sent through Web3Forms, which emails the entries to the site owner.
  document.querySelectorAll('form[data-form]').forEach(function (form) {
    var status = form.querySelector('.status');
    var button = form.querySelector('button[type=submit]');
    var consent = form.querySelector('input[name=consent]');
    var email = form.querySelector('input[name=email]');

    // Feedback form: email is only required when the visitor agrees to be contacted.
    if (form.dataset.form === 'feedback' && consent && email) {
      var sync = function () { email.required = consent.checked; };
      consent.addEventListener('change', sync); sync();
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      status.className = 'status'; status.textContent = '';
      var key = form.querySelector('input[name=access_key]').value;
      if (!key || key === 'YOUR_ACCESS_KEY') {
        status.className = 'status err';
        status.textContent = 'This form is not switched on yet. Please email capydevbara@gmail.com instead.';
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (consent) { data.consent = consent.checked ? 'Yes, happy to be contacted' : 'No'; }
      button.disabled = true; var label = button.textContent; button.textContent = 'Sending...';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json(); }).then(function (res) {
        if (res && res.success) {
          form.reset();
          status.className = 'status ok';
          status.textContent = form.dataset.form === 'tester'
            ? 'Thank you! You are on the list. We will email you when testing opens.'
            : 'Thank you! Your message has been sent.';
        } else { throw new Error((res && res.message) || 'Failed'); }
      }).catch(function () {
        status.className = 'status err';
        status.textContent = 'Sorry, that did not send. Please try again, or email capydevbara@gmail.com.';
      }).then(function () { button.disabled = false; button.textContent = label; });
    });
  });
})();
