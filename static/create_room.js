// !TODO find some way to pass the name variable across pages

document.getElementById("submit").addEventListener("click", function() {
    var name = document.getElementById("name").value;
    $.ajax({
        type: "POST",
        url: "/find_rooms",
        data: JSON.stringify([creator, name]),
        contentType: "application/json",
        dataType: "json",
        success: function () {
            window.location.replace("/game")
        }
    })
});