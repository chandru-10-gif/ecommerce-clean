import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ProductSkeleton() {
  return (
    <div
      className="card p-3 text-center"
      style={{
        minHeight: "350px",
      }}
    >
      <Skeleton height={150} />

      <div className="mt-3">
        <Skeleton count={2} />
      </div>

      <div className="mt-2">
        <Skeleton width={80} />
      </div>

      <div className="mt-2">
        <Skeleton width={120} />
      </div>
    </div>
  );
}