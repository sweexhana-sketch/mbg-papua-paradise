const fs = require('fs');
const path = 'd:/calvin file/unduhan/papua barat daya web/mbg-papua-paradise-main/public/data/jalan_nasional_v2.json';

const fd = fs.openSync(path, 'r');
const buffer = Buffer.alloc(5000000);
fs.readSync(fd, buffer, 0, 5000000, 0);
const content = buffer.toString();
const propIndex = content.indexOf('"properties":');
if (propIndex !== -1) {
    console.log(content.substring(propIndex, propIndex + 1000));
} else {
    console.log('Properties not found in first 100KB');
}
fs.closeSync(fd);
