"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const path = require("path");
/**
 * 作为静态服务器使用
 */
let assetsPath = path.join(path.resolve('./'), './src/assets/');
//route({assets:{'/assets/':assetsPath} }).start();
__1.route({ assets: { '/assets/': { folder: assetsPath, cache: 'Cache-Control' } } }).start();
//或者 route({assets: assetsPath})({'/home':require('./home.ts')}).start();
// 1. assets选项指定静态文件内容的位置,访问路径为: http://127.0.0.1:8080/home.html
// 2. 静态内容处理优先级低于router配置
// 3.rocker-mvc提供了不允许访问静态资源之外内容的安全机制
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE0QjtBQUU1Qiw2QkFBNkI7QUFFN0I7O0dBRUc7QUFDSCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDaEUsbURBQW1EO0FBQ25ELFNBQUssQ0FBQyxFQUFDLE1BQU0sRUFBRSxFQUFDLFVBQVUsRUFBRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBQyxFQUFDLEVBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BGLHlFQUF5RTtBQUV6RSxnRUFBZ0U7QUFDaEUseUJBQXlCO0FBQ3pCLG9DQUFvQyJ9