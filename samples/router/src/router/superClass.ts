import {Get} from "../../../..";

export default class {
    @Get({url: '/base', render: './tpt.ejs'})
    get1() {
        return {msg: 'I am a method from super class'}
    }
}