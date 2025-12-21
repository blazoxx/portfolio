module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const contentType = req.headers['content-type'] || '';
    let body = req.body;
    if (!body && contentType.includes('application/json')) {
      body = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
    }

    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }

    const { name, email, message } = body || {};

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    const subject = (process.env.CONTACT_SUBJECT
      ? String(process.env.CONTACT_SUBJECT).replace('{name}', name)
      : `New message from ${name}`);

    const from = process.env.CONTACT_FROM || 'Portfolio Contact <onboarding@resend.dev>';
    const toEmail = process.env.CONTACT_TO || process.env.RESEND_TO_EMAIL || 'sinclarcasii@gmail.com';

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space: pre-wrap;">${escapeHtml(message)}</pre>
      </div>
    `;

    const text = [
      'New contact form submission',
      `Name: ${name}`,
      `Email: ${email}`,
      'Message:',
      message
    ].join('\n');

    const format = (process.env.CONTACT_EMAIL_FORMAT || 'html').toLowerCase();
    const payload = {
      from,
      to: [toEmail],
      subject,
      reply_to: email,
    };
    if (format === 'text') {
      payload.text = text;
    } else if (format === 'both') {
      payload.html = html;
      payload.text = text;
    } else {
      payload.html = html;
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      let errMsg = 'Email service error';
      try {
        const data = await resp.json();
        errMsg = data?.error?.message || data?.message || errMsg;
      } catch (_) {
        const errTxt = await resp.text().catch(() => '');
        if (errTxt) errMsg = errTxt;
      }
      res.status(502).json({ error: errMsg, status: resp.status });
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
