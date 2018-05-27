#!/usr/bin/env python
import sys
try:
    import markdown
    import jinja2
except ImportError:
    print("You must have the Markdown and Jinja2 python libraries installed.")
    sys.exit(-1)
import os.path
from html.parser import HTMLParser

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SRC_DIR = os.path.join(BASE_DIR, 'src')
OUT_DIR = os.path.join(BASE_DIR, 'out', 'doc')

class TOCParser(HTMLParser):
    def __init__(self, tags=['h1', 'h2', 'h3']):
        HTMLParser.__init__(self)
        self.tags = tags
        self.toc = []
        self.output = []
        self.accum = None
        self.header_index = 1

        self.online = True # Are we outputting the content we find?
        self.title = None

    def _convert_attr(self, attr):
        return "".join([
            ' %s="%s"' % (key, value)
            for key, value in attr
            ])

    def handle_starttag(self, tag, attr):
        if tag in self.tags:
            # Start tracking content
            assert self.accum is None
            self.accum = []

            # Check if we're the first top level (interpret that as
            # the page title).
            level = self.tags.index(tag)
            if level == 0 and self.title is None:
                self.online = False
                return

            # Add a reference to this header
            id = 'h_%d' % self.header_index
            attr.append(('id', id))

            # Link back to the top, unless we're already there.
            if self.header_index > 1:
                self.output.append('<div class="header">')
                self.output.append(
                    '<div class="top"><a href="#title" title="Return to top">'+
                    '&#x25b2;</a></div>'
                    )

        # Accumulate the transformed version
        content = "<%s%s>" % (tag, self._convert_attr(attr))
        self.output.append(content)

    def handle_startendtag(self, tag, attr):
        if self.online:
            content = "<%s%s>" % (tag, self._convert_attr(attr))
            self.output.append(content)

    def handle_entityref(self, name):
        if self.online:
            self.output.append("&%s;" % name)

    def handle_charref(self, name):
        if self.online:
            self.output.append("&#%s;" % name)

    def handle_data(self, data):
        if self.accum is not None:
            self.accum.append(data)
        if self.online:
            self.output.append(data)

    def handle_endtag(self, tag):
        if tag in self.tags:
            content = "".join(self.accum)
            level = self.tags.index(tag)
            self.accum = None

            if level == 0 and self.title is None:
                self.online = True
                self.title = content
                return

            self.toc.append((level, '#h_%d' % self.header_index, content))
            self.output.append("</%s>" % tag)
            if self.header_index > 1:
                self.output.append('</div>')
            self.header_index += 1
        else:
            self.output.append("</%s>" % tag)

    def get_html(self):
        return "".join(self.output)

def build():
    # Make sure we have the output directory
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    # Find the template we'll use
    env = jinja2.Environment(loader=jinja2.FileSystemLoader(SRC_DIR))
    template = env.get_template('base.html')

    # Convert all our markdown source files.
    for filename in os.listdir(SRC_DIR):
        if filename.endswith('.md'):
            # Load the markdown, convert it
            md = open(os.path.join(SRC_DIR, filename),'r').read()
            html = markdown.markdown(md)

            # Parse the generated HTML to extract the TOC
            parser = TOCParser()
            parser.feed(html)
            parser.close()

            # Create the final result
            result = template.render(
                title = parser.title,
                content = parser.get_html(),
                toc = parser.toc
                )

            # Write it out
            destination = os.path.join(OUT_DIR, "%s.html" % filename[:-3])
            open(destination, 'w').write(result)
            print("Built: %s" % destination)

if __name__ == '__main__':
    build()
