"use client"

import Script from "next/script"

export function Analytics() {

  return (
    <>
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
    </>
  )
}
