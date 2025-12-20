async function submitForm(event) {
  event.preventDefault();
  const form = event.target;
  const [nameEl, emailEl, messageEl] = form.querySelectorAll('input, textarea');
  const name = nameEl?.value?.trim();
  const email = emailEl?.value?.trim();
  const message = messageEl?.value?.trim();

  if (!name || !email || !message) {
    alert('Please fill out all fields.');
    return;
  }

  try {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Sending...';
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (!res.ok) {
      let serverMsg = 'Failed to send message';
      try {
        const err = await res.json();
        serverMsg = err?.error || err?.message || serverMsg;
      } catch (_) {
        try {
          const txt = await res.text();
          if (txt) serverMsg = txt;
        } catch (_) {}
      }
      throw new Error(serverMsg);
    }

    alert('Message sent! I\'ll get back to you soon.');
    form.reset();
    const ta = form.querySelector('textarea');
    if (ta) { ta.style.height = 'auto'; }
  } catch (e) {
    const msg = e && e.message ? e.message : 'Sorry, there was a problem sending your message. Please try again later.';
    alert(msg);
    console.error('Contact form error:', e);
  } finally {
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = false;
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    }
  }
}

function autoGrow(element) {
      element.style.height = '0px'; 
      element.style.height = element.scrollHeight + 'px';
    }

