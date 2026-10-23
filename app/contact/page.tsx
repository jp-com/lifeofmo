import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "../../components/site-chrome";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Say hello — Life of Mo",
  description: "Get in touch with Life of Mo about the book, bookshop enquiries, press or collaborations.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="contact-main">
        <div className="container contact-grid">
          <div className="contact-intro">
            <p className="book-label">Get in touch</p>
            <h1>Say hello.</h1>
            <p className="contact-description">
              Have a question about the book, a bookshop enquiry, or something
              you’d like to share? We’d love to hear from you.
            </p>
            <p className="contact-email" aria-label="Placeholder contact email: hello@lifeofmo.example">
              hello@lifeofmo.example
            </p>
            <p className="contact-help">
              Looking for delivery information?<br />
              <a href="/#faq-title">See our FAQs <span aria-hidden="true">→</span></a>
            </p>
            <div className="contact-mo character-art character-mo">
              <img src="/assets/mo-sheet.webp" alt="Mo, the little hedgehog in his favourite scarf" width="1536" height="1024" />
            </div>
          </div>
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
