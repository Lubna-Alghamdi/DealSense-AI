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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <Panel key={feature.title} className="flex flex-col gap-2 p-3 sm:gap-3 sm:p-5">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 sm:size-11">
              {feature.icon}
            </span>
            <h2 className="text-sm font-semibold leading-tight text-foreground sm:text-base">{feature.title}</h2>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{feature.body}</p>
          </Panel>
        ))}
      </div>

      <section className="flex flex-col gap-8 pt-8 pb-6 md:gap-12 md:pt-12 md:pb-8">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
          How it works
        </h2>
        <ol className="relative flex flex-col gap-3 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-border md:inset-y-6"
          />
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            const mobileRight = index % 2 === 0;
            const card = (
              <div className="flex w-[46%] gap-2 rounded-xl border border-border bg-card/60 p-2.5 md:max-w-sm md:flex-1 md:gap-4 md:rounded-2xl md:p-5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary md:size-12 md:rounded-xl">
                  {step.icon}
                </span>
                <div className="flex min-w-0 flex-col gap-1 md:gap-1.5">
                  <span className="text-[9px] font-semibold tracking-widest text-primary md:text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[11px] font-semibold leading-tight text-foreground md:text-base">{step.title}</h3>
                  <p className="text-[9px] leading-snug text-muted-foreground md:text-sm">{step.body}</p>
                </div>
              </div>
            );
            const connector = <span aria-hidden="true" className="hidden h-px w-8 shrink-0 bg-border md:block" />;
            return (
              <li
                key={step.title}
                className={cn(
                  "relative flex min-h-24 items-center md:grid md:min-h-0 md:grid-cols-[1fr_0.75rem_1fr] md:items-center",
                  mobileRight ? "justify-end" : "justify-start",
                )}
              >
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-primary/20 md:hidden"
                />
                <div
                  className={cn(
                    "contents md:row-start-1 md:flex md:items-center",
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
