// Profile Data
let playersData = null;
let cupsData = null;
let currentPlayer = null;

// Initialize Profile
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    loadPlayerFromURL();
});

// Load Data
async function loadData() {
    try {
        const [playersResponse, cupsResponse] = await Promise.all([
            fetch('players-data.json'),
            fetch('cups-data.json')
        ]);
        playersData = await playersResponse.json();
        cupsData = await cupsResponse.json();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Get Player from URL
function loadPlayerFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerName = urlParams.get('player');
    
    if (playerName && playersData && playersData.players[playerName]) {
        currentPlayer = playersData.players[playerName];
        renderProfile();
    } else {
        // Redirect to leaderboard if no player found
        window.location.href = 'leaderboard.html';
    }
}

// Calculate Player Rank
function getPlayerRank(playerName) {
    const players = Object.values(playersData.players);
    players.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
    return players.findIndex(p => p.name === playerName) + 1;
}

// Get Player Title
function getPlayerTitle(player) {
    if (player.stats.wins >= 2) return '🏆 CUP CHAMPION';
    if (player.stats.wins >= 1) return '🥇 CUP WINNER';
    if (player.stats.podiums >= 3) return '🥈 PODIUM HUNTER';
    if (player.stats.cupsPlayed >= 6) return '🏁 VETERAN RACER';
    if (player.stats.avgPosition <= 3) return '⭐ TOP PERFORMER';
    if (player.stats.bestTimes && player.stats.bestTimes.length > 0) return '⚡ SPEED DEMON';
    return '🎮 RACER';
}

// Render Profile
function renderProfile() {
    if (!currentPlayer) return;
    
    const rank = getPlayerRank(currentPlayer.name);
    
    // Update page title
    document.title = `FrostByte - ${currentPlayer.name}`;
    
    // Hero Section
    document.getElementById('profileName').textContent = currentPlayer.name;
    document.getElementById('profileClubTag').textContent = currentPlayer.clubTag || 'NO CLUB';
    document.getElementById('profileClubTag').style.display = currentPlayer.clubTag ? 'inline-block' : 'none';
    document.getElementById('profileTitle').textContent = getPlayerTitle(currentPlayer);
    
    // Rank Badge
    const rankBadge = document.getElementById('profileRankBadge');
    rankBadge.querySelector('.rank-number').textContent = `#${rank}`;
    rankBadge.className = 'profile-rank-badge ' + getRankClass(rank);
    
    // Quick Stats
    document.getElementById('quickWins').textContent = currentPlayer.stats.wins;
    document.getElementById('quickPodiums').textContent = currentPlayer.stats.podiums;
    document.getElementById('quickCups').textContent = currentPlayer.stats.cupsPlayed;
    
    // Stats Cards
    document.getElementById('statTotalPoints').textContent = currentPlayer.stats.totalPoints.toLocaleString('de-DE');
    document.getElementById('statAvgPosition').textContent = currentPlayer.stats.avgPosition.toFixed(1);
    document.getElementById('statBestPosition').textContent = `#${currentPlayer.stats.bestPosition}`;
    document.getElementById('statWorstPosition').textContent = `#${currentPlayer.stats.worstPosition}`;
    
    // Render Charts
    renderPositionChart();
    renderPointsChart();
    renderDistributionChart();
    
    // Render Best Times
    renderBestTimes();
    
    // Render Cup Timeline
    renderCupTimeline();
}

// Get Rank Class
function getRankClass(rank) {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
}

// Render Position Chart
function renderPositionChart() {
    const ctx = document.getElementById('positionChart').getContext('2d');
    const cupHistory = currentPlayer.cupHistory;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: cupHistory.map(c => `Cup ${c.cupId}`),
            datasets: [{
                label: 'Position',
                data: cupHistory.map(c => c.position),
                borderColor: '#FF6B35',
                backgroundColor: 'rgba(255, 107, 53, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: cupHistory.map(c => {
                    if (c.position === 1) return '#FFD700';
                    if (c.position === 2) return '#C0C0C0';
                    if (c.position === 3) return '#CD7F32';
                    return '#FF6B35';
                }),
                pointBorderColor: '#1a1a1a',
                pointBorderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    reverse: true,
                    min: 1,
                    max: 10,
                    ticks: {
                        stepSize: 1,
                        color: '#fff',
                        font: { family: 'Oswald', size: 12 }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: { family: 'Oswald', size: 12 }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#FF6B35',
                    bodyColor: '#fff',
                    borderColor: '#FF6B35',
                    borderWidth: 2,
                    titleFont: { family: 'Bebas Neue', size: 16 },
                    bodyFont: { family: 'Oswald', size: 14 },
                    callbacks: {
                        label: (context) => `Position: #${context.raw}`
                    }
                }
            }
        }
    });
}

// Render Points Chart
function renderPointsChart() {
    const ctx = document.getElementById('pointsChart').getContext('2d');
    const cupHistory = currentPlayer.cupHistory;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cupHistory.map(c => `Cup ${c.cupId}`),
            datasets: [{
                label: 'Punkte',
                data: cupHistory.map(c => c.points),
                backgroundColor: cupHistory.map(c => {
                    if (c.position === 1) return 'rgba(255, 215, 0, 0.8)';
                    if (c.position <= 3) return 'rgba(255, 107, 53, 0.8)';
                    return 'rgba(255, 140, 66, 0.6)';
                }),
                borderColor: '#1a1a1a',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1500,
                    ticks: {
                        color: '#fff',
                        font: { family: 'Oswald', size: 12 }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: {
                        color: '#fff',
                        font: { family: 'Oswald', size: 12 }
                    },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#FFD23F',
                    bodyColor: '#fff',
                    borderColor: '#FFD23F',
                    borderWidth: 2,
                    titleFont: { family: 'Bebas Neue', size: 16 },
                    bodyFont: { family: 'Oswald', size: 14 }
                }
            }
        }
    });
}

// Render Distribution Chart
function renderDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    const cupHistory = currentPlayer.cupHistory;
    
    // Count positions
    let top1 = 0, top3 = 0, top5 = 0, rest = 0;
    cupHistory.forEach(c => {
        if (c.position === 1) top1++;
        else if (c.position <= 3) top3++;
        else if (c.position <= 5) top5++;
        else rest++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['🥇 Platz 1', '🥈🥉 Platz 2-3', '📊 Platz 4-5', '📉 Platz 6+'],
            datasets: [{
                data: [top1, top3, top5, rest],
                backgroundColor: [
                    '#FFD700',
                    '#FF6B35',
                    '#FF8C42',
                    '#666666'
                ],
                borderColor: '#1a1a1a',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        font: { family: 'Oswald', size: 14 },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a1a',
                    titleColor: '#FF6B35',
                    bodyColor: '#fff',
                    borderColor: '#FF6B35',
                    borderWidth: 2,
                    titleFont: { family: 'Bebas Neue', size: 16 },
                    bodyFont: { family: 'Oswald', size: 14 },
                    callbacks: {
                        label: (context) => `${context.raw}x (${Math.round(context.raw / currentPlayer.stats.cupsPlayed * 100)}%)`
                    }
                }
            }
        }
    });
}

// Render Best Times
function renderBestTimes() {
    const section = document.getElementById('bestTimesSection');
    const grid = document.getElementById('bestTimesGrid');
    
    if (!currentPlayer.bestTimes || currentPlayer.bestTimes.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    grid.innerHTML = currentPlayer.bestTimes.map(bt => `
        <div class="best-time-card">
            <div class="best-time-icon">⚡</div>
            <div class="best-time-info">
                <div class="best-time-value">${bt.time}</div>
                <div class="best-time-cup">Cup #${bt.cupId}</div>
                <div class="best-time-date">${bt.date}</div>
            </div>
            <div class="record-badge">REKORD</div>
        </div>
    `).join('');
}

// Render Cup Timeline
function renderCupTimeline() {
    const timeline = document.getElementById('cupTimeline');
    const cupHistory = [...currentPlayer.cupHistory].reverse(); // Newest first
    
    timeline.innerHTML = cupHistory.map(cup => {
        const cupInfo = cupsData.cups.find(c => c.id === cup.cupId);
        const positionClass = getPositionClass(cup.position);
        const isWinner = cup.position === 1;
        
        return `
            <div class="timeline-item ${positionClass}">
                <div class="timeline-marker">
                    ${isWinner ? '🏆' : getPositionEmoji(cup.position)}
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-cup">420BYTES CUP #${cup.cupId}</span>
                        <span class="timeline-date">${cupInfo ? cupInfo.date : ''}</span>
                    </div>
                    <div class="timeline-stats">
                        <span class="timeline-position position-${positionClass}">
                            #${cup.position}
                        </span>
                        <span class="timeline-points">${cup.points} PTS</span>
                    </div>
                    ${isWinner ? '<div class="timeline-winner-badge">SIEGER!</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Get Position Class
function getPositionClass(position) {
    if (position === 1) return 'gold';
    if (position === 2) return 'silver';
    if (position === 3) return 'bronze';
    return 'normal';
}

// Get Position Emoji
function getPositionEmoji(position) {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '🏁';
}
