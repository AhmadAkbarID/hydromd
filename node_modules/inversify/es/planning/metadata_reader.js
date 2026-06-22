import * as METADATA_KEY from '../constants/metadata_keys';
var MetadataReader = (function () {
    function MetadataReader() {
    }
    MetadataReader.prototype.getConstructorMetadata = function (constructorFunc) {
        var _a;
        var compilerGeneratedMetadata = (_a = Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, constructorFunc)) !== null && _a !== void 0 ? _a : [];
        var userGeneratedMetadata = Reflect.getMetadata(METADATA_KEY.TAGGED, constructorFunc);
        return {
            compilerGeneratedMetadata: compilerGeneratedMetadata,
            userGeneratedMetadata: userGeneratedMetadata !== null && userGeneratedMetadata !== void 0 ? userGeneratedMetadata : {},
        };
    };
    MetadataReader.prototype.getPropertiesMetadata = function (constructorFunc) {
        var _a;
        var userGeneratedMetadata = (_a = Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc)) !== null && _a !== void 0 ? _a : {};
        return userGeneratedMetadata;
    };
    return MetadataReader;
}());
export { MetadataReader };
