import React, { useEffect, useState } from "react";
import { Search, Pencil } from "lucide-react";
import { productsApi } from "../api/resources";
import { DataTable, money } from "../components/Shared";
import ProductModal from "../components/ProductModal";
import { DetailSkeleton } from "../components/Skeleton";


export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showNew, setShowNew] = useState(false);
  

  useEffect(() => {
    productsApi.list()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

    //skeleton loader
    if (loading) return <DetailSkeleton />;
    if (error) return <div className="view"><div className="form-error">{error}</div></div>;

  const handleSaved = (saved) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.product_id === saved.product_id);
      return exists ? prev.map((p) => (p.product_id === saved.product_id ? saved : p)) : [saved, ...prev];
    });
    setEditingProduct(null);
    setShowNew(false);
  };

  const toggleActive = async (product) => {
    try {
      const updated = await productsApi.update(product.product_id, { is_active: !product.is_active });
      setProducts((prev) => prev.map((p) => (p.product_id === updated.product_id ? updated : p)));
    } catch (err) {
      setError(err.message);
    }
  };

  const rows = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="view">
      <div className="pb-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Products</h1>
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => setShowNew(true)}>New Product</button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <DataTable
        loading={loading}
        emptyMessage="No products yet."
        columns={[
          { key: "name", label: "Name", render: (r) => <strong>{r.name}</strong> },
          { key: "price", label: "Price", render: (r) => money(r.price) },
          { key: "description", label: "Description" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <button
                className={`status-toggle ${r.is_active ? "active" : "inactive"}`}
                onClick={(e) => { e.stopPropagation(); toggleActive(r); }}
              >
                {r.is_active ? "Active" : "Inactive"}
              </button>
            ),
          },
          {
            key: "action",
            label: "",
            render: (r) => (
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setEditingProduct(r); }}>
                <Pencil size={14} />
              </button>
            ),
          },
        ]}
        rows={rows}
      />

      {showNew && <ProductModal onClose={() => setShowNew(false)} onSaved={handleSaved} />}
      {editingProduct && (
        <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={handleSaved} />
      )}
    </div>
  );
}
