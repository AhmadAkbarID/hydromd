define(["require", "exports", "../planning/metadata"], function (require, exports, metadata_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.propertyEventDecorator = propertyEventDecorator;
    function propertyEventDecorator(eventKey, errorMessage) {
        return function () {
            return function (target, propertyKey) {
                var metadata = new metadata_1.Metadata(eventKey, propertyKey);
                if (Reflect.hasOwnMetadata(eventKey, target.constructor)) {
                    throw new Error(errorMessage);
                }
                Reflect.defineMetadata(eventKey, metadata, target.constructor);
            };
        };
    }
});
