var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "@inversifyjs/core", "../constants/metadata_keys", "../utils/serialization"], function (require, exports, core_1, METADATA_KEY, serialization_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFunctionName = void 0;
    exports.getDependencies = getDependencies;
    exports.getBaseClassDependencyCount = getBaseClassDependencyCount;
    METADATA_KEY = __importStar(METADATA_KEY);
    Object.defineProperty(exports, "getFunctionName", { enumerable: true, get: function () { return serialization_1.getFunctionName; } });
    function getDependencies(metadataReader, func) {
        return (0, core_1.getTargets)(metadataReader)(func);
    }
    function getBaseClassDependencyCount(metadataReader, func) {
        var baseConstructor = Object.getPrototypeOf(func.prototype).constructor;
        if (baseConstructor !== Object) {
            var targets = (0, core_1.getTargets)(metadataReader)(baseConstructor);
            var metadata = targets.map(function (t) {
                return t.metadata.filter(function (m) { return m.key === METADATA_KEY.UNMANAGED_TAG; });
            });
            var unmanagedCount = [].concat.apply([], metadata).length;
            var dependencyCount = targets.length - unmanagedCount;
            if (dependencyCount > 0) {
                return dependencyCount;
            }
            else {
                return getBaseClassDependencyCount(metadataReader, baseConstructor);
            }
        }
        else {
            return 0;
        }
    }
});
