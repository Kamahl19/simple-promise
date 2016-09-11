import tests from 'promises-aplus-tests';
import SimplePromise from '../lib/SimplePromise.js';

const adapter = (() => {
    let res;
    let rej;

    return {
        deferred: () => ({
            promise: new SimplePromise((resolve, reject) => {
                res = resolve;
                rej = reject;
            }),
            resolve: res,
            reject: rej,
        }),
    };
})();

describe('Promises/A+ Tests', () => {
    tests.mocha(adapter);
});
