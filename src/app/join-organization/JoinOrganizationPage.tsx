import { useContext, useEffect, useMemo, useState } from "react"
import { AppContext } from "../App"
import { Alert, Avatar, Button, Skeleton, Steps, Typography } from "antd"
import { jwtDecode } from 'jwt-decode';
import UserSessionStore from "../../store/user-session";
import { LoadingOutlined, MailOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { OrganizationMemberInviteModel } from "../../types/backend-api/organization-member-invite";
import { OrganizationMemberInviteService } from "../../api/backend-api/organization-member-invite";
import Title from "antd/es/typography/Title";
import { OrganizationMemberService } from "../../api/backend-api/organization-member";
import ApiError from "../../api/backend-api/api-error";


type CheckStatus = "ok" | "checking" | "error";

type AuthenticatedUserCheckStatus = CheckStatus | "must-authenticate"

const TokenStep = 0
const AuthenticatedUserStep = 1
const IngressStep = 2

interface InviteTokenPayload {
    /**
     * The ID of the invite
     */
    inviteId: string,
    /**
     * The recipient of the invite
     */
    recipientEmail: string,
}

interface InviteTokenAndPayload {
    /**
     * 
     */
    token: string,
    payload: InviteTokenPayload,
}


export default function JoinOrganizationPage(): React.ReactElement {
    const appContext = useContext(AppContext)

    // steps:
    // 1) Check if the current token is valid / if not: Send the user to login page
    // 2) Check if the current authenticated user has the same e-mail as the invite / if not: Send the user to login using the invite token as required token
    // 3) Show the ingress organization button

    const navigate = useNavigate()
    const [inviteToken, setInviteToken] = useState<InviteTokenAndPayload | undefined>(undefined)
    const [invite, setInvite] = useState<OrganizationMemberInviteModel | undefined>(undefined)

    useEffect(() => {
        // ignore if the invite token is not defined
        if (!inviteToken) {
            return
        }

        // Fetch the invite data using the given token
        OrganizationMemberInviteService.findByInviteToken(inviteToken.token)
            .then(invite => setInvite(invite))
    }, [inviteToken])

    const queryParams = new URLSearchParams(window.location.search)
    const tokenFromQueryParam = queryParams.get('token')

    // Observe invite token status changes
    const inviteTokenStatus: CheckStatus = useMemo(() => {
        if (!tokenFromQueryParam) {
            return 'error'
        }

        try {
            // decode the JWT token and check if the field is valid
            const decodedJwt = jwtDecode<InviteTokenPayload>(tokenFromQueryParam)
            if (!decodedJwt.recipientEmail) {
                return "error"
            }

            // update the state with the token and payload
            setInviteToken({
                token: tokenFromQueryParam,
                payload: decodedJwt
            })

            return "ok"

        } catch (error) {
            return "error"
        }

    }, [])

    // Observe authenticated account status changes
    const authenticatedAccountStatus: AuthenticatedUserCheckStatus = useMemo(() => {
        // there must be a invite token so it can check if the authenticated user is the same as the invite
        if (!inviteToken) {
            return 'checking'
        }

        // if the user is not authenticated or the primary email of the authenticated user is not the same as the invite
        const userFromStore = UserSessionStore.get()
        if (!userFromStore || userFromStore.userData.primaryEmail !== inviteToken.payload.recipientEmail) {
            return "must-authenticate"
        }

        return 'ok'

    }, [inviteToken])

    const currentStep = useMemo(() => {

        let step = 0
        if (inviteTokenStatus === 'ok') step++
        if (authenticatedAccountStatus === 'ok') step++

        return step

    }, [inviteTokenStatus, authenticatedAccountStatus])

    function AuthenticatedUserContainer(): React.ReactElement {
        if (!inviteToken || authenticatedAccountStatus === 'checking') {
            return (
                <>
                    <LoadingOutlined />
                </>
            )
        }
        else if (authenticatedAccountStatus === 'error') {
            return (
                <>
                    Erro
                </>
            )
        }
        else if (authenticatedAccountStatus === 'must-authenticate') {
            const encodedPathAndSearch = encodeURI(window.location.pathname + window.location.search)
            return (
                <>

                    <Link to={`/login?email=${inviteToken.payload.recipientEmail}&redirectTo=${encodedPathAndSearch}`}>
                        <Button icon={<MailOutlined />}>
                            {`Você deve entrar utilizando a conta ${inviteToken.payload.recipientEmail}`}
                        </Button>
                    </Link>
                </>
            )
        }
        else return (
            <></>
        )
    }

    function InviteInformation(): React.ReactElement {

        // Do not render anything if the token is not found on the page
        if (!inviteToken) {
            return <></>
        }

        // Return skeleton if the invite data is loading
        if (!invite) {
            return (
                <Skeleton />
            )
        }

        return (
            <>
                <Avatar size="large" style={{ margin: '16px 0px' }}>
                    {invite.organization.presentationName.charAt(0)}
                </Avatar>
                <Title style={{ margin: '16px 0px' }} level={3}>
                    Você recebeu um convite de <b>{invite.organization.presentationName}</b>
                </Title>
            </>
        )
    }

    function IngressContainer(): React.ReactElement {


        const [loading, setLoading] = useState(false)
        const [isAlreadyAMember, setIsAlreadyAMember] = useState(false)

        /**
         * Show the API that make the user join the organization
         * @returns 
         */
        function joinOrganization() {
            // Can not join if the invite is not returned
            if (!inviteToken || !invite) {
                return
            }


            setLoading(true)
            OrganizationMemberService.ingressByInvite({
                token: inviteToken.token
            })
                .then(() => {
                    appContext.message.success({
                        content: 'Você ingressou na organização com sucesso',
                        duration: 2
                    })
                    setTimeout(() => {
                        navigate(`/o/${invite.organization.profileName}`)
                    }, 3000)
                })
                .catch(e => {
                    const error = new ApiError(e)
                    if (error.errorType === 'DUPLICATED') {
                        appContext.message.warning({
                            content: 'Você já é um membro dessa organização',
                            duration: 3
                        })
                        setIsAlreadyAMember(true)
                    }
                    else {
                        appContext.message.error({
                            content: 'Ocorreu um erro inesperado ao tentar unir-se a organização',
                            duration: 2
                        })
                        console.error(error)
                    }
                })
                .finally(() => {
                    setLoading(false)
                })
        }

        // if the user is already a member of the organization show a redirection link
        if (isAlreadyAMember) {
            return (
                <div style={{ marginTop: '16px' }}>
                    <Alert 
                        style={{ margin: '32px 0px'}} 
                        description={`Você já é um membro dessa organização`} 
                        type="warning"
                        banner
                    />
                    <Typography>
                        <Link to={`/o/${invite?.organization.profileName}`}>Clique aqui para acessar a página da organização</Link>
                    </Typography>
                </div>
            )
        }

        return (
            <>
                <Button onClick={joinOrganization} type="primary" loading={loading}>
                    {(!loading) ? "Unir-se a organização" : "Aguarde..."}
                </Button>
            </>
        )
    }

    function InviteTokenContainer(): React.ReactElement {
        if (inviteTokenStatus === 'checking') {
            return <LoadingOutlined />
        }
        else if (inviteTokenStatus === 'error') {
            return (
                <Alert 
                    style={{ margin: '24px 0px' }}
                    message={`Convite não encontrado`}
                    description={`Não foi possível encontrar o convite nesta página. Tente acessar o convite novamente através do e-mail recebido`}
                    type="error"
                    banner
                />
            )
        }
        else return (
            <></>
        )
    }


    return (
        <div style={{
            margin: 'auto',
            maxWidth: '800px',
            padding: '32px',
            textAlign: 'center',
        }}>
            <Steps
                current={currentStep}
                style={{
                    margin: '32px 0px'
                }}
                items={[
                    {
                        title: "Verificando convite",
                    },
                    {
                        title: "Verificando conta conectada"
                    },
                    {
                        title: "Tudo pronto!",
                    }
                ]}
            />
            <InviteInformation />
            {(currentStep == TokenStep) && <InviteTokenContainer />}
            {(currentStep == AuthenticatedUserStep) && <AuthenticatedUserContainer />}
            {(currentStep == IngressStep) && <IngressContainer />}
            <Typography style={{ marginTop: '32px' }}>
                <Link to={"/"}>Voltar para home</Link>
            </Typography>
        </div>
    )
}