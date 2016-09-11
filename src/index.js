const isFunction = (f) => typeof f === 'function';
const isObject = (o) => typeof o === 'object';

const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

export default function SimplePromise(resolver) {
    if (!isFunction(resolver)) {
        throw new TypeError(`SimplePromise resolver ${resolver} is not a function`);
    }

    this.callbacks = [];
    this.state = PENDING;

    // TODO - bug when rejecting with new TypeError, the original message is hidden
    try {
        resolver(resolve, reject);
    }
    catch (e) {
        reject(e);
    }

    const transition = (state, x) => {
        if (this.state === PENDING) {
            setTimeout(() => {
                this.state = state;
                this.x = x;

                this.callbacks.forEach((cb) => {
                    if (state === FULFILLED) {
                        cb.onFulfilled(x);
                    }
                    else {
                        cb.onRejected(x);
                    }
                });
            });
        }
    };

    function resolve(value) {
        if (value instanceof SimplePromise) {
            value.then(resolve, reject);
        }
        else {
            transition(FULFILLED, value);
        }
    }

    function reject(reason) {
        transition(REJECTED, reason);
    }
}

function resolvePromise(promise, x, resolve, reject) {
    // TODO - bug with rejecting with new TypeError
    if (promise === x) {
        reject(new TypeError('You cannot resolve a promise with itself'));
    }
    else if (x instanceof SimplePromise) {
        if (x.state === PENDING) {
            x.then((v) => {
                resolvePromise(promise, v, resolve, reject);
            }, reject);
        }
        else {
            x.then(resolve, reject);
        }
    }
    else if (x !== null && (isObject(x) || isFunction(x))) {
        let thenCalledOrThrow = false;

        try {
            const then = x.then;

            if (isFunction(then)) {
                then.call(x, (y) => {
                    if (!thenCalledOrThrow) {
                        thenCalledOrThrow = true;
                        resolvePromise(promise, y, resolve, reject);
                    }
                }, (r) => {
                    if (!thenCalledOrThrow) {
                        thenCalledOrThrow = true;
                        reject(r);
                    }
                });
            }
            else {
                resolve(x);
            }
        }
        catch (e) {
            if (!thenCalledOrThrow) {
                thenCalledOrThrow = true;
                reject(e);
            }
        }
    }
    else {
        resolve(x);
    }
}

SimplePromise.prototype.then = function (onFulfilled, onRejected) {
    const onFulfill = isFunction(onFulfilled) ? onFulfilled : (v) => v;
    const onReject = isFunction(onRejected) ? onRejected : (r) => {
        throw r;
    };

    let promise2;

    function schedulePromiseResolution(resolve, reject, state, value) {
        try {
            const x = (state === FULFILLED) ? onFulfill(value) : onReject(value);
            resolvePromise(promise2, x, resolve, reject);
        }
        catch (e) {
            reject(e);
        }
    }

    if (this.state === PENDING) {
        promise2 = new SimplePromise((resolve, reject) => {
            this.callbacks.push({
                onFulfilled: (value) => {
                    schedulePromiseResolution(resolve, reject, FULFILLED, value);
                },
                onRejected: (reason) => {
                    schedulePromiseResolution(resolve, reject, REJECTED, reason);
                },
            });
        });
    }
    else {
        promise2 = new SimplePromise((resolve, reject) => {
            setTimeout(() => {
                schedulePromiseResolution(resolve, reject, this.state, this.x);
            });
        });
    }

    return promise2;
};

SimplePromise.prototype.catch = function (onRejected) {
    return this.then(null, onRejected);
};

SimplePromise.prototype.finally = function (cb) {
    return this.then((v) => {
        setTimeout(cb);
        return v;
    }, (r) => {
        setTimeout(cb);
        throw r;
    });
};

SimplePromise.resolve = function (value) {
    return new SimplePromise((resolve) => {
        resolve(value);
    });
};

SimplePromise.reject = function (reason) {
    return new SimplePromise((resolve, reject) => {
        reject(reason);
    });
};

SimplePromise.all = function (promises) {
    // TODO - bug with rejecting with new TypeError
    if (!Array.isArray(promises)) {
        return SimplePromise.reject(new TypeError('You must pass an array to SimplePromise.all.'));
    }

    return new SimplePromise((resolve, reject) => {
        let remaining = promises.length;
        const values = [];

        if (remaining === 0) {
            resolve(values);
        }

        promises.forEach((promise, i) => {
            SimplePromise.resolve(promise).then((value) => {
                values[i] = value;

                if (--remaining === 0) {
                    resolve(values);
                }
            }, (reason) => reject(reason));
        });
    });
};

/**
 * TODO - bug, then is called for every resolved promise
 */
SimplePromise.race = function (promises) {
    // TODO - bug with rejecting with new TypeError
    if (!Array.isArray(promises)) {
        return SimplePromise.reject(new TypeError('You must pass an array to SimplePromise.race.'));
    }

    return new SimplePromise((resolve, reject) => {
        promises.forEach((promise) => {
            SimplePromise.resolve(promise).then(resolve, reject);
        });
    });
};
