import { SelectedOrganization } from "../app/o/[profileName]/hooks"

const selectedOrganizationStoreKey = 'selectedOrganization'

const SelectedOrganizationStore = {
    clear: () => {
        localStorage.removeItem(selectedOrganizationStoreKey)
    },
    get: (): SelectedOrganization  | undefined => {
        const lsItem = localStorage.getItem(selectedOrganizationStoreKey)
        if (lsItem === null) {
            return undefined
        }

        return JSON.parse(lsItem) as SelectedOrganization
    },

    store: (org: SelectedOrganization) => {
        localStorage.setItem(selectedOrganizationStoreKey, JSON.stringify(org))
    },
}

export default SelectedOrganizationStore