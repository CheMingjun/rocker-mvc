# rocker-mvc

轻量级Web开发MVC框架
<br/>
<br/>

## 安装
><font color=red>npm install rocker-mvc --save</font>
Node.js >= 8.0.0 required.

<br/>

## 特性
 ✔︎ 简单易用，符合工程师直觉<br/>
 ✔︎ 一体化的开发集成框架<br/>
 ✔︎ 面向对象风格的开发体验<br/>
<br/>

## 场景.文档
(以下代码样例均Typescript实现)
<br/>
[基本路由使用](#router)<br/>
[静态资源](#assets)<br/>


---

#### Router

>rocker-mvc/samples/router<br/>
>&emsp;└src<br/>
>&emsp;│&emsp;└router<br/>
>&emsp;│&emsp;&emsp;├router.ts<br/>
>&emsp;│&emsp;&emsp;└tpt.ejs<br/>
>&emsp;└start.ts<br/>
>&emsp;└package.json<br/>

start.ts
```typescript
import {route} from "rocker-mvc";

/**
 * 配置路由并启动
 */
route({
    '/sample': require('./src/demo/router')
})
    .start()//启动（默认端口8080）
```

src/demo/router.ts
```typescript
import {Get, Param, Request} from "rocker-mvc";

//在start.ts 中配置了路由规则为
// '/demo': require('./src/homepage/router')

export default class {
    /**
     * 【样例1】 匹配Get(/demo)
     */
    @Get({url: '/', render: './tpt.ejs'})//@Get注释该方法表明为Get方法,url:匹配的路径，render:返回的摸版路径
    async get0(@Param('id') _id: string, @Request _ctx) {//此处的方法名可以是任意的,通过 @Param描述对应请求中的参数
        //返回给摸版引擎的数据对象
        return {message: `The input param id value is: ${_id}`};
    }

    /**
     * 【样例2】 匹配 Get(/demo/test)
     */
    @Get({url: '/test', render: './tpt.ejs'})
    async get1(@Param({name: 'id', required: true}) _id: string, @Param('age') _age: number) {//@Param描述了一个“非空”的id及可为空的age参数
        //返回给摸版引擎的数据对象
        return {message: `The input param id value is: ${_id}`};
    }

    /**
     * 匹配 Post(/demo)
     */
    @Post({url: '/'})
    async post(@Param('id') _id: string) {
        //直接将json返回
        return {message: `The input param id value is: ${_id}`};
    }
}
```

src/demo/tpt.ejs
```html
<div>
    <div><%=message%></div>
</div>
```

<br/>

#### Assets
>rocker-mvc/samples/assets<br/>
>&emsp;└src<br/>
>&emsp;│&emsp;└assets<br/>
>&emsp;│&emsp;&emsp;└assets<br/>
>&emsp;│&emsp;&emsp;&emsp;└test.js<br/>
>&emsp;└start.ts<br/>
>&emsp;└package.json<br/>

start.ts
```typescript
import {route} from "rocker-mvc";
import * as path from 'path';

/**
 * 作为静态服务器使用
 */
let assetsPath = path.join(path.resolve('./'), './src/assets/');
route({assetsPath}).start();
// 1. assetsPath选项指定静态文件内容的位置
// 2. 静态内容处理优先级低于router配置
// 3.rocker-mvc提供了不允许访问静态资源之外内容的安全机制
```