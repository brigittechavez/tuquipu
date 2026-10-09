export type ClaimStatus =
  | "available"
  | "available_with_limits"
  | "available_for_offer"
  | "partial"
  | "not_available"
  | "internal"
  | "development"
  | "development_pending_release"
  | "roadmap"
  | "unverified";

export type Claim = {
  id: string;
  status: ClaimStatus;
  statement: string;
  evidenceRef?: string;
  owner: string;
  approvedForMarketing: boolean;
};

export type CtaKind = "demo" | "quote" | "whatsapp" | "internal-link";

export type CtaSpec = {
  id: string;
  label: string;
  kind: CtaKind;
  page: string;
  sectionId: string;
  destination: string;
  messageCode?: string;
  message?: string;
  analyticsEvent: "cta_click" | "whatsapp_click";
  planId?: PlanId;
};

export type PublishState = "published" | "hidden";

export type ContentSection = {
  id: string;
  eyebrow?: string;
  title: string;
  body?: string;
  claimIds?: string[];
  ctaIds?: string[];
  evidenceId?: string;
  publishState: PublishState;
};

export type PlanId = "esencial" | "operaciones" | "industria";

export type LeadIntent = "demo" | "quote";

export type MediaAsset = { src: string; width: number; height: number; poster?: string };

/**
 * Real product media with an art-directed mobile version.
 * Desktop frames are 16:10; mobile frames take the mobile asset's ratio (4:5).
 */
export type EvidenceMedia = {
  kind: "video" | "image";
  desktop: MediaAsset;
  /** Dedicated mobile crop. Without it, mobile crops the desktop asset at `focus`. */
  mobile?: MediaAsset;
  alt: string;
  /** "loop": silent autoplay loop (hero). "inview": plays while visible, with controls. */
  playback?: "loop" | "inview";
  /** CSS object-position used when a frame crops the asset. */
  focus?: string;
  /** Test material: labelled on screen and only loaded with MEDIA_PREVIEW=1. */
  preview?: boolean;
};

/** Identifies a slot where real, sanitized product media must appear. */
export type EvidenceSlot = {
  id: string;
  demonstrates: string;
  caption: string;
  claimIds: string[];
  /** Real media; undefined while pending (the labelled placeholder is shown). */
  media?: EvidenceMedia;
  /** For crop sequences: 2–3 related real crops. */
  crops?: { src: string; alt: string; label: string }[];
  format: "screenshot" | "video" | "crop-sequence";
  width: number;
  height: number;
};
