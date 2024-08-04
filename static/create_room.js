// !TODO find some way to pass the name variable across pages

document.getElementById("submit").addEventListener("click", function() {
    var room_name = document.getElementById("name").value;
    var creator = localStorage.getItem("name")
    $.ajax({
        type: "POST",
        url: "/find_rooms",
        data: JSON.stringify([creator, room_name]),
        contentType: "application/json",
        dataType: "json",
        success: function () {
            localStorage.setItem("room", room_name);
            localStorage.setItem("creator", "true");
            window.location.replace("/waiting");
        },
        error: function(xhr, status, error) {
            alert("Room name already in use");
        }
    })
});