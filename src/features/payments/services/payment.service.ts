import axios from "axios";
import type { CreatePaymentDto } from "../types";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export const PaymentService = {
  addPayment: async (idInvoice: string, payload: CreatePaymentDto) => {
    const response = await axios.post(`${BASE}/payments/${idInvoice}`, payload, { headers: authHeader() });
    return response.data;
  },
};
