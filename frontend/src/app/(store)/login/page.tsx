import type { Metadata } from "next";
import { AuthPage } from "@/components/account/auth-page";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage(props: PageProps<"/login">) {
  return <AuthPage mode="login" searchParams={props.searchParams} />;
}
