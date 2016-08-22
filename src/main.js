class SimplePromise {
    // TODO - chaining
    constructor(promiseCb) {
        this._promiseCb = promiseCb;

        this._setPending();

        this._value = undefined;
        this._reason = undefined;

        this._onFulfilled = undefined;
        this._onRejected = undefined;
    }

    _doFulfill = (value) => {
        if (this._isPending()) {
            this._setFulfilled();
            this._value = value;

            if (typeof this._onFulfilled === 'function') {
                this._onFulfilled(value);
            }
        }
    }

    _doReject = (reason) => {
        if (this._isPending()) {
            this._setRejected();
            this._reason = reason;

            if (typeof this._onRejected === 'function') {
                this._onRejected(reason);
            }
            else {
                console.error(`Uncaught (in promise) ${reason}`);
            }
        }
    }

    _async = (cb) => {
        setTimeout(cb);
    }

    _isPending = () => this._state === 0;
    _isFulfilled = () => this._state === 1;
    _isRejected = () => this._state === 2;

    _setPending = () => { this._state = 0; }
    _setFulfilled = () => { this._state = 1; }
    _setRejected = () => { this._state = 2; }

    then(onFulfilled, onRejected) {
        if (this._promiseCb && this._isPending()) {
            this._onFulfilled = onFulfilled;
            this._onRejected = onRejected;

            this._promiseCb(this._doFulfill, this._doReject);
        }
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    static resolve(value) {
        if (value instanceof SimplePromise) {
            return value;
        }

        return new SimplePromise((resolve) => {
            resolve(value);
        });
    }

    static reject(reason) {
        return new SimplePromise((resolve, reject) => {
            reject(reason);
        });
    }

    static race(promiseArr) {
        if (Array.isArray(promiseArr)) {
            return new SimplePromise((resolve, reject) => {
                promiseArr.forEach((prom) => {
                    SimplePromise.resolve(prom).then(resolve, reject);
                });
            });
        }

        return SimplePromise.reject('Error: SimplePromise.race\'s parameter must be an array');
    }

    static all(promiseArr) {
        if (Array.isArray(promiseArr)) {
            return new SimplePromise((resolve, reject) => {
                let remaining = promiseArr.length;
                const values = [];

                if (remaining === 0) {
                    resolve(values);
                }
                else {
                    promiseArr.forEach((prom, i) => {
                        prom.then((value) => {
                            values[i] = value;

                            if (--remaining === 0) {
                                resolve(values);
                            }
                        }, (reason) => {
                            resolve(reject(reason));
                        });
                    });
                }
            });
        }

        return SimplePromise.reject('Error: SimplePromise.all\'s parameter must be an array');
    }
}

/**
 * Test if promise is async
 * Success if the order is 1, 2, 3
 */
console.log('Test async', 1);
new SimplePromise((resolve) => {
    resolve();
}).then(() => {
    console.log('Test async', 3);
});
console.log('Test async', 2);

/*
 * Test chaining
 * TODO
 */
// function testChaining() {
//     return new SimplePromise((resolve, reject) => {
//         setTimeout(() => {
//             const rand = Math.random();

//             if (rand >= 0.5) {
//                 resolve(rand);
//             }
//             else {
//                 reject(rand);
//             }
//         }, 1000);
//     });
// }

// testChaining().then((result) => {
//     console.log('Chaining Success 1', result);
//     return result;
// }).then((result) => {
//     console.log('Chaining Failure 2', result);
// });

/**
 * Test - resolve rejected promise
 * TODO
 */
// new SimplePromise((resolve) => {
//     resolve(SimplePromise().reject(aa));
// }).then((result) => {
//     console.log('Success', result);
// }, (result) => {
//     console.log('Failure', result);
// });

/*
 * Test basic new SimplePromise() functionality
 */
function testBasic() {
    return new SimplePromise((resolve, reject) => {
        setTimeout(() => {
            const rand = Math.random();

            if (rand >= 0.5) {
                resolve(rand);
            }
            else {
                reject(rand);
            }
        }, 1000);
    });
}

testBasic().then((result) => {
    console.log('Basic Success', result);
}, (result) => {
    console.log('Basic Failure', result);
});

/*
 * Test SimplePromise.resolve and SimplePromise.reject
 */
function testStatic() {
    const rand = Math.random();

    if (rand >= 0.5) {
        return SimplePromise.resolve(rand);
    }
    return SimplePromise.reject(rand);
}

testStatic().then((result) => {
    console.log('Static Success', result);
}, (result) => {
    console.log('Static Failure', result);
});

/**
 * Test SimplePromise.race
 */
function testRace() {
    const rand = Math.random();

    return [
        new SimplePromise((resolve, reject) => {
            setTimeout(() => {
                if (rand >= 0.5) {
                    resolve('first');
                }
                else {
                    reject('first');
                }
            }, 2000);
        }),
        new SimplePromise((resolve, reject) => {
            setTimeout(() => {
                if (rand >= 0.5) {
                    resolve('second');
                }
                else {
                    reject('second');
                }
            }, 1000);
        })
    ];
}

SimplePromise.race(testRace()).then((result) => {
    console.log('Race Success', result);
}, (result) => {
    console.log('Race Failure', result);
});

/**
 * Test SimplePromise.all
 */
function testAll() {
    const asyncCb = (resolve, reject) => {
        setTimeout(() => {
            const rand = Math.random();

            if (rand >= 0.5) {
                resolve(rand);
            }
            else {
                reject(rand);
            }
        }, 1000);
    };

    return [new SimplePromise(asyncCb), new SimplePromise(asyncCb)];
}

SimplePromise.all(testAll()).then((results) => {
    console.log('All Success', results);
}, (results) => {
    console.log('All Failure', results);
});
