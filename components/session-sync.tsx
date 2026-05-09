"use client"

/**
 * SessionSync
 *
 * Mounts invisibly in the root layout. Polls /api/auth/session-version every
 * 15 seconds while the tab is visible. When the server reports the member's
 * sessionVersion has changed (e.g. an admin updated their role), it calls
 * update() with no payload — this triggers the NextAuth JWT callback to
 * re-fetch the full user record from the DB, writing a fresh token to the
 * cookie and updating all useSession() subscribers instantly.
 */

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

const POLL_INTERVAL_MS = 15_000

export function SessionSync() {
  const { status, update } = useSession()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return

    async function check() {
      // Skip polling when tab is hidden (saves unnecessary requests)
      if (document.hidden) return

      try {
        const res = await fetch("/api/auth/session-version", { cache: "no-store" })
        if (!res.ok) return
        const { outdated } = await res.json()
        if (outdated) {
          // update() with no args → jwt callback re-fetches from DB
          await update()
        }
      } catch {
        // Network error — silently ignore, will retry next interval
      }
    }

    timerRef.current = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status, update])

  return null
}
