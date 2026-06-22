import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  GetOpenIdTokenForDeveloperIdentityInput,
  GetOpenIdTokenForDeveloperIdentityResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface GetOpenIdTokenForDeveloperIdentityCommandInput
  extends GetOpenIdTokenForDeveloperIdentityInput {}
export interface GetOpenIdTokenForDeveloperIdentityCommandOutput
  extends GetOpenIdTokenForDeveloperIdentityResponse,
    __MetadataBearer {}
declare const GetOpenIdTokenForDeveloperIdentityCommand_base: {
  new (
    input: GetOpenIdTokenForDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetOpenIdTokenForDeveloperIdentityCommandInput,
    GetOpenIdTokenForDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: GetOpenIdTokenForDeveloperIdentityCommandInput
  ): import("@smithy/core/client").CommandImpl<
    GetOpenIdTokenForDeveloperIdentityCommandInput,
    GetOpenIdTokenForDeveloperIdentityCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class GetOpenIdTokenForDeveloperIdentityCommand extends GetOpenIdTokenForDeveloperIdentityCommand_base {
  protected static __types: {
    api: {
      input: GetOpenIdTokenForDeveloperIdentityInput;
      output: GetOpenIdTokenForDeveloperIdentityResponse;
    };
    sdk: {
      input: GetOpenIdTokenForDeveloperIdentityCommandInput;
      output: GetOpenIdTokenForDeveloperIdentityCommandOutput;
    };
  };
}
