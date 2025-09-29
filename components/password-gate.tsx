"use client";

/*
 * PasswordGate component
 * Renders an uncloseable prompt that asks the user for the STORYBOARD_PASSWORD
 * before allowing access to the protected login/signup forms.
 */

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { verifyPassword } from "@/actions/password-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function PasswordGate() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    const ok = await verifyPassword(password);
    setLoading(false);

    if (ok) {
      router.refresh();
    } else {
      toast({
        title: "Incorrect password",
        description: "Please try again.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <h2 className="text-lg font-semibold text-center">Enter password to continue</h2>
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Checking..." : "Unlock"}
        </Button>
      </form>
    </div>
  );
} 