#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import sys
from setuptools import find_packages, setup

setup(name = "django-ajax-tile",
      author = "Eric Man",
      url = "http://github.com/GradConnection/django-ajax-tile",
      version = "0.0",
      packages = find_packages('src'),
      package_dir = {'': 'src'},
      include_package_data = True,
      zip_safe = True,
      install_requires = ['setuptools'],
)

