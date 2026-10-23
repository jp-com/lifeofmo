"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Feather,
  Heart,
  Leaf,
  Menu,
  Plus,
  X,
  ZoomIn,
} from "lucide-react";

const friends = [
  {
    id: "mo",
    name: "Mo",
    species: "The hedgehog",
    summary: "A warm heart. A little curiosity. Always a friend.",
    detail:
      "Mo is the familiar heart of the woodland. Warm, curious and reassuring, he is there when a friend needs him — even when he doesn’t have all the answers. There is still plenty for him to discover, too.",
  },
  {
    id: "ella",
    name: "Ella",
    species: "The owl",
    summary: "An artist finding her own kind of courage.",
    detail:
      "Ella sees a world full of colour and possibility. With her brushes close by and Mo beside her, she is discovering that courage can begin with the smallest attempt. Her adventure leads our very first story.",
  },
  {
    id: "benny",
    name: "Benny",
    species: "The bunny",
    summary: "A quiet soul who notices the little things.",
    detail:
      "Thoughtful Benny brings a quieter perspective to the friends’ adventures. With his blue bow tie and gently curious nature, he reminds us that everyone has their own way of finding a place in the woodland.",
  },
  {
    id: "pip",
    name: "Pip",
    species: "The squirrel",
    summary: "A pocketful of possibilities. An eye on what’s next.",
    detail:
      "For Pip, the woodland is full of things to discover. With a trusty little satchel and a wonderfully bushy tail, this curious squirrel is always interested in what might be just around the next tree.",
  },
];
const samples = [
  {
    title: "One small step",
    text: "Ella spread her wings, took a shaky breath, and hopped off the branch. Her landing was clumsy, but she made it to the mossy ground.",
    question: "What is something you would like to try?",
  },
  {
    title: "A friend beside you",
    text: "“You did it,” Mo said, clapping softly. “Let’s try from a little higher.”",
    question: "Who helps you feel brave?",
  },
];
const faq = [
  [
    "Who is the book for?",
    "Ella’s Night Flight is for children aged 4–8, with shared reading at its heart. It is a gentle story for children and grown-ups to enjoy and talk about together.",
  ],
  [
    "What is Ella’s Night Flight about?",
    "Ella’s story explores courage through small attempts, steady friendship, and the freedom to decide when you are ready. With Mo beside her, she finds her own moment to try.",
  ],
  [
    "What is included?",
    "The illustrated story includes three activities to enjoy together. The cover and activity artwork shown here are previews; final format and production details will be shared before checkout opens.",
  ],
  [
    "How much is the book, and can I pre-order?",
    "The book will be £20. Pre-order checkout is opening soon. Join the launch list to hear when you can place an order. Joining the list does not reserve a copy or take payment.",
  ],
  [
    "When will my book arrive?",
    "The dispatch date is still to be confirmed. We will share the expected dispatch window before taking pre-orders.",
  ],
  [
    "Where will you deliver?",
    "Delivery destinations and shipping costs will be announced before pre-orders open. The £20 book price does not yet include a confirmed delivery charge.",
  ],
];
function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand-mark ${light ? "brand-light" : ""}`}>
      <img
        src="/assets/wordmark.webp"
        alt="Life of Mo"
        width="1254"
        height="1254"
      />
    </span>
  );
}
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
  return (
    <div
      className={`character-art ${pose === "happy" ? "character-happy" : ""} ${className}`}
    >
      <img
        src={`/assets/${id}-sheet.webp`}
        alt={`${friend?.name}, ${friend?.species.toLowerCase()}`}
        width="1536"
        height="1024"
        loading="lazy"
      />
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement;
    dialog.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = before;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <button
        className="icon-button modal-close"
        aria-label="Close dialog"
        onClick={onClose}
      >
        <X size={22} />
      </button>
      {children}
    </dialog>
  );
}
function Signup({ source, dark = false }: { source: string; dark?: boolean }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("loading");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          source,
          company: data.get("company"),
          consent: true,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(
          result.error || "Something went wrong. Please try again.",
        );
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
      setStatus("error");
    }
  }
  if (status === "success")
    return (
      <div className={`signup-success ${dark ? "on-dark" : ""}`} role="status">
        <Check size={24} />
        <div>
          <strong>You’re on the list.</strong>
          <p>Thank you for being part of Mo’s next chapter.</p>
        </div>
      </div>
    );
  return (
    <form className={`signup ${dark ? "signup-dark" : ""}`} onSubmit={submit}>
      <label htmlFor={`email-${source}`}>Your email address</label>
      <div className="signup-row">
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          maxLength={254}
          aria-describedby={
            status === "error" ? `error-${source}` : `note-${source}`
          }
        />
        <button
          className="button"
          disabled={status === "loading"}
          type="submit"
        >
          {status === "loading" ? "Joining…" : "Keep me updated"}
          <ArrowRight size={17} />
        </button>
      </div>
      <div className="honey" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id={`note-${source}`} className="form-note">
        By joining, you agree to receive Life of Mo book and launch updates.
      </p>
      {status === "error" && (
        <p id={`error-${source}`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
export default function Home() {
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  const [sample, setSample] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeMenu = () => {
    setMenu(false);
    menuButton.current?.focus();
  };
  const selectedFriend = friends.find((f) => modal === f.id);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  const openSample = () => setModal("sample");
  const preorder = () => {
    setMenu(false);
    setModal("preorder");
  };
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" aria-label="Life of Mo home" className="brand-link">
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#the-book">The book</a>
            <a href="#friends">Meet the friends</a>
            <a href="#our-story">Our story</a>
          </nav>
          <button className="button header-order" onClick={preorder}>
            Pre-order <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button menu-toggle"
            ref={menuButton}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Mobile navigation"
          >
            <a href="#the-book" onClick={closeMenu}>
              The book
            </a>
            <a href="#friends" onClick={closeMenu}>
              Meet the friends
            </a>
            <a href="#our-story" onClick={closeMenu}>
              Our story
            </a>
            <button className="button" onClick={preorder}>
              Pre-order · £20 <ArrowRight size={18} />
            </button>
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-heading">
            <p className="eyebrow">
              <span className="tiny-star">✧</span> The first Life of Mo story
            </p>
            <h1 id="hero-title">
              Ella’s
              <br /> <span>Night Flight</span>
            </h1>
          </div>
          <div className="hero-art">
            <img
              src="/assets/book-woodland.webp"
              alt="Ella’s Night Flight, a lavender picture book featuring Ella the owl and Mo the hedgehog in a moonlit woodland"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <span className="art-note">Cover illustration preview</span>
          </div>
          <div className="hero-details">
            <p className="hero-description">
              A little courage. A friend beside you.
              <br /> A whole woodland waiting.
            </p>
            <p className="hero-context">
              Join Mo and Ella in a gentle adventure about finding the courage
              to try, one small step at a time.
            </p>
            <p className="book-facts">
              Ages 4–8 <span>·</span> Three activities inside
            </p>
            <div className="purchase-row">
              <span className="price">£20</span>
              <span className="launch-label">Pre-orders opening soon</span>
            </div>
            <div className="hero-actions">
              <button className="button" onClick={preorder}>
                Pre-order the book <ArrowRight size={18} />
              </button>
              <button className="text-link" onClick={openSample}>
                Read a sample <BookOpen size={17} />
              </button>
            </div>
            <p className="dispatch-note">Dispatch date to be announced.</p>
          </div>
        </section>
        <div className="story-ribbon">
          <div className="container">
            <span>
              <BookOpen size={17} /> Made for reading together
            </span>
            <span>
              <Heart size={17} /> A little space for big feelings
            </span>
            <span>
              <Leaf size={17} /> A world to return to
            </span>
          </div>
        </div>
        <section
          className="preview-section section"
          id="the-book"
          aria-labelledby="preview-title"
        >
          <div className="container preview-grid">
            <div className="section-copy">
              <p className="eyebrow">A peek between the pages</p>
              <h2 id="preview-title">
                Big feelings.
                <br /> <em>Small steps.</em>
              </h2>
              <p>
                Ella wants to join her friends beneath the stars. With Mo beside
                her, she discovers that being brave can begin with a very little
                try.
              </p>
              <p>
                A story about feeling nervous, accepting a friend’s help, and
                finding your own moment to begin.
              </p>
              <button className="text-link" onClick={openSample}>
                Step inside the story <ArrowRight size={18} />
              </button>
              <div className="story-themes">
                <span>Courage</span>
                <span>Friendship</span>
                <span>At your own pace</span>
              </div>
            </div>
            <div className="preview-gallery">
              <div className="open-book">
                <div className="book-page page-words">
                  <span className="page-flourish">✧</span>
                  <p key={sample}>{samples[sample].text}</p>
                  <span className="page-bottom">Ella’s Night Flight</span>
                </div>
                <div className="book-page page-art">
                  <img
                    src="/assets/first-flight.webp"
                    alt="Mo encourages Ella as she opens her wings on a low branch beside a woodland lake"
                    width="1536"
                    height="1024"
                    loading="lazy"
                  />
                  <button
                    className="enlarge-button"
                    onClick={openSample}
                    aria-label="Enlarge the story sample"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>
              </div>
              <div className="gallery-footer">
                <div
                  className="sample-switches"
                  aria-label="Choose a story excerpt"
                >
                  {samples.map((s, i) => (
                    <button
                      key={s.title}
                      onClick={() => setSample(i)}
                      aria-pressed={i === sample}
                    >
                      <span className="sample-dot" />
                      {s.title}
                    </button>
                  ))}
                </div>
                <span className="art-note">Story & artwork preview</span>
              </div>
            </div>
          </div>
        </section>
        <section
          className="activities-section section"
          aria-labelledby="activities-title"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">For curious little hands</p>
                <h2 id="activities-title">More to explore together.</h2>
              </div>
              <p>
                Three activities inside the book.
                <br /> A little more time in Mo’s world.
              </p>
            </div>
            <div className="activities-grid">
              {[
                {
                  title: "Trace a little wonder",
                  desc: "Follow the shapes of the woodland.",
                  x: 43,
                  w: 236,
                },
                {
                  title: "Make it your own",
                  desc: "Bring a little colour to Ella’s world.",
                  x: 292,
                  w: 236,
                },
                {
                  title: "Find your way",
                  desc: "Follow a woodland path with Benny.",
                  x: 538,
                  w: 236,
                },
              ].map((a, i) => (
                <article className="activity" key={a.title}>
                  <div
                    className="activity-image"
                    style={
                      {
                        "--crop-left": `${(-a.x / a.w) * 100}%`,
                        "--crop-width": `${(815 / a.w) * 100}%`,
                      } as CSSProperties
                    }
                  >
                    <img
                      src="/assets/concept.webp"
                      alt={`Activity preview: ${a.title}`}
                      width="815"
                      height="1928"
                      loading="lazy"
                    />
                  </div>
                  <div className="activity-caption">
                    <span className="activity-number">0{i + 1}</span>
                    <div>
                      <h3>{a.title}</h3>
                      <p>{a.desc}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="small-note">
              A first look at the activities. Final pages may vary.
            </p>
          </div>
        </section>
        <section
          className="friends-section section"
          id="friends"
          aria-labelledby="friends-title"
        >
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Good company for growing up</p>
                <h2 id="friends-title">Meet Mo and his friends.</h2>
              </div>
              <p>
                Four woodland friends.
                <br /> Plenty still to discover.
              </p>
            </div>
            <div className="friends-grid">
              {friends.map((f) => (
                <button
                  className="friend"
                  key={f.id}
                  onClick={() => setModal(f.id)}
                  aria-label={`Meet ${f.name}`}
                >
                  <Character id={f.id} />
                  <div className="friend-info">
                    <h3>
                      {f.name}
                      <ArrowUpRight size={18} />
                    </h3>
                    <span className="friend-species">{f.species}</span>
                    <p>{f.summary}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          className="origin-section section"
          id="our-story"
          aria-labelledby="origin-title"
        >
          <div className="container origin-grid">
            <div className="origin-art">
              <span className="origin-ring" />
              <Character id="mo" pose="happy" />
              <span className="origin-handwritten">
                A friend for all your chapters.
              </span>
            </div>
            <div className="origin-copy">
              <p className="eyebrow">A very personal beginning</p>
              <h2 id="origin-title">
                It began with
                <br /> a childhood friend.
              </h2>
              <p>
                Created by Junya Lim, Life of Mo began with a beloved stuffed
                toy — and a question: who might that little friend become as he
                grew up?
              </p>
              <p>
                That childhood friendship lives on in Mo. A little older, still
                curious, and with all his tenderness intact. Now, there is a
                whole woodland to discover together.
              </p>
              <p className="origin-signoff">
                Small adventures. Big feelings. <Heart size={19} />
              </p>
            </div>
          </div>
        </section>
        <section className="faq-section section" aria-labelledby="faq-title">
          <div className="container faq-container">
            <div className="faq-intro">
              <p className="eyebrow">Before the adventure begins</p>
              <h2 id="faq-title">A few helpful details.</h2>
            </div>
            <div className="faq-list">
              {faq.map(([q, a], i) => (
                <div
                  className={`faq-item ${openFaq === i ? "is-open" : ""}`}
                  key={q}
                >
                  <h3>
                    <button
                      aria-expanded={openFaq === i}
                      aria-controls={`faq-${i}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {q}
                      <Plus size={20} />
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
        <section className="final-cta section" aria-labelledby="cta-title">
          <div className="container cta-grid">
            <div className="cta-copy">
              <p className="eyebrow">The woodland is waiting</p>
              <h2 id="cta-title">
                Every adventure starts
                <br /> with a little courage.
              </h2>
              <p>
                Begin with <em>Ella’s Night Flight.</em>
                <br /> The first story in the Life of Mo woodland world.
              </p>
              <button className="button" onClick={preorder}>
                Pre-order the book · £20 <ArrowRight size={18} />
              </button>
              <p className="dispatch-note">
                Opening soon. Dispatch date to be announced.
              </p>
            </div>
            <div className="cta-art">
              <img
                src="/assets/book-woodland.webp"
                alt="Ella’s Night Flight book preview"
                width="1536"
                height="1024"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div className="footer-brand">
              <a href="#" aria-label="Life of Mo home">
                <Brand light />
              </a>
              <p>Stories that hug back.</p>
              <span>Small adventures. Big feelings.</span>
            </div>
            <div className="footer-newsletter">
              <h2>A little woodland post.</h2>
              <p>
                New stories, book news, and the beginning of something lovely.
              </p>
              <Signup source="footer" dark />
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Life of Mo · Created by Junya Lim
            </span>
            <div>
              <button onClick={() => setModal("booksellers")}>
                For booksellers
              </button>
              <a href="#faq-title">Delivery & pre-orders</a>
              <button onClick={() => setModal("privacy")}>Privacy</button>
            </div>
            <span className="footer-leaf">
              <Leaf size={24} />
            </span>
          </div>
        </div>
      </footer>
      {modal === "preorder" && (
        <Modal
          title="Pre-order Ella’s Night Flight"
          onClose={() => setModal(null)}
        >
          <p className="eyebrow">A new adventure is on its way</p>
          <h2>
            Be there for
            <br /> the first chapter.
          </h2>
          <p>
            <em>Ella’s Night Flight</em> will be <strong>£20</strong>. Pre-order
            checkout is opening soon, and the dispatch date is still to be
            announced.
          </p>
          <p>Join the launch list to hear when the book is ready to order.</p>
          <Signup source="preorder" />
          <p className="small-note">
            No payment is taken. Joining the list does not reserve a copy.
          </p>
        </Modal>
      )}
      {modal === "booksellers" && (
        <Modal title="For booksellers" onClose={() => setModal(null)}>
          <p className="eyebrow">A place on your shelves</p>
          <h2>
            Hello, fellow
            <br /> story lovers.
          </h2>
          <p>
            Interested in bringing Life of Mo to your bookshop? Leave your email
            for news about the first release and future bookseller information.
          </p>
          <Signup source="bookseller" />
        </Modal>
      )}
      {modal === "privacy" && (
        <Modal title="Your email and privacy" onClose={() => setModal(null)}>
          <p className="eyebrow">A note about your details</p>
          <h2>
            Your email,
            <br /> handled with care.
          </h2>
          <p>
            The signup form stores your email address, the time you joined, and
            whether you signed up for launch or bookseller updates in the Life
            of Mo website database.
          </p>
          <p>
            By submitting it, you ask to receive Life of Mo book and launch
            updates. The form does not place an order or collect payment
            details. It is intended for grown-ups; we do not ask for children’s
            personal information.
          </p>
          <p>No marketing emails are sent automatically by this website.</p>
        </Modal>
      )}
      {selectedFriend && (
        <Modal
          title={`Meet ${selectedFriend.name}`}
          onClose={() => setModal(null)}
        >
          <div className="friend-modal-art">
            <Character id={selectedFriend.id} />
          </div>
          <p className="eyebrow">{selectedFriend.species}</p>
          <h2>Hello, {selectedFriend.name}.</h2>
          <p>{selectedFriend.detail}</p>
          <button
            className="text-link"
            onClick={() => {
              setModal("sample");
              setSample(0);
            }}
          >
            Come into the woodland <ArrowRight size={18} />
          </button>
        </Modal>
      )}
      {modal === "sample" && (
        <Modal
          title="Read a sample of Ella’s Night Flight"
          onClose={() => setModal(null)}
          wide
        >
          <div className="reader-heading">
            <p className="eyebrow">From Ella’s Night Flight</p>
            <h2>{samples[sample].title}</h2>
          </div>
          <img
            className="reader-image"
            src="/assets/first-flight.webp"
            alt="Ella takes a small step on a branch with Mo encouraging her beside a twilight lake"
            width="1536"
            height="1024"
          />
          <p className="reader-excerpt" aria-live="polite">
            {samples[sample].text}
          </p>
          <div className="reader-question">
            <Feather size={19} />
            <p>
              A little question to share:{" "}
              <strong>{samples[sample].question}</strong>
            </p>
          </div>
          <div className="reader-controls">
            <button
              className="icon-button"
              aria-label="Previous excerpt"
              disabled={sample === 0}
              onClick={() => setSample(0)}
            >
              <ChevronLeft />
            </button>
            <span>
              Excerpt {sample + 1} of {samples.length}
            </span>
            <button
              className="icon-button"
              aria-label="Next excerpt"
              disabled={sample === samples.length - 1}
              onClick={() => setSample(1)}
            >
              <ChevronRight />
            </button>
          </div>
          <p className="small-note">Story and illustration preview.</p>
        </Modal>
      )}
    </>
  );
}
