"use client";

export function CSPostHogProvider({
  children,
}: {
  children: React.ReactNode;
  serverSession?: unknown;
}) {
  return <>{children}</>;
}
