
const sessionCredentialsStoreKey = 'sessionCredentials'

const SessionCredentialsStore = {
    clear: () => {
        localStorage.removeItem(sessionCredentialsStoreKey)
    },
    get: (): string | undefined => {
        return localStorage.getItem(sessionCredentialsStoreKey) || undefined
    },

    store: (sessionCredentials: string) => {
        localStorage.setItem(sessionCredentialsStoreKey, sessionCredentials)
    },
}

export default SessionCredentialsStore