export interface OrganizationModel {
    /**
     * The presentation name of the organization
     */
    presentationName: string;

    /**
     * The profile name (set by the user). Used to publicly identify the organization
     */
    profileName: string;

    /**
     * The UUID of the organization
     */
    uuid: string;
}