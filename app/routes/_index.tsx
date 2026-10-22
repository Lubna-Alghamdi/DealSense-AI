import {
  IconChartBar,
  IconClipboardList,
  IconFileText,
  IconScale,
  IconTruckDelivery,
  IconUpload,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import { LinkButton, Panel } from "@/components/app-ui";
import { APP_TITLE } from "@/lib/app-config";
import { cn } from "@/lib/utils";

export function meta() {
  return [{ title: APP_TITLE }];
}

const STEPS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <IconClipboardList size={26} />,
    title: "Set up your purchase",
    body: "Name the product and the quantity you need. Each supplier's order is adjusted to its minimum order quantity automatically.",
  },
  {
    icon: <IconUpload size={26} />,
    title: "Add supplier quotes",
    body: "Enter quotes one by one or upload an .xlsx or .csv file. Invalid rows are flagged before anything is saved.",
  },
  {
    icon: <IconChartBar size={26} />,
    title: "Compare and decide",
    body: "See suppliers ranked by lowest cost, fastest delivery, or a balance of both, then test priorities in the simulator.",
  },
  {
    icon: <IconFileText size={26} />,
    title: "Share the report",
    body: "Download a printable report with the recommended supplier and the assumptions behind it.",
  },
];

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <IconScale size={22} />,
    title: "Compare Suppliers",
    body: "Compare unit prices, shipping, MOQ and delivery times.",
  },
  {
    icon: <IconChartBar size={22} />,
    title: "Automatic Calculations",
    body: "Automatically calculate order quantity and total purchasing cost.",
  },
  {
    icon: <IconTruckDelivery size={22} />,
    title: "Decision Simulator",
    body: "Test cost, delivery and balanced purchasing priorities.",
  },
  {
    icon: <IconFileText size={22} />,
    title: "Generate Report",
    body: "Review and download a final supplier comparison.",
  },
];

export default function HomeRoute() {
  return (
    <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-6 px-4 py-8 md:px-8">
      <section className="flex flex-col items-center gap-6 pt-8 pb-4 text-center md:pt-14">
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
          Smarter supplier decisions
          <span className="block bg-gradient-to-r from-primary to-violet-300 bg-clip-text text-transparent">
            made simple.
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground md:text-lg">
          Compare supplier quotes and find the best fit for your purchase.
        </p>
        <LinkButton to="/create">Start Comparison</LinkButton>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Panel key={feature.title} className="flex flex-col gap-3 p-5">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              {feature.icon}
            </span>
            <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
            <p className="text-sm text-muted-foreground">{feature.body}</p>
          </Panel>
        ))}
      </div>

      <section className="flex flex-col gap-12 pt-12 pb-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          How it works
        </h2>
        <ol className="relative flex flex-col gap-6">
          <span
            aria-hidden="true"
            className="absolute inset-y-6 left-5 w-px -translate-x-1/2 bg-border md:left-1/2"
          />
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            const card = (
              <div className="flex max-w-sm flex-1 gap-4 rounded-2xl border border-border bg-card/60 p-5">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  {step.icon}
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-semibold tracking-widest text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </div>
            );
            const connector = <span aria-hidden="true" className="hidden h-px w-8 shrink-0 bg-border md:block" />;
            return (
              <li
                key={step.title}
                className="relative pl-14 md:grid md:grid-cols-[1fr_0.75rem_1fr] md:items-center md:pl-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-11 left-5 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20 md:hidden"
                />
                <div
                  className={cn(
                    "md:row-start-1 md:flex md:items-center",
                    isEven ? "md:col-start-1 md:justify-end" : "md:col-start-3",
                  )}
                >
                  {isEven ? (
                    <>
                      {card}
                      {connector}
                    </>
                  ) : (
                    <>
                      {connector}
                      {card}
                    </>
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className="hidden size-3 rounded-full bg-primary ring-4 ring-primary/20 md:row-start-1 md:col-start-2 md:block"
                />
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
