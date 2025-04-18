import { CrownOutlined, LoadingOutlined, SendOutlined, UserAddOutlined } from "@ant-design/icons"
import { Badge, Button, Empty, Skeleton, Space, Table, Tabs, theme, Tooltip } from "antd"
import { ItemType } from "antd/es/breadcrumb/Breadcrumb"
import { ColumnType } from "antd/es/table"
import TabPane from "antd/es/tabs/TabPane"
import { useEffect, useMemo, useRef, useState } from "react"
import { OrganizationMemberService } from "../../../../../api/backend-api/organization-member"
import { OrganizationModel } from "../../../../../types/backend-api/organization"
import { OrganizationMemberModel } from "../../../../../types/backend-api/organization-member"
import { Pagination } from "../../../../../types/backend-api/pagination"
import NavigationBar from "../../../../@components/NavigationBar/NavigationBar"
import ReadContainer from "../../../../@components/ReadContainer/ReadContainer"
import { useSelectedOrganizationProvider } from "../hooks"
import { OrganizationMemberInviteService } from "../../../../../api/backend-api/organization-member-invite"
import { OrganizationMemberInviteModel } from "../../../../../types/backend-api/organization-member-invite"

type SelectedTab = 'activeMembers' | 'pendingInvites'

export default function OrganizationMembersPage(): React.ReactNode {
    const { selectedOrganizationProvider, profileName } = useSelectedOrganizationProvider()

    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationModel | undefined>(undefined)
    const [pageState, setPageState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [selectedTab, setSelectedTab] = useState<SelectedTab>('activeMembers')
    const [invites, setInvites] = useState<OrganizationMemberInviteModel[] | undefined>(undefined)
    const [invitesPagination, setInvitesPagination] = useState<Pagination | undefined>(undefined)
    const [invitesPage, setInvitesPage] = useState<number>(1)
    const [members, setMembers] = useState<OrganizationMemberModel[] | undefined>(undefined)
    const [membersPagination, setMembersPagination] = useState<Pagination | undefined>(undefined)
    const [membersPage, setMembersPage] = useState<number>(1)

    const sendInviteButtonRef = useRef<HTMLButtonElement>(null)

    // theme style tokens
    const {
        token: { colorPrimary },
    } = theme.useToken()

    // the breadcrumbs that will be rendered in the navigation bar
    const breadcrumbs: ItemType[] = useMemo(() => {

        // if the organization was not loaded yet, will not render the breadcrumbs
        if (selectedOrganization === undefined) {
            return []
        }

        return [
            { title: selectedOrganization.presentationName, key: `/o/${selectedOrganization.profileName}` },
        ]

    }, [selectedOrganization])

    // fetch the selected organization using provider hook
    useEffect(() => {
        selectedOrganizationProvider()
            .then((organization: OrganizationModel) => {
                setSelectedOrganization(organization)
                setPageState('ready')
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })
    }, [])

    // fetch pagination metadata of all organization members of the given organization
    useEffect(() => {

        // if the selected organization was not loaded yet, will not fetch the members
        if (selectedOrganization === undefined) {
            return
        }

        // fetch the pagination from the backend api
        OrganizationMemberService.paginationByOrganization(selectedOrganization.uuid, membersPage)
        .then((pagination: Pagination) => {
            setMembersPagination(pagination)
        })
        .catch((error: Error) => {
            console.error(error)
            setPageState('error')
        })

        // fetch the pagination from the backend api
        OrganizationMemberInviteService.paginationByOrganization(selectedOrganization.uuid, invitesPage)
        .then((pagination: Pagination) => {
            setInvitesPagination(pagination)
        })
        .catch((error: Error) => {
            console.error(error)
            setPageState('error')
        })

    }, [selectedOrganization])

    // fetch the members of the organization using pagination
    useEffect(() => {
        // do not fetch data until the membersPagination is loaded
        if (membersPagination === undefined || selectedOrganization === undefined) {
            return
        }

        OrganizationMemberService.findByOrganization(selectedOrganization.uuid, membersPage)
        .then((members: OrganizationMemberModel[]) => {
            setMembers(members)
        })
        .catch((error: Error) => {
            console.error(error)
            setPageState('error')
        })
    }, [membersPagination])

    // fetch the invites of the organization using pagination
    useEffect(() => {
        // do not fetch data until the membersPagination is loaded
        if (invitesPagination === undefined || selectedOrganization === undefined) {
            return
        }

        OrganizationMemberInviteService.findByOrganization(selectedOrganization.uuid, membersPage)
        .then((invites: OrganizationMemberInviteModel[]) => {
            setInvites(invites)
        })
        .catch((error: Error) => {
            console.error(error)
            setPageState('error')
        })
    }, [invitesPagination])

    /**
     * Return a element that will be rendered in the active members tab, showing the number of active members in the organization.
     * @returns 
     */
    function ActiveMembersTabTitleWithCounter(): React.ReactElement {
        if (membersPagination === undefined) {
            return <LoadingOutlined />
        }
        return (
            <Badge count={membersPagination.totalRecords} offset={[10, 0]} size="small" color={colorPrimary}>
                Membros ativos
            </Badge>
        )
    }

    function InvitesTabTitleWithCounter(): React.ReactElement {
        if (invitesPagination === undefined) {
            return <LoadingOutlined />
        }
        return (
            <Badge count={invitesPagination.totalRecords} offset={[10, 0]} size="small">
                Convites abertos
            </Badge>
        )
    }

    // invites table column definition
    const invitesTableColumnsDefinition: ColumnType<OrganizationMemberInviteModel>[] = [
        {
            title: 'Email',
            dataIndex: 'memberEmail',
            key: 'memberEmail',
            render: (_, record) => record.memberEmail,
        },
        {
            title: 'Data de criação',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (_, record) => new Date(record.createdAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        },
    ]

    // members table column definition
    const membersTableColumnsDefinition: ColumnType<OrganizationMemberModel>[] = [
        {
            title: 'Nome',
            dataIndex: 'user.presentationName',
            key: 'user.presentationName',
            render: (_, record) => record.user.presentationName,
        },
        {
            title: 'Email',
            dataIndex: 'user.primaryEmail',
            render: (_, record) => record.user.primaryEmail,
        },
        {
            title: 'Informações',
            key: 'memberType',
            render: (_, record: OrganizationMemberModel) => {
                return (
                    <Tooltip title="Dono da organização">
                        <CrownOutlined style={{ fontSize: '20px' }} />
                    </Tooltip>
                )
            }
        }
    ]

    return (
        <>
            <NavigationBar title="Membros da organização" returnUrl={`/o/${profileName}`} breadcrumbs={breadcrumbs} />
            <ReadContainer style={{ minHeight: 'calc(100vh - 210px + 64px)' }}>
                <Tabs
                    activeKey={selectedTab}
                    onChange={(tab) => setSelectedTab(tab as SelectedTab)}
                >
                    <TabPane tab={<ActiveMembersTabTitleWithCounter />} key="activeMembers" forceRender={true}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '26px' }}>
                            <Space>
                                <Button icon={<UserAddOutlined />} type="primary" onClick={() => {
                                    setSelectedTab('pendingInvites')
                                    sendInviteButtonRef.current?.focus()
                                }}>
                                    Adicionar membro
                                </Button>
                            </Space>
                        </div>
                        {
                            (members === undefined || membersPagination === undefined)
                                ?
                                <Skeleton />
                                :
                                (membersPagination.totalRecords === 0)
                                    ?
                                    <Empty description="Nenhum membro encontrado" />
                                    :
                                    <Table columns={membersTableColumnsDefinition} dataSource={members} />
                        }
                    </TabPane>
                    <TabPane tab={<InvitesTabTitleWithCounter />} key="pendingInvites" forceRender={true}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '26px' }}>
                            <Space>
                                <Button icon={<SendOutlined />} type="primary" ref={sendInviteButtonRef}>
                                    Enviar convite
                                </Button>
                            </Space>
                        </div>
                        {
                            (invitesPagination === undefined)
                                ?
                                <Skeleton />
                                :
                                (invitesPagination.totalRecords === 0)
                                    ?
                                    <Empty description="Nenhum convite pendente ativo" />
                                    :
                                    <Table columns={invitesTableColumnsDefinition} dataSource={invites} />
                        }
                    </TabPane>
                </Tabs>
            </ReadContainer>
        </>
    )
}