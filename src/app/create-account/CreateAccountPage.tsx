import { JSX, useContext, useState } from "react";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import { Alert, App, Button, Flex, Form, FormProps, Input } from "antd";
import UserService from "../../api/backend-api/user";
import ApiError from "../../api/backend-api/api-error";
import { AppContext } from "../App";
import FadeContainer from "../@components/FadeContainer/FadeContainer";
import { Link } from "react-router";

interface CreateAccountFormType {
    presentationName: string,
    primaryEmail: string,
    password: string,
    confirmPassword: string,
}

export default function CreateAccountPage(): JSX.Element {
    window.document.title = "FPM Toolkit - Criar Conta"
    
    const appContext = useContext(AppContext)
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    const createUserAccount: FormProps<CreateAccountFormType>['onFinish'] = async (form) => {

        // reset component states
        setError(undefined)
        setLoading(true)

        // create the user account
        UserService.createUser({
            password: form.password,
            preferredRegion: "PT_BR",
            presentationName: form.presentationName,
            primaryEmail: form.primaryEmail
        })
        .then(response => {
            console.log(response)
        })
        .catch(e => {
            const error = new ApiError(e)
            if (error.errorType === "INVALID_PASSWORD") {
                setError("O servidor considerou a senha insegura")
            }
            else if (error.errorType === "INVALID_EMAIL") {
                setError("E-mail inserido indisponível")
            }
            else {
                appContext.notification.error({
                    message: "Erro ao criar conta",
                    description: "Lamentamos, mas ocorreu um erro ao criar a conta. Tente novamente mais tarde"
                })
            }
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        <ReadContainer>
            <Form
                name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                autoComplete="true"
                size="large"
                onFinish={createUserAccount}
            >
                <Form.Item<CreateAccountFormType>
                    label="Como quer ser chamado?"
                    name="presentationName"
                    rules={[{ required: true, message: "Este campo é obrigatório" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item<CreateAccountFormType>
                    label="Insira seu e-mail"
                    name="primaryEmail"
                    rules={[{ required: true, message: "Este campo é obrigatório" }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item<CreateAccountFormType>
                    label="Senha"
                    name="password"
                    rules={[{ required: true, message: "Este campo é obrigatório" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item<CreateAccountFormType>
                    label="Repita sua senha"
                    name="confirmPassword"
                    rules={[{ required: true, message: "Este campo é obrigatório" }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Criar conta
                    </Button>
                </Form.Item>
                <FadeContainer show={error !== undefined} autoHideTimeout={6000} onAutoHide={() => setError(undefined)} doNotDisplayOnHide={true}>
                    <Form.Item label={null}>
                        <Alert type="error" showIcon message={error} />
                    </Form.Item>
                </FadeContainer>
                <Form.Item label={null}>
                    <Flex justify="space-between">
                        <Link to="/login">Já tem uma conta?</Link>
                    </Flex>
                </Form.Item>
            </Form>
        </ReadContainer>
    )
}