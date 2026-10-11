"use client";

import { Alert, Box, Button, Chip, Divider, Link, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { AffiliateStats } from "@/types/affiliates";

export default function AffiliateStatistics() {
	const [stats, setStats] = useState<AffiliateStats[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		setError(null);
		setStats(null);
		async function load() {
			try {
				const response = await fetch("/api/affilates", { cache: "no-store", signal: controller.signal });
				if (!response.ok) throw new Error(response.status === 401 ? "Please log in again to view your referral sales." : response.status === 403 ? "This account does not have access to referral sales." : "Unable to load referral sales. Please try again.");
				const data: AffiliateStats[] = await response.json();
				if (!controller.signal.aborted) setStats(data);
			} catch (cause) {
				if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Unable to load referral sales. Please try again.");
			}
		}
		void load();
		return () => controller.abort();
	}, [attempt]);

	return (
		<Box sx={{ "& p, & a": { fontWeight: 400 } }}>
			<Typography variant="h1" sx={{ fontSize: "1.5rem", fontWeight: 500 }}>Referral sales</Typography>
			<Typography color="text.secondary" sx={{ mt: 1 }}>All-time statistics for your referral links.</Typography>
			<Divider sx={{ my: 2 }} />
			{error ? (
				<Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setAttempt(value => value + 1)}>Retry</Button>}>{error}</Alert>
			) : stats === null ? (
				<Stack spacing={1} aria-label="Loading referral sales" aria-busy="true">
					{[0, 1, 2].map(index => <Skeleton key={index} variant="rounded" height={56} />)}
				</Stack>
			) : (
				<>
					<TableContainer>
						<Table size="small" aria-label="All-time referral sales">
							<TableHead><TableRow>
								<TableCell>Referral link</TableCell>
								<TableCell align="right">Subscriptions</TableCell>
								<TableCell align="right">Licenses</TableCell>
								<TableCell align="right">One-time sales</TableCell>
							</TableRow></TableHead>
							<TableBody>
								{stats.map(item => <TableRow key={item.affiliate}>
									<TableCell component="th" scope="row" sx={{ py: 2 }}>
										<Link href={`/?ref=${encodeURIComponent(item.affiliate)}`} target="_blank" rel="noopener noreferrer">{item.affiliate}</Link>
										<Stack direction="row" useFlexGap flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
											{Object.entries(item.statuses).map(([status, count]) => <Chip key={status} label={`${status}: ${count}`} size="small" variant="outlined" />)}
											{item.trials > 0 && <Chip label={`trial: ${item.trials}`} size="small" variant="outlined" />}
										</Stack>
									</TableCell>
									<TableCell align="right">{item.subscriptions}</TableCell>
									<TableCell align="right">{item.licenses}</TableCell>
									<TableCell align="right">{item.oneTimeOrders}</TableCell>
								</TableRow>)}
								<TableRow sx={{ "& th, & td": { fontWeight: 500 } }}>
									<TableCell component="th" scope="row">Total</TableCell>
									<TableCell align="right">{stats.reduce((sum, item) => sum + item.subscriptions, 0)}</TableCell>
									<TableCell align="right">{stats.reduce((sum, item) => sum + item.licenses, 0)}</TableCell>
									<TableCell align="right">{stats.reduce((sum, item) => sum + item.oneTimeOrders, 0)}</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
					{stats.every(item => item.subscriptions === 0 && item.oneTimeOrders === 0) && <Typography sx={{ mt: 2 }}>No sales have been recorded for these links yet.</Typography>}
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						Subscriptions include all recorded statuses and trials; licenses reflect their recorded quantities. Renewals are not counted as new subscriptions. One-time sales include only processed payments.
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
						Historical subscription payment amounts were not stored, so revenue is unavailable.
					</Typography>
				</>
			)}
		</Box>
	);
}
