var room_names;

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
        label.htmlFor = room_names[i];
        label.textContent = room_names[i];

        div.appendChild(input);
        div.appendChild(label);
        container.appendChild(div);
    }
});

document.getElementById("create room").addEventListener("click", function () {
    window.location.href = "/create_room";
});

document.getElementById("dynamic-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const room_name = document.querySelector("input[name='roomName']:checked").value;
    localStorage.setItem("creator", "false");
    var player_name = localStorage.getItem("name");
    $.ajax({
        type: "POST",
        url: "/join_room",
        data: JSON.stringify([player_name, room_name])
    })
    window.location.replace("/waiting");
});