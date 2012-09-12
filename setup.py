try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

version_tuple = __import__('tile').VERSION
if len(version_tuple) == 3:
    version = "%d.%d_%s" % version_tuple
else:
    version = "%d.%d" % version_tuple[:2]

setup(name = "tile",
      author = "Eric Man",
      url = "http://github.com/GradConnection/django-ajax-tile",
      version = version,
      packages = ['tile',],
      package_dir = {'': ''},
      package_data = {'tile': ['static/*',],},
      # distutils complain about these, anyone know an easy way to silence it?
      zip_safe = True,
)

