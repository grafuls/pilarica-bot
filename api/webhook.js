export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { hub_mode, hub_verify_token, hub_challenge } = req.query;
    if (hub_mode === 'subscribe'
      && hub_verify_token === process.env.VERIFY_TOKEN) {
      return res.status(200).send(hub_challenge);
    }
    return res.status(403).send('Forbidden');
  }
  if (req.method === 'POST') {
    const body = req.body;              // parsed JSON :contentReference[oaicite:6]{index=6}
    if (body.object === 'whatsapp_business_account') {
      const change = body.entry?.[0]?.changes?.[0]?.value;
      const from   = change.messages?.[0]?.from;
      const text   = change.messages?.[0]?.text?.body;
      if (from && text) {
        // Echo back
        await fetch(
          `https://graph.facebook.com/v15.0/${process.env.PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: from,
              type: 'text',
              text: { body: `Echo: ${text}` }
            })
          }
        );
      }
      return res.status(200).end();
    }
    return res.status(404).end();
  }
}

