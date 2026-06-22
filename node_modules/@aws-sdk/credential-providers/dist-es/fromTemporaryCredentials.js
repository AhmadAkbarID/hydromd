import { loadConfig, NODE_REGION_CONFIG_FILE_OPTIONS } from "@smithy/core/config";
import { fromNodeProviderChain } from "./fromNodeProviderChain";
import { fromTemporaryCredentials as fromTemporaryCredentialsBase } from "./fromTemporaryCredentials.base";
export const fromTemporaryCredentials = (options) => {
    return fromTemporaryCredentialsBase(options, fromNodeProviderChain, async ({ profile = process.env.AWS_PROFILE }) => loadConfig({
        environmentVariableSelector: (env) => env.AWS_REGION,
        configFileSelector: (profileData) => {
            return profileData.region;
        },
        default: () => undefined,
    }, { ...NODE_REGION_CONFIG_FILE_OPTIONS, profile })());
};
