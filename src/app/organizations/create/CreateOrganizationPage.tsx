import { Button, Divider, Flex, Form, Input } from "antd";
import { FormProps, useForm } from "antd/es/form/Form";
import Title from "antd/es/typography/Title";
import { JSX, useContext, useState } from "react";
import OrganizationService from "../../../api/backend-api/organization";
import ReadContainer from "../../@components/ReadContainer/ReadContainer";
import OrganizationNameWithFreeSuffixInput from "../@components/OrganizationNameWithFreeSuffixInput/OrganizationNameWithFreeSuffixInput";
import ApiError from "../../../api/backend-api/api-error";
import { AppContext } from "../../App";

interface CreateOrganizationForm {
    /**
     * The presentation name of the organization
     */
    presentationName: string,
    /**
     * The profile name of the organization
     */
    profileName: string,
}

export default function CreateOrganizationPage(): JSX.Element {
    const appContext = useContext(AppContext)
    const [form] = useForm<CreateOrganizationForm>()
    const [loading, setLoading] = useState(false)

    /**
     * Action triggered when createOrganization is called by the form
     * @param values 
     */
    const createOrganization : FormProps<CreateOrganizationForm>['onFinish'] = (values) => {
        const actionTimeout = 1200
        setLoading(true)
        console.log(values)
        OrganizationService.createOrganization(values)
        .then((response) => {
            console.log("Criado com sucesso", response)
        })
        .catch(e => {
            console.error(e)
            appContext.message.error({
                content: "Um erro inesperado impediu a criação da organização",
                duration: 3
            })
        })
        .finally(() => {
            setTimeout(() => setLoading(false) , actionTimeout)
        })
    }

    /**
     * This function will use the values defined by the user in presentation name field
     * as a automatic suggestion on organization identifier field
     */
    const suggestOrganizationProfileName = () => {
        const presentationName = form.getFieldValue("presentationName")
        form.setFieldValue("profileName", presentationName)
    }

    return (
        <Flex align="center" vertical>
            <ReadContainer style={{ height: '600px' }}>
                <Title>Criar nova organização</Title>
                <Divider />
                <Form
                    form={form}
                    name="create-organization-form"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    autoComplete="false"
                    onFinish={createOrganization}
                    size="large"
                    style={{ maxWidth: 600, width: '100%' }}
                >
                    <Form.Item<CreateOrganizationForm>
                        label="Nome da sua organização"
                        name="presentationName"
                    >

                        <Input onChange={suggestOrganizationProfileName} />
                    </Form.Item>
                    <Form.Item<CreateOrganizationForm>
                        label="Identificador da organização"
                        name="profileName"
                    >

                        <OrganizationNameWithFreeSuffixInput />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar
                        </Button>
                    </Form.Item>
                </Form>
            </ReadContainer>
        </Flex>
    )
}