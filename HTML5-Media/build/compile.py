#!/usr/bin/python2.4

import httplib, urllib, sys

# Define the parameters for the POST request and encode them in
# a URL-safe format.
linestring = open(sys.argv[1], 'r').read()

params = urllib.urlencode([
	('js_code', linestring), 
	('compilation_level', 'WHITESPACE_ONLY'),
 	('output_format', 'text'),
	('output_info', 'compiled_code'),
])

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', params, headers)
response = conn.getresponse()
data = response.read()
print data
conn.close