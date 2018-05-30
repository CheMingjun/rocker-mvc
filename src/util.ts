export function isEmpty(v: any) {
    return typeof v === 'undefined' || v == null || typeof v === 'string' && v.trim() === '';
}

export function isFunction(fn) {
    return !isEmpty(fn) && Object.prototype.toString.call(fn) === '[object Function]';
}

export function getExtends(fn) {
    const pfn = Object.getPrototypeOf(fn);
    return pfn;
}

export function sleep(ms, r?: (Function)) {
    return new Promise(r => {
        setTimeout(r, ms);
    })
}

export function getLocalIp() {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var ip4;
    for (var dev in ifaces) {
        var alias = 0;
        ifaces[dev].forEach(function (details) {
            if (details.family == 'IPv4') {
                ip4 = details.address;
                ++alias;
            }
        });
    }
    return ip4
}

/**
 * Get bootstrap module
 *
 * Notice:maybe an error here
 *
 * @param {NodeJS.Module} md
 * @returns {NodeJS.Module}
 */
export function getBootstrapModule(md) {
    let cur = md;
    while (cur.parent && cur.parent !== cur) {
        cur = cur.parent;
    }
    return cur;
}