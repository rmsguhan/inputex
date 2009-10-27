(function() {

   var util = YAHOO.util, lang = YAHOO.lang, Dom = util.Dom, Event = util.Event;

/**
 * Create an editable datatable
 * @class inputEx.widget.DataTable
 * @constructor
 * @param {Object} options Options:
 * <ul>
 *    <li>id</li>
 *    <li>parentEl</li>
 *    <li>tableColumns: (optional) list of visible columns in the datatable</li>
 *    <li>sortable: (optional) are the columns sortable, default true</li>
 *    <li>resizeable: (optional) are the columns resizeable, default true</li>
 *    <li>allowInsert: default true</li>
 *    <li>allowModify: default true</li>
 *    <li>allowDelete: default true</li>
 *    <li>showHideColumnsDlg: add a link to a dialog to show/hide columns</li>
 * </ul>
 */
inputEx.widget.DataTable = function(options) {
   
   this.setOptions(options);
   
   this.render();
   
   this.initEvents();
};

inputEx.widget.DataTable.prototype = {
   
   /**
    * Set the options
    */
   setOptions: function(options) {

      this.options = {};
      this.options.id = options.id || Dom.generateId();
      this.options.parentEl = lang.isString(options.parentEl) ? Dom.get(options.parentEl) : options.parentEl;
      
      this.options.tableColumns = options.tableColumns;
      this.options.sortable = lang.isUndefined(options.sortable) ? true : options.sortable;
      this.options.resizeable = lang.isUndefined(options.resizeable) ? true : options.resizeable;
      this.options.allowInsert = lang.isUndefined(options.allowInsert) ? true : options.allowInsert;
      this.options.allowModify = lang.isUndefined(options.allowModify) ? true : options.allowModify;
      this.options.allowDelete = lang.isUndefined(options.allowDelete) ? true : options.allowDelete; 
      
      this.options.showHideColumnsDlg = lang.isUndefined(options.showHideColumnsDlg) ? false : options.showHideColumnsDlg; 
      
      this.options.datasource = options.datasource;

		// Create a datasource if it does not exist, from the datasourceConfig Object
		if(!options.datasource && options.datasourceConfig) {
			var ds = new YAHOO.util.DataSource(options.datasourceConfig.url), fields = [];
			if(options.datasourceConfig.keys) {
				for ( var i = 0 ; i < options.datasourceConfig.keys.length ; i++ ) {
	         	fields.push({ key: options.datasourceConfig.keys[i] });
	      	}
			}
	      ds.responseType = options.datasourceConfig.responseType || YAHOO.util.DataSource.TYPE_JSON;
	      ds.responseSchema = options.datasourceConfig.responseSchema || { resultsList : "Result", fields : fields};
			this.options.datasource = ds;
		}

      this.options.datatableOpts = options.datatableOpts;
      this.options.fields = options.fields;

		this.options.dialogLabel = options.dialogLabel || "";

   },
   
   
   /**
    * Init the events
    */
   initEvents: function() {
      
      // Call the rendering method when the container is available
      Event.onAvailable(this.options.id, this.renderDatatable, this, true);
      
      // Table options
      if(this.options.showHideColumnsDlg) {
         Event.addListener(this.tableOptions, 'click', this.showTableOptions, this, true);
      }

      /**
   	 * @event Event fired when an item is removed
   	 * @param {YAHOO.widget.Record} Removed record
   	 * @desc YAHOO custom event fired when an item is removed
   	 */
    	this.itemRemovedEvt = new util.CustomEvent('itemRemoved', this);

      /**
   	 * @event Event fired when an item is added
    	 * @param {YAHOO.widget.Record} Added record
   	 * @desc YAHOO custom event fired when an item is added
   	 */
    	this.itemAddedEvt = new util.CustomEvent('itemAdded', this);

      /**
   	 * @event Event fired when an item is modified
    	 * @param {YAHOO.widget.Record} Modified record
   	 * @desc YAHOO custom event fired when an item is modified
   	 */
    	this.itemModifiedEvt = new util.CustomEvent('itemModified', this);
   },
   
   /**
    * Render the main container only (not the datatable)
    */
   render: function() {
      
      /**
       * Main container 
       */
      this.element = inputEx.cn('div', {id: this.options.id });
      
      if(this.options.showHideColumnsDlg) {
         this.renderShowHideColumnsDlg();
      }

      // append it immediatly to the parent DOM element
      this.options.parentEl.appendChild(this.element);
      
   },
   
   
   /**
    * Render the datatable
    */
   renderDatatable: function() {
      
      this.columndefs = this.fieldsToColumndefs(this.options.fields);
      
      this.datatable = new YAHOO.widget.DataTable(this.element,this.columndefs, this.options.datasource, this.options.datatableOpts);
      this.datatable.subscribe('cellClickEvent', this._onCellClick, this, true);

		// Automatically set up the paginator
		if(this.options.datatableOpts && this.options.datatableOpts.paginator) {
			this.datatable.handleDataReturnPayload = function(oRequest, oResponse, oPayload) {
	        oPayload.totalRecords = oResponse.meta.totalRecords;
	        return oPayload;
	    	};
		}
            
      // Insert button
      if ( this.options.allowInsert ){
         this.insertButton = inputEx.cn('input', {type:'button', value:inputEx.messages.insertItemText}, null, null);
         Event.addListener(this.insertButton, 'click', this.onInsertButton, this, true);
         this.options.parentEl.appendChild(this.insertButton);
      }
   },
	
   /**
    * Render the dialog for row edition
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
    * When saving the Dialog
    */
   onDialogSave: function() {
		
		var newvalues, record;
		
	  	//Validate the Form
	  	if ( !this.dialog.getForm().validate() ) return ;
	   
		// Update the record
		if(!this.insertNewRecord){
						
			// Update the row
			newvalues = this.dialog.getValue();
			this.datatable.updateRow( this.selectedRecord , newvalues );

			// Get the new record
			record = this.datatable.getRecord(this.selectedRecord);
			
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
			newvalues = this.dialog.getValue();
			this.datatable.updateRow( this.selectedRecord , newvalues );
			
			// Get the new record
			record = this.datatable.getRecord(this.selectedRecord);
						
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
	},

   
   /**
    * Handling cell click events
    */
   _onCellClick: function(ev,args) {
      var target = Event.getTarget(ev);
      var column = this.datatable.getColumn(target);      
      var rowIndex = this.datatable.getTrIndex(target);
      if (column.key == 'delete') {
         if (confirm(inputEx.messages.confirmDeletion)) {
            var record = this.datatable.getRecord(target);
            if(this.editingNewRecord) {
               this.editingNewRecord = false;
            }
            else {
               this.itemRemovedEvt.fire( record );
            }
            this.datatable.deleteRow(target);
            this.hideSubform();
         }
      }
      else if(column.key == 'modify') {
         this.onClickModify(rowIndex);
      } 
      else {				
      	this.onCellClick(ev,rowIndex);
      }
   },

   /**
    * Public cell click handler
    */
   onCellClick: function(ev, rowIndex) {

   },
   
   /**
    * Opens the Dialog to edit the row
    * Called when the user clicked on modify button
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
    * Insert button event handler
    */
   onInsertButton: function(e) {

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
    * Remove the record that has not been saved
    */
   removeUnsavedRecord: function(record) {
      this.datatable.deleteRow(record);
   },
   
   /**
    * Cancel row edition
    */
   onCancelForm: function(e) {
      Event.stopEvent(e); 
      this.hideSubform();
      
      if(this.editingNewRecord) {
         this.removeUnsavedRecord();
         this.editingNewRecord = false;
      }
   },
   
   
   /**
    * Convert an inputEx fields definition to a DataTable columns definition
    */
   fieldsToColumndefs: function(fields) {
      var columndefs = [];
    	for(var i = 0 ; i < fields.length ; i++) {
    	   if(!this.options.tableColumns || inputEx.indexOf(fields[i].inputParams.name, this.options.tableColumns) != -1 ) {
    	      columndefs.push( this.fieldToColumndef(fields[i]) );
 	      }
    	}
    	
    	// Adding modify column if we use form editing and if allowModify is true
      if(this.options.allowModify ) {
    	   columndefs.push({
    	      key:'modify',
    	      label:' ',
    	      formatter:function(elCell) {
               elCell.innerHTML = inputEx.messages.modifyText;
               elCell.style.cursor = 'pointer';
            }
         });
      }
      
      // Adding delete column
      if(this.options.allowDelete) {
      	 columndefs.push({
      	    key:'delete',
      	    label:' ',
      	    formatter:function(elCell) {
               elCell.innerHTML = inputEx.messages.deleteText;
               elCell.style.cursor = 'pointer';
            }
         });
      }
      
    	return columndefs;
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
    * Render the dialog (+link) to show/hide columns
    */
   renderShowHideColumnsDlg: function() {
      this.tableOptions = inputEx.cn('a', {href: ''}, null, "Table options");
      this.options.parentEl.appendChild(this.tableOptions);
      
      // Create the SimpleDialog
      Dom.removeClass("dt-dlg", "inprogress");
      this.tableOptionsDlg = new YAHOO.widget.SimpleDialog("dt-dlg", {
              width: "30em",
		        visible: false,
		        modal: true,
		        buttons: [ 
				      { text:"Close",  handler: function(e) { this.hide(); } }
              ],
              fixedcenter: true,
              constrainToViewport: true
	   });
	   this.tableOptionsDlg.bodyId = Dom.generateId();
	   this.tableOptionsDlg.setHeader("Choose which columns you would like to see");
	   this.tableOptionsDlg.setBody("<div id='"+this.tableOptionsDlg.bodyId+"'></div>");
	   this.tableOptionsDlg.render(document.body);
   },
   
   /**
    * Display the dialog to show/hide fields
    */
   showTableOptions: function(e) {
      
      Event.stopEvent(e);
      
      if(!this.noNewCols) {
          
          var that = this;
          var handleButtonClick = function(e, oSelf) {
              var sKey = this.get("name");
              if(this.get("value") === "Hide") {
                  // Hides a Column
                  that.datatable.hideColumn(sKey);
              }
              else {
                  // Shows a Column
                  that.datatable.showColumn(sKey);
              }
          };
          
           // Populate Dialog
           // Using a template to create elements for the SimpleDialog
           var allColumns = this.datatable.getColumnSet().keys;
           var elPicker = Dom.get(this.tableOptionsDlg.bodyId);
           
           var elTemplateCol = document.createElement("div");
           Dom.addClass(elTemplateCol, "dt-dlg-pickercol");
           var elTemplateKey = elTemplateCol.appendChild(document.createElement("span"));
           Dom.addClass(elTemplateKey, "dt-dlg-pickerkey");
           var elTemplateBtns = elTemplateCol.appendChild(document.createElement("span"));
           Dom.addClass(elTemplateBtns, "dt-dlg-pickerbtns");
           var onclickObj = {fn:handleButtonClick, obj:this, scope:false };
           
           // Create one section in the SimpleDialog for each Column
           var elColumn, elKey, elButton, oButtonGrp;
           for(var i=0,l=allColumns.length;i<l;i++) {
               var oColumn = allColumns[i];
               
               // Use the template
               elColumn = elTemplateCol.cloneNode(true);
               
               // Write the Column key
               elKey = elColumn.firstChild;
               elKey.innerHTML = oColumn.getKey();
               
               if(elKey.innerHTML != "delete" && elKey.innerHTML != "modify") {
               
                  // Create a ButtonGroup
                  oButtonGrp = new YAHOO.widget.ButtonGroup({ 
                                  id: "buttongrp"+i, 
                                  name: oColumn.getKey(), 
                                  container: elKey.nextSibling
                  });
                  oButtonGrp.addButtons([
                      { label: "Show", value: "Show", checked: ((!oColumn.hidden)), onclick: onclickObj},
                      { label: "Hide", value: "Hide", checked: ((oColumn.hidden)), onclick: onclickObj}
                  ]);
                    
                  elPicker.appendChild(elColumn);
               
               }
           }
           this.noNewCols = true;
   	}
       this.tableOptionsDlg.show();
      
   }
   
};


inputEx.messages.saveText = "Save";
inputEx.messages.cancelText = "Cancel";
inputEx.messages.deleteText = "delete";
inputEx.messages.modifyText = "modify";
inputEx.messages.insertItemText = "Insert";
inputEx.messages.addButtonText = "Add";
inputEx.messages.loadingText = "Loading...";
inputEx.messages.confirmDeletion = "Are you sure?";

})();