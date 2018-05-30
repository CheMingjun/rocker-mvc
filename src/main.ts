import {Logger} from '@vdian/commons';

import Application = require('koa');
import * as compress from 'koa-compress';
import 'reflect-metadata';

import midRouter from './router';
import * as util from 'util';
import * as Util from './util';
import * as _Types from './types';

import {ReqMethodParamType, RouterConfig, RouterMap, MVCError} from './types';
import * as Path from 'path';
import * as FS from 'fs';

import {Start, Router} from './config';

require('zone.js');

import 'zone.js'

interface IConfigParam {
    port?: number;
    gZipThreshold?: number;
}

let routerReg: RouterConfig & { all: RouterMap } = {all: {}};

/**
 * Router pattern bindings
 * @type Map<Function, _Types.RouterForClz>
 * Function:RouterClass
 */
const routerPtnBindings: Map<Function, _Types.RouterForClz> = new Map<Function, _Types.RouterForClz>();

const routerPathBindings: Map<Function, string> = new Map<Function, string>();

/**
 * The param's decorator for Request object of koa
 * @param {object} target
 * @param {string} methodName
 * @param {number} index
 * @constructor
 */
export function Request(target: object, methodName: string, index: number): void {
    let rfc: _Types.RouterForClz = getRouterForClz(target);
    rfc.regMethodParam(methodName, index, ReqMethodParamType.Request, {required: true}, v => {
        return v
    });
}

export function Param(_cfg: _Types.RouterParamType): Function {
    return function (target: Function, paramName: string, index: number) { // Use @Get(string|{url:string,render:string})
        let rfc: _Types.RouterForClz = getRouterForClz(target);
        let dt = Reflect.getMetadata('design:paramtypes', target, paramName);
        if (!dt) {
            dt = Reflect.getMetadata('design:paramtypes', target.constructor, paramName);
        }
        if (!dt) {
            throw new Error('Reflect error occured.');
        }
        rfc.regMethodParam(paramName, index, ReqMethodParamType.Normal, _cfg, v => {
            if (v === undefined || v === null) {
                return v;
            }
            let tfn = dt[index];
            if (tfn.name.toUpperCase() === 'OBJECT') {
                return typeof(v) === 'string' ? (new Function('', `return ${v}`))() : v;//Support ill-formed json object
            } else {
                return tfn(v);
            }
        });
    }
}

export function Get(config?: _Types.RPParam): Function {
    return function (target: Function, methodName: string, desc: object) { // Use @Get(string|{url:string,render:string})
        let rfc: _Types.RouterForClz = getRouterForClz(target);
        rfc.setGet(methodName, config);
    }
}

export function Post(config?: _Types.RPParam): Function {
    return function (target: Function, methodName: string, desc: object) { // Use @Get(string|{url:string,render:string})
        let rfc: _Types.RouterForClz = getRouterForClz(target);
        rfc.setPost(methodName, config);
    }
}

// --------------------------------------------------------------------------------------------

export class Threadlocal {
    static get context(): Application.Context {
        return Zone.current.get('context');
    }
}

export function pipe(midware: Application.Middleware) {
    koaMidAry.push(midware);
    return {
        route,
        pipe,
        start
    }
}

let koaMidAry: Application.Middleware[] = [];

export function route(routerMap: _Types.RouterMap | RouterConfig)
    : {
    pipe: Function,
    start: Function,
    (routerMap: _Types.RouterMap | RouterConfig): {
        pipe: Function,
        start: Function
    }
} {
    if (Util.isEmpty(routerMap)) {
        throw new _Types.MVCError('The routerMap is empty');
    }

    if (Object.keys(routerMap).filter(k => {
        return !/^\//.test(k);
    }).length > 0) {//Configuration
        let rc: RouterConfig = routerMap;
        let bootstrapModule = Util.getBootstrapModule(module);
        ['renderStart', 'renderEnd'].forEach(name => {
            if (rc[name]) {
                let tpath: string = Path.resolve(Path.dirname(bootstrapModule.filename), rc[name]);
                if (!FS.existsSync(tpath)) {
                    throw new _Types.MVCError(`The render.start file[${tpath}] is empty`);
                }
                routerReg[name] = tpath;
            }
        })

        //Set configurations
        Router.assets = rc.assets;
        Router.gZipThreshold = rc.gZipThreshold || Router.gZipThreshold;//Default value is Router.gZipThreshold
        Router.errorProcessor = rc.errorProcessor;

        return Object.assign(route, {pipe, start});
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

    let t: any = routerMap;
    routerReg['all'] = t;

    //Merge all
    routerPtnBindings.forEach(function (clzReg, fna) {
        routerPathBindings.forEach(function (fnPath, fnb) {
            //Notice,here may be an error,if more than one parent inherit here
            if (fna.isPrototypeOf(fnb)) {
                let rtc: _Types.RouterForClz = routerPtnBindings.get(fnb);
                if (rtc) {
                    rtc.setParent(clzReg);//Process inherit
                } else {
                    routerPtnBindings.set(fnb, clzReg);
                }
                routerPtnBindings.delete(fna);
                routerPathBindings.set(fna, routerPathBindings.get(fnb));
            }
        })
    });

    let rn: any = {
        pipe,
        start
    };
    return rn;
}

let pluginAry: { (input: Types.Pluginput): void }[] = [];

/**
 * Startup MVC container
 * @param {object}  Configuration object
 */
function start(config: IConfigParam = {
    port: Start.port
}): { plugin: Function } {
    if (typeof config['port'] !== 'number') {
        throw new _Types.MVCError('\n[Rocker-mvc]Start server error, server port expect for start config.\n');
    }
    Start.port = config.port;

    //Router middleware
    let rfn: Function = midRouter(routerReg, routerPtnBindings);

    //Compress middleware
    let cfn: Function = compress({threshold: Router.gZipThreshold});

    koaMidAry.push(async function (context: Application.Context, next) {
        await new Promise((res, rej) => {
            Zone.current.fork({
                name: 'koa-context',
                properties: {
                    context
                }
            }).run(async function () {
                try {
                    await rfn(context, next);
                    await cfn(context, next);//GZip
                    res();
                } catch (ex) {
                    rej(ex);
                }
            });
        });
    });

    setImmediate(() => {
        //Startup plugins
        if (pluginAry.length > 0) {
            let ref: Types.Pluginput = new Map();
            routerPtnBindings.forEach((v, k) => {
                let tv = new Map();
                ref.set(k, tv);
                v['methodReg'].forEach((mr) => {
                    mr.forEach((rp) => {
                        tv.set(rp.urlPattern, rp);
                    })
                })
            })

            pluginAry.forEach((pl) => {
                pl(ref);
            })
        }

        //-------------------------------------------------------------------------
        try {
            //Startup koa
            let address: string = `${Util.getLocalIp()}:${config.port} `;

            let koa: Application = new Application();
            if (koaMidAry.length > 0) {
                koaMidAry.forEach((mid) => {
                    koa.use(mid);
                })
            }

            koa.context.onerror = onKoaErr;
            koa.listen(config.port);
            Logger.info(`\n[Rocker-mvc]Start server ${address} success.\n`);

            process.on('uncaughtException', function (err) {
                Logger.error(err);
            });
        } catch (ex) {
            Logger.error('\n[Rocker-mvc]Start server ${address} error.\n');
            throw ex;
        }
    })

    return {
        plugin
    }
}

function plugin(pluginFn: { (input: Types.Pluginput): void }): { plugin: Function } {
    if (util.isFunction(pluginFn)) {
        pluginAry.push(pluginFn);
    } else {
        throw new _Types.MVCError(`The Plugin must be a function.`);
    }
    return {
        plugin
    }
}

export namespace Const {
    export const Assets: string = 'Assets';
}

export namespace Types {
    export type Pluginput = Map<Function,
        Map<String,
            {
                render:
                    {
                        path: string,//Template absolute path
                        factory: Function//Factory function
                    }[]
            }>>
}

// --------------------------------------------------------------------------------------------
function onKoaErr(err: any) {
    if (!err) return;

    // wrap non-error object
    if (!(err instanceof Error)) {
        const newError: any = new Error('non-error thrown: ' + err);
        // err maybe an object, try to copy the name, message and stack to the new error instance
        if (err) {
            if (err.name) newError.name = err.name;
            if (err.message) newError.message = err.message;
            if (err.stack) newError.stack = err.stack;
            if (err.status) newError.status = err.status;
            if (err.headers) newError.headers = err.headers;
        }
        err = newError;
    }

    const headerSent = this.headerSent || !this.writable;
    if (headerSent) err.headerSent = true;

    // delegate
    //this.app.emit('error', err, onKoaErr);

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (headerSent) return;

    let errCode = typeof err['getCode'] === 'function' ? err['getCode']() : 500;
    let content: string;
    if (Router.errorProcessor) {
        content = Router.errorProcessor(err);
        if (typeof(content) == 'boolean' && !content) {
            return;
        }
    }
    this.status = errCode;
    if (content !== undefined && content !== null) {
        let data: string;
        if (typeof(content) == 'object') {
            this.set('Content-Type', 'application/json;charset=utf-8');
            data = JSON.stringify(content);
        } else {
            this.set('Content-Type', 'text/html');
            data = content;
        }
        this.res.end(data);
    } else {
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
        return routerPathBindings.get(fn)
    })).get(fn));
}

/**
 * Get it's defined module,Notice! here may be an error
 * @param md
 * @param {Function} clz
 * @returns [module,subClass]
 */
function getModule(md, clz: Function): Promise<any> {
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