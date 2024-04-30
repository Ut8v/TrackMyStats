window.onload = function() {
    // Extract username from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const usernamePlaceholder = document.getElementById('usernamePlaceholder');
    //console.log(username);
    if (username) {
        usernamePlaceholder.textContent = username;
    }
};
const tokenDataElement = document.getElementById('token-data');
const token = tokenDataElement.getAttribute('data-token');
const username = tokenDataElement.getAttribute('data-username');
console.log(username);
document.addEventListener('DOMContentLoaded', async () => {
    // Function to fetch posts
    const fetchPosts = async (token) => {
        try {
            const response = await fetch(`/allstats`,{
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Username': `${username}`
                }
            })

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    };

    // Function to render posts
    const renderPosts = (posts) => {
        const postContainer = document.querySelector('.post');
        postContainer.innerHTML = ''; 
        if (posts.length === 0) {
            postContainer.innerHTML = '<p>No posts available.</p>';
        } else {
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post-item');
                postElement.innerHTML = `
                <h2>Player: ${post.player.username}</h2>
                <p>Points Scored: ${post.pointsScored}</p>
                <p>Rebounds: ${post.rebounds}</p>
                <p>Assists: ${post.assists}</p>
                <p>Steals: ${post.steals}</p>
                <p>Blocks: ${post.blocks}</p>
                <p>Fouls: ${post.fouls}</p>
                <p>Date: ${post.game.date}</p>
                <p>Location: ${post.game.location}</p>
                <p>Outcome: ${post.game.outcome}</p>
                <p>Opponent: ${post.game.opponent}</p>
                `;
                postContainer.appendChild(postElement);
            });
        }
    };

    const posts = await fetchPosts(token);
    renderPosts(posts);

    const homeButton = document.querySelector('.homebtn');
    homeButton.addEventListener('click', async () => {
        const posts = await fetchPosts(token);
        renderPosts(posts);
    });
});
