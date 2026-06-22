import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  GetOpenIdTokenInput,
  GetOpenIdTokenResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetOpenIdTokenCommandInput extends GetOpenIdTokenInput {}
export interface GetOpenIdTokenCommandOutput
  extends GetOpenIdTokenResponse,
    __MetadataBearer {}
declare const GetOpenIdTokenCommand_base: {
  new (
    input: GetOpenIdTokenCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetOpenIdTokenCommandInput,
    GetOpenIdTokenCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetOpenIdTokenCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetOpenIdTokenCommandInput,
    GetOpenIdTokenCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class GetOpenIdTokenCommand extends GetOpenIdTokenCommand_base {
  protected static __types: {
    api: {
      input: GetOpenIdTokenInput;
      output: GetOpenIdTokenResponse;
    };
    sdk: {
      input: GetOpenIdTokenCommandInput;
      output: GetOpenIdTokenCommandOutput;
    };
  };
}
