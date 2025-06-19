import { UserModel } from "./user";

/**
 * Store all roles related to user member role
 */
export type OrganizationMemberRole = "ORG_ADMINISTRATOR" | "ORG_MEMBER_ADMINISTRATOR"

/**
 * Represents an representation of the OrganizationMemberRole type with label that can
 * be used to render in the ui
 */
export interface LabeledOrganizationMemberRole {
  /**
   * An description of the role
   */
  description: string,
  /**
   * The role label
   */
  label: string,
  /**
   * The role value
   */
  value: OrganizationMemberRole
}

/**
 * Return a object that represents the OrganizationMemberModel
 * that can be rendered in the UI identified by its role
 * @param role 
 * @returns 
 */
export function getLabeledOrganizationMemberRole(role: OrganizationMemberRole): LabeledOrganizationMemberRole | undefined {
  return getLabeledOrganizationMemberRoles().find(roles => roles.value === role)
}

/**
 * Return an list of objects that represents the OrganizationMemberModel 
 * that can be rendered in the UI
 * @returns 
 */
export function getLabeledOrganizationMemberRoles(): LabeledOrganizationMemberRole[] {
  return [
    {
      label: 'Administrador',
      value: 'ORG_ADMINISTRATOR',
      description: 'Permite que o usuário faça a administração completa da organização'
    },
    {
      label: 'Gestor de membros',
      value: 'ORG_MEMBER_ADMINISTRATOR',
      description: 'Permite que o usuário adicione, altere e remova membros da organização'
    }
  ]
}

/**
 * Represents the OrganizationMember model provided by the back-end API
 */
export interface OrganizationMemberModel {
    uuid: string;
    isOrganizationOwner: boolean;
    roles: OrganizationMemberRole[]; // or use a specific enum if roles are known
    user: UserModel;
  }
  