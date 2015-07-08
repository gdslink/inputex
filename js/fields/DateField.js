(function () {
    var lang = YAHOO.lang, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;
    /**
     * A Date Field.
     * @class inputEx.DateField
     * @extends inputEx.StringField
     * @constructor
     * @param {Object} options Add the folowing options:
     * <ul>
     *     <li>dateFormat: Editor format (the one which is presented to the user) default to 'm/d/Y'</li>
     *    <li>valueFormat: if falsy, the field will return a javascript Date instance. Otherwise, this format will be used for input parsing/output formatting</li>
     * </ul>
     */
    inputEx.DateField = function (options) {
        inputEx.DateField.superclass.constructor.call(this, options);
    };

    lang.extend(inputEx.DateField, inputEx.StringField, {
        /**
         * Adds the 'inputEx-DateField' default className
         * @param {Object} options Options object as passed to the constructor
         */
        setOptions:function (options) {
            inputEx.DateField.superclass.setOptions.call(this, options);

            // Overwrite options
            this.options.className = options.className ? options.className : 'inputEx-Field inputEx-DateField';

            // Added options
            this.options.dateFormat = options.dateFormat || inputEx.messages.defaultDateFormat;
            this.options.valueFormat = this.options.dateFormat;

            this.options.messages.invalid = (this.options.dateFormat == 'm/d/Y' ? "Invalid date, ex: MM/DD/YYYY" : "Invalid date, ex: DD/MM/YYYY");
        },

        /**
         * Specific Date validation depending of the 'format' option
         */
        validate:function () {
            var value = this.el.value;

            if (this.isHidden()) return true;

            var ladate = value.split(/\/|-/);
            if (ladate.length != 3) {
                return false;
            }
            if (isNaN(parseInt(ladate[0], 10)) || isNaN(parseInt(ladate[1], 10)) || isNaN(parseInt(ladate[2], 10))) {
                return false;
            }
            var formatSplit = this.options.dateFormat.split('/');
            var yearIndex = inputEx.indexOf('Y', formatSplit);
            if (ladate[yearIndex].length != 4) {
                return false;
            } // Avoid 3-digits years...
            var d = parseInt(ladate[ inputEx.indexOf('d', formatSplit) ], 10);
            var Y = parseInt(ladate[yearIndex], 10);
            var m = parseInt(ladate[ inputEx.indexOf('m', formatSplit) ], 10) - 1;
            var unedate = new Date(Y, m, d);
            var annee = unedate.getFullYear();
            return ((unedate.getDate() == d) && (unedate.getMonth() == m) && (annee == Y));
        },


        /**
         * Format the date according to options.dateFormat
         * @param {Date} val Date to set
         * @param {boolean} [sendUpdatedEvt] (optional) Wether this setValue should fire the updatedEvt or not (default is true, pass false to NOT send the event)
         */
        setValue:function (val, sendUpdatedEvt) {
            // Don't try to parse a date if there is no date
            if (val === '') {
                inputEx.DateField.superclass.setValue.call(this, '', sendUpdatedEvt);
                return;
            }
            var str = "";

            //try to convert value to date
            var tmpDate = new Date(val);
            if (Object.prototype.toString.call(tmpDate) === "[object Date]"){
                if( isNaN(tmpDate.getTime())){
                }else{
                    val = tmpDate;
                }
            }


            if (val instanceof Date) {
                str = inputEx.DateField.formatDate(val, this.options.dateFormat);
            }
            else if (this.options.valueFormat && val) {
                var dateVal = inputEx.DateField.parseWithFormat(val, "Y/m/d");
                if(dateVal instanceof Date){
                    str = inputEx.DateField.formatDate(dateVal, this.options.dateFormat);
                }
            }
            // else date must match this.options.dateFormat
            else {
                str = val;
            }

            inputEx.DateField.superclass.setValue.call(this, str, sendUpdatedEvt);
        },

        /**
         * Return the date
         * @param {Boolean} forceDate Skip the valueFormat option if set to truthy
         * @return {String || Date} Formatted date using the valueFormat or a javascript Date instance
         */
        getValue:function (forceDate) {
            // let parent class function check if typeInvite, etc...
            var value = inputEx.DateField.superclass.getValue.call(this);

            // Hack to validate if field not required and empty
            if (!value || value === '') {
                return '';
            }

            var finalDate = inputEx.DateField.parseWithFormat(value, this.options.dateFormat);

            // if valueFormat is specified, we format the string
            if (!forceDate && this.options.valueFormat) {
                return inputEx.DateField.formatDate(finalDate, "Ymd");
            }

            return finalDate;
        }

    });

    /**
     * Those methods are limited but largely enough for our usage
     */
    inputEx.DateField.parseWithFormat = function (sDate, format) {
        try{
            var separator = format.match(/[^Ymd ]/g)[0];
            if (sDate.indexOf(separator) >= 0) {
                var ladate = sDate.split(separator);
                var formatSplit = format.split(separator);
                var d = parseInt(ladate[ inputEx.indexOf('d', formatSplit) ], 10);
                var Y = parseInt(ladate[ inputEx.indexOf('Y', formatSplit) ], 10);
                var m = parseInt(ladate[ inputEx.indexOf('m', formatSplit) ], 10) - 1;
                return (new Date(Y, m, d));
            } else {
                var ladate = sDate.match(/(\d{4})(\d{2})(\d{2})/);
                if (lang.isNull(ladate))
                    return '';
                var Y = parseInt(ladate[1], 10);
                var m = parseInt(ladate[2], 10) - 1;
                var d = parseInt(ladate[3], 10);
                return (new Date(Y, m, d));
            }
        }catch(e){
            console.log('Date <' + sDate + '> is not a date or date invalid')
            return '';
        }
    };

    /**
     * Those methods are limited but largely enough for our usage
     */
    inputEx.DateField.formatDate = function (d, format) {
        if (d instanceof Date) {
            var str = format.replace('Y', d.getFullYear());
            var m = d.getMonth() + 1;
            str = str.replace('m', ((m < 10) ? '0' : '') + m);
            var day = d.getDate();
            str = str.replace('d', ((day < 10) ? '0' : '') + day);
            return str;
        }
    };

// Specific message for the container
// inputEx.messages.invalidDate = "Invalid date, ex: 03/27/2008";

// Register this class as "date" type
    inputEx.registerType("date", inputEx.DateField, [
        {type:'select', label: I18n.t('form.date.date_format'), name:'dateFormat', choices:[
            { value:"m/d/Y" },
            { value:"d/m/Y" },
            { value:"Y/m/d" }
        ] }
    ]);

})();