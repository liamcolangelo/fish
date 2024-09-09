var room_name = localStorage.getItem("room");

document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

document.getElementById("submit-name").addEventListener("click", function() {
    var name = document.getElementById("name").value;
    if (name == "") {
        alert("Please enter a name");
    } else {
        $.ajax({
            type: "POST",
            url: "/add_player",
            data: JSON.stringify([name, room_name]),
            contentType: "application/json",
            dataType: 'json',
            success: function() {
                localStorage.setItem("name", name);
                window.location.replace("/waiting");
            },
            error: function(xhr, status, error) {
                alert("Name already in use");
            }
        });
    }
});