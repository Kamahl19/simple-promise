class Prom {
    // TODO - chaining

    constructor(promiseCb) {
        this._promiseCb = promiseCb;
        this._setPending();
        this._value = undefined;
        this._resolveCb = undefined;
        this._rejectCb = undefined;
    }

    then(resolveCb, rejectCb) {
        if (this._promiseCb && this._isPending()) {
            this._resolveCb = resolveCb;
            this._rejectCb = rejectCb;

            this._promiseCb(this._doResolve, this._doReject);
        }
    }

    catch(rejectCb) {
        return this.then(null, rejectCb);
    }

    static resolve(res) {
        if (res instanceof Prom) {
            return res;
        }

        return new Prom((resolve) => {
            resolve(res);
        });
    }

    static reject(res) {
        return new Prom((resolve, reject) => {
            reject(res);
        });
    }

    static race(promiseArr) {
        if (Array.isArray(promiseArr)) {
            return new Prom((resolve, reject) => {
                promiseArr.forEach((prom) => {
                    Prom.resolve(prom).then(resolve, reject);
                });
            });
        }

        return Prom.reject('Error: Prom.race\'s parameter must be an array');
    }

    static all(promiseArr) {
        if (Array.isArray(promiseArr)) {
            return new Prom((resolve, reject) => {
                let remaining = promiseArr.length;
                const results = [];

                if (remaining === 0) {
                    resolve(results);
                }
                else {
                    promiseArr.forEach((prom, i) => {
                        prom.then((result) => {
                            results[i] = result;

                            if (--remaining === 0) {
                                resolve(results);
                            }
                        }, (err) => {
                            resolve(reject(err));
                        });
                    });
                }
            });
        }

        return Prom.reject('Error: Prom.all\'s parameter must be an array');
    }

    _doResolve = (res) => {
        if (this._isPending()) {
            this._setResolved();
            this._value = res;

            if (typeof this._resolveCb === 'function') {
                this._resolveCb(res);
            }
        }
    }

    _doReject = (res) => {
        if (this._isPending()) {
            this._setRejected();
            this._value = res;

            if (typeof this._rejectCb === 'function') {
                this._rejectCb(res);
            }
            else {
                console.error(`Uncaught (in promise) ${res}`);
            }
        }
    }

    _isPending = () => this._state === 0
    _isResolved = () => this._state === 1
    _isRejected = () => this._state === 2
    _setPending = () => { this._state = 0; }
    _setResolved = () => { this._state = 1; }
    _setRejected = () => { this._state = 2; }
}

/*
 * Test basic new Prom() functionality
 */
function testBasic() {
    return new Prom((resolve, reject) => {
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
 * Test Prom.resolve and Prom.reject
 */
function testStatic() {
    const rand = Math.random();

    if (rand >= 0.5) {
        return Prom.resolve(rand);
    }
    return Prom.reject(rand);
}

testStatic().then((result) => {
    console.log('Static Success', result);
}, (result) => {
    console.log('Static Failure', result);
});

/**
 * Test Prom.race
 */
function testRace() {
    const rand = Math.random();

    return [
        new Prom((resolve, reject) => {
            setTimeout(() => {
                if (rand >= 0.5) {
                    resolve('first');
                }
                else {
                    reject('first');
                }
            }, 2000);
        }),
        new Prom((resolve, reject) => {
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

Prom.race(testRace()).then((result) => {
    console.log('Race Success', result);
}, (result) => {
    console.log('Race Failure', result);
});

/**
 * Test Prom.all
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

    return [new Prom(asyncCb), new Prom(asyncCb)];
}

Prom.all(testAll()).then((results) => {
    console.log('All Success', results);
}, (results) => {
    console.log('All Failure', results);
});

/*
 * Test chaining
 */
// function testChaining() {
//     return new Prom((resolve, reject) => {
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
//     console.log('Chaining Success', result);
// }).then(undefined, (result) => {
//     console.log('Chaining Failure', result);
// });
