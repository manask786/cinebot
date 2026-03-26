// Constants and DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const messageBox = document.getElementById('message-box');
const messageTitle = document.getElementById('message-title');
const messageBody = document.getElementById('message-body');
const messageOkBtn = document.getElementById('message-ok-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const congratsOverlay = document.getElementById('congrats-overlay');
const historyBtn = document.getElementById('history-btn');
const historyModal = document.getElementById('history-modal');
const historyContent = document.getElementById('history-content');
const closeHistoryBtn = document.getElementById('close-history-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const micBtn = document.getElementById('mic-btn');

// Chat state
const movies = [
    { title: "Inception", poster: "images/inception.jpg", genre: "Sci-Fi", rating: "4.8" },
    { title: "Interstellar", poster: "images/interstellar.jpg", genre: "Sci-Fi", rating: "4.7" },
    { title: "The Dark Knight", poster: "images/dark_knight.jpg", genre: "Action", rating: "4.9" },
    { title: "Avatar", poster: "images/avatar.jpg", genre: "Sci-Fi", rating: "4.6" },
    { title: "Mad Max: Fury Road", poster: "images/mad_max_fury_road.jpg", genre: "Action", rating: "4.5" },
    { title: "Forrest Gump", poster: "images/forrest_gump.jpg", genre: "Drama", rating: "4.8" },
    { title: "The Shawshank Redemption", poster: "images/shawshank_redemption.jpg", genre: "Drama", rating: "4.9" },
    { title: "Jurassic Park", poster: "images/jurassic_park.jpg", genre: "Adventure", rating: "4.7" },
    { title: "La La Land", poster: "images/la_la_land.png", genre: "Musical", rating: "4.4" },
    { title: "Everything Everywhere All At Once", poster: "images/everything_everywhere_all_at_once.jpg", genre: "Sci-Fi", rating: "4.5" },
    { title: "Oppenheimer", poster: "images/oppenheimer.jpg", genre: "Biography", rating: "4.7" },
    { title: "The Revenant", poster: "images/revenant.jpg", genre: "Adventure", rating: "4.3" }
];
const showtimes = ["12:00 PM", "3:00 PM", "6:00 PM"];
const seatPrices = {
    "Classic": 200,
    "Executive": 350,
    "Club": 450,
    "Gold": 1300
};
const seatLayout = [
    { row: 'A', type: 'Classic' },
    { row: 'B', type: 'Classic' },
    { row: 'C', type: 'Executive' },
    { row: 'D', type: 'Executive' },
    { row: 'E', type: 'Club' },
    { row: 'F', type: 'Club' },
    { row: 'G', type: 'Gold' }
];
let selectedSeats = [];
let conversationStep = 0;
const booking = {};
const flowers = ['🌸', '🌺', '🌼', '🌷', '🌻'];

// Helper functions
function showMessage(title, message) {
    messageTitle.textContent = title;
    messageBody.textContent = message;
    messageBox.classList.add('visible');
}

function hideMessage() {
    messageBox.classList.remove('visible');
}

function showLoading() {
    loadingOverlay.classList.add('visible');
}

function hideLoading() {
    loadingOverlay.classList.remove('visible');
}

function showTypingIndicator() {
    typingIndicator.style.opacity = '1';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.style.opacity = '0';
}

function appendMessage(sender, text, isHtml = false) {
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', sender);

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.textContent = sender === 'bot' ? '🤖' : '🙂';

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (isHtml) {
        messageDiv.innerHTML = text;
    } else {
        messageDiv.textContent = text;
    }

    messageRow.appendChild(avatarDiv);
    messageRow.appendChild(messageDiv);

    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMovieCards(moviesList) {
    const cardsContainer = document.createElement('div');
    cardsContainer.classList.add('movie-cards-container');

    moviesList.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.genre} | ⭐ ${movie.rating}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            // Disable all cards
            cardsContainer.querySelectorAll('.movie-card').forEach(c => c.style.pointerEvents = 'none');
            handleUserChoice(movie.title);
        });
        cardsContainer.appendChild(card);
    });

    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', 'bot');
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.textContent = '🤖';
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot', 'w-full'); // w-full to allow cards to take space
    messageDiv.style.maxWidth = '100%';
    messageDiv.style.background = 'transparent';
    messageDiv.style.padding = '0';
    messageDiv.appendChild(cardsContainer);

    messageRow.appendChild(avatarDiv);
    messageRow.appendChild(messageDiv);
    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderSeatMap() {
    const container = document.createElement('div');
    container.classList.add('seat-map-container');

    const screen = document.createElement('div');
    screen.classList.add('screen');
    screen.textContent = 'SCREEN';
    container.appendChild(screen);

    const seatsGrid = document.createElement('div');
    seatsGrid.classList.add('seats-grid');

    seatLayout.forEach(rowConfig => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('seat-row');

        // Row Label
        const rowLabel = document.createElement('div');
        rowLabel.classList.add('row-label');
        rowLabel.textContent = rowConfig.row;
        rowDiv.appendChild(rowLabel);

        for (let i = 1; i <= 8; i++) {
            const seatId = `${rowConfig.row}${i}`;
            const seat = document.createElement('div');
            seat.classList.add('seat', rowConfig.type.toLowerCase());
            seat.dataset.id = seatId;
            seat.dataset.type = rowConfig.type;
            seat.dataset.price = seatPrices[rowConfig.type];
            seat.title = `${rowConfig.type} - ₹${seatPrices[rowConfig.type]}`;

            seat.addEventListener('click', () => {
                if (seat.classList.contains('selected')) {
                    seat.classList.remove('selected');
                    selectedSeats = selectedSeats.filter(s => s.id !== seatId);
                } else {
                    seat.classList.add('selected');
                    selectedSeats.push({
                        id: seatId,
                        type: rowConfig.type,
                        price: seatPrices[rowConfig.type]
                    });
                }
                updateSeatSelectionUI(container);
            });
            rowDiv.appendChild(seat);
        }
        seatsGrid.appendChild(rowDiv);
    });
    container.appendChild(seatsGrid);

    // Summary and Confirm Button
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('seat-summary');
    summaryDiv.innerHTML = `
        <p>Selected: <span id="selected-count">0</span></p>
        <p>Total: ₹<span id="selected-total">0</span></p>
        <button id="confirm-seats-btn" class="confirm-btn" disabled>Confirm Seats</button>
    `;
    container.appendChild(summaryDiv);

    // Append to chat
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', 'bot');
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.textContent = '🤖';
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot', 'w-full');
    messageDiv.style.maxWidth = '100%';
    messageDiv.appendChild(container);

    messageRow.appendChild(avatarDiv);
    messageRow.appendChild(messageDiv);
    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Event Listener for Confirm
    container.querySelector('#confirm-seats-btn').addEventListener('click', () => {
        // Disable interaction
        container.querySelectorAll('.seat').forEach(s => s.style.pointerEvents = 'none');
        container.querySelector('#confirm-seats-btn').disabled = true;
        handleUserChoice(`Selected ${selectedSeats.length} seats: ${selectedSeats.map(s => s.id).join(', ')}`);
    });
}

function updateSeatSelectionUI(container) {
    const countSpan = container.querySelector('#selected-count');
    const totalSpan = container.querySelector('#selected-total');
    const confirmBtn = container.querySelector('#confirm-seats-btn');

    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

    countSpan.textContent = selectedSeats.length;
    totalSpan.textContent = total;

    confirmBtn.disabled = selectedSeats.length === 0;
}

function appendQuickReplyButtons(options, isConfirmation = false) {
    const repliesDiv = document.createElement('div');
    repliesDiv.classList.add('quick-replies');

    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('quick-reply-btn', 'text-sm');
        if (isConfirmation) {
            button.classList.add('font-bold', option === 'Yes' ? 'bg-green-600' : 'bg-red-600');
        }
        button.addEventListener('click', () => {
            repliesDiv.querySelectorAll('button').forEach(btn => btn.disabled = true);
            handleUserChoice(option);
        });
        repliesDiv.appendChild(button);
    });

    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', 'bot');
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar');
    avatarDiv.textContent = '🤖';
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot');
    messageDiv.appendChild(repliesDiv);

    messageRow.appendChild(avatarDiv);
    messageRow.appendChild(messageDiv);
    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createFallingFlowers() {
    for (let i = 0; i < 30; i++) {
        const flower = document.createElement('div');
        flower.classList.add('falling-flower');
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.left = `${Math.random() * 100}vw`;
        flower.style.animationDuration = `${Math.random() * 2 + 3}s`; // 3-5s duration
        flower.style.animationDelay = `${Math.random() * 2}s`; // 0-2s delay
        congratsOverlay.appendChild(flower);
    }
}

function showCongratulations() {
    congratsOverlay.classList.add('visible');
    createFallingFlowers();

    // Generate booking details upfront so they can be saved to DB
    booking.bookingId = `CINE${Date.now()}`;
    booking.screenNum = (booking.movie.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 8) + 1;
    booking.date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    // Save booking to backend
    saveBooking();

    setTimeout(() => {
        congratsOverlay.classList.remove('visible');
        congratsOverlay.innerHTML = '<h1 class="congrats-text">Congratulations!</h1><p class="congrats-subtext">Your booking is confirmed.</p>'; // Clear flowers
        conversationStep = 5;
        handleBotResponse();
    }, 4000); // Wait for 4 seconds before showing the ticket
}

async function saveBooking() {
    const totalCost = booking.totalPrice;
    const bookingData = {
        bookingId: booking.bookingId,
        movie: booking.movie,
        tickets: booking.tickets,
        showtime: booking.showtime,
        seating: booking.seating, // e.g., "A1, A2 (Classic)"
        mobileNumber: booking.mobileNumber,
        totalPrice: totalCost,
        bookingDate: new Date().toISOString() // Add timestamp for offline sorting
    };

    // Save to localStorage as a persistent backup
    try {
        const localBookings = JSON.parse(localStorage.getItem('cinebot_bookings') || '[]');
        localBookings.unshift(bookingData); // Add new booking to the beginning
        localStorage.setItem('cinebot_bookings', JSON.stringify(localBookings.slice(0, 50))); // Keep last 50
        console.log('Booking saved to local storage backup');
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }

    try {
        const response = await fetch('https://cinebot-qu3b.onrender.com/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        const result = await response.json();
        console.log('Booking saved to backend:', result);
    } catch (error) {
        console.error('Error saving booking to backend (offline mode?):', error);
    }
}

async function fetchHistory() {
    showLoading();
    let data = [];
    let isOffline = false;

    try {
        const response = await fetch('https://cinebot-qu3b.onrender.com/api/bookings');
        const result = await response.json();
        data = result.data || [];
    } catch (error) {
        console.warn('Backend server unreachabe, falling back to local storage history.');
        isOffline = true;
        // Fallback to localStorage
        try {
            data = JSON.parse(localStorage.getItem('cinebot_bookings') || '[]');
        } catch (e) {
            console.error('Error reading localStorage history:', e);
            data = [];
        }
    }

    hideLoading();

    if (data && data.length > 0) {
        let historyHtml = '';

        historyHtml += data.map(b => {
            // Format the date nicely
            const d = new Date(b.bookingDate);
            const niceDate = isNaN(d) ? (b.bookingDate ? b.bookingDate.split(' ')[0] : 'N/A') : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            
            // Use database booking Idb.bookingId or fall back for old data
            const bookingId = b.bookingId || `CINE-B${String(b.id || '0').padStart(5, '0')}`;
            
            return `
            <div style="background: linear-gradient(135deg, #2a2a3e 0%, #1f1f2e 100%); margin-bottom: 1rem; border-radius: 0.75rem; border: 1px solid rgba(102,126,234,0.3); overflow: hidden; position: relative; animation: fadeIn 0.3s ease-out;">
                <!-- Left Brand Strip -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(to bottom, #667eea, #764ba2);"></div>
                
                <div style="padding: 1rem 1.25rem;">
                    <!-- Header -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                        <div>
                            <p style="font-size: 0.65rem; color: #8b8fb0; letter-spacing: 1px; margin-bottom: 0.15rem; text-transform: uppercase;">Movie</p>
                            <h4 style="color: white; font-size: 1.15rem; font-weight: bold; margin: 0;">${b.movie}</h4>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 0.65rem; color: #8b8fb0; letter-spacing: 1px; margin-bottom: 0.15rem; text-transform: uppercase;">Total</p>
                            <p style="color: #667eea; font-weight: bold; font-size: 1.1rem; margin: 0;">₹${b.totalPrice}</p>
                        </div>
                    </div>
                    
                    <!-- Details Grid -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.1); border-bottom: 1px dashed rgba(255,255,255,0.1); padding: 0.75rem 0;">
                        <div>
                            <p style="font-size: 0.6rem; color: #8b8fb0; margin-bottom: 0.15rem; text-transform: uppercase;">Date</p>
                            <p style="color: #d1d5db; font-size: 0.85rem; font-weight: 500; margin: 0;">${niceDate}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.6rem; color: #8b8fb0; margin-bottom: 0.15rem; text-transform: uppercase;">Time</p>
                            <p style="color: #d1d5db; font-size: 0.85rem; font-weight: 500; margin: 0;">${b.showtime}</p>
                        </div>
                        <div>
                            <p style="font-size: 0.6rem; color: #8b8fb0; margin-bottom: 0.15rem; text-transform: uppercase;">Seats (${b.tickets})</p>
                            <p style="color: #d1d5db; font-size: 0.85rem; font-weight: 500; margin: 0;">${b.seating}</p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <p style="font-size: 0.7rem; color: #667eea; font-family: monospace; letter-spacing: 1px; margin: 0;">ID: ${bookingId}</p>
                        <p style="font-size: 0.7rem; color: #8b8fb0; margin: 0;">📱 ${b.mobileNumber}</p>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        historyContent.innerHTML = historyHtml;
    } else {
        historyContent.innerHTML = '<p class="text-center text-gray-500">No bookings found.</p>';
    }
    historyModal.classList.add('visible');
}

function showFinalTicket() {
    const bookingId = booking.bookingId;
    const screenNum = booking.screenNum;
    const auditDate = booking.date;

    const ticketHtml = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 1rem; max-width: 520px; margin: 0 auto; color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: 'Inter', sans-serif;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; letter-spacing: 0.5px;">🎬 CineBot Ticket</h2>
                <p style="font-size: 0.85rem; opacity: 0.85; background: rgba(255,255,255,0.15); display: inline-block; padding: 0.2rem 0.8rem; border-radius: 9999px;">✅ Booking Confirmed</p>
            </div>

            <!-- Main ticket body -->
            <div style="background: white; color: #222; border-radius: 0.9rem; overflow: hidden;">

                <!-- Movie title strip -->
                <div style="background: linear-gradient(90deg, #667eea, #764ba2); color: white; padding: 0.9rem 1.5rem;">
                    <p style="font-size: 0.65rem; letter-spacing: 1.5px; opacity: 0.8; margin-bottom: 0.2rem;">🎥 MOVIE</p>
                    <p style="font-size: 1.25rem; font-weight: 800;">${booking.movie}</p>
                </div>

                <!-- Fields grid -->
                <div style="padding: 1.25rem 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">🕒 SHOW TIME</p>
                        <p style="font-weight: 700; font-size: 1rem;">${booking.showtime}</p>
                    </div>

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">📅 DATE</p>
                        <p style="font-weight: 700; font-size: 1rem;">${auditDate}</p>
                    </div>

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">🎟️ SEAT(S)</p>
                        <p style="font-weight: 700; font-size: 0.95rem;">${booking.seating}</p>
                    </div>

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">💺 TICKETS</p>
                        <p style="font-weight: 700; font-size: 1rem;">${booking.tickets}</p>
                    </div>

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">🪑 SCREEN / AUDI</p>
                        <p style="font-weight: 700; font-size: 1rem;">Screen ${screenNum} · Audi ${screenNum}</p>
                    </div>

                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">📱 MOBILE</p>
                        <p style="font-weight: 700; font-size: 1rem;">${booking.mobileNumber}</p>
                    </div>

                </div>

                <!-- Dashed divider -->
                <div style="border-top: 2px dashed #e0e0e0; margin: 0 1.5rem;"></div>

                <!-- Total + Booking ID -->
                <div style="padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">💰 TOTAL AMOUNT</p>
                        <p style="font-weight: 800; font-size: 1.5rem; color: #667eea;">₹${booking.totalPrice}</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 0.6rem; letter-spacing: 1.2px; color: #888; margin-bottom: 0.2rem;">🔢 BOOKING ID</p>
                        <p style="font-weight: 700; font-size: 0.8rem; color: #333; word-break: break-all;">${bookingId}</p>
                    </div>
                </div>

            </div>

            <!-- Buttons -->
            <div style="text-align: center; margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                <button id="download-ticket-btn" style="background: white; color: #667eea; padding: 0.75rem 1.75rem; border-radius: 9999px; font-weight: 700; cursor: pointer; border: none; transition: transform 0.2s; font-size: 0.9rem;">
                    📥 Download Ticket
                </button>
                <button id="new-booking-btn" style="background: rgba(255,255,255,0.15); color: white; padding: 0.75rem 1.75rem; border-radius: 9999px; font-weight: 700; cursor: pointer; border: 2px solid rgba(255,255,255,0.7); transition: transform 0.2s; font-size: 0.9rem;">
                    🎬 New Booking
                </button>
            </div>
        </div>
    `;

    appendMessage('bot', ticketHtml, true);

    // Wire up buttons after ticket renders
    setTimeout(() => {
        // Download ticket button
        const downloadBtn = document.getElementById('download-ticket-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadTicketAsPDF();
            });
        }

        // New booking button
        const newBookingBtn = document.getElementById('new-booking-btn');
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    }, 500);
}

function downloadTicketAsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CineBot Ticket', 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Booking Confirmed!', 105, 28, { align: 'center' });

    // Body
    doc.setTextColor(30, 30, 30);
    const fields = [
        ['Movie',        booking.movie],
        ['Show Time',    booking.showtime],
        ['Date',         booking.date || new Date().toLocaleDateString('en-IN')],
        ['Seat(s)',      booking.seating],
        ['Tickets',      String(booking.tickets)],
        ['Screen / Audi',`Screen ${booking.screenNum} · Audi ${booking.screenNum}`],
        ['Mobile',       booking.mobileNumber],
        ['Total Amount', `Rs. ${booking.totalPrice}`],
        ['Booking ID',   booking.bookingId],
    ];

    let y = 50;
    fields.forEach(([label, value]) => {
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), 20, y);

        doc.setFontSize(12);
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 20, y + 6);
        y += 18;
    });

    // Dashed separator
    doc.setLineDashPattern([3, 2], 0);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, y, 195, y);

    doc.setFontSize(9);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for booking with CineBot!', 105, y + 10, { align: 'center' });

    doc.save(`CineBot-Ticket-${booking.movie.replace(/\s+/g, '-')}.pdf`);
}


function handleBotResponse() {
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        switch (conversationStep) {
            case 0:
                appendMessage('bot', `Hello! Welcome to CineBot. Which movie would you like to see?`);
                appendMovieCards(movies);
                break;
            case 1:
                appendMessage('bot', `Great choice! What time would you like to go?`);
                appendQuickReplyButtons(showtimes);
                break;
            case 2:
                appendMessage('bot', `Please select your seats.`);
                renderSeatMap();
                break;
            case 3:
                appendMessage('bot', `Excellent. Please enter your mobile number to receive your ticket confirmation.`);
                break;
            case 4:
                const totalCost = booking.totalPrice;
                const confirmationHtml = `
                    <div>
                        <p>Here is your booking summary:</p>
                        <div class="receipt-details text-sm">
                            <p><strong>Movie:</strong> ${booking.movie}</p>
                            <p><strong>Showtime:</strong> ${booking.showtime}</p>
                            <p><strong>Seats:</strong> ${booking.seating}</p>
                            <p><strong>Mobile:</strong> ${booking.mobileNumber}</p>
                        </div>
                        <div class="receipt">
                            <div class="receipt-total receipt-item">
                                <span>Total</span>
                                <span>₹${totalCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                `;
                appendMessage('bot', confirmationHtml, true);
                appendMessage('bot', `Does everything look correct? Do you want to confirm your booking?`);
                appendQuickReplyButtons(["Yes", "No"], true);
                break;
            case 5:
                showFinalTicket();
                break;
            case 6:
                appendMessage('bot', `No problem! You can start a new booking by refreshing the page.`);
                sendBtn.disabled = true;
                userInput.disabled = true;
                break;
        }
    }, 1000); // 1-second delay for the typing effect
}

function handleUserChoice(message) {
    appendMessage('user', message);

    switch (conversationStep) {
        case 0:
            const movieInput = message.trim();
            const movieObj = movies.find(m => m.title === movieInput);
            if (movieObj) {
                booking.movie = movieObj.title;
                conversationStep++;
                handleBotResponse();
            } else {
                showMessage('Invalid Selection', 'Please select a movie from the cards.');
            }
            break;
        case 1:
            const showtimeInput = message.trim();
            if (showtimes.includes(showtimeInput)) {
                booking.showtime = showtimeInput;
                conversationStep++;
                handleBotResponse();
            } else {
                showMessage('Invalid Showtime', 'Please use the buttons or type a valid showtime.');
            }
            break;
        case 2:
            if (selectedSeats.length > 0) {
                booking.tickets = selectedSeats.length;
                booking.seating = selectedSeats.map(s => s.id).join(', ');
                booking.totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
                conversationStep++;
                handleBotResponse();
            } else {
                showMessage('No Seats Selected', 'Please select at least one seat.');
            }
            break;
        case 3:
            const mobileNumberInput = message.trim();
            if (/^\d{10}$/.test(mobileNumberInput)) {
                booking.mobileNumber = mobileNumberInput;
                conversationStep++;
                handleBotResponse();
            } else {
                showMessage('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
                appendMessage('bot', 'Please enter a valid mobile number.');
            }
            break;
        case 4:
            const confirmationResponse = message.trim().toLowerCase();
            if (confirmationResponse === "yes") {
                showLoading();
                setTimeout(() => {
                    hideLoading();
                    showCongratulations();
                }, 5000); // Wait for 5 seconds for the loading screen
            } else if (confirmationResponse === "no") {
                conversationStep = 6;
                handleBotResponse();
            } else {
                showMessage('Invalid Response', 'Please select "Yes" or "No".');
                appendMessage('bot', `Please select "Yes" or "No" to confirm.`);
            }
            break;
        default:
            break;
    }
}

// Theme Toggle
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Load Theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggleBtn.textContent = '🌙';
}

// Voice Recognition
if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('text-red-500');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micBtn.classList.remove('text-red-500');
        // Optional: Auto-send
        // sendBtn.click();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        micBtn.classList.remove('text-red-500');
    };

    recognition.onend = () => {
        micBtn.classList.remove('text-red-500');
    };
} else {
    micBtn.style.display = 'none';
}

// Event listeners
sendBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        userInput.value = '';
        handleUserChoice(message);
    }
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

messageOkBtn.addEventListener('click', hideMessage);

historyBtn.addEventListener('click', fetchHistory);
closeHistoryBtn.addEventListener('click', () => {
    historyModal.classList.remove('visible');
});

// Initial bot message on load
window.onload = function () {
    handleBotResponse();
};
