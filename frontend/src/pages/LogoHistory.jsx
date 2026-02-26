import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getLogoHistory } from "../services/logoService";

// Resolve logo URL — prepend API base if it's a relative path
const resolveUrl = (url) => {
    if (!url || url === "processing...") return null;
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
    return `${base}${url}`;
};

export default function LogoHistory() {
    const navigate = useNavigate();
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const LIMIT = 12;

    useEffect(() => {
        fetchLogos(page);
    }, [page]);

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
                window.open(url, "_blank");
            }
        } catch {
            window.open(url, "_blank");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
            {/* Header */}
            <header className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-lg" style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard">
                            <img src="/brandybot_icon.png" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow ring-2 ring-white/30" alt="BrandyBot" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white">My Logos</h1>
                            <p className="text-purple-200 text-xs sm:text-sm">Your generated logo history</p>
                        </div>
                    </div>
                </div>
                <Link
                    to="/logo_generator"
                    className="w-full sm:w-auto sm:ml-auto px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl text-center text-sm font-semibold transition shadow-sm"
                >
                    + Generate New
                </Link>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex gap-2">
                            {[0, 150, 300].map((d) => (
                                <div key={d} className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                            ))}
                        </div>
                    </div>
                ) : logos.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow border border-gray-100">
                        <span className="text-6xl block mb-4">🎨</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No logos yet</h2>
                        <p className="text-gray-500 mb-6">Start the 7-step interview to generate your first AI logo.</p>
                        <Link
                            to="/logo_generator"
                            className="px-6 py-3 text-white rounded-xl font-semibold text-sm inline-block hover:opacity-90 transition"
                            style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
                        >
                            Generate My First Logo
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-sm mb-6">
                            Showing {logos.length} of {pagination?.total || logos.length} logos
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {logos.map((logo) => {
                                const imgUrl = resolveUrl(logo.logo_url);
                                const isCompleted = logo.status === "completed" && imgUrl;
                                return (
                                    <div
                                        key={logo.id}
                                        className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition group"
                                    >
                                        {/* Logo image */}
                                        <div className="p-4 bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center h-44">
                                            {isCompleted ? (
                                                <img
                                                    src={imgUrl}
                                                    alt={logo.brand_name}
                                                    className="max-h-36 max-w-full object-contain rounded-lg"
                                                    onError={(e) => { e.target.style.display = "none"; }}
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <span className="text-4xl">{logo.status === "failed" ? "❌" : "⏳"}</span>
                                                    <p className="text-xs text-gray-400 mt-2 capitalize">{logo.status}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="px-4 py-3 border-t border-gray-50">
                                            <h3 className="font-bold text-gray-800 truncate">{logo.brand_name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {logo.created_at ? new Date(logo.created_at).toLocaleDateString() : ""}
                                            </p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${logo.status === "completed" ? "bg-green-100 text-green-700" :
                                                logo.status === "failed" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {logo.status}
                                            </span>
                                        </div>

                                        {/* Action buttons */}
                                        {isCompleted && (
                                            <div className="px-4 pb-4 flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleDownload(logo)}
                                                    className="w-full py-2 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition"
                                                    style={{ background: "linear-gradient(90deg, #7C3AED, #3B82F6)" }}
                                                >
                                                    ⬇ Download
                                                </button>
                                                <div className="flex gap-2">
                                                    <Link
                                                        to="/mockup_generator"
                                                        state={{ logoUrl: imgUrl, brandName: logo.brand_name }}
                                                        className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold text-center hover:bg-blue-700 transition"
                                                    >
                                                        👕 Mockups
                                                    </Link>
                                                    <Link
                                                        to="/brand_guidelines"
                                                        state={{
                                                            brandProfile: { brandName: logo.brand_name, industry: logo.industry || "" },
                                                            logoUrl: imgUrl
                                                        }}
                                                        className="flex-1 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold text-center hover:bg-green-700 transition"
                                                    >
                                                        📘 Guidelines
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center gap-3 mt-10">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    ← Prev
                                </button>
                                <span className="px-5 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl">
                                    Page {page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
