/**
 * YQL-trimpath-page is a utility to create pages using YQL queries ant Trimpath templating
 * All YQL queries are made using the rpc/yql.js utility.
 * see examples/yql-trimpath-page.html
 * Call this method on page load to run yql queries and the associated templates
 * @static
 * @param {Array} additionalCallbacks List of [list of callbacks] (each yql query can call multiple callbacks)
 */
inputEx.YQL.initTrimpathPage = function(additionalCallbacks) {
   
	 var templates = YAHOO.util.Dom.getElementsBy( function(el) {
   		return (el.type && el.type == "text/trimpath");
   } , "script" );

 	var callbacks = [];

	for(var i = 0 ; i < templates.length ; i++) {
		var t = templates[i];
		var split = t.src.split('#');
		var requestId = parseInt(split[split.length-1], 10);
		if(!callbacks[requestId]) callbacks[requestId] = [];
		callbacks[requestId].push( inputEx.YQL.genTrimpathCallback(t) );
	}
	
	if(additionalCallbacks) {
	   for(i = 0 ; i < additionalCallbacks.length ; i++) {
	      var cbks = additionalCallbacks[i];
	      if(YAHOO.lang.isArray(cbks)) {
	         if(!callbacks[i]) callbacks[i] = [];
	         for(var j = 0 ; j < cbks.length ; j++) {
   		      callbacks[i].push( cbks[j] );
		      }
	      }
	   }
   }

	inputEx.YQL.init(callbacks);
};

/**
 * Build a call
 * @static
 * @private
 */
inputEx.YQL.genTrimpathCallback = function(scriptTag) {
  return function(results) {
     var t = TrimPath.parseTemplate(scriptTag.innerHTML);
	  var templateResult = t.process(results);
     scriptTag.parentNode.innerHTML += "<div class='trimpathDiv'>"+templateResult+"</div>";
  };
};
