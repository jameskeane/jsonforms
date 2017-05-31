
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
            return fragments.reduce(function (subSchema, fragment) {
                const [frag, index] = PathResolver.innerResolveSchemaFragment(fragment);
                if (index !== null && subSchema[frag].type !== 'array') {
                    throw new Error('Can\'t use index reference for non array schema type.');
                }

                if (frag === '#' && index === null) {
                    return subSchema;
                } else if (index !== null && subSchema[frag].type === 'array') {
                    return subSchema[frag].items;
                } else if (subSchema instanceof Array) {
                    return subSchema.map(function (item) {
                        return item[frag];
                    });
                }
                return subSchema[frag];
            }, schema);
        } catch (err) {
            return undefined;
        }
    };

    lastFragment(schemaPath: string): string {
        let fragments: string[] = PathUtil.normalizeFragments(schemaPath);
        if (fragments.length === 0) return undefined;

        const [frag, index] = PathResolver.innerResolveSchemaFragment(
                fragments[fragments.length - 1]);
        return index !== null ? index : frag;
    }

    resolveToLastModel(instance: any, schemaPath: string): any {
        let fragments: string[] = PathUtil.normalizeFragments(schemaPath);
        const isSingleIndexedRef =
                fragments.length === 1 && /\[\d+\]/.test(fragments[0]);
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
            if (obj instanceof Array) {
                return [obj.map(item => item[frag]), null];
            }

            if (lastIndex) {
                obj[lastIndex] = {};
                obj = obj[lastIndex];
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
