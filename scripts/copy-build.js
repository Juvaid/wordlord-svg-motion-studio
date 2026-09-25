import fs from 'fs';
import path from 'path';

const distFile = path.resolve('dist/index.html');
if (fs.existsSync(distFile)) {
  const content = fs.readFileSync(distFile, 'utf8');
  
  const targets = [
    path.resolve('wordlord-svg-animation-studio.html'),
    '/Volumes/disk 2/wordlord-svg-animation-studio.html',
    '/Volumes/disk 2/Desktop/WORDLORD/wordlord-svg-animation-studio.html',
  ];

  targets.forEach(target => {
    try {
      fs.writeFileSync(target, content, 'utf8');
      console.log(`Synchronized build to: ${target}`);
    } catch (e) {
      console.warn(`Could not copy to ${target}:`, e.message);
    }
  });
} else {
  console.error("dist/index.html not found!");
}
