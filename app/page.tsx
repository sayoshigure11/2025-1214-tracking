import { cookies } from "next/headers";
import HomePage from "./components/home";

export default async function Page() {
  const userId = (await cookies()).get("uid")?.value;
  const abVariant = ((await cookies()).get("ab_variant")?.value || "A") as
    | "A"
    | "B";
  console.log("userId, abVariant", { userId, abVariant });

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <HomePage abVariant={abVariant} />
    </div>
  );
}
