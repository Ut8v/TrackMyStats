window.onload = function() {
    // Extract username from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // Update profile info with the username
    const usernamePlaceholder = document.getElementById('usernamePlaceholder');
    //console.log(username);
    if (username) {
        usernamePlaceholder.textContent = username;
    }
};