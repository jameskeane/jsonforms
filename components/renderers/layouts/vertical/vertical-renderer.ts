///<reference path="../../../references.ts"/>

class VerticalRenderer implements JSONForms.IRenderer {

    priority = 1;

    constructor(private renderService: JSONForms.IRenderService) { }

    render(element: ILayout, subSchema: SchemaElement, schemaPath: string, services: JSONForms.Services): JSONForms.IContainerRenderDescription {
        var renderedElements = JSONForms.RenderDescriptionFactory.renderElements(
            element.elements, this.renderService, services);
        var template = `<layout class="jsf-vertical-layout">
              <fieldset>
                <dynamic-widget ng-repeat="child in element.elements" element="child">
                </dynamic-widget>
             </fieldset>
            </layout>`;

        return {
            "type": "Layout",
            "elements": renderedElements,
            "size": 99,
            "template": template
        };
    }

    isApplicable(uiElement: IUISchemaElement, jsonSchema: SchemaElement, schemaPath) :boolean {
        return uiElement.type == "VerticalLayout";
    }
}

angular.module('jsonforms.renderers.layouts.vertical').run(['RenderService', (RenderService) => {
    RenderService.register(new VerticalRenderer(RenderService));
}]);