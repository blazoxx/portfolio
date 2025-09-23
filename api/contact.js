// Serverless function to send contact form emails via Resend
// Requires environment variable: RESEND_API_KEY

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const subject = `New message from ${name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space: pre-wrap;">${escapeHtml(message)}</pre>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['sinclarcasii@gmail.com'],
        subject,
        html,
        reply_to: email,
      }),
    });

    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => '');
      res.status(502).json({ error: 'Email service error', details: errTxt });
      return;
    }

    const data = await resp.json().catch(() => ({}));
    res.status(200).json({ ok: true, id: data.id || null });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected error', details: String(err) });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
