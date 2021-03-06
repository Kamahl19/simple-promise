(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SimplePromise", [], factory);
	else if(typeof exports === 'object')
		exports["SimplePromise"] = factory();
	else
		root["SimplePromise"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var isFunction = function isFunction(f) {
	    return typeof f === 'function';
	};
	var isObject = function isObject(o) {
	    return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
	};
	
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	
	var SimplePromise = function () {
	    function SimplePromise(resolver) {
	        var _this = this;
	
	        _classCallCheck(this, SimplePromise);
	
	        if (!isFunction(resolver)) {
	            throw new TypeError('SimplePromise resolver ' + resolver + ' is not a function');
	        }
	
	        this.callbacks = [];
	        this.state = PENDING;
	
	        var transition = function transition(state, x) {
	            setTimeout(function () {
	                if (_this.state === PENDING) {
	                    _this.state = state;
	                    _this.x = x;
	
	                    _this.callbacks.forEach(function (cb) {
	                        if (state === FULFILLED) {
	                            cb.onFulfilled(x);
	                        } else {
	                            cb.onRejected(x);
	                        }
	                    });
	                }
	            });
	        };
	
	        function resolve(value) {
	            if (SimplePromise.isSimplePromise(value)) {
	                value.then(resolve, reject);
	            } else {
	                transition(FULFILLED, value);
	            }
	        }
	
	        function reject(reason) {
	            transition(REJECTED, reason);
	        }
	
	        try {
	            resolver(resolve, reject);
	        } catch (e) {
	            reject(e);
	        }
	    }
	
	    _createClass(SimplePromise, [{
	        key: 'then',
	        value: function then(onFulfilled, onRejected) {
	            var _this2 = this;
	
	            var onFulfill = isFunction(onFulfilled) ? onFulfilled : function (v) {
	                return v;
	            };
	            var onReject = isFunction(onRejected) ? onRejected : function (r) {
	                throw r;
	            };
	
	            var promise2 = void 0;
	
	            function resolvePromise(promise, x, resolve, reject) {
	                if (promise === x) {
	                    reject(new TypeError('You cannot resolve a promise with itself'));
	                } else if (SimplePromise.isSimplePromise(x)) {
	                    if (x.state === PENDING) {
	                        x.then(function (v) {
	                            resolvePromise(promise, v, resolve, reject);
	                        }, reject);
	                    } else {
	                        x.then(resolve, reject);
	                    }
	                } else if (x !== null && (isObject(x) || isFunction(x))) {
	                    (function () {
	                        var thenCalledOrThrow = false;
	
	                        try {
	                            var then = x.then;
	
	                            if (isFunction(then)) {
	                                then.call(x, function (y) {
	                                    if (!thenCalledOrThrow) {
	                                        thenCalledOrThrow = true;
	                                        resolvePromise(promise, y, resolve, reject);
	                                    }
	                                }, function (r) {
	                                    if (!thenCalledOrThrow) {
	                                        thenCalledOrThrow = true;
	                                        reject(r);
	                                    }
	                                });
	                            } else {
	                                resolve(x);
	                            }
	                        } catch (e) {
	                            if (!thenCalledOrThrow) {
	                                thenCalledOrThrow = true;
	                                reject(e);
	                            }
	                        }
	                    })();
	                } else {
	                    resolve(x);
	                }
	            }
	
	            function schedulePromiseResolution(resolve, reject, state, value) {
	                try {
	                    var x = state === FULFILLED ? onFulfill(value) : onReject(value);
	                    resolvePromise(promise2, x, resolve, reject);
	                } catch (e) {
	                    reject(e);
	                }
	            }
	
	            if (this.state === PENDING) {
	                promise2 = new SimplePromise(function (resolve, reject) {
	                    _this2.callbacks.push({
	                        onFulfilled: function onFulfilled(value) {
	                            schedulePromiseResolution(resolve, reject, FULFILLED, value);
	                        },
	                        onRejected: function onRejected(reason) {
	                            schedulePromiseResolution(resolve, reject, REJECTED, reason);
	                        }
	                    });
	                });
	            } else {
	                promise2 = new SimplePromise(function (resolve, reject) {
	                    setTimeout(function () {
	                        schedulePromiseResolution(resolve, reject, _this2.state, _this2.x);
	                    });
	                });
	            }
	
	            return promise2;
	        }
	    }, {
	        key: 'catch',
	        value: function _catch(onRejected) {
	            return this.then(null, onRejected);
	        }
	    }, {
	        key: 'finally',
	        value: function _finally(cb) {
	            return this.then(function (v) {
	                setTimeout(cb);
	                return v;
	            }, function (r) {
	                setTimeout(cb);
	                throw r;
	            });
	        }
	    }], [{
	        key: 'resolve',
	        value: function resolve(value) {
	            return new SimplePromise(function (resolve) {
	                resolve(value);
	            });
	        }
	    }, {
	        key: 'reject',
	        value: function reject(reason) {
	            return new SimplePromise(function (resolve, reject) {
	                reject(reason);
	            });
	        }
	    }, {
	        key: 'all',
	        value: function all(promises) {
	            if (!Array.isArray(promises)) {
	                return SimplePromise.reject(new TypeError('You must pass an array to SimplePromise.all.'));
	            }
	
	            return new SimplePromise(function (resolve, reject) {
	                var remaining = promises.length;
	                var values = [];
	
	                if (remaining === 0) {
	                    resolve(values);
	                }
	
	                promises.forEach(function (promise, i) {
	                    SimplePromise.resolve(promise).then(function (value) {
	                        values[i] = value;
	
	                        if (--remaining === 0) {
	                            resolve(values);
	                        }
	                    }, function (reason) {
	                        return reject(reason);
	                    });
	                });
	            });
	        }
	    }, {
	        key: 'race',
	        value: function race(promises) {
	            if (!Array.isArray(promises)) {
	                return SimplePromise.reject(new TypeError('You must pass an array to SimplePromise.race.'));
	            }
	
	            return new SimplePromise(function (resolve, reject) {
	                promises.forEach(function (promise) {
	                    SimplePromise.resolve(promise).then(resolve, reject);
	                });
	            });
	        }
	    }]);
	
	    return SimplePromise;
	}();
	
	SimplePromise.isSimplePromise = function (sp) {
	    return sp instanceof SimplePromise;
	};
	
	exports.default = SimplePromise;
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=SimplePromise.js.map