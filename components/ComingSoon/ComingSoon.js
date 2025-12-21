// Newsletter subscription handler
async function submitNewsletter(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  let statusEl = form.querySelector('.notify-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'notify-status';
    statusEl.style.marginTop = '10px';
    statusEl.style.fontSize = '14px';
    statusEl.style.textAlign = 'center';
    form.appendChild(statusEl);
  }
  const email = emailInput.value.trim();

  if (!email) {
    alert('Please enter your email address.');
    return;
  }

  // Disable button and show loading state
  const originalButtonText = button.textContent;
  button.disabled = true;
  button.textContent = 'Subscribing...';
  statusEl.textContent = '';

  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Thanks! We\'ll notify you soon.');
      statusEl.style.color = '#2f855a';
      statusEl.textContent = 'Subscribed! If confirmations are enabled, check your inbox or spam.';
      emailInput.value = ''; // Clear the input
    } else {
      const msg = data.error || 'Something went wrong. Please try again.';
      alert(msg);
      statusEl.style.color = '#c53030';
      statusEl.textContent = msg;
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    alert('Unable to subscribe. Please check your connection and try again.');
    statusEl.style.color = '#c53030';
    statusEl.textContent = 'Network error. Please try again.';
  } finally {
    // Re-enable button
    button.disabled = false;
    button.textContent = originalButtonText;
  }
}
