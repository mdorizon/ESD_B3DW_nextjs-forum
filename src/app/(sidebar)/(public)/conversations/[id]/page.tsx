import MessageForm from "@/components/app/message/MessageForm";
import MessageList from "@/components/app/message/MessageList";
import ConversationHeader from "@/components/app/conversation/ConversationHeader";

interface ConversationDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const { id } = await params;

  console.log("Conversation ID:", id);
  const response = await fetch(`http://localhost:3000/api/conversations/${id}`, {
    cache: "no-store",
  });
  const conversation = await response.json();

  return (
    <div className="flex flex-col h-screen">
      {/* Header statique en haut */}
      <ConversationHeader conversation={conversation} />

      {/* Zone de messages avec scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <MessageList conversationId={id} />
      </div>

      {/* Formulaire statique en bas */}
      <div className="sticky bottom-0 bg-background border-t px-6 py-4">
        <MessageForm conversationId={id} />
      </div>
    </div>
  );
}
