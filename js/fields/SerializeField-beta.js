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
    * Adds some options: subfield & serializer
    * @param {Object} options Options object as passed to the constructor
    */
   setOptions: function(options) {
      inputEx.SerializeField.superclass.setOptions.call(this, options);
   	this.options.className = options.className || 'inputEx-SerializedField';

		this.options.subfield = options.subfield || {type: 'string'};
		this.options.serializer = options.serializer || "json";
	},
	
   /**
    * Render the subfield
    */
   renderComponent: function() {
	
      this.subfieldWrapper = inputEx.cn('div', {className: "inputEx-SerializedField-SubFieldWrapper"});
      this.fieldContainer.appendChild( this.subfieldWrapper );
      
		var config = {parentEl: this.subfieldWrapper};
		lang.augmentObject(config, this.options.subfield);
      this.subField = inputEx( config, this);
   },

	/**
	 * Subscribe the subField
	 */
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
		return inputEx.SerializeField.serializers[this.options.serializer].serialize(o);
	},
	
	deserialize: function(sValue) {
		return inputEx.SerializeField.serializers[this.options.serializer].deserialize(sValue);
	},
	
	focus: function() {
		this.subField.focus();
	}
	
});


inputEx.SerializeField.serializers = {

	json: {
		serialize: function(o) {
			return YAHOO.lang.JSON.stringify(o);
		},

		deserialize: function(sValue) {
			return YAHOO.lang.JSON.parse(sValue);
		}
	},
	
	xml: {
		serialize: function(o) {
			if(!XML || !YAHOO.lang.isFunction(XML.ObjTree) ) {
				alert("ObjTree.js not loaded.");
				return null;
			}
			var xotree = new XML.ObjTree();
			return xotree.writeXML(o);
		},

		deserialize: function(sValue) {
			if(!XML || !YAHOO.lang.isFunction(XML.ObjTree) ) {
				alert("ObjTree.js not loaded.");
				return null;
			}
			var xotree = new XML.ObjTree();
		  	var tree = xotree.parseXML( sValue );
			return tree;
		}
	},
	
	flatten: {
		serialize: function(o) {
			// TODO: 
		},

		deserialize: function(sValue) {
			// TODO: 
		}
	}
	
};


// Register this class as "serialize" type
inputEx.registerType("serialize", inputEx.SerializeField, [
	{ type:'type', label: 'SubField', name: 'subfield'},
	{ type:'select', name: 'serializer', label: 'Serializer', selectValues: ['json','xml','flatten'], value: 'json'}
]);

})();