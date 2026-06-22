import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  ListIdentitiesInput,
  ListIdentitiesResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface ListIdentitiesCommandInput extends ListIdentitiesInput {}
export interface ListIdentitiesCommandOutput
  extends ListIdentitiesResponse,
    __MetadataBearer {}
declare const ListIdentitiesCommand_base: {
  new (
    input: ListIdentitiesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    ListIdentitiesCommandInput,
    ListIdentitiesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: ListIdentitiesCommandInput
  ): import("@smithy/core/client").CommandImpl<
    ListIdentitiesCommandInput,
    ListIdentitiesCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class ListIdentitiesCommand extends ListIdentitiesCommand_base {
  protected static __types: {
    api: {
      input: ListIdentitiesInput;
      output: ListIdentitiesResponse;
    };
    sdk: {
      input: ListIdentitiesCommandInput;
      output: ListIdentitiesCommandOutput;
    };
  };
}
