/**
 * 
 * @param utcMillis 
 * @returns 
 */
export function dateFrom(input: number | undefined): Date | undefined {
    if (input === undefined) {
        return undefined
    }
    return new Date(input)
}