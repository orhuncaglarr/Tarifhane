import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link href="/" className="site-logo">
          Tarifhane
        </Link>
        <SearchBar />
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
