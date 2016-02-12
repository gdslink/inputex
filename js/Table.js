(function () {

    var lang = YAHOO.lang,
        Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event;

    /**
     * Handle a table of fields
     * @class inputEx.Table
     * @extends inputEx.Group
     * @constructor
     * @param {Object} options The following options are added for Tables and subclasses:
     * <ul>
     *   <li>fields: Array of input fields declared like { label: 'Enter the value:' , type: 'text' or fieldClass: inputEx.Field, optional: true/false, ... }</li>
     *   <li>legend: The legend for the fieldset (default is an empty string)</li>
     *   <li>collapsible: Boolean to make the table collapsible (default is false)</li>
     *   <li>collapsed: If collapsible only, will be collapsed at creation (default is false)</li>
     *   <li>flatten:</li>
     * </ul>
     */
    inputEx.Table = function (options) {
        inputEx.Table.superclass.constructor.call(this, options);

        // Run default field interactions (if setValue has not been called before)
        if (!this.options.value) {
            this.runFieldsInteractions();
        }
    };

    lang.extend(inputEx.Table, inputEx.Group, {

        /**
         * Adds some options: legend, collapsible, fields...
         * @param {Object} options Options object as passed to the constructor
         */
         
        setOptions:function (options) {
            inputEx.Table.superclass.setOptions.call(this, options);

            this.options.className = options.className || 'inputEx-Group';

            this.options.fields = options.fields;

            this.options.flatten = options.flatten;

            this.options.legend = options.legend || '';

            this.options.collapsible = lang.isUndefined(options.collapsible) ? false : options.collapsible;
            this.options.collapsed = lang.isUndefined(options.collapsed) ? false : options.collapsed;

            this.options.disabled = lang.isUndefined(options.disabled) ? false : options.disabled;

            // Array containing the list of the field instances
            this.inputs = [];

            // Associative array containing the field instances by names
            this.inputsNames = {};

            // associate the table with the initial fields list
            if (typeof this.options.fields !== 'undefined' && this.options.fields.length == 0 && this.numberOfFieldsInTable() > 0) {
               this.updateFieldList();
            }

            this.subscribeToTableDidChangeEvent();

            if(this.parentField.fieldContainer)
              this.selectTableField = this.parentField.fieldContainer.querySelector("#name-field");
            
            if(this.selectTableField && this.addAllFieldsElement){
               this.handleActionAllButtonsVisibility(this.getFieldsBySelectedTable());
            }
        },
        getFieldsBySelectedTable:function(){
          var tmpFields=[];
            if(inputEx.TablesFields && this.selectTableField){
              var currentSelectedValue=this.selectTableField.options[this.selectTableField.selectedIndex].value;
              this.currentSelectedTableText=this.selectTableField.options[this.selectTableField.selectedIndex].text;
              for (var i = 0; i < inputEx.TablesFields.length; i++) {
                  if (inputEx.TablesFields[i].table.key == currentSelectedValue) {
                   tmpFields=inputEx.TablesFields[i].table.fields
                  }
              }
            }
          return tmpFields
        },
        handleActionAllButtonsVisibility:function(pFields){
          if(pFields.length > 0){
            this.addAllFieldsElement.style.visibility="visible"
            this.removeTableFieldsElement.style.visibility="visible"
            this.removeAllFieldsElement.style.visibility="visible"
            if(this.currentSelectedTableText){
                        this.addAllFieldsElement.value=I18n.t('form.button.actions.add_all_fields')+" "+this.currentSelectedTableText
                        this.removeTableFieldsElement.value=I18n.t('form.button.actions.remove_table_fields')+" "+this.currentSelectedTableText}
          }else{
            if(this.addAllFieldsElement)this.addAllFieldsElement.style.visibility="hidden"
            if(this.removeTableFieldsElement)this.removeTableFieldsElement.style.visibility="hidden"
            if(this.removeAllFieldsElement)this.removeAllFieldsElement.style.visibility="hidden"
          }
        },
        updateFieldsAndAddAll:function(){
            this.controllerObj.updateFieldList(true);
        },
        fieldIsInFields:function(pName){
          for(var f=0;f<this.options.fields.length;f++){
              if(this.options.fields[f].name===pName){
                return true;
              }
          }
          return false;
        },
        removeAllFields:function(){
           this.controllerObj.setFieldsList(this.controllerObj.parentField.group, []);
           this.controllerObj.options.fields=[];
        }
        ,
        removeOnlyTableFields:function(){
          var tmpFields=[];
          for(var f=0;f<this.controllerObj.options.fields.length;f++){
            var deleteField=false;
            for (var i = 0; i < inputEx.TablesFields.length; i++) {
                if (inputEx.TablesFields[i].table.key == this.controllerObj.options.name) {
                    for (var j = 0; j < inputEx.TablesFields[i].table.fields.length; j++) {
                      var tmpName=inputEx.TablesFields[i].table.fields[j].name + '@_@@_@' + inputEx.TablesFields[i].table.fields[j].key;
                      if(this.controllerObj.options.fields[f].name ===  tmpName){
                        deleteField=true;
                        break;
                      }
                    }
                }
            }
            if(!deleteField){
              tmpFields.push(this.controllerObj.options.fields[f])
            }
          }
           this.controllerObj.setFieldsList(this.controllerObj.parentField.group, tmpFields);
           this.controllerObj.options.fields=tmpFields;
        },
        initEvents:function(){
          if(this.parentField.fieldContainer){
            this.addAllFieldsElement = this.parentField.fieldContainer.querySelector("#addallfields-button");
            if(this.addAllFieldsElement) {
              this.addAllFieldsElementInitialText=this.addAllFieldsElement.value;
                this.addAllFieldsElement.controllerObj = this;
                this.addAllFieldsElement.addEventListener("click",this.updateFieldsAndAddAll);
            }


            this.removeAllFieldsElement = this.parentField.fieldContainer.querySelector("#removeallfields-button");
            if(this.removeAllFieldsElement) {
                this.removeAllFieldsElement.controllerObj = this;
                this.removeAllFieldsElementInitialText=this.removeAllFieldsElement.value;
                this.removeAllFieldsElement.addEventListener("click", this.removeAllFields)
            }

            this.removeTableFieldsElement = this.parentField.fieldContainer.querySelector("#removeTablefields-button");
            if(this.removeTableFieldsElement) {
                this.removeTableFieldsElement.controllerObj = this
                this.removeTableFieldsElement.addEventListener("click", this.removeOnlyTableFields)
            }

            

            this.handleActionAllButtonsVisibility(this.getFieldsBySelectedTable());
          }
          inputEx.Table.superclass.initEvents.call(this);
        },

        subscribeToTableDidChangeEvent:function () {
          
            if (this.parentField && this.parentField.group && this.parentField.group.type == 'table') {
                for (var i = 0; i < this.parentField.group.inputs.length; i++) {
                    if (this.parentField.group.inputs[i].type == 'dynamictable') {
                        // subscribe to the parent field tableDidChangeEvent
                        this.options.parentTableDidChange = this.parentField.group.inputs[i].options.tableDidChangeEvt;
                        this.options.parentTableDidChange.subscribe(this.onTableDidChange, this, true);
                    }
                }
            }
        },

        onTableDidChange:function (e, args) {
            this.options.name = args[0];
            this.updateFieldList(false,true);
        },

        numberOfFieldsInTable:function () {
            if (typeof inputEx.TablesFields === 'undefined') {
                return 0;
            }
            for (var i = 0; i < inputEx.TablesFields.length; i++) {
                if (inputEx.TablesFields[i].table.key == this.options.name) {
                    return(inputEx.TablesFields[i].table.fields.length);
                }
            }
        },

        /**
         * Retrieve the list of tables to be used to populate
         * the select field
         */
        updateFieldList:function (addAllFields,checkButtonsVisibility) {
            try {
                var fields = [];

                if (addAllFields !== true) this.setFieldsList(this.parentField.group, []);
                else fields=this.options.fields
                for (var i = 0; i < inputEx.TablesFields.length; i++) {
                    if (inputEx.TablesFields[i].table.key == this.options.name) {
                        for (var j = 0; j < inputEx.TablesFields[i].table.fields.length; j++) {
                          var tmpName=inputEx.TablesFields[i].table.fields[j].name + '@_@@_@' + inputEx.TablesFields[i].table.fields[j].key;
                          if(!this.fieldIsInFields(tmpName)){
                              fields.push({
                                  label:inputEx.TablesFields[i].table.fields[j].name,
                                  name:tmpName,
                                  value:inputEx.TablesFields[i].table.fields[j].default_value,
                                  type:this.getFieldType(inputEx.TablesFields[i].table.fields[j].field_type)
                             });
                          }
                        }
                        break;
                    }
                }

             if(checkButtonsVisibility===true){
                this.handleActionAllButtonsVisibility(fields);
              }
              
              if (addAllFields == true){
                  this.setFieldsList(this.parentField.group, fields,false);
                }
            } catch (err) {
                console.log("inputEx.TablesFields is undefined. - " + err)
            }
        },

        addField:function (fieldOptions) {
            var field = this.renderField(fieldOptions);
            field.parentObj=this
            this.fieldset.appendChild(field.getEl());
        },
        getFieldsList:function(group){
          for (var i = 0; i < group.inputs.length; i++) {
                if (group.inputs[i].type == 'list') {
                    return group.inputs[i].fi
                }
            }
        },
        setFieldsList:function (group, fields,sendevent) {
            for (var i = 0; i < group.inputs.length; i++) {
                if (group.inputs[i].type == 'list') {
                    group.inputs[i].setValue(fields,sendevent);
                }
            }
        },

        destroy: function(){
            // Destroy group itself
            if (this.options.parentTableDidChange) this.options.parentTableDidChange.unsubscribe(this.onTableDidChange, this,false);
            if(typeof this.addAllFieldsElement !== 'undefined' &&  this.addAllFieldsElement!=null){
                this.addAllFieldsElement.removeEventListener("click",this.updateFieldsAndAddAll);
            }

            if(typeof this.removeAllFieldsElement !== 'undefined' &&  this.removeAllFieldsElement!=null){
                this.removeAllFieldsElement.removeEventListener("click",this.removeAllFields);
            }

            if(typeof this.removeTableFieldsElement !== 'undefined' &&  this.removeTableFieldsElement!=null){
                this.removeTableFieldsElement.removeEventListener("click",this.removeOnlyTableFields);
            }

            inputEx.Table.superclass.destroy.call(this);
        }
    });

    // Register this class as "table" type
    inputEx.registerType("table", inputEx.Table, [
        {
            type:"dynamictable",
            label: I18n.t('form.field.field'),
            name:"name",
            choices:[],
            required:true
        },
        {
            type:'string',
            label: I18n.t('form.group.legend'),
            name:'legend'
        },
        {
            type:'boolean',
            label: I18n.t('form.group.collapsible'),
            name:'collapsible',
            value:false
        },
        {
            type:'boolean',
            label: I18n.t('form.group.collapsed'),
            name:'collapsed',
            value:false
        },
        {
            type:'uneditable',
            name: 'spacer',
            align: 'true',
            label:' '
        },
        {
            type:'button',
            label: I18n.t('form.button.actions.add_all_fields'),
            name:'addallfields',
            align: 'true'
        },
        {
            type:'button',
            label: I18n.t('form.button.actions.remove_table_fields'),
            name:'removeTablefields'
        },
        {
            type:'uneditable',
            name: 'spacer',
            align: 'true',
            label:' '
        },
        {
            type:'button',
            label: I18n.t('form.button.actions.remove_all_fields'),
            name:'removeallfields'
        },
        {
            type:'list',
            label: I18n.t('form.field.fields'),
            name:'fields',
            sortable:'true',
            elementType:{
                type:'type'
            }
        },
        {
            type:'string',
            name: 'spacer',
            hide: 'true',
            newline: 'true'
        }

    ], true);


})();
