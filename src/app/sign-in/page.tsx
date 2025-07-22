"use client";

import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/src/utils/axios";
import Cookies from "js-cookie";

const schema = z.object({
  email: z.string().min(5, "This field is required").email("Email is invalid"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const SignInPage = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [setValue]);

  const loginAPICall = useMutation({
    mutationFn: async (data: z.infer<typeof schema>) => {
      try {
        const response = await axiosInstance.post("/auth/login", {
          email: data.email,
          password: data.password,
        });
        if (response.status == 200 || response.status == 201) {
          const accessTokenExpiry = rememberMe ? 30 : 1;
          const refreshTokenExpiry = rememberMe ? 30 : 7;
          Cookies.set("accessToken", response.data.accessToken, {
            expires: accessTokenExpiry,
            path: "/",
            secure: true,
            sameSite: "Lax",
          });
          Cookies.set("refreshToken", response.data.refreshToken, {
            expires: refreshTokenExpiry,
            path: "/",
            secure: true,
            sameSite: "Lax",
          });
          if (rememberMe) {
            localStorage.setItem("rememberedEmail", response.data.user.email);
          } else {
            localStorage.removeItem("rememberedEmail");
          }
          router.push("/movies");
          toast.success("Login Successful", { autoClose: 1000 });
        }
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
          const errorResponse = (error as { response: { status: number } })
            .response;
          if (errorResponse.status == 400) {
            toast.error("Bad Request", { autoClose: 1000 });
          } else if (errorResponse.status == 401) {
            toast.error("Invalid Credentials", { autoClose: 1000 });
          } else if (errorResponse.status == 404) {
            toast.error("Email Not Registered", { autoClose: 1000 });
          } else {
            toast.error("Internal Server Error", { autoClose: 1000 });
          }
        } else {
          toast.error("Some error occured", { autoClose: 1000 });
        }
      }
    },
  });

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    if (!isChecked) {
      localStorage.removeItem("rememberedEmail");
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center relative">
      <div className="relative z-10 w-full max-w-md px-8">
        <form
          onSubmit={handleSubmit((data) =>
            loginAPICall.mutate({ email: data.email, password: data.password })
          )}
          className="space-y-6"
        >
          <h1 className="text-6xl font-bold text-center mb-8">Sign in</h1>

          <div>
            <input
              {...register("email")}
              type="email"
              className={`w-full px-4 py-3 rounded-lg bg-tranparent ${
                errors.email ? "border-red-400 focus:ring-red-400" : ""
              }`}
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              className={`w-full px-4 py-3 rounded-lg bg-tranparent ${
                errors.password ? "border-red-400 focus:ring-red-400" : ""
              }`}
              placeholder="Password"
              required
            />
          </div>

          <div className="flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="w-5 h-5 rounded-md border-0 bg-slate-600 focus:ring-1 focus:ring-slate-400 focus:ring-offset-0 cursor-pointer appearance-none checked:!bg-slate-400"
                style={{
                  backgroundColor: rememberMe ? "#94a3b8" : "#224957",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none",
                }}
              />
              {rememberMe && (
                <svg
                  className="absolute top-0 left-0 w-5 h-5 pointer-events-none"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <label
              htmlFor="remember-me"
              className="ml-3 text-slate-200 text-sm font-medium bg-gradient-to-r from-slate-200 to-slate-300 bg-clip-text text-transparent"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary cursor-pointer w-full py-3 rounded-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
