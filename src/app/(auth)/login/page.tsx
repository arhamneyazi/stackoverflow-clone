"use client";

import { useAuthStore } from "@/store/Auth";
import React, { useState } from "react";

function LoginPage() {
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Collect the data
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Validate
    if (!email || !password) {
      setError(() => "Please fill out all the fields");
      return;
    }

    // Call the store and login
    setIsLoading(() => true);
    setError(() => "");

    const loginResponse = await login(email?.toString(), password?.toString());

    if (loginResponse.error) {
      setError(() => loginResponse.error!.message);
    }

    setIsLoading(() => false);
  };

  return <div>LoginPage</div>;
}

export default LoginPage;
