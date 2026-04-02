'use client';

import { useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { useDeleteReservation, useUpdateReservation } from '@/services/adminHooks';
import type { ReservationStatus } from '@/types';

function toastApiError(err: unknown, fallback: string) {
	if (axios.isAxiosError(err)) {
		const msg = (err.response?.data as { error?: string })?.error;
		toast.error(msg ?? fallback);
	} else {
		toast.error(fallback);
	}
}

/**
 * Mutasi admin reservasi: toast, penanganan error API, dan invalidate query (via admin hooks).
 */
export function useReservationAdminActions() {
	const updateMutation = useUpdateReservation();
	const deleteMutation = useDeleteReservation();

	const patchStatus = useCallback(
		async (id: string, status: ReservationStatus): Promise<boolean> => {
			try {
				await updateMutation.mutateAsync({ id, data: { status } });
				toast.success('Status reservasi diperbarui');
				return true;
			} catch (err) {
				toastApiError(err, 'Gagal memperbarui status');
				return false;
			}
		},
		[updateMutation]
	);

	const saveAdminNotes = useCallback(
		async (id: string, notesDraft: string): Promise<boolean> => {
			try {
				await updateMutation.mutateAsync({
					id,
					data: { admin_notes: notesDraft.trim() || null },
				});
				toast.success('Catatan admin disimpan');
				return true;
			} catch (err) {
				toastApiError(err, 'Gagal menyimpan catatan');
				return false;
			}
		},
		[updateMutation]
	);

	const removeReservation = useCallback(
		async (id: string): Promise<boolean> => {
			try {
				await deleteMutation.mutateAsync(id);
				toast.success('Reservasi dihapus');
				return true;
			} catch (err) {
				toastApiError(err, 'Gagal menghapus reservasi');
				return false;
			}
		},
		[deleteMutation]
	);

	const isPending = updateMutation.isPending || deleteMutation.isPending;

	return {
		patchStatus,
		saveAdminNotes,
		removeReservation,
		isPending,
	};
}
