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
		
		// When the cellEditor fires the "editorSaveEvent"
		this.datatable.subscribe("editorSaveEvent",function(oArgs){
			var record = oArgs.editor.getRecord();		
			// If the record got an id (meaning it isn't a new Row that the user didn't add yet)
			if( !lang.isUndefined(record.getData('id')) ){
				// If the data in the cellEditor changed
				if(oArgs.newData != oArgs.oldData){
					this.onModifyItem(record, oArgs);
				}
			}
				
		}, this, true);
		
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
    * Init the events
    */
   initEvents: function() {
	  inputEx.widget.dtInPlaceEdit.superclass.initEvents.call(this);
	
     this.requiredFieldsEvt = new YAHOO.util.CustomEvent('requiredFields', this);
	},
	
   /**
    * Make the datatable inplace editable with inputEx fields
    */
   initEditor: function() {
      
      // Set up editing flow
      var highlightEditableCell = function(oArgs) {
          var elCell = oArgs.target;
          if(Dom.hasClass(elCell, "yui-dt-editable")) {
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

   /**
    * Handling cell click events
    */
   _onCellClick: function(ev,args) {
      var target = Event.getTarget(ev);
      var column = this.datatable.getColumn(target);      
      var rowIndex = this.datatable.getTrIndex(target);
      var record = this.datatable.getRecord(target);

      if (column.key == 'delete') {
			this.onRemoveItem(record,target);	
      }
      else {				
      	this.onCellClick(ev,rowIndex);
      }
   },

   /**
    * Public handler - When clicking on one of the datatable's cells
    */
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

		// Only if the cell is inputEx valid
		this.datatable.onEventShowCellEditor(ev);
		
   },

	/**
	 * When trying to delete a row
	 */
	onRemoveItem: function(record,target){
		var targetNode = target.childNodes[0];
		
		// Only if the row has an id && isn't already being removed
		if( !lang.isUndefined(record.getData('id')) && this.removeNode != targetNode ){

         if (confirm(inputEx.messages.confirmDeletion)) {
				this.removeNode = targetNode;
				
				this.removeNode.innerHTML = '';
				Dom.addClass(this.removeNode,'inputEx-Loader');
				this.itemRemovedEvt.fire( record );            
         }
		}
	},
	
	/**
	 * When succes to delete a row
	 */
	onRemoveSuccess: function(record){
		this.datatable.deleteRow(record);
	},
	
	onRemoveFailure: function(){
		this.removeNode.innerHTML = inputEx.messages.deleteText;
		Dom.removeClass(this.removeNode,'inputEx-Loader');
		this.removeNode = null;
	},
	
	
	/**
    * When clicking on the "insert" button to add a row
    */
	onInsertButton: function(e) {
		var tbl = this.datatable;

      // Insert a new row
      tbl.addRow({});
 				
      // Select the new row
      var lastRow = tbl.getLastTrEl();
		tbl.selectRow(lastRow);
		
		// Get the last cell's inner div node
		var lastIndex = lastRow.childNodes.length - 1;
		lastCell = lastRow.childNodes[lastIndex].childNodes[0];
		
		// Empty the cell (removing "delete")
		lastCell.innerHTML = '';
		
		// Create an "Add" Button
		this.addButton = inputEx.cn('input', {type:'button',value:inputEx.messages.addButtonText}, null, null);
      Event.addListener(this.addButton, 'click', this.onAddButton, this, true);
      lastCell.appendChild(this.addButton);
		
		// Create a "Cancel" Button
		this.deleteButton = inputEx.cn('input', {type:'button',value:inputEx.messages.cancelText}, null, null);
		Event.addListener(this.deleteButton, 'click', this.onCancelButton, this, true);
      lastCell.appendChild(this.deleteButton);

		// Disable the "Insert Button"
		this.insertButton.disabled = true ;
	},
   
	onAddButton: function(e) {
		Event.stopEvent(e);	
		var target = Event.getTarget(e),
      record = this.datatable.getRecord(target),
		field, requiredFields = [];

		for(var i=0, fieldsLength = this.options.fields.length; i<fieldsLength; i++){
			field = this.options.fields[i];
			if( !lang.isUndefined(field.inputParams.required) ){
				if( lang.isUndefined(record.getData(field.inputParams.name)) ){
					requiredFields.push(field.inputParams.label);
				}
			}
		}
		
		//If not all the required fields are set
		if(requiredFields.length > 0){
			this.requiredFieldsEvt.fire(requiredFields);			
			return;
		}
		
		this.addButton.value = inputEx.messages.loadingText;
		this.addButton.disabled = true;
		this.itemAddedEvt.fire(record);
	},
	
	onCancelButton: function(e) {
		Event.stopEvent(e);
		var target = Event.getTarget(e);	
		this.datatable.deleteRow(target);
    	this.insertButton.disabled = false ;
	},
	
	/**
	 * Validate the new record's row : 
	 * You need to call this function when you really added the item with an id
	 * Ie if you trigger an Ajax request to insert your record into database,
	 * you trigger this function only if your request didn't failed
	 */
	onAddSuccess: function(record, oData){
		var recordNode = Dom.get(this.datatable.getLastSelectedRecord()),
		childNodes = recordNode.childNodes,
		childNodeIndex = childNodes.length - 1,
		innerDivNode = childNodes[childNodeIndex].childNodes[0];
		
		// Update Row with new record
		this.datatable.updateRow(record, oData);
		// Update the ADD / CANCEL buttons to "delete" text
		innerDivNode.innerHTML = inputEx.messages.deleteText;
		// Unselect Row and enable "Insert" button again
		this.datatable.unselectRow(recordNode);
		this.insertButton.disabled = false ;
	},
   
	onAddFailure: function(){
		this.addButton.value = inputEx.messages.addButtonText;
		this.addButton.disabled = false;
	},
	
	onModifyItem: function(record, oArgs){
		var itemContainer = oArgs.editor.getTdEl().childNodes[0];
		// Add CSS
		Dom.addClass(itemContainer, "inputEx-onModifyItem");
		this.itemModifiedEvt.fire(record);
	},
	
	onModifySuccess: function(record){
		var nodes = this.datatable.getElementsByClassName("inputEx-onModifyItem");
		// Remove CSS
		for(i=0,nodesLength = nodes.length; i<nodesLength; i++){
			Dom.removeClass(nodes[i], "inputEx-onModifyItem");
		}
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
		
		// Locals for Save/Cancel Buttons
		this.LABEL_SAVE = inputEx.messages.saveText;
		this.LABEL_CANCEL = inputEx.messages.cancelText;
   },

   /**
    * Resets CellEditor UI to initial state.
    */
   resetForm : function() {
   	this._inputExField.clear();
		this._inputExField.setValue(this.value);
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