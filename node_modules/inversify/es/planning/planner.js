import { ClassElementMetadataKind, getClassElementMetadataFromLegacyMetadata, LegacyTargetImpl as TargetImpl, } from '@inversifyjs/core';
import { BindingCount } from '../bindings/binding_count';
import * as ERROR_MSGS from '../constants/error_msgs';
import { BindingTypeEnum } from '../constants/literal_types';
import * as METADATA_KEY from '../constants/metadata_keys';
import { isStackOverflowException } from '../utils/exceptions';
import { circularDependencyToException, getServiceIdentifierAsString, listMetadataForTarget, listRegisteredBindingsForServiceIdentifier, } from '../utils/serialization';
import { Context } from './context';
import { Metadata } from './metadata';
import { Plan } from './plan';
import { getBaseClassDependencyCount, getDependencies, getFunctionName, } from './reflection_utils';
import { Request } from './request';
function getBindingDictionary(cntnr) {
    return cntnr._bindingDictionary;
}
function _createTarget(isMultiInject, targetType, serviceIdentifier, name, key, value) {
    var metadataList = _getTargetMetadata(isMultiInject, serviceIdentifier, key, value);
    var classElementMetadata = getClassElementMetadataFromLegacyMetadata(metadataList);
    if (classElementMetadata.kind === ClassElementMetadataKind.unmanaged) {
        throw new Error('Unexpected metadata when creating target');
    }
    var target = new TargetImpl(name, classElementMetadata, targetType);
    return target;
}
function _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target) {
    var bindings = getBindings(context.container, target.serviceIdentifier);
    var activeBindings = [];
    if (bindings.length === BindingCount.NoBindingsAvailable &&
        context.container.options.autoBindInjectable === true &&
        typeof target.serviceIdentifier === 'function' &&
        metadataReader.getConstructorMetadata(target.serviceIdentifier)
            .compilerGeneratedMetadata) {
        context.container.bind(target.serviceIdentifier).toSelf();
        bindings = getBindings(context.container, target.serviceIdentifier);
    }
    if (!avoidConstraints) {
        activeBindings = bindings.filter(function (binding) {
            var request = new Request(binding.serviceIdentifier, context, parentRequest, binding, target);
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
        new Metadata(metadataKey, serviceIdentifier),
    ];
    if (key !== undefined) {
        metadataList.push(new Metadata(key, value));
    }
    return metadataList;
}
function _validateActiveBindingCount(serviceIdentifier, bindings, parentRequest, target, container) {
    switch (bindings.length) {
        case BindingCount.NoBindingsAvailable:
            if (target.isOptional()) {
                return bindings;
            }
            else {
                var serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier);
                var msg = ERROR_MSGS.NOT_REGISTERED;
                msg += listMetadataForTarget(serviceIdentifierString, target);
                msg += listRegisteredBindingsForServiceIdentifier(container, serviceIdentifierString, getBindings);
                if (parentRequest !== null) {
                    msg += "\n".concat(ERROR_MSGS.TRYING_TO_RESOLVE_BINDINGS(getServiceIdentifierAsString(parentRequest.serviceIdentifier)));
                }
                throw new Error(msg);
            }
        case BindingCount.OnlyOneBindingAvailable:
            return bindings;
        case BindingCount.MultipleBindingsAvailable:
        default:
            if (!target.isArray()) {
                var serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier);
                var msg = "".concat(ERROR_MSGS.AMBIGUOUS_MATCH, " ").concat(serviceIdentifierString);
                msg += listRegisteredBindingsForServiceIdentifier(container, serviceIdentifierString, getBindings);
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
        childRequest = new Request(serviceIdentifier, context, null, activeBindings, target);
        var thePlan = new Plan(context, childRequest);
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
        if (binding.type === BindingTypeEnum.Instance &&
            binding.implementationType !== null) {
            var dependencies = getDependencies(metadataReader, binding.implementationType);
            if (context.container.options.skipBaseClassChecks !== true) {
                var baseClassDependencyCount = getBaseClassDependencyCount(metadataReader, binding.implementationType);
                if (dependencies.length < baseClassDependencyCount) {
                    var error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH(getFunctionName(binding.implementationType));
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
    var context = new Context(container);
    var target = _createTarget(isMultiInject, targetType, serviceIdentifier, '', key, value);
    try {
        _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, null, target);
        return context;
    }
    catch (error) {
        if (isStackOverflowException(error)) {
            circularDependencyToException(context.plan.rootRequest);
        }
        throw error;
    }
}
function createMockRequest(container, serviceIdentifier, key, value) {
    var metadataList = _getTargetMetadata(false, serviceIdentifier, key, value);
    var classElementMetadata = getClassElementMetadataFromLegacyMetadata(metadataList);
    if (classElementMetadata.kind === ClassElementMetadataKind.unmanaged) {
        throw new Error('Unexpected metadata when creating target');
    }
    var target = new TargetImpl('', classElementMetadata, 'Variable');
    var context = new Context(container);
    var request = new Request(serviceIdentifier, context, null, [], target);
    return request;
}
export { plan, createMockRequest, getBindingDictionary };
