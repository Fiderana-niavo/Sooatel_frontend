import axios from "axios";
import type { DashboardSummary, TopProductsResult, ProductDetail } from "../types/dashboard";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const ROOT = `${BASE}/dashboard/saledashboard`;

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const params = (startDate: string, endDate: string) => ({ startDate, endDate });

// ── CA ─────────────────────────────────────────────────────────────────────────

const getCaSummary = async (startDate: string, endDate: string): Promise<DashboardSummary> => {
  const response = await axios.get(`${ROOT}/ca/summary`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as DashboardSummary;
};

const getCaTopProducts = async (startDate: string, endDate: string): Promise<TopProductsResult> => {
  const response = await axios.get(`${ROOT}/ca/top-products`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as TopProductsResult;
};

const getCaProductDetail = async (
  idMenu: string,
  startDate: string,
  endDate: string
): Promise<ProductDetail> => {
  const response = await axios.get(`${ROOT}/ca/product/${idMenu}`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as ProductDetail;
};

// ── Bénéfice ───────────────────────────────────────────────────────────────────

const getBenefitSummary = async (startDate: string, endDate: string): Promise<DashboardSummary> => {
  const response = await axios.get(`${ROOT}/benefit/summary`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as DashboardSummary;
};

const getBenefitTopProducts = async (
  startDate: string,
  endDate: string
): Promise<TopProductsResult> => {
  const response = await axios.get(`${ROOT}/benefit/top-products`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as TopProductsResult;
};

const getBenefitProductDetail = async (
  idMenu: string,
  startDate: string,
  endDate: string
): Promise<ProductDetail> => {
  const response = await axios.get(`${ROOT}/benefit/product/${idMenu}`, {
    params: params(startDate, endDate),
    headers: authHeader(),
  });
  return response.data.payload as ProductDetail;
};

export const CaDashboardService = {
  getSummary: getCaSummary,
  getTopProducts: getCaTopProducts,
  getProductDetail: getCaProductDetail,
};

export const BenefitDashboardService = {
  getSummary: getBenefitSummary,
  getTopProducts: getBenefitTopProducts,
  getProductDetail: getBenefitProductDetail,
};
