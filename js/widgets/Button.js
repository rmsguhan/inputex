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
   
   this.clickEvent = new util.CustomEvent("click");
   
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
      
      this.initEvents();
      
      return this.el;
   },
   
   
   initEvents: function() {
      
      Event.addListener(this.el,"click",function(e) {
         
         var stopEvent;
         
         // link buttons should NOT behave as regular links !
         if (this.options.type === "link") {
            Event.preventDefault(e);
         }
         
         // enabled : fire clickEvent
         if (!this.disabled) {
            stopEvent = !this.clickEvent.fire();
         } else {
            stopEvent = true;
         }
         
         // One of this cases :
         //   1. field is disabled
         //   2. at least one clickEvent handler returned false
         //
         // Stop "click" dom-event + also prevents form "submit" event
         if (stopEvent) {
            Event.stopEvent(e);
         }
         
      },this,true);
      
      
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
   }
   
   
});

})();