import { useEffect, useState } from "react";
import { OrganizationModel } from "../../../../../types/backend-api/organization";
import { ProjectModel } from "../../../../../types/backend-api/project";
import { useSelectedOrganizationProvider } from "../../hooks";
import { useNavigate, useParams } from "react-router";
import { ProjectService } from "../../../../../api/backend-api/project";

export interface SelectedProject {
    organization: OrganizationModel,
    project: ProjectModel,
}

interface SelectedProjectHookProps {
    autoNavigateOnError?: boolean
}

export default function useSelectedProject(props: SelectedProjectHookProps | undefined = undefined) {
    const { projectProfileName } = useParams()
    const navigate = useNavigate()
    const selectedOrganizationProvider = useSelectedOrganizationProvider()
    const [error, setError] = useState<Error>()
    const [organization, setOrganization] = useState<OrganizationModel>()
    const [project, setProject] = useState<ProjectModel>()
    const [selectedProject, setSelectedProject] = useState<SelectedProject>()

    useEffect(() => {
        selectedOrganizationProvider.selectedOrganizationProvider()
            .then(selectedOrganization => setOrganization(selectedOrganization.organization))
            .catch(e => {
                setError(e as Error)
                navigateWhenConfigured('/')
            })
    }, [])

    useEffect(() => {
        // ignore when organization is undefined
        if (!organization) {
            return
        }

        // catch error when projectProfileName is not defined
        if (!projectProfileName) {
            setError(new Error("Could not get 'projectProfileName' in route"))
            navigateWhenConfigured(`/o/${organization.profileName}/projects`)
            return
        }

        // set the project
        ProjectService.fetchByProfileName(organization.uuid, projectProfileName)
        .then(project => setProject(project))
        .catch(e => {
            setError(e as Error)
            navigateWhenConfigured(`/o/${organization.profileName}/projects`)
        })

    }, [organization])

    useEffect(() => {

        if (!organization || !project) {
            return
        }

        setSelectedProject({
            organization: organization,
            project: project
        })
    }, [organization, project])

    function navigateWhenConfigured(path: string) {
        if (props?.autoNavigateOnError === undefined || props?.autoNavigateOnError === true) {
            navigate(path, { replace: true })
        }
    }

    return {
        selectedProject: selectedProject,
        loading: (!selectedProject && !error),
        error: error
    }

}