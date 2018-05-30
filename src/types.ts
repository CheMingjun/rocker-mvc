import * as Util from './util';
import * as FS from "fs";
import * as Path from "path";
import * as Ejs from "ejs";

export enum ReqMethodType {
    Get, Post, Delete, Update,
}

export enum ReqMethodParamType {
    Normal, Request, Response, Context,
}

export class RouterPattern {
    fnPath: Function;
    urlPattern: string;
    render: { path: string, compile: Function }[];
    clzMethod: string;

    constructor(fnPath: Function, _clzMethod: string, _config?: RPParam) {
        this.fnPath = fnPath;
        this.clzMethod = _clzMethod;
        if (Util.isEmpty(_config)) {
            this.urlPattern = '/';
        } else if (typeof _config === 'string') {
            this.urlPattern = <string>_config;
        } else if (typeof _config === 'object') {
            this.urlPattern = <string>_config['url'];
            let rd = _config['render'];
            if (rd) {
                let ary = [];
                let th = this;
                [].concat(Array.isArray(rd) ? rd : [rd]).forEach(pt => {
                    ary.push({
                        get path() {
                            let rp: string = Path.resolve(Path.dirname(th.fnPath()), pt);
                            if (!FS.existsSync(rp)) {
                                throw new MVCError(`The template file[${rp}] not Found.`, 404);
                            }
                            return rp;
                        }, compile: function () {
                            let rp = this.path;
                            let content = FS.readFileSync(rp, 'utf-8');//Return template's content
                            return Ejs.compile(content, {filename: rp}); // option {filename:...}
                        }
                    })
                })
                this.render = ary;
            }
        }
    }
}

export declare type RPParam = { url: string, render: string | string[] } | { url: string } | string;

export declare type RouterParamType = { name: string } | { required: boolean } | { name: string, required: boolean } | string;

export  type MethodParams = { index: number, name: string, type: ReqMethodParamType, transformer: Function, required: boolean };

/**
 * Router's register
 */
export class RouterForClz {
    fnPath: Function; //clz's module

    constructor(fnPath: Function) {
        this.fnPath = fnPath;
    }

    regMethodParam(_name: string, _index: number, _type: ReqMethodParamType, _cfg: RouterParamType, _transformer: Function) {
        let mp: MethodParams[] = this.paramReg.get(_name);
        if (!mp) {
            mp = new Array<MethodParams>();
            this.paramReg.set(_name, mp);
        }
        let name: string = typeof(_cfg) === 'object' ? _cfg['name'] : _cfg;
        let required: boolean = typeof(_cfg) === 'object' ? _cfg['required'] : false;//default value is false
        mp.push({index: _index, type: _type, name: name, transformer: _transformer, required: required});
        mp.sort((p, n) => {
            return p.index - n.index;
        })
    }

    getMethodParam(_clzMethod: string) {
        let rtn = this.paramReg.get(_clzMethod);
        return rtn ? rtn : this.parent ? this.parent.getMethodParam(_clzMethod) : undefined;
    }

    setGet(_clzMethod: string, _config?: RPParam): void {
        this.setter(ReqMethodType.Get, _clzMethod, _config);
    }

    getGet(_url: string): RouterPattern {
        return this.getter(ReqMethodType.Get, _url);
    }

    setPost(_clzMethod: string, _config?: RPParam): void {
        this.setter(ReqMethodType.Post, _clzMethod, _config);
    }

    getPost(_url: string): RouterPattern {
        return this.getter(ReqMethodType.Post, _url);
    }

    setParent(parent: RouterForClz) {
        this.parent = parent;
    }

    private parent: RouterForClz;

    private paramReg: Map<string, MethodParams[]> = new Map<string, MethodParams[]>();

    private methodReg: Map<ReqMethodType, Map<String, RouterPattern>> = new Map<ReqMethodType, Map<String, RouterPattern>>();

    private getter(_method: ReqMethodType, _url: string) {
        let tg = this.methodReg.get(_method);
        if (tg) {
            let rtn = tg.get(_url);
            if (rtn) {
                return rtn;
            }
        }
        return this.parent ? this.parent.getter(_method, _url) : undefined;
    }

    private setter(_reqMethod: ReqMethodType, _clzMethod: string, _config: RPParam) {
        let tg = this.methodReg.get(_reqMethod);
        if (!tg) {
            tg = new Map<String, RouterPattern>();
            this.methodReg.set(_reqMethod, tg);
        }
        let rp: RouterPattern = new RouterPattern(this.fnPath, _clzMethod, _config);
        tg.set(rp.urlPattern, rp);
    }
}

export declare type RouterMap = { [index: string]: Function };
export declare type RouteCfgAssets = string | { [index: string]: string | { folder: string, cache: 'Etag' | 'Cache-Control' | 'None', strategy?: string } };
export declare type RouterConfig = {
    renderStart?: string,
    renderEnd?: string,
    gZipThreshold?: number,//GZip threadhold number
    assets?: RouteCfgAssets,//Assets folder path
    errorProcessor?: Function
}

export class MVCError extends Error {
    private code: number;

    constructor(_msg: string, _code: number = 500) {
        super(_msg);
        this.code = _code;
    }

    getCode(): number {
        return this.code;
    }
}