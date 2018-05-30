"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
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
__1.route({
    errorProcessor: ex => {
        return { code: -1 };
    }
})({
    '/demo': require('./src/router/router')
}).start(); //启动（默认端口8080）
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE0QjtBQUU1Qjs7R0FFRztBQUVILGVBQWU7QUFDZixhQUFhO0FBQ2Isc0JBQXNCO0FBQ3RCLFlBQVk7QUFDWixVQUFVO0FBQ1YsNEJBQTRCO0FBQzVCLDBCQUEwQjtBQUMxQixzREFBc0Q7QUFDdEQsMkNBQTJDO0FBQzNDLGlEQUFpRDtBQUNqRCxtQkFBbUI7QUFFbkIsU0FBSyxDQUFDO0lBQ0YsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ2pCLE9BQU8sRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUMsQ0FBQTtJQUNyQixDQUFDO0NBQ0osQ0FBQyxDQUFDO0lBQ0MsT0FBTyxFQUFFLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztDQUMxQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUEsQ0FBQSxjQUFjIn0=