//add a eventlistener so fetch happens are content is funnly loaded
document.addEventListener("DOMContentLoaded", function() {
const tokenDataElement = document.getElementById("token-data");
if (tokenDataElement) {
const username = tokenDataElement.getAttribute('data-username');
document.getElementById('user-name').textContent = `${username.toUpperCase()} All Time Stats`;
const token = tokenDataElement.getAttribute('data-token');
    // Fetch stats from the server and dynamically render them
    fetch(`/stats/${username}`, {
    headers: {
        'Authorization': `Bearer ${token}` 
    }
    })
    .then(response => response.json())
    .then(stats => {
        //console.log(stats);
        const statsContainer = document.getElementById('stats-container');
        statsContainer.innerHTML = '';
        // Render each stat
        stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.classList.add('card');
            statElement.innerHTML = `
            <div class="card-header">
            <h2>Player: ${username}</h2>
            <p>Game: Basketball</p>
            </div>
            <div class="card-body">
            <p>Date: ${stat.game.date}</p>
            <p>Location: ${stat.game.location}</p>
            <p>Opponent: ${stat.game.opponent}</p>
            <p>Points Scored: ${stat.pointsScored}</p>
            <p>Assists: ${stat.assists}</p>
            <p>Rebounds: ${stat.rebounds}</p>
            <p>Steals: ${stat.steals}</p>
            <p>Blocks: ${stat.blocks}</p>
            <p>Fouls: ${stat.fouls}</p>
            <p>Outcome: ${stat.game.outcome}</p>
            <button class="delete-btn" data-id="${stat._id}" data-game-id="${stat.game._id}">Delete stat</button>
            </div>
            `;
            statsContainer.appendChild(statElement);
        });
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
        });


document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        var statId = event.target.getAttribute('data-id');
        var gameId = event.target.getAttribute('data-game-id');
        console.log(gameId);
        fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Username': `${username}`
            },
            body: JSON.stringify({ statId: statId, gameId:gameId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            location.reload();
        })
        .catch(error => {
            console.error('Error deleting stat:', error);
        });
    }
});
}else {

}
});