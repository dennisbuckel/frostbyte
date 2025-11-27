// Leaderboard Data and State
let playersData = null;
let currentSort = 'totalPoints';
let currentOrder = 'desc';
let searchTerm = '';

// Initialize Leaderboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayersData();
    setupEventListeners();
    renderLeaderboard();
});

// Load Players Data
async function loadPlayersData() {
    try {
        const response = await fetch('players-data.json');
        playersData = await response.json();
        updateStats();
        hideLoading();
    } catch (error) {
        console.error('Error loading players data:', error);
        document.getElementById('loadingIndicator').textContent = 'ERROR LOADING DATA';
    }
}

// Hide Loading Indicator
function hideLoading() {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Update Overview Stats
function updateStats() {
    if (!playersData) return;
    
    const players = Object.values(playersData.players);
    const totalPoints = players.reduce((sum, p) => sum + p.stats.totalPoints, 0);
    
    document.getElementById('totalPlayers').textContent = playersData.meta.totalPlayers;
    document.getElementById('totalCups').textContent = playersData.meta.totalCups;
    document.getElementById('totalPointsAll').textContent = totalPoints.toLocaleString('de-DE');
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortBy = btn.dataset.sort;
            
            // Toggle order if same sort field
            if (currentSort === sortBy) {
                currentOrder = currentOrder === 'desc' ? 'asc' : 'desc';
            } else {
                currentSort = sortBy;
                // avgPosition is better when lower, others when higher
                currentOrder = sortBy === 'avgPosition' ? 'asc' : 'desc';
            }
            
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            renderLeaderboard();
        });
    });
    
    // Search Input
    const searchInput = document.getElementById('playerSearch');
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderLeaderboard();
    });
}

// Get Sorted and Filtered Players
function getSortedPlayers() {
    if (!playersData) return [];
    
    let players = Object.values(playersData.players);
    
    // Filter by search term
    if (searchTerm) {
        players = players.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.clubTag.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort players
    players.sort((a, b) => {
        let valueA = a.stats[currentSort];
        let valueB = b.stats[currentSort];
        
        if (currentOrder === 'desc') {
            return valueB - valueA;
        } else {
            return valueA - valueB;
        }
    });
    
    return players;
}

// Render Leaderboard
function renderLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    const players = getSortedPlayers();
    
    if (players.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-results">
                    KEINE SPIELER GEFUNDEN
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = players.map((player, index) => {
        const rank = index + 1;
        const rankClass = getRankClass(rank);
        const rankBadgeClass = getRankBadgeClass(rank);
        
        return `
            <tr class="${rankClass}" onclick="openProfile('${player.name}')" title="Profil von ${player.name} öffnen">
                <td class="rank-cell">
                    <span class="rank-badge ${rankBadgeClass}">${rank}</span>
                </td>
                <td class="player-cell">
                    <span class="player-name">${player.name}</span>
                </td>
                <td class="club-cell">
                    ${player.clubTag ? `<span class="club-tag-badge">${player.clubTag}</span>` : '-'}
                </td>
                <td class="points-cell">${player.stats.totalPoints.toLocaleString('de-DE')}</td>
                <td class="cups-cell">${player.stats.cupsPlayed}</td>
                <td class="wins-cell">${player.stats.wins}</td>
                <td class="podiums-cell">${player.stats.podiums}</td>
                <td class="avg-cell">${player.stats.avgPosition.toFixed(1)}</td>
            </tr>
        `;
    }).join('');
}

// Open Player Profile
function openProfile(playerName) {
    window.location.href = `profile.html?player=${encodeURIComponent(playerName)}`;
}

// Get Row Class Based on Rank
function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return '';
}

// Get Badge Class Based on Rank
function getRankBadgeClass(rank) {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'normal';
}
