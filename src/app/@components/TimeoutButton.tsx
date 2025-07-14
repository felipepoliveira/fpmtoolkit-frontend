import { Button, ButtonProps } from "antd";
import Timer from "./Timer/Timer";
import { useMemo, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

interface TimeoutButtonProps extends ButtonProps {
    /**
     * When defined, set the timeout that will make the button disabled
     */
    timeoutUntil?: Date,
}

export default function TimeoutButton({ children, onClick, timeoutUntil, ...otherProps }: TimeoutButtonProps) {

    const [now, setNow] = useState(Date.now())

    

    const onTimeout = useMemo(() => {
        return (timeoutUntil && (now - timeoutUntil.getTime() < 0))
    }, [now])

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
            <Timer finishesAt={timeoutUntil} hideWhenFinished={true} />
        )
    }

    return (
        <Button
            disabled={onTimeout}
            icon={(onTimeout) ? <LoadingOutlined /> : undefined}
            onClick={timeoutOnClickEvent}
            {...otherProps}
        >
            <TimerFeedback />
            {children}
        </Button>
    )
}