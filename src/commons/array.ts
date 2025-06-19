export function mapConditionally<T>(source: T[], findCallback: (e: T) => boolean, elementToReplace: T): T[] {
    return source.map(e => findCallback(e) ? elementToReplace : e);
}