import { JSX, useContext, useEffect, useState } from "react";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import { Alert, App, Button, Flex, Form, FormProps, Input } from "antd";
import UserService from "../../api/backend-api/user";
import ApiError from "../../api/backend-api/api-error";
import { AppContext } from "../App";
import FadeContainer from "../@components/FadeContainer/FadeContainer";
import { Link, useNavigate } from "react-router";
import AvailableEmailInput, { EmailAvailabilityState } from "../@components/AvailableEmailInput/AvailableEmailInput";
import PasswordInputWithStrengthChecker, { PasswordRank } from "../@components/PasswordInputWithStrengthChecker/PasswordInputWithStrengthChecker";
import NavigationBar from "../@components/NavigationBar/NavigationBar";
import { PersistentQueryParams, usePersistentQuery } from "../hooks";
import { assertSafeRedirectUrl } from "../../commons/string";

interface CreateAccountFormType {
    presentationName: string,
    primaryEmail: string,
    password: string,
    confirmPassword: string,
}

export default function CreateAccountPage(): JSX.Element {
    window.document.title = "FPM Toolkit - Criar Conta"

    const appContext = useContext(AppContext)
    const persistentQueryParameters = usePersistentQuery(PersistentQueryParams.authenticationFlow)
    const navigate = useNavigate()
    const [form] = Form.useForm();
    const [emailAvailability, setEmailAvailability] = useState<EmailAvailabilityState>("unknown")
    const [passwordRank, setPasswordRank] = useState<PasswordRank>('not-acceptable')
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.validateFields(["primaryEmail"])
    }, [emailAvailability])

    useEffect(() => {
        form.validateFields(['password'])
    }, [passwordRank])


    /**
     * Custom validator for confirmPassword field
     */
    const confirmPasswordValidator = (_: any, value: string) => {
        if (form.getFieldValue('password') !== value) {
            return Promise.reject("As senhas não conferem")
        }

        return Promise.resolve()
    }

    /**
     * Custom validator for password field
     */
    const passwordValidator = (_: any, value: string) => {
        if (value == undefined || !value.length) {
            return Promise.reject("Este campo é obrigatório")
        }

        if (passwordRank == 'not-acceptable') {
            return Promise.reject("Senha inválida pois foi considerada insegura")
        }

        return Promise.resolve()
    }

    /**
     * Custom validator for email primaryEmail field
     */
    const primaryEmailValidator = (_: any, value: string) => {
        if (value == undefined) {
            return Promise.resolve()
        }
        if (emailAvailability === "available") {
            return Promise.resolve()
        }
        else if (emailAvailability === "unavailable") {
            return Promise.reject("O email inserido não está disponível")
        }
        else if (emailAvailability === 'error') {
            return Promise.reject("Um erro inesperado impediu a verificação de disponibilidade deste e-mail")
        }
        else {
            return Promise.reject("Insira um endereço de e-mail válido")
        }
    }

    const createUserAccount: FormProps<CreateAccountFormType>['onFinish'] = async (form) => {

        // reset component states
        setLoading(true)

        const actionTimeout = 1200

        // create the user account
        UserService.createUser({
            password: form.password,
            preferredRegion: "PT_BR",
            presentationName: form.presentationName,
            primaryEmail: form.primaryEmail
        })
            .then(() => {
                appContext.login({ email: form.primaryEmail, password: form.password })
                    .then(() => {
                        appContext.message.success({
                            content: "Sua conta foi criada com sucesso. Bem-vindo ao FPM Toolkit!",
                            duration: 5,
                        })
                        setTimeout(() => {
                            navigate(assertSafeRedirectUrl(persistentQueryParameters.get('redirectTo'), "/"))
                        }, actionTimeout)
                    })
                    .catch(e => {
                        console.error(e)
                        appContext.message.error({
                            content: "Lamentamos, mas ocorreu um erro ao iniciar sessão. Tente novamente mais tarde",
                            duration: 3
                        })
                    })
            })
            .catch(e => {
                const error = new ApiError(e)
                if (error.errorType === "INVALID_PASSWORD") {
                    appContext.message.error({
                        content: "O servidor considerou a senha insegura",
                        duration: 3
                    })
                }
                else if (error.errorType === "INVALID_EMAIL") {
                    appContext.message.error({
                        content: "E-mail inserido indisponível",
                        duration: 3
                    })
                }
                else {
                    appContext.message.error({
                        content: "Lamentamos, mas ocorreu um erro ao criar a conta. Tente novamente mais tarde",
                        duration: 3
                    })
                }
            })
            .finally(() => {
                setTimeout(() => {
                    setLoading(false)
                }, actionTimeout)
            })
    }

    return (
        <>
            <NavigationBar title="Criar nova conta"/>
            <ReadContainer style={{ maxWidth: 600 }}>
                <Form
                    form={form}
                    name="login-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="true"
                    size="large"
                    onFinish={createUserAccount}
                >
                    <Form.Item<CreateAccountFormType>
                        label="Como podemos te chamar?"
                        name="presentationName"
                        rules={[{ required: true, message: "Este campo é obrigatório" }, { max: 60, message: 'Apenas 60 caracteres são permitidos neste campo' }]}
                    >
                        <Input autoFocus={true}/>
                    </Form.Item>
                    <Form.Item<CreateAccountFormType>
                        label="Insira seu e-mail"
                        name="primaryEmail"
                        rules={[{ validator: primaryEmailValidator }, { max: 120, message: 'Apenas 120 caracteres são permitidos neste campo' }]}
                    >
                        <AvailableEmailInput onEmailAvailabilityChange={setEmailAvailability} />
                    </Form.Item>
                    {
                        (emailAvailability === 'unavailable')
                        ?
                        <Form.Item label={null}>
                            <Link to={`/login?email=${form.getFieldValue('primaryEmail')}`}>
                                Já tem uma conta em nome de '{form.getFieldValue('primaryEmail')}'? Clique aqui.
                            </Link>
                        </Form.Item>
                        :
                        <></>
                    }
                    <Form.Item<CreateAccountFormType>
                        label="Senha"
                        name="password"
                        rules={[{ validator: passwordValidator }]}
                    >
                        <PasswordInputWithStrengthChecker onPasswordRankChange={setPasswordRank} />
                    </Form.Item>
                    <Form.Item<CreateAccountFormType>
                        label="Repita sua senha"
                        name="confirmPassword"
                        rules={[{ validator: confirmPasswordValidator }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar conta
                        </Button>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Flex justify="space-between">
                            <Link to={`/login?${persistentQueryParameters}`}>Já tem uma conta?</Link>
                        </Flex>
                    </Form.Item>
                </Form>
            </ReadContainer>
        </>
    )
}