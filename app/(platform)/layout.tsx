import { AuthProvider } from "@/components/providers/AuthProvider";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
