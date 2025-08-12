import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCliente() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header skeleton */}
      <div className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-1/3 h-8" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      {/* Cards skeleton */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        {/* Tabs skeleton */}
        <div className="flex space-x-8 px-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-32" />
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="h-6 w-full mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full mb-2" />
          ))}
        </div>
      </main>
    </div>
  );
}
