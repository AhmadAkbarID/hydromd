import { Command as $Command } from "@smithy/core/client";
import { MetadataBearer as __MetadataBearer } from "@smithy/types";
import {
  CognitoIdentityClientResolvedConfig,
  ServiceInputTypes,
  ServiceOutputTypes,
} from "../CognitoIdentityClient";
import { DescribeIdentityPoolInput, IdentityPool } from "../models/models_0";
export { __MetadataBearer };
export { $Command };
export interface DescribeIdentityPoolCommandInput
  extends DescribeIdentityPoolInput {}
export interface DescribeIdentityPoolCommandOutput
  extends IdentityPool,
    __MetadataBearer {}
declare const DescribeIdentityPoolCommand_base: {
  new (
    input: DescribeIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DescribeIdentityPoolCommandInput,
    DescribeIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  new (
    input: DescribeIdentityPoolCommandInput
  ): import("@smithy/core/client").CommandImpl<
    DescribeIdentityPoolCommandInput,
    DescribeIdentityPoolCommandOutput,
    CognitoIdentityClientResolvedConfig,
    ServiceInputTypes,
    ServiceOutputTypes
  >;
  getEndpointParameterInstructions(): {
    [x: string]: unknown;
  };
};
export declare class DescribeIdentityPoolCommand extends DescribeIdentityPoolCommand_base {
  protected static __types: {
    api: {
      input: DescribeIdentityPoolInput;
      output: IdentityPool;
    };
    sdk: {
      input: DescribeIdentityPoolCommandInput;
      output: DescribeIdentityPoolCommandOutput;
    };
  };
}
