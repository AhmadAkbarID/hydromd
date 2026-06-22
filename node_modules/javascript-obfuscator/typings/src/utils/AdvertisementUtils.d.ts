export declare class AdvertisementUtils {
    private static readonly maxDisplayCount;
    private static readonly storageKey;
    private static readonly timestampKey;
    private static readonly resetPeriodMs;
    private static readonly ciEnvVars;
    private static config;
    static isCI(): boolean;
    static shouldShowAdvertisement(): boolean;
    private static isNodeEnvironment;
    private static getConfig;
    private static getDisplayCount;
    private static setDisplayCount;
    private static getFirstDisplayTime;
    private static setFirstDisplayTime;
    private static resetDisplayData;
}
