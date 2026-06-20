import { useCallback, useTransition } from "react";

export function useCheckout() {
  const [isPending, startTransition] = useTransition();

  const checkout = useCallback(() => {
    startTransition(() => {
      window.location.href = "/pricing";
    });
  }, []);

  return { checkout, isPending };
}
