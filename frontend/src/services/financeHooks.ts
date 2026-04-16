import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveFinanceTransfer,
  createFinanceTransaction,
  createFinanceTransfer,
  exportFinanceMonthlyXlsx,
  exportFinanceWeeklyPdf,
  exportFinanceWeeklyXlsx,
  exportFinanceMonthlyPdf,
  getFinanceBalance,
  getFinanceMonthlyReport,
  getFinanceWeeklyReport,
  getFinanceTransfers,
  getFinanceTransactions,
  rejectFinanceTransfer,
  type GetFinanceTransfersParams,
  type GetFinanceTransactionsParams,
} from './financeApiService'
import type { FinanceFundType } from '@/types'

export const useFinanceTransactions = (params?: GetFinanceTransactionsParams) =>
  useQuery({
    queryKey: ['admin', 'finance', 'transactions', params],
    queryFn: () => getFinanceTransactions(params),
    staleTime: 1000 * 30,
  })

export const useFinanceBalance = (fundType: FinanceFundType, queryEnabled = true) =>
  useQuery({
    queryKey: ['admin', 'finance', 'balance', fundType],
    queryFn: () => getFinanceBalance(fundType),
    enabled: !!fundType && queryEnabled,
    staleTime: 1000 * 15,
  })

export const useCreateFinanceTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFinanceTransaction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', variables.fund_type] })
    },
  })
}

export const useCreateFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createFinanceTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transfers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_besar'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_kecil'] })
    },
  })
}

export const useApproveFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: approveFinanceTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transfers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_besar'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_kecil'] })
    },
  })
}

export const useRejectFinanceTransfer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rejectFinanceTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transactions'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'transfers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_besar'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'finance', 'balance', 'kas_kecil'] })
    },
  })
}

export const useFinanceTransfers = (params?: GetFinanceTransfersParams) =>
  useQuery({
    queryKey: ['admin', 'finance', 'transfers', params],
    queryFn: () => getFinanceTransfers(params),
    staleTime: 1000 * 30,
  })

export const useFinanceMonthlyReport = (
  params: { fund_type: FinanceFundType; year: number; month: number },
  queryEnabled = true
) =>
  useQuery({
    queryKey: ['admin', 'finance', 'monthly-report', params],
    queryFn: () => getFinanceMonthlyReport(params),
    enabled: Boolean(params.fund_type && params.year && params.month) && queryEnabled,
    staleTime: 1000 * 30,
  })

export const useExportFinanceMonthlyXlsx = () =>
  useMutation({
    mutationFn: exportFinanceMonthlyXlsx,
  })

export const useExportFinanceMonthlyPdf = () =>
  useMutation({
    mutationFn: exportFinanceMonthlyPdf,
  })

export const useFinanceWeeklyReport = (params: { anchor_date: string }, queryEnabled = true) =>
  useQuery({
    queryKey: ['admin', 'finance', 'weekly-report', params],
    queryFn: () => getFinanceWeeklyReport(params),
    enabled: Boolean(params.anchor_date) && queryEnabled,
    staleTime: 1000 * 30,
  })

export const useExportFinanceWeeklyXlsx = () =>
  useMutation({
    mutationFn: exportFinanceWeeklyXlsx,
  })

export const useExportFinanceWeeklyPdf = () =>
  useMutation({
    mutationFn: exportFinanceWeeklyPdf,
  })

