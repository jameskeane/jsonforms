import { IUISchemaElement } from '../../uischema';

export interface ISchemaGenerator {
    generateDefaultSchema(instance: Object): Object;
    generateDefaultSchemaWithOptions(
        instance: Object,
        allowAdditionalProperties: (properties: Object) => boolean,
        requiredProperties: (properties: string[]) => string[]): Object;
}

export interface IUISchemaGenerator {
    generateDefaultUISchema(jsonSchema: any, layoutType?: string): any;
    generateUISchema(jsonSchema: any, schemaElements: IUISchemaElement[],
        currentRef: string, schemaName: string, layoutType: string): IUISchemaElement;
}


export default angular.module('jsonforms.generators', []).name;
