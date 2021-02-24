'use strict';

const fs = require('fs');
const JSDOM = require('jsdom').JSDOM;
const showdown = require('showdown'); // This is our fork of showdown, which will auto-link to HTTPS as oppose to HTTP. Currently not in used, replaced with 'markdown-it'.
const domspace = require('domspace');
const path = require('path');
const hljs = require('highlight.js'); // https://highlightjs.org/
const iterator = require('markdown-it-for-inline');

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
      } catch (__) { }
    }

    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

var r = new RegExp('^(?:[a-z]+:)?//', 'i');

md.use(iterator, 'url_new_win', 'link_open', function (tokens, idx) {

  let url = tokens[idx].attrs[0][1];

  // If the URL is relative, replace the ".md" ending with ".html".
  if (!r.test(url) && url.endsWith(".md")) {
    tokens[idx].attrs[0][1] = url.replace('.md', '.html');
  }

  //console.log(!r.test(url) + ": " + url);

  //console.log(tokens[idx].attrs);
  //console.log(tokens);
  //console.log(idx);
  //tokens[idx].attrPush([ 'target', '_blank' ]);
});

function isRelative(url) {
  return (/^(\.){1,2}(\/){1,2}$/.test(url.slice(0, 3)) ||
    /(\/){1,2}(\.){1,2}(\/){1,2}/.test(url));
}

function process(dir, template, converter, containerId) {
  const files = fs.readdirSync(dir);

  // Load the template into a DOM. We currently do this for each iteration, to start off with a "fresh" DOM.
  const htmlDoc = new JSDOM(template);

  files.forEach(function (file) {

    var currentPath = path.join(dir, file);

    if (fs.statSync(currentPath).isDirectory()) {

      // Modify the path
      const distPath = currentPath.replace('pages', 'dist');

      fs.mkdirSync(distPath);

      process(currentPath, template, converter, containerId);
    }
    else {
      const extension = path.extname(currentPath);

      if (extension == '.md') {
        const markdown = fs.readFileSync(currentPath, 'utf-8');
        // const content = converter.makeHtml(markdown);
        const content = md.render(markdown);

        htmlDoc.window.document.getElementById(containerId).innerHTML = content;

        // Render the document title if there is any H1 tags available.
        var h1s = htmlDoc.window.document.getElementsByTagName("H1");

        if (h1s.length > 0) {
          htmlDoc.window.document.title = h1s[0].innerHTML + ' - ' + htmlDoc.window.document.title;
        }

        // Disabled until this issue has been fixed: https://github.com/papandreou/domspace/issues/25
        // domspace(htmlDoc.window.document);

        let distPath = currentPath.replace('pages', 'dist');
        distPath = distPath.replace('.md', '.html');

        // htmlDoc.window.document.innerHTML

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
  fs.copyFileSync('CNAME', 'dist/CNAME');

  // First get the HTML template
  const template = fs.readFileSync('www/index.html', 'utf-8');

  // Create the MD to HTML converter instance.
  // const converter = new showdown.Converter({ simplifiedAutoLink: true, tables: true, strikethrough: true });

  // Loop through all the content.  
  process('pages', template, md, containerId);

  console.log('Processing completed. Output available in "dist" folder.');
}

run('content', true);
