const { Jimp } = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('assets/images/big-data-warehouse.png');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx];
      const g = this.bitmap.data[idx+1];
      const b = this.bitmap.data[idx+2];
      // Close to white
      if (r > 240 && g > 240 && b > 240) {
          this.bitmap.data[idx+3] = 0;
      }
    });
    image.write('assets/images/big-data-warehouse-transparent.png');
    console.log("Image processed.");
  } catch (err) {
    console.error("Error:", err);
  }
}
processImage();
