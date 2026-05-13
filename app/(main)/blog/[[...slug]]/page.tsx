import { ChevronRightIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Balancer from "react-wrap-balancer";
import { blogs as allBlogs } from "#site/content";
import NavMenu from "@/app/(main)/docs/[[...slug]]/nav-menu";
import { Mdx } from "@/components/mdx-components";
import { DocsPager } from "@/components/pager";
import { DashboardTableOfContents } from "@/components/toc";
import { badgeVariants } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { blogSidebarNav } from "@/config/blog";
import { siteConfig } from "@/config/site";
import { getTableOfContents } from "@/lib/toc";
import { absoluteUrl, cn } from "@/lib/utils";

import "@/styles/mdx.css";

interface BlogPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getBlogFromParams(params: { slug: string[] }) {
  const slug = params.slug?.join("/") || "";
  const blog = allBlogs.find((doc) => doc.slugAsParams === slug);

  if (!blog) {
    return null;
  }

  return blog;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlogFromParams(resolvedParams);

  if (!blog) {
    return {};
  }

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      url: absoluteUrl(blog.slug),
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
      title: blog.title,
      description: blog.description,
      images: [siteConfig.ogImage],
      creator: blog.author ? `@${blog.author}` : "@AnimataDesign",
    },
  };
}

export async function generateStaticParams() {
  return allBlogs.map((blog) => ({
    slug: blog.slugAsParams.split("/"),
  }));
}

export default async function BlogPage({ params }: Readonly<BlogPageProps>) {
  const resolvedParams = await params;
  const blog = await getBlogFromParams(resolvedParams);

  if (!blog) {
    notFound();
  }

  const toc = await getTableOfContents(blog.content);

  return (
    <main className="relative py-8 xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-10 2xl:grid-cols-[minmax(0,1fr)_18rem]">
      <article className="w-full min-w-0 max-w-[920px]">
        <div className="mb-5 flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap uppercase">Blog</div>
          <ChevronRightIcon className="h-3.5 w-3.5 opacity-80" />
          <NavMenu
            baseRoute="blog"
            sideBarNavItems={blogSidebarNav}
            value={blog.slugAsParams}
            triggerClassName="h-8"
          />
        </div>
        <header className="space-y-3">
          <h1 className={cn("scroll-m-20 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl")}>
            {blog.title}
          </h1>
          {blog.description && (
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground lg:text-[17px]">
              <Balancer>{blog.description}</Balancer>
            </p>
          )}
          <div
            className={cn("flex flex-wrap items-center gap-2 text-sm text-muted-foreground", {
              invisible: !blog.labels?.length,
            })}
          >
            {blog.labels?.map((label) => {
              return (
                <span key={label} className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}>
                  {label}
                </span>
              );
            })}
          </div>
        </header>
        {blog.links ? (
          <div className="flex flex-wrap items-center gap-2 pt-5">
            {blog.links?.doc && (
              <Link
                href={blog.links.doc}
                target="_blank"
                rel="noreferrer"
                className={cn(badgeVariants({ variant: "secondary" }), "gap-1")}
              >
                Docs
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            )}
            {blog.links?.api && (
              <Link
                href={blog.links.api}
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
        <div className="pb-12 pt-2">
          <Mdx code={blog.body} filePath={`content/${blog.path}.mdx`} />

          <div className="my-3 text-right">
            <Link
              href={`https://github.com/codse/animata/edit/main/content/blog/${blog.slugAsParams}.mdx`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-secondary-foreground underline"
            >
              Edit this page on GitHub
            </Link>
          </div>
        </div>
        <DocsPager doc={blog} />
      </article>
      {blog.toc && (
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
