// UI
import { AuthLayout } from "../layout";
import { Header } from "@/components/ui/header-back";
import { SignUpBasicForm } from "@/components/SignUpBasicForm";

export const SignUpScreen = () => {
  return (
    <AuthLayout>
      <Header title="Sign up" />
      <SignUpBasicForm />
    </AuthLayout>
  );
};