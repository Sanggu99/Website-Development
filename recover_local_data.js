// 1. Open the browser tab where you entered the projects (if it's still open and NOT refreshed)
// 2. Press F12 to open DevTools
// 3. Go to Console tab
// 4. Paste this code and press Enter:

const data = localStorage.getItem('seop_projects');
if (data) {
    const projects = JSON.parse(data);
    console.log(`✅ Found ${projects.length} projects in Local Storage!`);
    console.log('Copy the JSON below and save it to a file:');
    console.log(JSON.stringify(projects, null, 2));
} else {
    console.log('❌ No project data found in Local Storage of this tab.');
}
