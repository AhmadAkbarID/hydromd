import { getTargets } from '@inversifyjs/core';
import * as METADATA_KEY from '../constants/metadata_keys';
import { getFunctionName } from '../utils/serialization';
function getDependencies(metadataReader, func) {
    return getTargets(metadataReader)(func);
}
function getBaseClassDependencyCount(metadataReader, func) {
    var baseConstructor = Object.getPrototypeOf(func.prototype).constructor;
    if (baseConstructor !== Object) {
        var targets = getTargets(metadataReader)(baseConstructor);
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
export { getDependencies, getBaseClassDependencyCount, getFunctionName };
