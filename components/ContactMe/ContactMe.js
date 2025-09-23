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
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }

    alert('Message sent! I\'ll get back to you soon.');
    form.reset();
    // Reset textarea height if needed
    const ta = form.querySelector('textarea');
    if (ta) { ta.style.height = 'auto'; }
  } catch (e) {
    alert('Sorry, there was a problem sending your message. Please try again later.');
    console.error(e);
  }
}

function autoGrow(element) {
      element.style.height = '0px'; 
      element.style.height = element.scrollHeight + 'px';
    }

