import { Avatar, Layout, Menu, MenuProps, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { JSX, useContext } from "react";
import { Link, useNavigate } from "react-router";
import { OrganizationModel } from "../types/backend-api/organization";
import { AuthenticatedAppContext } from "./AuthenticatedApp";
import { getInitials } from "../commons/string";

export default function Home(): JSX.Element {
    const authenticatedAppContext = useContext(AuthenticatedAppContext)
    const navigate = useNavigate()
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken()

    // Store the organization menu items
    const selectOrganizationMenuItems: MenuProps['items'] = authenticatedAppContext.organizations.map(o => {
        return {
            key: o.uuid,
            label: o.presentationName,
            onClick: () => selectOrganization(o),
            icon: <Avatar>{getInitials(o.presentationName)}</Avatar>
        }
    })

    function selectOrganization(org: OrganizationModel) {
        navigate(`/o/${org.profileName}`)
    }

    return (
        <Layout
            style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }}
        >
            <Sider style={{ background: colorBgContainer }} width={400}>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    style={{ minHeight: '50%' }}
                    items={selectOrganizationMenuItems}
                />
                <Link to='/organizations/create'>Criar nova organização</Link>
            </Sider>
            <Content style={{ padding: '0 24px', minHeight: 'calc(100vh - 210px + 64px)' }}>

            </Content>
        </Layout>
    )
}