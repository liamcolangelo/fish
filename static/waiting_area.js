// TODO: Maybe Add a list of people in the room
// TODO: Maybe add a minigame or nice animation for the people waiting
var creator = localStorage.getItem("creator");
var username = localStorage.getItem("name")
var room_name = localStorage.getItem("room");

document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

document.getElementById("start").addEventListener("click", function () {
    $.ajax({
        type: "POST",
        url: "/waiting",
        data: JSON.stringify([room_name, creator]),
        contentType: "application/json",
        dataType: "json",
        success: function () {
            window.location.replace("/game");
        },
        error: function (xhr, status, error) {
            alert("Not enough players");
        }
    })
});

if (creator == "true") {
    document.getElementById("top-label").innerHTML = "You created this room";
    document.getElementById("start").removeAttribute("hidden");
} else {
    setInterval(function () {
        $.ajax({
            type: "POST",
            url: "/waiting",
            data: JSON.stringify([room_name, creator]),
            contentType: "application/json",
            dataType: "json",
            success: function () {
                window.location.replace("/game");
            },
            error: function (xhr, status, error) {
                // Nothing happens because game has not started yet
            }
        })
    }, 1000);
}
