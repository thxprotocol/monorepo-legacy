async function createBaseElements() {
    const main = document.createElement('div');
    const iframe = document.createElement('iframe');
    const trigger = document.createElement('img');

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

    trigger.id = 'thx-trigger';
    trigger.src = 'https://img.upanh.tv/2022/10/31/logo.png';
    trigger.style.width = '52px';
    trigger.style.height = '52px';
    trigger.style.opacity = 0.5;
    trigger.style.transition = 'all 300ms';
    trigger.style.cursor = 'pointer';
    trigger.style.position = 'fixed';
    trigger.style.bottom = '15px';
    trigger.style.right = '15px';
    trigger.addEventListener('click', toggleTrigger);

    main.appendChild(iframe);
    main.appendChild(trigger);

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
