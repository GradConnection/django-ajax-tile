from django import http
from django.template.response import TemplateResponse as render
from tile.decorators import tile
from django.core.urlresolvers import reverse

def home(request):
  template = "index.html"
  return render(request, template, {})

@tile("include/test.html", "#container", context_data=['message'])
def test(request, message):
  template = "test.html"

  return render(request, template, {'message':message,
    'id': 1})

def redirect(request, message):
  return http.HttpResponseRedirect(reverse('test', 
    kwargs=dict(message=message)))

