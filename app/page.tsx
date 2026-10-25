"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Modal, SiteHeader, SiteFooter } from "../components/site-chrome";
import { StorySpreads } from "../components/story-spreads";

const friends = [
  {
    id: "mo",
    name: "Mo",
    species: "The hedgehog",
    summary: "Warm, curious and always learning.",
    detail:
      "Mo is the familiar heart of the woodland. Warm, curious and reassuring, he is there when a friend needs him — even when he doesn’t have all the answers. There is still plenty for him to discover, too.",
  },
  {
    id: "ella",
    name: "Ella",
    species: "The owl",
    summary: "An artist finding her courage.",
    detail:
      "Ella sees a world full of colour and possibility. With her brushes close by and Mo beside her, she is discovering that courage can begin with the smallest attempt. Her adventure leads our very first story.",
  },
  {
    id: "benny",
    name: "Benny",
    species: "The bunny",
    summary: "Thoughtful, gentle and quietly curious.",
    detail:
      "Thoughtful Benny brings a quieter perspective to the friends’ adventures. With his blue bow tie and gently curious nature, he reminds us that everyone has their own way of finding a place in the woodland.",
  },
  {
    id: "pip",
    name: "Pip",
    species: "The squirrel",
    summary: "Curious about what lies ahead.",
    detail:
      "For Pip, the woodland is full of things to discover. With a trusty little satchel and a wonderfully bushy tail, this curious squirrel is always interested in what might be just around the next tree.",
  },
];
const faq = [
  [
    "Who is the book for?",
    "Ella’s Night Flight is for children aged 4–8, with shared reading at its heart. It is a story for children and grown-ups to enjoy and talk about together.",
  ],
  [
    "What’s included in the collector’s edition?",
    "The collector’s edition includes Ella’s Night Flight, plus maze, crossword and colouring activities to enjoy together.",
  ],
  [
    "When will my pre-order arrive?",
    "The dispatch date is still to be confirmed. Delivery timing will depend on your destination.",
  ],
  [
    "Where will you deliver?",
    "Delivery destinations and shipping costs are still to be confirmed. The £20 book price excludes delivery.",
  ],
];
const activities = [
  {
    title: "Maze",
    text: "Help the woodland friends find their way.",
    image: "activity-spot-detail",
    alt: "A woodland maze and pencil on a soft lavender circle.",
  },
  {
    title: "Crossword",
    text: "Solve the clues and fill in the words.",
    image: "activity-hidden-detail-v2",
    alt: "A woodland puzzle sheet, oak leaf and pencil on a soft lavender circle.",
  },
  {
    title: "Colouring",
    text: "Bring the woodland to life with your own colours.",
    image: "activity-colouring-detail-v2",
    alt: "A sunflower colouring page with yellow and lavender pencils.",
  },
];

function Character({
  id,
  pose = "front",
  className = "",
}: {
  id: string;
  pose?: "front" | "happy";
  className?: string;
}) {
  const friend = friends.find((f) => f.id === id);
  const portrait = ["mo", "benny", "ella", "pip"].includes(id) && pose === "front";
  return (
    <div
      className={`character-art character-${id} ${portrait ? "character-portrait" : ""} ${pose === "happy" ? "character-happy" : ""} ${className}`}
    >
      <img
        src={portrait ? `/assets/${id}-portrait-v2.webp` : `/assets/${id}-sheet.webp`}
        alt={`${friend?.name}, ${friend?.species.toLowerCase()}`}
        width={portrait ? 800 : 1536}
        height={portrait ? 800 : 1024}
        loading="lazy"
      />
    </div>
  );
}
export default function Home() {
  const [modal, setModal] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const selectedFriend = friends.find((friend) => modal === friend.id);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero container" id="the-book" aria-labelledby="hero-title">
          <div className="hero-heading">
            <p className="book-label">The first Life of Mo story</p>
            <h1 id="hero-title">
              Ella’s
              <br />
              <span>Night Flight</span>
            </h1>
            <p className="hero-description">
              A woodland adventure about finding
              <br className="desktop-break" /> courage, one small step at a
              time.
            </p>
          </div>
          <figure className="hero-art">
            <img
              src="/assets/hero-collectors-edition-v2.webp"
              alt="Ella’s Night Flight: Ella perches on a branch beneath the moon on a cream book cover, beside a woodland tree and wildflowers"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
          </figure>
          <div className="hero-purchase">
            <p className="product-edition">Collector’s edition</p>
            <p className="product-price">£20</p>
            <div className="hero-actions">
              <Link className="button" href="/checkout">
                Pre-order the book
              </Link>
            </div>
          </div>
        </section>
        <section
          className="story-section"
          id="story-preview"
          aria-labelledby="story-title"
        >
          <div className="container story-grid">
            <div className="story-copy">
              <h2 id="story-title">
                A little courage
                <br /> begins here.
              </h2>
              <p>
                Ella wants to join her friends beneath the stars, but flying
                into the dark feels frightening. With Mo beside her, she begins
                with one small step.
              </p>
              <details className="product-details">
                <summary>
                  Product details <Plus size={18} aria-hidden="true" />
                </summary>
                <dl>
                  <div>
                    <dt>Recommended age</dt>
                    <dd>Ages 4–8, to read and enjoy together.</dd>
                  </div>
                  <div>
                    <dt>Inside the book</dt>
                    <dd>
                      An illustrated woodland story and three activities: maze,
                      crossword and colouring.
                    </dd>
                  </div>
                </dl>
              </details>
            </div>
            <StorySpreads />
          </div>
        </section>
        <section
          className="activities-section"
          aria-labelledby="activities-title"
        >
          <div className="container">
            <div className="section-intro">
              <h2 id="activities-title">Inside the book.</h2>
              <p>Three cozy activities to enjoy together.</p>
            </div>
            <div className="activities-grid">
              {activities.map((activity) => (
                <article className="activity" key={activity.title}>
                  <img
                    className="activity-art"
                    src={`/assets/${activity.image}.webp`}
                    alt={activity.alt}
                    width="800"
                    height="800"
                    loading="lazy"
                  />
                  <div className="activity-copy">
                    <h3>{activity.title}</h3>
                    <p>{activity.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          className="friends-section"
          id="friends"
          aria-labelledby="friends-title"
        >
          <div className="container">
            <div className="section-intro">
              <h2 id="friends-title">Meet Mo and his friends.</h2>
              <p>Four woodland friends, with plenty still to discover.</p>
            </div>
            <div className="friends-grid">
              {friends.map((f) => (
                <button
                  className={`friend friend-${f.id}`}
                  key={f.id}
                  onClick={() => setModal(f.id)}
                  aria-label={`Meet ${f.name}`}
                >
                  <Character id={f.id} />
                  <h3>{f.name}</h3>
                  <p>{f.summary}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          className="origin-section"
          id="our-story"
          aria-labelledby="origin-title"
        >
          <div className="container origin-grid">
            <img
              className="origin-art"
              src="/assets/origin-woodland-tea.jpg"
              alt="Mo, Benny, Pip and Ella share tea outside their woodland home beneath an old tree"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <div className="origin-copy">
              <h2 id="origin-title">The story behind Life of Mo.</h2>
              <p>
                Created by Junya Lim, Life of Mo imagines who his beloved
                childhood toy might have become: grown up, with a woodland home
                and friendships of their own.
              </p>
              <p>
                Through illustrated storybooks, Mo and his friends help children
                understand their feelings, care for others and find the confidence
                to try.
              </p>
            </div>
          </div>
        </section>
        <section className="faq-section" aria-labelledby="faq-title">
          <div className="container faq-grid">
            <h2 id="faq-title">
              A few helpful
              <br /> details.
            </h2>
            <div className="faq-list">
              {faq.map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <h3>
                    <button
                      aria-expanded={openFaq === i}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {q}
                      <Plus size={18} />
                    </button>
                  </h3>
                  <div id={`faq-${i}`} hidden={openFaq !== i}>
                    <p>{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section
          className="launch-section"
          id="launch"
          aria-labelledby="launch-title"
        >
          <div className="container launch-inner">
            <div className="launch-copy">
              <h2 id="launch-title">Begin with Ella’s Night Flight.</h2>
              <p className="launch-description">
                The first story in the Life of Mo woodland world.
              </p>
              <div className="launch-purchase">
                <p className="product-edition">Collector’s edition</p>
                <p className="product-price">£20</p>
                <Link className="button" href="/checkout">
                  Pre-order the book
                </Link>
              </div>
            </div>
            <figure className="launch-art">
              <img
                src="/assets/hero-collectors-edition-v2.webp"
                alt="Ella’s Night Flight collector’s edition beside a woodland tree"
                width="1536"
                height="1024"
                loading="lazy"
              />
            </figure>
          </div>
        </section>
      </main>
      <SiteFooter />
      {selectedFriend && (
        <Modal
          title={`Meet ${selectedFriend.name}`}
          onClose={() => setModal(null)}
        >
          <div className="friend-modal-art">
            <Character id={selectedFriend.id} />
          </div>
          <h2>
            {selectedFriend.name}{" "}
            <span>{selectedFriend.species.toLowerCase()}</span>
          </h2>
          <p>{selectedFriend.detail}</p>
        </Modal>
      )}
    </>
  );
}
