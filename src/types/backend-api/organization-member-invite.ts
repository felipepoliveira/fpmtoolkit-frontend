import { OrganizationModel } from "./organization";

export interface OrganizationMemberInviteModel {
    createdAt: string; // ISO 8601 date-time string
    memberEmail: string;
    uuid: string; // UUID string
    organization: OrganizationModel; // Store data about the organization
  }