#!/usr/bin/env python

import SimpleHTTPServer, BaseHTTPServer, os

os.chdir('../games')
try:
    print "Server starting. Visit http://localhost:8000/ in your browser."
    BaseHTTPServer.test(
        SimpleHTTPServer.SimpleHTTPRequestHandler, 
        BaseHTTPServer.HTTPServer
        )
except KeyboardInterrupt:
    print
