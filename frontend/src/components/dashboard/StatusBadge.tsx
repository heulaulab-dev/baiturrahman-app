type StatusType = 'success' | 'warning' | 'danger' | 'default';

interface StatusBadgeProps {
	status: StatusType;
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const styles = {
		success: 'bg-success/10 text-success border-success/20',
		warning: 'bg-warning/10 text-warning border-warning/20',
		danger: 'bg-destructive/10 text-destructive border-destructive/20',
		default: 'bg-muted/10 text-muted border-border',
	};

	return <span className={`px-2.5 py-1 rounded-md text-xs font-medium tracking-wider ${styles[status]}`}>{children}</span>;
}
