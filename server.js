const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // 🔥 ADD THIS
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000; // 🔥 IMPORTANT for Render

app.use(cors());
app.use(bodyParser.json());

// 🔥 SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname)));

// API to save a booking
app.post('/api/bookings', (req, res) => {
    const { bookingId, movie, tickets, showtime, seating, mobileNumber, totalPrice } = req.body;

    if (!bookingId || !movie || !tickets || !showtime || !seating || !mobileNumber || !totalPrice) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = `INSERT INTO bookings (bookingId, movie, tickets, showtime, seating, mobileNumber, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [bookingId, movie, tickets, showtime, seating, mobileNumber, totalPrice];

    console.log('Saving booking:', { bookingId, movie, tickets, showtime, seating, mobileNumber });

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error saving booking:', err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        console.log('Booking saved successfully with ID:', this.lastID);
        res.json({
            message: 'Booking saved successfully',
            id: this.lastID
        });
    });
});

// API to get booking history
app.get('/api/bookings', (req, res) => {
    const sql = "SELECT * FROM bookings ORDER BY bookingDate DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        console.log(`Retrieved ${rows.length} booking(s) from history`);
        res.json({
            message: 'Success',
            data: rows
        });
    });
});

// 🔥 MAIN ROUTE (VERY IMPORTANT)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
