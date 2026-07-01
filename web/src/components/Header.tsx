import Link from "next/link";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <Link href="/" className="site-logo">
          Tarifhane
        </Link>
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
