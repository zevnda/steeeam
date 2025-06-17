import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
// import { useEffect } from 'react';

export default function SharePage() {
  const router = useRouter();
  const { uid, ...query } = router.query;

  // useEffect(() => {
  //   // For direct visits, redirect to the image after a short delay
  //   const timer = setTimeout(() => {
  //     const apiUrl = `/api/${uid}${Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''}`;
  //     window.location.href = apiUrl;
  //   }, 1000);

  //   return () => clearTimeout(timer);
  // }, [uid, query]);

  if (!uid) return null;

  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://steeeam.vercel.app'}/api/${uid}${Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''}`;
  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://steeeam.vercel.app'}/share/${uid}${Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : ''}`;

  console.log(imageUrl, shareUrl);

  return (
    <>
      <Head>
        <title>Steam Profile: {uid}</title>
        <meta name="description" content={`View ${uid}'s Steam profile statistics and game library overview.`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={`Steam Profile: ${uid}`} />
        <meta property="og:description" content={`View ${uid}'s Steam profile statistics and game library overview.`} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="705" />
        <meta property="og:image:height" content="385" />
        <meta property="og:image:type" content="image/png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={shareUrl} />
        <meta property="twitter:title" content={`Steam Profile: ${uid}`} />
        <meta property="twitter:description" content={`View ${uid}'s Steam profile statistics and game library overview.`} />
        <meta property="twitter:image" content={imageUrl} />

        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={shareUrl} />
      </Head>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <Image 
          src={imageUrl} 
          alt={`Steam profile for ${uid}`}
          width={705}
          height={385}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
    </>
  );
}
