document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

document.getElementById("submit").addEventListener("click", function() {
    var room_name = document.getElementById("name").value;
    if (room_name == "") {
        alert("Please enter a room name");
    } else {
        $.ajax({
            type: "POST",
            url: "/find_rooms",
            data: JSON.stringify([room_name]),
            contentType: "application/json",
            dataType: "json",
            success: function () {
                localStorage.setItem("room", room_name);
                localStorage.setItem("creator", "true");
                window.location.replace("/choose_name");
            },
            error: function(xhr, status, error) {
                alert("Room name already in use");
            }
        });
    }
});