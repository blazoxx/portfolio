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

    const { email } = body || {};

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.NEWSLETTER_TO || process.env.RESEND_TO_EMAIL;

    if (!apiKey) {
      res.status(500).json({ error: 'Email service not configured' });
      return;
    }

    if (!toEmail) {
      res.status(500).json({ error: 'Destination email not configured' });
      return;
    }

    const subject = process.env.NEWSLETTER_SUBJECT || 'New Newsletter Subscription';
    const from = process.env.NEWSLETTER_FROM || 'Portfolio Newsletter <onboarding@resend.dev>';
    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Newsletter Subscription</h2>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subscribed from:</strong> B-Xtras page</p>
        <p><strong>Date (IST):</strong> ${nowIST}</p>
      </div>
    `;
    const text = [
      'New Newsletter Subscription',
      `Email: ${email}`,
      'Subscribed from: Coming Soon page',
      `Date (IST): ${nowIST}`
    ].join('\n');
    const format = (process.env.NEWSLETTER_EMAIL_FORMAT || 'html').toLowerCase();
    const payload = {
      from,
      to: [toEmail],
      subject
    };
    if (format === 'text') {
      payload.text = text;
    } else if (format === 'both') {
      payload.html = html;
      payload.text = text;
    } else {
      payload.html = html;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      res.status(500).json({ 
        error: 'Failed to subscribe to newsletter',
        details: errorData 
      });
      return;
    }

    res.status(200).json({ 
      success: true,
      message: 'Successfully subscribed to newsletter!' 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};
