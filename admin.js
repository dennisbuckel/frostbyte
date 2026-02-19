// Admin Panel - Cup Data Generator
// ================================

let playersData = {};
let cupsData = {};
let participantCount = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupForm();
    setupEventListeners();
});

// Load existing data
async function loadData() {
    try {
        // Load players data
        const playersResponse = await fetch('players-data.json');
        playersData = await playersResponse.json();
        
        // Load cups data to get next ID
        const cupsResponse = await fetch('cups-data.json');
        cupsData = await cupsResponse.json();
        
        // Hide loading, show form
        document.getElementById('loadingIndicator').style.display = 'none';
        document.getElementById('cupForm').style.display = 'block';
        
        // Set next cup ID
        const nextId = cupsData.cups.length > 0 
            ? Math.max(...cupsData.cups.map(c => c.id)) + 1 
            : 1;
        document.getElementById('cupId').value = nextId;
        
        // Set today's date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('cupDate').value = today;
        
        // Populate player dropdowns
        populatePlayerDropdowns();
        
        // Add initial participant rows
        for (let i = 0; i < 5; i++) {
            addParticipantRow();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loadingIndicator').innerHTML = 
            '❌ Fehler beim Laden der Daten. Stelle sicher, dass die JSON-Dateien vorhanden sind.';
    }
}

// Populate all player dropdown menus
function populatePlayerDropdowns() {
    const players = Object.keys(playersData.players).sort();
    
    // Best time player dropdown
    const bestTimeSelect = document.getElementById('bestTimePlayer');
    
    // Add "Manual Entry" option first
    const manualOption = document.createElement('option');
    manualOption.value = '__MANUAL__';
    manualOption.textContent = '✏️ Manuell eingeben...';
    bestTimeSelect.appendChild(manualOption);
    
    // Separator
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '── Teilnehmer ──';
    bestTimeSelect.appendChild(separator);
    
    // This will be populated dynamically when participants are added
    // For now, add existing players
    const existingSeparator = document.createElement('option');
    existingSeparator.disabled = true;
    existingSeparator.textContent = '── Registrierte Spieler ──';
    bestTimeSelect.appendChild(existingSeparator);
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player;
        option.textContent = player;
        bestTimeSelect.appendChild(option);
    });
}

// Handle best time player selection (show manual input if needed)
function handleBestTimePlayerSelect() {
    const select = document.getElementById('bestTimePlayer');
    const manualInput = document.getElementById('bestTimePlayerManual');
    
    if (select.value === '__MANUAL__') {
        manualInput.style.display = 'block';
        manualInput.required = true;
        manualInput.focus();
    } else {
        manualInput.style.display = 'none';
        manualInput.required = false;
        manualInput.value = '';
    }
}

// Get player options HTML
function getPlayerOptionsHTML() {
    const players = Object.keys(playersData.players).sort();
    let html = '<option value="">-- Spieler wählen --</option>';
    html += '<option value="__NEW__">➕ Neuer Spieler...</option>';
    players.forEach(player => {
        const clubTag = playersData.players[player].clubTag || '';
        html += `<option value="${player}">${player} [${clubTag}]</option>`;
    });
    return html;
}

// Add a participant row to the table
function addParticipantRow() {
    participantCount++;
    const tbody = document.getElementById('participantsBody');
    
    const row = document.createElement('tr');
    row.id = `participant-${participantCount}`;
    row.innerHTML = `
        <td>
            <select class="player-select" onchange="handlePlayerSelect(this, ${participantCount})" required>
                ${getPlayerOptionsHTML()}
            </select>
            <input type="text" class="new-player-input" id="newPlayer-${participantCount}" 
                   placeholder="Neuer Spielername" style="display: none; margin-top: 5px;">
        </td>
        <td>
            <input type="text" class="club-tag-input" id="clubTag-${participantCount}" 
                   placeholder="BYTE" maxlength="10">
        </td>
        <td>
            <input type="number" class="points-input" id="points-${participantCount}" 
                   value="0" min="0" max="1420" onchange="updateWinnerOptions()">
        </td>
        <td>
            <button type="button" class="remove-btn" onclick="removeParticipantRow(${participantCount})">✕</button>
        </td>
    `;
    
    tbody.appendChild(row);
}

// Handle player selection
function handlePlayerSelect(select, rowId) {
    const newPlayerInput = document.getElementById(`newPlayer-${rowId}`);
    const clubTagInput = document.getElementById(`clubTag-${rowId}`);
    
    if (select.value === '__NEW__') {
        // Show new player input
        newPlayerInput.style.display = 'block';
        newPlayerInput.required = true;
        clubTagInput.value = 'BYTE'; // Default club
    } else if (select.value && playersData.players[select.value]) {
        // Fill club tag from existing player
        newPlayerInput.style.display = 'none';
        newPlayerInput.required = false;
        clubTagInput.value = playersData.players[select.value].clubTag || '';
    } else {
        newPlayerInput.style.display = 'none';
        newPlayerInput.required = false;
    }
    
    updateWinnerOptions();
    updateBestTimeOptions();
}

// Remove a participant row
function removeParticipantRow(rowId) {
    const row = document.getElementById(`participant-${rowId}`);
    if (row) {
        row.remove();
        updateWinnerOptions();
        updateBestTimeOptions();
    }
}

// Update winner dropdown options (only players with 1420 points)
function updateWinnerOptions() {
    const participants = getParticipants();
    const finalists = participants.filter(p => p.points === 1420);
    
    const winner1 = document.getElementById('winner1');
    const winner2 = document.getElementById('winner2');
    const winner3 = document.getElementById('winner3');
    
    // Store current selections
    const currentSelections = [winner1.value, winner2.value, winner3.value];
    
    // Clear and repopulate
    [winner1, winner2, winner3].forEach((select, index) => {
        select.innerHTML = '<option value="">-- Auswählen --</option>';
        finalists.forEach(p => {
            const option = document.createElement('option');
            option.value = p.player;
            option.textContent = `${p.player} [${p.clubTag}]`;
            select.appendChild(option);
        });
        
        // Restore selection if still valid
        if (currentSelections[index] && finalists.some(f => f.player === currentSelections[index])) {
            select.value = currentSelections[index];
        }
    });
}

// Update best time player options
function updateBestTimeOptions() {
    const participants = getParticipants();
    const select = document.getElementById('bestTimePlayer');
    const currentValue = select.value;
    
    // Clear existing options
    select.innerHTML = '';
    
    // First option: empty
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- Spieler wählen --';
    select.appendChild(emptyOption);
    
    // Manual entry option
    const manualOption = document.createElement('option');
    manualOption.value = '__MANUAL__';
    manualOption.textContent = '✏️ Manuell eingeben...';
    select.appendChild(manualOption);
    
    // Separator for participants
    if (participants.length > 0) {
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = '── Teilnehmer ──';
        select.appendChild(separator);
        
        // Add all participants
        participants.forEach(p => {
            const option = document.createElement('option');
            option.value = p.player;
            option.textContent = p.player;
            select.appendChild(option);
        });
    }
    
    // Separator for existing players
    const existingPlayers = Object.keys(playersData.players).sort().filter(
        player => !participants.some(p => p.player === player)
    );
    
    if (existingPlayers.length > 0) {
        const existingSeparator = document.createElement('option');
        existingSeparator.disabled = true;
        existingSeparator.textContent = '── Andere Spieler ──';
        select.appendChild(existingSeparator);
        
        existingPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            select.appendChild(option);
        });
    }
    
    // Restore selection
    if (currentValue) {
        select.value = currentValue;
    }
}

// Get all participants from the form
function getParticipants() {
    const participants = [];
    const rows = document.querySelectorAll('#participantsBody tr');
    
    rows.forEach(row => {
        const select = row.querySelector('.player-select');
        const newPlayerInput = row.querySelector('.new-player-input');
        const clubTagInput = row.querySelector('.club-tag-input');
        const pointsInput = row.querySelector('.points-input');
        
        let playerName = select.value;
        if (playerName === '__NEW__' && newPlayerInput.value.trim()) {
            playerName = newPlayerInput.value.trim().toUpperCase();
        }
        
        if (playerName && playerName !== '__NEW__') {
            participants.push({
                player: playerName,
                clubTag: clubTagInput.value.trim().toUpperCase() || 'BYTE',
                points: parseInt(pointsInput.value) || 0
            });
        }
    });
    
    return participants;
}

// Setup form submission
function setupForm() {
    const form = document.getElementById('cupForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateJSON();
    });
}

// Setup other event listeners
function setupEventListeners() {
    // Update winner options when points change
    document.getElementById('participantsBody').addEventListener('change', (e) => {
        if (e.target.classList.contains('points-input')) {
            updateWinnerOptions();
        }
    });
}

// Generate the JSON output
function generateJSON() {
    // Get form values
    const cupId = parseInt(document.getElementById('cupId').value);
    const dateInput = document.getElementById('cupDate').value;
    const cupImage = document.getElementById('cupImage').value;
    
    // Get best time (optional - use "N/A" if not provided)
    const bestTimeInput = document.getElementById('bestTime').value.trim();
    const bestTime = bestTimeInput || 'N/A';
    
    // Get best time player (optional - use "N/A" if not provided)
    const bestTimeSelect = document.getElementById('bestTimePlayer').value;
    const bestTimeManual = document.getElementById('bestTimePlayerManual').value.trim();
    let bestTimePlayer = 'N/A';
    
    if (bestTimeSelect === '__MANUAL__' && bestTimeManual) {
        bestTimePlayer = bestTimeManual.toUpperCase();
    } else if (bestTimeSelect && bestTimeSelect !== '__MANUAL__') {
        bestTimePlayer = bestTimeSelect;
    }
    
    // Convert date to DD.MM.YYYY format
    const dateParts = dateInput.split('-');
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    
    // Get winners
    const winner1 = document.getElementById('winner1').value;
    const winner2 = document.getElementById('winner2').value;
    const winner3 = document.getElementById('winner3').value;
    
    // Validate winners
    if (!winner1 || !winner2 || !winner3) {
        alert('Bitte wähle alle 3 Gewinner aus!');
        return;
    }
    
    if (winner1 === winner2 || winner1 === winner3 || winner2 === winner3) {
        alert('Jeder Gewinner muss ein anderer Spieler sein!');
        return;
    }
    
    // Get all participants
    const participants = getParticipants();
    
    if (participants.length < 3) {
        alert('Mindestens 3 Teilnehmer sind erforderlich!');
        return;
    }
    
    // Build results array
    const results = [];
    const winners = [winner1, winner2, winner3];
    
    // Add winners first (positions 1-3)
    winners.forEach((winnerName, index) => {
        const participant = participants.find(p => p.player === winnerName);
        if (participant) {
            results.push({
                position: index + 1,
                player: participant.player,
                clubTag: participant.clubTag,
                points: participant.points,
                status: "Winner"
            });
        }
    });
    
    // Add remaining participants sorted by points (descending)
    const remainingParticipants = participants
        .filter(p => !winners.includes(p.player))
        .sort((a, b) => b.points - a.points);
    
    remainingParticipants.forEach((participant, index) => {
        // Status: "Finalist" if points === 1420, otherwise empty
        const status = participant.points === 1420 ? "Finalist" : "";
        
        results.push({
            position: index + 4, // Starting from position 4
            player: participant.player,
            clubTag: participant.clubTag,
            points: participant.points,
            status: status
        });
    });
    
    // Build cup object
    const cupData = {
        id: cupId,
        date: formattedDate,
        winner: winner1,
        bestTime: bestTime,
        bestTimePlayer: bestTimePlayer,
        image: cupImage || `cup titelbilder/cup${cupId}.jpg`,
        results: results
    };
    
    // Format JSON output
    const jsonOutput = JSON.stringify(cupData, null, 2);
    
    // Display cup output
    document.getElementById('jsonOutput').textContent = jsonOutput;
    document.getElementById('outputSection').classList.add('active');
    
    // Generate player updates hint
    generatePlayersUpdateHint(cupId, formattedDate, bestTime, bestTimePlayer, results);
    
    // Scroll to output
    document.getElementById('outputSection').scrollIntoView({ behavior: 'smooth' });
}

// Generate a hint for player updates
function generatePlayersUpdateHint(cupId, cupDate, bestTime, bestTimePlayer, results) {
    const playerUpdates = {};
    
    results.forEach(result => {
        const playerName = result.player;
        const existingPlayer = playersData.players[playerName];
        
        if (existingPlayer) {
            // Update existing player
            const newTotalPoints = existingPlayer.stats.totalPoints + result.points;
            const newCupsPlayed = existingPlayer.stats.cupsPlayed + 1;
            const newWins = existingPlayer.stats.wins + (result.position === 1 ? 1 : 0);
            const newPodiums = existingPlayer.stats.podiums + (result.position <= 3 ? 1 : 0);
            
            const allPositions = [...existingPlayer.cupHistory.map(h => h.position), result.position];
            const newAvgPosition = Math.round((allPositions.reduce((a, b) => a + b, 0) / allPositions.length) * 100) / 100;
            const newBestPosition = Math.min(existingPlayer.stats.bestPosition, result.position);
            const newWorstPosition = Math.max(existingPlayer.stats.worstPosition, result.position);
            
            playerUpdates[playerName] = {
                name: playerName,
                clubTag: result.clubTag,
                stats: {
                    totalPoints: newTotalPoints,
                    cupsPlayed: newCupsPlayed,
                    wins: newWins,
                    podiums: newPodiums,
                    avgPosition: newAvgPosition,
                    bestPosition: newBestPosition,
                    worstPosition: newWorstPosition
                },
                bestTimes: bestTimePlayer === playerName 
                    ? [...existingPlayer.bestTimes, { cupId: cupId, time: bestTime, date: cupDate }]
                    : existingPlayer.bestTimes,
                cupHistory: [...existingPlayer.cupHistory, { cupId: cupId, position: result.position, points: result.points }]
            };
        } else {
            // New player
            playerUpdates[playerName] = {
                name: playerName,
                clubTag: result.clubTag,
                stats: {
                    totalPoints: result.points,
                    cupsPlayed: 1,
                    wins: result.position === 1 ? 1 : 0,
                    podiums: result.position <= 3 ? 1 : 0,
                    avgPosition: result.position,
                    bestPosition: result.position,
                    worstPosition: result.position
                },
                bestTimes: bestTimePlayer === playerName 
                    ? [{ cupId: cupId, time: bestTime, date: cupDate }]
                    : [],
                cupHistory: [{ cupId: cupId, position: result.position, points: result.points }]
            };
        }
    });
    
    // Display player updates
    document.getElementById('playersJsonOutput').textContent = JSON.stringify(playerUpdates, null, 2);
    document.getElementById('playersOutputSection').classList.add('active');
}

// Copy JSON to clipboard
function copyToClipboard(elementId) {
    const jsonText = document.getElementById(elementId).textContent;
    
    navigator.clipboard.writeText(jsonText).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.textContent = '✓ KOPIERT!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.textContent = '📋 IN ZWISCHENABLAGE KOPIEREN';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Clipboard error:', err);
        // Fallback: Select text
        const output = document.getElementById('jsonOutput');
        const range = document.createRange();
        range.selectNode(output);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        alert('Text wurde markiert. Drücke Strg+C zum Kopieren.');
    });
}
