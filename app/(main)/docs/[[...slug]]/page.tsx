import { ChevronRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Balancer from "react-wrap-balancer";
import { docs as allDocs } from "#site/content";
import NavMenu from "@/app/(main)/docs/[[...slug]]/nav-menu";
import CarbonAds from "@/components/ads";
import { Mdx } from "@/components/mdx-components";
import { DocsPager } from "@/components/pager";
import { DashboardTableOfContents } from "@/components/toc";
import { badgeVariants } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { docsConfig } from "@/config/docs";
import { siteConfig } from "@/config/site";
import { getTableOfContents } from "@/lib/toc";
import { absoluteUrl, cn } from "@/lib/utils";

import "@/styles/mdx.css";
interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams(params: { slug: string[] }) {
  const slug = params.slug?.join("/") || "";
  const doc = allDocs.find((doc) => doc.slugAsParams === slug);

  if (!doc) {
    return null;
  }

  return doc;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: absoluteUrl(doc.slug),
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [siteConfig.ogImage],
      creator: doc.author ? `@${doc.author}` : "@AnimataDesign",
    },
  };
}

export async function generateStaticParams() {
  return allDocs.map((doc) => ({
    slug: doc.slugAsParams.split("/"),
  }));
}

export default async function DocPage({ params }: Readonly<DocPageProps>) {
  const resolvedParams = await params;
  const doc = await getDocFromParams(resolvedParams);

  if (!doc) {
    notFound();
  }

  const toc = await getTableOfContents(doc.content);

  return (
    <main
      id="main-content"
      className="relative py-8 xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <article className="w-full min-w-0 max-w-[920px]">
        <div className="mb-5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap uppercase">Docs</div>
          <ChevronRightIcon className="h-3.5 w-3.5 opacity-80" />
          <NavMenu
            baseRoute="docs"
            sideBarNavItems={docsConfig.sidebarNav}
            value={doc.slugAsParams}
            triggerClassName="h-8"
          />
        </div>
        <header className="space-y-3">
          <h1 className={cn("scroll-m-20 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl")}>
            {doc.title}
          </h1>
          {doc.description && (
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground lg:text-[17px]">
              <Balancer>{doc.description}</Balancer>
            </p>
          )}
          <div
            className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", {
              invisible: !doc.labels?.length,
            })}
          >
            {doc.labels?.map((label) => {
              return (
                <span key={label} className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}>
                  {label}
                </span>
              );
            })}
          </div>
        </header>
        {doc.links ? (
          <div className="flex flex-wrap items-center gap-2 pt-5">
            {doc.links?.doc && (
              <Link
                href={doc.links.doc}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
              >
                Docs
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
            {doc.links?.api && (
              <Link
                href={doc.links.api}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
              >
                API Reference
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
          </div>
        ) : null}
        <div className="relative mt-4 w-fit overflow-y-hidden">
          <CarbonAds />
        </div>
        <div className="pb-12 pt-2">
          <Mdx code={doc.body} filePath={`content/${doc.path}.mdx`} />

          <div className="my-3 text-right">
            <Link
              href={`https://github.com/codse/animata/edit/main/content/docs/${doc.slugAsParams}.mdx`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-secondary-foreground underline"
            >
              Edit this page on GitHub
            </Link>
          </div>
        </div>
        <DocsPager doc={doc} />
      </article>
      {doc.toc && (
        <aside className="hidden text-sm xl:block">
          <div className="sticky top-20">
            <ScrollArea className="h-[calc(100vh-6.5rem)] pr-2">
              <div className="pb-8">
                <DashboardTableOfContents toc={toc} />
              </div>
            </ScrollArea>
          </div>
        </aside>
      )}
    </main>
  );
}
