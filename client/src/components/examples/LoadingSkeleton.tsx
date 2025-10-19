import LoadingSkeleton from '../LoadingSkeleton';

export default function LoadingSkeletonExample() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="text-lg font-semibold mb-3">Card Loading State</h3>
        <LoadingSkeleton count={4} type="card" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">Table Loading State</h3>
        <LoadingSkeleton count={5} type="table" />
      </div>
    </div>
  );
}
