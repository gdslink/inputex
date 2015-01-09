(function() {

   var Event = YAHOO.util.Event, lang = YAHOO.lang;

/**
 * A field limited to number inputs (floating)
 * @class inputEx.DateTimeField
 * @extends inputEx.CombineField
 * @constructor
 * @param {Object} options Added options
 * <ul>
 *    <li>dateFormat: same as DateField</li>
 * </ul>
 */
inputEx.DateTimeField = function(options) {
   options.fields = [
      {type: 'datepicker'},
      {type: 'time'}
   ];
   if(options.dateFormat) {
      options.fields[0].dateFormat = options.dateFormat;
   }
   options.separators = options.separators || [false, "&nbsp;&nbsp;", false];
   inputEx.DateTimeField.superclass.constructor.call(this,options);
};
lang.extend(inputEx.DateTimeField, inputEx.CombineField, {   
   /**
    * Concat the values to return a date
    * @return {Date} The javascript Date object
    */
   getValue: function() {
      var d = this.inputs[0].getValue();
      if( d == '' ) return;
      return d + " " + this.inputs[1].getValue();
   },

   /**
    * Set the value of both subfields
    * @param {Date} val Date to set
    * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
    */
   setValue: function(val, sendUpdatedEvt) {
       var dt = val.split(' ');
       inputEx.DateTimeField.superclass.setValue.call(this, [dt[0], dt[1]], sendUpdatedEvt);
   }

});



// Register this class as "time" type
inputEx.registerType("datetime", inputEx.DateTimeField);

})();