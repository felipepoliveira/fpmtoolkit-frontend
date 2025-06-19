export function assertSafeRedirectUrl(inputRedirectUrl: string | undefined | null, safeAlternative: string) {
    if (!inputRedirectUrl || !inputRedirectUrl.startsWith('/')) {
        return safeAlternative
    }

    return inputRedirectUrl
}

export function getInitials(input: string): string {
    const splittedWords = input.trim().split(' ')
    const secondWordHasInitials = (splittedWords.length > 1 && splittedWords[1].trim().length > 1)
    if (secondWordHasInitials) {
        return splittedWords[0].charAt(0) + splittedWords[1].trim().charAt(0)
    }

    return splittedWords[0].charAt(0)
}