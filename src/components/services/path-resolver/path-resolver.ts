import 'lodash';
import {PathUtil} from '../pathutil';

export class RefResolver  {

    toInstancePath(path: string): string {
        return PathUtil.normalize(path);
    }

    resolveUi(instance: any, uiPath: string): any {
        return this.resolveInstance(instance, uiPath + '/scope/$ref');
    }

    resolveInstance(instance: any, schemaPath: string): any {
        return this.innerResolveInstance(instance, schemaPath, false, false);
    };

    /**
     *
     * @param schema the schema to resolve the path against
     * @param path a schema path
     * @returns {T|*|*}
     */
    resolveSchema(schema: any, path: string): any {
        try {
            let fragments = PathUtil.toPropertyFragments(path);
            let validSubSchemas = fragments.reduce(function (subSchemas, fragment) {
                return subSchemas.reduce((prev, subSchema) => {
                    let combined = PathResolver.combineSchema(subSchema);

                    let anyIndexMatch = fragment.match(/^@(\d+)$/);
                    if (anyIndexMatch) {
                        let anyIndex = parseInt(anyIndexMatch[1], 10);
                        return prev.concat([combined[anyIndex]]);
                    }

                    return prev.concat(combined.reduce((prev, subCombined) => {
                        let inner = PathResolver.innerResolveSchema(subCombined, fragment);
                        if (inner) prev.push(inner);
                        return prev;
                    }, []));
                }, []);

            }, [schema]);

            if (validSubSchemas.length === 1) {
                return validSubSchemas[0];
            } else {
                // ambigous
                throw new Error('Unable to resolve schema \'' + path + '\', schema is ambigous.');
            }
        } catch (err) {
            return undefined;
        }
    }

    private innerResolveSchema(schema: any, fragment: any) {
        try {
            const [frag, index] = PathResolver.innerResolveSchemaFragment(fragment);

            if (index !== null && schema[frag].type !== 'array') {
                throw new Error('Can\'t use index reference for non array schema type.');
            }

            if (frag === '#' && index === null) {
                return schema;
            } else if (index !== null && schema[frag].type === 'array') {
                
                if (schema[frag].items instanceof Array) {
                    if (index === null || index >= schema[frag].items.length) {
                        throw new Error('Invalid index referencing: schema does not define type of item at index.');
                    } else {
                        return schema[frag].items[index];
                    }
                } else {
                    return schema[frag].items;
                }
            } else if (schema instanceof Array) {
                return schema.map(function (item) {
                    return item[frag];
                });
            }
            return schema[frag];
        } catch (err) {
            return undefined;
        }
    }

    combineSchema(schema: any) {
        if (!schema.allOf && !schema.anyOf) return [schema];

        // TODO `additionalProperties`
        let res = _.cloneDeep(schema);

        if ('allOf' in res) {
            delete res.allOf;
            _.merge.apply(_, [res].concat(schema.allOf));
        }

        if ('anyOf' in res) {
            delete res.anyOf;
            return Array.prototype.concat.apply([], schema.anyOf.map((sub) =>
                PathResolver.combineSchema(
                        _.merge(_.cloneDeep(res), sub))));
        }

        if ('oneOf' in res) {
            // TODO
        }

        return PathResolver.combineSchema(res);
    }

    lastFragment(schemaPath: string): string {
        let fragments: string[] = PathUtil.normalizeFragments(schemaPath);
        if (fragments.length === 0) return undefined;

        const [frag, index] = PathResolver.innerResolveSchemaFragment(
                fragments[fragments.length - 1]);
        return index !== null ? index : frag;
    }

    resolveToLastModel(instance: any, schemaPath: string): any {
        let fragments: string[] = PathUtil.normalizeFragments(schemaPath);
        const isSingleIndexedRef = /\[\d+\]/.test(fragments[fragments.length - 1]);
        let fragmentsToObject: string[] = isSingleIndexedRef ?
                fragments : fragments.slice(0, fragments.length - 1);

        return this.innerResolveInstance(instance, fragmentsToObject.join('/'),
                                         true, isSingleIndexedRef);
    }

    /**
     * @param fragment the schema path fragment to check for indexing
     * @returns [string, integer]
     */
    private innerResolveSchemaFragment(fragment: string) {
        const indexTest = fragment.match(/(.+)\[(\d+)\]$/);
        let index = null;
        if (indexTest) {
            fragment = indexTest[1];
            index = parseInt(indexTest[2], 10);
        }
        return [fragment, index];
    }

    private innerResolveInstance(instance: any, schemaPath: string,
                                        createMissing: boolean, isSingleIndexedRef: boolean): any {
        let fragments = PathUtil.toPropertyFragments(this.toInstancePath(schemaPath));
        let [obj, index] = fragments.reduce((currObj, fragment, idx) => {
            let [obj, lastIndex] = currObj;
            const [frag, index] = PathResolver.innerResolveSchemaFragment(fragment);

            if (obj === undefined) {
                return undefined;
            }

            if (lastIndex !== null) {
                obj[lastIndex] = obj[lastIndex] || {};
                obj = obj[lastIndex];
            }

            if (obj instanceof Array) {
                return [obj.map(item => item[frag]), null];
            }

            if (!obj.hasOwnProperty(frag) && createMissing) {
                if (index !== null) {
                    obj[frag] = [];
                } else {
                    obj[frag] = {};
                }
            }

            if (!isSingleIndexedRef && index !== null && !obj[frag][index]) {
                obj[frag][index] = {};
            }

            return [obj[frag], index];
        }, [instance, null]);

        return (!isSingleIndexedRef && index !== null) ? obj[index] : obj;
    };
}
export const PathResolver = new RefResolver();
