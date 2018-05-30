import Application = require("koa");
import {Logger} from '@vdian/commons'
import * as Types from "./types";

let routerReg;
let routerPtnBindings: Map<Function, Types.RouterForClz>;

import * as mime from 'mime';
import * as FS from 'fs';
import * as PATH from "path";

import * as Util from './util';
import {Router} from './config';
import {RouterMap, RouterConfig} from "./types";

const assetsPt = /\.(js|map|css|less|png|jpg|jpeg|gif|bmp|ico|webp|html|htm|eot|svg|ttf|woff)$/i;

export default function (_routerMap, _routerPtnBindings: Map<Function, Types.RouterForClz>) {
    routerPtnBindings = _routerPtnBindings;
    routerReg = _routerMap;
    let urlSearcher = searchPtn(routerReg);
    let assets = assetsPro();
    return async function (context: Application.Context, next) {
        var url: string = context.request.url;
        if (Util.isEmpty(url)) {
            throw new Types.MVCError('No url found', 404);
        }
        url = url.replace(/\?[\s\S]*/ig, '');
        let ptUrl = urlSearcher(url); // The url matched
        if (ptUrl) {
            let rw: FunctionConstructor = <FunctionConstructor>routerReg.all[ptUrl];
            if (rw) {
                let rfc: Types.RouterForClz = routerPtnBindings.get(rw);
                if (rfc) { // have decorators for router
                    await invoke(context, ptUrl, url, rfc, rw);
                }
            }
        } else if (assetsPt.test(url)) { // For assets
            assets(url, context);
        } else {
            throw new Types.MVCError(`The request url(${url}) not found.`, 404);
        }
        //await next();
    }
}

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
//Assets closure
function assetsPro() {
    let EtagSet = new Set();
    return function (url: string, context) {
        let etag = context.headers['if-none-match'];
        if (etag && EtagSet.has(etag)) {
            context.response.status = 304;
            return;
        }

        if (!Router.assets) throw new Error('No assetsPath configuration.');

        let folderPath, cacheStrategy: { cache: 'Etag' | 'Cache-Control', strategy?: string };
        if (typeof(Router.assets) == 'string') {
            folderPath = Router.assets;
        } else if (typeof(Router.assets) == 'object') {
            for (let urlPre in Router.assets) {
                let to: any = Router.assets[urlPre];
                if (url.startsWith(urlPre)) {
                    url = url.substring(urlPre.length);
                    if (url.trim() == '') {
                        throw new Types.MVCError('Not found.', 404);
                    }
                    if (typeof(to) == 'object') {
                        cacheStrategy = to;
                        folderPath = to.folder;
                    } else {
                        folderPath = to;
                    }
                }
            }
        }

        cacheStrategy = Object.assign({cache: 'Etag'}, cacheStrategy);

        if (folderPath) {
            let absPath = PATH.join(folderPath, url);
            if (!absPath.startsWith(folderPath)) throw new Error('Access error.');

            let stat = FS.statSync(absPath);
            if (stat.isFile()) {
                try {
                    let mt = mime.getType(PATH.basename(absPath));

                    context.response.status = 200;
                    context.response.set('Content-Type', mt);
                    if (cacheStrategy.cache === 'Etag') {
                        etag = url + '-' + stat.mtime.getTime().toString(16);
                        EtagSet.add(etag);
                        context.response.set('ETag', etag);
                    } else if (cacheStrategy.cache === 'Cache-Control') {
                        context.response.set('Cache-Control', cacheStrategy.strategy || 'public, max-age=604800');//Default value = a week
                    }

                    context.body = FS.createReadStream(absPath);
                } catch (ex) {
                    if (!/^\/favicon.ico$/i.test(url)) {//Ignore /favicon.ico
                        throw new Types.MVCError(`The request url(${url}) error.`, 500);
                    } else {
                        throw ex;
                    }
                }
                return;
            }
        }
        throw new Types.MVCError('Not found.', 404);
    }
}

function searchPtn(_routerMap: RouterConfig & { all: RouterMap }) {
    let urlPattern: RegExp;

    let ts: string = '';
    for (let key in _routerMap.all) {
        ts += '|^' + key + '$'
    }

    urlPattern = new RegExp(ts.substring(1), 'ig');

    function recur(_url: string): string {
        if (urlPattern) {
            let ptAry: RegExpExecArray;
            try {
                ptAry = urlPattern.exec(_url);
            } finally {
                urlPattern.lastIndex = 0;
            }
            if (!ptAry) {
                let ary: string[] = _url.split('/');
                ary.pop();
                if (!ary.length) {
                    return;
                }
                return recur(ary.join('/'));
            } else {
                return ptAry[0];
            }
        }
    }

    return recur;
}

async function invoke(_ctx: Application.Context, _urlRoot: string, _urlFull: string, routerForClz: Types.RouterForClz, fn: FunctionConstructor) {
    let urlSub = _urlFull.substring(_urlRoot.length);
    urlSub = (urlSub.startsWith('/') ? '' : '/') + urlSub;
    let pattern: Types.RouterPattern;
    let args: any;
    if (_ctx.request.method === "POST") {
        pattern = routerForClz.getPost(urlSub);
        args = await getPostArgs(_ctx);
    } else if (_ctx.request.method === "GET") {
        pattern = routerForClz.getGet(urlSub);
        args = _ctx.request.query;
    }

    if (pattern) {
        let instance;
        try {
            instance = new (<FunctionConstructor>fn)(); // new instance
        } catch (ex) {
            Logger.error(`New class\n\n${fn}\nerror.`);
            throw ex;
        }
        let paramAry = [];
        let paramDescAry = routerForClz.getMethodParam(pattern.clzMethod);
        if (paramDescAry) {
            paramDescAry.forEach((_desc) => {
                if (_desc.type === Types.ReqMethodParamType.Normal) {
                    if (_desc.required && !args[_desc.name]) {
                        throw new Types.MVCError(`The request param[${_desc.name}] not found.`, 404);
                    }
                    paramAry.push(_desc.transformer(args[_desc.name]))
                } else if (_desc.type === Types.ReqMethodParamType.Request) {
                    paramAry.push(_ctx.request)
                } else if (_desc.type === Types.ReqMethodParamType.Response) {
                    paramAry.push(_ctx.response)
                }
            })
        }
        let model = await instance[pattern.clzMethod].apply(instance, paramAry);
        if (typeof(model) === 'function') {
            throw new Types.MVCError(`Expect json or raw value but get a function type.`);
        }
        if (pattern.render) { // render by template
            _ctx.response.status = 200;
            _ctx.response.set('Content-Type', 'text/html;charset=utf-8');

            if (routerReg.render && routerReg.render.start) { // TODO

            }

            if (Array.isArray(pattern.render)) { // string[] for Bigpipe
                _ctx.response.set('Transfer-Encoding', 'chunked');
                try {
                    pattern.render.forEach(function (_rd) {
                        let tt = renderFn(routerForClz, _rd, model);
                        _ctx.res.write(tt);
                    })
                } finally {
                    _ctx.res.end();
                }
            }
        } else {
            _ctx.response.status = 200;
            _ctx.response.set('Content-Type', 'application/json;charset=utf-8');
            _ctx.res.write(JSON.stringify(model));
            _ctx.res.end();
        }
    } else {
        throw new Types.MVCError(`The request url(${_urlFull}) not found.`, 404);
    }
}

function renderFn(routerForClz: Types.RouterForClz, _render: { path: string, compile: Function }, _model: any) {
    try {
        let compiler: Function = _render.compile(); // Get template compiler
        return compiler(_model);
    } catch (ex) {
        throw new Types.MVCError(ex);
    }
}

function getPostArgs(context: Application.Context) {
    return new Promise((resolve, reject) => {
        let pdata = "";
        context.req.addListener("data", postchunk => {
            pdata += postchunk;
        })
        context.req.addListener("end", function () {
            let reqArgs;
            if (pdata != '') {
                try {
                    reqArgs = (new Function('', `return ${pdata}`))();
                } catch (e) {
                    try {
                        let pary = pdata.split('&');
                        if (pary && pary.length > 0) {
                            reqArgs = {};
                            pary.forEach(function (_p) {
                                let tary = _p.split('=');
                                if (tary && tary.length == 2) {
                                    reqArgs[tary[0].trim()] = tary[1];
                                }
                            })
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
            }
            resolve(reqArgs);
        })
    })
}