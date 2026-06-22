/*! firebase-admin v13.10.0 */
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
import { PrefixedFirebaseError } from '../utils/error';
export interface FirebasePhoneNumberTokenInfo {
    /** Documentation URL. */
    url: string;
    /** verify API name. */
    verifyApiName: string;
    /** The JWT full name. */
    jwtName: string;
    /** The JWT short name. */
    shortName: string;
    /** The JWT typ (Type) */
    typ: string;
}
export declare const JWKS_URL = "https://fpnv.googleapis.com/v1beta/jwks";
export declare const FPNV_TOKEN_INFO: FirebasePhoneNumberTokenInfo;
export declare const FPNV_ERROR_CODE_MAPPING: {
    INVALID_ARGUMENT: "invalid-argument";
    INVALID_TOKEN: "invalid-token";
    EXPIRED_TOKEN: "expired-token";
};
export type PhoneNumberVerificationErrorCode = 'invalid-argument' | 'invalid-token' | 'expired-token';
/**
 * Firebase Phone Number Verification error code structure. This extends `PrefixedFirebaseError`.
 *
 * @param code - The error code.
 * @param message - The error message.
 * @constructor
 */
export declare class FirebasePhoneNumberVerificationError extends PrefixedFirebaseError {
    constructor(code: PhoneNumberVerificationErrorCode, message: string);
}
