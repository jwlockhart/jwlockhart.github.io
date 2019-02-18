#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = 'Jeffrey W. Lockhart'
SITENAME = "Jeff Lockhart's Site"
SITETITLE = 'Jeff Lockhart'
SITEURL = ''
SITELOGO = '/images/face.jpg'
FAVICON = '/images/favicon.ico'

PATH = 'content'

TIMEZONE = 'America/New_York'

DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('CV', '/cv.pdf'), ('blog', '/'))

#navbar
#DISPLAY_PAGES_ON_MENU = True
MAIN_MENU = True
MENUITEMS = (('Archives', '/archives.html'),
             ('Categories', '/categories.html'),
	     ('Tags', '/tags.html'),)

# Social widget
SOCIAL = (('twitter', 'https://twitter.com/jw_lockhart'),
	  ('github', 'https://github.com/jwlockhart'),
	  ('google', 'https://scholar.google.com/citations?user=ptcuwrcAAAAJ'),)

DEFAULT_PAGINATION = False

#theme
THEME = "/home/jwlock/pelican-themes/Flex"

PLUGIN_PATHS = ['/home/jwlock/pelican-plugins']
PLUGINS = ['sitemap', 'simple_footnotes', 'render_math']
MD_EXTENSIONS = ['codehilite(css_class=highlight)','extra']
PYGMENTS_STYLE = 'perldoc'

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
