/* eslint-disable react/no-danger */
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaCalendar, FaUserAlt, FaClock } from "react-icons/fa";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { RichText } from "prismic-dom";
import Prismic from "@prismicio/client";
import { getPrismicClient } from "../../services/prismic";

import Header from "../../components/Header";
import Comments from "../../components/Comments";

import styles from "./post.module.scss";
import commonStyles from "../../styles/common.module.scss";

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
  navigation: {
    prevPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
    nextPost: {
      uid: string;
      data: {
        title: string;
      };
    }[];
  };
}

export default function Post({
  post,
  preview,
  navigation,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  const readTime = `10`;

  const formatedDate = format(
    new Date(post.first_publication_date),
    "dd MMM yyyy",
    {
      locale: ptBR,
    }
  );

  const isPostEdited =
    post.first_publication_date !== post.last_publication_date;

  let editionDate;
  if (isPostEdited) {
    editionDate = format(
      new Date(post.last_publication_date),
      "'* editado em' dd MMM yyyy', as' H':'m",
      {
        locale: ptBR,
      }
    );
  }

  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={styles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FaCalendar />
                {formatedDate}
              </li>
              <li>
                <FaUserAlt />
                {post.data.author}
              </li>
              <li>
                <FaClock />
                {`${readTime} min`}
              </li>
            </ul>
            <span>{isPostEdited && editionDate}</span>
          </div>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            );
          })}
        </div>

        <section className={`${styles.navigation} ${styles.container}`}>
          {navigation?.prevPost.length > 0 && (
            <div>
              <h3>{navigation.prevPost[0].data.title}</h3>
              <Link href={`/post/${navigation.prevPost[0].uid}`}>
                <a>Post anterior</a>
              </Link>
            </div>
          )}

          {navigation?.nextPost.length > 0 && (
            <div>
              <h3>{navigation.nextPost[0].data.title}</h3>
              <Link href={`/post/${navigation.nextPost[0].uid}`}>
                <a>Próximo post</a>
              </Link>
            </div>
          )}
        </section>

        <Comments />

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a className={commonStyles.preview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at(`document.type`, `posts`),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID("posts", String(slug), {
    ref: previewData?.ref || null,
  });

  const prevPost = await prismic.query(
    [Prismic.Predicates.at("document.type", "posts")],
    {
      pageSize: 1,
      after: response.id,
      orderings: "[document.first_publication_date]",
    }
  );

  const nextPost = await prismic.query(
    [Prismic.Predicates.at("document.type", "posts")],
    {
      pageSize: 1,
      after: response.id,
      orderings: "[document.last_publication_date desc]",
    }
  );

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  return {
    props: {
      post,
      preview,
      navigation: {
        prevPost: prevPost?.results,
        nextPost: nextPost?.results,
      },
    },
    revalidate: 1800,
  };
};
