import { redirect } from "next/navigation";

// Root "/" now redirects to WhatsApp chats as the default landing page
export default function RootRedirect() {
  redirect("/whatsapp");
}
