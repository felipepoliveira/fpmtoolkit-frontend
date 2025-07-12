import { Button, Divider, Form, Input, Modal, ModalProps } from "antd";
import { SyntheticEvent, useContext, useState } from "react";
import { AuthenticatedAppContext } from "../../AuthenticatedApp";
import { FormProps, useForm } from "antd/es/form/Form";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import AuthenticationService from "../../../api/backend-api/authentication";
import ApiError from "../../../api/backend-api/api-error";
import { AppContext } from "../../App";
import SessionCredentialsStore from "../../../store/session-credentials";

export interface StlElevationEvent {
    /**
     * Flag that indicates if the STL elevation process was successful
     */
    success: boolean
}

/**
 * The StlElevationModal component props
 */
interface StlElevationModalProps extends ModalProps {
    /**
     * Callback called when STL Elevation event is finished. This triggers when the modal was closed (by success or user input)
     * @param event 
     * @returns 
     */
    onFinish?: (event: StlElevationEvent) => void
}

/**
 * Type used in ant design form
 */
interface StlElevationWithPasswordForm {
    password: string,
}

export default function StlElevationModal({ onFinish, ...otherProps }: StlElevationModalProps): React.ReactNode {

    const appContext = useContext(AppContext)
    const authAppContext = useContext(AuthenticatedAppContext)
    const [form] = Form.useForm<StlElevationWithPasswordForm>()
    const { userData } = authAppContext.authenticatedUser()
    const [loading, setLoading] = useState(false)


    function onCancel(event: React.MouseEvent<HTMLButtonElement>) {
        if (otherProps.onCancel) otherProps.onCancel(event)
        if (onFinish) onFinish({ success: false })
    }

    function onClose(event: SyntheticEvent) {
        if (otherProps.onClose) otherProps.onClose(event)
        if (onFinish) onFinish({ success: false })
    }

    const authenticate: FormProps<StlElevationWithPasswordForm>['onFinish'] = async (formValues) => {

        setLoading(true)

        // try to authenticate the user
        try {

            // Set the new credentials in the store
            const tokenPayload = await AuthenticationService.generateAuthenticationTokenWithPassword({
                password: formValues.password
            })
            SessionCredentialsStore.store(tokenPayload.token)

            // Trigger the onFinish callback with success
            if (onFinish) onFinish({ success: true })
        } catch (e: any) {
            const error = new ApiError(e)
            if (error.errorType === 'FORBIDDEN') {
                appContext.message.warning({
                    content: "Credenciais inválidas",
                    duration: 1.6
                })
            }
            else {
                console.error(e)
                appContext.message.error({
                    content: "Ocorreu um erro inesperado ao autenticar-se no servidor",
                    duration: 3
                })
            }
        }
        finally {
            setLoading(false)
        }
    }
    return (
        <Modal {...otherProps} onClose={onClose} onCancel={onCancel}
            okText='Autenticar'
            cancelText='Cancelar'
            onOk={() => form.submit()}
            loading={loading}
        >
            <Title level={4}>Confirmação de Segurança</Title>
            <Paragraph>Olá {userData.presentationName}, insira sua senha abaixo para confirmação de segurança</Paragraph>
            <Divider />
            <Form
                form={form}
                name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={authenticate}
                autoComplete="true"
                size="large"
            >
                <Form.Item<StlElevationWithPasswordForm>
                    label="Senha"
                    name="password"
                    rules={[{ required: true, message: "Campo obrigatório" }]}
                >

                    <Input.Password autoFocus={true} />
                </Form.Item>
            </Form>
        </Modal>
    )
}