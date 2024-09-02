var room_name = localStorage.getItem("room");

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