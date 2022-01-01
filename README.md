# Basilar

Basilar - *"The right tool for the job"*

Basilar is a very basic and easy to use static html generator that will produce HTML output from your Markdown files.

Basilar was developed as an alternative to some of the larger frameworks, that ends up generating very verbose output and have expansive list of features.

Basilar is basic, but it's elegant and simple.

Here is how you use it:

```sh
git clone https://github.com/sondreb/Basilar.git
cd Basilar
npm install
npm run build
```

Basilar let's you focus on your task, which is writing.

Basilar is for developers who want an awesome way to maintain websites, relying on simple logic and GitHub Actions and GitHub Pages.

Basilar is built on Node.js, it does not require any fancy runtime that is not officially supported on your operating system.

Basilar is not some fancy CLI that require you to learn a lot of commands.

Basilar allows you to use your favorite editor.

Enjoy.

# Setup

After you either copy the files in this repo or run clone, you can modify the content of your website/blog by editing content within the "pages" folder. The "www" folder is your template, it has a HTML template, CSS and JS file.

All content within "pages" will be replicated into the "dist" output, except for the .md files which will be transformed into .html.

The GitHub Action will publish the "dist" output into the "gh-pages" branch which can be setup to be published to GitHub Pages.

## IMPORTANT

You must modify the "CNAME" file and change domain in the file to your own e.g. "www.mydomain.com".

# Q&A

Q: Why not publish Basilar as a CLI / package?   
A: To make your life easier, you can modify the generator directly to fit your needs.

Q: Can I read the HTML template from an URL?   
A: Sure, just modify the code.


## Plugins to consider adding:

https://www.npmjs.com/package/markdown-it-include

