const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize database schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bookingId TEXT,
        movie TEXT NOT NULL,
        tickets INTEGER NOT NULL,
        showtime TEXT NOT NULL,
        seating TEXT NOT NULL,
        mobileNumber TEXT NOT NULL,
        totalPrice REAL NOT NULL,
        bookingDate TEXT DEFAULT (datetime('now', 'localtime'))
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Bookings table ready.');
        }
    });
});

module.exports = db;
