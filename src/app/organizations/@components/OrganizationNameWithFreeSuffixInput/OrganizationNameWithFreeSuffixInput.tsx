import { Input, InputProps, Typography } from "antd";
import { RandomString } from "../../../../commons/random";
import Paragraph from "antd/es/typography/Paragraph";

interface OrganizationNameWithFreeSuffixInputProps extends InputProps {

}

export default function OrganizationNameWithFreeSuffixInput({ value, ...props }: OrganizationNameWithFreeSuffixInputProps): React.ReactNode {
    const randomCode = "-" + RandomString.generate(RandomString.SEED_LOWER_CASE_LETTERS + RandomString.SEED_DIGITS, 9)
    return (
        <>
            <Input 
                {...props}
                value={value}
                addonAfter={<Typography>{randomCode}</Typography>}
            />
            <Paragraph>{value}{randomCode}</Paragraph>
        </>
    )
}