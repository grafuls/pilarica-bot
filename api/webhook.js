export default async function handler(req, res) {
  console.log(`Received ${req.method} request`);

  if (req.method === 'GET') {
    const { hub_mode, hub_verify_token, hub_challenge } = req.query;
    console.log('GET request query:', req.query);

    if (hub_mode === 'subscribe'
      && hub_verify_token === process.env.VERIFY_TOKEN) {
      console.log('Verification successful');
      return res.status(200).send(hub_challenge);
    }
    console.log('Verification failed');
    return res.status(403).send('Forbidden');
  }
  if (req.method === 'POST') {
    const body = req.body;
    console.log('POST request body:', body);

    if (body.object === 'whatsapp_business_account') {
      const change = body.entry?.[0]?.changes?.[0]?.value;
      const from   = change.messages?.[0]?.from;
      const text   = change.messages?.[0]?.text?.body;
      console.log('Message from:', from);
      console.log('Message text:', text);

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
        console.log('Echo message sent');
      }
      return res.status(200).end();
    }
    console.log('Unsupported object type');
    return res.status(404).end();
  }
}

