import { Request, Response } from 'express';
import { param } from 'express-validator';
import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import BrandService from '@thxnetwork/api/services/BrandService';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { Widget } from '@thxnetwork/api/models/Widget';

export const validation = [param('id').isMongoId()];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function drawImageBg(canvas, ctx, image) {
    const imageAspectRatio = image.width / image.height;
    const canvasAspectRatio = canvas.width / canvas.height;

    let scaleFactor = 1;

    if (imageAspectRatio > canvasAspectRatio) {
        scaleFactor = canvas.width / image.height;
    } else {
        scaleFactor = canvas.height / image.width;
    }

    const scaledWidth = image.width * scaleFactor;
    const scaledHeight = image.height * scaleFactor;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Draw the image on the canvas
    ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

async function captureScreenshot(url, outputFileName, width, height) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.setViewport({ width, height });
    await page.goto(url);
    await delay(1000); // Collapse CSS animation needs to finish
    await page.screenshot({ path: outputFileName });

    await browser.close();

    return outputFileName;
}

export const controller = async (req: Request, res: Response) => {
    // Get brand background
    const brand = await BrandService.get(req.params.id);
    const widget = await Widget.findOne({ poolId: req.params.id });
    const theme = JSON.parse(widget.theme);
    const rightOffset = 10;
    const bottomOffset = 100;

    // Get screenshot image
    const widgetUrl = WIDGET_URL + `/c/${req.params.id}/quests`;
    const fileName = `${req.params.id}.jpg`;
    const widgetHeight = 800;
    const widgetWidth = 400;
    const outputPath = await captureScreenshot(widgetUrl, path.resolve(__dirname, fileName), widgetWidth, widgetHeight);
    const file = fs.readFileSync(outputPath) as unknown as Express.Multer.File;

    // Load the base64 image data into an Image object
    const bg = await loadImage(brand.backgroundImgUrl);
    const logo = await loadImage(brand.logoImgUrl);
    const fg = await loadImage(Buffer.from(file.buffer));

    // Create a canvas with the desired dimensions
    const canvasHeight = widgetHeight + bottomOffset + rightOffset;
    const canvasWidth = Math.floor((canvasHeight / 9) * 16);
    const canvas = createCanvas(canvasWidth, canvasHeight);

    const ctx = canvas.getContext('2d');

    // Draw the loaded image onto the canvas
    drawImageBg(canvas, ctx, bg);

    // Draw the widget screenshot
    ctx.drawImage(
        fg,
        canvasWidth - widgetWidth - rightOffset,
        canvasHeight - widgetHeight - bottomOffset,
        widgetWidth,
        widgetHeight,
    );

    // Draw the logo
    const logoRatio = logo.width / logo.height;
    const logoWidth = 200;
    const logoHeight = logoWidth / logoRatio;

    ctx.drawImage(logo, canvasWidth / 2 - logoWidth / 2, canvasHeight / 2 - logoHeight / 2, logoWidth, logoHeight);

    // Draw the launcher circle
    ctx.beginPath();
    ctx.arc(canvasWidth - 50, canvasHeight - 50, 40, 0, 2 * Math.PI); // (x, y, radius, startAngle, endAngle)
    ctx.fillStyle = theme.elements.launcherBg.color;
    ctx.fill();

    // Draw the launcher icon
    const fontPath = path.resolve(__dirname, 'assets', 'fa-solid-900.ttf');
    const family = 'Font Awesome 5 Pro Solid';

    console.log(fontPath);

    registerFont(fontPath, { family, style: 'normal', weight: '900' });

    const fontSize = 20;
    ctx.font = `${fontSize}px "${family}"`;
    ctx.fillStyle = theme.elements.launcherIcon.color; //;
    ctx.fillText(`\uf06b`, canvasWidth - 50 - fontSize / 2, canvasHeight - 50);

    // Convert the canvas content to a buffer
    const url = canvas.toDataURL('image/png');

    // Send the image buffer as the response
    res.json(url);
};

export default { controller, validation };
