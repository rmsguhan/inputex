(function() {

   var lang = YAHOO.lang, Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;


/**
 * InPlaceEditable datatable using inputEx fields
 * @class inputEx.widget.dtInPlaceEdit
 * @extends inputEx.widget.DataTable
 * @constructor
 * @param {Object} options Options
 */
inputEx.widget.dtInPlaceEdit = function(options) {
   inputEx.widget.dtInPlaceEdit.superclass.constructor.call(this, options);
};

lang.extend(inputEx.widget.dtInPlaceEdit, inputEx.widget.DataTable , {
	
	renderDatatable: function() {
		inputEx.widget.dtInPlaceEdit.superclass.renderDatatable.call(this);
		
		 // Force save on blur event
		this.datatable.onEditorBlurEvent = function(oArgs) {
			if(oArgs.editor.save) {
			    oArgs.editor.save();
			} 
		};
	},


   /**
    * Additional options
    */
   setOptions: function(options) {
     inputEx.widget.dtInPlaceEdit.superclass.setOptions.call(this, options);
     
     this.options.allowModify = false;
     this.options.editableFields = options.editableFields; 
   },
   
   /**
    * Make the datatable inplace editable with inputEx fields
    */
   initEditor: function() {
      
      // Set up editing flow
      var highlightEditableCell = function(oArgs) {
          var elCell = oArgs.target;
          if(YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")) {
              this.highlightCell(elCell);
          }
      };

      this.datatable.subscribe("cellMouseoverEvent", highlightEditableCell);
      this.datatable.subscribe("cellMouseoutEvent", this.datatable.onEventUnhighlightCell);
		
   },
   
   /**
    * Convert a single inputEx field definition to a DataTable column definition
    */
   fieldToColumndef: function(field) {
      var columnDef = {
         key: field.inputParams.name,
         label: field.inputParams.label,
         sortable: this.options.sortable, 
         resizeable: this.options.resizeable
      };

      // In cell editing if the field is listed in this.options.editableFields
      if(lang.isArray(this.options.editableFields) ) {
         if(inputEx.indexOf(field.inputParams.name, this.options.editableFields) != -1) {
             columnDef.editor = new inputEx.widget.CellEditor(field);
         }
      }
      
      // Field formatter
      if(field.formatter) {
         columnDef.formatter = field.formatter;
      }
      else {
         if(field.type == "date") {
            columnDef.formatter = YAHOO.widget.DataTable.formatDate;
         }
      }
      // TODO: other formatters
      return columnDef;
   },
   
   onCellClick: function(ev, rowIndex) {
	
 	  // Get a particular CellEditor
		var elCell = ev.target, oColumn;
	    elCell = this.datatable.getTdEl(elCell);
	    if(elCell) {
	        oColumn = this.datatable.getColumn(elCell);
	        if(oColumn && oColumn.editor) {
	            var oCellEditor = this.datatable._oCellEditor;
	            // Clean up active CellEditor
	            if(oCellEditor) {
							// Return if field isn't validated
							if( !oCellEditor._inputExField.validate() ) {
								return;
							}
	            }
				}
			}
		
		// On first click or when current cell edited is validated
      this.datatable.onEventShowCellEditor(ev);
   }
   
});




/**
 * The CellEditor class provides functionality for inline editing in datatables
 * using the inputEx field definition.
 *
 * @class inputEx.widget.CellEditor
 * @extends YAHOO.widget.BaseCellEditor 
 * @constructor
 * @param {Object} inputExFieldDef InputEx field definition object
 */
inputEx.widget.CellEditor = function(inputExFieldDef) {
    this._inputExFieldDef = inputExFieldDef;
   
    this._sId = "yui-textboxceditor" + YAHOO.widget.BaseCellEditor._nCount;
	 YAHOO.widget.BaseCellEditor._nCount++;
    inputEx.widget.CellEditor.superclass.constructor.call(this, "inputEx", {disableBtns:false});
};

// CellEditor extends BaseCellEditor
lang.extend(inputEx.widget.CellEditor, YAHOO.widget.BaseCellEditor,{
	
	
   /**
    * Render the inputEx field editor
    */
   renderForm : function() {
   
      // Build the inputEx field
      this._inputExField = inputEx(this._inputExFieldDef);
      this.getContainerEl().appendChild(this._inputExField.getEl());
 
   },

   /**
    * Resets CellEditor UI to initial state.
    */
   resetForm : function() {
       this._inputExField.setValue(lang.isValue(this.value) ? this.value.toString() : "");
   },

   /**
    * Sets focus in CellEditor.
    */
   focus : function() {
      this._inputExField.focus();
   },

   /**
    * Returns new value for CellEditor.
    */
   getInputValue : function() {
      return this._inputExField.getValue();
   },

	/**
	 * When clicking the save button but also when clicking out of the cell
	 */
	save: function() {
		// Save only if cell is validated
		if(this._inputExField.validate()) {
			inputEx.widget.CellEditor.superclass.save.call(this);
		}
	},
	
	cancel: function() {
		inputEx.widget.CellEditor.superclass.cancel.call(this);
	}
	

});

// Copy static members to CellEditor class
lang.augmentObject(inputEx.widget.CellEditor, YAHOO.widget.BaseCellEditor);

})();