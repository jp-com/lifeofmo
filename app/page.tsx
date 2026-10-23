"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowRight, Check, Menu, Plus, X } from "lucide-react";

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
    "What’s included in the £20 book?",
    "An illustrated woodland story, plus spot the difference, hidden objects and colouring activities to enjoy together. The artwork shown is a preview; final book specifications will be shared before pre-orders open.",
  ],
  [
    "When can I pre-order?",
    "Pre-orders are not open yet. We’ll confirm the dispatch window before taking orders. Join the launch list to hear when checkout opens; joining does not reserve a copy or take payment.",
  ],
  [
    "Where will you deliver?",
    "Delivery destinations and shipping costs will be confirmed before pre-orders open. The £20 book price excludes delivery.",
  ],
];
const activities = [
  {
    title: "Spot the difference",
    text: "Find the tiny changes hidden in each scene.",
    image: "activity-spot",
    alt: "Mo examines a ladybird through a magnifying glass.",
  },
  {
    title: "Hidden objects",
    text: "Search for little treasures tucked throughout the woodland.",
    image: "activity-hidden",
    alt: "Pip discovers a teapot and an acorn among woodland leaves.",
  },
  {
    title: "Colouring",
    text: "Bring the woodland to life with your own colours.",
    image: "activity-colouring",
    alt: "Ella holds a coloured pencil beside a sunflower colouring page.",
  },
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
      className={`character-art character-${id} ${pose === "happy" ? "character-happy" : ""} ${className}`}
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
          <p>We’ll let you know when pre-orders open.</p>
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
          {status === "loading"
            ? "Joining…"
            : source === "bookseller"
              ? "Join the list"
              : "Notify me"}
        </button>
      </div>
      <div className="honey" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id={`note-${source}`} className="form-note">
        {source === "bookseller"
          ? "For grown-ups. By joining, you agree to receive Life of Mo book news."
          : "For grown-ups. By joining, you agree to receive pre-order updates."}
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const selectedFriend = friends.find((f) => modal === f.id);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menu]);
  const join = () => {
    setMenu(false);
    setModal("launch");
  };
  const closeMenu = () => setMenu(false);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="container header-inner">
          <a href="#" className="brand-link" aria-label="Life of Mo home">
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="#the-book">The book</a>
            <a href="#friends">Meet the friends</a>
            <a href="#our-story">Our story</a>
          </nav>
          <button className="button header-join" onClick={join}>
            Book updates
          </button>
          <button
            ref={menuButton}
            className="icon-button menu-toggle"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        {menu && (
          <nav
            className="mobile-nav"
            id="mobile-nav"
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
            <button className="button" onClick={join}>
              Book updates
            </button>
          </nav>
        )}
      </header>
      <main id="main">
        <section className="hero container" aria-labelledby="hero-title">
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
              src="/assets/hero-v2.webp"
              alt="Ella’s Night Flight: a lavender storybook with Ella flying above Mo, framed by a woodland tree and wildflowers"
              width="1536"
              height="1024"
              fetchPriority="high"
            />
            <figcaption>Cover preview</figcaption>
          </figure>
          <div className="hero-purchase">
            <p className="book-details">
              <span>Ages 4–8</span>
              <span>Three activities inside</span>
              <strong>£20</strong>
            </p>
            <div className="hero-actions">
              <button className="button" onClick={join}>
                Notify me when pre-orders open
              </button>
              <button className="text-link" onClick={() => setModal("sample")}>
                Look inside <ArrowRight size={17} />
              </button>
            </div>
            <p className="launch-note">
              Pre-orders opening soon · Dispatch to be confirmed
            </p>
          </div>
        </section>
        <section
          className="story-section"
          id="the-book"
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
              <p className="story-benefit">
                A gentle starting point for conversations about feeling nervous,
                accepting help and trying something new.
              </p>
              <button className="text-link" onClick={() => setModal("sample")}>
                Read a story excerpt <ArrowRight size={17} />
              </button>
            </div>
            <figure className="story-art">
              <button
                className="spread-button"
                onClick={() => setModal("sample")}
                aria-label="Open the story preview"
              >
                <img
                  src="/assets/spread-v2.webp"
                  alt="An open storybook: Mo encourages Ella on a low branch beside a woodland lake"
                  width="1859"
                  height="846"
                  loading="lazy"
                />
              </button>
              <figcaption>Story and illustration preview</figcaption>
            </figure>
          </div>
        </section>
        <section
          className="activities-section"
          aria-labelledby="activities-title"
        >
          <div className="container">
            <div className="section-intro">
              <h2 id="activities-title">More to enjoy together.</h2>
              <p>Three activities in the book, to enjoy together.</p>
            </div>
            <div className="activities-grid">
              {activities.map((activity) => (
                <article className="activity" key={activity.title}>
                  <img
                    className="activity-art"
                    src={`/assets/${activity.image}.webp`}
                    alt={activity.alt}
                    width="1024"
                    height="1024"
                    loading="lazy"
                  />
                  <div className="activity-copy">
                    <h3>{activity.title}</h3>
                    <p>{activity.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="preview-note">
              Illustrations show the activities; final book pages may vary.
            </p>
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
                  className="friend"
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
              src="/assets/origin-v2.webp"
              alt="Mo sits on a mossy rock beneath a tree, watching fireflies in the woodland"
              width="1774"
              height="887"
              loading="lazy"
            />
            <div className="origin-copy">
              <h2 id="origin-title">
                It began with
                <br /> a childhood friend.
              </h2>
              <p>
                Created by Junya Lim, Life of Mo was inspired by a beloved
                childhood toy. Its stories carry that friendship into a woodland
                world of new adventures, unfamiliar feelings and growing up
                together.
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
            <div>
              <h2 id="launch-title">Begin with Ella’s Night Flight.</h2>
              <p>The first story in the Life of Mo woodland world.</p>
              <button className="button" onClick={join}>
                Notify me when pre-orders open
              </button>
              <p className="launch-note">£20 · Dispatch date to be confirmed</p>
            </div>
            <img
              src="/assets/hero-v2.webp"
              alt="Ella’s Night Flight book preview"
              width="1536"
              height="1024"
              loading="lazy"
            />
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a href="#" aria-label="Life of Mo home">
              <Brand light />
            </a>
            <p>Small adventures. Big feelings.</p>
          </div>
          <div className="footer-newsletter">
            <h2>Be first to hear when pre-orders open.</h2>
            <Signup source="footer" dark />
          </div>
          <div className="footer-links">
            <button onClick={() => setModal("booksellers")}>
              For booksellers
            </button>
            <a href="#faq-title">Delivery &amp; pre-orders</a>
            <button onClick={() => setModal("privacy")}>Privacy</button>
            <span>© {new Date().getFullYear()} Life of Mo</span>
          </div>
        </div>
      </footer>
      {modal === "launch" && (
        <Modal title="Book launch updates" onClose={() => setModal(null)}>
          <h2>Be first to hear.</h2>
          <p>
            We’ll let you know when <em>Ella’s Night Flight</em> is ready to
            pre-order.
          </p>
          <p>
            The book will be £20. We’ll confirm dispatch timing and delivery
            costs before checkout opens.
          </p>
          <Signup source="preorder" />
          <p className="small-note">
            No payment is taken. Joining the list does not reserve a copy.
          </p>
        </Modal>
      )}
      {modal === "booksellers" && (
        <Modal title="For booksellers" onClose={() => setModal(null)}>
          <h2>For booksellers.</h2>
          <p>
            Interested in stocking Life of Mo? Leave your email for news about
            the first release and future bookseller information.
          </p>
          <Signup source="bookseller" />
        </Modal>
      )}
      {modal === "privacy" && (
        <Modal title="Your email and privacy" onClose={() => setModal(null)}>
          <h2>Your email and privacy.</h2>
          <p>
            We store your email address, signup time and signup source in the
            Life of Mo website database, so we can share book and launch news.
          </p>
          <p>
            This form is for grown-ups. It does not place an order, collect
            payment details or ask for children’s personal information.
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
          <h2>
            {selectedFriend.name}{" "}
            <span>{selectedFriend.species.toLowerCase()}</span>
          </h2>
          <p>{selectedFriend.detail}</p>
        </Modal>
      )}
      {modal === "sample" && (
        <Modal
          title="Inside Ella’s Night Flight"
          onClose={() => setModal(null)}
          wide
        >
          <h2>Inside Ella’s Night Flight.</h2>
          <img
            className="reader-art"
            src="/assets/spread-v2.webp"
            alt="Mo encourages Ella to open her wings on a branch by the woodland lake"
            width="1859"
            height="846"
          />
          <div className="reader-copy">
            <p>
              Ella spread her wings, took a shaky breath, and hopped off the
              branch. Her landing was clumsy, but she made it to the mossy
              ground.
            </p>
            <p>
              “You did it,” Mo said, clapping softly. “Let’s try from a little
              higher.”
            </p>
          </div>
          <p className="reader-question">
            To talk about together: <strong>Who helps you feel brave?</strong>
          </p>
          <p className="preview-note">
            Story and artwork preview; final pages may vary.
          </p>
        </Modal>
      )}
    </>
  );
}
