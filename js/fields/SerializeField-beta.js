(function() {

   var Event = YAHOO.util.Event, Dom = YAHOO.util.Dom, lang = YAHOO.lang;

/**
 * SerializeField allows to serialize/deserialize a complex sub-group to a string
 * @class inputEx.SerializeField
 * @extends inputEx.Field
 * @constructor
 * @param {Object} options  Standard inputEx options definition
 */
inputEx.SerializeField = function(options) {
   inputEx.SerializeField.superclass.constructor.call(this, options);
   
};

lang.extend(inputEx.SerializeField, inputEx.Field, {
	
	/**
    * Adds some options: legend, collapsible, fields...
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      inputEx.SerializeField.superclass.setOptions.call(this, options);
   	this.options.className = options.className || 'inputEx-SerializedField';
		this.options.subfield = options.subfield || {type: 'string'};
	},
	
   /**
    * Render the TypeField: create a button with a property panel that contains the field options
    */
   renderComponent: function() {
	
      this.subfieldWrapper = inputEx.cn('div', {className: "inputEx-SerializedField-SubFieldWrapper"});
      this.fieldContainer.appendChild( this.subfieldWrapper );
      
		var config = {parentEl: this.subfieldWrapper};
		lang.augmentObject(config, this.options.subfield);
      this.subField = inputEx( config, this);
   },


	initEvents: function() {
      inputEx.SerializeField.superclass.initEvents.call(this); 
      this.subField.updatedEvt.subscribe(this.fireUpdatedEvt, this, true);
   },

	
	getValue: function() {
		var val = this.subField.getValue();
		return this.serialize(val);
	},
	
	setValue: function(sValue, sendUpdatedEvt) {
		var obj = this.deserialize(sValue);
		this.subField.setValue(obj, sendUpdatedEvt);
	},
	
	serialize: function(o) {
		return YAHOO.lang.JSON.stringify(o);
	},
	
	deserialize: function(sValue) {
		return YAHOO.lang.JSON.parse(sValue);
	},
	
	focus: function() {
		this.subField.focus();
	}
	
});



// Register this class as "select" type
inputEx.registerType("serialize", inputEx.SerializeField, []);

})();