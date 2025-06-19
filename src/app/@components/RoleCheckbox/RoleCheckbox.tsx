import { InfoCircleOutlined } from "@ant-design/icons";
import { Checkbox, CheckboxProps, Space, Tooltip } from "antd";
import { LabeledOrganizationMemberRole } from "../../../types/backend-api/organization-member";

interface RoleCheckboxProps extends CheckboxProps{
    source: LabeledOrganizationMemberRole,
}

export default function RoleCheckbox({ source, ...checkboxProps }: RoleCheckboxProps): React.ReactNode {
    
    return (
        <>
            <Space>
                <Checkbox {...checkboxProps} value={source.value}>{source.label}</Checkbox>
                <Tooltip title={source.description}>
                    <InfoCircleOutlined />
                </Tooltip>
            </Space>
        </>
    )
}