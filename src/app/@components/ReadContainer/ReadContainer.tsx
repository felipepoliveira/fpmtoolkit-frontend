import { Layout } from "antd";
import { JSX } from "react";

interface ReadContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: JSX.Element | JSX.Element[] | undefined
}

export default function ReadContainer({ children, style, ...otherProps }: ReadContainerProps): JSX.Element {
    return (
        <div style={{
            maxWidth: 1080,
            margin: '24px auto',
            padding: '24px 64px',
            width: "100%",
            ...style
        }}
            {...otherProps}
        >
            {children}
        </div>
    )
}