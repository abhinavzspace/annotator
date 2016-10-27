/**
 * Created by abhinav on 26/10/16.
 */

var firebase = require('firebase');
var FIREBASE_CONFIG = {
    apiKey: "AIzaSyCbgUB6vo4tvyecsJc1bEo2tNpDkxBbvGw",
    authDomain: "docri-77b12.firebaseapp.com",
    databaseURL: "https://docri-77b12.firebaseio.com",
    storageBucket: "docri-77b12.appspot.com",
    messagingSenderId: "78698555154"
}
firebase.initializeApp(FIREBASE_CONFIG);
// firebase.database.enableLogging(true)
var auth = firebase.auth();
// var database = firebase.database();

exports.auth = auth