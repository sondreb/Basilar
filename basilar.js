'use strict';

const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const showdown = require('showdown');
const domspace = require('domspace');
const path = require('path');
var hljs = require('highlight.js'); // https://highlightjs.org/

// full options list (defaults)
var md = require('markdown-it')({
  html: true,        // Enable HTML tags in source
  xhtmlOut: false,        // Use '/' to close single tags (<br />).
  // This is only for full CommonMark compatibility.
  breaks: false,        // Convert '\n' in paragraphs into <br>
  langPrefix: 'language-',  // CSS language prefix for fenced blocks. Can be
  // useful for external highlighters.
  linkify: true,        // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
  typographer: true,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externally.
  // If result starts with <pre... internal wrapper is skipped.
  // highlight: function (/*str, lang*/) { return ''; }
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(lang, str, true).value +
               '</code></pre>';
      } catch (__) {}
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

function process(dir, htmlDoc, converter, containerId) {
  const files = fs.readdirSync(dir);

  files.forEach(function (file) {

    var currentPath = path.join(dir, file);

    if (fs.statSync(currentPath).isDirectory()) {

      // Modify the path
      const distPath = currentPath.replace('pages', 'dist');

      fs.mkdirSync(distPath);

      process(currentPath, htmlDoc, converter, containerId);
    }
    else {
      const extension = path.extname(currentPath);

      if (extension == '.md') {
        const markdown = fs.readFileSync(currentPath, 'utf-8');
        // const content = converter.makeHtml(markdown);
        const content = md.render(markdown);

        htmlDoc.window.document.title = 'Hello!'; // TODO: Parse the markdown and set the title.
        htmlDoc.window.document.getElementById(containerId).innerHTML = content;

        domspace(htmlDoc.window.document);

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

function run(containerId) {
  console.log('Basilar processing...');

  // Removing the "dist" folder.
  fs.rmdirSync('dist', { recursive: true });

  // Create the dist folder.
  fs.mkdirSync('dist');

  // Copy the assets. // TODO: Make this a configuration setting ("basilar.json").
  fs.copyFileSync('www/style.css', 'dist/style.css');
  fs.copyFileSync('www/web.js', 'dist/web.js');
  fs.copyFileSync('www/favicon.png', 'dist/favicon.png');

  // First get the HTML template
  const template = fs.readFileSync('www/index.html', 'utf-8');

  // Create the MD to HTML converter instance.
  // const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true, strikethrough: true });

  // Load the template into a DOM.
  const dom = new JSDOM(template);

  // Loop through all the content.  
  process('pages', dom, md, containerId);

  console.log('Processing completed. Output available in "dist" folder.');
}

run('content', true);
