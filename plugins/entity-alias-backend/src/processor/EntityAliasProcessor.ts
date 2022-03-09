import { UrlReader } from '@backstage/backend-common';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  CatalogProcessorEntityResult,
  LocationSpec,
  parseEntityYaml,
  processingResult,
} from '@backstage/plugin-catalog-backend';
import { Entity } from '@backstage/catalog-model';
import { merge } from 'lodash';

// A processor that reads from the fictional System-X
export class EntityAliasProcessor implements CatalogProcessor {
  constructor(private readonly reader: UrlReader) {}
  getProcessorName(): string {
    return 'EntityAliasProcessor';
  }
  //   async preProcessEntity?(
  //     entity: Entity,
  //     location: LocationSpec,
  //     emit: CatalogProcessorEmit,
  //     originLocation: LocationSpec,
  //     cache: CatalogProcessorCache,
  //   ): Promise<Entity> {
  //     if (entity.kind === 'Alias') {
  //       console.log('preProcessEntity');
  //     }
  //     return entity;
  //   }
  async validateEntityKind?(entity: Entity): Promise<boolean> {
    return true;
  }
  async postProcessEntity?(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (entity.kind === 'Alias') {
      console.log('preProcessEntity');
      const { target, overrides } = entity?.spec;
      const data = await this.reader.read(target);

      for (const parsedEntity of parseEntityYaml(data, target)) {
        const newEntity = (parsedEntity as CatalogProcessorEntityResult).entity;
        const finalEntity = merge(newEntity, overrides);

        emit(processingResult.entity({ type: 'url', target }, finalEntity));
      }
      // const json = JSON.parse(data.toString());
    }
    return entity;
  }
  //   handleError?(
  //     error: Error,
  //     location: LocationSpec,
  //     emit: CatalogProcessorEmit,
  //   ): Promise<void> {
  //     throw new Error('Method not implemented.');
  //   }

  //   async readLocation(
  //     location: LocationSpec,
  //     _optional: boolean,
  //     emit: CatalogProcessorEmit,
  //     ...rest
  //   ): Promise<boolean> {
  //     console.log('readlocation');
  //     // Pick a custom location type string. A location will be
  //     // registered later with this type.
  //     console.dir({ rest });
  //     if (location.type !== 'system-x') {
  //       return false;
  //     }

  //     try {
  //       // Use the builtin reader facility to grab data from the
  //       // API. If you prefer, you can just use plain fetch here
  //       // (from the node-fetch package), or any other method of
  //       // your choosing.
  //       const data = await this.reader.read(location.target);
  //       const json = JSON.parse(data.toString());
  //       // Repeatedly call emit(results.entity(location, <entity>))
  //     } catch (error) {
  //       const message = `Unable to read ${location.type}, ${error}`;
  //       emit(results.generalError(location, message));
  //     }

  //     return true;
  //   }
}
