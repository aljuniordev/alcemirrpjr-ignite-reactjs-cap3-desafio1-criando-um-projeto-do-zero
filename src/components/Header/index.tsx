import Link from "next/link";
import Image from "next/image";

import styles from "./header.module.scss";

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Link href="/">
          <a>
            <Image
              src="/public/images/logo.svg"
              alt="logo"
              width={40}
              height={23}
            />
            {/* <span className={styles.logoName}>spacetraveling</span>
            <span className={styles.logoDot}>.</span> */}
          </a>
        </Link>
      </div>
    </header>
  );
}
