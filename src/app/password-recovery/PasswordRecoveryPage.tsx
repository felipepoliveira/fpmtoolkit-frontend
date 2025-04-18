import { JSX } from "react";
import NavigationBar from "../@components/NavigationBar/NavigationBar";

export default function PasswordRecoveryPage(): JSX.Element {
    window.document.title = "FPM Toolkit - Recuperação de Senha"
    return (
        <>
            <NavigationBar title="Recuperação de senha" />
        </>
    )
}