import { useContext } from "react";
import SidebarContext from "../context/sidebarContext";

export function useSidebarContext () {
    const context = useContext(SidebarContext);

    if (!context)
        throw new Error("error create sidebar context")

    return context
}