import axios from "axios";
import type { CompanyConfig } from "../constants/ticket.constants";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const CompanyService = {
  getInfo: async (): Promise<CompanyConfig> => {
    const response = await axios.get(`${BASE}/settings/company`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.payload as CompanyConfig;
  },
};
