declare function optional(): <T>(target: import("./decorator_utils").DecoratorTarget, targetKey?: string | symbol, indexOrPropertyDescriptor?: number | TypedPropertyDescriptor<T>) => void;
export { optional };
