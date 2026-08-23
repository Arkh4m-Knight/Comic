// src/lib/gtm.ts
//
// Single, typed entry point for pushing events to GTM's dataLayer.
// Every GTM Custom Event trigger we build listens for `event: '<name>'` here,
// so ALL app-side tracking should go through pushToDataLayer() — never push
// to window.dataLayer directly from a component. That keeps event names and
// parameter keys from drifting out of sync with what's configured in GTM.

export type ComicMobEvent =
  | {
      event: "sign_up";
      method: "email" | "google";
    }
  | {
      event: "login";
      method: "email" | "google";
    }
  | {
      event: "chapter_start";
      story_slug: string;
      genre: string;
      chapter_number: number;
    }
  | {
      event: "reading_progress";
      story_slug: string;
      genre: string;
      chapter_number: number;
      progress_percent: 25 | 50 | 75 | 100;
    }
  | {
      event: "chapter_unlock";
      story_slug: string;
      chapter_number: number;
      unlock_method: "coins" | "daily_pass";
    }
  | {
      event: "favorite_story";
      story_slug: string;
      genre: string;
    }
  | {
      event: "review_submitted";
      story_slug: string;
      rating: number;
    }
  | {
      event: "begin_checkout";
      coin_amount: number;
      value: number;
      currency: string;
    }
  | {
      event: "purchase";
      transaction_id: string;
      coin_amount: number;
      value: number;
      currency: string;
    }
  | {
      event: "publish_story";
      genre: string;
      publish_step: "draft_started" | "published";
    };

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

/**
 * Pushes a typed event to GTM's dataLayer.
 * No-ops on the server — only call this from client components / event handlers.
 */
export function pushToDataLayer(payload: ComicMobEvent): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ...payload });
}
