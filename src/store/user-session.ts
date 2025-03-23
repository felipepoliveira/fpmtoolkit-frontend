import { UserSession } from "../app/types"

const userSessionStoreKey = 'userSession'

const UserSessionStore = {
    clear: () => {
        localStorage.removeItem(userSessionStoreKey)
    },
    get: (): UserSession | undefined => {
        const userSession = localStorage.getItem(userSessionStoreKey)
        if (userSession) {
            return JSON.parse(userSession)
        }
        return undefined
    },

    store: (userSession: UserSession) => {
        localStorage.setItem(userSessionStoreKey, JSON.stringify(userSession))
    },
}

export default UserSessionStore