/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from "next";
import { RichText } from "prismic-dom";
import Head from "next/head";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { FaCalendar, FaUserAlt, FaClock } from "react-icons/fa";
import Prismic from "@prismicio/client";

import { useRouter } from "next/router";
import { getPrismicClient } from "../../services/prismic";

import styles from "./post.module.scss";

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <img src={post.data.banner.url} alt="logo" className={styles.banner} />
      <main className={styles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FaCalendar />
                {format(new Date(post.first_publication_date), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </li>
              <li>
                <FaUserAlt />
                {post.data.author}
              </li>
              <li>
                <FaClock />4 min
              </li>
            </ul>
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

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();

  const { slug } = context.params;

  const res = await prismic.getByUID(`posts`, String(slug), {});

  const post = {
    uid: res.uid,
    first_publication_date: res.first_publication_date,
    data: {
      title: res.data.title,
      subtitle: res.data.subtitle,
      author: res.data.author,
      banner: {
        url: res.data.banner.url,
      },
      content: res.data.content.map(content => {
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
    },
  };
};
