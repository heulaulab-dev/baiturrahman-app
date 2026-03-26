type StatusType = 'success' | 'warning' | 'danger' | 'default';

interface StatusBadgeProps {
	status: StatusType;
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const styles = {
		success: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
		warning: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
		danger: 'bg-destructive/10 text-destructive border-destructive/20',
		default: 'bg-muted/10 text-muted-foreground border-border',
	};

	return <span className={`px-2.5 py-1 rounded-md text-xs font-medium tracking-wider ${styles[status]}`}>{children}</span>;
}
