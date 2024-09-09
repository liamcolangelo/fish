room_name = localStorage.getItem("room name");

$.ajax({
    type: "POST",
    url: "/delete_room",
    data: JSON.stringify([room_name]),
    contentType: "application/json",
    dataType: "json"
})


document.getElementById("return-home").addEventListener("click", function () {
    window.location.replace("/");
});