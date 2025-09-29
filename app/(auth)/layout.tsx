import { cookies } from "next/headers";
import PasswordGate from "@/components/password-gate";
import React from "react"; // Ensure React in scope for JSX

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const authorized = cookies().get('sbpw')?.value === 'true';
  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {authorized ? children : <PasswordGate />}
      </div>
    </div>
  );
}
