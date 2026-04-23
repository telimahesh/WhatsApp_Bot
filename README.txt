----------------------------------------------------------
   WHATSAPP AUTOMATION BOT - COMPREHENSIVE GUIDE
----------------------------------------------------------

1. INSTALLATION (Local Machine)
   - Install Node.js (v18 or higher recommended).
   - Create a folder and copy 'bot.js' (or server.ts), 'package.json', 'deals.json', 'subscribers.json' into it.
   - Run: npm install

2. RUNNING FOR THE FIRST TIME
   - Run: npm run dev
   - Look at the dashboard (or terminal) for the QR Code.
   - Open WhatsApp on your phone -> Three dots/Settings -> Linked Devices -> Link a Device.
   - Scan the QR code.
   - Once "Ready" appears, your bot is live.

3. KEEPING IT RUNNING 24/7 (VPS/SERVER)
   - It is recommended to use PM2 (Process Manager 2):
     npm install pm2 -g
     pm2 start server.ts --name "wa-bot" --interpreter tsx
   - PM2 will restart the bot if it crashes.

4. PHP INTEGRATION EXAMPLE (Broadcast from Website)
   Add this to your PHP product upload script:
   
   <?php
   $bot_api_url = "https://your-app-url.com/api/broadcast";
   $data = [
       "title"  => "Awesome Gaming Mouse",
       "price"  => "$29.99",
       "link"   => "https://amzn.to/mouse123",
       "secret" => "MY_BOT_SECRET_123"
   ];

   $options = [
       "http" => [
           "header"  => "Content-type: application/json\r\n",
           "method"  => "POST",
           "content" => json_encode($data)
       ]
   ];
   $context  = stream_context_create($options);
   $result = file_get_contents($bot_api_url, false, $context);
   echo $result;
   ?>

5. IMPORTANT NOTES
   - Rist: WhatsApp reserves the right to ban accounts using unofficial APIs.
   - Storage: 'subscribers.json' and 'deals.json' are updated in real-time.
   - Schedule: The bot sends a random deal to all subscribers every day at 9 AM.
   - Welcome: If a new user types "hello", the bot introduces itself.

----------------------------------------------------------
Developed with Node.js, Express, and whatsapp-web.js
----------------------------------------------------------
