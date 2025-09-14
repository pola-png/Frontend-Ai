import { Icons } from "@/components/shared/Icons";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
