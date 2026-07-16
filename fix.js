const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const file of files) {
  let content = fs.readFileSync(file);
  let str = content.toString('utf8');
  // Check if it's corrupted by looking for 'â'
  if (str.includes('â€¢') || str.includes('â†—') || str.includes('Â·') || str.includes('âœ¦')) {
    console.log(`Fixing ${file}...`);
    try {
      let restoredBytes = Buffer.from(str, 'binary');
      let restoredStr = restoredBytes.toString('utf8');
      
      // We also need to re-apply the correct link updates for Main.html and the footer
      restoredStr = restoredStr.replace(/href="index\.html"/g, 'href="Main.html"');
      restoredStr = restoredStr.replace(/Transforming Data into Strategic Insights<\/p>/g, 'Transforming Data into Strategic Insights | <a href="Main.html" style="color: inherit; text-decoration: underline;">Switch to Main</a></p>');

      fs.writeFileSync(file, restoredStr, 'utf8');
    } catch (e) {
      console.error(`Error fixing ${file}: ${e}`);
    }
  } else {
    // If not corrupted, just apply the link updates
    console.log(`Updating links for ${file}...`);
    str = str.replace(/href="index\.html"/g, 'href="Main.html"');
    str = str.replace(/Transforming Data into Strategic Insights<\/p>/g, 'Transforming Data into Strategic Insights | <a href="Main.html" style="color: inherit; text-decoration: underline;">Switch to Main</a></p>');
    fs.writeFileSync(file, str, 'utf8');
  }
}
