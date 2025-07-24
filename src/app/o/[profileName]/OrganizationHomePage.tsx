import { LoadingOutlined, ProjectOutlined, TeamOutlined } from "@ant-design/icons"
import { Layout, Menu, MenuProps, theme, Typography } from "antd"
import Sider from "antd/es/layout/Sider"
import { Content } from "antd/es/layout/layout"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { OrganizationModel } from "../../../types/backend-api/organization"
import NavigationBar from "../../@components/NavigationBar/NavigationBar"
import ReadContainer from "../../@components/ReadContainer/ReadContainer"
import { SelectedOrganization, useSelectedOrganizationProvider } from "./hooks"

export default function OrganizationHomePage(): React.ReactNode {
    const { selectedOrganizationProvider, profileName } = useSelectedOrganizationProvider()
    const navigate = useNavigate()
    const [pageState, setPageState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationModel | undefined>(undefined)

    useEffect(() => {
        selectedOrganizationProvider()
            .then((selectedOrganization: SelectedOrganization) => {
                setSelectedOrganization(selectedOrganization.organization)
                setPageState('ready')
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })
    }, [])

    // theme style tokens
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // sider menu items
    const siderMenuItems: MenuProps['items'] = [
        { key: "/projects", label: "Projetos", onClick: () => navigate(`/o/${profileName}/projects`), icon: <ProjectOutlined /> },
        // { key: "/performance-analytics", label: "Performance", onClick: () => navigate(`/o/${profileName}/performance-analytics`), icon: <DashboardOutlined /> },
        { key: "/members", label: "Membros da organização", onClick: () => navigate(`/o/${profileName}/members`), icon: <TeamOutlined /> },
        // { key: "/configurations", label: "Configurações", onClick: () => navigate(`/o/${profileName}/configurations`), icon: <SettingOutlined /> },
    ]

    return (
        <div>
            {
                (pageState === 'loading') ?
                    <LoadingOutlined />
                    :
                    (pageState === 'error') ?
                        <div>Could not load the organization</div>
                        :
                        (pageState === 'ready' && selectedOrganization) ?
                            <>
                                <NavigationBar title={selectedOrganization.presentationName} returnUrl="/" />
                                <Layout
                                    style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
                                >
                                    <Sider style={{ background: colorBgContainer }} width={320}>
                                        <Menu
                                            mode="inline"
                                            defaultSelectedKeys={['1']}
                                            defaultOpenKeys={['sub1']}
                                            style={{ minHeight: '50%' }}
                                            items={siderMenuItems}
                                        />
                                    </Sider>
                                    <Content style={{ padding: '0 24px', minHeight: 'calc(100vh - 210px + 64px)' }}>
                                        <ReadContainer>
                                            <Typography>Olá mundo!</Typography>
                                        </ReadContainer>
                                    </Content>
                                </Layout>
                            </>
                            :
                            <></>
            }
        </div>
    )
}