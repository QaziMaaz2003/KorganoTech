import type { Metadata } from "next";
import { AuthPage } from "@/components/account/auth-page";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage(props: PageProps<"/register">) {
  return <AuthPage mode="register" searchParams={props.searchParams} />;
}
