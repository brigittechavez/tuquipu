"use server";

import { headers } from "next/headers";
import { getLeadDelivery } from "@/lib/leads/delivery";
import { leadRateLimiter } from "@/lib/leads/rate-limit";
import { submitLead, type LeadFormState } from "@/lib/leads/submit";

export async function submitLeadAction(_prev: LeadFormState, form: FormData): Promise<LeadFormState> {
  const h = await headers();
  const clientKey = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return submitLead(form, {
    delivery: getLeadDelivery(),
    allow: (key) => leadRateLimiter.check(key),
    clientKey,
  });
}
