'use client';

import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';
import { LoginRequest } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { getCookie } from '@/lib/cookies';
function LoginContent() {
	const { login, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();

	const rememberMeCookie = getCookie('token') !== null;

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			const redirect = searchParams.get('redirect');
			router.push(redirect || '/dashboard');
		}
	}, [isAuthenticated, isLoading, router, searchParams]);

	const onSubmit = async (data: LoginRequest) => {
		try {
			const redirect = searchParams.get('redirect');
			await login(data, redirect || '/dashboard', data.rememberMe ?? false);
		} catch (error) {
			console.error('Submission failed:', error);
		}
	};

	if (isLoading || isAuthenticated) return null;

	return (
		<LoginForm
			logo={
				<Image
					src="/Logo.svg"
					alt="Baiturrahman"
					width={160}
					height={160}
					unoptimized
				/>
			}
			title='Masuk ke dashboard admin'
			description='Masuk ke dashboard admin'
			imageSrc="/images/login-image.jpg"
			imageAlt='Masuk ke dashboard admin'
			onSubmit={onSubmit}
			forgotPasswordHref='/forgot-password'
			createAccountHref='/register'
		/>
	);
}

export default function LoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginContent />
		</Suspense>
	);
}
