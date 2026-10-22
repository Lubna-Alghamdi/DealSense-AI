import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  integer?: boolean;
  step?: string;
  className?: string;
  onValidChange: (value: number) => void;
}

/**
 * Keeps the typed text locally so partial input such as "8." survives, and
 * reports only valid numbers upward. The parent's value wins when it changes
 * to something other than what the text already represents.
 */
export function NumberField({
  id,
  label,
  value,
  min,
  integer = false,
  step,
  className,
  onValidChange,
}: NumberFieldProps) {
  const [text, setText] = useState(String(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (Number(text) !== value) {
      setText(String(value));
      setInvalid(false);
    }
    // Only sync when the stored value changes; text is local typing state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(next: string) {
    setText(next);
    const parsed = next.trim() === "" ? NaN : Number(next);
    const valid =
      Number.isFinite(parsed) &&
      parsed >= min &&
      (!integer || Number.isInteger(parsed));
    setInvalid(!valid);
    if (valid) onValidChange(parsed);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-navy">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        inputMode={integer ? "numeric" : "decimal"}
        min={min}
        step={step ?? (integer ? "1" : "any")}
        value={text}
        aria-invalid={invalid}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10"
      />
      {invalid ? (
        <p className="text-xs text-danger">
          {integer
            ? `Enter a whole number of ${min} or more.`
            : `Enter a number of ${min} or more.`}
        </p>
      ) : null}
    </div>
  );
}
