"use client"

import { useEffect } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { useSiteConfig } from "@/components/providers/site-config-provider"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const siteConfig = useSiteConfig()

  const googleAnalyticsId = siteConfig?.googleAnalyticsId
  const metaPixelId = siteConfig?.metaPixelId
  const adsenseId = siteConfig?.adsenseId

  // Google Analytics page view tracking
  useEffect(() => {
    if (googleAnalyticsId && window.gtag) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
      window.gtag("config", googleAnalyticsId, {
        page_path: url,
      })
    }
  }, [pathname, searchParams, googleAnalyticsId])

  // Meta Pixel page view tracking
  useEffect(() => {
    if (metaPixelId && window.fbq) {
      window.fbq("track", "PageView")
    }
  }, [pathname, searchParams, metaPixelId])

  return (
    <>
      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Google AdSense */}
      {adsenseId && (
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}
