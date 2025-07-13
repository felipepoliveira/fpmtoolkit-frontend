import { ParagraphProps } from "antd/es/typography/Paragraph"
import { useEffect, useState } from "react"

interface TimerProps extends ParagraphProps {
    /**
     * When the timer will finish
     */
    finishesAt: Date,

    /**
     * Flag that indicates if the timer component should disappear after it finishes
     */
    hideWhenFinished?: boolean,
}

export default function Timer({ finishesAt, hideWhenFinished, ...otherProps }: TimerProps) {
    const [now, setNow] = useState(Date.now())

    // Update the current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const timeLeftMs = finishesAt.getTime() - now
    const isFinished = timeLeftMs <= 0

    const timeDifference = new Date(Math.max(0, timeLeftMs))

    if (isFinished && hideWhenFinished) {
        return null
    }

    return (
        <span {...otherProps}>
            {timeDifference.toISOString().substring(11, 19)} {/* HH:MM:SS */}
        </span>
    )
}
