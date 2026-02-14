import { getDashboardData } from "@/actions/admin";
import { Box, Typography, Paper, Avatar, Chip, LinearProgress } from "@mui/material";
import { redirect } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Link from "next/link";

function StatCard({
	title,
	value,
	subtitle,
	color,
	icon,
}: {
	title: string;
	value: string | number;
	subtitle?: string;
	color: string;
	icon: React.ReactNode;
}) {
	return (
		<Paper
			elevation={0}
			sx={{
				p: 3,
				borderRadius: "12px",
				border: "1px solid",
				borderColor: "divider",
				bgcolor: "background.paper",
				transition: "all 0.2s",
				"&:hover": {
					boxShadow: "0 4px 20px rgba(204, 255, 0, 0.1)",
					transform: "translateY(-2px)",
					borderColor: "primary.main",
				},
			}}
		>
			<Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: "10px",
						bgcolor: `${color}20`,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: color,
					}}
				>
					{icon}
				</Box>
			</Box>
			<Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
				{value}
			</Typography>
			<Typography variant="body2" color="text.secondary" fontWeight={500}>
				{title}
			</Typography>
			{subtitle && (
				<Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
					{subtitle}
				</Typography>
			)}
		</Paper>
	);
}

export default async function DashboardOverviewPage() {
	const data = await getDashboardData();

	if (!data) {
		redirect("/panel/login");
	}

	const { users, subscriptions, stats } = data;

	// Recent users (last 5)
	const recentUsers = users.slice(0, 5);

	// Calculate Free Pack users (all users without active subscriptions)
	const freePackUsers = users.filter((u) => !u.subscription_status || u.subscription_status !== "active").length;
	const paidUsers = users.filter((u) => u.subscription_status === "active").length;

	// Subscription breakdown
	const subscriptionBreakdown = [
		{ label: "Active (Paid)", count: stats.activeSubscriptions, color: "#22c55e" },
		{ label: "Free Pack", count: freePackUsers, color: "#ccff00" },
		{ label: "Cancelled", count: stats.cancelledSubscriptions, color: "#ef4444" },
	];

	// Calculate growth (mock data - можно заменить на реальные данные)
	const usersWithSubs = users.filter((u) => u.subscription_status === "active").length;
	const conversionRate = stats.totalUsers > 0 ? (usersWithSubs / stats.totalUsers) * 100 : 0;

	// Admin stats
	const adminCount = users.filter((u) => u.is_admin).length;

	return (
		<Box sx={{ p: { xs: 2, md: 4 } }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
					Dashboard
				</Typography>
				<Typography variant="body1" color="text.secondary">
					{`Welcome back! Here's what's happening with your platform today.`}
				</Typography>
			</Box>

			{/* Stats Cards */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						md: "repeat(4, 1fr)",
					},
					gap: 2.5,
					mb: 4,
				}}
			>
				<StatCard
					title="Total Users"
					value={stats.totalUsers}
					subtitle={`${paidUsers} paid, ${freePackUsers} free pack`}
					color="#ccff00"
					icon={<SearchIcon sx={{ fontSize: 28 }} />}
				/>
				<StatCard
					title="Paid Subscriptions"
					value={stats.activeSubscriptions}
					subtitle={`${stats.totalSubscriptions} total (incl. cancelled)`}
					color="#22c55e"
					icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
				/>
				<StatCard
					title="Free Pack Users"
					value={freePackUsers}
					subtitle="Users on free tier"
					color="#f59e0b"
					icon={<PendingIcon sx={{ fontSize: 28 }} />}
				/>
				<StatCard
					title="Conversion Rate"
					value={`${conversionRate.toFixed(1)}%`}
					subtitle="Free to paid conversion"
					color="#8b5cf6"
					icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
				/>
			</Box>

			<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" }, gap: 3, mb: 4 }}>
				{/* Recent Users */}
				<Paper
					elevation={0}
					sx={{
						borderRadius: "12px",
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
						overflow: "hidden",
					}}
				>
					<Box
						sx={{
							p: 3,
							borderBottom: "1px solid",
							borderColor: "divider",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Box>
							<Typography variant="h6" fontWeight={600}>
								Recent Users
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Latest registered users
							</Typography>
						</Box>
						<Link href="/panel/dashboard/users" style={{ textDecoration: "none" }}>
							<Chip label="View All" size="small" sx={{ bgcolor: "primary.main", color: "background.default" }} />
						</Link>
					</Box>
					<Box sx={{ p: 2 }}>
						{recentUsers.length === 0 ? (
							<Typography color="text.secondary" textAlign="center" py={4}>
								No users yet
							</Typography>
						) : (
							recentUsers.map((user, index) => (
								<Box
									key={user.user_id}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 2,
										p: 2,
										borderRadius: "8px",
										mb: index < recentUsers.length - 1 ? 1 : 0,
										transition: "all 0.2s",
										"&:hover": {
											bgcolor: "action.hover",
										},
									}}
								>
									<Avatar
										sx={{
											width: 40,
											height: 40,
											bgcolor: "primary.main",
											color: "background.default",
										}}
									>
										{user.name[0]?.toUpperCase()}
									</Avatar>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography variant="body2" fontWeight={600} noWrap>
											{user.name} {user.lastname}
										</Typography>
										<Typography variant="caption" color="text.secondary" noWrap>
											{user.email}
										</Typography>
									</Box>
									{user.subscription_status === "active" ? (
										<Chip
											size="small"
											label="Paid"
											sx={{
												bgcolor: "#22c55e33",
												color: "#22c55e",
												fontWeight: 600,
											}}
										/>
									) : (
										<Chip
											size="small"
											label="Free Pack"
											sx={{
												bgcolor: "#ccff0033",
												color: "#ccff00",
												fontWeight: 600,
											}}
										/>
									)}
								</Box>
							))
						)}
					</Box>
				</Paper>

				{/* Subscription Breakdown */}
				<Paper
					elevation={0}
					sx={{
						borderRadius: "12px",
						border: "1px solid",
						borderColor: "divider",
						bgcolor: "background.paper",
						overflow: "hidden",
					}}
				>
					<Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
						<Typography variant="h6" fontWeight={600}>
							User Distribution
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Breakdown by subscription type
						</Typography>
					</Box>
					<Box sx={{ p: 3 }}>
						{subscriptionBreakdown.map((item) => {
							const percentage = stats.totalUsers > 0 ? (item.count / stats.totalUsers) * 100 : 0;
							return (
								<Box key={item.label} sx={{ mb: 3 }}>
									<Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
										<Typography variant="body2" fontWeight={600}>
											{item.label}
										</Typography>
										<Typography variant="body2" color="text.secondary">
											{item.count} ({percentage.toFixed(0)}%)
										</Typography>
									</Box>
									<LinearProgress
										variant="determinate"
										value={percentage}
										sx={{
											height: 8,
											borderRadius: "4px",
											bgcolor: "action.hover",
											"& .MuiLinearProgress-bar": {
												bgcolor: item.color,
												borderRadius: "4px",
											},
										}}
									/>
								</Box>
							);
						})}
					</Box>
				</Paper>
			</Box>
		</Box>
	);
}
