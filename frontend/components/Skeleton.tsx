"use client";

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="h-4 bg-white/[0.06] rounded-lg w-3/4 mb-2" />
          <div className="h-3 bg-white/[0.04] rounded-md w-1/3" />
        </div>
        <div className="h-6 w-16 bg-white/[0.06] rounded-lg" />
      </div>
      <div className="h-7 bg-white/[0.06] rounded-lg w-1/2 mb-3" />
      <div className="flex gap-0.5 mb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-1 flex-1 rounded-full bg-white/[0.04]" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-white/[0.04] rounded-md w-24" />
        <div className="h-3 bg-white/[0.04] rounded-md w-16" />
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-100 border border-white/[0.06] overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-white/[0.06] rounded-md w-1/4" />
        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded-md w-full" />
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="h-3 bg-white/[0.04] rounded-md w-20" />
          <div className="h-3 bg-white/[0.04] rounded-md w-12" />
        </div>
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04]" />
      </div>
      <div className="h-7 bg-white/[0.06] rounded-lg w-12 mb-1" />
      <div className="h-3 bg-white/[0.04] rounded-md w-20" />
    </div>
  );
}

export function DealDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-4 bg-white/[0.04] rounded-md w-24 mb-6" />
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="h-6 bg-white/[0.06] rounded-lg w-48 mb-2" />
          <div className="h-4 bg-white/[0.04] rounded-md w-32" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-white/[0.04] rounded-lg" />
          <div className="h-8 w-24 bg-white/[0.04] rounded-lg" />
        </div>
      </div>
      <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-6 mb-6">
        <div className="h-3 bg-white/[0.04] rounded-md w-16 mb-4" />
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="w-7 h-7 rounded-full bg-white/[0.06]" />
              {i < 3 && <div className="flex-1 h-[2px] mx-1.5 bg-white/[0.04]" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-6">
            <div className="h-3 bg-white/[0.04] rounded-md w-24 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-white/[0.04] rounded-md w-16 mb-2" />
                  <div className="h-6 bg-white/[0.06] rounded-lg w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-6 h-40" />
          <div className="rounded-2xl bg-surface-100 border border-white/[0.06] p-6 h-48" />
        </div>
      </div>
    </div>
  );
}
