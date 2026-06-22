import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  GetIdentityPoolRolesInput,
  GetIdentityPoolRolesResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetIdentityPoolRolesCommandInput
  extends GetIdentityPoolRolesInput {}
export interface GetIdentityPoolRolesCommandOutput
  extends GetIdentityPoolRolesResponse,
    __MetadataBearer {}
declare const GetIdentityPoolRolesCommand_base: {
  new (
    input: GetIdentityPoolRolesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetIdentityPoolRolesCommandInput,
    GetIdentityPoolRolesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetIdentityPoolRolesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetIdentityPoolRolesCommandInput,
    GetIdentityPoolRolesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class GetIdentityPoolRolesCommand extends GetIdentityPoolRolesCommand_base {
  protected static __types: {
    api: {
      input: GetIdentityPoolRolesInput;
      output: GetIdentityPoolRolesResponse;
    };
    sdk: {
      input: GetIdentityPoolRolesCommandInput;
      output: GetIdentityPoolRolesCommandOutput;
    };
  };
}
