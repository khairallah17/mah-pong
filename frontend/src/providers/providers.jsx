import SidebarContextProvider from "./sidebarProvider";

export default function Providers({ children }) {
    return (
        <SidebarContextProvider>
            {children}
        </SidebarContextProvider>
    )
}