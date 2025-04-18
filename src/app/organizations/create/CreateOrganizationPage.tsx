import { Button, Form, Input } from "antd";
import { FormProps, useForm } from "antd/es/form/Form";
import { JSX, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import OrganizationService from "../../../api/backend-api/organization";
import NavigationBar from "../../@components/NavigationBar/NavigationBar";
import ReadContainer from "../../@components/ReadContainer/ReadContainer";
import { AppContext } from "../../App";
import OrganizationNameWithFreeSuffixInput from "../@components/OrganizationNameWithFreeSuffixInput/OrganizationNameWithFreeSuffixInput";

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
    const navigate = useNavigate()
    const location = useLocation()
    const queryParameters = new URLSearchParams(location.search)

    // if hideNavigation query parameter is === 'true' will hide the navigation controls in the NavigationBar
    const hideNavigationQueryParameter = queryParameters.get('hideNavigation')
    const hideNavigationButtons = hideNavigationQueryParameter === 'true'

    const appContext = useContext(AppContext)
    const [form] = useForm<CreateOrganizationForm>()
    const [loading, setLoading] = useState(false)
    const [randomSuffix] = useState(OrganizationNameWithFreeSuffixInput.randomSuffix())

    /**
     * Action triggered when createOrganization is called by the form
     * @param values 
     */
    const createOrganization: FormProps<CreateOrganizationForm>['onFinish'] = (values) => {
        const actionTimeout = 1200
        setLoading(true)
        OrganizationService.createOrganization({
            presentationName: values.presentationName,
            profileName: values.profileName + randomSuffix
        })
            .then(() => {
                appContext.message.success({
                    content: "Organização criada com sucesso",
                    duration: 3
                })
                navigate("/")
            })
            .catch(e => {
                console.error(e)
                appContext.message.error({
                    content: "Um erro inesperado impediu a criação da organização",
                    duration: 6
                })
            })
            .finally(() => {
                setTimeout(() => setLoading(false), actionTimeout)
            })
    }

    const profileNameValidator = () => {
        const profileNameWithSuffix = form.getFieldValue('profileName') as string + randomSuffix
        if (OrganizationNameWithFreeSuffixInput.isValid(profileNameWithSuffix)) {
            return Promise.resolve()
        }
        else if (profileNameWithSuffix.length > 30) {
            return Promise.reject('Nome de perfil deve ter no máximo 30 caracteres')
        }
        else {
            return Promise.reject('Identificador deve conter apenas caracteres: a-z, A-Z, 0-9, _ ou -')
        }
    }

    /**
     * This function will use the values defined by the user in presentation name field
     * as a automatic suggestion on organization identifier field
     */
    const suggestOrganizationProfileName = () => {
        const presentationName = (form.getFieldValue("presentationName") as string).slice(0, 20)
        form.setFieldValue("profileName", OrganizationNameWithFreeSuffixInput.normalize(presentationName))
    }

    return (
        <>
            <NavigationBar title="Criar uma nova organização" showNavigationButtons={!hideNavigationButtons} />
            <ReadContainer style={{ maxWidth: '680px' }}>
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
                        rules={[{ validator: profileNameValidator }]}
                    >

                        <OrganizationNameWithFreeSuffixInput suffix={randomSuffix} />
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Criar
                        </Button>
                    </Form.Item>
                </Form>
            </ReadContainer>
        </>
    )
}