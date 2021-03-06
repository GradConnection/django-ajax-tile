import json
from django.template.response import TemplateResponse

def tile(template=None, selector=None, context_data=[], title=None):
  def _decorator(view):
    if not isinstance(selector, basestring) and selector is not None:
      raise TypeError("selector must be a string")

    if not isinstance(template, basestring) and template is not None:
      raise TypeError("template must be a string")

    if not isinstance(context_data, list):
      raise TypeError("context_data must be a list of strings")

    def _wrapped(request, *args, **kwargs):
      response = view(request, *args, **kwargs)
      if request.is_ajax():
        response['X-Tile-Partial'] = True
        response['X-Tile-Selector'] = selector
        if title:
          if hasattr(title, "__call__"):
            try:
              response['X-Tile-Title'] = title()
            except:
              response['X-Tile-Title'] = title(request)
          else:
            if not isinstance(title, basestring):
              raise TypeError("title must be a string or function")
            response['X-Tile-Title'] = title
        if isinstance(response, TemplateResponse):
          data = [(key, response.context_data[key]) for key in context_data]
          response.template_name = "tile/template.html"
          response.context_data['tile_template_name'] = template
          response['X-Tile-Context-Data'] = json.dumps(dict(data))
      return response
    return _wrapped
  return _decorator
