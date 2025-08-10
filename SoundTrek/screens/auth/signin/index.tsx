// React
import React from "react";

// UI
import { AuthLayout } from "@/screens/auth/layout";
import { SignInForm } from "../../../components/SignInForm";

/**
    SignInScreen -> Wraps the sign in form with layout and header.
**/
export const SignInScreen = () => {
  return (
    <AuthLayout showHeader headerTitle="Sign In">
      <SignInForm />
    </AuthLayout>
  );
};