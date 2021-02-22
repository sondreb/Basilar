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

Basilar is built on NodeJS, it does not require any fancy runtime that is not officially supported on your operating system.

Basilar is not some fancy CLI that require you to learn a lot of commands.

Basilar allows you to use your favorite editor.

Enjoy.

# Setup

After you either copy the files in this repo or run clone, you can modify the content of your website/blog by editing content within the "pages" folder. The "www" folder is your template, it has a HTML template, CSS and JS file.

All content within "pages" will be replicated into the "dist" output, except for the .md files which will be transformed into .html.

# Basic or Automated

You can use Basilar in two manners, one of them is manually running the build process and commiting the generated output to your repository. You can then very easily use GitHub Pages to host your "/docs" output.

The more advanced way of using Basilar, is to use the GitHub Actions which will automatically build the "/docs" output on a GitHub Agent and publish this to the "gp_pages" branch, which will then be published to GitHub Pages.

The second option is prefered if you don't want to mix the output and your markdown, the first option is fine for smaller projects.

# Q&A

Q: Why not publish Basilar as a CLI / package?   
A: To make your life easier, you can modify the generator directly to fit your needs.

Q: Can I read the HTML template from an URL?   
A: Sure, just modify the code.
