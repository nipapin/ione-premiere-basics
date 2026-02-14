"use client";

import {
	deleteUser,
	updateUser,
	updateSubscription,
	type DashboardUser,
	type DashboardSubscription,
} from "@/actions/admin";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	IconButton,
	InputAdornment,
	Paper,
	Snackbar,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tab,
	Tabs,
	TextField,
	Typography,
	Avatar,
	Tooltip,
	Select,
	MenuItem,
	Pagination,
	FormControl,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface UsersTableProps {
	users: DashboardUser[];
	subscriptions: DashboardSubscription[];
}

interface EditDialogData {
	user: DashboardUser;
	subscription?: DashboardSubscription | null;
}

export default function UsersTable({ users, subscriptions }: UsersTableProps) {
	const router = useRouter();

	const [search, setSearch] = useState("");
	const [editDialog, setEditDialog] = useState<EditDialogData | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<DashboardUser | null>(null);
	const [dialogTab, setDialogTab] = useState(0);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(50);

	const [loading, setLoading] = useState(false);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
		open: false,
		message: "",
		severity: "success",
	});

	const filteredUsers = useMemo(() => {
		if (!search.trim()) return users;
		const q = search.toLowerCase().trim();
		return users.filter(
			(u) =>
				u.email.toLowerCase().includes(q) ||
				u.name.toLowerCase().includes(q) ||
				u.lastname.toLowerCase().includes(q) ||
				u.subscription_status?.toLowerCase().includes(q)
		);
	}, [users, search]);

	const paginatedUsers = useMemo(() => {
		const startIndex = (page - 1) * rowsPerPage;
		const endIndex = startIndex + rowsPerPage;
		return filteredUsers.slice(startIndex, endIndex);
	}, [filteredUsers, page, rowsPerPage]);

	const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

	const refresh = useCallback(() => router.refresh(), [router]);

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleRowsPerPageChange = (event: any) => {
		setRowsPerPage(Number(event.target.value));
		setPage(1);
	};

	const handleEditClick = (user: DashboardUser) => {
		const userSub = subscriptions.find((s) => s.user_id === user.user_id);
		setEditDialog({ user: { ...user }, subscription: userSub || null });
		setDialogTab(0);
	};

	const handleUpdateUser = async () => {
		if (!editDialog) return;
		setLoading(true);
		const res = await updateUser(editDialog.user.user_id, {
			email: editDialog.user.email,
			name: editDialog.user.name,
			lastname: editDialog.user.lastname,
			is_admin: editDialog.user.is_admin,
		});
		setLoading(false);
		if (res.success) {
			setSnackbar({ open: true, message: "User updated successfully", severity: "success" });
			setEditDialog(null);
			refresh();
		} else {
			setSnackbar({ open: true, message: res.error || "Error updating user", severity: "error" });
		}
	};

	const handleUpdateSubscription = async () => {
		if (!editDialog?.subscription) return;
		setLoading(true);
		const res = await updateSubscription(editDialog.subscription.id, {
			status: editDialog.subscription.status,
			order_item_name: editDialog.subscription.order_item_name || undefined,
			quantity: editDialog.subscription.quantity,
			next_charge_date: editDialog.subscription.next_charge_date,
		});
		setLoading(false);
		if (res.success) {
			setSnackbar({ open: true, message: "Subscription updated successfully", severity: "success" });
			setEditDialog(null);
			refresh();
		} else {
			setSnackbar({ open: true, message: res.error || "Error updating subscription", severity: "error" });
		}
	};

	const handleDeleteUser = async () => {
		if (!deleteTarget) return;
		setLoading(true);
		const res = await deleteUser(deleteTarget.user_id);
		setLoading(false);
		if (res.success) {
			setDeleteTarget(null);
			setSnackbar({ open: true, message: "User deleted successfully", severity: "success" });
			refresh();
		} else {
			setSnackbar({ open: true, message: res.error || "Error deleting user", severity: "error" });
		}
	};

	const getStatusIcon = (status?: string | null) => {
		if (!status) return <PendingIcon fontSize="small" sx={{ color: "#ccff00" }} />;
		if (status === "active") return <CheckCircleIcon fontSize="small" sx={{ color: "#22c55e" }} />;
		if (status === "cancelled" || status === "failed")
			return <CancelIcon fontSize="small" sx={{ color: "#ef4444" }} />;
		return <PendingIcon fontSize="small" sx={{ color: "#f59e0b" }} />;
	};

	return (
		<Box sx={{ p: { xs: 2, md: 4 } }}>
			{/* Header */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
					Users
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Manage all users and their subscriptions
				</Typography>
			</Box>

			{/* Users Table */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: "12px",
					border: "1px solid",
					borderColor: "divider",
					overflow: "hidden",
					bgcolor: "background.paper",
				}}
			>
				<Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: 2,
							mb: 2,
						}}
					>
						<Box>
							<Typography variant="h6" fontWeight={600}>
								All Users
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{filteredUsers.length} total users
							</Typography>
						</Box>
						<TextField
							placeholder="Search users..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							size="small"
							sx={{
								minWidth: { xs: "100%", sm: 300 },
								"& .MuiOutlinedInput-root": {
									borderRadius: "8px",
								},
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon color="action" fontSize="small" />
									</InputAdornment>
								),
							}}
						/>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="body2" color="text.secondary">
								Rows per page:
							</Typography>
							<FormControl size="small">
								<Select
									value={rowsPerPage}
									onChange={handleRowsPerPageChange}
									sx={{
										minWidth: 80,
										"& .MuiOutlinedInput-notchedOutline": {
											borderRadius: "8px",
										},
									}}
								>
									<MenuItem value={50}>50</MenuItem>
									<MenuItem value={100}>100</MenuItem>
									<MenuItem value={200}>200</MenuItem>
								</Select>
							</FormControl>
						</Box>
						<Typography variant="body2" color="text.secondary">
							Showing {Math.min((page - 1) * rowsPerPage + 1, filteredUsers.length)} -{" "}
							{Math.min(page * rowsPerPage, filteredUsers.length)} of {filteredUsers.length}
						</Typography>
					</Box>
				</Box>

				<TableContainer sx={{ maxHeight: 600 }}>
					<Table stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }}>Name</TableCell>
								<TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }}>Email</TableCell>
								<TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }}>Admin</TableCell>
								<TableCell sx={{ fontWeight: 600, bgcolor: "action.hover" }} align="right">
									Actions
								</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginatedUsers.map((user) => (
								<TableRow key={user.user_id} hover sx={{ "&:last-child td": { border: 0 } }}>
									<TableCell>
										<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
											<Avatar
												sx={{
													width: 36,
													height: 36,
													bgcolor: "primary.main",
													color: "background.default",
													fontSize: "0.875rem",
												}}
											>
												{user.name[0]?.toUpperCase()}
											</Avatar>
											<Box>
												<Typography variant="body2" fontWeight={600}>
													{user.name} {user.lastname}
												</Typography>
											</Box>
										</Box>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{user.email}
										</Typography>
									</TableCell>
									<TableCell>
										{user.subscription_status === "active" ? (
											<Chip
												size="small"
												label="Paid"
												icon={getStatusIcon("active")}
												sx={{
													bgcolor: "#22c55e33",
													color: "#22c55e",
													fontWeight: 600,
													"& .MuiChip-icon": { ml: 0.5 },
												}}
											/>
										) : user.subscription_status === "cancelled" || user.subscription_status === "failed" ? (
											<Chip
												size="small"
												label={user.subscription_status}
												icon={getStatusIcon(user.subscription_status)}
												sx={{
													bgcolor: "#ef444433",
													color: "#ef4444",
													fontWeight: 600,
													"& .MuiChip-icon": { ml: 0.5 },
												}}
											/>
										) : (
											<Chip
												size="small"
												label="Free Pack"
												icon={getStatusIcon(null)}
												sx={{
													bgcolor: "#ccff0033",
													color: "#ccff00",
													fontWeight: 600,
													"& .MuiChip-icon": { ml: 0.5 },
												}}
											/>
										)}
									</TableCell>
									<TableCell>
										{user.is_admin && (
											<Chip
												size="small"
												label="Admin"
												sx={{
													bgcolor: "primary.main",
													color: "background.default",
													fontWeight: 600,
												}}
											/>
										)}
									</TableCell>
									<TableCell align="right">
										<Tooltip title="Edit">
											<IconButton size="small" onClick={() => handleEditClick(user)} sx={{ mr: 0.5 }}>
												<EditIcon fontSize="small" />
											</IconButton>
										</Tooltip>
										<Tooltip title="Delete">
											<IconButton size="small" color="error" onClick={() => setDeleteTarget(user)}>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				{filteredUsers.length === 0 && (
					<Box sx={{ py: 8, textAlign: "center" }}>
						<Typography color="text.secondary">No users found</Typography>
					</Box>
				)}

				{filteredUsers.length > 0 && totalPages > 1 && (
					<Box
						sx={{
							p: 2,
							borderTop: "1px solid",
							borderColor: "divider",
							display: "flex",
							justifyContent: "center",
						}}
					>
						<Pagination
							count={totalPages}
							page={page}
							onChange={handlePageChange}
							color="primary"
							shape="rounded"
							showFirstButton
							showLastButton
							sx={{
								"& .MuiPaginationItem-root": {
									color: "text.primary",
								},
								"& .Mui-selected": {
									bgcolor: "primary.main",
									color: "background.default",
									"&:hover": {
										bgcolor: "primary.dark",
									},
								},
							}}
						/>
					</Box>
				)}
			</Paper>

			{/* Edit Dialog */}
			<Dialog open={!!editDialog} onClose={() => setEditDialog(null)} maxWidth="md" fullWidth>
				<DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2, fontWeight: 600 }}>
					Edit User & Subscription
				</DialogTitle>
				<DialogContent sx={{ p: 0, bgcolor: "background.paper" }}>
					{editDialog && (
						<>
							<Tabs
								value={dialogTab}
								onChange={(_, v) => setDialogTab(v)}
								sx={{
									px: 3,
									borderBottom: "1px solid",
									borderColor: "divider",
									"& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
								}}
							>
								<Tab label="User Details" />
								<Tab label="Subscription" disabled={!editDialog.subscription} />
							</Tabs>

							<Box sx={{ p: 3 }}>
								{dialogTab === 0 && (
									<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
										<TextField
											label="Email"
											value={editDialog.user.email}
											onChange={(e) =>
												setEditDialog({
													...editDialog,
													user: { ...editDialog.user, email: e.target.value },
												})
											}
											fullWidth
										/>
										<Box sx={{ display: "flex", gap: 2 }}>
											<TextField
												label="First Name"
												value={editDialog.user.name}
												onChange={(e) =>
													setEditDialog({
														...editDialog,
														user: { ...editDialog.user, name: e.target.value },
													})
												}
												fullWidth
											/>
											<TextField
												label="Last Name"
												value={editDialog.user.lastname}
												onChange={(e) =>
													setEditDialog({
														...editDialog,
														user: { ...editDialog.user, lastname: e.target.value },
													})
												}
												fullWidth
											/>
										</Box>
										<FormControlLabel
											control={
												<Switch
													checked={editDialog.user.is_admin}
													onChange={(e) =>
														setEditDialog({
															...editDialog,
															user: {
																...editDialog.user,
																is_admin: e.target.checked,
															},
														})
													}
													color="primary"
												/>
											}
											label="Administrator"
										/>
									</Box>
								)}

								{dialogTab === 1 && editDialog.subscription && (
									<Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
										<TextField
											label="Status"
											value={editDialog.subscription.status}
											onChange={(e) =>
												setEditDialog({
													...editDialog,
													subscription: {
														...editDialog.subscription!,
														status: e.target.value,
													},
												})
											}
											fullWidth
											helperText="e.g. active, cancelled, failed, on-hold"
										/>
										<TextField
											label="Order Item Name"
											value={editDialog.subscription.order_item_name || ""}
											onChange={(e) =>
												setEditDialog({
													...editDialog,
													subscription: {
														...editDialog.subscription!,
														order_item_name: e.target.value,
													},
												})
											}
											fullWidth
										/>
										<TextField
											label="Quantity"
											type="number"
											value={editDialog.subscription.quantity}
											onChange={(e) =>
												setEditDialog({
													...editDialog,
													subscription: {
														...editDialog.subscription!,
														quantity: Number(e.target.value) || 0,
													},
												})
											}
											fullWidth
											inputProps={{ min: 0 }}
										/>
										<TextField
											label="Next Charge Date"
											type="date"
											value={
												editDialog.subscription.next_charge_date
													? editDialog.subscription.next_charge_date.toString().slice(0, 10)
													: ""
											}
											onChange={(e) =>
												setEditDialog({
													...editDialog,
													subscription: {
														...editDialog.subscription!,
														next_charge_date: e.target.value || null,
													},
												})
											}
											fullWidth
											InputLabelProps={{ shrink: true }}
										/>
									</Box>
								)}
							</Box>
						</>
					)}
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
					<Button onClick={() => setEditDialog(null)} sx={{ textTransform: "none" }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={dialogTab === 0 ? handleUpdateUser : handleUpdateSubscription}
						disabled={loading}
						sx={{ textTransform: "none", minWidth: 100 }}
					>
						{loading ? <CircularProgress size={20} /> : "Save Changes"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation */}
			<Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
				<DialogTitle>Delete User</DialogTitle>
				<DialogContent sx={{ bgcolor: "background.paper" }}>
					<Typography>
						Are you sure you want to delete <strong>{deleteTarget?.email}</strong>? This will permanently
						remove their account, subscriptions, and all related data.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: "none" }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleDeleteUser}
						disabled={loading}
						sx={{ textTransform: "none", minWidth: 100 }}
					>
						{loading ? <CircularProgress size={20} /> : "Delete"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={4000}
				onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			>
				<Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "8px" }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
}
