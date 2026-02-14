'use client'

import { login } from "@/actions/user";
import { Alert, Box, Button, CircularProgress, Snackbar, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [csrfToken, setCsrfToken] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = Math.random().toString(36).substring(2);
        setCsrfToken(token);
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const user = await login(email, password, csrfToken);
        if (!user) {
            setError("Invalid email or password");
            setIsLoading(false);
            return;
        }

        if (!user.is_admin) {
            setError("You are not authorized to access this page");
            setIsLoading(false);
            return;
        }

        router.replace("/panel/dashboard");
    }

    return <Box component={'form'} onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", justifyContent: "center", height: "100vh", width: "400px", mx: 'auto' }}>
        <Typography fontWeight={400} fontSize={24} mb={2}>Login</Typography>
        <TextField fullWidth label="Email" type="email" name="email" />
        <TextField fullWidth label="Password" type="password" name="password" />
        <Button fullWidth variant="contained" type="submit" disabled={isLoading}>{isLoading ? <CircularProgress size={16} color="inherit" /> : "Login"}</Button>
        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
            <Alert severity="error">{error}</Alert>
        </Snackbar>
    </Box>;
}