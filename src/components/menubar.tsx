import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

export default function MenubarComponent({setPage}: {setPage: (page: string) => void}) {
  return (
    <Menubar className="rounded-lg p-2">
      <MenubarMenu>
        <MenubarTrigger className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setPage("profile")}>Profile</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setPage("account")}>Account</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setPage("company")}>Company</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="hover:bg-gray-100 hover:cursor-pointer" onClick={() => setPage("notifications")}>Notifications</MenubarTrigger>
      </MenubarMenu>
    </Menubar>
  )
}
