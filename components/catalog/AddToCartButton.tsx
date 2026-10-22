"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  addToCart,
  type CartActionError,
  type CartActionOutcome,
} from "@/actions/cart";
import { ArrowIcon } from "@/components/icons";

export interface AddToCartText {
  addToCart: string;
  adding: string;
  added: string;
  alreadyInCart: string;
  maxQuantity: string;
  viewCart: string;
  errors: Record<CartActionError, string>;
}

interface AddToCartButtonProps {
  productId: string;
  cartHref: string;
  text: AddToCartText;
}

export function AddToCartButton({
  productId,
  cartHref,
  text,
}: AddToCartButtonProps) {
  const [state, action, pending] = useActionState(addToCart, null);

  const notices: Partial<Record<CartActionOutcome, string>> = {
    added: text.added,
    already_in_cart: text.alreadyInCart,
    max_quantity: text.maxQuantity,
  };
  const notice = state?.success === true ? notices[state.data.outcome] : null;
  // Add has no user-typed input, so a rejected id is reported as unexpected.
  const error =
    state?.success === false
      ? text.errors[state.error === "invalid_input" ? "unexpected" : state.error]
      : null;

  return (
    <form action={action}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="group/add flex h-13 w-full items-center justify-center gap-2 rounded-card bg-primary-strong px-6 text-md font-bold text-white outline-offset-2 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary-strong disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? text.adding : text.addToCart}
        <ArrowIcon className="h-5 w-5 transition-transform duration-200 rtl:-scale-x-100 motion-safe:group-hover/add:translate-x-[3px] motion-safe:rtl:group-hover/add:-translate-x-[3px] motion-reduce:transition-none" />
      </button>
      <p role="status" className="mt-2 text-sm text-success empty:mt-0">
        {!pending && notice && (
          <>
            {notice}{" "}
            <Link
              href={cartHref}
              className="font-semibold text-primary-strong underline underline-offset-2"
            >
              {text.viewCart}
            </Link>
          </>
        )}
      </p>
      <p role="alert" className="mt-2 text-sm text-danger empty:mt-0">
        {!pending && error}
      </p>
    </form>
  );
}
