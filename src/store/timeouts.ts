import { useEffect, useState } from "react"

const timeoutsStoreKey = 'timeouts'

interface Timeouts {
    /**
     * Used for Backend API: [POST]/api/auth/send-primary-email-confirmation-mail
     */
    sendPrimaryEmailConfirmationMail?: number,
    /**
     * Used for Backend API: [POST]/api/auth/send-primary-email-change-mail
     */
    sendPrimaryEmailChangeMail?: number,
}

const TimeoutsStore = {
    clear: () => {
        localStorage.removeItem(timeoutsStoreKey)
    },
    get: (): Timeouts | undefined => {
        const userSession = localStorage.getItem(timeoutsStoreKey)
        if (userSession) {
            return JSON.parse(userSession)
        }
        return undefined
    },

    put: (key: keyof Timeouts, value: number) => {
        const valueFromStore = TimeoutsStore.get() || { }
        valueFromStore[key] = value
        TimeoutsStore.store(valueFromStore)
    },

    store: (userSession: Timeouts) => {
        localStorage.setItem(timeoutsStoreKey, JSON.stringify(userSession))
    },
}

export function useTimeoutsStore() {

    const [timeouts, setTimeouts] = useState<Timeouts>(TimeoutsStore.get() || {})

    useEffect(() => {
        TimeoutsStore.store(timeouts)
    }, [timeouts])

    return {timeouts, setTimeouts}

}

export default TimeoutsStore