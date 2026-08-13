import type { ActionResult } from "@/lib/errors";

export function toFormAction<T>(
  action: (formData: FormData) => Promise<ActionResult<T> | void>,
) {
  return async (formData: FormData): Promise<void> => {
    await action(formData);
  };
}
