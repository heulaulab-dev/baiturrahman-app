import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-muted/30 p-4'>
			<div className='w-full max-w-md'>
				{/* Header */}
				<div className='text-center mb-8'>
					<div className='flex items-center justify-center mb-4'>
						<img src='/Logo.svg' alt='Baiturrahman' className='h-16' />
					</div>
					<h1 className='text-2xl font-semibold text-foreground mb-2'>
						Reset Password
					</h1>
					<p className='text-muted-foreground'>
						Masukkan password baru untuk akun Anda
					</p>
				</div>

				{/* Reset Password Card */}
				<div className='bg-background border border-border rounded-lg p-6 shadow-sm'>
					<Suspense
						fallback={
							<div className='flex justify-center py-8'>
								<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
							</div>
						}
					>
						<ResetPasswordForm />
					</Suspense>
				</div>

				{/* Footer */}
				<div className='mt-6 space-y-4'>
					<Link
						href='/'
						className='flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='h-4 w-4' />
						Kembali ke Beranda
					</Link>
				</div>
			</div>
		</div>
	);
}
