require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ses = new SESClient({ region: "us-east-1" });

app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  const params = {
    Source: process.env.SES_FROM,
    Destination: { ToAddresses: [process.env.TO_EMAIL] },
    Message: {
      Subject: { Data: `New contact from ${name || 'Anonymous'}` },
      Body: { Text: { Data: `From: ${email}\n\n${message}` } }
    }
  };
  try {
    await ses.send(new SendEmailCommand(params));
    res.setHeader('Access-Control-Allow-Origin', '*'); // CORS para pruebas locales
    res.json({ ok: true });
  } catch (e) {
    console.error('SES error:', e);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: e.message || e.name });
  }
});

app.listen(3000, ()=> console.log('Server running on http://localhost:3000'));
