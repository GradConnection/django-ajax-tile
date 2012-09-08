(function(window, undefined){
  var stateData = [];
  var previousState = null;

  window.History.Adapter.bind(window,'statechange', function(e) {
    
    // When going to a state:
    //  1. Add the state's changes
    //  2. Undo next state's changes (which is stored in forward).

    var state = window.History.getState().data['state'];
    var id = state.id;
    if (stateData[id]) {
      state = stateData[id];
    }
    if (previousState){
      var selector = previousState.currentselector;
      previousState.currentelement = $(selector).clone()[0];
      stateData[previousState.id]=previousState;
    }
    if (state.currentselector) {
      $(state.currentselector).replaceWith(state.currentelement);
    }
    if (state.forwardselector) {
      $(state.forwardselector).replaceWith(state.forwardelement);
    }
    if (state.callback) {
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
        lastState.forwardelement = as_html($(selector).clone()[0]);
        lastState.forwardselector = selector; 
        stateData[lastState.id].forwardelement = $(selector).clone()[0];
        stateData[lastState.id].forwardselector = selector; 
        // window.History.replaceState({state:lastState}, 
        //   lastState.title, lastState.url)
      }
    }
    // store html rather than evaluating it now; so that scripts in snippets work
    // Save the current state into current state's current.
    var state = {
      title:title,
      url:url,
      forwardelement:null,
      forwardselector:null,
      metadata:metaData,
      callback:callback,
      currentelement:as_html($(selector).clone().html(htmlData)[0]),
      currentselector:selector
    }
    var id = stateData.length || 0;
    stateData[id] = state
    state.id = id;
    window.History.pushState({state:state}, title, url)
  }

  function makeSuccess(url, title, data, callback){
    function success(htmlData, textStatus, jqXHR){
      var isPartial = jqXHR.getResponseHeader("X-Tile-Partial");
      if (!isPartial) {
        // Load the entire page.
        window.location = url;
      }
      else {
        // Removes the problem of redirected urls not in URL bar as it should.
        url = jqXHR.getResponseHeader("X-Tile-From-Location");
        var selector = jqXHR.getResponseHeader("X-Tile-Selector");
        var metaData = jqXHR.getResponseHeader("X-Tile-Context-Data");
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
    $.ajax({
      type: type,
      url: url,
      data: data,
      success: makeSuccess(url, title, data, callback),
      async:false
    });
  }

  // Exported functions

  // get(url [title], [data], [callback])
  function get(url, title, data, callback) {
    ajax("GET", url, title, data);
  }
  // post(url [title], [data], [callback])
  function post(url, title, data, callback) {
    ajax("POST", url, title, data);
  }

  tile = { get:get, post:post,}

  // Save initial state.
  $(function(){ pushstate(document.URL); });
})(window);


