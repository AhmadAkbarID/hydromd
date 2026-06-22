import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { UnlinkDeveloperIdentityInput } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface UnlinkDeveloperIdentityCommandInput
  extends UnlinkDeveloperIdentityInput {}
export interface UnlinkDeveloperIdentityCommandOutput
  extends __MetadataBearer {}
declare const UnlinkDeveloperIdentityCommand_base: {
  new (
    input: UnlinkDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UnlinkDeveloperIdentityCommandInput,
    UnlinkDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: UnlinkDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UnlinkDeveloperIdentityCommandInput,
    UnlinkDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class UnlinkDeveloperIdentityCommand extends UnlinkDeveloperIdentityCommand_base {
  protected static __types: {
    api: {
      input: UnlinkDeveloperIdentityInput;
      output: {};
    };
    sdk: {
      input: UnlinkDeveloperIdentityCommandInput;
      output: UnlinkDeveloperIdentityCommandOutput;
    };
  };
}
