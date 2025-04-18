import { UserModel } from "./user";

export type OrganizationMemberRoles = "ORG_ADMINISTRATOR"

export interface OrganizationMemberModel {
    uuid: string;
    isOrganizationOwner: boolean;
    roles: OrganizationMemberRoles[]; // or use a specific enum if roles are known
    user: UserModel;
  }
  