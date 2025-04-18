import { ArrowLeftOutlined } from "@ant-design/icons";
import { Breadcrumb, Space } from "antd";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { BasicProps } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { CSSProperties } from "react";
import { useNavigate } from "react-router";


interface NavigationBarProps extends BasicProps {
    /**
     * The title of the navigation bar
     */
    title: string,
    /**
     * The URL used in the return button.
     */
    returnUrl?: string,

    /**
     * Render the return button when is undefined or true, otherwise hide the button
     */
    showNavigationButtons?: boolean,

    /**
     * Breadcrumbs to be displayed in the navigation bar.
     */
    breadcrumbs?: ItemType[]
}

export default function NavigationBar({ title, returnUrl, showNavigationButtons: showReturnButton, breadcrumbs, ...otherProps }: NavigationBarProps): React.ReactElement {

    const navigate = useNavigate()

    const defaultContainerStyle: CSSProperties = {
        // backgroundColor: '#fefefe',
        padding: '8px 12px'
    }

    return (
        <div style={{ ...defaultContainerStyle, ...otherProps.style }}>
            <Space size={[24, 32]} align='baseline'>
                <ArrowLeftOutlined
                    style={{ 
                        color: '#ddddddd', 
                        display: (showReturnButton === true || showReturnButton === undefined) ? 'unset' : 'none',  // hide if set
                        fontSize: '14px' 
                    }}
                    onClick={() => (returnUrl) ? navigate(returnUrl) : navigate(-1)}
                />
                <Title level={5} style={{ margin: '0px' }}>{title}</Title>
            </Space>
            <br/>
            {
                (breadcrumbs !== undefined && breadcrumbs.length > 0) && (
                    <Breadcrumb style={{ marginLeft: 38 }} items={breadcrumbs} />
                )
            }
        </div>
    )
}