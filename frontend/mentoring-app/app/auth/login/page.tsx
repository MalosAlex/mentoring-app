"use client";

/**
 * Login Page Component
 * 
 * This page provides a user authentication form with validation for:
 * - Email or Username (required, valid email format or username)
 * - Password (required)
 * 
 * On successful login, stores authentication token in localStorage and
 * redirects to the home page. Displays error messages for invalid credentials.
 * Uses shadcn/ui components for consistent styling.
 * 
 * @module app/auth/login/page
 */

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockLogin } from "@/lib/mock-auth";

/**
 * Zod validation schema for login form
 * 
 * Validates email/username format and ensures password is provided.
 * Accepts either a valid email address or a username (alphanumeric + underscores).
 */
const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) => {
        // Check if it's a valid email or username
        const isEmail = z.string().email().safeParse(value).success;
        const isUsername = /^[a-zA-Z0-9_]+$/.test(value);
        return isEmail || isUsername;
      },
      {
        message: "Please enter a valid email address or username",
      }
    ),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * LoginPage Component
 * 
 * Main component for user authentication. Handles form state, validation,
 * submission, and error handling.
 * 
 * @returns {JSX.Element} The login page UI
 */
export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
    mode: "onBlur",
  });

  /**
   * Handles form submission
   * 
   * Calls the mockLogin function with form values, handles success/error responses,
   * and redirects to home page on successful authentication. Token is automatically
   * stored in localStorage by the mockLogin function.
   * 
   * @param {LoginFormValues} values - Form values from react-hook-form
   */
  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await mockLogin(values.emailOrUsername, values.password);

      if (response.success && response.token) {
        // Token is automatically stored by mockLogin
        // Redirect to home page (or dashboard when it will be available)
        router.push("/");
      } else {
        setSubmitError(response.message || "Invalid email/username or password");
      }
    } catch (error) {
      setSubmitError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
          <CardDescription>
            Enter your email or username and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="emailOrUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="john@example.com"
                        {...field}
                        disabled={isSubmitting}
                      />
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
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

