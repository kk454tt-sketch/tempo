import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

const STEPS = [
  { icon: "public", title: "Pick your country", body: "We show your local Amazon store." },
  { icon: "touch_app", title: "Open a product", body: "See the price and stock for your country." },
  { icon: "shopping_bag", title: "Buy on Amazon", body: "You finish the purchase on Amazon." },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-20">
      <Container>
        <h2 id="how-title" className="mb-6 text-headline-md font-bold text-primary">
          How it works
        </h2>
        <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <li key={step.title} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
                <Icon name={step.icon} className="text-[24px]" />
              </span>
              <div>
                <p className="text-body-lg font-semibold text-on-surface">{step.title}</p>
                <p className="mt-1 text-body-md text-on-surface-variant">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
