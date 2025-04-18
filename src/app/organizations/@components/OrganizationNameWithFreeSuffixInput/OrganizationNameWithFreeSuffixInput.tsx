import { Input, InputProps, Typography } from "antd";
import { RandomString } from "../../../../commons/random";
import Paragraph from "antd/es/typography/Paragraph";

interface OrganizationNameWithFreeSuffixInputProps extends InputProps {
    suffix: string
}

export default function OrganizationNameWithFreeSuffixInput({ value, suffix, ...props }: OrganizationNameWithFreeSuffixInputProps): React.ReactNode {
    return (
        <>
            <Input 
                value={value}
                {...props}
                addonAfter={<Typography>{suffix}</Typography>}
            />
            <Paragraph>{value}{suffix}</Paragraph>
            <Paragraph type='warning'>É adicionado automaticamente um sufixo no final do identificador</Paragraph>
        </>
    )
}

/**
 * Function that tests a input to check if only contains valid characters
 * @param input 
 * @returns 
 */
OrganizationNameWithFreeSuffixInput.isValid = (input: string): boolean => /^[a-zA-Z0-9_-]{1,30}$/.test(input)

/**
 * Function that normalizes an input string to only contain valid characters and limits its length to 30 characters.
 * @param input The input string to normalize.
 * @returns A normalized string with only valid characters and a maximum length of 30.
 */
OrganizationNameWithFreeSuffixInput.normalize = (input: string): string => {
    // Remove invalid characters and trim to a maximum of 30 characters
    const normalized = input.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
    return normalized;
  };

OrganizationNameWithFreeSuffixInput.randomSuffix = () : string => '-' + RandomString.generate(RandomString.SEED_LOWER_CASE_LETTERS + RandomString.SEED_DIGITS, 9)
