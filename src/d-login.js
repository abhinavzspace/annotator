/**
 * Created by abhinav on 23/08/16.
 */

"use strict";

var util = require('./util');

var $ = util.$;
var _t = util.gettext;

var store = require('./local-store').store;

var NS = 'annotator-login';

var USERDATA = 'userdata';

// Public: Creates a new instance of the Login.
//
// options - An Object literal of options.
//
// Returns a new instance of the Login.
var Login = exports.Login = function Login(options) {
    this.options = $.extend(true, {}, Login.options, options);
    this.classes = $.extend(true, {}, Login.classes);
    this.element = $(Login.html.element).appendTo(this.options.appendTo);

    self = this;
    this._getUserData().then(function (userdata) {
        if (userdata !== null) {
            self._showLogout();
        } else {
            self._showLoginContainer();
        }
    });

    var self = this;
    this.element
        .on("click." + NS, '.annotator-switchto-login', function (e) {
            self._showLoginContainer(e);
        })
        .on("click." + NS, '.annotator-switchto-signup', function (e) {
            self._showSignupContainer(e);
        })
        .on("submit." + NS, 'form.annotator-login-container', function (e) {
            self._doLogin(e);
        })
        .on("submit." + NS, 'form.annotator-signup-container', function (e) {
            self._doSignup(e);
        })
        .on("click." + NS, '.annotator-logout', function (e) {
            self._doLogout(e);
        });
};


Login.prototype._showLoginContainer = function (event) {
    this.element.find('.annotator-logout').hide();

    this.element.find('.annotator-signup-container').hide();
    this.element.find('.annotator-login-container').show();
};


Login.prototype._showSignupContainer = function (event) {
    this.element.find('.annotator-logout').hide();

    this.element.find('.annotator-login-container').hide();
    this.element.find('.annotator-signup-container').show();
};


Login.prototype._doLogin = function (event) {
    event.preventDefault();

    var username = this.element.find('.annotator-login-container input[type=text]').val();
    var email = this.element.find('.annotator-login-container input[type=email]').val();
    var password = this.element.find('.annotator-login-container input[type=password]').val();

    var obj = {
        "username": username,
        "email": email,
        "password": password
    };

    var req = this._apiRequest('/login', 'post', obj);
    var self = this;
    console.log('req login', req);
    req.then(function (data) {
        console.log('login: ', data);
        self._setUserData(data).then(function () {
            self._showLogout();
            self.options.onLogin();
        });
    });
};

Login.prototype._doSignup = function (event) {
    event.preventDefault();

    var username = this.element.find('.annotator-signup-container input[type=text]').val();
    var email = this.element.find('.annotator-signup-container input[type=email]').val();
    var password = this.element.find('.annotator-signup-container input[type=password]').val();

    var obj = {
        "username": username,
        "email": email,
        "password": password
    };

    var req = this._apiRequest('/signup/basic', 'post', obj);
    var self = this;
    req.then(function (data) {
        console.log('signup: ', data);
        self._setUserData(data).then(function () {
            self._showLogout();
        });
    });
};


Login.prototype._doLogout = function (event) {
    var req = this._apiRequest('/logout', 'get');
    var self = this;
    console.log('req logout', req);
    req.then(function (data) {
        console.log('logout: ', data);
        self._removeUserData(data).then(function () {
            self._showLoginContainer();
        });
    });
}


Login.prototype._setUserData = function (data) {
    var dataString = JSON.stringify({
        token: data.token,
        user: data.user
    });
    return store.set(USERDATA, dataString);
};


Login.prototype._removeUserData = function () {
    return store.remove(USERDATA);
};

Login.prototype._getUserData = function () {
    return store.get(USERDATA).then(function (userdata) {
        if (typeof  userdata !== 'undefined' && userdata !== null) {
            return JSON.parse(userdata);
        }
        return null;
    });
};

Login.prototype._getToken = function () {
    return this._getUserData().then(function (userdata) {
        if (userdata && userdata.token) {
            return userdata.token;
        }
        return null;
    });
};


Login.prototype._showLogout = function () {
    this.element.find('.annotator-login-container').hide();
    this.element.find('.annotator-signup-container').hide();
    this.element.find('.annotator-logout').show();
};


Login.prototype._apiRequest = function (action, type, obj) {
    var data = ( obj && JSON.stringify(obj) ) || '';
    var dataType = type === 'get' ? 'text' : 'json';
    var self = this;
    var opts = {
        type: type,
        dataType: dataType,
        error: function () {
            self._onError.apply(self, arguments);
        },
        data: data,
        contentType: "application/json; charset=utf-8"
    };

    var url = this.options.urlPrefix + action;

    var p = new Promise(function (resolve) {
        if (action === '/logout') {
            var token;
            self._getToken().then(function (token) {
                opts.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                };
                $.ajax(url, opts).done(function (data) {
                    resolve(data);
                });
            });
        }

        $.ajax(url, opts).done(function (data) {
            resolve(data);
        });
    });
    return p;
}

Login.prototype.isLoggedIn = function () {
    return this._getUserData().then(function (userdata) {
        if (userdata !== null && typeof userdata.token !== 'undefined') {
            return true;
        }
        return false;
    });
}


//FIXME: change error messages
Login.prototype._onError = function (xhr) {
    var message;
    if (xhr.status === 400) {
        message = _t("The annotation store did not understand the request! " +
            "(Error 400)");
    } else if (xhr.status === 401) {
        message = _t("You must be logged in to perform this operation! " +
            "(Error 401)");
    } else if (xhr.status === 403) {
        message = _t("You don't have permission to perform this operation! " +
            "(Error 403)");
    } else if (xhr.status === 404) {
        message = _t("Could not connect to the annotation store! " +
            "(Error 404)");
    } else if (xhr.status === 500) {
        message = _t("Internal error in annotation store! " +
            "(Error 500)");
    } else {
        message = _t("Unknown error while speaking to annotation store!");
    }

    console.error("API request failed: " + message, xhr.status);
};


// Public: remove the filter instance and unbind events.
//
// Returns nothing.
Login.prototype.destroy = function () {
    this.element.off("." + NS);
    this.element.remove();
};


// Common classes used to change filter state.
Login.classes = {
    active: 'annotator-filter-active',
    hl: {
        hide: 'annotator-hl-filtered',
        active: 'annotator-hl-active'
    }
};

// HTML templates for the filter UI.
Login.html = {
    element: [
        '<div class="annotator-login">',
        '   <div class="annotator-login-inside">',

        '   <form class="annotator-login-container">',
        '       <input type="text" name="username" placeholder="Username">',
        '       <input type="email" name="email" placeholder="yourname@email.com">',
        '       <input type="password" name="password" placeholder="password">',
        '       <input type="submit" value="Go In!">',
        '/',
        '       <button type="button" class="annotator-switchto-signup">' +
        _t('Sign up') +
        '   </button>',
        '   </form>',

        '   <form class="annotator-signup-container" style="display: none">',
        '       <input type="text" name="username" placeholder="Username">',
        '       <input type="email" name="email" placeholder="yourname@email.com">',
        '       <input type="password" name="password" placeholder="password">',
        '       <input type="submit" value="Go In!">',
        '/',
        '       <button type="button" class="annotator-switchto-login">' +
        _t('Log in') +
        '   </button>',
        '   </form>',

        '    <button type="button" style="display: none"',
        '            class="annotator-logout">' +
        _t('Logout') +
        '</button>',
        '</div>',
        '</div>'
    ].join('\n')
};

// Default options for Login.
Login.options = {
    // A CSS selector or Element to append the login toolbar to.
    appendTo: 'body',

    urlPrefix: 'https://localhost:7777',

    onLogin: function () {
        // dummy implementation
        // provide this function in options
    }
};


// standalone is a module that uses the Login component to display a login bar
exports.login = function (options) {
    var widget = new exports.Login(options);

    return {
        destroy: function () {
            widget.destroy();
        },
        configure: function (registry) {
            registry.registerUtility(this, 'login');
        },
        isLoggedIn: function () {
            return widget.isLoggedIn();
        }
    };
};
