import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  SetPrincipalTagAttributeMapInput,
  SetPrincipalTagAttributeMapResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface SetPrincipalTagAttributeMapCommandInput
  extends SetPrincipalTagAttributeMapInput {}
export interface SetPrincipalTagAttributeMapCommandOutput
  extends SetPrincipalTagAttributeMapResponse,
    __MetadataBearer {}
declare const SetPrincipalTagAttributeMapCommand_base: {
  new (
    input: SetPrincipalTagAttributeMapCommandInput
  ): import("@smithy/core/client").CommandImpl<
    SetPrincipalTagAttributeMapCommandInput,
    SetPrincipalTagAttributeMapCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: SetPrincipalTagAttributeMapCommandInput
  ): import("@smithy/core/client").CommandImpl<
    SetPrincipalTagAttributeMapCommandInput,
    SetPrincipalTagAttributeMapCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class SetPrincipalTagAttributeMapCommand extends SetPrincipalTagAttributeMapCommand_base {
  protected static __types: {
    api: {
      input: SetPrincipalTagAttributeMapInput;
      output: SetPrincipalTagAttributeMapResponse;
    };
    sdk: {
      input: SetPrincipalTagAttributeMapCommandInput;
      output: SetPrincipalTagAttributeMapCommandOutput;
    };
  };
}
