import { ClockCircleOutlined, KeyOutlined, MailOutlined } from "@ant-design/icons";
import { Alert, Button, Divider, Drawer, Form, Input, Row, Space, Tooltip } from "antd";
import { FormProps, useForm } from "antd/es/form/Form";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import { useContext, useEffect, useMemo, useState } from "react";
import AuthenticationService from "../../api/backend-api/authentication";
import { AuthenticatedUserService } from "../../api/backend-api/me/auth-user";
import { PrimaryEmailChangeTokenAndPayload, UserModel } from "../../types/backend-api/user";
import NavigationBar from "../@components/NavigationBar/NavigationBar";
import PasswordInputWithStrengthChecker, { PasswordRank } from "../@components/PasswordInputWithStrengthChecker/PasswordInputWithStrengthChecker";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import Section from "../@components/Section/Section";
import { AppContext } from "../App";
import { AuthenticatedAppContext } from "../AuthenticatedApp";
import SendPrimaryEmailChangeMailForm from "./@components/SendPrimaryEmailChangeMailForm/SendPrimaryEmailChangeMailForm";
import UpdatePrimaryEmailWithTokenForm from "./@components/UpdatePrimaryEmailWithTokenForm/UpdatePrimaryEmailWithTokenForm";
import TimeoutButton from "../@components/TimeoutButton";
import { addMinutes, intervalToDuration } from "date-fns";
import { dateFrom } from "../../commons/date";
import { useTimeoutsStore } from "../../store/timeouts";
import { useConditionalFeedbackText } from "../hooks";

export default function MyAccountPage(): React.ReactElement {

    const appContext = useContext(AppContext)
    const authAppContext = useContext(AuthenticatedAppContext)
    const [userData, setUserData] = useState(authAppContext.authenticatedUser().userData)


    const primaryEmailConfirmedAt = useMemo(() => {
        if (!userData.primaryEmailConfirmedAt) {
            return undefined
        }
        return new Date(userData.primaryEmailConfirmedAt)
    }, [userData])

    function resetUserDataFromAppContext() {
        setUserData(authAppContext.authenticatedUser().userData)
    }

    /**
     * Section to manage user contact data
     * @returns 
     */
    function ContactDataSection(): React.ReactElement {
        return (
            <Section id="sec-contact-data">
                <Title level={3}>Dados da conta</Title>
                <Divider />
                <Space></Space>
            </Section>
        )
    }

    interface PrimaryEmailSectionWidgetsType {
        loading: boolean,
        emailChangeTokenAndPayload?: PrimaryEmailChangeTokenAndPayload,
        newPrimaryEmailAvailableForUse: boolean,
        showChangePrimaryEmailDrawer: boolean,
    }

    function PrimaryEmailSection(): React.ReactElement {

        // States and contexts
        const [widgetsStates, setWidgetsStates] = useState<PrimaryEmailSectionWidgetsType>({
            loading: false,
            emailChangeTokenAndPayload: undefined,
            newPrimaryEmailAvailableForUse: true,
            showChangePrimaryEmailDrawer: false,
        })
        const { timeouts, setTimeouts } = useTimeoutsStore()

        // Constants
        const emailConfirmed = userData.primaryEmailConfirmedAt != undefined

        const recentlyConfirmedPrimaryEmail = useMemo(() => {

            if (!primaryEmailConfirmedAt) {
                return false
            }

            const daysInterval = intervalToDuration({ start: primaryEmailConfirmedAt, end: new Date() }).days
            return daysInterval !== undefined && daysInterval <= 7
        }, [])

        const recentlyConfirmedPrimaryEmailFeedback = useConditionalFeedbackText({
            condition: recentlyConfirmedPrimaryEmail,
            authorizedText: 'Você confirmou seu e-mail primário recentemente',
            forbiddenText: 'Faz muito tempo que confirmou seu e-mail primário. Confirme novamente sua posse para realizar esta operação'
        })

        function PrimaryEmailConfirmationAlert(): React.ReactElement {

            if (emailConfirmed && recentlyConfirmedPrimaryEmail) {
                return (
                    <Alert type="info" showIcon message={`E-mail confirmado`} />
                )
            }
            else if (emailConfirmed) {
                return (
                    <Alert
                        type="warning" showIcon
                        message={`Faz muito tempo que confirmou a posse do seu e-mail. Algumas ações ficarão bloqueadas até que confirme novamente.`}
                        style={{ marginTop: 8 }}

                    />
                )
            }
            else {
                return (
                    <Alert type="warning" showIcon message={'E-mail não confirmado'} />
                )
            }
        }

        function onPrimaryEmailChange() {
            setWidgetsStates({ ...widgetsStates, loading: false, emailChangeTokenAndPayload: undefined, showChangePrimaryEmailDrawer: false })
            resetUserDataFromAppContext()
        }

        function sendEmailConfirmationMail() {
            setWidgetsStates({ ...widgetsStates, loading: true })
            AuthenticationService.sendPrimaryEmailConfirmationMail()
                .then(() => {
                    appContext.message.success({
                        content: `E-mail enviado com sucesso para ${userData.primaryEmail}`,
                        duration: 3
                    })
                    setWidgetsStates({ ...widgetsStates, loading: false })
                    setTimeouts({ ...timeouts, sendPrimaryEmailConfirmationMail: addMinutes(new Date(), 1).getTime() })
                })
                .catch(e => {
                    console.error(e)
                    appContext.message.error({
                        content: `Ocorreu um erro inesperado ao enviar e-mail`,
                        duration: 3
                    })
                    setWidgetsStates({ ...widgetsStates, loading: false })
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
                <PrimaryEmailConfirmationAlert />
                <Divider />
                <Row justify="end">
                    <Space>
                        <TimeoutButton
                            icon={<ClockCircleOutlined />}
                            loading={widgetsStates.loading}
                            onClick={sendEmailConfirmationMail}
                            timeoutUntil={dateFrom(timeouts.sendPrimaryEmailConfirmationMail)}
                            timerFormat="time-fit"
                        >
                            Enviar confirmação de e-mail
                        </TimeoutButton>
                        <Tooltip
                            title={recentlyConfirmedPrimaryEmailFeedback.text}
                        >
                            <Button
                                icon={<MailOutlined />}
                                disabled={!emailConfirmed || !recentlyConfirmedPrimaryEmailFeedback.hasRole}
                                onClick={() => setWidgetsStates({ ...widgetsStates, showChangePrimaryEmailDrawer: true })}>
                                Alterar e-mail primário
                            </Button>
                        </Tooltip>
                    </Space>
                </Row>
                <Drawer
                    onClose={() => setWidgetsStates({ ...widgetsStates, emailChangeTokenAndPayload: undefined, showChangePrimaryEmailDrawer: false })}
                    open={widgetsStates.showChangePrimaryEmailDrawer}
                    title="Alterar e-mail primário"
                    width={620}
                >
                    <Title level={5}>1. Insira o novo e-mail primário da sua conta</Title>
                    <Paragraph>Você receberá um e-mail no endereço inserido com procedimentos para a troca do e-mail primário</Paragraph>
                    <Divider />
                    <SendPrimaryEmailChangeMailForm
                        onReset={() => setWidgetsStates({ ...widgetsStates, emailChangeTokenAndPayload: undefined })}
                        onSuccessState={widgetsStates.emailChangeTokenAndPayload !== undefined}
                        onSuccess={(tokenAndPayload) => setWidgetsStates({ ...widgetsStates, emailChangeTokenAndPayload: tokenAndPayload })}
                    />
                    {
                        (widgetsStates.emailChangeTokenAndPayload)
                            ?
                            <>
                                <Title level={5}>2. Inserir código de confirmação</Title>
                                <Paragraph>
                                    No email enviado para {widgetsStates.emailChangeTokenAndPayload.payload.newPrimaryEmail} foi inserido um código para confirmação.
                                    Insira-o abaixo para concluir a troca de e-mail primário.
                                </Paragraph>
                                <UpdatePrimaryEmailWithTokenForm
                                    emailChangeToken={widgetsStates.emailChangeTokenAndPayload}
                                    onSuccess={onPrimaryEmailChange}
                                />
                            </>
                            :
                            <></>
                    }
                </Drawer>
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

        /**
         * Function associated with a form action that update the password of the
         * authenticated user
         * @param form 
         */
        const updatePassword: FormProps<UpdatePasswordForm>['onFinish'] = async (form) => {
            updatePasswordForm.resetFields()
            setWidgetsStates({ ...widgetsStates, loading: true })
            AuthenticatedUserService.updatePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            })
                .then(() => {
                    appContext.message.success({
                        content: "Senha alterada com sucesso",
                        duration: 3
                    })
                })
                .catch((e) => {
                    console.error(e)
                    appContext.message.error({
                        content: "Um erro inesperado ocorreu ao mudar senha",
                        duration: 3
                    })
                })
                .finally(() => {
                    setWidgetsStates({ ...widgetsStates, loading: false, showChangePasswordDrawer: false })
                })
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