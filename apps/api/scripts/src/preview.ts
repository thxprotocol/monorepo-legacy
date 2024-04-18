import puppeteer from 'puppeteer';
import fs from 'fs';
import db from '@thxnetwork/api/util/database';
import { Brand, Widget } from '@thxnetwork/api/models';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { assetsPath } from '@thxnetwork/api/util/path';
import path from 'path';
import CanvasService from '@thxnetwork/api/services/CanvasService';

// Provide before running
const poolIds = ['660f101c4a0130f6f8315762', '660f10e4e298a7a04bbb35ae'];

// Load on boot as registration on runtime results in font not being loaded in time
const fontPath = path.resolve(assetsPath, 'fa-solid-900.ttf');
const family = 'Font Awesome 5 Pro Solid';
const defaultBackgroundImgPath = path.resolve(assetsPath, 'bg.png');
const defaultLogoImgPath = path.resolve(assetsPath, 'logo.png');

// ENV
// const widgetBaseUrl = 'https://dev-app.thx.network';
const widgetBaseUrl = 'https://app.thx.network';

registerFont(fontPath, { family, style: 'normal', weight: '900' });

// db.connect(process.env.MONGODB_URI);
// db.connect(process.env.MONGODB_URI_DEV);
db.connect(process.env.MONGODB_URI_PROD);

async function createCampaignWidgetPreviewImage({ poolId, logoImgUrl, backgroundImgUrl }: TBrand) {
    const widget = await Widget.findOne({ poolId });
    if (!widget) return;
    const theme = JSON.parse(widget.theme);

    const rightOffset = 20;
    const bottomOffset = 90;
    const widgetHeight = 700;
    const widgetWidth = 400;

    // Get screenshot image
    const widgetUrl = `${widgetBaseUrl}/c/${poolId}/quests`;
    const fileName = `${poolId}.jpg`;

    // Can not use asset path here on runtime
    const outputPath = path.resolve(__dirname, fileName);
    await captureScreenshot(widgetUrl, outputPath, widgetWidth, widgetHeight);

    // Read screenshot from disk
    const file = fs.readFileSync(outputPath);
    if (!file) throw new Error('Screenshot failed');

    // Load the base64 image data into an Image object
    const bg = await loadImage(backgroundImgUrl || defaultBackgroundImgPath);
    const logo = await loadImage(logoImgUrl || defaultLogoImgPath);
    const screenshot = await loadImage(file);

    // Create a canvas with the desired dimensions
    const canvasHeight = widgetHeight + bottomOffset + rightOffset; // 810
    const canvasWidth = Math.floor((canvasHeight / 9) * 16); // 1440
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw the loaded image onto the canvas
    CanvasService.drawImageBg(canvas, ctx, bg);

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
    ctx.drawImage(screenshot, widgetX, widgetY, widgetWidth, widgetHeight);

    // Convert the canvas content to a buffer
    // const dataUrl = canvas.toDataURL('image/png');
    const buffer = canvas.toBuffer('image/png');

    return buffer;
}

export async function captureScreenshot(url, outputFileName, width, height) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setViewport({ width, height });
    await page.goto(url);

    // Collapse CSS animation needs to finish
    await delay(3000);

    await page.screenshot({ path: outputFileName });

    await browser.close();
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

export default async function main() {
    const start = Date.now();

    console.log('Start', new Date());
    const brands = await Brand.find({ poolId: { $in: poolIds } });
    for (const index in brands) {
        try {
            const brand = brands[index];
            const previewFile = await createCampaignWidgetPreviewImage(brand);
            if (!previewFile) continue;
            // Write the image buffer data to the file
            const output = path.join('/Users/peterpolman/Desktop/previews', `${brand.poolId}.png`);
            fs.writeFileSync(output, previewFile);

            console.log(`${Number(index) + 1}/${brands.length} ${brand.poolId}`);
        } catch (error) {
            console.error(brands[index].poolId, error);
        }
    }

    console.log('End', new Date());
    console.log('Duration', Date.now() - start, 'seconds');
}
