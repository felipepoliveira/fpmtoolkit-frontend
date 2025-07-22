import { ParagraphProps } from "antd/es/typography/Paragraph"
import { differenceInHours, differenceInMinutes, formatDate } from "date-fns"
import { useEffect, useMemo, useState } from "react"

export type TimerFormat = 'time-fit' | string

interface TimerProps extends ParagraphProps {
    /**
     * When the timer will finish
     */
    finishesAt: Date,

    /**
     * The format of the date. It uses date-fns to format according to doc found in: https://date-fns.org/v4.1.0/docs/format
     */
    format?: TimerFormat,

    /**
     * Flag that indicates if the timer component should disappear after it finishes
     */
    hideWhenFinished?: boolean,

    /**
     * Callback triggered every time on internal setInterval is triggered
     * @param now 
     * @returns 
     */
    onTick?: (now: number) => void,
}

export default function Timer({ format, finishesAt, hideWhenFinished, onTick, ...otherProps }: TimerProps) {
    const [now, setNow] = useState(Date.now())

    // Update the current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            setNow(now)
            onTick?.(now)
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const appliedFormat = useMemo(() => {

        if (format === 'time-fit') {
            if (differenceInHours(finishesAt, now) > 0) {
                return 'HH:mm:ss'
            }
            else {
                return "mm:ss"
            }
        }

        return format || "HH:mm:ss"
    }, [now])

    const timeLeftMs = finishesAt.getTime() - now
    const isFinished = timeLeftMs <= 0

    const timeDifference = new Date(Math.max(0, timeLeftMs))

    if (isFinished && hideWhenFinished) {
        return null
    }

    return (
        <span {...otherProps}>
            {formatDate(timeDifference, appliedFormat)} {/* HH:MM:SS */}
        </span>
    )
}
