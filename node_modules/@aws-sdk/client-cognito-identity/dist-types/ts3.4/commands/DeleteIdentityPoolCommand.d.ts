import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { DeleteIdentityPoolInput } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface DeleteIdentityPoolCommandInput
  extends DeleteIdentityPoolInput {}
export interface DeleteIdentityPoolCommandOutput extends __MetadataBearer {}
declare const DeleteIdentityPoolCommand_base: {
  new (
    input: DeleteIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DeleteIdentityPoolCommandInput,
    DeleteIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: DeleteIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DeleteIdentityPoolCommandInput,
    DeleteIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class DeleteIdentityPoolCommand extends DeleteIdentityPoolCommand_base {
  protected static __types: {
    api: {
      input: DeleteIdentityPoolInput;
      output: {};
    };
    sdk: {
      input: DeleteIdentityPoolCommandInput;
      output: DeleteIdentityPoolCommandOutput;
    };
  };
}
