import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';
import { BaseClassElementMetadata } from './BaseClassElementMetadata';
import { MaybeClassElementMetadataKind } from './MaybeClassElementMetadataKind';
import { MetadataName } from './MetadataName';
import { MetadataTag } from './MetadataTag';
import { MetadataTargetName } from './MetadataTargetName';
export interface MaybeManagedClassElementMetadata extends BaseClassElementMetadata<MaybeClassElementMetadataKind.unknown> {
    name: MetadataName | undefined;
    optional: boolean | undefined;
    tags: Map<MetadataTag, unknown>;
    targetName: MetadataTargetName | undefined;
    value: ServiceIdentifier | LazyServiceIdentifier | undefined;
}
//# sourceMappingURL=MaybeManagedClassElementMetadata.d.ts.map