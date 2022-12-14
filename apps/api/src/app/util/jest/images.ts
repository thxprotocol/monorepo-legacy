import path from 'path';
import fs from 'fs';

export function createImage() {
    return fs.readFileSync(path.resolve(__dirname, 'test.jpg'));
}
