(function() {

  /**
  * Create a queue field that will load the queue table at runtime
  * Added Options:
  * <ul>
  *    <li>visu: inputEx visu type</li>
  * </ul>
  * @class inputEx.QueueField
  * @extends inputEx.Field
  * @constructor
  * @param {Object} options inputEx.Field options object
  */
  inputEx.QueueField = function(options) {
    inputEx.QueueField.superclass.constructor.call(this,options);
  };
  YAHOO.lang.extend(inputEx.QueueField, inputEx.UneditableField, {

  /**
   * Set the default values of the options
   * @param {Object} options Options object as passed to the constructor
  */
  setOptions: function(options) {
    inputEx.QueueField.superclass.setOptions.call(this,options);
    this.options.queue = this.options.value = options.queue;
    this.options.className = "inputEx-queue-fieldWrapper"
    options.visu = {
      visuType: 'func', 
      func: function(value){
        if(value){
          name_key = value.split('@_@@_@');
          return "<div class='inputex-queue-placeholder'>["+ name_key[0] +"]</div> \
                  <table id='queue-" + name_key[1]+ "' class='inputEx-queue' data-name='" + name_key[0] + "' data-key='" + name_key[1] + "'></table><div id='" + name_key[1] + "-pager'></div>"                  
        }
      }       
    }    
    this.options.visu = options.visu;
  },

  getValue: function(){

  },

  setValue: function(val, sendUpdatedEvt) {
   this.value = val;

   inputEx.renderVisu(this.options.visu, this.options.queue, this.fieldContainer);
  },

  renderComponent: function() {
    inputEx.renderVisu(this.options.visu, this.options.queue, this.fieldContainer);
  }

});

// Register this class as "url" type
inputEx.registerType("queue", inputEx.QueueField, [
{
    type: "autocomplete-field",
    label: I18n.t('form.field.label'),
    name: "name",    
    required: true
},
{
  type: "autocomplete-queue",
  label: I18n.t('form.field.queue'),
  name: "queue",
  typeInvite: I18n.t('form.field.invite.queue_name'),
  required: false
  }], true);

})();