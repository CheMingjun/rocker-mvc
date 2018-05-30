// function proxy(_o){
//     return new Proxy(_o, {
//         get(target, name) {
//             let rtn = target;
//             name.split('.').forEach(k=>{
//                 rtn = rtn[k];
//             })
//             return rtn;
//         }
//     })
// }
//
// let config = {
//     env: {
//         dev: {flag: 1},
//         pre: {flag: 2},
//         prod: {flag: 3}
//     }
// }
//
// let t = proxy(config)['env.dev.flag']
// console.log(t);
// //config['env']['dev']['flag']

Object.__proto__ = new Proxy(this, {
    get(target, name) {
        let rtn = target;
        name.split('.').forEach(k => {
            rtn = rtn[k];
        })
        return rtn;
    }
})

Object.prototype.get = function (_keys) {
    let rtn = this;
    _keys.split('.').forEach(k => {
        rtn = rtn[k];
    })
    return rtn;
};

let config = {
    env: {
        dev: {flag: 1},
        pre: {flag: 2},
        prod: {flag: 3}
    }
};

let t = config['env.dev.flag'];
console.log(t);
//config['env']['dev']['flag']