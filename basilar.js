'use strict';

const configuration = {
  containerId: 'content',
  destination: 'dist', // Do not prefix these with "./"
  theme: 'www', // Do not prefix these with "./"
  content: 'pages' // Do not prefix these with "./"
}

let serve = false;

if (process.argv.length > 2) {
  serve = (process.argv[2] == 'serve');
}

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

function render(dir, template, converter) {
  const files = fs.readdirSync(dir);

  files.forEach(function (file) {

    // Load the template into a DOM. We currently do this for each iteration, to start off with a "fresh" DOM.
    const htmlDoc = new JSDOM(template);

    var currentPath = path.join(dir, file);

    if (fs.statSync(currentPath).isDirectory()) {

      // Modify the path
      const distPath = currentPath.replace(configuration.content, configuration.destination);

      if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath);
      }

      render(currentPath, template, converter);
    }
    else {
      const extension = path.extname(currentPath);

      if (extension == '.md') {
        const markdown = fs.readFileSync(currentPath, 'utf-8');
        // const content = converter.makeHtml(markdown);
        const content = md.render(markdown);

        htmlDoc.window.document.getElementById(configuration.containerId).innerHTML = content;

        // Render the document title if there is any H1 tags available.
        var h1s = htmlDoc.window.document.getElementsByTagName("H1");

        if (h1s.length > 0) {
          htmlDoc.window.document.title = h1s[0].innerHTML + ' - ' + htmlDoc.window.document.title;
        }

        // Disabled until this issue has been fixed: https://github.com/papandreou/domspace/issues/25
        // domspace(htmlDoc.window.document);

        let distPath = currentPath.replace(configuration.content, configuration.destination);
        distPath = distPath.replace('.md', '.html');

        fs.writeFileSync(distPath, htmlDoc.window.document.documentElement.outerHTML, 'utf-8');
      }
      else {
        const distPath = currentPath.replace(configuration.content, configuration.destination);
        fs.copyFileSync(currentPath, distPath);
      }
    }
  });
}

function renderFile(file, template) {
  const htmlDoc = new JSDOM(template);
  var currentPath = file;

  if (fs.statSync(currentPath).isDirectory()) {
    // When a file is deleted, event is triggered twice, one for the file and the second for the directory. We probably don't need to do anything, not even output this log entry.
  }
  else {
    const extension = path.extname(currentPath);

    if (extension == '.md') {
      const markdown = fs.readFileSync(currentPath, 'utf-8');
      const content = md.render(markdown);

      htmlDoc.window.document.getElementById(configuration.containerId).innerHTML = content;

      // Render the document title if there is any H1 tags available.
      var h1s = htmlDoc.window.document.getElementsByTagName("H1");

      if (h1s.length > 0) {
        htmlDoc.window.document.title = h1s[0].innerHTML + ' - ' + htmlDoc.window.document.title;
      }

      let distPath = currentPath.replace(configuration.content, configuration.destination);
      distPath = distPath.replace('.md', '.html');

      fs.writeFileSync(distPath, htmlDoc.window.document.documentElement.outerHTML, 'utf-8');
    }
    else {
      const distPath = currentPath.replace(configuration.content, configuration.destination).replace(configuration.theme, configuration.destination);
      fs.copyFileSync(currentPath, distPath);
    }
  }
}

function run(wipe) {
  console.log('Basilar processing...');

  if (wipe) {
    // Removing the "dist" folder.
    fs.rmdirSync(configuration.destination, { recursive: true });

    // Create the dist folder.
    fs.mkdirSync(configuration.destination);
  } else {
    fs.unlinkSync(path.join(configuration.destination, 'style.css'));
    fs.unlinkSync(path.join(configuration.destination, 'web.js'));
    fs.unlinkSync(path.join(configuration.destination, 'favicon.png'));
    fs.unlinkSync(path.join(configuration.destination, 'CNAME'));
  }

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
  render('pages', template, md);

  console.log('Processing completed. Output available in "dist" folder.');
}

function runFile(filename) {
  console.log('Basilar processing: ' + filename);

  // First get the HTML template
  const template = fs.readFileSync('www/index.html', 'utf-8');

  // Loop through all the content.  
  renderFile(filename, template, md);

  console.log('Processing completed. Output available in "dist" folder.');
}

if (serve) {
  const liveServer = require('live-server');

  var params = {
    port: 8181, // Set the server port. Defaults to 8080.
    // host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    root: "./dist", // Set root directory that's being served. Defaults to cwd.
    open: true, // When false, it won't load your browser by default.
    // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    // file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    wait: 1300, // Waits for all changes, before reloading. If your site is large, increase this.
    // mount: [['/components', './node_modules']], // Mount a directory to a route.
    // logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    // middleware: [function (req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
  };

  // Run an initial build first.
  run(true);

  liveServer.start(params);

  const watch = require('node-watch');

  watch(['./www', './pages'], { recursive: true }, function (evt, name) {
    console.log(evt + ': %s changed.', name);

    if (evt == 'remove') {
      // If a file was removed, we'll ignore the event. Next time a full build is run, it will be wiped anyway.
    }
    else {
      // If the edited file is an HTML file, we should re-render the whole project.
      if (path.extname(name) == '.html') {
        run(false);
      }
      else {
        runFile(name);
      }
    }
  });
}
else {
  run(true);
}
