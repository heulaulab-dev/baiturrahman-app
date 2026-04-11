import api from '@/lib/axios'
import type { ApiResponse, FinanceBalanceResponse, FinanceFundType, FinanceTransaction, PaginatedResponse } from '@/types'

export interface GetFinanceTransactionsParams {
  page?: number
  limit?: number
  fund_type?: FinanceFundType
  tx_type?: string
  category?: string
  from?: string
  to?: string
}

export interface CreateFinanceTransactionRequest {
  fund_type: FinanceFundType
  tx_type: 'pemasukan' | 'pengeluaran' | 'opening_balance' | 'adjustment'
  tx_date: string
  amount: number
  category: string
  description: string
  reference_no?: string
  display_below?: boolean
}

export interface CreateFinanceTransferRequest {
  tx_date: string
  amount: number
  description: string
}

export interface GetFinanceTransfersParams {
  page?: number
  limit?: number
  status?: 'pending' | 'approved' | 'rejected'
  from?: string
  to?: string
}

export interface FinanceMonthlyReportResponse {
  fund_type: FinanceFundType
  year: number
  month: number
  opening_balance: number
  closing_balance: number
  total_income: number
  total_expense: number
  rows: Array<{
    id: string
    tx_date: string
    tx_type: string
    category: string
    description: string
    amount: number
    running_balance: number
    display_below: boolean
    reference_no?: string | null
  }>
  display_below: Array<{
    id: string
    tx_date: string
    tx_type: string
    category: string
    description: string
    amount: number
    running_balance: number
    display_below: boolean
    reference_no?: string | null
  }>
}

export const getFinanceTransactions = async (
  params: GetFinanceTransactionsParams = {}
): Promise<PaginatedResponse<FinanceTransaction>> => {
  const response = await api.get<PaginatedResponse<FinanceTransaction>>('/v1/admin/finance/transactions', { params })
  return response.data
}

export const createFinanceTransaction = async (
  payload: CreateFinanceTransactionRequest
): Promise<FinanceTransaction> => {
  const response = await api.post<ApiResponse<FinanceTransaction>>('/v1/admin/finance/transactions', payload)
  return response.data.data
}

export const getFinanceBalance = async (fundType: FinanceFundType): Promise<FinanceBalanceResponse> => {
  const response = await api.get<ApiResponse<FinanceBalanceResponse>>('/v1/admin/finance/balance', {
    params: { fund_type: fundType },
  })
  return response.data.data
}

export const createFinanceTransfer = async (
  payload: CreateFinanceTransferRequest
): Promise<{ linked_transfer_id: string; status: string }> => {
  const response = await api.post<ApiResponse<{ linked_transfer_id: string; status: string }>>(
    '/v1/admin/finance/transfers',
    payload
  )
  return response.data.data
}

export const approveFinanceTransfer = async (id: string): Promise<{ linked_transfer_id: string; status: string }> => {
  const response = await api.put<ApiResponse<{ linked_transfer_id: string; status: string }>>(
    `/v1/admin/finance/transfers/${id}/approve`
  )
  return response.data.data
}

export const rejectFinanceTransfer = async (id: string): Promise<{ linked_transfer_id: string; status: string }> => {
  const response = await api.put<ApiResponse<{ linked_transfer_id: string; status: string }>>(
    `/v1/admin/finance/transfers/${id}/reject`
  )
  return response.data.data
}

export const getFinanceTransfers = async (
  params: GetFinanceTransfersParams = {}
): Promise<PaginatedResponse<FinanceTransaction>> => {
  const response = await api.get<PaginatedResponse<FinanceTransaction>>('/v1/admin/finance/transfers', { params })
  return response.data
}

export const getFinanceMonthlyReport = async (params: {
  fund_type: FinanceFundType
  year: number
  month: number
}): Promise<FinanceMonthlyReportResponse> => {
  const response = await api.get<ApiResponse<FinanceMonthlyReportResponse>>('/v1/admin/finance/reports/monthly', {
    params: { ...params, month: String(params.month).padStart(2, '0') },
  })
  return response.data.data
}

export const exportFinanceMonthlyCsv = async (params: {
  fund_type: FinanceFundType
  year: number
  month: number
}): Promise<void> => {
  const response = await api.get<Blob>('/v1/admin/finance/reports/monthly/csv', {
    params: { ...params, month: String(params.month).padStart(2, '0') },
    responseType: 'blob',
  })
  const blob = response.data as unknown as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-${params.fund_type}-${params.year}-${String(params.month).padStart(2, '0')}.csv`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const exportFinanceMonthlyPdf = async (params: {
  fund_type: FinanceFundType
  year: number
  month: number
}): Promise<void> => {
  const response = await api.get<Blob>('/v1/admin/finance/reports/monthly/pdf', {
    params: { ...params, month: String(params.month).padStart(2, '0') },
    responseType: 'blob',
  })
  const blob = response.data as unknown as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-${params.fund_type}-${params.year}-${String(params.month).padStart(2, '0')}.pdf`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

