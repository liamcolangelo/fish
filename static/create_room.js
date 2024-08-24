document.getElementById("submit").addEventListener("click", function() {
    var room_name = document.getElementById("name").value;
    $.ajax({
        type: "POST",
        url: "/find_rooms",
        data: JSON.stringify([room_name]),
        contentType: "application/json",
        dataType: "json",
        success: function () {
            localStorage.setItem("room_name", room_name);
            localStorage.setItem("creator", "true");
            window.location.replace("/choose_name");
        },
        error: function(xhr, status, error) {
            alert("Room name already in use");
        }
    })
});