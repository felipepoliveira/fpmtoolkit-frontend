import { CheckOutlined, CiCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Input, InputProps, Progress } from "antd";
import { useEffect, useMemo, useState } from "react";

interface PasswordInputWithStrengthCheckerProps extends InputProps {
    /**
     * Callback triggered when the password rank changes
     * @param rank 
     * @returns 
     */
    onPasswordRankChange?: (rank: PasswordRank) => void,
}

export type PasswordRank = 'not-acceptable' | 'acceptable' | 'safe'

function calculatePasswordRank(password: string | undefined): PasswordRank {
    if (password === undefined) {
        return 'not-acceptable'
    }
    // At least it should have 6 characters
    if (password.length < 6) {
        return 'not-acceptable';
    }

    // Safety char flags
    let hasLowerCaseCharacter = false;
    let hasUpperCaseCharacter = false;
    let hasDigit = false;
    let hasNonBlankSymbol = false;

    // Evaluate safety char flags
    for (const c of password) {
        if (!hasLowerCaseCharacter && /[a-z]/.test(c)) {
            hasLowerCaseCharacter = true;
            continue;
        }
        if (!hasUpperCaseCharacter && /[A-Z]/.test(c)) {
            hasUpperCaseCharacter = true;
            continue;
        }
        if (!hasDigit && /[0-9]/.test(c)) {
            hasDigit = true;
            continue;
        }
        if (!hasNonBlankSymbol && /[^a-zA-Z0-9\s]/.test(c)) {
            hasNonBlankSymbol = true;
            continue;
        }
    }

    // Return the password rank
    return hasLowerCaseCharacter && hasUpperCaseCharacter && hasDigit && hasNonBlankSymbol
        ? 'acceptable'
        : 'not-acceptable';
}

export default function PasswordInputWithStrengthChecker(
    { value, onPasswordRankChange, ...otherInputProps}: PasswordInputWithStrengthCheckerProps
) {

    const [rank, setRank] = useState<PasswordRank>(calculatePasswordRank(value as string))
    const passwordProgressPercent = useMemo<number>(() => {
        switch (rank) {
            case 'acceptable':
            case 'safe':
                return 100
            case 'not-acceptable':
                return 33
        }
    }, [rank])

    // observe value to check the password strength
    useEffect(() => {
        setRank(calculatePasswordRank(value as string))
    }, [value])

    // Call the password rank change callback every time it changes
    useEffect(() => {
        onPasswordRankChange?.(rank)
    }, [rank])

    function ProgressText() {
        switch (rank) {
            case 'acceptable':
            case 'safe':
                return <>Segura <CheckOutlined/></>
            case 'not-acceptable':
                return <>Insegura <CloseCircleOutlined /></>
        }
    }

    return (
        <>
            <Input.Password {...otherInputProps} value={value} />
            <Progress 
                format={() => <ProgressText />}
                percent={passwordProgressPercent}
                size='small'
                status={(rank == 'safe' || rank == 'acceptable') ? undefined : 'exception'}
            />
        </>
    )
}