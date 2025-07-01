import { BasicProps } from "antd/es/layout/layout";
import { CSSProperties } from "react";

interface SectionProps extends BasicProps {

}

export default function Section({ style, ...props}: SectionProps): React.ReactNode {
    const defaultStyle : CSSProperties = {
        border: '1px solid #cccccc',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        ...style
    }
    
    return (
        <div {...props} style={ defaultStyle }>

        </div>
    )
}