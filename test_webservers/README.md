# Web Servers

This directory contains minimal web-servers in common scripting languages.
These are designed to expose the `games` directory at http://localhost:8000/
so that you can debug your creation in the browser more easily. This is
needed because some browsers refuse to store data in localSettings when
serving files from a file:/// url. Simply start one of these servers
and use the http://localhost:8000/ address instead.

For example, the ruby server (requires Ruby installed):

    ruby serve.rb

Or on a unix-type machine;

    ./serve.rb

Similarly for Python (again you'll need Python installed)

    chdir games
    python -m http.server

You might already have Python installed, it is installed on Macs and Linux
machines by default.

If you have a minimal (< 20 lines) web server that can do this job in another
language, please ping me and I'll add it here. I am particularly interested in
servers that will run out of the box on Windows. I will not include .exe files,
however.
