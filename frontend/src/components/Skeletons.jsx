import "../skeleton.css";

export function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
      <div className="skeleton h-56 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BusCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
      <div className="skeleton hidden sm:block w-64 h-48" />
      <div className="p-6 flex-grow space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-4 w-20 rounded-full" />
          </div>
          <div className="skeleton h-7 w-24" />
        </div>
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-6 w-16" />
          <div className="skeleton h-8 w-24" />
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="skeleton h-5 w-28" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row">
      <div className="skeleton w-full sm:w-48 h-48" />
      <div className="p-6 flex-grow space-y-3">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-4 w-32" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="skeleton h-4 w-40 mt-3" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 animate-pulse space-y-4">
      <div className="flex items-center gap-6">
        <div className="skeleton w-20 h-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-4 w-56" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 pt-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
      </div>
    </div>
  );
}
