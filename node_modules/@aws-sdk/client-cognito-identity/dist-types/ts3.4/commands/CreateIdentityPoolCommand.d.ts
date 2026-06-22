import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { CreateIdentityPoolInput, IdentityPool } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface CreateIdentityPoolCommandInput
  extends CreateIdentityPoolInput {}
export interface CreateIdentityPoolCommandOutput
  extends IdentityPool,
    __MetadataBearer {}
declare const CreateIdentityPoolCommand_base: {
  new (
    input: CreateIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    CreateIdentityPoolCommandInput,
    CreateIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: CreateIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    CreateIdentityPoolCommandInput,
    CreateIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class CreateIdentityPoolCommand extends CreateIdentityPoolCommand_base {
  protected static __types: {
    api: {
      input: CreateIdentityPoolInput;
      output: IdentityPool;
    };
    sdk: {
      input: CreateIdentityPoolCommandInput;
      output: CreateIdentityPoolCommandOutput;
    };
  };
}
