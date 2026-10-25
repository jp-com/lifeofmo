"use client";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Menu, X } from "lucide-react";

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
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
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
      className="modal"
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
          <p>We’ll keep you updated with Life of Mo book news.</p>
        </div>
      </div>
    );
  return (
    <form className={`signup ${dark ? "signup-dark" : ""}`} onSubmit={submit}>
      <label className={dark ? "visually-hidden" : undefined} htmlFor={`email-${source}`}>
        Your email address
      </label>
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
              : "Sign up"}
        </button>
      </div>
      <div className="honey" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p id={`note-${source}`} className="form-note">
        By joining, you agree to receive Life of Mo book news.
      </p>
      {status === "error" && (
        <p id={`error-${source}`} className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export function SiteHeader() {
  const [menu, setMenu] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu) {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [menu]);
  const closeMenu = () => setMenu(false);
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <a href="/" className="brand-link" aria-label="Life of Mo home">
            <Brand />
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a href="/#the-book">The book</a>
            <a href="/#friends">Meet the friends</a>
            <a href="/#our-story">Our story</a>
          </nav>
          <button className="button header-join" type="button">
            Pre-order
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
            <a href="/#the-book" onClick={closeMenu}>
              The book
            </a>
            <a href="/#friends" onClick={closeMenu}>
              Meet the friends
            </a>
            <a href="/#our-story" onClick={closeMenu}>
              Our story
            </a>
            <button className="button" type="button">
              Pre-order the book
            </button>
          </nav>
        )}
      </header>
    </>
  );
}

export function SiteFooter() {
  const [modal, setModal] = useState<string | null>(null);
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a href="/" aria-label="Life of Mo home">
              <Brand light />
            </a>
            <p className="footer-tagline">Stories that hug back.</p>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <div className="footer-links">
              <h2>Explore</h2>
              <a href="/#the-book">The book</a>
              <a href="/#friends">Meet the friends</a>
              <a href="/#our-story">Our story</a>
            </div>
            <div className="footer-links">
              <h2>Here to help</h2>
              <a href="/contact">Contact</a>
              <button type="button" onClick={() => setModal("booksellers")}>
                For booksellers
              </button>
              <a href="/#faq-title">Delivery &amp; pre-orders</a>
            </div>
          </nav>
          <div className="footer-newsletter" aria-labelledby="footer-newsletter-title">
            <h2 id="footer-newsletter-title">Keep in touch.</h2>
            <p>New books and little updates from the world of Mo.</p>
            <Signup source="footer" dark />
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Life of Mo</span>
          <button type="button" onClick={() => setModal("privacy")}>
            Privacy
          </button>
        </div>
      </footer>
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
        <Modal title="Your details and privacy" onClose={() => setModal(null)}>
          <h2>Your details and privacy.</h2>
          <p>
            When you contact us, we store your name, email address, enquiry type
            and message in the Life of Mo website database. These details are
            used to handle your enquiry.
          </p>
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
    </>
  );
}
