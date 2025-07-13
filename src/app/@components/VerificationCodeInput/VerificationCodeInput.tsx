import { Col, Input, InputProps, InputRef, Row } from "antd";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { replaceAt } from "../../../commons/string";

type CaseMode = 'no-case-change' | 'upper' | 'lower'

interface VerificationCodeInputProps {
    /**
     * Character case pattern
     */
    caseMode?: CaseMode,

    /**
     * The amount of digits that will be rendered
     */
    digits: number,

    /**
     * Custom props that should applied in the grid input props
     */
    gridInputProps?: InputProps,

    /**
     * Callback triggered when all digits was inserted by the user
     * @param value 
     * @returns 
     */
    onChange?: (value: string) => void,
}

function handleStringWithCaseMode(input: string, caseMode: CaseMode): string {
    if (caseMode === 'lower') {
        return input.toLowerCase()
    }
    else if (caseMode === 'upper') {
        return input.toUpperCase()
    }

    return String(input)
}

function produceArrayOfInputRefs<T>(amount: number) {
    const inputRefs = []
    for (let inputRefIndex = 0; inputRefIndex < amount; inputRefIndex++) {
        inputRefs.push(useRef<T>(null))
    }
    return inputRefs
}

export default function VerificationCodeInput({ caseMode, digits, gridInputProps, onChange }: VerificationCodeInputProps) {

    const customGridInputProps = gridInputProps || {}

    if (digits < 1 || digits > 24) {
        console.warn("'digits' should be between 1 and 24")
        return (<Input />)
    }

    // The grid col span
    const colSpan = 24 / digits

    // Load all input refs that will be used to handle the component
    const gridInputRefs = produceArrayOfInputRefs<InputRef>(digits)

    // the value should start with the amount of digits given on props
    const [value, setValue] = useState(" ".repeat(digits))

    // Observe value mutations to trigger 'onChange' event when all digits are inserted, where:
    // if no blank spaces are defined and user defined a onChange callback, trigger it
    useEffect(() => {
        if (value.indexOf(" ") < 0 && onChange) {
            onChange(value)
        }
    }, [value])

    /**
     * 
     * @param event 
     * @param charIndex 
     */
    function onGridInputChange(event: ChangeEvent<HTMLInputElement>, charIndex: number) {

        event.preventDefault()

        // always get the last character of the input value as the new value
        let newValue = event.target.value.charAt(event.target.value.length - 1)

        // mutate the new value based on 'caseMode' parameter
        if (caseMode) {
            newValue = handleStringWithCaseMode(newValue, caseMode)
        }

        // if is not the last element send focus to the next one
        if (charIndex < gridInputRefs.length - 1) {
            const nextInput = gridInputRefs[charIndex + 1]
            if (nextInput.current) {
                nextInput.current.focus()
            }
        }

        // update the state of the input
        setValue(replaceAt(value, charIndex, newValue))
    }

    function onGridInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>, charIndex: number) {

        // ignore if not specific key events
        if (event.key !== "Backspace") {
            return
        }

        event.preventDefault()

        setValue(replaceAt(value, charIndex, " "))

        // set focus on the previous input
        if (charIndex > 0) {
            const previousInput = gridInputRefs[charIndex - 1]
            if (previousInput.current) {
                previousInput.current.focus()
            }
        }
    }

    function onGridInputPaste(event: React.ClipboardEvent<HTMLInputElement>, startIndex: number) {
        event.preventDefault();
        let pasteValue = event.clipboardData.getData("text").trim();
        if (!pasteValue) return;

        // assert that only pastes the value that fits the 'digits' parameter
        if (pasteValue.length > digits) {
            pasteValue = pasteValue.substring(0, digits)
        }

        // if the paste value does not fit the entire digits, set focus to the next input
        if (pasteValue.length < digits) {
            const nextInputRef = gridInputRefs[pasteValue.length]
            if (nextInputRef.current) nextInputRef.current.focus()
        }

        if (caseMode) {
            pasteValue = handleStringWithCaseMode(pasteValue, caseMode)
        }

        setValue(pasteValue)

    }


    return (
        <Row>
            {
                gridInputRefs.map((ref, i) => (
                    <Col span={colSpan}>
                        <Input
                            onChange={(event) => onGridInputChange(event, i)}
                            onKeyDown={(event) => onGridInputKeyDown(event, i)}
                            onPaste={(event) => onGridInputPaste(event, i)}
                            style={{ textAlign: 'center' }}
                            ref={ref}
                            value={value[i]}
                            {...customGridInputProps}
                        />
                    </Col>
                ))
            }
        </Row>
    )
}