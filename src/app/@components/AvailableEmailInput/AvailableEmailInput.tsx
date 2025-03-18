import { MailOutlined } from "@ant-design/icons";
import { Input, InputProps, Spin } from "antd";
import { JSX, useState } from "react";

/**
 * Properties for the AvailableEmailInput component.
 */
interface AvailableEmailInputProps extends InputProps {

}

/**
 * The state of the AvailableEmailInput component.
 */
type AvailableEmailInputState = "editing" | "checking" | "checked";

/**
 * The state of the email availability.
 */
type EmailAvailableState = "available" | "unavailable";

/**
 * A component that allows users to input an email address and checks if it is available.
 */
export default function AvailableEmailInput(props: AvailableEmailInputProps): JSX.Element {

    const [inputState, setInputState] = useState<AvailableEmailInputState>("editing");
    const [emailAvailableState, setEmailAvailableState] = useState<EmailAvailableState>("available");

    function checkEmailAvailability() {
        setInputState("checking")
    }

    let onChangeTimeoutController : number | undefined = undefined
    function onChange() {
        setInputState("editing")
        if (onChangeTimeoutController) {
            clearTimeout(onChangeTimeoutController)
            onChangeTimeoutController = undefined
            console.log("Clearing timeout")
        }
        onChangeTimeoutController = setTimeout(() => {
            checkEmailAvailability()
        }, 1200)
    }

    /**
     * @returns The JSX element that represents the email availability state.
     */
    function EmailAvailabilityIdentifierAddon(): JSX.Element {
        switch (inputState) {
            case "editing": return <MailOutlined />
            case "checking": return <Spin />
            case "checked":
                switch (emailAvailableState) {
                    case "available":
                        return <span style={{ color: "green" }}>✓</span>;
                    case "unavailable":
                        return <span style={{ color: "red" }}>✗</span>;
                }
        }
    }

    return (
        <Input {...props}
            addonAfter={<EmailAvailabilityIdentifierAddon />}
            onBlur={(event) => {
                checkEmailAvailability()
                if (props.onBlur) {
                    props.onBlur(event)
                }
            }}
            onChange={(event) => {
                onChange()
                if (props.onChange) {
                    props.onChange(event)
                }
            }}
        />
    );
}