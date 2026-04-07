import { Badge } from '@/components/ui/badge';

type StatusType = 'success' | 'warning' | 'danger' | 'default';

interface StatusBadgeProps {
	status: StatusType;
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: Readonly<StatusBadgeProps>) {
	const styles = {
		success: 'bg-primary/10 text-primary border-primary/20',
		warning: 'bg-accent/40 text-accent-foreground border-accent',
		danger: 'bg-destructive/10 text-destructive border-destructive/20',
		default: 'bg-muted text-muted-foreground border-border',
	};

	return (
		<Badge variant="outline" className={`px-2 py-1 text-xs font-medium ${styles[status]}`}>
			{children}
		</Badge>
	);
}
