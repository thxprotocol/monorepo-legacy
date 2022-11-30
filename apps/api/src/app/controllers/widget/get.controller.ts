import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Point Rewards']

    const data = `
async function createBaseElements() {
    const svgGift =
        '<svg style="display:block; margin: auto; fill: white; width: 20px; height: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm206.1 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z"/></svg>';
    const main = document.createElement('div');
    const iframe = document.createElement('iframe');
    const launcher = document.createElement('div');
    const notifications = document.createElement('div');

    // Setup class name
    main.id = 'thx-container';

    iframe.id = 'thx-iframe';
    iframe.style.zIndex = 9999999;
    iframe.src = '${WIDGET_URL}?id=${req.params.id}';
    iframe.style.display = 'flex';
    iframe.style.position = 'fixed';
    iframe.style.bottom = '100px';
    iframe.style.right = '15px';
    iframe.style.height = '680px';
    iframe.style.width = '400px';
    iframe.style.border = '0';
    iframe.style.borderRadius = '10px';
    iframe.style.opacity = '0';
    iframe.style.transform = 'scaleY(0)';
    iframe.style.transformOrigin = 'bottom';
    iframe.style.transition = '.2s opacity ease, .1s transform ease';

    launcher.id = 'thx-launcher';
    launcher.style.zIndex = 9999999;
    launcher.style.display = 'flex';
    launcher.style.width = '60px';
    launcher.style.height = '60px';
    launcher.style.backgroundColor = '#5942C1';
    launcher.style.borderRadius = '50%';
    launcher.style.cursor = 'pointer';
    launcher.style.position = 'fixed';
    launcher.style.bottom = '15px';
    launcher.style.right = '15px';
    launcher.style.opacity = 0;
    launcher.style.transform = 'scale(0)';
    launcher.style.transition = '.2s opacity ease, .1s transform ease';
    launcher.innerHTML = svgGift;

    launcher.addEventListener('click', toggleTrigger);

    notifications.id = 'thx-notifications';
    notifications.style.display = 'flex';
    notifications.style.fontFamily = 'Arial';
    notifications.style.fontSize = '13px';
    notifications.style.justifyContent = 'center';
    notifications.style.alignItems = 'center';
    notifications.style.width = '20px';
    notifications.style.height = '20px';
    notifications.style.color = '#FFFFFF';
    notifications.style.position = 'absolute';
    notifications.style.backgroundColor = '#CA0000';
    notifications.style.borderRadius = '50%';
    notifications.style.userSelect = 'none';
    notifications.innerHTML = 3;

    launcher.appendChild(notifications);

    main.appendChild(iframe);
    main.appendChild(launcher);

    document.body.appendChild(main);

    setTimeout(() => {
        launcher.style.opacity = 1;
        launcher.style.transform = 'scale(1)';
    }, 1500);

    return [iframe, notifications];
}

function toggleTrigger() {
    const iframe = document.getElementById('thx-iframe');
    iframe.style.opacity = iframe.style.opacity === '0' ? '1' : '0';
    iframe.style.transform = iframe.style.transform === 'scaleY(0)' ? 'scaleY(1)' : 'scaleY(0)';
}

function initialize() {
    createBaseElements();

    window.onmessage = (event) => {
        if (event.origin !== "${WIDGET_URL}") return;
        switch (event.data) {
            case 'thx.close': {
                toggleTrigger();
                break;
            }
            case 'thx.reward.claimed': {
                const notifications = document.getElementById('thx-notifications');
                notifications.innerHTML = Number(notifications.innerHTML) - 1;
                break;
            }
        }
    };
}

initialize();
`;

    res.set({
        'Content-Type': 'application/javascript',
    }).send(data);
};

export default { controller, validation };
