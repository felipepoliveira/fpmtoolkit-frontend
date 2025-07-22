import { LoadingOutlined } from "@ant-design/icons";
import { Button, ButtonProps } from "antd";
import { useMemo, useState } from "react";
import Timer, { TimerFormat } from "./Timer/Timer";

interface TimeoutButtonProps extends ButtonProps {
    
    /**
     * When defined, set the timeout that will make the button disabled
     */
    timeoutUntil?: Date,
    /**
     * The format applied to the timer
     */
    timerFormat?: TimerFormat,
}

export default function TimeoutButton({ children, onClick, timeoutUntil, timerFormat, disabled, ...otherProps }: TimeoutButtonProps) {

    const [now, setNow] = useState(Date.now())

    const onTimeout = useMemo(() => {
        return timeoutUntil !== undefined && (timeoutUntil.getTime() - now) > 0
    }, [now, timeoutUntil])

    
    /**
     * Handles disabled status for the button giving priority to 'onTimeout' prop
     * @returns 
     */
    function checkDisabled() {
        if (onTimeout) {
            return true
        }

        return disabled
    }

    function timeoutOnClickEvent(event: React.MouseEvent<HTMLElement>) {
        setNow(Date.now())
        if (onClick) onClick(event)
    }

    function TimerFeedback() {
        // Render nothing of timeout is not defined
        if (!timeoutUntil) {
            return <></>
        }
        return (
            <Timer finishesAt={timeoutUntil} format={timerFormat} hideWhenFinished={true} onTick={(now) => setNow(now)} />
        )
    }

    return (
        <Button
            disabled={checkDisabled()}
            icon={(onTimeout) ? <LoadingOutlined /> : undefined}
            onClick={timeoutOnClickEvent}
            {...otherProps}
        >
            <TimerFeedback />
            {children}
        </Button>
    )
}