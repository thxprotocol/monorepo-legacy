import { createCanvas } from 'canvas';

const createImage = async (text: string, width = 100, height = 100): Promise<Buffer> => {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#f2f2f2';
    ctx.font = '32px Arial';
    ctx.fillText(text, 13, 35);

    const buffer = canvas.toBuffer('image/png');
    return buffer;
};
export { createImage };
