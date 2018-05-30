"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("./util");
const FS = require("fs");
const Path = require("path");
const Ejs = require("ejs");
var ReqMethodType;
(function (ReqMethodType) {
    ReqMethodType[ReqMethodType["Get"] = 0] = "Get";
    ReqMethodType[ReqMethodType["Post"] = 1] = "Post";
    ReqMethodType[ReqMethodType["Delete"] = 2] = "Delete";
    ReqMethodType[ReqMethodType["Update"] = 3] = "Update";
})(ReqMethodType = exports.ReqMethodType || (exports.ReqMethodType = {}));
var ReqMethodParamType;
(function (ReqMethodParamType) {
    ReqMethodParamType[ReqMethodParamType["Normal"] = 0] = "Normal";
    ReqMethodParamType[ReqMethodParamType["Request"] = 1] = "Request";
    ReqMethodParamType[ReqMethodParamType["Response"] = 2] = "Response";
    ReqMethodParamType[ReqMethodParamType["Context"] = 3] = "Context";
})(ReqMethodParamType = exports.ReqMethodParamType || (exports.ReqMethodParamType = {}));
class RouterPattern {
    constructor(fnPath, _clzMethod, _config) {
        this.fnPath = fnPath;
        this.clzMethod = _clzMethod;
        if (Util.isEmpty(_config)) {
            this.urlPattern = '/';
        }
        else if (typeof _config === 'string') {
            this.urlPattern = _config;
        }
        else if (typeof _config === 'object') {
            this.urlPattern = _config['url'];
            let rd = _config['render'];
            if (rd) {
                let ary = [];
                let th = this;
                [].concat(Array.isArray(rd) ? rd : [rd]).forEach(pt => {
                    ary.push({
                        get path() {
                            let rp = Path.resolve(Path.dirname(th.fnPath()), pt);
                            if (!FS.existsSync(rp)) {
                                throw new MVCError(`The template file[${rp}] not Found.`, 404);
                            }
                            return rp;
                        }, compile: function () {
                            let rp = this.path;
                            let content = FS.readFileSync(rp, 'utf-8'); //Return template's content
                            return Ejs.compile(content, { filename: rp }); // option {filename:...}
                        }
                    });
                });
                this.render = ary;
            }
        }
    }
}
exports.RouterPattern = RouterPattern;
/**
 * Router's register
 */
class RouterForClz {
    constructor(fnPath) {
        this.paramReg = new Map();
        this.methodReg = new Map();
        this.fnPath = fnPath;
    }
    regMethodParam(_name, _index, _type, _cfg, _transformer) {
        let mp = this.paramReg.get(_name);
        if (!mp) {
            mp = new Array();
            this.paramReg.set(_name, mp);
        }
        let name = typeof (_cfg) === 'object' ? _cfg['name'] : _cfg;
        let required = typeof (_cfg) === 'object' ? _cfg['required'] : false; //default value is false
        mp.push({ index: _index, type: _type, name: name, transformer: _transformer, required: required });
        mp.sort((p, n) => {
            return p.index - n.index;
        });
    }
    getMethodParam(_clzMethod) {
        let rtn = this.paramReg.get(_clzMethod);
        return rtn ? rtn : this.parent ? this.parent.getMethodParam(_clzMethod) : undefined;
    }
    setGet(_clzMethod, _config) {
        this.setter(ReqMethodType.Get, _clzMethod, _config);
    }
    getGet(_url) {
        return this.getter(ReqMethodType.Get, _url);
    }
    setPost(_clzMethod, _config) {
        this.setter(ReqMethodType.Post, _clzMethod, _config);
    }
    getPost(_url) {
        return this.getter(ReqMethodType.Post, _url);
    }
    setParent(parent) {
        this.parent = parent;
    }
    getter(_method, _url) {
        let tg = this.methodReg.get(_method);
        if (tg) {
            let rtn = tg.get(_url);
            if (rtn) {
                return rtn;
            }
        }
        return this.parent ? this.parent.getter(_method, _url) : undefined;
    }
    setter(_reqMethod, _clzMethod, _config) {
        let tg = this.methodReg.get(_reqMethod);
        if (!tg) {
            tg = new Map();
            this.methodReg.set(_reqMethod, tg);
        }
        let rp = new RouterPattern(this.fnPath, _clzMethod, _config);
        tg.set(rp.urlPattern, rp);
    }
}
exports.RouterForClz = RouterForClz;
class MVCError extends Error {
    constructor(_msg, _code = 500) {
        super(_msg);
        this.code = _code;
    }
    getCode() {
        return this.code;
    }
}
exports.MVCError = MVCError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLDJCQUEyQjtBQUUzQixJQUFZLGFBRVg7QUFGRCxXQUFZLGFBQWE7SUFDckIsK0NBQUcsQ0FBQTtJQUFFLGlEQUFJLENBQUE7SUFBRSxxREFBTSxDQUFBO0lBQUUscURBQU0sQ0FBQTtBQUM3QixDQUFDLEVBRlcsYUFBYSxHQUFiLHFCQUFhLEtBQWIscUJBQWEsUUFFeEI7QUFFRCxJQUFZLGtCQUVYO0FBRkQsV0FBWSxrQkFBa0I7SUFDMUIsK0RBQU0sQ0FBQTtJQUFFLGlFQUFPLENBQUE7SUFBRSxtRUFBUSxDQUFBO0lBQUUsaUVBQU8sQ0FBQTtBQUN0QyxDQUFDLEVBRlcsa0JBQWtCLEdBQWxCLDBCQUFrQixLQUFsQiwwQkFBa0IsUUFFN0I7QUFFRDtJQU1JLFlBQVksTUFBZ0IsRUFBRSxVQUFrQixFQUFFLE9BQWlCO1FBQy9ELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDO1FBQzVCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztTQUN6QjthQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxVQUFVLEdBQVcsT0FBTyxDQUFDO1NBQ3JDO2FBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFVBQVUsR0FBVyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNCLElBQUksRUFBRSxFQUFFO2dCQUNKLElBQUksR0FBRyxHQUFHLEVB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