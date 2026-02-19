/**
 * Sync-Script: Generiert players-data.json aus cups-data.json
 * 
 * Verwendung: node sync-players.js
 */

const fs = require('fs');

// Lade Cup-Daten
const cupsData = JSON.parse(fs.readFileSync('cups-data.json', 'utf8'));

// Objekt für alle Spieler
const players = {};

// Bestzeiten-Map: cupId -> {time, player, date}
const bestTimesMap = {};

// Sammle Bestzeiten aus allen Cups
cupsData.cups.forEach(cup => {
    if (cup.bestTime && cup.bestTime !== 'N/A' && cup.bestTimePlayer && cup.bestTimePlayer !== 'N/A') {
        bestTimesMap[cup.id] = {
            time: cup.bestTime,
            player: cup.bestTimePlayer,
            date: cup.date
        };
    }
});

// Verarbeite alle Cups
cupsData.cups.forEach(cup => {
    // Überspringe Cups ohne Ergebnisse
    if (!cup.results || cup.results.length === 0) {
        return;
    }
    
    cup.results.forEach(result => {
        const playerName = result.player;
        
        // Erstelle Spieler-Eintrag falls nicht vorhanden
        if (!players[playerName]) {
            players[playerName] = {
                name: playerName,
                clubTag: result.clubTag,
                stats: {
                    totalPoints: 0,
                    cupsPlayed: 0,
                    wins: 0,
                    podiums: 0,
                    avgPosition: 0,
                    bestPosition: 999,
                    worstPosition: 0
                },
                bestTimes: [],
                cupHistory: []
            };
        }
        
        const player = players[playerName];
        
        // Update Club-Tag (immer den neuesten nehmen)
        if (result.clubTag) {
            player.clubTag = result.clubTag;
        }
        
        // Cup-History hinzufügen
        player.cupHistory.push({
            cupId: cup.id,
            position: result.position,
            points: result.points
        });
        
        // Stats aktualisieren
        player.stats.totalPoints += result.points;
        player.stats.cupsPlayed += 1;
        
        // Wins (Position 1)
        if (result.position === 1) {
            player.stats.wins += 1;
        }
        
        // Podiums (Position 1-3)
        if (result.position <= 3) {
            player.stats.podiums += 1;
        }
        
        // Best/Worst Position
        if (result.position < player.stats.bestPosition) {
            player.stats.bestPosition = result.position;
        }
        if (result.position > player.stats.worstPosition) {
            player.stats.worstPosition = result.position;
        }
        
        // Bestzeit hinzufügen falls dieser Spieler die Bestzeit hatte
        const bestTime = bestTimesMap[cup.id];
        if (bestTime && bestTime.player === playerName) {
            // Prüfen ob diese Bestzeit bereits eingetragen ist
            const alreadyHasBestTime = player.bestTimes.some(bt => bt.cupId === cup.id);
            if (!alreadyHasBestTime) {
                player.bestTimes.push({
                    cupId: cup.id,
                    time: bestTime.time,
                    date: bestTime.date
                });
            }
        }
    });
});

// Berechne avgPosition für alle Spieler
Object.values(players).forEach(player => {
    if (player.cupHistory.length > 0) {
        const totalPositions = player.cupHistory.reduce((sum, entry) => sum + entry.position, 0);
        player.stats.avgPosition = Math.round((totalPositions / player.cupHistory.length) * 100) / 100;
    }
    
    // Sortiere cupHistory nach cupId
    player.cupHistory.sort((a, b) => a.cupId - b.cupId);
    
    // Sortiere bestTimes nach cupId
    player.bestTimes.sort((a, b) => a.cupId - b.cupId);
    
    // Fix: Falls bestPosition immer noch 999 ist (sollte nicht passieren)
    if (player.stats.bestPosition === 999) {
        player.stats.bestPosition = 1;
    }
});

// Zähle aktive Cups (mit Ergebnissen)
const activeCups = cupsData.cups.filter(c => c.results && c.results.length > 0).length;

// Erstelle finales JSON
const playersDataJson = {
    players: players,
    meta: {
        lastUpdated: new Date().toISOString().split('T')[0],
        totalPlayers: Object.keys(players).length,
        totalCups: activeCups
    }
};

// Speichere die Datei
fs.writeFileSync('players-data.json', JSON.stringify(playersDataJson, null, 2), 'utf8');

console.log('✅ players-data.json wurde erfolgreich generiert!');
console.log(`📊 Statistik:`);
console.log(`   - Spieler: ${Object.keys(players).length}`);
console.log(`   - Cups (mit Ergebnissen): ${activeCups}`);
console.log(`   - Letzte Aktualisierung: ${playersDataJson.meta.lastUpdated}`);

// Zeige Top 5 nach Gesamtpunkten
const topPlayers = Object.values(players)
    .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
    .slice(0, 5);

console.log(`\n🏆 Top 5 nach Gesamtpunkten:`);
topPlayers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}: ${p.stats.totalPoints} Punkte (${p.stats.wins} Siege)`);
});
