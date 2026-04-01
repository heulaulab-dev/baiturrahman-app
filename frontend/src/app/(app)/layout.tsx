'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const iframeHeight = '800px';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
		}
	}, [isAuthenticated, isLoading, router, pathname]);

	// Show loading or nothing while checking auth
	if (isLoading) {
		return null;
	}

	// Don't render if not authenticated (redirect will happen)
	if (!isAuthenticated) {
		return null;
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<div className='flex flex-1 flex-col gap-6'>
					<div className='flex-1 overflow-y-auto'>
						<div className='container mx-auto max-w-6xl px-4 py-6'>{children}</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
