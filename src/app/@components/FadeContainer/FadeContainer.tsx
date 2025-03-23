import { motion } from "framer-motion"
import { JSX, useEffect } from "react"

interface FadeContainerProps {
    show: boolean,
    children: JSX.Element,
    autoHideTimeout?: number,
    onAutoHide?: () => void,
    doNotDisplayOnHide?: boolean
}

export default function FadeContainer(props: FadeContainerProps): JSX.Element {

    let autoHideTimeoutController: number | undefined = undefined;
    useEffect(() => {
        if (autoHideTimeoutController) {
            clearInterval(autoHideTimeoutController)
        }

        if (props.autoHideTimeout && props.onAutoHide && !autoHideTimeoutController) {
            
            autoHideTimeoutController = setTimeout(() => {
                props.onAutoHide?.()
            }, props.autoHideTimeout)
        }
    }, [props.show])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={props.show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ display: props.doNotDisplayOnHide && !props.show ? "none" : "block" }}
            >
            {props.children}
        </motion.div>
    )
}