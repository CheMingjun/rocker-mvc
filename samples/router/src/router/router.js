"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../../..");
const superClass_1 = require("./superClass");
//在start.ts 中配置了路由规则为
// '/demo': require('./src/homepage/router')
class default_1 extends superClass_1.default {
    get(_p0, _p1) {
        return { msg: 'I am a method from super class' };
    }
}
__decorate([
    __1.Get({ url: '/base', render: './tpt.ejs' }),
    __param(0, __1.Param('id')), __param(1, __1.Param({ name: 'name', required: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], default_1.prototype, "get", null);
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUNBQXNEO0FBQ3RELDZDQUErQjtBQUMvQixxQkFBcUI7QUFDckIsNENBQTRDO0FBRzVDLGVBQXNCLFNBQVEsb0JBQUk7SUFFOUIsR0FBRyxDQUFjLEdBQUcsRUFBeUMsR0FBVztRQUNwRSxPQUFPLEVBQUMsR0FBRyxFQUFFLGdDQUFnQyxFQUFDLENBQUE7SUFDbEQsQ0FBQztDQUNKO0FBSEc7SUFEQyxPQUFHLENBQUMsRUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsQ0FBQztJQUNwQyxXQUFBLFNBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQSxFQUFPLFdBQUEsU0FBSyxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQTs7OztvQ0FFM0Q7QUFKTCw0QkFLQyJ9