const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace "Switch to Main" link with "Change to Iteration 2"
  const updated = content.replace(
    /Switch to Main<\/a>/g,
    'Change to Iteration 2</a>'
  ).replace(
    /href="Main\.html"\s+style="color: inherit; text-decoration: underline;">Change to Iteration 2/g,
    'href="xero-landing/indexi2.html" style="color: inherit; text-decoration: underline;">Change to Iteration 2'
  );

  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated: ${file}`);
  }
}
