import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../../components/site-chrome";
import { StorySpreads } from "../../../components/story-spreads";
import { bookStructuredData, siteUrl } from "../../../lib/seo";
import styles from "./book.module.css";

const path = "/books/ellas-night-flight";
const description = "Discover Ella’s Night Flight, a woodland picture book about courage for ages 4–8. Pre-order the £20 hardcover collector’s edition, with three activities.";
export const metadata: Metadata = {
  title: "Ella’s Night Flight — Collector’s Edition | Life of Mo",
  description,
  alternates: { canonical: path },
  openGraph: { title: "Ella’s Night Flight — Life of Mo", description, url: path, type: "book", images: ["/assets/hero-collectors-edition-v2.webp"] },
};
const activities = [
  ["Maze", "Help the woodland friends find their way.", "activity-spot-detail"],
  ["Crossword", "Solve the clues and fill in the words.", "activity-hidden-detail-v2"],
  ["Colouring", "Bring the woodland to life with your own colours.", "activity-colouring-detail-v2"],
];
export default function BookPage() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookStructuredData).replace(/</g, "\\u003c") }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Life of Mo", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Ella’s Night Flight", item: `${siteUrl}${path}` }] }) }} />
    <SiteHeader />
    <main id="main" className={styles.main}>
      <div className="container">
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Life of Mo</Link><span aria-hidden="true">/</span><span aria-current="page">Ella’s Night Flight</span></nav>
        <section className={styles.hero} aria-labelledby="book-title">
          <div className={styles.art}><img src="/assets/hero-collectors-edition-v2.webp" width={1536} height={1024} fetchPriority="high" alt="Ella’s Night Flight collector’s edition beside a woodland tree and wildflowers" /></div>
          <div className={styles.intro}>
            <p className="book-label">The first Life of Mo story · Ages 4–8</p>
            <h1 id="book-title">Ella’s Night Flight</h1>
            <p className={styles.lead}>A woodland adventure about finding courage, one small step at a time.</p>
            <p className={styles.author}>By Junya Lim</p>
            <div className={styles.purchase}><span>Hardcover collector’s edition</span><strong>£20</strong></div>
            <Link className={`button ${styles.cta}`} href="/checkout">Pre-order the book</Link>
            <p className={styles.note}>Shipping from £5. Dispatch date to be confirmed.</p>
            <a className={styles.textLink} href="#inside-the-book">Take a look inside ↓</a>
          </div>
        </section>
        <section id="inside-the-book" className={styles.story} aria-labelledby="story-heading">
          <div><p className="book-label">A little courage begins here</p><h2 id="story-heading">One small step.<br />A whole new adventure.</h2><p>Ella wants to join her friends beneath the stars, but flying into the dark feels frightening. With Mo beside her, she begins with one small step.</p><p>A gentle story to read together, opening up conversations about big feelings, friendship and finding the confidence to try.</p></div>
          <StorySpreads />
        </section>
        <section className={styles.edition} aria-labelledby="edition-heading">
          <div><p className="book-label">Made to keep</p><h2 id="edition-heading">A special first edition.</h2><p>A limited collector’s edition with thoughtful finishing touches, for your bookshelf or a little reader you love.</p></div>
          <dl><div><dt>Format</dt><dd>Hardcover with deckled page edges</dd></div><div><dt>Finishing touches</dt><dd>Metallic accents</dd></div><div><dt>Reading age</dt><dd>Ages 4–8, to enjoy with a grown-up</dd></div><div><dt>Inside</dt><dd>Ella’s illustrated story, a maze, crossword and colouring page</dd></div></dl>
        </section>
        <section className={styles.activities} aria-labelledby="activity-heading"><h2 id="activity-heading">More to enjoy together.</h2><p>Three cosy activities after the story.</p><div className={styles.activityGrid}>{activities.map(([title,text,image])=><article key={title}><img src={`/assets/${image}.webp`} width={800} height={800} loading="lazy" alt={`${title} activity illustration`} /><h3>{title}</h3><p>{text}</p></article>)}</div><p className={styles.note}>Younger children may need a little help with the crossword.</p></section>
        <section className={styles.delivery} aria-labelledby="delivery-heading"><h2 id="delivery-heading">Before you pre-order.</h2><div>
          <details open><summary>When will my book arrive?</summary><p>Our dispatch date is still being confirmed. We’ll email you when we have an estimated dispatch window and keep you informed if it changes.</p></details>
          <details><summary>Where do you deliver?</summary><p>Worldwide, subject to availability for your address. Standard shipping is £5 and Shipping+ is £7.50. Available options and your total are shown at checkout.</p></details>
          <details><summary>What is Shipping+?</summary><p>Shipping+ gives your order priority dispatch once the books are ready. For UK orders, it also includes prepaid return postage if you change your mind. Delivery dates are estimates and cannot be guaranteed.</p></details>
          <details><summary>Can I cancel my pre-order?</summary><p>Payment is taken in full when you pre-order. You can cancel before dispatch for a full refund of everything paid to us. <Link href="/contact">Contact us</Link> with your order number.</p></details>
        </div></section>
        <section className={styles.final} aria-labelledby="order-heading"><p className="book-label">Stories that hug back.</p><h2 id="order-heading">Bring Ella’s adventure home.</h2><p>Hardcover collector’s edition · £20</p><Link className="button" href="/checkout">Pre-order the book</Link><p className={styles.note}>Shipping charged separately. Dispatch date to be confirmed.</p></section>
      </div>
    </main>
    <SiteFooter />
  </>;
}
