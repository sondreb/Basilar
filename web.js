/* This is a basic and plain JavaScript file that will be copied to your website.
You can use it to add your own custom scripts. The functions below is added to handle
the dark and light theme modes, and persist the user selection across visits to your site. */

function isDarkMode() {
    if (localStorage.getItem('theme')) {
        if (localStorage.getItem('theme') === 'dark') {
            return true;
        }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
    }
}

function initTheme() {
    const checkbox = document.getElementById('switch');

    // If the initial theme is dark, toggle the button.
    if (isDarkMode()) {
        checkbox.checked = true;
        document.body.setAttribute('data-theme', 'dark');
    }

    // After we set initial state, we'll hook up the event handler.
    checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'white');
        }
    })
}

initTheme();
