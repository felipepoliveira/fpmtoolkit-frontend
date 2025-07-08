import { Alert, Button, Form, Space } from "antd";
import { Link, useSearchParams } from "react-router";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import { useContext, useEffect, useState } from "react";
import NavigationBar from "../@components/NavigationBar/NavigationBar";
import { HomeOutlined, LoadingOutlined, UserOutlined } from "@ant-design/icons";
import Paragraph from "antd/es/typography/Paragraph";
import AuthenticationService from "../../api/backend-api/authentication";
import { AuthenticatedAppContext } from "../AuthenticatedApp";

export default function ConfirmEmailPage(): React.ReactElement {

    const authContext = useContext(AuthenticatedAppContext)
    const [searchParams] = useSearchParams()
    const confirmEmailToken = searchParams.get("confirmationToken")
    const [pageState, setPageState] = useState<'success' | 'loading' | 'error'>('loading')

    useEffect(() => {
        confirmEmail()
    }, [])

    async function confirmEmail() {
        // if the confirm email is not set 
        if (!confirmEmailToken) {
            setPageState('error')
            return
        }

        try {

            // Confirm the email in the back-end API and 
            await AuthenticationService.confirmPrimaryEmailWithToken({
                confirmationToken: confirmEmailToken
            })
            // refresh the authenticated user data so it is updated on the UI
            await authContext.refreshAuthenticatedUserSession()
            setPageState('success')
        } catch (error) {
            console.error(error)
            setPageState('error')
        }
    }

    function ErrorContainer() {
        return (
            <>
                <Alert type="error" showIcon message="Não foi possível confirmar seu e-mail" />
                <Link to={'/my-account'}>Acesse sua página de usuário e tente novamente</Link>
            </>
        )
    }

    function LoadingContainer() {
        return (
            <div style={{ textAlign: 'center' }}>
                <Paragraph>Verificando seu e-mail...</Paragraph>
                <LoadingOutlined /><br />
            </div>
        )
    }

    function SuccessContainer() {
        return (
            <Space direction="vertical" style={{ margin: 'auto', alignItems: 'center' }}>
                <Alert type="success" showIcon message="E-mail verificado com sucesso"  />
                <Space direction="vertical" size='middle' style={{ marginTop: '32px', alignItems: 'center' }}>
                    <Link to='/'>
                        <Button type="primary" icon={<HomeOutlined />}>
                            Acessar página principal
                        </Button>
                    </Link>
                    <Link to='/my-account'>
                        <Button icon={<UserOutlined />}>Acessar meu perfil</Button>
                    </Link>
                </Space>
            </Space>
        )
    }

    /**
     * Style for page form
     */
    const formStyle: React.CSSProperties = {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: 'calc(100vh - 256px)',
    }

    return (
        <>
            <NavigationBar title="Voltar para início" returnUrl="/" />
            <ReadContainer>
                <Form
                    name="confirm-email-form"
                    style={formStyle}
                >
                    {
                        (pageState === 'loading')
                            ?
                            <LoadingContainer />
                            :
                            (pageState === 'success')
                                ?
                                <SuccessContainer />
                                :
                                <ErrorContainer />
                    }
                </Form>
            </ReadContainer>
        </>
    )
}