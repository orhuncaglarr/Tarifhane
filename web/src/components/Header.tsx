import Link from "next/link";
import SiteLogo from "./SiteLogo";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <SiteLogo />
        <nav className="site-nav">
          <Link href="/tarif/yeni">Tarif Ekle</Link>
          <Link href="/profil" className="avatar-circle" aria-label="Profilim">
            👤
          </Link>
        </nav>
      </div>
    </header>
  );
}
