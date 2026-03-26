interface StatCardProps {
	label: string;
	value: string;
	trend?: 'up' | 'down' | null;
	badge?: string;
}

export function StatCard({ label, value, trend, badge }: StatCardProps) {
	return (
		<div className="p-6 border-border hover:bg-muted/30 transition-colors">
			<div className="flex items-start justify-between mb-2">
				<span className="text-xs font-medium tracking-widest text-muted uppercase">
					{label}
				</span>
				{trend && (
					<span
						className={`
								px-2 py-0.5 rounded text-xs font-medium
								${trend === 'up' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}
						`}
					>
						{trend === 'up' ? '↑' : '↓'}
					</span>
				)}
				{badge && <span className="px-2 py-0.5 rounded text-xs font-medium text-muted">{badge}</span>}
			</div>
			<div className="text-3xl font-mono text-foreground">{value}</div>
		</div>
	);
}
