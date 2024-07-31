// Add a list of people in the room
// Add a button for the room creator to begin the game
// Maybe add a minigame or nice animation for the people waiting

var creator = localStorage.getItem("creator");
var username = localStorage.getItem("name")
var room_name = localStorage.getItem("room");

if (creator) {
    const div = document.createElement("div");
    const start_button = document.createElement("button");
    start_button.id = "start";
    start_button.value = "Start Game";

    div.appendChild(start_button);

    document.getElementById("top-label").value = "Start the game when ready";

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
                alert(error);
            }
        })
    });
} else {
    // !TODO Check if game started and the redirect
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
}