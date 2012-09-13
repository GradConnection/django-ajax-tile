#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
from setuptools import find_packages, setup

setup(name = "django-ajax-tile",
      author = "Eric Man",
      url = "http://github.com/GradConnection/django-ajax-tile",
      version = "0.12",
      packages = find_packages('src'),
      package_dir = {'tile': 'src/tile'},
      package_data={'tile': ['static/tile/*', 'templates/tile/*']},
      #data_files = [('static', [''])],
      include_package_data = True,
      zip_safe = True,
      install_requires = ['setuptools'],
)

