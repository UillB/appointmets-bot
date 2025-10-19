import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ru', 'en', 'he'],

  // Used when no locale matches
  defaultLocale: 'ru',

  // Always show the locale in the URL
  localePrefix: 'always'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ru|en|he)/:path*']
}
