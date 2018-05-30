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
const Types = require("./types");
let routerReg;
let routerPtnBindings;
const mime = require("mime");
const FS = require("fs");
const PATH = require("path");
const Util = require("./util");
const config_1 = require("./config");
const assetsPt = /\.(js|map|css|less|png|jpg|jpeg|gif|bmp|ico|webp|html|htm|eot|svg|ttf|woff)$/i;
function default_1(_routerMap, _routerPtnBindings) {
    routerPtnBindings = _routerPtnBindings;
    routerReg = _routerMap;
    let urlSearcher = searchPtn(routerReg);
    let assets = assetsPro();
    return function (context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var url = context.request.url;
            if (Util.isEmpty(url)) {
                throw new Types.MVCError('No url found', 404);
            }
            url = url.replace(/\?[\s\S]*/ig, '');
            let ptUrl = urlSearcher(url); // The url matched
            if (ptUrl) {
                let rw = routerReg.all[ptUrl];
                if (rw) {
                    let rfc = routerPtnBindings.get(rw);
                    if (rfc) { // have decorators for router
                        yield invoke(context, ptUrl, url, rfc, rw);
                    }
                }
            }
            else if (assetsPt.test(url)) { // For assets
                assets(url, context);
            }
            else {
                throw new Types.MVCError(`The request url(${url}) not found.`, 404);
            }
            //await next();
        });
    };
}
exports.default = default_1;
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------
//Assets closure
function assetsPro() {
    let EtagSet = new Set();
    return function (url, context) {
        let etag = context.headers['if-none-match'];
        if (etag && EtagSet.has(etag)) {
            context.response.status = 304;
            return;
        }
        if (!config_1.Router.assets)
            throw new Error('No assetsPath configuration.');
        let folderPath, cacheStrategy;
        if (typeof (config_1.Router.assets) == 'string') {
            folderPath = config_1.Router.assets;
        }
        else if (typeof (config_1.Router.assets) == 'object') {
            for (let urlPre in config_1.Router.assets) {
                let to = config_1.Router.assets[urlPre];
                if (url.startsWith(urlPre)) {
                    url = url.substring(urlPre.length);
                    if (url.trim() == '') {
                        throw new Types.MVCError('Not found.', 404);
                    }
                    if (typeof (to) == 'object') {
                        cacheStrategy = to;
                        folderPath = to.folder;
                    }
                    else {
                        folderPath = to;
                    }
                }
            }
        }
        cacheStrategy = Object.assign({ cache: 'Etag' }, cacheStrategy);
        if (folderPath) {
            let absPath = PATH.join(folderPath, url);
            if (!absPath.startsWith(folderPath))
                throw new Error('Access error.');
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
                    }
                    else if (cacheStrategy.cache === 'Cache-Control') {
                        context.response.set('Cache-Control', cacheStrategy.strategy || 'public, max-age=604800'); //Default value = a week
                    }
                    context.body = FS.createReadStream(absPath);
                }
                catch (ex) {
                    if (!/^\/favicon.ico$/i.test(url)) { //Ignore /favicon.ico
                        throw new Types.MVCError(`The request url(${url}) error.`, 500);
                    }
                    else {
                        throw ex;
                    }
                }
                return;
            }
        }
        throw new Types.MVCError('Not found.', 404);
    };
}
function searchPtn(_routerMap) {
    let urlPattern;
    let ts = '';
    for (let key in _routerMap.all) {
        ts += '|^' + key + '$';
    }
    urlPattern = new RegExp(ts.substring(1), 'ig');
    function recur(_url) {
        if (urlPattern) {
            let ptAry;
            try {
                ptAry = urlPattern.exec(_url);
            }
            finally {
                urlPattern.lastIndex = 0;
            }
            if (!ptAry) {
                let ary = _url.split('/');
                ary.pop();
                if (!ary.length) {
                    return;
                }
                return recur(ary.join('/'));
            }
            else {
                return ptAry[0];
            }
        }
    }
    return recur;
}
function invoke(_ctx, _urlRoot, _urlFull, routerForClz, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        let urlSub = _urlFull.substring(_urlRoot.length);
        urlSub = (urlSub.startsWith('/') ? '' : '/') + urlSub;
        let pattern;
        let args;
        if (_ctx.request.method === "POST") {
            pattern = routerForClz.getPost(urlSub);
            args = yield getPostArgs(_ctx);
        }
        else if (_ctx.request.method === "GET") {
            pattern = routerForClz.getGet(urlSub);
            args = _ctx.request.query;
        }
        if (pattern) {
            let instance;
            try {
                instance = new fn(); // new instance
            }
            catch (ex) {
                commons_1.Logger.error(`New class\n\n${fn}\nerror.`);
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
                        paramAry.push(_desc.transformer(args[_desc.name]));
                    }
                    else if (_desc.type === Types.ReqMethodParamType.Request) {
                        paramAry.push(_ctx.request);
                    }
                    else if (_desc.type === Types.ReqMethodParamType.Response) {
                        paramAry.push(_ctx.response);
                    }
                });
            }
            let model = yield instance[pattern.clzMethod].apply(instance, paramAry);
            if (typeof (model) === 'function') {
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
                        });
                    }
                    finally {
                        _ctx.res.end();
                    }
                }
            }
            else {
                _ctx.response.status = 200;
                _ctx.response.set('Content-Type', 'application/json;charset=utf-8');
                _ctx.res.write(JSON.stringify(model));
                _ctx.res.end();
            }
        }
        else {
            throw new Types.MVCError(`The request url(${_urlFull}) not found.`, 404);
        }
    });
}
function renderFn(routerForClz, _render, _model) {
    try {
        let compiler = _render.compile(); // Get template compiler
        return compiler(_model);
    }
    catch (ex) {
        throw new Types.MVCError(ex);
    }
}
function getPostArgs(context) {
    return new Promise((resolve, reject) => {
        let pdata = "";
        context.req.addListener("data", postchunk => {
            pdata += postchunk;
        });
        context.req.addListener("end", function () {
            let reqArgs;
            if (pdata != '') {
                try {
                    reqArgs = (new Function('', `return ${pdata}`))();
                }
                catch (e) {
                    try {
                        let pary = pdata.split('&');
                        if (pary && pary.length > 0) {
                            reqArgs = {};
                            pary.forEach(function (_p) {
                                let tary = _p.split('=');
                                if (tary && tary.length == 2) {
                                    reqArgs[tary[0].trim()] = tary[1];
                                }
                            });
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }
            }
            resolve(reqArgs);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSw0Q0FBcUM7QUFDckMsaUNBQWlDO0FBRWpDLElBQUksU0FBUyxDQUFDO0FBQ2QsSUFBSSxpQkFBb0QsQ0FBQztBQUV6RCw2QkFBNkI7QUFDN0IseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUU3QiwrQkFBK0I7QUFDL0IscUNBQWdDO0FBR2hDLE1BQU0sUUFBUSxHQUFHLCtFQUErRSxDQUFDO0FBRWpHLG1CQUF5QixVQUFVLEVBQUUsa0JBQXFEO0lBQ3RGLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDO0lBQ3ZDLFNBQVMsR0FBRyxVQUFVLENBQUM7SUFDdkIsSUFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZDLElBQUksTUFBTSxHQUFHLFNBQVMsRUFBRSxDQUFDO0lBQ3pCLE9BQU8sVUFBZ0IsT0FBNEIsRUFBRSxJQUFJOztZQUNyRCxJQUFJLEdBQUcsR0FBVyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN0QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQzthQUNqRDtZQUNELEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNyQyxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7WUFDaEQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLEdBQTZDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hFLElBQUksRUFBRSxFQUFFO29CQUNKLElBQUksR0FBRyxHQUF1QixpQkFBaUIsQ0FBQyxHQUFHLENBQUMs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