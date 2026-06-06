"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, Loader2, Folder, User, Phone, FileText, Briefcase, Link } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { unifiedSearch, type UnifiedSearchResults } from "@/actions/fulltext/unified-search";

const ICONS: Record<string, React.ElementType> = {
  accounts: Briefcase,
  contacts: Phone,
  leads: User,
  opportunities: Link,
  projects: Folder,
  tasks: FileText,
  users: User,
  documents: FileText,
};

const ENTITY_LABELS: Record<keyof UnifiedSearchResults, string> = {
  accounts: "Accounts",
  contacts: "Contacts",
  leads: "Leads",
  opportunities: "Opportunities",
  projects: "Projects",
  tasks: "Tasks",
  users: "Users",
  documents: "Documents",
};

const ENTITY_ORDER: (keyof UnifiedSearchResults)[] = [
  "accounts",
  "contacts",
  "leads",
  "opportunities",
  "projects",
  "tasks",
  "users",
  "documents",
];

const FulltextSearch = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UnifiedSearchResults | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";

  const handleSearch = () => {
    setOpen(false);
    if (!search.trim()) return;
    router.push(`/${locale}/fulltext-search?q=${encodeURIComponent(search)}`);
    setSearch("");
  };

  useEffect(() => {
    if (!search || search.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(() => {
      unifiedSearch(search.trim(), locale)
        .then((res) => {
          if ("error" in res) return;
          setResults(res as UnifiedSearchResults);
        })
        .finally(() => setIsLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, locale]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <form
          className="flex w-full items-center space-x-2 flex-1 min-w-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            type="text"
            className="flex-1 min-w-0"
            placeholder={"Search something ..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onClick={() => setOpen(search.trim().length > 0)}
          />
          <Button type="submit" className="gap-2 shrink-0">
            <span className="hidden sm:flex">Search</span>
            <SearchIcon className="h-4 w-4" />
          </Button>
        </form>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 shadow-xl" 
        align="start" 
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList className="max-h-[350px]">
            {isLoading && (
              <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}
            {!isLoading && results && !ENTITY_ORDER.some((key) => results[key] && results[key].length > 0) && (
              <CommandEmpty>No results found for &quot;{search}&quot;</CommandEmpty>
            )}
            {!isLoading && results && (
              <>
                {ENTITY_ORDER.map((key) => {
                  const items = results[key]?.slice(0, 3) || [];
                  if (items.length === 0) return null;
                  const Icon = ICONS[key] || FileText;
                  return (
                    <CommandGroup key={key} heading={ENTITY_LABELS[key]}>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            setOpen(false);
                            setSearch("");
                            router.push(item.url);
                          }}
                          onMouseDown={(e) => {
                            // Prevent input from losing focus and closing popover before select
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium">{item.title}</span>
                            {item.subtitle && (
                              <span className="truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FulltextSearch;
