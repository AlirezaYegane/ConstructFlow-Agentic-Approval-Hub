export type RequestStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected"
  | "document_generated"
  | "notified"
  | "closed";

export function canApprove(status: RequestStatus) {
  return status === "submitted" || status === "under_review";
}

export function canReject(status: RequestStatus) {
  return status === "submitted" || status === "under_review";
}

export function canRequestInfo(status: RequestStatus) {
  return status === "submitted" || status === "under_review";
}

export function canSendToReview(status: RequestStatus) {
  return status === "submitted" || status === "needs_info";
}

export function canGenerateDocument(status: RequestStatus) {
  return status === "approved";
}

export function isHardTerminalStatus(status: RequestStatus) {
  return status === "rejected" || status === "closed" || status === "notified";
}
