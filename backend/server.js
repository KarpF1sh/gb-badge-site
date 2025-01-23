const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const hcaptcha = require('express-hcaptcha');
const cors = require('cors');

// your hcaptcha secret key
const SECRET = "ES_6935da1000e74b3795463e1c4b7dee9e" //process.env.HCAPTCHA_SECRET_KEY;
const PORT = 3000;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('./subscribers.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            telegram TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
            }
        });
    }
});

// API Route with HCaptcha Middleware
app.post('/signup', hcaptcha.middleware.validate(SECRET), (req, res) => {
    const { email, telegram } = req.body;
    //console.log(req);

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    const query = `INSERT INTO subscribers (email, telegram) VALUES (?, ?)`;
    db.run(query, [email, telegram || null], function (err) {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Internal server error.' });
        }
        res.status(200).json({ message: 'Subscription successful!', id: this.lastID });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
