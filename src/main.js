"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commons_1 = require("@vdian/commons");
const Application = require("koa");
const compress = require("koa-compress");
require("reflect-metadata");
const router_1 = require("./router");
const util = require("util");
const Util = require("./util");
const _Types = require("./types");
const types_1 = require("./types");
const Path = require("path");
const FS = require("fs");
const config_1 = require("./config");
require('zone.js');
require("zone.js");
let routerReg = { all: {} };
/**
 * Router pattern bindings
 * @type Map<Function, _Types.RouterForClz>
 * Function:RouterClass
 */
const routerPtnBindings = new Map();
const routerPathBindings = new Map();
/**
 * The param's decorator for Request object of koa
 * @param {object} target
 * @param {string} methodName
 * @param {number} index
 * @constructor
 */
function Request(target, methodName, index) {
    let rfc = getRouterForClz(target);
    rfc.regMethodParam(methodName, index, types_1.ReqMethodParamType.Request, { required: true }, v => {
        return v;
    });
}
exports.Request = Request;
function Param(_cfg) {
    return function (target, paramName, index) {
        let rfc = getRouterForClz(target);
        let dt = Reflect.getMetadata('design:paramtypes', target, paramName);
        if (!dt) {
            dt = Reflect.getMetadata('design:paramtypes', target.constructor, paramName);
        }
        if (!dt) {
            throw new Error('Reflect error occured.');
        }
        rfc.regMethodParam(paramName, index, types_1.ReqMethodParamType.Normal, _cfg, v => {
            if (v === undefined || v === null) {
                return v;
            }
            let tfn = dt[index];
            if (tfn.name.toUpperCase() === 'OBJECT') {
                return typeof (v) === 'string' ? (new Function('', `return ${v}`))() : v; //Support ill-formed json object
            }
            else {
                return tfn(v);
            }
        });
    };
}
exports.Param = Param;
function Get(config) {
    return function (target, methodName, desc) {
        let rfc = getRouterForClz(target);
        rfc.setGet(methodName, config);
    };
}
exports.Get = Get;
function Post(config) {
    return function (target, methodName, desc) {
        let rfc = getRouterForClz(target);
        rfc.setPost(methodName, config);
    };
}
exports.Post = Post;
// --------------------------------------------------------------------------------------------
class Threadlocal {
    static get context() {
        return Zone.current.get('context');
    }
}
exports.Threadlocal = Threadlocal;
function pipe(midware) {
    koaMidAry.push(midware);
    return {
        route,
        pipe,
        start
    };
}
exports.pipe = pipe;
let koaMidAry = [];
function route(routerMap) {
    if (Util.isEmpty(routerMap)) {
        throw new _Types.MVCError('The routerMap is empty');
    }
    if (Object.keys(routerMap).filter(k => {
        return !/^\//.test(k);
    }).length > 0) { //Configuration
        let rc = routerMap;
        let bootstrapModule = Util.getBootstrapModule(module);
        ['renderStart', 'renderEnd'].forEach(name => {
            if (rc[name]) {
                let tpath = Path.resolve(Path.dirname(bootstrapModule.filename), rc[name]);
                if (!FS.existsSync(tpath)) {
                    throw new _Types.MVCError(`The render.start file[${tpath}] is empty`);
                }
                routerReg[name] = tpath;
            }
        });
        //Set configurations
        config_1.Router.assets = rc.assets;
        config_1.Router.gZipThreshold = rc.gZipThreshold || config_1.Router.gZipThreshold; //Default value is Router.gZipThreshold
        config_1.Router.errorProcessor = rc.errorProcessor;
        return Object.assign(route, { pipe, start });
    }
    for (let nm in routerMap) {
        let obj = routerMap[nm], fn = obj['default'] || obj;
        let md = getModule(module['parent'], fn);
        if (!md) {
            throw new Error(`No file for router ${nm} defined.`);
        }
        routerPathBindings.set(fn, md['filename']);
        routerMap[nm] = fn;
    }
    let t = routerMap;
    routerReg['all'] = t;
    //Merge all
    routerPtnBindings.forEach(function (clzReg, fna) {
        routerPathBindings.forEach(function (fnPath, fnb) {
            //Notice,here may be an error,if more than one parent inherit here
            if (fna.isPrototypeOf(fnb)) {
                let rtc = routerPtnBindings.get(fnb);
                if (rtc) {
                    rtc.setParent(clzReg); //Process inherit
                }
                else {
                    routerPtnBindings.set(fnb, clzReg);
                }
                routerPtnBindings.delete(fna);
                routerPathBindings.set(fna, routerPathBindings.get(fnb));
            }
        });
    });
    let rn = {
        pipe,
        start
    };
    return rn;
}
exports.route = route;
let pluginAry = [];
/**
 * Startup MVC container
 * @param {object}  Configuration object
 */
function start(config = {
    port: config_1.Start.port
}) {
    if (typeof config['port'] !== 'number') {
        throw new _Types.MVCError('\n[Rocker-mvc]Start server error, server port expect for start config.\n');
    }
    config_1.Start.port = config.port;
    //Router middleware
    let rfn = router_1.default(routerReg, routerPtnBindings);
    //Compress middleware
    let cfn = compress({ threshold: config_1.Router.gZipThreshold });
    koaMidAry.push(function (context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((res, rej) => {
                Zone.current.fork({
                    name: 'koa-context',
                    properties: {
                        context
                    }
                }).run(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield rfn(context, next);
                            yield cfn(context, next); //GZip
                            res();
                        }
                        catch (ex) {
                            rej(ex);
                        }
                    });
                });
            });
        });
    });
    setImmediate(() => {
        //Startup plugins
        if (pluginAry.length > 0) {
            let ref = new Map();
            routerPtnBindings.forEach((v, k) => {
                let tv = new Map();
                ref.set(k, tv);
                v['methodReg'].forEach((mr) => {
                    mr.forEach((rp) => {
                        tv.set(rp.urlPattern, rp);
                    });
                });
            });
            pluginAry.forEach((pl) => {
                pl(ref);
            });
        }
        //-------------------------------------------------------------------------
        try {
            //Startup koa
            let address = `${Util.getLocalIp()}:${config.port} `;
            let koa = new Application();
            if (koaMidAry.length > 0) {
                koaMidAry.forEach((mid) => {
                    koa.use(mid);
                });
            }
            koa.context.onerror = onKoaErr;
            koa.listen(config.port);
            commons_1.Logger.info(`\n[Rocker-mvc]Start server ${address} success.\n`);
            process.on('uncaughtException', function (err) {
                commons_1.Logger.error(err);
            });
        }
        catch (ex) {
            commons_1.Logger.error('\n[Rocker-mvc]Start server ${address} error.\n');
            throw ex;
        }
    });
    return {
        plugin
    };
}
function plugin(pluginFn) {
    if (util.isFunction(pluginFn)) {
        pluginAry.push(pluginFn);
    }
    else {
        throw new _Types.MVCError(`The Plugin must be a function.`);
    }
    return {
        plugin
    };
}
var Const;
(function (Const) {
    Const.Assets = 'Assets';
})(Const = exports.Const || (exports.Const = {}));
// --------------------------------------------------------------------------------------------
function onKoaErr(err) {
    if (!err)
        return;
    // wrap non-error object
    if (!(err instanceof Error)) {
        const newError = new Error('non-error thrown: ' + err);
        // err maybe an object, try to copy the name, message and stack to the new error instance
        if (err) {
            if (err.name)
                newError.name = err.name;
            if (err.message)
                newError.message = err.message;
            if (err.stack)
                newError.stack = err.stack;
            if (err.status)
                newError.status = err.status;
            if (err.headers)
                newError.headers = err.headers;
        }
        err = newError;
    }
    const headerSent = this.headerSent || !this.writable;
    if (headerSent)
        err.headerSent = true;
    // delegate
    //this.app.emit('error', err, onKoaErr);
    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent)
        return;
    let errCode = typeof err['getCode'] === 'function' ? err['getCode']() : 500;
    let content;
    if (config_1.Router.errorProcessor) {
        content = config_1.Router.errorProcessor(err);
        if (typeof (content) == 'boolean' && !content) {
            return;
        }
    }
    this.status = errCode;
    if (content !== undefined && content !== null) {
        let data;
        if (typeof (content) == 'object') {
            this.set('Content-Type', 'application/json;charset=utf-8');
            data = JSON.stringify(content);
        }
        else {
            this.set('Content-Type', 'text/html');
            data = content;
        }
        this.res.end(data);
    }
    else {
        this.set('Content-Type', 'text/html');
        this.res.end("<h1>" + errCode + "</h1>" + "<div>" + err + "</div>");
    }
    // setTimeout(function () {
    //     if (err.message) {
    //         Logger.error(err.message);
    //     }
    //     if (err.stack) {
    //         Logger.error(err.stack);
    //     }
    // })
}
function getRouterForClz(target) {
    let fn = target.constructor;
    return routerPtnBindings.get(fn) || (routerPtnBindings.set(fn, new _Types.RouterForClz(() => {
        return routerPathBindings.get(fn);
    })).get(fn));
}
/**
 * Get it's defined module,Notice! here may be an error
 * @param md
 * @param {Function} clz
 * @returns [module,subClass]
 */
function getModule(md, clz) {
    if (md) {
        let ary = md.children;
        if (ary) {
            for (let i = 0; i < ary.length; i++) {
                let _md = ary[i];
                if (_md['filename']) {
                    // if (_md['filename'].endsWith('router/router.js')) {
                    //     console.log(_md['filename'])
                    // }
                    let tclz = require(_md['filename']);
                    let fn = tclz['default'] || tclz;
                    if (clz === fn) {
                        return _md;
                    }
                }
            }
        }
        return getModule(md['parent'], clz);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLDRDQUFzQztBQUV0QyxtQ0FBb0M7QUFDcEMseUNBQXlDO0FBQ3pDLDRCQUEwQjtBQUUxQixxQ0FBaUM7QUFDakMsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixrQ0FBa0M7QUFFbEMsbUNBQThFO0FBQzlFLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFFekIscUNBQXVDO0FBRXZDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVuQixtQkFBZ0I7QUFPaEIsSUFBSSxTQUFTLEdBQXNDLEVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBQyxDQUFDO0FBRTdEOzs7O0dBSUc7QUFDSCxNQUFNLGlCQUFpQixHQUF1QyxJQUFJLEdBQUcsRUFBaUMsQ0FBQztBQUV2RyxNQUFNLGtCQUFrQixHQUEwQixJQUFJLEdBQUcsRUFBb0IsQ0FBQztBQUU5RTs7Ozs7O0dBTUc7QUFDSCxpQkFBd0IsTUFBYyxFQUFFLFVBQWtCLEVBQUUsS0FBYTtJQUNyRSxJQUFJLEdBQUcsR0FBd0IsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZELEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSwwQkFBa0IsQ0FBQyxPQUFPLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7UUFDcEYsT0FBTyxDQUFDLENBQUE7SUFDWixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFMRCwwQkFLQztBQUVELGVBQXNCLElBQTRCO0lBQzlDLE9BQU8sVUFBVSxNQUFnQixFQUFFLFNBQWlCLEVBQUUsS0FBYTtRQUMvRCxJQUFJLEdBQUcsR0FBd0IsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFF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