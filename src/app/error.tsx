"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="container section error-page"><h1>Something needs a second look.</h1><p>We couldn’t load the page. Please try again or call 757-717-3940.</p><button className="button primary" onClick={reset}>Try again</button></main>; }
