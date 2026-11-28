import { Logo } from "@/components/auth/Logo";
import { TaskPreview } from "@/components/auth/TaskPreview";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-paper text-ink lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] dark:bg-[#0e1512] dark:text-white">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-stone-600 dark:text-stone-300">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-sm text-stone-600 dark:text-stone-300">
            {footer}
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-[#e9efe8] lg:block dark:bg-[#0a100d]">
        <TaskPreview />
      </div>
    </div>
  );
}
