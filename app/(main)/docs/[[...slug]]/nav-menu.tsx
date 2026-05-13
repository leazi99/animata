"use client";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SidebarNavItem } from "@/types";

interface NavMenuProps {
  value: string;
  sideBarNavItems: SidebarNavItem[];
  baseRoute: "docs" | "blog";
  triggerClassName?: string;
  className?: string;
}

export default function NavMenu({
  value,
  sideBarNavItems,
  baseRoute,
  triggerClassName,
  className,
}: Readonly<NavMenuProps>) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const suffix = value ? `/${value}` : "";
  const defaultValue = `/${baseRoute}${suffix}`;

  return (
    <div className={cn("flex items-center", className)}>
      <Select
        defaultValue={defaultValue}
        onValueChange={(value) => {
          if (value) {
            setNavigating(true);
            router.push(value);
          }
        }}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-fit border-border/70 bg-background/70 px-2.5 text-xs font-medium text-foreground/90",
            triggerClassName,
          )}
        >
          <SelectValue placeholder="Change page" />
        </SelectTrigger>
        <SelectContent>
          {sideBarNavItems.map((item) => (
            <SelectGroup key={item.href ?? item.title}>
              <SelectLabel className="font-medium">{item.title}</SelectLabel>
              {item?.items?.length &&
                item.items.map((item) => (
                  <SelectItem key={item.href} value={item.href ?? item.title}>
                    {!item.disabled &&
                      (item.href ? (
                        <Link href={item.href} className="text-muted-foreground">
                          {item.title}
                          {item.label && (
                            <span className="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline">
                              {item.label}
                            </span>
                          )}
                        </Link>
                      ) : (
                        item.title
                      ))}
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      {navigating && (
        <div className="px-1">
          <Loader className="inline-block size-4 animate-spin" />
        </div>
      )}
    </div>
  );
}
