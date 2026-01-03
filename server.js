const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));

// E-mail küldő (Változókat használsz, amit a Renderen állítunk be!)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/upload', upload.single('file'), (req, res) => {
    const { name, email, title, category, message } = req.body;
    const file = req.file;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        subject: `Új beküldés: ${title}`,
        html: `<p><b>Név:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Kategória:</b> ${category}</p><p><b>Üzenet:</b> ${message}</p>`,
        attachments: [{ filename: file.originalname, path: file.path }]
    };

    transporter.sendMail(mailOptions, (error) => {
        if (file) fs.unlinkSync(file.path); // Törlés a szerverről küldés után
        if (error) return res.send("Hiba történt!");
        res.send("<h1>Sikeres beküldés! Az email elment.</h1>");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Szerver fut: ${PORT}`));