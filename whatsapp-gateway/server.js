/**
 * ANDROID_AGENT — ORION AI
 * File: whatsapp-gateway/server.js
 * Purpose: Baileys WhatsApp Gateway with 8-Digit Pairing Code (NO QR CODE NEEDED).
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const pino = require('pino');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let sock = null;
let isConnected = false;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            console.log('Baileys Connection Closed. Reconnecting:', shouldReconnect);
            isConnected = false;
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('\n✓ BAILEYS WHATSAPP GATEWAY CONNECTED SUCCESSFULLY VIA PAIRING CODE!');
            isConnected = true;
        }
    });
}

app.get('/status', (req, res) => {
    res.json({
        success: true,
        connected: isConnected,
        agent_user: isConnected && sock?.user ? sock.user.id : null
    });
});

app.post('/pairing-code', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, error: 'Parameter "phone" is required.' });
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone) {
            return res.status(400).json({ success: false, error: 'A valid phone number is required.' });
        }

        if (!sock) {
            await connectToWhatsApp();
        }

        const code = await sock.requestPairingCode(cleanPhone);

        res.json({
            success: true,
            pairing_code: code,
            phone: cleanPhone,
            instructions: "Open WhatsApp on the target phone ➔ Linked Devices ➔ Link with Phone Number ➔ Enter this 8-digit code"
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/send-message', async (req, res) => {
    if (!isConnected || !sock) {
        return res.status(500).json({ success: false, error: 'WhatsApp is not connected. Please request Pairing Code first.' });
    }

    try {
        let { to, message } = req.body;
        if (!to || !message) {
            return res.status(400).json({ success: false, error: 'Parameters "to" and "message" are required.' });
        }

        let cleanPhone = to.replace(/[^0-9]/g, '');
        if (!cleanPhone.endsWith('@s.whatsapp.net')) {
            cleanPhone = cleanPhone + '@s.whatsapp.net';
        }

        await sock.sendMessage(cleanPhone, { text: message });

        res.json({
            success: true,
            recipient: cleanPhone,
            status: 'DISPATCHED_VIA_PAIRING_CODE'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Baileys Server running on port ${PORT}`);
    connectToWhatsApp();
});
