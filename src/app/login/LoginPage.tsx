import { Button, Flex, Form, FormProps, Input, InputRef } from "antd";
import { JSX, useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import ApiError from "../../api/backend-api/api-error";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import { AppContext } from "../App";
import { useLocation } from "react-router";
import { PersistentQueryParams, usePersistentQuery } from "../hooks";
import { assertSafeRedirectUrl } from "../../commons/string";


interface LoginFormType {
    email: string,
    password: string,
}

export default function LoginPage(): JSX.Element {
    window.document.title = "FPM Toolkit - Login"
    const location = useLocation()
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [form] = Form.useForm<LoginFormType>();
    const [loading, setLoading] = useState(false)
    const passwordInputRef = useRef<InputRef>(null)

     // Automatically set the email
    const queryParams = new URLSearchParams(location.search);
    const emailInQueryParam = queryParams.get('email')

    const persistentQueryParameters = usePersistentQuery(PersistentQueryParams.authenticationFlow)

    useEffect(() => {

        if (emailInQueryParam && passwordInputRef.current) {
            form.setFieldValue('email', emailInQueryParam)
            passwordInputRef.current.focus()
        }

    }, [passwordInputRef])

    /**
     * Authenticate function associated with 'onFinish' event in login-form
     * @param values 
     */
    const authenticate: FormProps<LoginFormType>['onFinish'] = (values) => {
        appContext.notification.destroy()
        setLoading(true)
        const actionTimeout = 800

        appContext.login({
            email: values.email,
            password: values.password
        })
        .then((response) => {
            appContext.message.success({
                content: `Olá, ${response.userData.presentationName}`,
                duration: 5
            })
            setTimeout(() => {
                navigate(assertSafeRedirectUrl(persistentQueryParameters.get('redirectTo'), "/"))
            }, actionTimeout)
        })
        .catch(e => {
            const error = new ApiError(e)
            if (error.errorType === "NOT_FOUND") {
                appContext.message.warning({
                    content: "Credencias inseridas inválidas",
                    duration: 2
                })
            }
            else {
                appContext.message.error({
                    content: "Credencias inseridas inválidas",
                    duration: 2
                })
            }

        })
        .finally(() => {
            setTimeout(() => {
                setLoading(false)
            }, actionTimeout);
        })
    }

    // store ReadContainer style for this page
    const readContainerStyle: React.CSSProperties = {
        maxWidth: 600
    }

    return (
        <ReadContainer style={readContainerStyle}>
            <Form
                form={form}
                name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={authenticate}
                autoComplete="true"
                size="large"
            >
                <Form.Item<LoginFormType>
                    label="Email"
                    name="email"
                    rules={[{ type: "email", message: "O campo email deve ser um email válido" }, { required: true, message: "O campo email é obrigatório" }]}
                >

                    <Input autoFocus={true} />
                </Form.Item>
                <Form.Item<LoginFormType>
                    label="Senha"
                    name="password"
                    rules={[{ required: true, message: "O campo senha é obrigatório" }]}
                >
                    <Input.Password ref={passwordInputRef} />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Entrar
                    </Button>
                </Form.Item>
                <Form.Item label={null}>
                    <Flex vertical>
                        <Flex gap='large' wrap>
                            <Link to={`/create-account?${persistentQueryParameters}`}>Criar conta</Link>
                            <Link to={`/password-recovery?${persistentQueryParameters}`}>Esqueceu sua senha?</Link>
                        </Flex>
                    </Flex>
                </Form.Item>
            </Form>
        </ReadContainer>
    )
}