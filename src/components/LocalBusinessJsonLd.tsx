const DATA = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Vinny's Bar & Grill",
  url: "https://vinnysbargrill.com/",
  telephone: "+1-734-905-7051",
  image: "https://vinnysbargrill.com/photos/storefront.webp",
  address: {
    "@type": "PostalAddress",
    streetAddress: "705 W. Cross St.",
    addressLocality: "Ypsilanti",
    addressRegion: "MI",
    postalCode: "48197",
    addressCountry: "US",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "11:00",
    closes: "15:00",
    description: "Lunch from the printed menu. Later hours are not confirmed.",
  },
};

export function LocalBusinessJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATA) }} />
  );
}
