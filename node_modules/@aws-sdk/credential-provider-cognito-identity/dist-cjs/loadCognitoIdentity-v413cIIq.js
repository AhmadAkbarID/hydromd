const { CognitoIdentityClient, GetCredentialsForIdentityCommand, GetIdCommand } = require("@aws-sdk/nested-clients/cognito-identity");
exports.CognitoIdentityClient = CognitoIdentityClient;
exports.GetCredentialsForIdentityCommand = GetCredentialsForIdentityCommand;
exports.GetIdCommand = GetIdCommand;
