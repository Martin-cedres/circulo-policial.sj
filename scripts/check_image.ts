import fs from 'fs';
import path from 'path';

const imgPath = path.join(process.cwd(), 'public', 'images', 'convenio-inmobiliaria-montano.jpg');

if (!fs.existsSync(imgPath)) {
    console.error('File does NOT exist!');
} else {
    const stats = fs.statSync(imgPath);
    console.log('File size:', stats.size, 'bytes');
    const buffer = fs.readFileSync(imgPath);
    console.log('First 10 bytes (hex):', buffer.subarray(0, 10).toString('hex'));
}
