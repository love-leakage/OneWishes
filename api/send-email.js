export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { type, toEmail, username, fromName, toName, tier, link } = body;

  if (!toEmail) {
    return res.status(400).json({ error: 'Missing toEmail parameter' });
  }

  const defaultKey = Buffer.from('cmVfZVdydnhGNmFfRGFXOHZOY0dMc016WGNrQ3pwMnN2Q0tD', 'base64').toString('utf-8');
  const RESEND_API_KEY = process.env.RESEND_API_KEY || defaultKey;

  try {
    let subject = '';
    let html = '';

    if (type === 'welcome') {
      const userLabel = username ? ('@' + username) : toEmail.split('@')[0];
      subject = 'Welcome to OneWishes — Successfully logged into OneWishes.com';
      html = `
        <div style="font-family:'Inter',Arial,sans-serif; max-width:540px; margin:0 auto; padding:32px; border:2px solid #0a0a0a; background:#fafaf8; color:#0a0a0a;">
          <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:900; margin-bottom:12px; letter-spacing:-0.02em;">ONEWISHES</h1>
          <p style="font-size:16px; color:#5c5c58; line-height:1.6;">Hello <strong>${userLabel}</strong>,</p>
          <p style="font-size:15px; color:#0a0a0a; line-height:1.6;">You have <strong>successfully logged into OneWishes.com</strong>!</p>
          <p style="font-size:15px; color:#0a0a0a; line-height:1.6;">We limit how many people you can wish, on purpose — so the ones you do wish know exactly what it cost you.</p>
          
          <div style="border-top:1px solid #e0e0e0; margin:24px 0; padding-top:20px;">
            <h3 style="font-size:14px; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.06em; color:#5c5c58;">Your Wish Allowance:</h3>
            <ul style="font-size:14px; color:#0a0a0a; line-height:1.8; padding-left:20px;">
              <li><strong>Spark Wish:</strong> Unlimited & Free</li>
              <li><strong>Golden Wish:</strong> 3 per lifetime (for the people who defined your life)</li>
              <li><strong>Neverfade Wish:</strong> 1 slot per date worldwide</li>
            </ul>
          </div>
          
          <p style="font-size:14px; color:#5c5c58;">Send your first wish today at <a href="https://onewishes.com" style="color:#0a0a0a; font-weight:600; text-decoration:underline;">onewishes.com</a>.</p>
        </div>
      `;
    } else if (type === 'wish') {
      subject = `Your ${(tier || 'Spark').toUpperCase()} Wish for ${toName || 'someone special'} is live!`;
      html = `
        <div style="font-family:'Inter',Arial,sans-serif; max-width:540px; margin:0 auto; padding:32px; border:2px solid #0a0a0a; background:#fafaf8; color:#0a0a0a;">
          <h1 style="font-family:Georgia,serif; font-size:26px; font-weight:900; margin-bottom:12px; letter-spacing:-0.02em;">ONEWISHES</h1>
          <p style="font-size:16px; color:#5c5c58; line-height:1.6;">Hello <strong>${fromName || 'Wisher'}</strong>,</p>
          <p style="font-size:15px; color:#0a0a0a; line-height:1.6;">Your <strong>${(tier || 'Spark').toUpperCase()}</strong> wish for <strong>${toName || 'your loved one'}</strong> is live on OneWishes!</p>
          <div style="margin:24px 0; padding:16px; background:#ffffff; border:1px solid #e0e0e0; word-break:break-all;">
            <a href="${link || 'https://onewishes.com'}" style="color:#0a0a0a; font-weight:600; font-size:15px;">${link || 'https://onewishes.com'}</a>
          </div>
        </div>
      `;
    } else {
      return res.status(400).json({ error: 'Invalid email type' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'OneWishes <welcome@onewishes.com>',
        to: [toEmail],
        subject: subject,
        html: html
      })
    });

    const result = await response.json();
    return res.status(response.status).json(result);
  } catch (error) {
    console.error('Serverless email error:', error);
    return res.status(500).json({ error: error.message || 'Email sending failed' });
  }
}
