/** Replace `{{key}}` placeholders in admin-editable label templates. */
export function formatCopy(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}
