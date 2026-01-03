const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Feltöltés beállítása: maximum 6 fájl
const upload = multer({ dest: 'temp_uploads/' });

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// E-mail küldő beállítása
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/upload', upload.array('files', 6), (req, res) => {
    const { name, email, title, message } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).send('Hiba: Nem választottál ki fájlt!');
    }

    // Csatolmányok előkészítése az e-mailhez
    const attachments = files.map(file => ({
        filename: file.originalname,
        path: file.path
    }));

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        replyTo: email, // Ha a válasz gombra nyomsz, a felhasználónak küldi
        subject: `[Weboldal] Új beküldés: ${title || 'Nincs cím'}`,
        html: `
            <h2>Új üzenet érkezett!</h2>
            <p><b>Küldő neve:</b> ${name}</p>
            <p><b>Küldő e-mail címe:</b> ${email}</p>
            <p><b>Bejegyzés címe:</b> ${title}</p>
            <p><b>Üzenet:</b><br>${message}</p>
            <p><i>A csatolt fájlok száma: ${files.length} db</i></p>
        `,
        attachments: attachments
    };

    transporter.sendMail(mailOptions, (error, info) => {
        // Fájlok törlése a szerverről küldés után
        files.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) console.error("Hiba a törléskor:", err);
            });
        });

        if (error) {
            console.error(error);
            return res.status(500).send("Hiba történt az e-mail küldésekor.");
        }

        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1 style="color:green;">Sikeres beküldés!</h1>
                <p>Köszönjük, ${name}! Az üzenetet és a ${files.length} db fájlt megkaptuk.</p>
                <a href="/">Vissza az oldalra</a>
            </div>
        `);
    });
});

app.listen(PORT, () => console.log(`Szerver fut a ${PORT} porton`));