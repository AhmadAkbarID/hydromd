import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  DeleteIdentitiesInput,
  DeleteIdentitiesResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface DeleteIdentitiesCommandInput extends DeleteIdentitiesInput {}
export interface DeleteIdentitiesCommandOutput
  extends DeleteIdentitiesResponse,
    __MetadataBearer {}
declare const DeleteIdentitiesCommand_base: {
  new (
    input: DeleteIdentitiesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DeleteIdentitiesCommandInput,
    DeleteIdentitiesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: DeleteIdentitiesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DeleteIdentitiesCommandInput,
    DeleteIdentitiesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class DeleteIdentitiesCommand extends DeleteIdentitiesCommand_base {
  protected static __types: {
    api: {
      input: DeleteIdentitiesInput;
      output: DeleteIdentitiesResponse;
    };
    sdk: {
      input: DeleteIdentitiesCommandInput;
      output: DeleteIdentitiesCommandOutput;
    };
  };
}
