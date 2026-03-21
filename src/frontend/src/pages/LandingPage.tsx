import AuthModal from "@/components/AuthModal";
import DChitLogo from "@/components/DChitLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Gavel,
  Hash,
  History,
  Lock,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const features = [
  {
    icon: Users,
    title: "Digital Groups",
    description:
      "Create and manage chit fund groups with custom duration, amount, and member capacity.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description:
      "Track every monthly contribution with real-time paid/pending status for all members.",
  },
  {
    icon: Gavel,
    title: "Auction Management",
    description:
      "Run transparent digital auctions. Close bids, declare winners, and log results instantly.",
  },
  {
    icon: Hash,
    title: "Auto ID Generation",
    description:
      "Every member and organiser receives a unique ID (C0001, O0001) automatically on registration.",
  },
  {
    icon: History,
    title: "History & Reports",
    description:
      "Complete historical records of all payments and auction outcomes, always accessible.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Transparent",
    description:
      "Built on blockchain infrastructure for immutable, tamper-proof records you can trust.",
  },
];

const steps = [
  {
    num: "01",
    icon: "👤",
    title: "Register",
    desc: "Sign up as a Chit Member or Organiser with your name and email.",
  },
  {
    num: "02",
    icon: "👥",
    title: "Join Group",
    desc: "Join an existing chit group or create one as an organiser.",
  },
  {
    num: "03",
    icon: "💳",
    title: "Pay Monthly",
    desc: "Make your monthly chit contributions and track payment status.",
  },
  {
    num: "04",
    icon: "🏆",
    title: "Win Auction",
    desc: "Participate in monthly auctions and win the chit fund amount.",
  },
];

const benefits = [
  { icon: Zap, label: "Zero Admin Fees" },
  { icon: Hash, label: "Auto ID Generation" },
  { icon: FileText, label: "Digital Records" },
  { icon: TrendingUp, label: "Transparent Auctions" },
  { icon: Lock, label: "100% Secure" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Chit Member, Bengaluru",
    avatar: "PS",
    text: "DChit has completely transformed how our family manages chit funds. The transparency and digital records are incredible. I can track every payment instantly!",
    rating: 5,
  },
  {
    name: "Rajesh Kumar",
    role: "Organiser, Chennai",
    avatar: "RK",
    text: "Managing 5 different groups used to be an administrative nightmare. Now everything is automated with DChit. Creating groups and closing auctions takes seconds.",
    rating: 5,
  },
  {
    name: "Anitha Reddy",
    role: "Chit Member, Hyderabad",
    avatar: "AR",
    text: "I love how I can see my payment history and auction winners at a glance. The automatic ID system makes it easy to identify members. Highly recommended!",
    rating: 5,
  },
];

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "How It Works", "Pricing", "Security"],
  },
  {
    title: "Company",
    links: ["About Us", "Blog", "Careers", "Press"],
  },
  {
    title: "Support",
    links: ["Help Center", "Contact Us", "Privacy Policy", "Terms"],
  },
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"register" | "login">("register");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const openRegister = () => {
    setAuthTab("register");
    setAuthOpen(true);
  };

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
  };

  const prevTestimonial = () =>
    setTestimonialIdx(
      (i) => (i - 1 + testimonials.length) % testimonials.length,
    );
  const nextTestimonial = () =>
    setTestimonialIdx((i) => (i + 1) % testimonials.length);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-navy shadow-elevated">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <DChitLogo variant="light" size="md" />
          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
              onClick={openLogin}
              data-ocid="nav.link"
            >
              Login
            </Button>
            <Button
              className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold"
              onClick={openRegister}
              data-ocid="nav.primary_button"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-brand-green/10" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-brand-gold/10" />
          <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-brand-gold opacity-60" />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-brand-green opacity-40" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 bg-brand-green/20 text-brand-green border border-brand-green/30 text-sm font-medium px-3 py-1 rounded-full mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Trusted by 10,000+ chit fund members
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 max-w-4xl mx-auto">
              Modern Digital Chit Funds.{" "}
              <span className="text-brand-gold">Simple, Secure,</span>{" "}
              Transparent.
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Digitize your chit fund operations — manage groups, track
              payments, conduct transparent auctions, and maintain complete
              digital records effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="bg-brand-green hover:bg-brand-green/90 text-white font-bold text-base px-8 shadow-elevated"
                onClick={openRegister}
                data-ocid="hero.primary_button"
              >
                Start for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 text-white bg-white/10 hover:bg-white/20 font-semibold text-base px-8"
                onClick={openLogin}
                data-ocid="hero.secondary_button"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background" id="features">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful tools designed specifically for chit fund management
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full border border-border shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {f.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid Showcase */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Manage Everything from One Dashboard
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                From group creation to auction management, DChit handles it all
                with precision and complete transparency.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Automated monthly payment tracking",
                  "Digital auction system with winner declaration",
                  "Complete audit trail of all transactions",
                  "Member management with unique auto-IDs",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-semibold"
                onClick={openRegister}
                data-ocid="showcase.primary_button"
              >
                Get Started Free
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="rounded-2xl overflow-hidden shadow-elevated border border-border">
                <img
                  src="/assets/generated/dashboard-mockup.dim_600x400.png"
                  alt="DChit Dashboard"
                  className="w-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background" id="how-it-works">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in 4 simple steps
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                <div className="bg-card border border-border rounded-2xl p-6 text-center shadow-card h-full">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy text-white font-black text-lg mb-3 relative">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-gold text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="py-8 bg-navy">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {benefits.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2.5 text-white"
              >
                <b.icon className="w-5 h-5 text-brand-gold" />
                <span className="font-medium text-sm md:text-base">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Members Say
            </h2>
          </motion.div>
          <div className="max-w-2xl mx-auto">
            <Card className="border border-border shadow-elevated">
              <CardContent className="p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from(
                    { length: testimonials[testimonialIdx].rating },
                    (_, idx) => idx,
                  ).map((starIdx) => (
                    <span
                      key={`star-${testimonialIdx}-${starIdx}`}
                      className="text-brand-gold text-lg"
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-foreground text-lg leading-relaxed mb-6 italic">
                  &ldquo;{testimonials[testimonialIdx].text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm">
                    {testimonials[testimonialIdx].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonials[testimonialIdx].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[testimonialIdx].role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevTestimonial}
                className="rounded-full"
                data-ocid="testimonial.button"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2">
                {testimonials.map((t, i) => (
                  <button
                    type="button"
                    key={t.name}
                    onClick={() => setTestimonialIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === testimonialIdx ? "bg-primary" : "bg-border"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextTestimonial}
                className="rounded-full"
                data-ocid="testimonial.button"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-brand-green">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Digitize Your Chit Fund?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of members and organisers who trust DChit.
          </p>
          <Button
            size="lg"
            className="bg-white text-brand-green hover:bg-white/90 font-bold px-10"
            onClick={openRegister}
            data-ocid="cta.primary_button"
          >
            Get Started — It&apos;s Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <DChitLogo variant="light" size="md" />
              <p className="text-white/60 text-sm mt-3 leading-relaxed">
                The modern digital platform for transparent and efficient chit
                fund management.
              </p>
            </div>
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-white/60 text-sm cursor-default">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; {new Date().getFullYear()} DChit. All rights reserved.
            </p>
            <p className="text-white/50 text-sm">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:text-brand-gold/80 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
}
