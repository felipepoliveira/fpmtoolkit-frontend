import { Layout } from "antd";
import { JSX } from "react";

interface ReadContainerProps {
    children: JSX.Element | JSX.Element[] | undefined
}

export default function ReadContainer(props: ReadContainerProps): JSX.Element{
    return (
        <Layout style={{
            maxWidth: 1080,
            margin: '24px auto',
            padding: '24px 24px',
        }}>
            {props.children}
        </Layout>
    )
}