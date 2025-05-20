export const PersistentQueryParams = {
    authenticationFlow: ['email', 'redirectTo']
}

export function usePersistentQuery(persistentQueryParams: string[]): URLSearchParams {
    const currentUrlSearchParams = new URLSearchParams(window.location.search)
    const persistentUrlSearchParams = new URLSearchParams()

    persistentQueryParams.forEach(pqp => {
        const currentQueryParameterValue = currentUrlSearchParams.get(pqp)
        if (currentQueryParameterValue) {
            persistentUrlSearchParams.append(pqp, currentQueryParameterValue)
        }
    });

    return persistentUrlSearchParams
}