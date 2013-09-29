import os.path
from fabric.api import *

PROJ_SHORT = "undum"
PROJ_FULL = "undum.com"

env.host_string = "undum.com"
env.user = "ubuntu"

HERE = os.path.abspath(os.path.dirname(__file__))
DOC_DIR = os.path.join(HERE, "..", "docs")
DOC_OUT_DIR = os.path.join(DOC_DIR, "out")
ROOT_DIR = os.path.join(HERE, "..")
TAR = "/tmp/%s.tar" % PROJ_SHORT

def one_time_nginx_setup():
    """Adds the symbolic links to make the webserver load the site."""
    send_conf()
    sudo("ln -s /var/www/%s/nginx.conf /etc/nginx/sites-available/%s" % (
            PROJ_FULL, PROJ_FULL))
    sudo("ln -s /etc/nginx/sites-available/%s /etc/nginx/sites-enabled/%s" % (
            PROJ_FULL, PROJ_FULL))
    sudo("service nginx reload")

def send_conf():
    """Updates the webserver config file."""
    put(os.path.join(HERE, "nginx.conf"), "/var/www/%s/" % PROJ_FULL)
    sudo("service nginx reload")

def prepare():
    """Builds the API docs."""
    with lcd(DOC_DIR):
        local("python make.py")

def package():
    """Create an archive with the site content in it."""
    # Start with the docs.
    with lcd(DOC_OUT_DIR):
        local("tar -cf %s *.html media doc" % TAR)

    # Add games.
    with lcd(ROOT_DIR):
        local("tar --append -f %s games" % TAR)

    # Compress.
    local("gzip -f %s" % TAR)

def send():
    """Send the site content."""
    put("/tmp/%s.tar.gz" % PROJ_SHORT, "/tmp/")
    with cd("/var/www/%s" % PROJ_FULL):
        run("rm -rf *")
        run("tar -z --transform 's,^,site/,' -x -f /tmp/%s.tar.gz" % PROJ_SHORT)
    send_conf()

def deploy():
    """Do a full refresh of the site content."""
    prepare()
    package()
    send()

