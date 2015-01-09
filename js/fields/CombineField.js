(function() {

  var lang = YAHOO.lang,
      Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

  /**
   * A meta field to put N fields on the same line, separated by separators
   * @class inputEx.CombineField
   * @extends inputEx.Group
   * @constructor
   * @param {Object} options Added options:
   * <ul>
   *    <li>separators: array of string inserted</li>
   * </ul>
   */
  inputEx.CombineField = function(options) {
    inputEx.CombineField.superclass.constructor.call(this, options);

    this.initAutoTab();
  };

  lang.extend(inputEx.CombineField, inputEx.Group, {
    /**
     * Set the default values of the options
     * @param {Object} options Options object as passed to the constructor
     */
    setOptions: function(options) {
      inputEx.CombineField.superclass.setOptions.call(this, options);

      this.options.regexp = options.regexp;

      // Overwrite options
      this.options.className = options.className ? options.className : 'inputEx-CombineField ' + this.options.name;

      // Added options
      this.options.separators = options.separators;
    },

    render: function() {
      // Create the div wrapper for this group
      this.divEl = inputEx.cn('div', {
        className: this.options.className
      });
      if (this.options.id) {
        this.divEl.id = this.options.id;
      }

      var containerField = this.getContainerField();

      var isTypeField = this.isInPropertyPanel();
  
      if(this.options.align && !isTypeField){
        Dom.setStyle(this.divEl, 'float', 'left');
      }else if(this.options.align == false && !isTypeField){
        Dom.setStyle(this.divEl, 'clear', 'left');
      }

      if(this.options.newline && !isTypeField){
        Dom.setStyle(this.divEl, 'clear', 'left');
      }

      if (this.options.required) {
        Dom.addClass(this.divEl, "inputEx-required");
      }      

      // Label element
      if (YAHOO.lang.isString(this.options.label)) {
        this.labelDiv = inputEx.cn('div', {
          id: this.divEl.id + '-label',
          className: 'inputEx-label',
          'for': this.divEl.id + '-field'
        });
        this.labelEl = inputEx.cn('label', null, null, this.options.label === "" ? "&nbsp;" : this.options.label);
        this.labelDiv.appendChild(this.labelEl);
        this.divEl.appendChild(this.labelDiv);
      }

      if(this.options.toplabel && !isTypeField){
        Dom.setStyle(this.labelDiv, 'text-align', 'left');
        Dom.setStyle(this.labelDiv, 'float', 'left');
        Dom.setStyle(this.labelDiv, 'clear', 'left');
      }

      this.renderFields(this.divEl);


      if (this.options.disabled) {
        this.disable();
      }

      // Insert a float breaker
      this.divEl.appendChild(inputEx.cn('div', {
        className: "inputEx-clear-div"
      }, null, " "));
    },

    /**
     * Render the subfields
     */
    renderFields: function(parentEl) {

      var isTypeField = this.isInPropertyPanel();

      if (!this.options.fields) {
        return;
      }

      var i, n = this.options.fields.length,
          f, field, fieldEl, t;

      for (i = 0; i < n; i++) {
        f = this.options.fields[i];
        
        f.name = this.options.name;
        f.id = this.options.id + '-' + i

        if (this.options.required) {
          f.required = true;
        }
        //if(this.options.align){
          f.align = true;
        //}
        field = this.renderField(f);
        fieldEl = field.getEl();
        t = f.type;
        if (t != "group" && t != "form") {
          // remove the line breaker (<div style='clear: both;'>)
          field.divEl.removeChild(fieldEl.childNodes[fieldEl.childNodes.length - 1]);
        }

        // make the field float left
        Dom.setStyle(fieldEl, 'float', 'left');        

        if( i == 0 && this.options.toplabel && !isTypeField){
          Dom.setStyle(fieldEl, 'text-align', 'left');
          Dom.setStyle(fieldEl, 'float', 'left');
          Dom.setStyle(fieldEl, 'clear', 'left');
        }

        this.divEl.appendChild(fieldEl);

        this.appendSeparator(i);
      }

      this.setFieldName(this.options.name);


    },

    /**
     * Override to force required option on each subfield
     * @param {Object} fieldOptions The field properties as required by inputEx()
     */
    renderField: function(fieldOptions) {

      // Subfields should inherit required property
      if (this.options.required) {
        fieldOptions.required = true;
      }

      return inputEx.CombineField.superclass.renderField.call(this, fieldOptions);
    },


    setFieldName: function(name) {
      if (name) {
        for (var i = 0; i < this.inputs.length; i++) {
          var newName = "";
          if (this.inputs[i].options.name) {
            newName = name + "[" + this.inputs[i].options.name + "]";
          } else {
            newName = name + "[" + i + "]";
          }
          this.inputs[i].setFieldName(newName);
        }
      }
    },

    /**
     * Add a separator to the divEl
     */
    appendSeparator: function(i) {
      if (this.options.separators && this.options.separators[i]) {
        var sep = inputEx.cn('div', {
          className: 'inputEx-CombineField-separator'
        }, null, this.options.separators[i]);
        this.divEl.appendChild(sep);
      }
    },

    initEvents: function() {
      var me = this,
          blurTimeout;

      inputEx.CombineField.superclass.initEvents.apply(this, arguments);

      Event.addListener(this.divEl, "focusout", function(e) {
        // store local copy of the event to use in setTimeout
        e = lang.merge(e);
        blurTimeout = window.setTimeout(function() {
          blurTimeout = null;
          me.onBlur(e);
        }, 25);
      });

      Event.addListener(this.divEl, "focusin", function(e) {
        if (blurTimeout !== null) {
          window.clearTimeout(blurTimeout);
          blurTimeout = null;
        } else {
          me.onFocus(e);
        }
      });
    },



    /**
     * Set the value
     * @param {Array} values [value1, value2, ...]
     * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
     */
    setValue: function(values, sendUpdatedEvt) {
      if (!values) {
        return;
      }
      var i, n = this.inputs.length, offset = 0;

      if (lang.isArray(values)) {
          for (i = 0; i < n; i++) {
              this.inputs[i].setValue(values[i], false);
          }
      } else {
          for (i = 0; i < n; i++) {
              var len = parseInt(this.inputs[i].options.maxLength);
              this.inputs[i].setValue(values.substr(offset, len), false);
              offset += len;
          }
      }



      this.runFieldsInteractions();

      if (sendUpdatedEvt !== false) {
        // fire update event
        this.fireUpdatedEvt();
      }
    },

    /**
     * Specific getValue
     * @return {Array} An array of values [value1, value2, ...]
     */
    getValue: function() {
      var value = "", i = 0, n = this.inputs.length;
      for (i = 0; i < n; i++) {
        value += this.inputs[i].getValue();
      }
      return value;
    },


    /**
     * Validate each field
     * @returns {Boolean} true if all fields validate and required fields are not empty
     */
    validate: function() {
      var response = true;

      if(this.isHidden()) return true;

      var val = this.getValue();

      // empty field
      if (val === '') {
        // validate only if not required
        return !this.options.required;
      }

      //check the lenght of each input
      for(var i = 0; i < this.inputs.length; i++){
        if(this.inputs[i].length < this.inputs[i].options.minLength)
          return false;

        if (!lang.isUndefined(this.inputs[i].options.maxLength) && isNaN(parseInt(this.inputs[i].options.maxLength))){
          this.options.messages.custom = "maxLength property is invalid. Please go to the admin and update the maxLength of the field"
          return false;
        }
      }

      // Check regex matching and minLength (both used in password field...)
      var result = true;

      // if we are using a regular expression
      if (this.options.regexp) {
        result = result && val.match(this.options.regexp);
      }

      return result;
    },


    initAutoTab: function() {
       if (this.inputs.length == 0) return;
       
        // verify charCode (don't auto tab when pressing "tab", "arrow", etc...)
       var checkNumKey = function(charCode) {
         for (var i=48; i <= 122; i++) {
            if (charCode == i) return true;
         }
         return false;       
       };
       
       // Function that checks charCode and execute tab action
       var that = this;
       var autoTab = function(inputIndex) {
           // later to let input update its value
         lang.later(0, that, function() {
             var input = that.inputs[inputIndex];
             
             // check input.el.value (string) because getValue doesn't work
             // example : if input.el.value == "06", getValue() == 6 (length == 1 instead of 2)
             if (input.el.value.length == input.options.maxLength) {
                that.inputs[inputIndex+1].focus();
             }
         });
       };
       
       // add listeners on inputs
       for(var i = 0; i < this.inputs.length; i++){
         Event.addListener(this.inputs[i].el, "keypress", function(e, el) {
            for(var i=0; i < this.inputs.length;i++){
              if(this.inputs[i].el == e.currentTarget) break;
            }
            if (checkNumKey(Event.getCharCode(e)) && i < this.inputs.length - 1) {
                autoTab(i);
             }
        }, this, true);         
       }
    }    

  });

  // Register this class as "combine" type
  inputEx.registerType("combine", inputEx.CombineField, [{
    type: "autocomplete-field",
    label: I18n.t('form.field.field'),
    name: "name",
    choices: [],
    required: true
  }, {
    type: "string",
    label: I18n.t('form.field.label'),
    name: "label",
    value: ''
  },{
    type: "boolean",
    label: I18n.t('form.field.on_same_line'),
    name: "align",
    value: false
  }, {
    type: "boolean",
    label: I18n.t('form.field.on_new_line'),
    name: "newline",
    value: false
  },{
    type: "boolean",
    label: I18n.t('form.field.label_on_top'),
    name: "toplabel",
    value: false
  }, {
    type: 'string',
    label: I18n.t('form.field.regexp_validation'),
    name: 'regexp',
    value: ''
  }, { 
    type: 'list', 
    label: I18n.t('form.field.fields'),
    name: 'fields', 
    elementType: {type: 'type' } 
  },{
    type: 'list',
    name: 'separators',
    label: I18n.t('form.field.separators'),
    elementType: {type: 'string'},
    required: true
  }], true);

})();