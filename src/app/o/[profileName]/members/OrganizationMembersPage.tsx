import { CrownOutlined, DeleteOutlined, EditOutlined, LoadingOutlined, MenuOutlined, SaveOutlined, SendOutlined, UserAddOutlined } from "@ant-design/icons"
import { Badge, Button, CheckboxChangeEvent, Col, Divider, Drawer, Dropdown, Empty, Form, Input, Modal, Row, Select, Skeleton, Space, Table, Tabs, theme, Tooltip, Typography } from "antd"
import { ItemType } from "antd/es/breadcrumb/Breadcrumb"
import { FormProps, useForm } from "antd/es/form/Form"
import { ColumnType, TablePaginationConfig } from "antd/es/table"
import TabPane from "antd/es/tabs/TabPane"
import Paragraph from "antd/es/typography/Paragraph"
import Title from "antd/es/typography/Title"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import ApiError from "../../../../api/backend-api/api-error"
import { OrganizationMemberService } from "../../../../api/backend-api/organization-member"
import { OrganizationMemberInviteService } from "../../../../api/backend-api/organization-member-invite"
import { mapConditionally as conditionalMap, mapConditionally } from "../../../../commons/array"
import { I18nRegion } from "../../../../types/backend-api/i18n-region"
import { getLabeledOrganizationMemberRole, getLabeledOrganizationMemberRoles, OrganizationMemberModel, OrganizationMemberRole } from "../../../../types/backend-api/organization-member"
import { OrganizationMemberInviteModel } from "../../../../types/backend-api/organization-member-invite"
import { PaginationMetadata, parsePaginationMetadataToAntTablePaginationConfig } from "../../../../types/backend-api/pagination"
import DebouncedSearch from "../../../@components/DebouncedInput/DebounceSearch"
import NavigationBar from "../../../@components/NavigationBar/NavigationBar"
import ReadContainer from "../../../@components/ReadContainer/ReadContainer"
import RoleCheckbox from "../../../@components/RoleCheckbox/RoleCheckbox"
import { AppContext } from "../../../App"
import { AuthenticatedAppContext } from "../../../AuthenticatedApp"
import { useConditionalFeedbackText } from "../../../hooks"
import { SelectedOrganization, useSelectedOrganizationProvider } from "../hooks"

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
    const authAppContext = useContext(AuthenticatedAppContext)
    const { userData } = authAppContext.authenticatedUser()
    const { selectedOrganizationProvider, profileName, clearSelectedOrganizationCache } = useSelectedOrganizationProvider()

    const [selectedOrganization, setSelectedOrganization] = useState<SelectedOrganization | undefined>(undefined)
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
    const [showSetOrganizationMemberOwnerModal, setShowSetOrganizationMemberOwnerModal] = useState(false)
    // control the state of the members table
    const [members, setMembers] = useState<OrganizationMemberModel[] | undefined>(undefined)
    const [membersQueryField, setMembersQueryField] = useState("")
    const [membersPagination, setMembersPagination] = useState<PaginationMetadata | undefined>(undefined)
    const [membersPage, setMembersPage] = useState<number>(1)
    const [selectedMember, setSelectedMember] = useState<OrganizationMemberModel | undefined>(undefined)
    const [showManageMemberDrawer, setShowManageMemberDrawer] = useState<boolean>(false)
    const [showDeleteMemberModal, setShowDeleteMemberModal] = useState<boolean>(false)

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
            { title: selectedOrganization.organization.presentationName, key: `/o/${selectedOrganization.organization.profileName}` },
        ]

    }, [selectedOrganization])

    const addMemberRoleFeedback = useConditionalFeedbackText({
        condition: authAppContext.hasRole(["ROLE_ORG_ADMINISTRATOR"]),
        authorizedText: "Envia um novo convite para adicionar um membro na organização",
        forbiddenText: "Você não tem permissão para adicionar novos membros na organização"
    })

    const manageMemberRoleFeedback = useConditionalFeedbackText({
        condition: authAppContext.hasRole(["ROLE_ORG_MEMBER_ADMINISTRATOR"]),
        forbiddenText: "Você não tem permissão para gerenciar membros na organização"
    })

    // Create the invites table pagination config into a React memo
    const invitesTablePaginationConfig: TablePaginationConfig | undefined = useMemo(() => {
        if (invitesPagination === undefined) {
            return undefined
        }

        return parsePaginationMetadataToAntTablePaginationConfig(invitesPagination, invitesPage, (page) => setInvitesPage(page))
    }, [invitesPagination, invitesPage])


    // Create the members table pagination config into a React memo
    const membersTablePaginationConfig: TablePaginationConfig | undefined = useMemo(() => {
        if (membersPagination === undefined) {
            return undefined
        }

        return parsePaginationMetadataToAntTablePaginationConfig(membersPagination, membersPage, (page) => setMembersPage(page))
    }, [membersPagination, membersPage])

    // fetch the selected organization using provider hook
    useEffect(() => {
        selectedOrganizationProvider()
            .then((selectedOrganization: SelectedOrganization) => {
                setSelectedOrganization(selectedOrganization)
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
        OrganizationMemberService.paginationByOrganization(selectedOrganization.organization.uuid, membersPage, ItemsPerPage)
            .then((pagination: PaginationMetadata) => {
                setMembersPagination(pagination)
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })

        // fetch the pagination from the backend api
        OrganizationMemberInviteService.paginationByOrganization(selectedOrganization.organization.uuid, invitesPage, ItemsPerPage)
            .then((pagination: PaginationMetadata) => {
                setInvitesPagination(pagination)
            })
            .catch((error: Error) => {
                console.error(error)
                setPageState('error')
            })

    }, [selectedOrganization, membersQueryField])

    // fetch the members of the organization using pagination
    useEffect(() => {
        // do not fetch data until the membersPagination is loaded
        if (membersPagination === undefined || selectedOrganization === undefined) {
            return
        }

        OrganizationMemberService.findByOrganization(selectedOrganization.organization.uuid, membersPage, membersPagination.itemsPerPage, membersQueryField)
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

        OrganizationMemberInviteService.findByOrganization(selectedOrganization.organization.uuid, invitesPage, invitesPagination.itemsPerPage)
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
                    <>
                        {
                            (record.isOrganizationOwner)
                                ?
                                <Tooltip title="Dono da organização">
                                    <CrownOutlined style={{ fontSize: '20px' }} />
                                </Tooltip>
                                :
                                <></>
                        }
                    </>
                )
            }
        },
        {
            key: 'memberActions',
            render: (_, member: OrganizationMemberModel) => {
                return (
                    <Tooltip title={manageMemberRoleFeedback.text}>
                        <Dropdown
                            disabled={!manageMemberRoleFeedback.hasRole}
                            menu={{
                                items: [
                                    {

                                        disabled: (member.isOrganizationOwner), // can't mess up with this guy
                                        key: 'manage-member',
                                        label: 'Gerenciar membro',
                                        icon: <EditOutlined />,
                                        onClick: () => {
                                            setSelectedMember(member)
                                            setShowManageMemberDrawer(true)
                                        }
                                    },
                                    {

                                        disabled: (member.isOrganizationOwner), // can't mess up with this guy
                                        key: 'delete-member',
                                        label: 'Remover membro',
                                        icon: <DeleteOutlined />,
                                        onClick: () => {
                                            setSelectedMember(member)
                                            setShowDeleteMemberModal(true)
                                        }
                                    },
                                    {

                                        disabled: (member.isOrganizationOwner || !selectedOrganization?.authenticatedUserMembership.isOrganizationOwner), // only the organization owner can do that
                                        key: 'set-to-owner',
                                        label: 'Definir como dono da organização',
                                        icon: <CrownOutlined />,
                                        onClick: () => {
                                            setSelectedMember(member)
                                            checkForStlBeforeOpeningSetOrganizationOwnerModal()
                                        }
                                    },
                                ]
                            }}
                        >
                            <Button icon={<MenuOutlined />} />
                        </Dropdown>
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
        OrganizationMemberInviteService.remove(selectedOrganization.organization.uuid, invite.uuid)
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

    function checkForStlBeforeOpeningSetOrganizationOwnerModal() {
        authAppContext.checkMinimumStl("ROLE_STL_MOST_SECURE", (event) => {
            if (event.hasRequiredStl) {
                setShowSetOrganizationMemberOwnerModal(true)
            }
        })
    }

    const resendInvite: FormProps<ResendInviteFormType>['onFinish'] = (values) => {
        // ignore on required fields
        if (!selectedOrganization || !selectedInvite) {
            return
        }
        setLoading(true)
        OrganizationMemberInviteService.resendMail(selectedOrganization.organization.uuid, selectedInvite.uuid, {
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

        OrganizationMemberInviteService.createNewInvite(selectedOrganization.organization.uuid, values)
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

    function DeleteMemberModal(): React.ReactElement {

        /**
         * Remove a organization member from the organization
         * @param memberToDelete 
         */
        function deleteMember(memberToDelete: OrganizationMemberModel) {
            setLoading(true)


            // organization must be selected so the operation can occur
            if (!selectedOrganization || !members || !membersPagination) {
                return
            }

            OrganizationMemberService.removeFromOrganization(selectedOrganization.organization.uuid, memberToDelete.uuid)
                .then(removedMember => {
                    appContext.message.success({
                        content: `Membro ${memberToDelete.user.presentationName} removido com sucesso`,
                        duration: 2
                    })

                    // update the UI removing the removed member
                    setMembersPagination({
                        ...membersPagination,
                        currentPage: membersPagination.currentPage - 1
                    })
                    setMembers(members.filter(m => m.uuid !== removedMember.uuid))
                    setShowDeleteMemberModal(false)
                })
                .catch(e => {
                    console.error(e)
                    appContext.message.error({
                        content: "Um erro inesperado ocorreu ao tentar remover membro da organização",
                        duration: 3
                    })

                })
                .finally(() => {
                    setLoading(false)
                })
        }

        return (
            <>
                {
                    (selectedMember)
                        ?
                        <Modal
                            loading={loading}
                            title={`Remover membro da organização?`}
                            open={showDeleteMemberModal}
                            onOk={() => deleteMember(selectedMember)}
                            onCancel={() => setShowDeleteMemberModal(false)}
                            key='deleteMemberModal'
                        >
                            <Typography>Deseja remover o membro <b>{selectedMember.user.presentationName}</b> da organização?</Typography>
                        </Modal>
                        :
                        <></>
                }

            </>
        )
    }

    function ManageOrganizationMemberDrawer(): React.ReactNode {

        // States
        const [selectedRoles, setSelectedRoles] = useState<OrganizationMemberRole[]>((selectedMember) ? selectedMember.roles : [])
        const [loading, setLoading] = useState(false)

        // Get the labeled organization administrator role so it can be managed in a different way
        const labeledAdministratorRole = getLabeledOrganizationMemberRole("ORG_ADMINISTRATOR") || {
            description: "Manage the entire organization",
            label: 'Administrator',
            value: 'ORG_ADMINISTRATOR'
        }

        // Get all others roles besides the ADMINISTRATOR one
        const labeledOrganizationMemberRoles = getLabeledOrganizationMemberRoles().filter(r => r.value !== 'ORG_ADMINISTRATOR')


        function onRoleSelectionChange(event: CheckboxChangeEvent) {
            const changedRole = event.target.value as OrganizationMemberRole

            const shouldAddRole = selectedRoles.indexOf(changedRole) < 0

            // special things happen when selecting ADMINISTRATOR role...
            if (changedRole === 'ORG_ADMINISTRATOR') {

                // if ADMINISTRATOR was included, add all other ones
                if (shouldAddRole) {
                    setSelectedRoles(["ORG_ADMINISTRATOR", ...labeledOrganizationMemberRoles.map(l => l.value)])
                }
                // if ADMINISTRATOR was unchecked, uncheck all other ones
                else {
                    setSelectedRoles([])
                }
            }
            // if the changed role is not ADMINISTRATOR but it is checked, ignore all changes
            else if (selectedRoles.indexOf('ORG_ADMINISTRATOR') >= 0) {
                return
            }
            // otherwise, works like expected... add it if not exists and remove it otherwise
            else {
                // if it is not the ADMINISTRATOR role and ADMINISTRATOR is not checked, works like expected...
                if (shouldAddRole) {
                    setSelectedRoles([...selectedRoles, changedRole])
                }
                else {
                    setSelectedRoles(selectedRoles.filter(sr => sr !== changedRole))
                }
            }

        }

        function updateOrganizationMember() {
            if (!selectedOrganization || !selectedMember || !members) {
                return
            }
            setLoading(true)
            OrganizationMemberService.update(selectedOrganization.organization.uuid, selectedMember.uuid, {
                roles: selectedRoles
            })
                .then((updatedMember) => {
                    appContext.message.success({
                        content: 'Alterações realizadas com sucesso',
                        duration: 2
                    })

                    setMembers(conditionalMap(members, (m) => m.uuid === updatedMember.uuid, updatedMember))
                    setSelectedMember(updatedMember)
                })
                .catch(e => {
                    console.error(e)
                    appContext.message.error({
                        content: 'Um erro inesperado ocorreu ao realizar alterações',
                        duration: 3
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        }


        return (
            (selectedMember) &&
            <Drawer
                onClose={() => setShowManageMemberDrawer(false)}
                open={showManageMemberDrawer}
                title={`Gerenciar ${selectedMember.user.presentationName}`}
                width='520px'
            >
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                    <Button icon={<SaveOutlined />} type="primary"
                        loading={loading}
                        onClick={updateOrganizationMember}>
                        Salvar alterações
                    </Button>
                </div>
                <Divider />
                <Title level={5}>Permissões de membro na organização</Title>
                {/* The administrator role checkbox should be managed individually for better UX */}
                <RoleCheckbox checked={selectedRoles.indexOf(labeledAdministratorRole.value) >= 0} source={labeledAdministratorRole} style={{ marginTop: '12px' }} onChange={onRoleSelectionChange} />
                <br />
                {/* Render all other roles */}
                {
                    labeledOrganizationMemberRoles.map(r => (
                        <>
                            <RoleCheckbox source={r} style={{ marginTop: '12px' }}
                                checked={selectedRoles.indexOf(r.value) >= 0}
                                onChange={onRoleSelectionChange}
                            />
                            <br />
                        </>
                    ))
                }
            </Drawer>
        )
    }

    function SetOrganizationMemberOwnerModal(): React.ReactElement {
        // Render nothing if required state is undef
        if (!selectedMember || !selectedOrganization) {
            return <></>
        }

        const [loading, setLoading] = useState(false)

        function changeOrganizationOwner() {
            // do nothing if the selected mem
            if (!selectedMember || !selectedOrganization || !members) {
                return
            }

            setLoading(false)
            OrganizationMemberService.changeOrganizationOwner(selectedOrganization.organization.uuid, selectedMember.uuid)
                .then(updatedMember => {

                    let newMembersList = [...members]

                    // if the owner is on the list remove the organization owner mark on it
                    const ownerOnTheList = newMembersList.find(m => m.isOrganizationOwner)
                    if (ownerOnTheList) {
                        newMembersList = mapConditionally(newMembersList, (m) => m.isOrganizationOwner, { ...ownerOnTheList, isOrganizationOwner: false })
                    }
                    // set the target member as the organization owner
                    newMembersList = mapConditionally(newMembersList, (m) => m.uuid === updatedMember.uuid, updatedMember)

                    // update state, close modal, show feedback
                    setMembers(newMembersList)
                    setShowSetOrganizationMemberOwnerModal(false)

                    appContext.message.success({
                        content: 'Dono da organização alterado com sucesso',
                        duration: 2
                    })
                    clearSelectedOrganizationCache()

                })
                .catch(e => {
                    console.error(e)
                    appContext.message.error({
                        content: 'Ocorreu um erro inesperado ao trocar dono da organização',
                        duration: 3
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        }

        return (
            <Modal
                open={showSetOrganizationMemberOwnerModal}
                okText='Eu entendo o risco'
                cancelText='Cancelar'
                onCancel={() => setShowSetOrganizationMemberOwnerModal(false)}
                onOk={changeOrganizationOwner}
                loading={loading}
            >
                <Title level={4}>Trocar dono da organização</Title>
                <Paragraph>
                    Ao trocar o dono da organização você deixará de ter o controle <b>total</b> dela passando-o para o usuário
                    <b>{selectedMember.user.presentationName} ({selectedMember.user.primaryEmail})</b>
                </Paragraph>
                <Paragraph>
                    Além disso, seu usuário receberá automaticamente a permissão 'Administrador' para que ainda possa
                    realizar operações de gestão na organização utilizando sua conta.
                </Paragraph>
                <Paragraph>Tem certeza que deseja prosseguir?</Paragraph>
            </Modal>
        )
    }

    return (
        <>
            <NavigationBar title="Membros da organização" returnUrl={`/o/${profileName}`} breadcrumbs={breadcrumbs} />
            <ReadContainer>
                <Tabs
                
                    activeKey={selectedTab}
                    onChange={(tab) => setSelectedTab(tab as SelectedTab)}
                >
                    <TabPane tab={<ActiveMembersTabTitleWithCounter />} key="activeMembers" forceRender={true}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '26px' }}>
                            <Row gutter={16}>
                                <Col>
                                    <DebouncedSearch
                                        debounceAfter={640} 
                                        onDebouncedChange={(event) => setMembersQueryField(event.value)}
                                    />
                                </Col>
                                <Col>
                                    <Space>
                                        <Tooltip title={addMemberRoleFeedback.text}>
                                            <Button icon={<UserAddOutlined />} type="primary"
                                                disabled={!addMemberRoleFeedback.hasRole}
                                                onClick={() => {
                                                    setSelectedTab('pendingInvites')
                                                    sendInviteButtonRef.current?.focus()
                                                    setTimeout(() => {
                                                        setShowInviteDrawer(true)
                                                    }, 600);
                                                }}>
                                                Adicionar membro
                                            </Button>
                                        </Tooltip>
                                    </Space>
                                </Col>
                            </Row>
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
                                    <Table columns={membersTableColumnsDefinition} dataSource={members} pagination={membersTablePaginationConfig} />
                        }
                    </TabPane>
                    <TabPane tab={<InvitesTabTitleWithCounter />} key="pendingInvites" forceRender={true}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '26px' }}>
                            <Space>
                                <Tooltip title={addMemberRoleFeedback.text}>
                                    <Button
                                        icon={<SendOutlined />}
                                        type="primary" ref={sendInviteButtonRef}
                                        onClick={() => setShowInviteDrawer(true)}
                                        disabled={!addMemberRoleFeedback.hasRole}
                                    >
                                        Enviar convite
                                    </Button>
                                </Tooltip>
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
                                    <Table columns={invitesTableColumnsDefinition} dataSource={invites} pagination={{ ...invitesTablePaginationConfig }} />
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
            <DeleteMemberModal />
            <SetOrganizationMemberOwnerModal />
            <ManageOrganizationMemberDrawer />
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