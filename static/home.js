document.getElementById("play").addEventListener("click", function() {join_game()});

function join_game() {
    var name = document.getElementById("name").value;
    $.ajax({
        type: "POST",
        url: "/add_player",
        data: JSON.stringify([name]),
        contentType: "application/json",
        dataType: 'json',
        success: function() {
            window.location.replace("/rooms")
        },
        error: function(xhr, status, error) {
            alert("Name already in use");
        }
    });
}