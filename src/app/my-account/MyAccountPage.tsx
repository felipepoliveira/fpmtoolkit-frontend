import Title from "antd/es/typography/Title";
import NavigationBar from "../@components/NavigationBar/NavigationBar";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import Section from "../@components/Section/Section";
import { Alert, Button, Col, Divider, Drawer, Form, Input, Row, Space } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { Link } from "react-router";
import { ClockCircleOutlined, KeyOutlined, MailOutlined } from "@ant-design/icons";
import { useContext, useEffect, useState } from "react";
import { AuthenticatedAppContext } from "../AuthenticatedApp";
import AuthenticationService from "../../api/backend-api/authentication";
import { AppContext } from "../App";
import { FormProps, useForm } from "antd/es/form/Form";
import PasswordInputWithStrengthChecker, { PasswordRank } from "../@components/PasswordInputWithStrengthChecker/PasswordInputWithStrengthChecker";

export default function MyAccountPage(): React.ReactElement {

    const appContext = useContext(AppContext)
    const authAppContext = useContext(AuthenticatedAppContext)
    const { userData } = authAppContext.authenticatedUser()

    /**
     * Section to manage user contact data
     * @returns 
     */
    function ContactDataSection(): React.ReactElement {
        return (
            <Section id="sec-contact-data">
                <Title level={3}>Dados de contato</Title>
                <Paragraph>Dados de contato da sua conta</Paragraph>
                <Divider />
                <Space></Space>
            </Section>
        )
    }

    function PrimaryEmailSection(): React.ReactElement {

        const emailConfirmed = userData.primaryEmailConfirmedAt != undefined
        const [loading, setLoading] = useState(false)

        function PrimaryEmailConfirmation(): React.ReactElement {

            if (emailConfirmed) {
                return (
                    <Alert type="info" showIcon message={`E-mail confirmado`} />
                )
            }
            else {
                return (
                    <Alert type="warning" showIcon message={'E-mail não confirmado'} />
                )
            }
        }

        function sendEmailConfirmationMail() {
            setLoading(true)
            AuthenticationService.sendPrimaryEmailConfirmationMail()
                .then(() => {
                    appContext.message.success({
                        content: `E-mail enviado com sucesso para ${userData.primaryEmail}`,
                        duration: 3
                    })
                })
                .catch(e => {
                    console.error(e)
                    appContext.message.error({
                        content: `Ocorreu um erro inesperado ao enviar e-mail`,
                        duration: 3
                    })
                })
                .finally(() => {
                    setLoading(false)
                })
        }

        return (
            <Section id="sec-primary-email">
                <Title level={3}>E-mail primário</Title>
                <Paragraph>Gerencie seu e-mail primário</Paragraph>
                <Divider />
                <Space style={{ marginBottom: 24 }}>
                    <MailOutlined />
                    <b>E-mail primário:</b> {userData.primaryEmail}
                </Space>
                <PrimaryEmailConfirmation />
                <Divider />
                <Row justify="end">
                    <Space>
                        <Button icon={<ClockCircleOutlined />} loading={loading} onClick={sendEmailConfirmationMail}>Enviar confirmação de e-mail</Button>
                        <Link to={'/my-account/change-primary-email'}>
                            <Button icon={<MailOutlined />} disabled={!emailConfirmed}>Alterar e-mail primário</Button>
                        </Link>
                    </Space>
                </Row>
            </Section>
        )
    }

    function PasswordSection(): React.ReactElement {
        // Types
        interface UpdatePasswordForm {
            /**
             * The current password of the authenticated user
             */
            currentPassword: string,
            /**
             * The new password that should be applied in the user account
             */
            newPassword: string,
            /**
             * The password confirmation
             */
            passwordConfirmation: string,
        }

        // States
        const [passwordRank, setPasswordRank] = useState<PasswordRank>()
        const [updatePasswordForm] = useForm<UpdatePasswordForm>()
        const [widgetsStates, setWidgetsStates] = useState({
            loading: false,
            showChangePasswordDrawer: false
        })

        // Effects
        useEffect(() => {
            if (passwordRank !== undefined) {
                updatePasswordForm.validateFields(["newPassword"])
            }
        }, [passwordRank])

        // Functions

        const confirmPasswordValidator = (_: any, value: string) => {
            if (updatePasswordForm.getFieldValue('newPassword') !== value) {
                return Promise.reject("As senhas não conferem")
            }

            return Promise.resolve()
        }

        const passwordValidator = (_: any, value: string) => {
            if (value == undefined || !value.length) {
                return Promise.reject("Este campo é obrigatório")
            }

            if (value === updatePasswordForm.getFieldValue('currentPassword')) {
                return Promise.reject("A nova senha é igual a atual")
            }

            if (passwordRank == 'not-acceptable') {
                return Promise.reject("Senha inválida pois foi considerada insegura")
            }

            return Promise.resolve()
        }
        const updatePassword: FormProps<UpdatePasswordForm>['onFinish'] = async (form) => {
            updatePasswordForm.resetFields()
        }

        return (
            <Section id="sec-password">
                <Title level={3}>Senha</Title>
                <Paragraph>Gerencie a senha da sua conta</Paragraph>
                <Divider />
                <Row justify="end">
                    <Space>
                        <Button icon={<KeyOutlined />} loading={widgetsStates.loading}
                            onClick={() => setWidgetsStates({ ...widgetsStates, showChangePasswordDrawer: true })}>
                            Alterar senha
                        </Button>
                    </Space>
                </Row>
                <Drawer
                    onClose={() => setWidgetsStates({ ...widgetsStates, showChangePasswordDrawer: false })}
                    open={widgetsStates.showChangePasswordDrawer}
                    title="Alterar senha"
                    width={620}
                >
                    <Form
                        form={updatePasswordForm}
                        name="login-form"
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        autoComplete="true"
                        size="large"
                        onFinish={updatePassword}
                    >
                        <Form.Item<UpdatePasswordForm>
                            label="Sua senha atual"
                            name="currentPassword"
                            rules={[{ required: true, message: "Este campo é obrigatório" }]}
                        >
                            <Input.Password autoFocus={true} />
                        </Form.Item>
                        <Form.Item<UpdatePasswordForm>
                            label="Sua nova senha"
                            name="newPassword"
                            rules={[{ validator: passwordValidator }]}
                        >
                            <PasswordInputWithStrengthChecker onPasswordRankChange={setPasswordRank} />
                        </Form.Item>
                        <Form.Item<UpdatePasswordForm>
                            label="Confirme sua nova senha"
                            name="passwordConfirmation"
                            rules={[{ validator: confirmPasswordValidator }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button type="primary" htmlType="submit" loading={widgetsStates.loading} size="middle">
                                Alterar senha
                            </Button>
                        </Form.Item>
                    </Form>
                </Drawer>
            </Section>
        )
    }

    return (
        <>
            <NavigationBar title="Minha conta" />
            <ReadContainer>
                <ContactDataSection />
                <PrimaryEmailSection />
                <PasswordSection />
            </ReadContainer>
        </>
    )
}