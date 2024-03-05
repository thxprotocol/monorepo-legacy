import path from 'path';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { assetsPath } from '@thxnetwork/api/util/path';

// Load on boot as registration on runtime results in font not being loaded in time
const fontPath = path.resolve(assetsPath, 'fa-solid-900.ttf');
const family = 'Font Awesome 5 Pro Solid';
const defaultBackgroundImgPath = path.resolve(assetsPath, 'bg.png');
const defaultLogoImgPath = path.resolve(assetsPath, 'logo.png');

registerFont(fontPath, { family, style: 'normal', weight: '900' });

function drawImageBg(canvas, ctx, image) {
    const imageAspectRatio = image.width / image.height;
    let scaledWidth = canvas.width + 1,
        scaledHeight = canvas.width / imageAspectRatio;

    if (scaledHeight < canvas.height) {
        scaledHeight = canvas.height;
        scaledWidth = canvas.height * imageAspectRatio;
    }

    const offsetX = Math.floor((canvas.width - scaledWidth) / 2);
    const offsetY = Math.floor((canvas.height - scaledHeight) / 2);

    // Draw mask
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.closePath();

    ctx.clip();
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
    ctx.restore();
}

async function dataUrlToFile(dataUrl: string) {
    return await loadImage(dataUrl);
}

async function createPreviewImage({ logoImgUrl, backgroundImgUrl }: TBrand) {
    const bg = await loadImage(backgroundImgUrl || defaultBackgroundImgPath);
    const logo = await loadImage(logoImgUrl || defaultLogoImgPath);

    // Create a canvas with the desired dimensions
    // https://www.linkedin.com/help/linkedin/answer/a521928/make-your-website-shareable-on-linkedin
    const canvasWidth = 1200;
    const canvasHeight = 627;
    const canvas = createCanvas(canvasWidth, canvasHeight);

    const ctx = canvas.getContext('2d');

    // Draw the loaded image onto the canvas
    drawImageBg(canvas, ctx, bg);

    // Draw the logo
    const logoRatio = logo.width / logo.height;
    const logoWidth = 200;
    const logoHeight = logoWidth / logoRatio;

    ctx.drawImage(logo, canvasWidth / 2 - logoWidth / 2, canvasHeight / 2 - logoHeight / 2, logoWidth, logoHeight);

    // Convert the canvas content to a buffer
    // const dataUrl = canvas.toDataURL('image/png');
    const buffer = canvas.toBuffer('image/png');

    return buffer;
}

export default {
    dataUrlToFile,
    createPreviewImage,
    defaultBackgroundImgPath,
    defaultLogoImgPath,
    drawImageBg,
};
