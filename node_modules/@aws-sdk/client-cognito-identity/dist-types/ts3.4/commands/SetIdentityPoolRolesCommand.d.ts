import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { SetIdentityPoolRolesInput } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface SetIdentityPoolRolesCommandInput
  extends SetIdentityPoolRolesInput {}
export interface SetIdentityPoolRolesCommandOutput extends __MetadataBearer {}
declare const SetIdentityPoolRolesCommand_base: {
  new (
    input: SetIdentityPoolRolesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    SetIdentityPoolRolesCommandInput,
    SetIdentityPoolRolesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: SetIdentityPoolRolesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    SetIdentityPoolRolesCommandInput,
    SetIdentityPoolRolesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class SetIdentityPoolRolesCommand extends SetIdentityPoolRolesCommand_base {
  protected static __types: {
    api: {
      input: SetIdentityPoolRolesInput;
      output: {};
    };
    sdk: {
      input: SetIdentityPoolRolesCommandInput;
      output: SetIdentityPoolRolesCommandOutput;
    };
  };
}
