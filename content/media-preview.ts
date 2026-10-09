import type { EvidenceMedia } from "./types";

/**
 * TEST MATERIAL ONLY — media under review, not approved proof.
 * Loaded exclusively when the build runs with MEDIA_PREVIEW=1 (`npm run preview:media`);
 * files go in public/assets/product/pruebas/ (git-ignored) and are labelled on screen.
 * Empty while no test material is under review.
 */
export const MEDIA_PREVIEW = process.env.MEDIA_PREVIEW === "1";

export const previewEvidence: Record<string, EvidenceMedia> = {};

export const previewChapters: Record<string, EvidenceMedia> = {};
