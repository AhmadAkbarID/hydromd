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
define(["require", "exports", "@inversifyjs/core", "../bindings/binding_count", "../constants/error_msgs", "../constants/literal_types", "../constants/metadata_keys", "../utils/exceptions", "../utils/serialization", "./context", "./metadata", "./plan", "./reflection_utils", "./request"], function (require, exports, core_1, binding_count_1, ERROR_MSGS, literal_types_1, METADATA_KEY, exceptions_1, serialization_1, context_1, metadata_1, plan_1, reflection_utils_1, request_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.plan = plan;
    exports.createMockRequest = createMockRequest;
    exports.getBindingDictionary = getBindingDictionary;
    ERROR_MSGS = __importStar(ERROR_MSGS);
    METADATA_KEY = __importStar(METADATA_KEY);
    function getBindingDictionary(cntnr) {
        return cntnr._bindingDictionary;
    }
    function _createTarget(isMultiInject, targetType, serviceIdentifier, name, key, value) {
        var metadataList = _getTargetMetadata(isMultiInject, serviceIdentifier, key, value);
        var classElementMetadata = (0, core_1.getClassElementMetadataFromLegacyMetadata)(metadataList);
        if (classElementMetadata.kind === core_1.ClassElementMetadataKind.unmanaged) {
            throw new Error('Unexpected metadata when creating target');
        }
        var target = new core_1.LegacyTargetImpl(name, classElementMetadata, targetType);
        return target;
    }
    function _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target) {
        var bindings = getBindings(context.container, target.serviceIdentifier);
        var activeBindings = [];
        if (bindings.length === binding_count_1.BindingCount.NoBindingsAvailable &&
            context.container.options.autoBindInjectable === true &&
            typeof target.serviceIdentifier === 'function' &&
            metadataReader.getConstructorMetadata(target.serviceIdentifier)
                .compilerGeneratedMetadata) {
            context.container.bind(target.serviceIdentifier).toSelf();
            bindings = getBindings(context.container, target.serviceIdentifier);
        }
        if (!avoidConstraints) {
            activeBindings = bindings.filter(function (binding) {
                var request = new request_1.Request(binding.serviceIdentifier, context, parentRequest, binding, target);
                return binding.constraint(request);
            });
        }
        else {
            activeBindings = bindings;
        }
        _validateActiveBindingCount(target.serviceIdentifier, activeBindings, parentRequest, target, context.container);
        return activeBindings;
    }
    function _getTargetMetadata(isMultiInject, serviceIdentifier, key, value) {
        var metadataKey = isMultiInject
            ? METADATA_KEY.MULTI_INJECT_TAG
            : METADATA_KEY.INJECT_TAG;
        var metadataList = [
            new metadata_1.Metadata(metadataKey, serviceIdentifier),
        ];
        if (key !== undefined) {
            metadataList.push(new metadata_1.Metadata(key, value));
        }
        return metadataList;
    }
    function _validateActiveBindingCount(serviceIdentifier, bindings, parentRequest, target, container) {
        switch (bindings.length) {
            case binding_count_1.BindingCount.NoBindingsAvailable:
                if (target.isOptional()) {
                    return bindings;
                }
                else {
                    var serviceIdentifierString = (0, serialization_1.getServiceIdentifierAsString)(serviceIdentifier);
                    var msg = ERROR_MSGS.NOT_REGISTERED;
                    msg += (0, serialization_1.listMetadataForTarget)(serviceIdentifierString, target);
                    msg += (0, serialization_1.listRegisteredBindingsForServiceIdentifier)(container, serviceIdentifierString, getBindings);
                    if (parentRequest !== null) {
                        msg += "\n".concat(ERROR_MSGS.TRYING_TO_RESOLVE_BINDINGS((0, serialization_1.getServiceIdentifierAsString)(parentRequest.serviceIdentifier)));
                    }
                    throw new Error(msg);
                }
            case binding_count_1.BindingCount.OnlyOneBindingAvailable:
                return bindings;
            case binding_count_1.BindingCount.MultipleBindingsAvailable:
            default:
                if (!target.isArray()) {
                    var serviceIdentifierString = (0, serialization_1.getServiceIdentifierAsString)(serviceIdentifier);
                    var msg = "".concat(ERROR_MSGS.AMBIGUOUS_MATCH, " ").concat(serviceIdentifierString);
                    msg += (0, serialization_1.listRegisteredBindingsForServiceIdentifier)(container, serviceIdentifierString, getBindings);
                    throw new Error(msg);
                }
                else {
                    return bindings;
                }
        }
    }
    function _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, parentRequest, target) {
        var activeBindings;
        var childRequest;
        if (parentRequest === null) {
            activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, null, target);
            childRequest = new request_1.Request(serviceIdentifier, context, null, activeBindings, target);
            var thePlan = new plan_1.Plan(context, childRequest);
            context.addPlan(thePlan);
        }
        else {
            activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target);
            childRequest = parentRequest.addChildRequest(target.serviceIdentifier, activeBindings, target);
        }
        activeBindings.forEach(function (binding) {
            var subChildRequest = null;
            if (target.isArray()) {
                subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target);
            }
            else {
                if (binding.cache !== null) {
                    return;
                }
                subChildRequest = childRequest;
            }
            if (binding.type === literal_types_1.BindingTypeEnum.Instance &&
                binding.implementationType !== null) {
                var dependencies = (0, reflection_utils_1.getDependencies)(metadataReader, binding.implementationType);
                if (context.container.options.skipBaseClassChecks !== true) {
                    var baseClassDependencyCount = (0, reflection_utils_1.getBaseClassDependencyCount)(metadataReader, binding.implementationType);
                    if (dependencies.length < baseClassDependencyCount) {
                        var error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH((0, reflection_utils_1.getFunctionName)(binding.implementationType));
                        throw new Error(error);
                    }
                }
                dependencies.forEach(function (dependency) {
                    _createSubRequests(metadataReader, false, dependency.serviceIdentifier, context, subChildRequest, dependency);
                });
            }
        });
    }
    function getBindings(container, serviceIdentifier) {
        var bindings = [];
        var bindingDictionary = getBindingDictionary(container);
        if (bindingDictionary.hasKey(serviceIdentifier)) {
            bindings = bindingDictionary.get(serviceIdentifier);
        }
        else if (container.parent !== null) {
            bindings = getBindings(container.parent, serviceIdentifier);
        }
        return bindings;
    }
    function plan(metadataReader, container, isMultiInject, targetType, serviceIdentifier, key, value, avoidConstraints) {
        if (avoidConstraints === void 0) { avoidConstraints = false; }
        var context = new context_1.Context(container);
        var target = _createTarget(isMultiInject, targetType, serviceIdentifier, '', key, value);
        try {
            _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, null, target);
            return context;
        }
        catch (error) {
            if ((0, exceptions_1.isStackOverflowException)(error)) {
                (0, serialization_1.circularDependencyToException)(context.plan.rootRequest);
            }
            throw error;
        }
    }
    function createMockRequest(container, serviceIdentifier, key, value) {
        var metadataList = _getTargetMetadata(false, serviceIdentifier, key, value);
        var classElementMetadata = (0, core_1.getClassElementMetadataFromLegacyMetadata)(metadataList);
        if (classElementMetadata.kind === core_1.ClassElementMetadataKind.unmanaged) {
            throw new Error('Unexpected metadata when creating target');
        }
        var target = new core_1.LegacyTargetImpl('', classElementMetadata, 'Variable');
        var context = new context_1.Context(container);
        var request = new request_1.Request(serviceIdentifier, context, null, [], target);
        return request;
    }
});
