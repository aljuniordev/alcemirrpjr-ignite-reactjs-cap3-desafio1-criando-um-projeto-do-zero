import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { FaCalendar, FaUserAlt } from "react-icons/fa";

import Prismic from "@prismicio/client";
import { useState } from "react";
import { getPrismicClient } from "../services/prismic";

import styles from "./home.module.scss";

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  async function handleLoadMorePosts(): Promise<void> {
    if (nextPage === null) {
      return;
    }

    const morePosts = await fetch(`${nextPage}`).then(res => res.json());

    setNextPage(morePosts.next_page);

    const newPosts = await morePosts.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    });

    setPosts([...posts, ...newPosts]);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <h1 className={styles.title}>{post.data.title}</h1>
                <span className={styles.subtitle}>{post.data.subtitle}</span>
                <div className={styles.info}>
                  <div className={styles.react_icons}>
                    <FaCalendar color="#BBBBBB" />
                  </div>
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM yyyy",
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <div className={styles.react_icons}>
                    <FaUserAlt color="#BBBBBB" />
                  </div>
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}

          {nextPage && (
            <button type="button" onClick={() => handleLoadMorePosts()}>
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at("document.type", "posts")],
    {
      fetch: ["posts.title", "posts.subtitle", "posts.author"],
      pageSize: 3,
    }
  );

  const postsFormated: Post[] = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsFormated,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 30,
  };
};
