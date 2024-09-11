room_name = localStorage.getItem("room name");

document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

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