import Search, { SearchProps } from "antd/es/input/Search";
import { ChangeEvent, useEffect, useState } from "react";

interface DebouncedChangeEvent {
    value: string,
}

interface DebouncedSearchProps extends SearchProps {
    /**
     * The amount of milliseconds that the component should handle debounce events
     */
    debounceAfter: number,

    /**
     * Event that will be triggered after the debounced timeout
     * @param event
     * @returns 
     */
    onDebouncedChange?: (event: DebouncedChangeEvent) => void,
}

export default function DebouncedSearch({ debounceAfter, loading, onChange, onDebouncedChange, ...otherProps }: DebouncedSearchProps) {
    const [isDeboucing, setIsDeboucing] = useState(false)
    const [value, setValue] = useState("")

    useEffect(() => {
        setIsDeboucing(true)
        const timeoutHandler = setTimeout(() => {
            onDebouncedChange?.({
                value: value
            })
            setIsDeboucing(false)
        },debounceAfter)
        
        return () => {
            clearInterval(timeoutHandler)
        }
    }, [value])

    function handleDebouncedChange(event: ChangeEvent<HTMLInputElement>) {
        onChange?.(event)
        setValue(event.target.value)
    }

    return (
        <Search onChange={handleDebouncedChange} {...otherProps} loading={loading || isDeboucing} />
    )
}