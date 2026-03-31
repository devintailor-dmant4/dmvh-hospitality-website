import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMAGES_DIR = path.resolve("client/public/images");

async function convertImages() {
  const files = fs.readdirSync(IMAGES_DIR);
  const images = files.filter((f) => /\.(png|jpg|jpeg)$/i.test(f));

  console.log(`Converting ${images.length} images to WebP...`);

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of images) {
    const inputPath = path.join(IMAGES_DIR, file);
    const baseName = path.basename(file, path.extname(file));
    const outputPath = path.join(IMAGES_DIR, `${baseName}.webp`);

    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    try {
      const inputStat = fs.statSync(inputPath);
      await sharp(inputPath)
        .webp({ quality: 82, effort: 4 })
        .toFile(outputPath);

      const outputStat = fs.statSync(outputPath);
      const savings = (
        ((inputStat.size - outputStat.size) / inputStat.size) *
        100
      ).toFixed(1);
      console.log(
        `  ✓ ${file} → ${baseName}.webp  (${(inputStat.size / 1024).toFixed(0)}KB → ${(outputStat.size / 1024).toFixed(0)}KB, -${savings}%)`
      );
      converted++;
    } catch (err) {
      console.error(`  ✗ Failed: ${file}`, err);
      failed++;
    }
  }

  console.log(
    `\nDone: ${converted} converted, ${skipped} already existed, ${failed} failed.`
  );
}

convertImages().catch(console.error);
