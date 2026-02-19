// Easter Egg: Click FROST 5 times to access admin panel
let frostClickCount = 0;
let frostClickTimer = null;

function initEasterEgg() {
    const frostSpan = document.querySelector('.frost');
    if (frostSpan) {
        frostSpan.style.cursor = 'pointer';
        frostSpan.addEventListener('click', handleFrostClick);
    }
}

function handleFrostClick(e) {
    e.stopPropagation();
    frostClickCount++;
    
    // Reset counter after 2 seconds of inactivity
    clearTimeout(frostClickTimer);
    frostClickTimer = setTimeout(() => {
        frostClickCount = 0;
    }, 2000);
    
    // Visual feedback
    const frost = e.target;
    frost.style.transform = 'scale(1.1)';
    frost.style.textShadow = '0 0 20px #00ffff, 0 0 40px #00ffff';
    setTimeout(() => {
        frost.style.transform = '';
        frost.style.textShadow = '';
    }, 150);
    
    // Check if 5 clicks reached
    if (frostClickCount >= 5) {
        frostClickCount = 0;
        showVaultAccess();
    }
}

function showVaultAccess() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = `
        <style>
            @keyframes glitch {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(2px, -2px); }
                60% { transform: translate(-2px, -2px); }
                80% { transform: translate(2px, 2px); }
            }
            @keyframes typing {
                from { width: 0; }
                to { width: 100%; }
            }
            @keyframes blink {
                50% { border-color: transparent; }
            }
            .vault-text {
                font-family: 'Bebas Neue', sans-serif;
                font-size: 4rem;
                color: #FFD23F;
                text-shadow: 0 0 30px #FFD23F, 3px 3px 0 #000;
                animation: glitch 0.5s ease-in-out infinite;
                margin-bottom: 20px;
            }
            .access-text {
                font-family: 'Courier New', monospace;
                font-size: 1.2rem;
                color: #00ff00;
                overflow: hidden;
                white-space: nowrap;
                border-right: 3px solid #00ff00;
                animation: typing 1.5s steps(30) 0.5s forwards, blink 0.7s step-end infinite;
                width: 0;
                margin-bottom: 30px;
            }
            .enter-btn {
                background: linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%);
                border: none;
                color: #000;
                padding: 15px 40px;
                font-family: 'Bebas Neue', sans-serif;
                font-size: 1.5rem;
                letter-spacing: 3px;
                cursor: pointer;
                transition: all 0.3s ease;
                opacity: 0;
                animation: fadeIn 0.5s ease 2s forwards;
            }
            .enter-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 0 30px rgba(255, 107, 53, 0.6);
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        </style>
        <div class="vault-text">⚡ VAULT DISCOVERED ⚡</div>
        <div class="access-text">> Accessing secret terminal...</div>
        <button class="enter-btn" onclick="window.location.href='admin.html'">ENTER VAULT</button>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on escape
    const closeHandler = (e) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
    
    // Close on click outside button
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Load and display cup data
async function loadCups() {
    const cupsGrid = document.getElementById('cupsGrid');
    
    try {
        // Load cup data from JSON file
        const response = await fetch('cups-data.json');
        const data = await response.json();
        
        // Check if there are cups to display
        if (data.cups && data.cups.length > 0) {
            // Sort cups by ID (newest first)
            data.cups.sort((a, b) => b.id - a.id);
            
            // Generate cup cards
            data.cups.forEach((cup, index) => {
                const cupCard = createCupCard(cup, index === 0);
                cupsGrid.appendChild(cupCard);
            });
            
            // Add animation delay to cards
            const cards = document.querySelectorAll('.cup-card');
            cards.forEach((card, index) => {
                const animationName = index % 2 === 0 ? 'slideIn' : 'slideInAlt';
                card.style.animationDelay = `${index * 0.1}s`;
                card.style.animation = `${animationName} 0.5s ease forwards`;
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.opacity = '1';
                }, index * 100);
            });
        } else {
            cupsGrid.innerHTML = '<div class="loading">Keine Cups gefunden...</div>';
        }
    } catch (error) {
        console.error('Error loading cup data:', error);
        cupsGrid.innerHTML = `
            <div class="loading">
                Fehler beim Laden der Daten...<br>
                <small style="font-size: 1rem;">Bitte stelle sicher, dass cups-data.json vorhanden ist.</small>
            </div>
        `;
    }
}

// Create a single cup card element
function createCupCard(cup, isNewest) {
    const card = document.createElement('div');
    card.className = 'cup-card';
    card.dataset.cupId = cup.id;
    
    // Format the date if needed
    const formattedDate = formatDate(cup.date);
    
    card.innerHTML = `
        <img src="${cup.image}" alt="Cup ${cup.id}" class="cup-image" onerror="this.style.backgroundColor='#333'; this.style.objectFit='contain'; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22%3E%3Crect width=%22100%22 height=%22100%22 fill=%22%23333%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23666%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
        <div class="cup-info">
            <div class="cup-number">420BYTES CUP #${cup.id}</div>
            <div class="cup-date">${formattedDate}</div>
            <div class="cup-stats">
                <div class="winner-info">
                    <span class="stat-label">Winner</span>
                    <span class="stat-value">${cup.winner}</span>
                </div>
                <div class="time-info">
                    <span class="stat-label">Best Time</span>
                    <span class="stat-value">${cup.bestTime}</span>
                    ${cup.bestTimePlayer ? `<span class="time-player-badge">by ${cup.bestTimePlayer}</span>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => {
        // Animation on click
        card.style.animation = 'shake 0.3s';
        setTimeout(() => {
            card.style.animation = '';
        }, 300);
        
        // Open modal with cup details
        openCupModal(cup);
    });
    
    return card;
}

// Format date to German format
function formatDate(dateString) {
    if (!dateString) return 'Datum unbekannt';
    
    // If date is already in DD.MM.YYYY format, return as is
    if (dateString.includes('.')) {
        return dateString;
    }
    
    // Otherwise convert from YYYY-MM-DD to DD.MM.YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    
    return dateString;
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateY(30px) rotate(-2deg);
            opacity: 0;
        }
        to {
            transform: translateY(0) rotate(-1deg);
            opacity: 1;
        }
    }
    
    @keyframes slideInAlt {
        from {
            transform: translateY(30px) rotate(2deg);
            opacity: 0;
        }
        to {
            transform: translateY(0) rotate(1deg);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Modal functionality
function openCupModal(cup) {
    const modal = document.getElementById('cupModal');
    
    // Update modal header
    document.querySelector('.cup-title-number').textContent = `#${cup.id}`;
    document.querySelector('.modal-date').textContent = cup.date;
    
    // Update podium if results exist
    if (cup.results && cup.results.length >= 3) {
        // Update 1st place
        const winner = cup.results[0];
        const place1 = document.querySelector('.place-1');
        place1.querySelector('.club-tag-badge').textContent = winner.clubTag;
        place1.querySelector('.player-name').textContent = winner.player;
        place1.querySelector('.player-points').textContent = `${winner.points} PTS`;
        
        // Update 2nd place
        const second = cup.results[1];
        const place2 = document.querySelector('.place-2');
        place2.querySelector('.club-tag-badge').textContent = second.clubTag;
        place2.querySelector('.player-name').textContent = second.player;
        place2.querySelector('.player-points').textContent = `${second.points} PTS`;
        
        // Update 3rd place
        const third = cup.results[2];
        const place3 = document.querySelector('.place-3');
        place3.querySelector('.club-tag-badge').textContent = third.clubTag;
        place3.querySelector('.player-name').textContent = third.player;
        place3.querySelector('.player-points').textContent = `${third.points} PTS`;
        
        // Update complete results list
        const resultsList = document.getElementById('resultsList');
        resultsList.innerHTML = '';
        
        cup.results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            // Add special styling for top 3
            const positionEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            
            resultItem.innerHTML = `
                <div class="result-position">${index + 1}${positionEmoji}</div>
                <div class="result-player">
                    <span class="club-tag-badge">${result.clubTag}</span>
                    <span class="result-player-name">${result.player}</span>
                </div>
                <div class="result-points">${result.points} PTS</div>
            `;
            
            resultsList.appendChild(resultItem);
        });
        
        // Add confetti animation
        createConfetti();
    }
    
    // Update best time
    document.querySelector('.best-time-value').textContent = cup.bestTime;
    document.querySelector('.best-time-player').textContent = `by ${cup.bestTimePlayer}`;
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal functionality
function closeModal() {
    const modal = document.getElementById('cupModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear confetti
    const confettiContainer = document.querySelector('.confetti-container');
    if (confettiContainer) {
        confettiContainer.innerHTML = '';
    }
}

// Create confetti animation
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti-container');
    confettiContainer.innerHTML = '';
    
    const colors = ['#FFD700', '#FF6B35', '#FFD23F', '#FF8C42', '#FFA500'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            
            // Random shape (square or rectangle)
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            } else {
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            }
            
            confettiContainer.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 50);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCups();
    initEasterEgg(); // Initialize Easter Egg (5x click on FROST)
    
    // Setup modal close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close modal on background click
    const modal = document.getElementById('cupModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Add some visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add random floating particles effect (optional)
    const header = document.querySelector('.main-header');
    
    // Create floating particles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#FF6B35';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '100';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            particle.style.boxShadow = '0 0 10px #FF6B35';
            document.body.appendChild(particle);
            
            let position = window.innerHeight;
            const speed = 1 + Math.random() * 2;
            const horizontalDrift = (Math.random() - 0.5) * 2;
            
            const animate = () => {
                position -= speed;
                particle.style.top = position + 'px';
                particle.style.left = parseFloat(particle.style.left) + horizontalDrift + 'px';
                
                if (position < -10) {
                    particle.remove();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }, i * 2000);
    }
    
    // Repeat particle effect
    setInterval(() => {
        if (Math.random() > 0.7) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = '#FFD23F';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '100';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = window.innerHeight + 'px';
            particle.style.boxShadow = '0 0 10px #FFD23F';
            document.body.appendChild(particle);
            
            let position = window.innerHeight;
            const speed = 1 + Math.random() * 2;
            const horizontalDrift = (Math.random() - 0.5) * 2;
            
            const animate = () => {
                position -= speed;
                particle.style.top = position + 'px';
                particle.style.left = parseFloat(particle.style.left) + horizontalDrift + 'px';
                
                if (position < -10) {
                    particle.remove();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }
    }, 5000);
});
