import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'src/routes/_authenticated/settings.tsx',
  'src/routes/_authenticated/dashboard.tsx',
  'src/routes/_authenticated/calendar.tsx',
  'src/routes/_authenticated/admin.tsx',
];

filesToUpdate.forEach((file) => {
  if (!fs.existsSync(file)) {
    console.log(`File not found: ${file}`);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace URLs
  content = content.replace(/https:\/\/igcloner\.lovable\.app/g, 'https://www.igcloner.com');
  content = content.replace(/igcloner\.lovable\.app/g, 'www.igcloner.com');
  content = content.replace(/igcloner\.app/g, 'www.igcloner.com');

  // Replace Brand Name
  content = content.replace(/IGCloner/g, 'IG-Cloner');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
});
