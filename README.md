django-ajax-tile
================

Installation
============

    pip install git+ssh://git@github.com/GradConnection/django-ajax-tile.git

Example
=======

Python
======
    from django.template.response import TemplateResponse as render
    from tile.decorators import tile

    @tile("include/test.html", "#container", context_data=['message'], title="what")
    def test(request, message):
      template = "test.html"

      return render(request, template, {'message':message,
        'id': 1})

```"include/test.html"``` is the tile template name.

```"#container"``` is the jQuery selector for the element the template content goes 
into.

```context_data``` is the list of keys to extract from context to pass back to the client.

```title``` is the title the page should change to when the tile is loaded.

The rest of the view function is a normal view function returning a full page.
You must use TemplateResponse to use the @tile decorator.

HTML/JS
=======

    function onclick(e) {
      e.preventDefault();
      tile.get($(this).attr("href"), function(context){
        $("a").click(onclick);
        if (context) {
          $("span").text(context["message"]);
        }
      });
    }
    $("a").click(onclick);


The first argument is the url of the GET request.

The second argument is a callback function that will be run when the request is complete. ```context``` is the data sent back by the server.

The ```$("a").click(onclick);``` must be run again since the newly substituted html data hasn't had that run yet. (Though any javascript inside the html will be run.)
