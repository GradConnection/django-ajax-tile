// Fix .clone for textarea
(function (original) {
  // https://github.com/spencertipping/jquery.fix.clone/blob/master/jquery.fix.clone.js
  jQuery.fn.clone = function () {
    var result           = original.apply(this, arguments),
        my_textareas     = this.find('textarea').add(this.filter('textarea')),
        result_textareas = result.find('textarea').add(result.filter('textarea')),
        my_selects       = this.find('select').add(this.filter('select')),
        result_selects   = result.find('select').add(result.filter('select'));

    for (var i = 0, l = my_textareas.length; i < l; ++i) $(result_textareas[i]).val($(my_textareas[i]).val());
    for (var i = 0, l = my_selects.length;   i < l; ++i) result_selects[i].selectedIndex = my_selects[i].selectedIndex;

    return result;
  };
}) (jQuery.fn.clone);

// Post to the provided URL with the specified parameters.
function post_to_url(path, parameters) {
    var form = $('<form></form>');

    form.attr("method", "post");
    form.attr("action", path);

    $.each(parameters, function(key, value) {
        var field = $('<input></input>');

        field.attr("type", "hidden");
        field.attr("name", key);
        field.attr("value", value);

        form.append(field);
    });

    // The form needs to be apart of the document in
    // order for us to be able to submit it.
    $(document.body).append(form);
    form.submit();
}


(function(window, undefined){
  // Exported functions

  function available() {
    return (JSON && window.history.pushState && window.History);
  }

  // get(url [title], [data], [callback])
  function get(url, title, data, callback) {
    ajax("GET", url, title, data);
  }

  // post(url [title], [data], [callback])
  function post(url, title, data, callback) {
    ajax("POST", url, title, data);
  }

  tile = { get:get, post:post, available:available}

  // ajax(type, url [title], [data], [callback])
  function ajax(type, url, title, data, callback){
    args = [title, data, callback].filter(function(a){ return a; });
    title = null;
    data = null;
    callback = null;
    
    if (typeof args[0] == "string") {
      title = args[0];
    }
    else if (typeof args[0] == "object") {
      data = args[0];
    }
    else if (typeof args[0] == "function") {
      callback = args[0];
    }
    if (typeof args[1] == "object") {
      data = args[1];
    }
    else if (typeof args[1] == "function") {
      callback = args[1];
    }
    if (typeof args[2] == "function") {
      callback = args[2];
    }
    if (!data && typeof title == "object") {
      data = title;
      title = null;
    }

    if (!available()) {
      if (type=="POST") {
        post_to_url(url, data || {});
      }
      else {
        if (data) {
          url = url + "?" + $.param(data);
        }
        window.location = url;
      }
      return;
    }

    $.ajax({
      type: type,
      url: url,
      data: data,
      success: makeSuccess(url, title, data, callback),
      async:false
    });
  }

  if (!available()) {
    return;
  }

  var stateData = [];
  var previousState = null;

  window.History.Adapter.bind(window,'statechange', function(e) {
    
    // When going to a state:
    //  1. Undo next state's changes (which is stored in forward).
    //  2. Add the state's changes

    var state = window.History.getState().data['state'];

    if (state) {
      var id = state.id;
      if (stateData[id]) {
        state = stateData[id];
      }
      else {
        stateData[id] = state; 
      }
    }

    // Save previous state's current 'state' before drawing over it.
    if (previousState){
      var selector = previousState.currentSelector;
      if (selector) {
        previousState.currentSelected = $(selector).clone();
      }
    }

    // Undo next state's changes without executing script.
    if (state && state.forwardSelector && state.forwardSelected) {
      $(state.forwardSelector).replaceWith(state.forwardSelected);
    }

    // Apply this state's changes, and execute scripts if any.
    if (state && state.currentSelector) {
      if (!state.currentSelected) {
        // No previous 'state' was stored, so use raw HTML.
        // Will execute script in HTML.
        $(state.currentSelector).html(state.currentHTML);
      }
      else {
        // Previous 'state' (may have user input data).
        // Will not execute script in the cloned node so do it manually.
        $(state.currentSelector).replaceWith($(state.currentSelected).clone());
        $(state.currentHTML).filter("script").each(function(){
          if(this.src) {
            var script = document.createElement('script');
            var i, attrName, attrValue, attrs = this.attributes;
            for(i = 0; i < attrs.length; i++) {
              attrName = attrs[i].name;
              attrValue = attrs[i].value;
              script[attrName] = attrValue;
            }
            $(state.currentSelector)[0].append(script);
          } 
          else {
            $.globalEval(this.text || this.textContent || this.innerHTML || '');
          }
        });
      }
    }
    if (state && state.callback) {
      state.callback(state.metadata);
    }
    previousState = state;
  });

  function as_html(node){
    // Convert element to html
    return node ? $("<div>").html(node).html() : null;
  }

  function pushstate(url, title, data, htmlData, selector, callback, metaData) {
    // Save the current state into previous state's forward.
    if (selector) {
      var lastState = window.History.getState().data['state'];
      if (lastState) {
        lastState.forwardSelected = as_html($(selector).clone());
        lastState.forwardSelector = selector; 
        stateData[lastState.id].forwardSelected = $(selector).clone();
        stateData[lastState.id].forwardSelector = selector; 
      }
    }
    else {
      selector = "body"
    }

    // Store html rather than evaluating it now.
    // Save the current state into current state's current.
    var currentHTML = htmlData || $("body").html();
    var state = {
      title:title,
      url:url,
      metadata:metaData,
      callback:callback,
      currentSelected:null,
      currentHTML:currentHTML,
      currentSelector:selector
    }
    var id = stateData.length || 0;
    state.id = id;
    stateData[id] = state;
    stateData[id].callback = callback;
    window.History.pushState({state:state}, title, url);
  }

  function makeSuccess(url, title, data, callback){
    function success(htmlData, textStatus, jqXHR){
      var isPartial = jqXHR.getResponseHeader("X-Tile-Partial");
      if (!isPartial) {
        // Load the entire page.
        window.location = url;
      }
      else {
        // Removes the problem of 301 redirected urls not in URL bar.
        url = jqXHR.getResponseHeader("X-Tile-From-Location");

        // Where downloaded HTML will go.
        var selector = jqXHR.getResponseHeader("X-Tile-Selector");

        // JSON arguments to callback when ajax request complete.
        var metaData = jqXHR.getResponseHeader("X-Tile-Context-Data");

        // Title to set window to.
        title = title || jqXHR.getResponseHeader("X-Tile-Title");

        pushstate(url, title, data, htmlData, selector, callback, 
          JSON.parse(metaData));

        // Google analytics
        if ( typeof window.pageTracker !== 'undefined' ) {
            window.pageTracker._trackPageview(relativeUrl);
        }
      }
    }
    return success;
  }


  // Save initial state.
  $(function(){ pushstate(document.URL); });
})(window);


