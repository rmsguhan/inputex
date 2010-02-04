(function () {
   var util = YAHOO.util, lang = YAHOO.lang, Event = util.Event, Dom = util.Dom;

/**
 * Create a button
 * @class inputEx.widget.Button
 * @constructor
 * @param {Object} options The following options are available for Button :
 * <ul>
 * </ul>
 */
 
inputEx.widget.Button = function(options) {
   
   this.setOptions(options || {});
      
   if (!!this.options.parentEl) {
      this.render(this.options.parentEl);
   }
   
};


lang.augmentObject(inputEx.widget.Button.prototype,{
   
   
   setOptions: function(options) {
      
      this.options = {};
      this.options.id = lang.isString(options.id) ? options.id  : Dom.generateId();
      this.options.className = options.className || "inputEx-Button";
      this.options.parentEl = lang.isString(options.parentEl) ? Dom.get(options.parentEl) : options.parentEl;
      
      // default type === "submit"
      this.options.type = (options.type === "link" || options.type === "submit-link") ? options.type : "submit";
      
      // value is the text displayed inside the button (<input type="submit" value="Submit" /> convention...)
      this.options.value = options.value;
      
      this.options.disabled = !!options.disabled;
      
      if (options.onClick) {
         this.options.onClick = options.onClick;
      }
      
   },
   
   
   render: function(parentEl) {
      
      var innerSpan;
      
      if (this.options.type === "link" || this.options.type === "submit-link") {
         
         this.el = inputEx.cn('a', {className: this.options.className, id:this.options.id, href:"#"});
         Dom.addClass(this.el,this.options.type === "link" ? "inputEx-Button-Link" : "inputEx-Button-Submit-Link");
         
         innerSpan = inputEx.cn('span', null, null, this.options.value);
         
         this.el.appendChild(innerSpan);
         
      // default type is "submit" input
      } else {
         
         this.el = inputEx.cn('input', {type: "submit", value: this.options.value, className: this.options.className, id:this.options.id});
         Dom.addClass(this.el,"inputEx-Button-Submit");
      }
      
      parentEl.appendChild(this.el);
      
      if (this.options.disabled) {
         this.disable();
      }
      
      this.initEvents();
      
      return this.el;
   },
   
   
   initEvents: function() {
      
      this.clickEvent = new util.CustomEvent("click");
      this.submitEvent = new util.CustomEvent("submit");
      
      
      Event.addListener(this.el,"click",function(e) {
         
         var fireSubmitEvent;
         
         // stop click event, so :
         //
         //  1. buttons of 'link' or 'submit-link' type don't link to any url
         //  2. buttons of 'submit' type (<input type="submit" />) don't fire a 'submit' event
         Event.stopEvent(e);
         
         // button disabled : don't fire clickEvent, and stop here
         if (this.disabled) {
            fireSubmitEvent = false;
            
         // button enabled : fire clickEvent
         } else {
            // submit event will be fired if not prevented by clickEvent
            fireSubmitEvent = this.clickEvent.fire();
         }
         
         // link buttons should NOT fire a submit event
         if (this.options.type === "link") {
            fireSubmitEvent = false;
         }
         
         if (fireSubmitEvent) {
            this.submitEvent.fire();
         }
         
      },this,true);
      
      // Subscribe onClick handler
      if (this.options.onClick) {
         this.clickEvent.subscribe(this.options.onClick,this,true);
      }
      
   },
   
   
   disable: function() {
      
      this.disabled = true;
      
      Dom.addClass(this.el,"inputEx-Button-disabled");
      
      if (this.options.type === "submit") {
         this.el.disabled = true;
      }
   },
   
   
   enable: function() {
      
      this.disabled = false;
      
      Dom.removeClass(this.el,"inputEx-Button-disabled");
      
      if (this.options.type === "submit") {
         this.el.disabled = false;
      }
   },
   
   
   /**
    * Purge all event listeners and remove the component from the dom
    */
   destroy: function() {
      
      // Unsubscribe all listeners to click and submit events
      this.clickEvent.unsubscribeAll();
      this.submitEvent.unsubscribeAll();
      
      // Purge element (remove listeners on el and childNodes recursively)
      util.Event.purgeElement(this.el, true);
      
      // Remove from DOM
      if(Dom.inDocument(this.el)) {
         this.el.parentNode.removeChild(this.el);
      }
      
   }
   
   
});

})();