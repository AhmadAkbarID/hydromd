import * as ESTree from 'estree';
import { IObfuscatingGuard } from '../../../interfaces/node-transformers/preparing-transformers/obfuscating-guards/IObfuscatingGuard';
import { ObfuscatingGuardResult } from '../../../enums/node/ObfuscatingGuardResult';
export declare class ImportMetaObfuscationGuard implements IObfuscatingGuard {
    check(node: ESTree.Node): ObfuscatingGuardResult;
}
