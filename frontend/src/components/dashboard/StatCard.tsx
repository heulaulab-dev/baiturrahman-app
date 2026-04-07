import { Badge } from '@/components/ui/badge';

interface StatCardProps {
	label: string;
	value: string;
	trend?: 'up' | 'down' | null;
	badge?: string;
}

export function StatCard({ label, value, trend, badge }: Readonly<StatCardProps>) {
	return (
		<div className="rounded-md border border-border p-6 transition-colors hover:bg-muted/30">
			<div className="flex items-start justify-between mb-2">
				<span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
					{label}
				</span>
				{trend && (
					<Badge
						variant="outline"
						className={`px-2 py-0.5 text-xs font-medium ${trend === 'up' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
					>
						{trend === 'up' ? '↑' : '↓'}
					</Badge>
				)}
				{badge && <span className="px-2 py-0.5 rounded text-xs font-medium text-muted-foreground">{badge}</span>}
			</div>
			<div className="text-3xl font-mono text-foreground">{value}</div>
		</div>
	);
}
