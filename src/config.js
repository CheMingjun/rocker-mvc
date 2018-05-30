"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Start = new (class {
    constructor() {
        //------------------------------------------------
        this._port = 8080;
    }
    set importPath(_importPath) {
        this._importPath = _importPath;
    }
    get importPath() {
        return this._importPath;
    }
    set port(_port) {
        this._port = _port;
    }
    get port() {
        return this._port;
    }
});
exports.Router = new (class {
    constructor() {
        //------------------------------------------------
        this._threshold = 2048;
    }
    set assets(_assets) {
        this._assets = _assets;
    }
    get assets() {
        return this._assets;
    }
    set gZipThreshold(_threshold) {
        this._threshold = _threshold;
    }
    get gZipThreshold() {
        return this._threshold;
    }
    set errorProcessor(errorProcessor) {
        this._errorProcessor = errorProcessor;
    }
    get errorProcessor() {
        return this._errorProcessor;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBUVcsUUFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQUE7UUFVcEIsa0RBQWtEO1FBQzFDLFVBQUssR0FBVyxJQUFJLENBQUM7SUFRakMsQ0FBQztJQWpCRyxJQUFJLFVBQVUsQ0FBQyxXQUFtQjtRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBRUQsSUFBSSxVQUFVO1FBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFBO0lBQzNCLENBQUM7SUFJRCxJQUFJLElBQUksQ0FBQyxLQUFhO1FBQ2xCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDckIsQ0FBQztDQUNKLENBQUMsQ0FBQTtBQUVTLFFBQUEsTUFBTSxHQUFHLElBQUksQ0FBQztJQUFBO1FBWXJCLGtEQUFrRDtRQUMxQyxlQUFVLEdBQUcsSUFBSSxDQUFDO0lBb0I5QixDQUFDO0lBN0JHLElBQUksTUFBTSxDQUFDLE9BQXVCO1FBQzlCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDdkIsQ0FBQztJQUtELElBQUksYUFBYSxDQUFDLFVBQWtCO1FBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLGFBQWE7UUFDYixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUE7SUFDMUIsQ0FBQztJQUtELElBQUksY0FBYyxDQUFDLGNBQXdCO1FBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQzFDLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDZCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUE7SUFDL0IsQ0FBQztDQUNKLENBQUMsQ0FBQSJ9