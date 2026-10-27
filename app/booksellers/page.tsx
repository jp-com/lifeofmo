import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../components/site-chrome";
import { BooksellerForm } from "./bookseller-form";
import styles from "./booksellers.module.css";

export const metadata: Metadata = {
  title: "For booksellers — Life of Mo",
  description:
    "Discover Ella’s Night Flight, the first Life of Mo story for ages 4–8, and enquire about stocking the collector’s edition in your bookshop.",
};

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className={styles.placeholder} role="img" aria-label={`${label} — image placeholder`}>
      <span>{label}</span>
      <span className={styles.placeholderNote}>Image placeholder</span>
    </div>
  );
}

export default function BooksellersPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <section className={`container ${styles.hero}`} aria-labelledby="booksellers-title">
          <div className={styles.heroCopy}>
            <p className="book-label">For booksellers</p>
            <h1 id="booksellers-title">A little woodland wonder for your shelves.</h1>
            <p className={styles.intro}>
              Stories about small adventures, big feelings and the friends who
              help us along the way. We’d love to bring the world of Mo to your
              bookshop.
            </p>
            <a className="button" href="#stocking-enquiry">Enquire about stocking</a>
          </div>
          <ImagePlaceholder label="Book & woodland illustration" />
        </section>

        <section className={`container ${styles.book}`} aria-labelledby="bookseller-book-title">
          <div className={styles.bookCopy}>
            <p className="book-label">The first Life of Mo story</p>
            <h2 id="bookseller-book-title">Ella’s Night Flight.</h2>
            <p>
              Ella wants to join her friends beneath the stars, but flying into
              the dark feels frightening. With Mo beside her, she begins with
              one small step.
            </p>
            <dl className={styles.details}>
              <div><dt>Edition</dt><dd>Collector’s edition</dd></div>
              <div><dt>For readers</dt><dd>Ages 4–8, to read and enjoy together</dd></div>
              <div><dt>Retail price</dt><dd>£20, excluding delivery</dd></div>
              <div>
                <dt>Inside</dt>
                <dd>An illustrated story, plus maze, crossword and colouring activities</dd>
              </div>
            </dl>
          </div>
          <ImagePlaceholder label="Inside the book" />
        </section>

        <section className={`container ${styles.collection}`} aria-labelledby="collection-title">
          <div className={styles.collectionIntro}>
            <h2 id="collection-title">A wider world of Mo.</h2>
            <p>
              Ella’s Night Flight is the first story in a wider series. More
              books, plush friends and accessories are planned, giving families
              more ways to spend time in the world of Mo.
            </p>
          </div>
          <div className={styles.collectionGrid}>
            <article className={styles.collectionItem}>
              <ImagePlaceholder label="Future book covers" />
              <h3>More woodland stories</h3>
              <p>Further adventures with Mo and his friends.</p>
            </article>
            <article className={styles.collectionItem}>
              <ImagePlaceholder label="Plush collection" />
              <h3>Plush friends</h3>
              <p>Soft companions inspired by the woodland friends.</p>
            </article>
            <article className={styles.collectionItem}>
              <ImagePlaceholder label="Accessories collection" />
              <h3>Woodland accessories</h3>
              <p>A little of Mo’s world for everyday adventures.</p>
            </article>
          </div>
        </section>

        <section
          id="stocking-enquiry"
          className={`container ${styles.enquiry}`}
          aria-labelledby="enquiry-title"
        >
          <div className={styles.enquiryIntro}>
            <p className="book-label">Let’s start a conversation</p>
            <h2 id="enquiry-title">Enquire about stocking.</h2>
            <p>
              Tell us a little about your bookshop and what you have in mind.
              We’d love to hear from you.
            </p>
            <p className={styles.otherEnquiries}>
              Have a different question?{" "}
              <a href="/contact">Say hello <span aria-hidden="true">→</span></a>
            </p>
          </div>
          <BooksellerForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
