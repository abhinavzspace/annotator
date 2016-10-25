/**
 * Created by abhinav on 26/08/16.
 */

var util = require('./util');

var Promise = util.Promise;


var CHROME = 0;
var LOCAL = 1;

var chromeStorage = (function () {
    if (typeof chrome === 'undefined') return false;
    if (chrome !== null && chrome.storage && chrome.storage.local) {
        return chrome.storage.local;
    }
    return false;
}());

// https://mathiasbynens.be/notes/localstorage-pattern
var local_storage = (function () {
    var uid = new Date;
    var storage;
    var result;
    try {
        (storage = window.localStorage).setItem(uid, uid);
        result = storage.getItem(uid) == uid;
        storage.removeItem(uid);
        return result && storage;
    } catch (exception) {
    }
}());

function Store() {

    // First preference if available is, chrome store for chrome extension.
    if (chromeStorage) {
        this.store = chromeStorage;
        this.type = CHROME;
        console.log('CHROME store is ready.');
    } else if (local_storage) {
        this.store = local_storage;
        this.type = LOCAL;
        console.log('LOCAL store is ready.');
    } else {
        console.error('No store found.');
    }
};

Store.prototype.set = function (key, value) {
    var self = this;
    var p = new Promise(function (resolve) {
        if (self.type === CHROME) {
            var obj = {};
            obj[key] = value;
            self.store.set(obj, function () {
                resolve();
            });
        } else if (self.type === LOCAL) {
            self.store.setItem(key, value);
            resolve();
        }
    });
    return p;
};

// returns promise
Store.prototype.get = function (key) {
    var self = this;
    var p = new Promise(function (resolve) {
        if (self.type === CHROME) {
            self.store.get(key, function (data) {
                if (chrome.runtime.lastError) {
                    /* error */
                    return;
                }
                resolve(data[key]);
            });
        } else if (self.type === LOCAL) {
            resolve(self.store.getItem(key));
        }
    });
    return p;
};

Store.prototype.remove = function (key) {
    var self = this;
    var p = new Promise(function (resolve) {
        if (self.type === CHROME) {
            self.store.remove(key, function() {
                if (chrome.runtime.lastError) {
                    /* error */
                    return;
                }
                resolve();
            });
        } else if (self.type === LOCAL) {
            self.store.removeItem(key);
            resolve();
        }
    });
    return p;
};

var store = new Store();

exports.store = store;