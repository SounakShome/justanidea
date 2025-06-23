import { auth } from "@/auth";
import UI from "./ui";

export default async function Settings() {

  const session = await auth();

  return (
    <UI session={session} />
  )
}