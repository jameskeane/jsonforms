///<reference path="../../../references.ts"/>

class StringRenderer implements JSONForms.IRenderer {

    priority = 2;

    static inject = ['RenderDescriptionFactory'];

    render(element: IControlObject, subSchema: SchemaElement, schemaPath: string, services: JSONForms.Services): JSONForms.IRenderDescription {
        let control = JSONForms.RenderDescriptionFactory.createControlDescription(schemaPath, services, element);

        if (element['options'] != null && element['options']['multi']) {
            control.template = `<jsonforms-control>
               <textarea id="${schemaPath}" class="form-control jsf-control-string" ${element.readOnly ? 'readonly' : ''} data-jsonforms-model data-jsonforms-validation/>
            </jsonforms-control>`
        } else {
            control.template = `<jsonforms-control>
               <input type="text" id="${schemaPath}" class="form-control jsf-control-string" ${element.readOnly ? 'readonly' : ''} data-jsonforms-model data-jsonforms-validation/>
            </jsonforms-control>`;
        }

        return control;
    }

    isApplicable(uiElement: IUISchemaElement, subSchema: SchemaElement, schemaPath: string):boolean {
        return uiElement.type == 'Control' && subSchema !== undefined && subSchema.type == 'string';
    }
}

angular.module('jsonforms.renderers.controls.string').run(['RenderService', (RenderService) => {
    RenderService.register(new StringRenderer());
}]);
