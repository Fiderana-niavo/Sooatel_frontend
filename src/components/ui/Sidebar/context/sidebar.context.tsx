import React from "react";
import type { SidebarContextProps } from "../types/sidebar.type";

export const SidebarContext = React.createContext<SidebarContextProps | null>(null);
