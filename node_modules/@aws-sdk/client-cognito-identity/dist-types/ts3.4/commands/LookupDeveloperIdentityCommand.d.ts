import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  LookupDeveloperIdentityInput,
  LookupDeveloperIdentityResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface LookupDeveloperIdentityCommandInput
  extends LookupDeveloperIdentityInput {}
export interface LookupDeveloperIdentityCommandOutput
  extends LookupDeveloperIdentityResponse,
    __MetadataBearer {}
declare const LookupDeveloperIdentityCommand_base: {
  new (
    input: LookupDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    LookupDeveloperIdentityCommandInput,
    LookupDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: LookupDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    LookupDeveloperIdentityCommandInput,
    LookupDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class LookupDeveloperIdentityCommand extends LookupDeveloperIdentityCommand_base {
  protected static __types: {
    api: {
      input: LookupDeveloperIdentityInput;
      output: LookupDeveloperIdentityResponse;
    };
    sdk: {
      input: LookupDeveloperIdentityCommandInput;
      output: LookupDeveloperIdentityCommandOutput;
    };
  };
}
