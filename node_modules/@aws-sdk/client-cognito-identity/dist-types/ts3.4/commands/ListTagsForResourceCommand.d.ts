import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import {
  ListTagsForResourceInput,
  ListTagsForResourceResponse,
} from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface ListTagsForResourceCommandInput
  extends ListTagsForResourceInput {}
export interface ListTagsForResourceCommandOutput
  extends ListTagsForResourceResponse,
    __MetadataBearer {}
declare const ListTagsForResourceCommand_base: {
  new (
    input: ListTagsForResourceCommandInput
  ): import("@smithy/core/client").CommandImpl<
    ListTagsForResourceCommandInput,
    ListTagsForResourceCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: ListTagsForResourceCommandInput
  ): import("@smithy/core/client").CommandImpl<
    ListTagsForResourceCommandInput,
    ListTagsForResourceCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class ListTagsForResourceCommand extends ListTagsForResourceCommand_base {
  protected static __types: {
    api: {
      input: ListTagsForResourceInput;
      output: ListTagsForResourceResponse;
    };
    sdk: {
      input: ListTagsForResourceCommandInput;
      output: ListTagsForResourceCommandOutput;
    };
  };
}
