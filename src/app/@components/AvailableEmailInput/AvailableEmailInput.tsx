import { CheckOutlined, ExclamationCircleOutlined, MailOutlined } from "@ant-design/icons";
import { Input, InputProps, Spin } from "antd";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import AuthenticationService from "../../../api/backend-api/authentication";

export type EmailAvailabilityState = "available" | "unavailable" | "unknown" | "error";

interface AvailableEmailInputProps extends InputProps {
    value?: string; // Controlled value from Ant Design Form
    onChange?: ChangeEventHandler<HTMLInputElement>; // Syncs with Form
    onEmailAvailabilityChange?: (emailAvailability: EmailAvailabilityState) => void;
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function AvailableEmailInput({ value = "", onChange, onEmailAvailabilityChange, ...props }: AvailableEmailInputProps) {
    const [inputState, setInputState] = useState<"editing" | "checking" | "checked">("editing");
    const [emailAvailableState, setEmailAvailableState] = useState<EmailAvailabilityState>("unknown");

    const lastCheckedEmail = useRef<string>("");
    const emailAvailableDebounce = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!value || !emailRegex.test(value)) {
            setInputState("editing");
            onEmailAvailabilityChange?.("unknown");
            return;
        }

        if (value === lastCheckedEmail.current) return;

        setInputState("checking");
        lastCheckedEmail.current = value;
        if (emailAvailableDebounce.current) clearTimeout(emailAvailableDebounce.current);

        emailAvailableDebounce.current = setTimeout(() => {
            AuthenticationService.isEmailAvailableToUse(value)
            .then(response => {
                const availability = response.isAvailable ? "available" : "unavailable";
                setEmailAvailableState(availability);
                onEmailAvailabilityChange?.(availability);
            })
            .catch(() => {
                setEmailAvailableState("error");
                onEmailAvailabilityChange?.("error");
            })
            .finally(() => setInputState("checked"));
        }, 1200);
    }, [value]); // Triggers when the value changes

    return (
        <Input
            {...props}
            value={value}
            onChange={onChange} // Syncs with Form
            addonAfter={
                inputState === "checking" ? <Spin /> :
                inputState === "checked" && emailAvailableState === "available" ? <CheckOutlined style={{ color: "green" }} /> :
                inputState === "checked" && emailAvailableState === "unavailable" ? <ExclamationCircleOutlined style={{ color: "red" }} /> :
                <MailOutlined />
            }
        />
    );
}

export default AvailableEmailInput;
