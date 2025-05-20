import { useContext, useMemo, useState } from "react"
import { AppContext } from "../App"
import { Button, Steps } from "antd"
import { jwtDecode } from 'jwt-decode';
import UserSessionStore from "../../store/user-session";
import { LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router";


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


export default function JoinOrganizationPage(): React.ReactElement {
    const appContext = useContext(AppContext)

    // steps:
    // 1) Check if the current token is valid / if not: Send the user to login page
    // 2) Check if the current authenticated user has the same e-mail as the invite / if not: Send the user to login using the invite token as required token
    // 3) Show the ingress organization button

    const [inviteToken, setInviteToken] = useState<InviteTokenPayload | undefined>(undefined)

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
            setInviteToken(decodedJwt)
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
        if (!userFromStore || userFromStore.userData.primaryEmail !== inviteToken.recipientEmail) {
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
        console.log(authenticatedAccountStatus)
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

                    <Link to={`/login?email=${inviteToken.recipientEmail}&redirectTo=${encodedPathAndSearch}`}>
                        <Button>
                            {`Você deve entrar utilizando a conta ${inviteToken.recipientEmail}`}
                        </Button>
                    </Link>
                </>
            )
        }
        else return (
            <></>
        )
    }

    function InviteTokenContainer(): React.ReactElement {
        if (inviteTokenStatus === 'checking') {
            return <LoadingOutlined />
        }
        else if (inviteTokenStatus === 'error') {
            return (
                <>
                    Erro
                </>
            )
        }
        else return (
            <></>
        )
    }


    return (
        <div>
            <Steps
                current={currentStep}
                items={[
                    {
                        title: "Verificando convite",
                    },
                    {
                        title: "Verifica conta conectada"
                    },
                    {
                        title: "Tudo pronto!",
                        description: "Clique no botão abaixo para unir-se a organização",
                    }
                ]}
            />
            {(currentStep == TokenStep) && <InviteTokenContainer />}
            {(currentStep == AuthenticatedUserStep) && <AuthenticatedUserContainer />}
        </div>
    )
}