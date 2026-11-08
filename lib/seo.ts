export const siteUrl = "https://lifeofmo.com";
export const bookStructuredData = {
  "@context": "https://schema.org",
  "@type": ["Book", "Product"],
  "@id": `${siteUrl}/#ellas-night-flight`,
  name: "Ella’s Night Flight — Collector’s edition",
  url: `${siteUrl}/`,
  image: [`${siteUrl}/assets/hero-collectors-edition-v2.webp`],
  description: "A hardcover woodland adventure about courage and friendship for ages 4–8, with deckled page edges, metallic accents, a maze, crossword and colouring page.",
  author: { "@type": "Person", name: "Junya Lim" },
  brand: { "@type": "Brand", name: "Life of Mo" },
  bookFormat: "https://schema.org/Hardcover",
  inLanguage: "en",
  typicalAgeRange: "4-8",
  sku: "ella-collectors-edition",
  offers: {
    "@type": "Offer",
    url: `${siteUrl}/`,
    price: "20.00",
    priceCurrency: "GBP",
    availability: "https://schema.org/PreOrder",
    itemCondition: "https://schema.org/NewCondition",
  },
};
