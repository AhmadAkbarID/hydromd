/*! firebase-admin v13.10.0 */
"use strict";
/*!
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebasePhoneNumberVerificationError = exports.FPNV_ERROR_CODE_MAPPING = exports.FPNV_TOKEN_INFO = exports.JWKS_URL = void 0;
const error_1 = require("../utils/error");
exports.JWKS_URL = 'https://fpnv.googleapis.com/v1beta/jwks';
exports.FPNV_TOKEN_INFO = {
    url: 'https://firebase.google.com/docs/phone-number-verification',
    verifyApiName: 'verifyToken()',
    jwtName: 'Firebase Phone Verification token',
    shortName: 'FPNV token',
    typ: 'JWT',
};
exports.FPNV_ERROR_CODE_MAPPING = {
    INVALID_ARGUMENT: 'invalid-argument',
    INVALID_TOKEN: 'invalid-token',
    EXPIRED_TOKEN: 'expired-token',
};
/**
 * Firebase Phone Number Verification error code structure. This extends `PrefixedFirebaseError`.
 *
 * @param code - The error code.
 * @param message - The error message.
 * @constructor
 */
class FirebasePhoneNumberVerificationError extends error_1.PrefixedFirebaseError {
    constructor(code, message) {
        super('phone-number-verification', code, message);
        /* tslint:disable:max-line-length */
        // Set the prototype explicitly. See the following link for more details:
        // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
        /* tslint:enable:max-line-length */
        this.__proto__ = FirebasePhoneNumberVerificationError.prototype;
    }
}
exports.FirebasePhoneNumberVerificationError = FirebasePhoneNumberVerificationError;
