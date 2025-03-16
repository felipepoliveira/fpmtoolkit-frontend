import { Alert, Button, Flex, Form, FormProps, Input, Layout } from "antd";
import { JSX, useContext, useState } from "react";
import AuthenticationService from "../../api/backend-api/authentication";
import { AppContext } from "../App";
import ApiError from "../../api/backend-api/api-error";
import FadeAlertError from "../@components/FadeAlertError/FadeAlertError";
import FadeContainer from "../@components/FadeContainer/FadeContainer";
import { Link } from "react-router";


interface LoginFormType {
    email: string,
    password: string,
}

export default function LoginPage(): JSX.Element {
    const appContext = useContext(AppContext)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    /**
     * Authenticate function associated with 'onFinish' event in login-form
     * @param values 
     */
    const authenticate: FormProps<LoginFormType>['onFinish'] = (values) => {
        appContext.notification.destroy()
        setLoading(true)

        AuthenticationService.generateAuthenticationTokenWithEmailAndPassword({
            primaryEmail: values.email,
            password: values.password
        })
            .then(response => {
                console.log(response)
            })
            .catch(e => {
                const error = new ApiError(e)
                if (error.errorType === "NOT_FOUND") {
                    setError("Credencias inseridas inválidas")
                }
                else {
                    appContext.notification.error({
                        message: "Erro ao autenticar",
                        description: "Lamentamos, mas ocorreu um erro ao autenticar. Tente novamente mais tarde"
                    })
                }

            })
            .finally(() => {
                setTimeout(() => {
                    setLoading(false)
                }, 800);
            })
    }

    return (
        <>
            <Form
                name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={authenticate}
                autoComplete="true"
            >
                <Form.Item<LoginFormType>
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "O campo e-mail é obrigatório" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item<LoginFormType>
                    label="Senha"
                    name="password"
                    rules={[{ required: true, message: "O campo senha é obrigatório" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Entrar
                    </Button>
                </Form.Item>
                <FadeContainer show={error !== null} autoHideTimeout={6000} onAutoHide={() => setError(null)} doNotDisplayOnHide={true}>
                    <Form.Item label={null}>
                        <Alert type="error" showIcon message={error} />
                    </Form.Item>
                </FadeContainer>
                <Form.Item label={null}>
                    <Flex justify="space-between">
                        <Link to="/create-account">Criar conta</Link>
                        <Link to="/password-recovery">Esqueceu sua senha?</Link>
                    </Flex>
                </Form.Item>
            </Form>
        </>
    )
}