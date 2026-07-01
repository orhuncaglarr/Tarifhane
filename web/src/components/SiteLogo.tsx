"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SiteLogo() {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;

    e.preventDefault();
    router.replace("/");
    window.dispatchEvent(new Event("tarifhane:home-reset"));
  }

  return (
    <Link href="/" className="site-logo" onClick={handleClick}>
      Tarifhane
    </Link>
  );
}
