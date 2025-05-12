import { notFound } from "next/navigation";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { baseUrl } from "app/sitemap";

const authorMapping: Record<string, { name: string; image: string }> = {
  Симоненко: {
    name: "Василь Симоненко",
    image: "/assets/Symonenko.png",
  },
  Леся: {
    name: "Леся Українка",
    image: "/assets/Lesya.png",
  },
};

const getAuthorDetails = (author: string) =>
  authorMapping[author] || { name: author, image: "/assets/unknown.png" };

export async function generateStaticParams() {
  let posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  const authorDetails = getAuthorDetails(post.metadata.author);

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : null,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: authorDetails.name,
            },
          }),
        }}
      />
      <div className="flex space-x-4 justify-center items-center">
        <div className="flex flex-1">
          <img width="400px" height="auto" src={authorDetails.image} />
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="title font-semibold text-2xl tracking-tighter">
            {post.metadata.title}
          </h1>
          <div className="flex justify-between items-center mt-2 text-sm">
            <p className="text-sm text-neutral-600">
              {formatDate(post.metadata.publishedAt)}
            </p>
          </div>
          <div className="flex justify-between items-center mt-2 mb-8 text-sm">
            <p className="text-sm text-neutral-600">{authorDetails.name}</p>
          </div>
          <article className="prose">
            <CustomMDX source={post.content} />
          </article>
        </div>
      </div>
    </section>
  );
}
