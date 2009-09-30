(function() {

   var lang = YAHOO.lang, Dom = YAHOO.util.Dom, Event = YAHOO.util.Event;


/**
 * Editable datatable using inputEx fields in a dialog
 * @class inputEx.widget.dtDialogEdit
 * @extends inputEx.widget.DataTable
 * @constructor
 * @param {Object} options Options
 */
inputEx.widget.dtDialogEdit = function(options) {
   inputEx.widget.dtDialogEdit.superclass.constructor.call(this, options);
};

lang.extend(inputEx.widget.dtDialogEdit, inputEx.widget.DataTable , {
   
   /**
    * Additional options
    */
   setOptions: function(options) {
      
      inputEx.widget.dtDialogEdit.superclass.setOptions.call(this, options);
      
      this.options.dialogLabel = options.dialogLabel || "";
   },
   
   
   initEditor: function() {
      // Lazy loading of the dialog
   },
   
   /**
    * Make the datatable inplace editable with inputEx fields
    */
   renderDialog: function() {
      
     var that = this;
      
     this.dialog = new inputEx.widget.Dialog({
				inputExDef: {
				         type: 'form',
				         inputParams: {
				            fields: this.options.fields,
				            buttons: [
				               {type: 'button', value: 'Save', onClick: function() { that.onDialogSave();} },
				               {type: 'button', value: 'Cancel', onClick: function() { that.onDialogCancel(); } }
				            ]				
				         }
				      },
				title: this.options.dialogLabel,
				panelConfig: {
					constraintoviewport: true, 
					underlay:"shadow", 
					close:true, 
					fixedcenter: true,
					visible:true, 
					draggable:true,
					modal: true
				}		
		});
		
		// Add a listener on the closing button and hook it to onDialogCancel()
		YAHOO.util.Event.addListener(that.dialog.close,"click",function(){
			that.onDialogCancel();
		},that);
		
   },
   
   /**
    * When clicking "modify" to edit a row
    */
   onClickModify: function(rowIndex) {

      if(!this.dialog) {
         this.renderDialog();
      }

      // NOT Inserting new record
		this.insertNewRecord = false;
		
		// Set the selected Record
		this.selectedRecord = rowIndex;
		
		// Get the selected Record
      var record = this.datatable.getRecord(this.selectedRecord);

		// Set the initial value, use setTimeout to escape the stack
		var that = this;
		setTimeout(function() {
			that.dialog.setValue(record.getData());
			that.dialog.show();
		},0);
		
   },
   
   /**
    * When clicking "insert" to add a row
    */
   onInsertButton: function() {

      if(!this.dialog) {
         this.renderDialog();
      }
		
		// Inserting new record
		this.insertNewRecord = true;
		
		// Escaping stack
		var that = this;
		setTimeout(function() {
			that.dialog.getForm().clear();
	      that.dialog.show();
		},0);
		

   },
   
   /**
    * When saving the Dialog
    */
   onDialogSave: function() {
		
	  	//Validate the Form
	  	if ( !this.dialog.getForm().validate() ) return ;
	   
		// Update the record
		if(!this.insertNewRecord){
						
			// Update the row
			var newvalues = this.dialog.getValue();
			this.datatable.updateRow( this.selectedRecord , newvalues );

			// Get the new record
			var record = this.datatable.getRecord(this.selectedRecord);
			
			// Fire the modify event
         this.itemModifiedEvt.fire(record);

		}
		// Adding new record
		else{
									
			// Insert a new row
	      this.datatable.addRow({});

			// Set the Selected Record
			var rowIndex = this.datatable.getRecordSet().getLength() - 1;
			this.selectedRecord = rowIndex;
			
			// Update the row
			var newvalues = this.dialog.getValue();
			this.datatable.updateRow( this.selectedRecord , newvalues );
			
			// Get the new record
			var record = this.datatable.getRecord(this.selectedRecord);
			
			// Fire the add event
         this.itemAddedEvt.fire(record);
		}
      
      this.dialog.hide();
   },

	/**
    * When canceling the Dialog
    */
	onDialogCancel: function(){
		this.insertNewRecord = false;
		this.dialog.hide();
	}
	   
});

})();