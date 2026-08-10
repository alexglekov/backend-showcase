import sharp from 'sharp';

// TODO: return this with another lib
export const resizePhoto = async (
  buffer: Buffer,
  sizeX: number,
  sizeY: number,
) => {
  return sharp(buffer)
    .resize(sizeX, sizeY)
    .jpeg({ progressive: true, force: false, quality: 90 })
    .png({ progressive: true, force: false, quality: 90 })
    .webp({ force: false, quality: 90 })
    .toBuffer();
};
