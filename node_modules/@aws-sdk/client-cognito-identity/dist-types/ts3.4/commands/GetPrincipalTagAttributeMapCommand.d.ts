import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  GetPrincipalTagAttributeMapInput,
  GetPrincipalTagAttributeMapResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetPrincipalTagAttributeMapCommandInput
  extends GetPrincipalTagAttributeMapInput {}
export interface GetPrincipalTagAttributeMapCommandOutput
  extends GetPrincipalTagAttributeMapResponse,
    __MetadataBearer {}
declare const GetPrincipalTagAttributeMapCommand_base: {
  new (
    input: GetPrincipalTagAttributeMapCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetPrincipalTagAttributeMapCommandInput,
    GetPrincipalTagAttributeMapCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetPrincipalTagAttributeMapCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetPrincipalTagAttributeMapCommandInput,
    GetPrincipalTagAttributeMapCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class GetPrincipalTagAttributeMapCommand extends GetPrincipalTagAttributeMapCommand_base {
  protected static __types: {
    api: {
      input: GetPrincipalTagAttributeMapInput;
      output: GetPrincipalTagAttributeMapResponse;
    };
    sdk: {
      input: GetPrincipalTagAttributeMapCommandInput;
      output: GetPrincipalTagAttributeMapCommandOutput;
    };
  };
}
