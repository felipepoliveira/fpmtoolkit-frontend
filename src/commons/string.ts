export function assertSafeRedirectUrl(inputRedirectUrl: string | undefined | null, safeAlternative: string) {
    if (!inputRedirectUrl || !inputRedirectUrl.startsWith('/')) {
        return safeAlternative
    }

    return inputRedirectUrl
}