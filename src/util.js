"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isEmpty(v) {
    return typeof v === 'undefined' || v == null || typeof v === 'string' && v.trim() === '';
}
exports.isEmpty = isEmpty;
function isFunction(fn) {
    return !isEmpty(fn) && Object.prototype.toString.call(fn) === '[object Function]';
}
exports.isFunction = isFunction;
function getExtends(fn) {
    const pfn = Object.getPrototypeOf(fn);
    return pfn;
}
exports.getExtends = getExtends;
function sleep(ms, r) {
    return new Promise(r => {
        setTimeout(r, ms);
    });
}
exports.sleep = sleep;
function getLocalIp() {
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
    return ip4;
}
exports.getLocalIp = getLocalIp;
/**
 * Get bootstrap module
 *
 * Notice:maybe an error here
 *
 * @param {NodeJS.Module} md
 * @returns {NodeJS.Module}
 */
function getBootstrapModule(md) {
    let cur = md;
    while (cur.parent && cur.parent !== cur) {
        cur = cur.parent;
    }
    return cur;
}
exports.getBootstrapModule = getBootstrapModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQkFBd0IsQ0FBTTtJQUMxQixPQUFPLE9BQU8sQ0FBQyxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdGLENBQUM7QUFGRCwwQkFFQztBQUVELG9CQUEyQixFQUFFO0lBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLG1CQUFtQixDQUFDO0FBQ3RGLENBQUM7QUFGRCxnQ0FFQztBQUVELG9CQUEyQixFQUFFO0lBQ3pCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEMsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBSEQsZ0NBR0M7QUFFRCxlQUFzQixFQUFFLEVBQUUsQ0FBYztJQUNwQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ25CLFVBQVUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDO0FBSkQsc0JBSUM7QUFFRDtJQUNJLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNwQyxJQUFJLEdBQUcsQ0FBQztJQUNSLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO1FBQ3BCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPO1lBQ2pDLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxNQUFNLEVBQUU7Z0JBQzFCLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUN0QixFQUFFLEtBQUssQ0FBQzthQUNYO1FBQ0wsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sR0FBRyxDQUFBO0FBQ2QsQ0FBQztBQWRELGdDQWNDO0FBRUQ7Ozs7Ozs7R0FPRztBQUNILDRCQUFtQyxFQUFFO0lBQ2pDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtRQUNyQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztLQUNwQjtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQU5ELGdEQU1DIn0=