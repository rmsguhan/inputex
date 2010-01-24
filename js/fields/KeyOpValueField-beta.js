/**
 * Add an SQL operator select field in the middle of a KeyValueField
 * @class inputEx.KeyOpValueField
 * @constructor
 * @extend inputEx.KeyValueField
 */
inputEx.KeyOpValueField = function(searchFormDef) {

   this.nameIndex = {};
   var fieldNames = [], fieldLabels = [];
   for(var i = 0 ; i < searchFormDef.fields.length ; i++) {
      var field =  searchFormDef.fields[i];
		var fieldCopy = {};
		for(var k in field) {
			if(field.hasOwnProperty(k) && k != "label") {
				fieldCopy[k] = field[k];
			}
		}
      this.nameIndex[field.name] = fieldCopy;
      fieldNames.push(field.name);
		fieldLabels.push(field.label || field.name);
   }
   
   var opts = {
      fields: [
         {type: 'select', selectValues: fieldNames, selectOptions: fieldLabels },
			{type: 'select', selectValues: ["=", ">", "<", ">=", "<=", "!=", "LIKE", "NOT LIKE", "IS NULL", "IS NOT NULL"] },
			this.nameIndex[searchFormDef.fields[0].name]
      ],
		parentEl: searchFormDef.parentEl
   };
   
   inputEx.KeyValueField.superclass.constructor.call(this, opts);
};
YAHOO.lang.extend( inputEx.KeyOpValueField, inputEx.KeyValueField, {});

inputEx.registerType("keyopvalue", inputEx.KeyOpValueField, {});
