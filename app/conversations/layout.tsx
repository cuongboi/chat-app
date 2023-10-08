import getConversations from "../actions/getConversations";
import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import SubSideBar from "./components/SubSideBar";

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    // @ts-expect-error Server Component
    <Sidebar>
      <SubSideBar users={users} initialItems={conversations}>
        {children}
      </SubSideBar>
    </Sidebar>
  );
}
