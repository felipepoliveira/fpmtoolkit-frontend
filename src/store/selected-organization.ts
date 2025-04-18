import { OrganizationModel } from "../types/backend-api/organization"

const selectedOrganizationStoreKey = 'selectedOrganization'

const SelectedOrganizationStore = {
    clear: () => {
        localStorage.removeItem(selectedOrganizationStoreKey)
    },
    get: (): OrganizationModel | undefined => {
        const lsItem = localStorage.getItem(selectedOrganizationStoreKey)
        if (lsItem === null) {
            return undefined
        }

        return JSON.parse(lsItem) as OrganizationModel
    },

    store: (org: OrganizationModel) => {
        localStorage.setItem(selectedOrganizationStoreKey, JSON.stringify(org))
    },
}

export default SelectedOrganizationStore