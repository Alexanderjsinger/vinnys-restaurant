import type { ReactNode } from "react";
import { CsrfField } from "./CsrfField";

type AdminFormProps = {
  action: string;
  children: ReactNode;
  className?: string;
  encType?: string;
};

/** Standard admin POST form with session-bound CSRF field. */
export async function AdminForm({ action, children, className, encType }: AdminFormProps) {
  return (
    <form className={className} action={action} method="post" encType={encType}>
      <CsrfField />
      {children}
    </form>
  );
}
