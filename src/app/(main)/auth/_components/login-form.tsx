"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api-utils";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log("🔐 Starting login process...");
    try {
      // Call login API using dynamic base URL
      const baseUrl = getApiBaseUrl();
      console.log("🌐 API Base URL:", baseUrl);

      const res = await fetch(`${baseUrl}/admin/login/v2/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
          source: "ACCOUNTADMIN_APP"
        }),
      });

      console.log("📡 Response status:", res.status);
      const response = await res.json();
      console.log("📦 Login response:", response);

      if (response.status && response.data?.[0]?.access_token) {
        console.log("✅ Login successful, storing token and user data");

        // Store token and user info in localStorage (like AngularJS $sessionStorage)
        localStorage.setItem("token", response.data[0].access_token);
        localStorage.setItem("user", JSON.stringify(response.data[0].personal_info));

        console.log("💾 Data stored in localStorage");
        console.log("🚀 Redirecting to dashboard...");

        toast.success(`Welcome, ${response.data[0].personal_info.full_name || data.email}!`, {
          description: "You have successfully logged in. Redirecting to your dashboard...",
        });

        console.log("🔄 Executing router.push...");
        // Use router.push for optimal Next.js navigation
        router.push("/core/dashboard");

      } else {
        // Show API error message if available, otherwise default
        let errorMsg = "Invalid credentials or server error.";
        if (res.status === 200 && response.error?.msg) {
          errorMsg = response.error.msg;
        }
        toast.error("Login failed", { description: errorMsg });
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      toast.error("Login failed", { description: err instanceof Error ? err.message : "Unknown error" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
    </Form>
  );
}
