import { notFound } from "next/navigation";
import { ContentReviewClient } from "./review-client";

export default function ContentReviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ContentReviewClient />;
}
