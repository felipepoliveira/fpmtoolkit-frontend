export interface ProjectModel {
  /**
   * The project UUID
   */
  uuid: string;

  /**
   * The name of the project
   */
  name: string;

  /**
   * The profile name of the project
   */
  profileName: string;

  /**
   * When the project was created
   */
  createdAt: string; // ISO datetime string

  /**
   * Store a short description of the project.
   */
  shortDescription: string;

  /**
   * If the project was archived store the date when the action happened
   */
  archivedAt?: string | null; // ISO datetime string or null
}
