import {route} from "../..";

/**
 * 配置路由并启动
 */

// //route函数API
// //1.普通路由配置
// route({/**路由配置**/})
// //2.添加配置项
// route({
//     renderStart?: string,
//     renderEnd?: string,
//     gZipThreshold?: number,//GZip threadhold number
//     assets?: string,//Assets folder path
//     errorProcessor?: Function//Error processor
// })({/**路由配置**/})

route({
    errorProcessor: ex => {
        return {code: -1}
    }
})({
    '/demo': require('./src/router/router')
}).start()//启动（默认端口8080）