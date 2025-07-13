import { Button, Form } from "antd";
import { PrimaryEmailChangeTokenAndPayload, UserModel } from "../../../../types/backend-api/user";
import VerificationCodeInput from "../../../@components/VerificationCodeInput/VerificationCodeInput";
import { useContext, useState } from "react";
import AuthenticationService from "../../../../api/backend-api/authentication";
import { AppContext } from "../../../App";
import ApiError from "../../../../api/backend-api/api-error";
import Paragraph from "antd/es/typography/Paragraph";
import Timer from "../../../@components/Timer/Timer";
import UserSessionStore from "../../../../store/user-session";
import { AuthenticatedAppContext } from "../../../AuthenticatedApp";

interface UpdatePrimaryEmailWithTokenFormProps {
    /**
     * 
     */
    emailChangeToken: PrimaryEmailChangeTokenAndPayload,

    /**
     * Callback that will be triggered when the email is changed successfully
     * @param updatedUser - The current state of the updated user
     * @returns 
     */
    onSuccess?: (updatedUser: UserModel) => void,
}

export default function UpdatePrimaryEmailWithTokenForm({ emailChangeToken, onSuccess }: UpdatePrimaryEmailWithTokenFormProps) {

    const appContext = useContext(AppContext)
    const authAppContext = useContext(AuthenticatedAppContext)
    const [verificationCode, setVerificationCode] = useState<string>()
    const [widgetsStates, setWidgetsStates] = useState({
        loading: false
    })

    async function updatePrimaryEmail() {
        // assert props are defined
        if (!verificationCode) {
            return
        }

        setWidgetsStates({ ...widgetsStates, loading: true })

        try {

            // Call API to change the authenticated user primary email
            const updatedUserData = await AuthenticationService.updatePrimaryEmailWithToken({
                confirmationCode: verificationCode,
                token: emailChangeToken.token
            })

            // refresh the user session data
            await authAppContext.refreshAuthenticatedUserSession()

            appContext.message.success({
                content: "E-mail primário alterado com sucesso",
                duration: 3
            })

            // trigger callback
            if (onSuccess) onSuccess(updatedUserData)
        } catch (e: any) {
            const error = new ApiError(e)
            if (error.errorType === 'INVALID_CREDENTIALS') {
                appContext.message.warning({
                    content: `Não foi possível completar a operação pois ela pode ter expirado. Realize o processo novamente.`,
                    duration: 8
                })
            }
            else {
                appContext.message.error({
                    content: `Um erro inesperado ocorreu ao tentar realizar a troca do e-mail`,
                    duration: 3
                })
                console.error(e)
            }


        } finally {
            setWidgetsStates({ loading: false })
        }
    }

    return (
        <>
            <Paragraph>Esta operação deve ser realizada em até <Timer finishesAt={new Date(emailChangeToken.payload.expiresAt)} /></Paragraph>
            <Form
                name="login-form"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                autoComplete="true"
                size="middle"
                onFinish={updatePrimaryEmail}
            >
                <Form.Item label="Código de verificação">
                    <VerificationCodeInput caseMode="upper" digits={8} onChange={setVerificationCode} />
                </Form.Item>
                <Form.Item label={null}>
                    <Button disabled={!verificationCode} htmlType="submit" loading={widgetsStates.loading} type="primary">Alterar e-mail</Button>
                </Form.Item>
            </Form>
        </>
    )
}