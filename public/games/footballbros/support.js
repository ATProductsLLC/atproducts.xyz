document.addEventListener("DOMContentLoaded", function() {
    // Function to check if the current page is inside an iframe
    function isInIframe() {
        return window.self !== window.top;
    }

    var aHost = "";

    try {
        aHost = window.location.ancestorOrigins[0];
    } catch (error) {
        aHost = "";
    }


    // If we're inside an iframe and the parent host is not 'freegames.io', create the clickable link
    if (isInIframe() && aHost.includes('freegames.io')) {
        // Clear the entire document body
        document.body.innerHTML = "";

        // Set the body style to center the content
        document.body.style.display = "flex";
        document.body.style.justifyContent = "center";
        document.body.style.alignItems = "center";
        document.body.style.height = "100vh";
        document.body.style.margin = "0";
        document.body.style.backgroundColor = "#000"; // Optional: set background to black for contrast

        // Create a new anchor element
        const link = document.createElement("a");
        link.href = "#"; // Set to "#" to prevent default link behavior
        link.textContent = "Click here to visit Football Bros!";
        link.style.color = "#FFA500"; // Yellow-orange color
        link.style.textDecoration = "underline";
        link.style.cursor = "pointer";
        link.style.fontSize = "24px"; // Adjust font size for visibility
        link.style.fontFamily = "Arial, sans-serif"; // Optional: set a font for consistency

        // Add a click event listener to the link
        link.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default behavior
            // Redirect the top-level browser window
            window.top.location.href = "https://footballbros.io";
        });

        // Append the link to the body
        document.body.appendChild(link);
    }
});
