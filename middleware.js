import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const userAgent = request.headers.get('user-agent') || '';

  // Check if it's a direct API call to /api/[uid]
  if (url.pathname.match(/^\/api\/[^\/]+$/)) {
    // List of user agents that need OG metadata (social media crawlers)
    const needsMetadata = [
      'Twitterbot',
      'facebookexternalhit',
      'LinkedInBot',
      'WhatsApp',
      'TelegramBot',
      'SkypeUriPreview',
      'SlackBot',
      'Discordbot',
      'Applebot',
    ];

    const isBot = needsMetadata.some(bot => 
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (isBot) {
      // Extract uid from the API path
      const uid = url.pathname.replace('/api/', '');
      
      // Redirect bots to the share page which has proper OG metadata
      url.pathname = `/share/${uid}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:uid*',
};
