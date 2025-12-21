// Newsletter subscription handler
async function submitNewsletter(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('input[type="email"]');
  const button = form.querySelector('button[type="submit"]');
  const email = emailInput.value.trim();

  if (!email) {
    alert('Please enter your email address.');
    return;
  }

  // Disable button and show loading state
  const originalButtonText = button.textContent;
  button.disabled = true;
  button.textContent = 'Subscribing...';

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
      emailInput.value = ''; // Clear the input
    } else {
      alert(data.error || 'Something went wrong. Please try again.');
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    alert('Unable to subscribe. Please check your connection and try again.');
  } finally {
    // Re-enable button
    button.disabled = false;
    button.textContent = originalButtonText;
  }
}
