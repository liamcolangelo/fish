var room_names;

document.addEventListener("DOMContentLoaded", function() {
    const screenWidth = window.screen.width;
    const desiredWidth = 1920.0;
    const scaleFactor = screenWidth / desiredWidth;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    viewportMeta.setAttribute("content", `width=${desiredWidth}, initial-scale=${scaleFactor}`);
});

let rooms = $.ajax({
    type: "GET",
    url: "/find_rooms",
    contentType: "application/json",
    dataType: "json"
})

rooms.then(function(data) {
    room_names = data["games"]


    // Get the container where options will be added
    const container = document.getElementById('options-container');

    // Loop through the choices and create the HTML elements
    for (var i = 0; i < room_names.length; i++) {
        const div = document.createElement('div');

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = room_names[i];
        input.name = 'roomName';
        input.value = room_names[i];

        const label = document.createElement('label');
        label.className = "room-choice";
        label.htmlFor = room_names[i];
        label.textContent = room_names[i];

        div.appendChild(input);
        div.appendChild(label);
        container.appendChild(div);
        container.appendChild(document.createElement("br"));
    }
});

document.getElementById("create room").addEventListener("click", function () {
    window.location.href = "/create_room";
});

document.getElementById("dynamic-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const room_name = document.querySelector("input[name='roomName']:checked").value;
    localStorage.setItem("creator", "false");
    localStorage.setItem("room", room_name);
    window.location.replace("/choose_name");
});

document.getElementById("reenter-room").addEventListener("click", function () {
    window.location.replace("/game");
});