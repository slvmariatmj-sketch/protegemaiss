import logo from "@/assets/protege-mais-logo.png.asset.json";

export function ProtegeLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src={logo.url} alt="Protege Mais" className={className} />;
}