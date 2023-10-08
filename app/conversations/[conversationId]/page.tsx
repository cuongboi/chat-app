import getConversationById from "@/app/actions/getConversationById";
import getMessages from "@/app/actions/getMessages";

import Header from "./components/Header";
import Body from "./components/Body";
import Form from "./components/Form";
import ProfileColumm, { ProfileDivider } from "./components/ProfileColumn";
import EmptyState from "@/app/components/EmptyState";
import getLastConversation from "@/app/actions/getLastConversation";

interface IParams {
  conversationId: string;
}

const ChatId = async ({ params }: { params: IParams }) => {
  if (!params.conversationId) {
    const lastConversation = await getLastConversation();
    params.conversationId = lastConversation?.id!;
  }

  const [conversation, messages] = await Promise.all([
    getConversationById(params.conversationId),
    getMessages(params.conversationId),
  ]);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileDivider>
        <div className="h-full flex flex-col">
          <Header conversation={conversation} />
          <Body initialMessages={messages} />
          <Form />
        </div>
      </ProfileDivider>

      <ProfileColumm data={conversation} />
    </>
  );
};

export default ChatId;
