import { DocsSidebarNav } from "@/components/sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { blogSidebarNav } from "@/config/blog";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: Readonly<BlogLayoutProps>) {
  return (
    <div className="border-b border-border">
      <div className="mx-auto w-full max-w-[1400px] flex-1 items-start px-6 lg:px-8 md:grid md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8">
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 md:sticky md:block">
          <ScrollArea className="h-full py-6 pr-4 lg:py-8">
            <DocsSidebarNav items={blogSidebarNav} />
          </ScrollArea>
        </aside>
        {children}
      </div>
    </div>
  );
}
