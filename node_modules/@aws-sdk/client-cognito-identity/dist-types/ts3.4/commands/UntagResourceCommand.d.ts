import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { UntagResourceInput, UntagResourceResponse } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface UntagResourceCommandInput extends UntagResourceInput {}
export interface UntagResourceCommandOutput
  extends UntagResourceResponse,
    __MetadataBearer {}
declare const UntagResourceCommand_base: {
  new (
    input: UntagResourceCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UntagResourceCommandInput,
    UntagResourceCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: UntagResourceCommandInput
  ): import("@smithy/core/client").CommandImpl<
    UntagResourceCommandInput,
    UntagResourceCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class UntagResourceCommand extends UntagResourceCommand_base {
  protected static __types: {
    api: {
      input: UntagResourceInput;
      output: {};
    };
    sdk: {
      input: UntagResourceCommandInput;
      output: UntagResourceCommandOutput;
    };
  };
}
