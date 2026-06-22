import * as ERROR_MSGS from '../constants/error_msgs';
function getServiceIdentifierAsString(serviceIdentifier) {
    if (typeof serviceIdentifier === 'function') {
        return serviceIdentifier.name;
    }
    else if (typeof serviceIdentifier === 'symbol') {
        return serviceIdentifier.toString();
    }
    else {
        return serviceIdentifier;
    }
}
function listRegisteredBindingsForServiceIdentifier(container, serviceIdentifier, getBindings) {
    var registeredBindingsList = '';
    var registeredBindings = getBindings(container, serviceIdentifier);
    if (registeredBindings.length !== 0) {
        registeredBindingsList = '\nRegistered bindings:';
        registeredBindings.forEach(function (binding) {
            var name = 'Object';
            if (binding.implementationType !== null) {
                name = getFunctionName(binding.implementationType);
            }
            registeredBindingsList = "".concat(registeredBindingsList, "\n ").concat(name);
            if (binding.constraint.metaData) {
                registeredBindingsList = "".concat(registeredBindingsList, " - ").concat(binding.constraint.metaData);
            }
        });
    }
    return registeredBindingsList;
}
function alreadyDependencyChain(request, serviceIdentifier) {
    if (request.parentRequest === null) {
        return false;
    }
    else if (request.parentRequest.serviceIdentifier === serviceIdentifier) {
        return true;
    }
    else {
        return alreadyDependencyChain(request.parentRequest, serviceIdentifier);
    }
}
function dependencyChainToString(request) {
    function _createStringArr(req, result) {
        if (result === void 0) { result = []; }
        var serviceIdentifier = getServiceIdentifierAsString(req.serviceIdentifier);
        result.push(serviceIdentifier);
        if (req.parentRequest !== null) {
            return _createStringArr(req.parentRequest, result);
        }
        return result;
    }
    var stringArr = _createStringArr(request);
    return stringArr.reverse().join(' --> ');
}
function circularDependencyToException(request) {
    request.childRequests.forEach(function (childRequest) {
        if (alreadyDependencyChain(request, childRequest.serviceIdentifier)) {
            var services = dependencyChainToString(childRequest);
            throw new Error("".concat(ERROR_MSGS.CIRCULAR_DEPENDENCY, " ").concat(services));
        }
        else {
            circularDependencyToException(childRequest);
        }
    });
}
function listMetadataForTarget(serviceIdentifierString, target) {
    if (target.isTagged() || target.isNamed()) {
        var m_1 = '';
        var namedTag = target.getNamedTag();
        var otherTags = target.getCustomTags();
        if (namedTag !== null) {
            m_1 += stringifyMetadata(namedTag) + '\n';
        }
        if (otherTags !== null) {
            otherTags.forEach(function (tag) {
                m_1 += stringifyMetadata(tag) + '\n';
            });
        }
        return " ".concat(serviceIdentifierString, "\n ").concat(serviceIdentifierString, " - ").concat(m_1);
    }
    else {
        return " ".concat(serviceIdentifierString);
    }
}
function getFunctionName(func) {
    if (func.name != null && func.name !== '') {
        return func.name;
    }
    else {
        var name_1 = func.toString();
        var match = name_1.match(/^function\s*([^\s(]+)/);
        return match === null
            ? "Anonymous function: ".concat(name_1)
            : match[1];
    }
}
function getSymbolDescription(symbol) {
    return symbol.toString().slice(7, -1);
}
function stringifyMetadata(metadata) {
    return "{\"key\":\"".concat(metadata.key.toString(), "\",\"value\":\"").concat(metadata.value.toString(), "\"}");
}
export { getFunctionName, getServiceIdentifierAsString, listRegisteredBindingsForServiceIdentifier, listMetadataForTarget, circularDependencyToException, getSymbolDescription, };
