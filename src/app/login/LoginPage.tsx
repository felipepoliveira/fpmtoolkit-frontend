import { Button, Flex, Form, FormProps, Input } from "antd";
import { JSX, useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import ApiError from "../../api/backend-api/api-error";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import { AppContext } from "../App";


interface LoginFormType {
    email: string,
    password: string,
}

export default function LoginPage(): JSX.Element {
    window.document.title = "FPM Toolkit - Login"
    const appContext = useContext(AppContext)
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false)

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
                navigate("/")
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
                <Form.Item label={null}>
                    <Flex vertical>
                        <Flex gap='large' wrap>
                            <Link to="/create-account">Criar conta</Link>
                            <Link to="/password-recovery">Esqueceu sua senha?</Link>
                        </Flex>
                    </Flex>
                </Form.Item>
            </Form>
        </ReadContainer>
    )
}