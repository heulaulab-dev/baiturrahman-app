'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const iframeHeight = '800px';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

	return (
		<div className="[--header-height:calc(--spacing(14))]">
			<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col gap-6 overflow-hidden">
					<div className="flex-1 overflow-y-auto">
						<div className="container mx-auto max-w-6xl px-4 py-6">
							{children}
						</div>
					</div>
				</div>
			</SidebarInset>
			</SidebarProvider>
		</div>
		
	);
}
