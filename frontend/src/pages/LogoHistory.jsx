import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLogoHistory } from "../services/logoService";
import BrandGuidelinesModal from "../components/BrandGuidelinesModal";
import MockupModal from "../components/MockupModal";

const resolveUrl = (url) => {
    if (!url || url === "processing...") return null;
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
    return `${base}${url}`;
};

export default function LogoHistory() {
    const { user } = useAuth();
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [guidelinesModal, setGuidelinesModal] = useState({ open: false, logo: null });
    const [mockupModal, setMockupModal] = useState({ open: false, logo: null });
    const LIMIT = 12;

    useEffect(() => { fetchLogos(page); }, [page]);

    const fetchLogos = async (p) => {
        setLoading(true);
        try {
            const res = await getLogoHistory(p, LIMIT);
            setLogos(res.data || []);
            setPagination(res.pagination);
        } catch (err) {
            console.error("Failed to load logo history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (logo) => {
        const url = resolveUrl(logo.logo_url);
        if (!url) return;
        try {
            if (url.startsWith("data:")) {
                const link = document.createElement("a");
                link.href = url;
                link.download = `${logo.brand_name || "logo"}.png`;
                link.click();
            } else {
                const res = await fetch(url);
                const blob = await res.blob();
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${logo.brand_name || "logo"}.png`;
                link.click();
            }
        } catch {
            window.open(url, "_blank");
        }
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 md:pl-20 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex-shrink-0">
                <div>
                    <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">My Logos</h1>
                    <p className="text-sm text-[var(--text-muted)]">Your generated logo history</p>
                </div>
                <Link to="/logo-agent"
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-[var(--text-primary)] rounded-xl text-sm font-semibold transition border border-[var(--border-color)] shadow-sm">
                    + Generate New
                </Link>
            </div>

            <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex gap-2">
                            {[0, 150, 300].map(d => (
                                <div key={d} className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </div>
                    </div>
                ) : logos.length === 0 ? (
                    <div className="text-center py-24 glass-card rounded-3xl">
                        <span className="text-6xl block mb-4">🎨</span>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No logos yet</h2>
                        <p className="text-[var(--text-muted)] mb-6">Use the Logo Agent to generate your first AI-powered logo.</p>
                        <Link to="/logo-agent"
                            className="px-6 py-3 text-white rounded-xl font-semibold text-sm inline-block hover:opacity-90 transition brand-gradient">
                            Generate My First Logo
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-[var(--text-muted)] text-sm mb-6">
                            Showing {logos.length} of {pagination?.total || logos.length} logos
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {logos.map(logo => {
                                const imgUrl = resolveUrl(logo.logo_url);
                                const isCompleted = logo.status === "completed" && imgUrl;
                                return (
                                    <div key={logo.id}
                                        className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 group">
                                        {/* Logo preview */}
                                        <div className="p-4 flex items-center justify-center h-44"
                                             style={{ background: 'linear-gradient(135deg, var(--bg-secondary), rgba(124,58,237,0.08))' }}>
                                            {isCompleted ? (
                                                <img src={imgUrl} alt={logo.brand_name}
                                                    className="max-h-36 max-w-full object-contain rounded-lg"
                                                    onError={e => { e.target.style.display = "none"; }} />
                                            ) : (
                                                <div className="text-center">
                                                    <span className="text-4xl">{logo.status === "failed" ? "❌" : "⏳"}</span>
                                                    <p className="text-xs text-[var(--text-muted)] mt-2 capitalize">{logo.status}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="px-4 py-3 border-t border-[var(--border-color)]">
                                            <h3 className="font-bold truncate text-sm text-[var(--text-primary)]">{logo.brand_name}</h3>
                                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                {logo.style && <span className="capitalize">{logo.style} · </span>}
                                                {logo.created_at ? new Date(logo.created_at).toLocaleDateString() : ""}
                                            </p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                                                ${logo.status === "completed" ? "bg-green-500/20 text-green-400" :
                                                  logo.status === "failed"    ? "bg-red-500/20 text-red-400" :
                                                                                "bg-yellow-500/20 text-yellow-400"}`}>
                                                {logo.status}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {isCompleted && (
                                            <div className="px-4 pb-4 flex flex-col gap-2">
                                                <button onClick={() => handleDownload(logo)}
                                                    className="w-full py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition brand-gradient">
                                                    ⬇ Download
                                                </button>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => setMockupModal({ open: true, logo: { ...logo, logo_url: imgUrl } })}
                                                        className="py-2 rounded-xl text-xs font-semibold text-white text-center transition hover:opacity-90"
                                                        style={{ background: 'linear-gradient(90deg,#3B82F6,#06b6d4)' }}>
                                                        👕 Mockups
                                                    </button>
                                                    <button
                                                        onClick={() => setGuidelinesModal({ open: true, logo: { ...logo, logo_url: imgUrl } })}
                                                        className="py-2 rounded-xl text-xs font-semibold text-white text-center transition hover:opacity-90"
                                                        style={{ background: 'linear-gradient(90deg,#059669,#10b981)' }}>
                                                        📋 Guidelines
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center gap-3 mt-10">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    className="px-5 py-2 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 transition">
                                    ← Prev
                                </button>
                                <span className="px-5 py-2 text-sm text-[var(--text-secondary)] glass-card rounded-xl">
                                    Page {page} of {pagination.pages}
                                </span>
                                <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}
                                    className="px-5 py-2 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40 transition">
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Inline Modals */}
            {guidelinesModal.open && (
                <BrandGuidelinesModal
                    logo={guidelinesModal.logo}
                    brandContext={{ brandName: guidelinesModal.logo?.brand_name, industry: guidelinesModal.logo?.industry }}
                    onClose={() => setGuidelinesModal({ open: false, logo: null })}
                />
            )}
            {mockupModal.open && (
                <MockupModal
                    logo={mockupModal.logo}
                    onClose={() => setMockupModal({ open: false, logo: null })}
                />
            )}
        </div>
    );
}
