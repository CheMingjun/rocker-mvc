import {Get, Post, Param, Request} from "../../../..";
import Base from './superClass'
//在start.ts 中配置了路由规则为
// '/demo': require('./src/homepage/router')


export default class  extends Base {
    @Get({url: '/base', render: './tpt.ejs'})
    get(@Param('id') _p0, @Param({name: 'name', required: true}) _p1: string) {
        return {msg: 'I am a method from super class'}
    }
}