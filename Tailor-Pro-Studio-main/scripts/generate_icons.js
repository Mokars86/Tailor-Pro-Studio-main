import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const sourceImage = path.resolve('public/tailor_pro_logo.jpg');
const resDir = path.resolve('android/app/src/main/res');
const BRAND_BG = 0x01312FFF; // #01312F with 100% opacity

const iconSpecs = [
  { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 }
];

const splashSpecs = [
  { dir: 'drawable', w: 480, h: 800 },
  { dir: 'drawable-port-mdpi', w: 320, h: 480 },
  { dir: 'drawable-port-hdpi', w: 480, h: 800 },
  { dir: 'drawable-port-xhdpi', w: 720, h: 1280 },
  { dir: 'drawable-port-xxhdpi', w: 960, h: 1600 },
  { dir: 'drawable-port-xxxhdpi', w: 1280, h: 1920 },
  { dir: 'drawable-land-mdpi', w: 480, h: 320 },
  { dir: 'drawable-land-hdpi', w: 800, h: 480 },
  { dir: 'drawable-land-xhdpi', w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi', w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi', w: 1920, h: 1280 }
];

async function generateIcons() {
  console.log('Reading source image:', sourceImage);
  const image = await Jimp.read(sourceImage);

  // 1. Generate Mipmap Launcher Icons
  for (const spec of iconSpecs) {
    const targetFolder = path.join(resDir, spec.dir);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // Standard Launcher Icon (e.g. 48x48, 72x72, 96x96, 144x144, 192x192)
    const imgStandard = image.clone().resize({ w: spec.size, h: spec.size });
    await imgStandard.write(path.join(targetFolder, 'ic_launcher.png'));

    // Round Launcher Icon
    const imgRound = image.clone().resize({ w: spec.size, h: spec.size });
    await imgRound.write(path.join(targetFolder, 'ic_launcher_round.png'));

    // Adaptive Foreground Icon (scaled down inside safe zone of 108dp canvas)
    const fgCanvas = new Jimp({ width: spec.fgSize, height: spec.fgSize, color: BRAND_BG });
    const innerLogoSize = Math.round(spec.fgSize * 0.65);
    const scaledLogo = image.clone().resize({ w: innerLogoSize, h: innerLogoSize });
    const offset = Math.round((spec.fgSize - innerLogoSize) / 2);
    fgCanvas.composite(scaledLogo, offset, offset);
    await fgCanvas.write(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`Generated launcher icons for ${spec.dir} (size: ${spec.size}px, fg: ${spec.fgSize}px)`);
  }

  // 2. Generate Splash Screen Images
  for (const spec of splashSpecs) {
    const targetFolder = path.join(resDir, spec.dir);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const splashCanvas = new Jimp({ width: spec.w, height: spec.h, color: BRAND_BG });
    const maxLogoDim = Math.round(Math.min(spec.w, spec.h) * 0.45);
    const splashLogo = image.clone().resize({ w: maxLogoDim, h: maxLogoDim });
    const offsetX = Math.round((spec.w - maxLogoDim) / 2);
    const offsetY = Math.round((spec.h - maxLogoDim) / 2);
    splashCanvas.composite(splashLogo, offsetX, offsetY);
    await splashCanvas.write(path.join(targetFolder, 'splash.png'));

    console.log(`Generated splash for ${spec.dir} (${spec.w}x${spec.h})`);
  }

  // 3. Generate PWA icons in public folder
  const pwa192 = image.clone().resize({ w: 192, h: 192 });
  await pwa192.write(path.resolve('public/pwa-192x192.png'));

  const pwa512 = image.clone().resize({ w: 512, h: 512 });
  await pwa512.write(path.resolve('public/pwa-512x512.png'));

  const appleIcon = image.clone().resize({ w: 180, h: 180 });
  await appleIcon.write(path.resolve('public/apple-touch-icon.png'));

  console.log('Successfully generated all Android launcher icons, splash screens, and PWA custom brand icons!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});

