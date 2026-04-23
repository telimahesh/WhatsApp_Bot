import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import cron from 'node-cron';
import bodyParser from 'body-parser';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json());

  // WhatsApp Client Setup
  let qrCodeData = '';
  let botStatus = 'Initializing...';
  
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      handleSIGINT: false,
    }
  });

  client.on('qr', (qr) => {
    qrCodeData = qr;
    botStatus = 'Awaiting Scan';
    console.log('QR RECEIVED', qr);
  });

  client.on('ready', () => {
    botStatus = 'Connected';
    qrCodeData = '';
    console.log('Client is ready!');
  });

  client.on('disconnected', (reason) => {
    botStatus = 'Disconnected';
    console.log('Client was logged out', reason);
  });

  // Load Data Helpers
  const getSubscribers = () => JSON.parse(fs.readFileSync('./subscribers.json', 'utf8'));
  const saveSubscribers = (subs) => fs.writeFileSync('./subscribers.json', JSON.stringify(subs, null, 2));
  const getDeals = () => JSON.parse(fs.readFileSync('./deals.json', 'utf8'));

  // WhatsApp Logic
  client.on('message', async (msg) => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const body = msg.body.toLowerCase();
    const sender = msg.from;

    // Welcome Message Logic (Simple check for first time)
    const subs = getSubscribers();
    const isReturning = subs.some(s => s.id === sender);
    
    if (!isReturning && body === 'hello') {
        await client.sendMessage(sender, `Welcome *${contact.pushname || 'User'}* to the Deal Bot! 🛍️\n\nCommands:\n- *deal*: Get a random Amazon deal\n- *subscribe*: Join daily deal alerts\n- *unsubscribe*: Leave alerts`);
        return;
    }

    if (body === 'deal') {
      const deals = getDeals();
      const randomDeal = deals[Math.floor(Math.random() * deals.length)];
      const message = `🔥 *DEAL OF THE MOMENT* 🔥\n\n*${randomDeal.title}*\n💰 Price: ${randomDeal.price}\n🔗 Link: ${randomDeal.link}`;
      await client.sendMessage(sender, message);
    } 
    
    else if (body === 'subscribe') {
      if (subs.some(s => s.id === sender)) {
        await client.sendMessage(sender, 'You are already subscribed! ✅');
      } else {
        subs.push({ id: sender, name: contact.pushname, date: new Date().toISOString() });
        saveSubscribers(subs);
        await client.sendMessage(sender, 'Awesome! You are now subscribed to daily deals. 🔔');
      }
    } 
    
    else if (body === 'unsubscribe') {
      const filtered = subs.filter(s => s.id !== sender);
      saveSubscribers(filtered);
      await client.sendMessage(sender, 'You have been unsubscribed. Hope to see you back soon! 👋');
    }
  });

  // API Endpoints
  app.get('/api/status', (req, res) => {
    res.json({ status: botStatus, qr: qrCodeData });
  });

  // Endpoint for external website to POST products
  app.post('/api/broadcast', async (req, res) => {
    const { title, price, link, secret } = req.body;
    
    // Simple security check
    if (secret !== 'MY_BOT_SECRET_123') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!title || !price || !link) {
      return res.status(400).json({ error: 'Missing product details' });
    }

    const subs = getSubscribers();
    const message = `📦 *NEW PRODUCT UPLOADED* 📦\n\n*${title}*\n💰 Price: ${price}\n🔗 Check it out: ${link}`;

    let successCount = 0;
    for (const sub of subs) {
      try {
        await client.sendMessage(sub.id, message);
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${sub.id}:`, err);
      }
    }

    res.json({ success: true, broadcastedTo: successCount });
  });

  // Daily Schedule (Every morning at 9 AM)
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily broadcast...');
    const subs = getSubscribers();
    const deals = getDeals();
    const deal = deals[Math.floor(Math.random() * deals.length)];
    const message = `☀️ *DAILY DEAL ALERT* ☀️\n\n*${deal.title}*\n💰 price: ${deal.price}\n🔗 Link: ${deal.link}`;
    
    for (const sub of subs) {
      try {
        await client.sendMessage(sub.id, message);
      } catch (err) {
        console.error(`Scheduled fail for ${sub.id}:`, err);
      }
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    
    // Initialize bot after server is listening
    console.log('Starting WhatsApp client initialization...');
    client.initialize().catch(err => {
      console.error('WhatsApp initialization failed:', err);
      botStatus = 'Initialization Error';
    });
  });
}

startServer().catch(err => {
  console.error('Fatal Server Error:', err);
});
