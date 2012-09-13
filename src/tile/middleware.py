from django import forms
from django.template.defaultfilters import slugify
from django.conf import settings
from django.core.urlresolvers import reverse
from django.contrib.sites.models import Site, SiteManager
from django.template.response import TemplateResponse as render
from django import http

class TileMiddleware(object):
  def process_response(self, request, response):
    protocol = "https://" if request.is_secure() else "http://"
    host = request.get_host()
    path = request.path
    
    if isinstance(response, http.HttpResponseRedirect):
      response['X-Tile-From-Location'] = response['location']
      if response.get('X-Tile-Partial'):
        new_response = http.HttpResponse("")
        new_response['X-Tile-Partial'] = True
        new_response['X-Tile-From-Location'] = response['location']
        return new_response
    else:
      response['X-Tile-From-Location'] = protocol + host + path
    
    return response
