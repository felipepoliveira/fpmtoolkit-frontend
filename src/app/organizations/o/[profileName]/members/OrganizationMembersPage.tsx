import { CrownOutlined, DeleteOutlined, LoadingOutlined, MenuOutlined, SendOutlined, UserAddOutlined } from "@ant-design/icons"
import { Badge, Button, Drawer, Dropdown, Empty, Form, Input, Modal, Pagination, Select, Skeleton, Space, Table, Tabs, theme, Tooltip, Typography } from "antd"
import { ItemType } from "antd/es/breadcrumb/Breadcrumb"
import { FormProps, useForm } from "antd/es/form/Form"
import { ColumnType, TablePaginationConfig } from "antd/es/table"
import TabPane from "antd/es/tabs/TabPane"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import ApiError from "../../../../../api/backend-api/api-error"
import { OrganizationMemberService } from "../../../../../api/backend-api/organization-member"
import { OrganizationMemberInviteService } from "../../../../../api/backend-api/organization-member-invite"
import { I18nRegion } from "../../../../../types/backend-api/i18n-region"
import { OrganizationModel } from "../../../../../types/backend-api/organization"
import { OrganizationMemberModel } from "../../../../../types/backend-api/organization-member"
import { OrganizationMemberInviteModel } from "../../../../../types/backend-api/organization-member-invite"
import { PaginationMetadata, parsePaginationMetadataToAntTablePaginationConfig } from "../../../../../types/backend-api/pagination"
import NavigationBar from "../../../../@components/NavigationBar/NavigationBar"
import ReadContainer from "../../../../@components/ReadContainer/ReadContainer"
import { AppContext } from "../../../../App"
import { useSelectedOrganizationProvider } from "../hooks"

// Store the amount of items per page on the tables
const ItemsPerPage = 20

type SelectedTab = 'activeMembers' | 'pendingInvites'

interface SendInviteFormType {
    /**
     * The e-mail of the member
     */
    memberEmail: string,
    /**
     * The invite mail language that will be used in the invite mail.
     */
    inviteMailLanguage: I18nRegion
}

interface ResendInviteFormType {
    /**
     * The invite mail language that will be used in the invite mail.
     */
    mailLanguage: I18nRegion
}

export default function OrganizationMembersPage(): React.ReactNode {
    const appContext = useContext(AppContext)
    const { selectedOrganizationProvider, profileName } = useSelectedOrganizationProvider()

    const [selectedOrganization, setSelectedOrganization] = useState<OrganizationModel | undefined>(undefined)
    const [pageState, setPageState] = useState<'loading' | 'error' | 'ready'>('loading')
    const [selectedTab, setSelectedTab] = useState<SelectedTab>('activeMembers')
    const [loading, setLoading] = useState(false)
    // control the state of the invites table
    const [invites, setInvites] = useState<OrganizationMemberInviteModel[] | undefined>(undefined)
    const [invitesPagination, setInvitesPagination] = useState<PaginationMetadata | undefined>(undefined)
    const [invitesPage, setInvitesPage] = useState<number>(1)
    const [showDeleteInviteModal, setShowDeleteInviteModal] = useState<boolean>(false)
    const [showInviteDrawer, setShowInviteDrawer] = useState<boolean>(false)
    const [showResendInviteDrawer, setShowResendInviteDrawer] = useState<boolean>(false)
    const [selectedInvite, setSelectedInvite] = useState<OrganizationMemberInviteModel | undefined>(undefined)
    // control the state of the members table
    const [members, setMembers] = useState<OrganizationMemberModel[] | undefined>(undefined)
    const [membersPagination, setMembersPagination] = useState<PaginationMetadata | undefined>(undefined)
    const [membersPage, setMembersPage] = useState<number>(1)

    const sendInviteButtonRef = useRef<HTMLButtonElement>(null)
    const [sendInviteForm] = useForm<SendInviteFormType>()
    const [resendInviteForm] = useForm<ResendInviteFormType>()

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

    // Create the invites table pagination config into a React memo
    const invitesTablePaginationConfig : TablePaginationConfig | undefined = useMemo(() => {
        if (invitesPagination === undefined) {
            return undefined
        }

        return parsePaginationMetadataToAntTablePaginationConfig(invitesPagination, invitesPage, (page) => setInvitesPage(page))
    }, [invitesPagination, invitesPage])

    // Create the members table pagination config into a React memo
    const membersTablePaginationConfig : TablePaginationConfig | undefined = useMemo(() => {
        if (membersPagination === undefined) {
            return undefined
        }

        return parsePaginationMetadataToAntTablePaginationConfig(membersPagination, membersPage, (page) => setMembersPage(page))
    }, [membersPagination, membersPage])

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
        OrganizationMemberService.paginationByOrganization(selectedOrganization.uuid, membersPage, ItemsPerPage)
            .then((pagination: PaginationMetadata) => {
                setMembersPagination(pagination)
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })

        // fetch the pagination from the backend api
        OrganizationMemberInviteService.paginationByOrganization(selectedOrganization.uuid, invitesPage, ItemsPerPage)
            .then((pagination: PaginationMetadata) => {
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

        OrganizationMemberService.findByOrganization(selectedOrganization.uuid, membersPage, membersPagination.itemsPerPage)
            .then((members: OrganizationMemberModel[]) => {
                setMembers(members)
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })
    }, [membersPagination, membersPage])

    // fetch the invites of the organization using pagination
    useEffect(() => {
        // do not fetch data until the membersPagination is loaded
        if (invitesPagination === undefined || selectedOrganization === undefined) {
            return
        }

        OrganizationMemberInviteService.findByOrganization(selectedOrganization.uuid, invitesPage, invitesPagination.itemsPerPage)
            .then((invites: OrganizationMemberInviteModel[]) => {
                setInvites(invites)
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })
    }, [invitesPagination, invitesPage])

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
        {
            key: 'inviteActions',
            render: (_, invite: OrganizationMemberInviteModel) => {
                return (
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'resend-invite',
                                    label: 'Reenviar convite',
                                    icon: <SendOutlined />,
                                    onClick: () => {
                                        setSelectedInvite(invite)
                                        setShowResendInviteDrawer(true)
                                    }
                                },
                                {
                                    key: 'delete-invite',
                                    label: 'Deletar convite',
                                    icon: <DeleteOutlined />,
                                    onClick: () => {
                                        setSelectedInvite(invite)
                                        setShowDeleteInviteModal(true)
                                    }
                                }
                            ]
                        }}
                    >
                        <Button icon={<MenuOutlined />} />
                    </Dropdown>
                )
            }
        }
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
            key: 'user.primaryEmail',
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

    function deleteInvite(invite: OrganizationMemberInviteModel) {
        // ignore when no organization is selected
        if (!selectedOrganization || !invites || !invitesPagination) {
            return;
        }

        setLoading(true)
        OrganizationMemberInviteService.remove(selectedOrganization.uuid, invite.uuid)
            .then(() => {


                // update ui (items + pagination)
                setInvites(invites.filter(i => i.uuid !== invite.uuid))
                setInvitesPagination({
                    ...invitesPagination,
                    totalRecords: invitesPagination.totalRecords - 1
                })

                // show success dialog
                appContext.message.success({
                    content: 'Convite removido com sucesso',
                    duration: 3
                })
            })
            .catch(() => {
                // show error dialog
                appContext.message.error({
                    content: 'Ocorreu um erro inesperado ao remover o convite',
                    duration: 3
                })
            })
            .finally(() => {
                setLoading(false)
                setShowDeleteInviteModal(false)
            })
    }

    const resendInvite: FormProps<ResendInviteFormType>['onFinish'] = (values) => {
        // ignore on required fields
        if (!selectedOrganization || !selectedInvite) {
            return
        }
        setLoading(true)
        OrganizationMemberInviteService.resendMail(selectedOrganization.uuid, selectedInvite.uuid, {
            ...values
        })
            .then(() => {
                // show success dialog
                appContext.message.success({
                    content: 'Convite reenviado com sucesso',
                    duration: 3
                })
            })
            .catch(() => {
                // show error dialog
                appContext.message.error({
                    content: 'Ocorreu um erro ao reenviar convite por e-mail',
                    duration: 3
                })
            })
            .finally(() => {
                setLoading(false)
                setShowResendInviteDrawer(false)
            })
    }

    /**
     * Call the back-end API to register a new invite based on the data provided on the invite form
     * @param values 
     * @returns 
     */
    const sendInvite: FormProps<SendInviteFormType>['onFinish'] = (values) => {
        // ignore if no organization is selected
        if (!selectedOrganization || !invites || !invitesPagination) {
            return
        }

        OrganizationMemberInviteService.createNewInvite(selectedOrganization.uuid, values)
            .then(newInvite => {
                setInvites([newInvite, ...invites])
                setInvitesPagination({
                    ...invitesPagination,
                    totalRecords: invitesPagination.totalRecords + 1
                })
                appContext.message.success({
                    content: "Convite enviado com sucesso",
                    key: 'send-invite-success',
                    duration: 3,
                })
            })
            .catch(e => {
                const error = new ApiError(e)
                if (error.errorType === "FORBIDDEN") {
                    appContext.message.error({
                        content: "Você não tem permissão para convidar novos membros",
                        key: 'send-invite-error',
                        duration: 3,
                    })
                }
                else if (error.errorType === "INVALID_EMAIL") {
                    appContext.message.error({
                        content: "O email informado no convite está indisponível para ser convidado para a organização",
                        key: 'send-invite-error',
                        duration: 3,
                    })
                }
                else {
                    appContext.message.error({
                        content: "Ocorreu um erro inesperado ao enviar convite",
                        key: 'send-invite-error',
                        duration: 3,
                    })
                }
            })
            .finally(() => {
                setShowInviteDrawer(false)
            })
    }

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
                                    setTimeout(() => {
                                        setShowInviteDrawer(true)
                                    }, 600);
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
                                    <Table columns={membersTableColumnsDefinition} dataSource={members} pagination={membersTablePaginationConfig}/>
                        }
                    </TabPane>
                    <TabPane tab={<InvitesTabTitleWithCounter />} key="pendingInvites" forceRender={true}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '26px' }}>
                            <Space>
                                <Button icon={<SendOutlined />} type="primary" ref={sendInviteButtonRef} onClick={() => setShowInviteDrawer(true)}>
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
                                    <Table columns={invitesTableColumnsDefinition} dataSource={invites} pagination={{...invitesTablePaginationConfig}} />
                        }
                    </TabPane>
                </Tabs>
            </ReadContainer>
            {/* Send invite drawer */}
            <Drawer open={showInviteDrawer} onClose={() => setShowInviteDrawer(false)} title="Enviar convite" width={600}>
                <Form
                    form={sendInviteForm}
                    layout="vertical"
                    name="send-invite-form"
                    onFinish={sendInvite}
                    autoComplete="off"
                >
                    <Form.Item
                        name="memberEmail"
                        label="E-mail do membro"
                        rules={[
                            {
                                required: true,
                                message: 'Por favor, insira o e-mail do membro',
                            },
                            {
                                type: 'email',
                                message: 'Por favor, insira um e-mail válido',
                            }
                        ]}
                    >
                        <Input placeholder="E-mail do novo membro" />
                    </Form.Item>
                    <Form.Item
                        name="inviteMailLanguage"
                        label="Idioma do convite"
                        rules={[
                            {
                                required: true,
                                message: 'Por favor, selecione o idioma do convite',
                            },
                        ]}
                    >
                        <Select placeholder="Selecione o idioma do convite" options={[
                            { label: 'Português', value: 'PT_BR' },
                        ]} />
                    </Form.Item>
                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="primary" htmlType="submit">
                            Enviar convite
                        </Button>
                    </Form.Item>
                </Form>
            </Drawer>
            {
                (selectedInvite) &&
                <Drawer
                    title={`Reenviar convite?`}
                    open={showResendInviteDrawer}
                    onClose={() => setShowResendInviteDrawer(false)}
                >
                    <Form
                        form={resendInviteForm}
                        layout="vertical"
                        name="resend-invite-form"
                        onFinish={resendInvite}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="mailLanguage"
                            label="Idioma do convite"
                            rules={[
                                {
                                    required: true,
                                    message: 'Por favor, selecione o idioma do convite',
                                },
                            ]}
                        >
                            <Select placeholder="Selecione o idioma do convite" options={[
                                { label: 'Português', value: 'PT_BR' },
                            ]} />
                        </Form.Item>
                        <Form.Item style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="primary" htmlType="submit">
                                Reenviar convite
                            </Button>
                        </Form.Item>
                    </Form>
                </Drawer>
            }
            {
                (selectedInvite) &&
                <Modal
                    loading={loading}
                    title={`Deletar convite?`}
                    open={showDeleteInviteModal}
                    onOk={() => deleteInvite(selectedInvite)}
                    onCancel={() => setShowDeleteInviteModal(false)}
                    key='deleteInviteModal'
                >
                    <Typography>Deseja deletar o convite para <b>{selectedInvite.memberEmail}</b>?</Typography>
                    <Typography>Ao excluir o convite o destinatário não poderá mais ingressar na sua organização através dele.</Typography>
                    <br />
                    <Typography>Deseja prosseguir?</Typography>
                </Modal>
            }

        </>
    )
}