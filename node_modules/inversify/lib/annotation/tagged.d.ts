declare function tagged(metadataKey: string | number | symbol, metadataValue: unknown): <T>(target: import("./decorator_utils").DecoratorTarget, targetKey?: string | symbol, indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>) => void;
export { tagged };
