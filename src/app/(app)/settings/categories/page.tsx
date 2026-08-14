import { requireUser } from "@/lib/supabase/auth";
import { categoryService } from "@/services/catalog-service";
import { Field } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCategoryAction } from "@/features/finance/actions";
import { SettingsSubpage } from "@/features/profile/settings-subpage";
import { asFormAction } from "@/types";

export default async function CategoriesSettingsPage() {
  const { supabase, userId } = await requireUser();
  const categories = await categoryService.list(supabase, userId);
  const cats = categories.success ? categories.data : [];

  return (
    <SettingsSubpage title="Categorias" description="Organize entradas e saídas do seu jeito.">
      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <div className="flex flex-wrap gap-2">
          {cats.map((category) => (
            <span key={category.id} className="rounded-full bg-muted px-3 py-1 text-sm">
              {category.name}
            </span>
          ))}
        </div>
        <form action={asFormAction(createCategoryAction)} className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Nova categoria" htmlFor="category-name">
            <Input id="category-name" name="name" required className="h-11" />
          </Field>
          <input type="hidden" name="icon" value="CircleDot" />
          <input type="hidden" name="color" value="#84CC16" />
          <input type="hidden" name="type" value="expense" />
          <Button type="submit" className="h-11 self-end rounded-2xl">
            Criar categoria
          </Button>
        </form>
      </section>
    </SettingsSubpage>
  );
}
