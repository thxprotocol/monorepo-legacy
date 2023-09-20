import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { Widget } from '@thxnetwork/api/models/Widget';
import { TBrand } from '@thxnetwork/common/lib/types';
import { assetsPath } from '@thxnetwork/api/util/path';

// Load on boot as registration on runtime results in font not being loaded in time
console.log(assetsPath);
const fontPath = path.resolve(assetsPath, 'fa-solid-900.ttf');
console.log(fontPath);
const family = 'Font Awesome 5 Pro Solid';
const defaultBackgroundImgPath = path.resolve(assetsPath, 'bg.png');
console.log(defaultBackgroundImgPath);
const defaultLogoImgPath = path.resolve(assetsPath, 'logo.png');
console.log(defaultLogoImgPath);

registerFont(fontPath, { family, style: 'normal', weight: '900' });

function drawImageBg(canvas, ctx, image) {
    const imageAspectRatio = image.width / image.height;
    const scaledWidth = canvas.width + 1;
    const scaledHeight = canvas.width / imageAspectRatio;
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

async function captureScreenshot(url, outputFileName, width, height) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setViewport({ width, height });
    await page.goto(url);
    await delay(1000); // Collapse CSS animation needs to finish
    await page.screenshot({ path: outputFileName });

    await browser.close();

    return outputFileName;
}

function drawImageRounded(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function createCampaignWidgetPreviewImage({ poolId, logoImgUrl, backgroundImgUrl }: TBrand) {
    const widget = await Widget.findOne({ poolId });
    const theme = JSON.parse(widget.theme);

    const rightOffset = 20;
    const bottomOffset = 90;
    const widgetHeight = 700;
    const widgetWidth = 400;

    // Get screenshot image
    const widgetUrl = WIDGET_URL + `/c/${poolId}/quests`;
    const fileName = `${poolId}.jpg`;
    const outputPath = await captureScreenshot(widgetUrl, path.resolve(__dirname, fileName), widgetWidth, widgetHeight);
    const file = fs.readFileSync(outputPath) as unknown as Express.Multer.File;

    // Load the base64 image data into an Image object
    const bg = await loadImage(backgroundImgUrl || defaultBackgroundImgPath);
    const logo = await loadImage(logoImgUrl || defaultLogoImgPath);
    const fg = await loadImage(Buffer.from(file.buffer));

    // Create a canvas with the desired dimensions
    const canvasHeight = widgetHeight + bottomOffset + rightOffset; // 810
    const canvasWidth = Math.floor((canvasHeight / 9) * 16); // 1440
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw the loaded image onto the canvas
    drawImageBg(canvas, ctx, bg);

    // Draw the logo
    const logoRatio = logo.width / logo.height;
    const logoWidth = 200;
    const logoHeight = logoWidth / logoRatio;

    ctx.drawImage(logo, canvasWidth / 2 - logoWidth / 2, canvasHeight / 2 - logoHeight / 2, logoWidth, logoHeight);

    const launcherRadius = 30;
    const launcherCenterOffset = 50;

    // Draw the launcher circle
    ctx.beginPath();
    ctx.arc(canvasWidth - launcherCenterOffset, canvasHeight - launcherCenterOffset, launcherRadius, 0, 2 * Math.PI);
    ctx.fillStyle = theme.elements.launcherBg.color;
    ctx.fill();

    const notificationRadius = 10;
    const notificationX = canvasWidth - launcherCenterOffset - launcherRadius / 2 - notificationRadius / 2;
    const notificationY = canvasHeight - launcherCenterOffset - launcherRadius / 2 - notificationRadius / 2;

    // Draw the launcher icon
    const fontSizeIcon = 20;
    ctx.font = `900 ${fontSizeIcon}px "${family}"`;
    ctx.fillStyle = theme.elements.launcherIcon.color; //;
    ctx.fillText(
        `\uf06b`,
        canvasWidth - launcherCenterOffset - fontSizeIcon / 2,
        canvasHeight - launcherCenterOffset + fontSizeIcon / 3,
    );

    // Draw the notification circle
    ctx.beginPath();
    ctx.arc(notificationX, notificationY, notificationRadius, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    // Draw the notificition counter
    const fontSizeNotification = 16;
    ctx.font = `bold normal ${fontSizeNotification}px "Arial"`;
    ctx.fillStyle = 'white';
    ctx.fillText('3', notificationX - notificationRadius / 2, notificationY + notificationRadius / 2);

    // Draw the widget screenshot
    const borderRadius = 10;
    const widgetX = canvasWidth - widgetWidth - rightOffset;
    const widgetY = canvasHeight - widgetHeight - bottomOffset;

    // Round the borders by clipping
    drawImageRounded(ctx, widgetX, widgetY, widgetWidth, widgetHeight, borderRadius);
    ctx.clip();
    ctx.drawImage(fg, widgetX, widgetY, widgetWidth, widgetHeight);

    // Convert the canvas content to a buffer
    // const dataUrl = canvas.toDataURL('image/png');
    const buffer = canvas.toBuffer('image/png');

    return buffer;
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

async function dataUrlToFile(dataUrl: string) {
    return await loadImage(dataUrl);
}

export default {
    dataUrlToFile,
    createCampaignWidgetPreviewImage,
    createPreviewImage,
    defaultBackgroundImgPath,
    defaultLogoImgPath,
};
