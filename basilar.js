'use strict';

const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const showdown = require('showdown');
const domspace = require('domspace');
const path = require('path');

function process(dir, htmlDoc, converter, containerId, prettify) {
  const files = fs.readdirSync(dir);

  files.forEach(function (file) {

    var currentPath = path.join(dir, file);

    if (fs.statSync(currentPath).isDirectory()) {

      // Modify the path
      const distPath = currentPath.replace('pages', 'dist');

      fs.mkdirSync(distPath);

      process(currentPath, htmlDoc, converter, containerId, prettify);
    }
    else {
      const extension = path.extname(currentPath);

      if (extension == '.md') {
        const markdown = fs.readFileSync(currentPath, 'utf-8');
        const content = converter.makeHtml(markdown);

        htmlDoc.window.document.title = 'Hello!'; // TODO: Parse the markdown and set the title.
        htmlDoc.window.document.getElementById(containerId).innerHTML = content;

        if (prettify) {
          domspace(htmlDoc.window.document);
        }

        let distPath = currentPath.replace('pages', 'dist');
        distPath = distPath.replace('.md', '.html');

        fs.writeFileSync(distPath, htmlDoc.window.document.documentElement.outerHTML, 'utf-8');
      }
      else {
        const distPath = currentPath.replace('pages', 'dist');
        fs.copyFileSync(currentPath, distPath);
      }
    }
  });
}

function run(containerId, prettify) {
  console.log('Basilar processing...');

  // Removing the "dist" folder.
  fs.rmdirSync('dist', { recursive: true });

  // Create the dist folder.
  fs.mkdirSync('dist');

  // Copy the assets. // TODO: Make this a configuration setting ("basilar.json").
  fs.copyFileSync('www/style.css', 'dist/style.css');
  fs.copyFileSync('www/web.js', 'dist/web.js');

  // First get the HTML template
  const template = fs.readFileSync('www/index.html', 'utf-8');

  // Create the MD to HTML converter instance.
  const converter = new showdown.Converter({ tables: true, strikethrough: true });

  // Load the template into a DOM.
  const dom = new JSDOM(template);

  // Loop through all the content.  
  process('pages', dom, converter, containerId, prettify);

  console.log('Processing completed. Output available in "dist" folder.');
}

run('content', true);
