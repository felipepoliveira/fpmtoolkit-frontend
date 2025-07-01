import Title from "antd/es/typography/Title";
import NavigationBar from "../@components/NavigationBar/NavigationBar";
import ReadContainer from "../@components/ReadContainer/ReadContainer";
import Section from "../@components/Section/Section";
import { Alert, Button, Col, Divider, Row, Space } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import { Link } from "react-router";
import { ClockCircleOutlined, MailOutlined } from "@ant-design/icons";
import { useContext, useState } from "react";
import { AuthenticatedAppContext } from "../AuthenticatedApp";
import AuthenticationService from "../../api/backend-api/authentication";
import { AppContext } from "../App";

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
        return (
            <Section id="sec-password">
                <Title level={3}>Alterar senha</Title>
                <Paragraph>Altere sua senha</Paragraph>
                <Divider />
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