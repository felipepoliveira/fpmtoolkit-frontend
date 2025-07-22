import { FormProps, useForm } from "antd/es/form/Form"
import { useContext, useEffect, useState } from "react"
import { AuthenticatedAppContext } from "../../../AuthenticatedApp"
import AuthenticationService from "../../../../api/backend-api/authentication"
import { AppContext } from "../../../App"
import { Button, Form } from "antd"
import AvailableEmailInput from "../../../@components/AvailableEmailInput/AvailableEmailInput"
import { PrimaryEmailChangeTokenAndPayload } from "../../../../types/backend-api/user"
import Link from "antd/es/typography/Link"
import { EditOutlined } from "@ant-design/icons"
import ApiError from "../../../../api/backend-api/api-error"
import TimeoutButton from "../../../@components/TimeoutButton"
import { dateFrom } from "../../../../commons/date"
import TimeoutsStore from "../../../../store/timeouts"
import { addMinutes } from "date-fns"

/**
 * Props for SendPrimaryEmailChangeMailForm component
 */
interface SendPrimaryEmailChangeMailFormProps {
    /**
     * When defined, renders a button that will trigger the reset operation in the form.
     * This should be used when the user is allowed to insert another e-mail
     * @returns 
     */
    onReset?: () => void,

    /**
     * Callback triggered when the forms successfully sent the primary email change mail
     * @returns 
     */
    onSuccess: (emailChangeTokenAndPayload: PrimaryEmailChangeTokenAndPayload) => void,

    /**
     * When its `true` locks the form so that user can not use it again
     */
    onSuccessState?: boolean,
}

export default function SendPrimaryEmailChangeMailForm(props: SendPrimaryEmailChangeMailFormProps) {
    // Component Types
    interface SendPrimaryEmailChangeMailFormType {
        /**
         * The new primary email that will receive the email confirmation mail
         */
        newPrimaryEmail: string,
    }

    // States and contexts
    const appContext = useContext(AppContext)
    const authAppContext = useContext(AuthenticatedAppContext)
    const [sendEmailChangeTimeoutUntil, setSendEmailChangeTimeoutUntil] = useState<Date | undefined>(dateFrom(TimeoutsStore.get()?.sendPrimaryEmailChangeMail))
    const [sendPrimaryEmailChangeForm] = useForm<SendPrimaryEmailChangeMailFormType>()
    const [widgetsStates, setWidgetsStates] = useState({
        emailAvailability: 'unknown',
        emailSent: false,
        loading: false,
    })

    useEffect(() => {
        sendPrimaryEmailChangeForm.validateFields()
    }, [widgetsStates])

    /**
     * Custom validator for email primaryEmail field
     */
    const primaryEmailValidator = (_: any, value: string) => {
        if (value == undefined) {
            return Promise.resolve()
        }
        if (widgetsStates.emailAvailability === "available") {
            return Promise.resolve()
        }
        else if (widgetsStates.emailAvailability === "unavailable") {
            return Promise.reject("O email inserido não está disponível")
        }
        else if (widgetsStates.emailAvailability === 'error') {
            return Promise.reject("Um erro inesperado impediu a verificação de disponibilidade deste e-mail")
        }
        else {
            return Promise.reject("Insira um endereço de e-mail válido")
        }
    }


    const sendPrimaryEmailChangeMail: FormProps<SendPrimaryEmailChangeMailFormType>['onFinish'] = async (form) => {
        setWidgetsStates({ ...widgetsStates, loading: true })

        // the service requires a high STL level
        authAppContext.checkMinimumStl("ROLE_STL_MOST_SECURE", (securityCheck) => {
            if (securityCheck.hasRequiredStl) {
                AuthenticationService.sendPrimaryEmailChangeMail({
                    newPrimaryEmail: form.newPrimaryEmail
                })
                    .then((tokenAndPayload) => {
                        appContext.message.success({
                            content: 'E-mail enviado com sucesso',
                            duration: 3
                        })
                        setWidgetsStates({ ...widgetsStates, emailSent: true, loading: false })
                        setSendEmailChangeTimeoutUntil(addMinutes(new Date(), 1))
                        props.onSuccess(tokenAndPayload)
                    })
                    .catch((e) => {
                        const error = new ApiError(e)
                        if (error.errorType === 'TOO_MANY_REQUESTS') {
                            appContext.message.warning({
                                content: 'Você acabou de solicitar a troca de e-mail primário. Aguarde 1 minuto para realizar outro pedido.',
                                duration: 8
                            })
                        }
                        else {
                            console.error(e)
                        }
                        setWidgetsStates({ ...widgetsStates, emailSent: false, loading: false })
                    })
            }
        })
    }

    return (
        <>
            <Form
                form={sendPrimaryEmailChangeForm}
                name="send-primary-email-change-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="true"
                size="large"
                onFinish={sendPrimaryEmailChangeMail}
            >
                <Form.Item<SendPrimaryEmailChangeMailFormType>
                    label="Novo e-mail primário"
                    name="newPrimaryEmail"
                    rules={[{ validator: primaryEmailValidator }, { max: 120, message: 'Apenas 120 caracteres são permitidos neste campo' }]}
                >
                    <AvailableEmailInput
                        disabled={widgetsStates.emailSent}
                        onEmailAvailabilityChange={(emailAvailable) => setWidgetsStates({ ...widgetsStates, emailAvailability: emailAvailable })}
                    />
                </Form.Item>
                <Form.Item label={null}>
                    <TimeoutButton 
                        type="primary" 
                        htmlType="submit" 
                        loading={widgetsStates.loading} 
                        disabled={props.onSuccessState}
                        size="middle" 
                        timeoutUntil={sendEmailChangeTimeoutUntil}
                    >
                        Enviar e-mail de checagem
                    </TimeoutButton>
                </Form.Item>
                {
                    // (props.onReset && props.onSuccessState)
                    //     ?
                    //     <Form.Item label={null}>
                    //         <Link onClick={props.onReset}><EditOutlined /> Inserir outro e-mail</Link>
                    //     </Form.Item>
                    //     :
                    //     <></>
                }
            </Form>

        </>
    )
}