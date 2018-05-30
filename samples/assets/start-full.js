"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const path = require("path");
/**
 * 作为静态服务器使用
 */
let assetsPath = path.join(path.resolve('./'), './src/assets/');
//形式1：
__1.route({
    assets: assetsPath //匹配  /.......*.html/css/js/jpg....... 缓存策略：  Etag 403
})({ '/home': require('./src/home') })
    .start();
//形式2：
__1.route({
    assets: {
        '/assets/': assetsPath //匹配  /assets/......*.html/css/js/jpg....... 缓存策略：  Etag 403
    }
})({ '/home': require('./src/home') })
    .start();
//形式3：
__1.route({
    assets: {
        '/assets/': //匹配  /assets/......*.html/css/js/jpg.......
        { folder: assetsPath, cache: 'Cache-Control' } //静态资源位置及缓存策略
        // Cache-Control强缓存 {cache:'Cache-Control',strategy:'public, max-age=604800 }
        // Etag 403
        // None 不缓存
    }
})({ '/home': require('./src/home') })
    .start();
// 1. assets选项指定静态文件内容的位置,访问路径为: http://127.0.0.1:8080/home.html
// 2. 静态内容处理优先级低于router配置
// 3.rocker-mvc提供了不允许访问静态资源之外内容的安全机制
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQtZnVsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN0YXJ0LWZ1bGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNEI7QUFFNUIsNkJBQTZCO0FBRTdCOztHQUVHO0FBQ0gsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRWhFLE1BQU07QUFDTixTQUFLLENBRUQ7SUFDSSxNQUFNLEVBQUUsVUFBVSxDQUFBLHNEQUFzRDtDQUMzRSxDQUNKLENBQ0EsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFDLENBQUM7S0FDN0IsS0FBSyxFQUFFLENBQUM7QUFFYixNQUFNO0FBQ04sU0FBSyxDQUVEO0lBQ0ksTUFBTSxFQUNGO1FBQ0ksVUFBVSxFQUFDLFVBQVUsQ0FBQSw0REFBNEQ7S0FDcEY7Q0FDUixDQUNKLENBQ0EsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFDLENBQUM7S0FDN0IsS0FBSyxFQUFFLENBQUM7QUFFYixNQUFNO0FBQ04sU0FBSyxDQUVEO0lBQ0ksTUFBTSxFQUNGO1FBQ0ksVUFBVSxFQUFDLDRDQUE0QztRQUNuRCxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBQyxDQUFBLGFBQWE7UUFDTyw2RUFBNkU7UUFDN0UsV0FBVztRQUNYLFdBQVc7S0FDbEY7Q0FDUixDQUNKLENBQ0EsRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFDLENBQUM7S0FDN0IsS0FBSyxFQUFFLENBQUM7QUFFYixnRUFBZ0U7QUFDaEUseUJBQXlCO0FBQ3pCLG9DQUFvQyJ9