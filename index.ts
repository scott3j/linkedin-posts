import * as fs from 'fs';
import * as path from 'path';

// Function to check and modify filenames with spaces
function checkAndModifyFilenames(directory: string): void {
  const files = fs.readdirSync(directory);
  files.forEach(filename => {
    if (filename.endsWith('.md') && filename.includes(' ')) {
      const newFilename = filename.replace(/ /g, '-');
      fs.renameSync(
        path.join(directory, filename),
        path.join(directory, newFilename)
      );
      console.log(`Modified: ${filename} to ${newFilename}`);
    }
  });
}

// Function to read directory and filter markdown files
function getMarkdownFiles(directory: string): string[] {
  const files = fs.readdirSync(directory);
  return files.filter(file => path.extname(file).toLowerCase() === '.md');
}

// Function to generate markdown link
function generateMarkdownLink(fileName: string): string {
  const name = path.parse(fileName).name;
  const title = name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return `- [${title}](/docs/${fileName})`;
}

// Main function
function updateReadme(): void {
  const rootDir = process.cwd();
  const docsDir = path.join(rootDir, 'docs');

  // Check if docs directory exists
  if (!fs.existsSync(docsDir)) {
    console.error("The 'docs' directory does not exist in the root directory.");
    return;
  }

  // First, check and modify filenames with spaces in the docs directory
  checkAndModifyFilenames(docsDir);

  const readmePath = path.join(rootDir, 'README.md');
  const markdownFiles = getMarkdownFiles(docsDir);

  // Generate links
  const links = markdownFiles.map(generateMarkdownLink).join('\n');

  // Read existing README content
  let readmeContent = fs.readFileSync(readmePath, 'utf-8');

  // Define markers for the section to update
  const startMarker = '<!-- FILE_LIST_START -->';
  const endMarker = '<!-- FILE_LIST_END -->';

  // Check if markers exist, if not, add them
  if (!readmeContent.includes(startMarker) || !readmeContent.includes(endMarker)) {
    readmeContent += `\n\n${startMarker}\n${endMarker}`;
  }

  // Replace content between markers
  const newContent = readmeContent.replace(
    new RegExp(`${startMarker}[\\s\\S]*${endMarker}`),
    `${startMarker}\n${links}\n${endMarker}`
  );

  // Write updated content back to README.md
  fs.writeFileSync(readmePath, newContent);

  console.log('README.md has been updated with the list of markdown files from the docs directory.');
}

// Run the script
updateReadme();