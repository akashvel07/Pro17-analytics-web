const fs = require('fs');
const files = {
  'services.html': ['Home \\ Services', '<a href="index.html" class="breadcrumb-link">Home</a> \\ Services'],
  'data-analytics.html': ['Home \\ Data &amp; Analytics', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="services.html" class="breadcrumb-link">Services</a> \\ Data &amp; Analytics'],
  'cloud-engineering.html': ['Home \\ Cloud Engineering', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="services.html" class="breadcrumb-link">Services</a> \\ Cloud Engineering'],
  'digital-engineering.html': ['Home \\ Digital Engineering', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="services.html" class="breadcrumb-link">Services</a> \\ Digital Engineering'],
  'cyber-security.html': ['Home \\ Cyber Security', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="services.html" class="breadcrumb-link">Services</a> \\ Cyber Security'],
  'consulting-services.html': ['Home \\ Consulting Services', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="services.html" class="breadcrumb-link">Services</a> \\ Consulting Services'],
  'expertise.html': ['Home \\ Expertise', '<a href="index.html" class="breadcrumb-link">Home</a> \\ Expertise'],
  'intelligent-edges.html': ['Home \\ Intelligent Edges', '<a href="index.html" class="breadcrumb-link">Home</a> \\ <a href="expertise.html" class="breadcrumb-link">Expertise</a> \\ Intelligent Edges'],
  'about.html': ['home \\ about us', '<a href="index.html" class="breadcrumb-link">Home</a> \\ About Us'],
  'contact.html': ['Home \\ Contact', '<a href="index.html" class="breadcrumb-link">Home</a> \\ Contact'],
  'privacy-policy.html': ['Home \\ Privacy Policy', '<a href="index.html" class="breadcrumb-link">Home</a> \\ Privacy Policy'],
  'cookie-policy.html': ['Home \\ Cookie Policy', '<a href="index.html" class="breadcrumb-link">Home</a> \\ Cookie Policy']
};

for (const [file, [search, replace]] of Object.entries(files)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(search)) {
      content = content.replace(search, replace);
      fs.writeFileSync(file, content);
      console.log('Successfully updated ' + file);
    } else {
      console.log('Search string not found in ' + file);
    }
  }
}
