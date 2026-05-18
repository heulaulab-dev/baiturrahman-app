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
				<div className="flex-1 overflow-y-auto">
						<div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</div>
					</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
