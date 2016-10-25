/**
 * Created by abhinav on 24/08/16.
 */

var util = require('./util');
var $ = util.$;


// Public: Creates a new instance of the Uri.
//
// options - An Object literal of options.
//
// Returns a new instance of the Uri.
var Uri = exports.Uri = function Uri(options) {
    this.options = $.extend(true, {}, Uri.options, options);
    this.options.uri = window.location.href;
};

Uri.options = {};


exports.uri = function (options) {
    var uriModule = new exports.Uri(options);
    return {
        configure: function (registry) {
            registry.registerUtility(this, 'uri');
        },
        beforeAnnotationCreated: function (ann) {
            ann.uri = uriModule.options.uri;
            return ann;
        }
    };
};