async function createBaseElements() {
    const main = document.createElement('div');
    const iframe = document.createElement('iframe');
    const launcher = document.createElement('div');

    // Setup class name
    main.id = 'thx-container';

    iframe.id = 'thx-iframe';
    iframe.src = 'https://localhost:8080';
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '100px';
    iframe.style.right = '15px';
    iframe.style.height = '680px';
    iframe.style.width = '400px';
    iframe.style.border = '0';
    iframe.style.borderRadius = '10px';

    launcher.id = 'thx-launcher';
    launcher.style.width = '52px';
    launcher.style.height = '52px';
    launcher.style.backgroundColor = '#5942C1';
    launcher.style.borderRadius = '50%';
    launcher.style.cursor = 'pointer';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '15px';
    launcher.style.right = '15px';

    launcher.addEventListener('click', toggleTrigger);

    main.appendChild(iframe);
    main.appendChild(launcher);

    document.body.appendChild(main);
}

function toggleTrigger() {
    const iframe = document.getElementById('thx-iframe');
    iframe.style.display = iframe.style.display === 'block' ? 'none' : 'block';
}

function initialize() {
    createBaseElements();

    window.onmessage = (event) => {
        if (event.origin !== 'https://localhost:8080') return;
        toggleTrigger();
    };
}

initialize();
