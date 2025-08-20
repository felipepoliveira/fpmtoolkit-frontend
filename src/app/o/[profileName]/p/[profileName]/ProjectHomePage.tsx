import { LoadingOutlined } from "@ant-design/icons"
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb"
import { useMemo } from "react"
import NavigationBar from "../../../../@components/NavigationBar/NavigationBar"
import useSelectedProject from "./hooks"

export default function ProjectHomePage() {

    const { selectedProject } = useSelectedProject()

    const breadcrumbs: BreadcrumbItemType[] = useMemo(() => {
        if (!selectedProject) {
            return []
        }

        return [
            { title: selectedProject.organization.presentationName }
        ]
    }, [selectedProject])


    // Render loading if selected project is not returned
    if (!selectedProject) {
        return <LoadingOutlined />
    }

    return (
        <>
            <NavigationBar title={selectedProject.project.name} breadcrumbs={breadcrumbs} />
            {selectedProject.project.name}
        </>
    )
}