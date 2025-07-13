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

export function replaceAt(str: string, index: number, replacement: string): string {
  if (index < 0 || index >= str.length) return str; // out of bounds
  return str.slice(0, index) + replacement + str.slice(index + 1);
}