import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { IdentityPool } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface UpdateIdentityPoolCommandInput extends IdentityPool {}
export interface UpdateIdentityPoolCommandOutput
  extends IdentityPool,
    __MetadataBearer {}
declare const UpdateIdentityPoolCommand_base: {
  new (
    input: UpdateIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UpdateIdentityPoolCommandInput,
    UpdateIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: UpdateIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UpdateIdentityPoolCommandInput,
    UpdateIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class UpdateIdentityPoolCommand extends UpdateIdentityPoolCommand_base {
  protected static __types: {
    api: {
      input: IdentityPool;
      output: IdentityPool;
    };
    sdk: {
      input: UpdateIdentityPoolCommandInput;
      output: UpdateIdentityPoolCommandOutput;
    };
  };
}
