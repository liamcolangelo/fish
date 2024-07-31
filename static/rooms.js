document.addEventListener("DOMContentLoaded", function() {
    // Example dynamic data
    const choices = [
        { id: 'python', value: 'python', label: 'Python' },
        { id: 'javascript', value: 'javascript', label: 'JavaScript' },
        { id: 'java', value: 'java', label: 'Java' },
        { id: 'csharp', value: 'csharp', label: 'C#' },
        { id: 'cpp', value: 'cpp', label: 'C++' }
    ];

    // Get the container where options will be added
    const container = document.getElementById('options-container');

    // Loop through the choices and create the HTML elements
    choices.forEach(choice => {
        const div = document.createElement('div');

        const input = document.createElement('input');
        input.type = 'radio';
        input.id = choice.id;
        input.name = 'language';
        input.value = choice.value;

        const label = document.createElement('label');
        label.htmlFor = choice.id;
        label.textContent = choice.label;

        div.appendChild(input);
        div.appendChild(label);
        container.appendChild(div);
    });
});