import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { oppProductsApi, productsApi } from "../api/resources";
import { money } from "../components/Shared";

// Embed inside OpportunityDetail.jsx: <OpportunityProducts opportunityId={Number(id)} />
// Note: this shows a computed line-items total but does NOT overwrite the
// opportunity's own `amount` field — that stays a separate, manually-set
// value on the opportunity record. Wire that sync yourself if you want it;
// keeping them independent avoids silently changing a field you set by hand.
export default function OpportunityProducts({ opportunityId }) {
  const [lineItems, setLineItems] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([oppProductsApi.listFor(opportunityId), productsApi.list({ active: true })])
      .then(([items, products]) => {
        setLineItems(items);
        setCatalog(products);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [opportunityId]);

  const onProductChange = (e) => {
    const id = e.target.value;
    setProductId(id);
    const p = catalog.find((c) => String(c.product_id) === String(id));
    setUnitPrice(p ? p.price : "");
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!productId || !quantity || quantity <= 0) {
      setError("Pick a product and a quantity greater than 0");
      return;
    }
    setAdding(true);
    setError("");
    try {
      const saved = await oppProductsApi.upsert(opportunityId, {
        product_id: Number(productId),
        quantity: Number(quantity),
        unit_price: unitPrice === "" ? undefined : Number(unitPrice),
      });
      setLineItems((prev) => {
        const exists = prev.some((li) => li.product_id === saved.product_id);
        return exists ? prev.map((li) => (li.product_id === saved.product_id ? { ...li, ...saved } : li)) : [...prev, { ...saved, name: catalog.find((c) => c.product_id === saved.product_id)?.name }];
      });
      setProductId("");
      setQuantity(1);
      setUnitPrice("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const removeItem = async (productIdToRemove) => {
    try {
      await oppProductsApi.remove(opportunityId, productIdToRemove);
      setLineItems((prev) => prev.filter((li) => li.product_id !== productIdToRemove));
    } catch (err) {
      setError(err.message);
    }
  };

  const total = lineItems.reduce((sum, li) => sum + Number(li.unit_price) * Number(li.quantity), 0);

  if (loading) return null;

  return (
    <div className="dash-panel" style={{ marginTop: 16 }}>
      <div className="panel-title">Products</div>
      {error && <div className="form-error">{error}</div>}

      {lineItems.length > 0 && (
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Line total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li) => (
              <tr key={li.product_id}>
                <td>{li.name}</td>
                <td>{li.quantity}</td>
                <td>{money(li.unit_price)}</td>
                <td>{money(li.unit_price * li.quantity)}</td>
                <td>
                  <button className="icon-btn" onClick={() => removeItem(li.product_id)} title="Remove">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: 600 }}>Total</td>
              <td style={{ fontWeight: 600 }}>{money(total)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      )}
      {lineItems.length === 0 && <div className="empty-block">No products added yet.</div>}

      <form className="line-item-add-row" onSubmit={addItem}>
        <select value={productId} onChange={onProductChange}>
          <option value="">Select product…</option>
          {catalog.map((p) => (
            <option key={p.product_id} value={p.product_id}>{p.name}</option>
          ))}
        </select>
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" />
        <input type="number" min="0" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="Unit price" />
        <button type="submit" className="btn-secondary" disabled={adding}>{adding ? "Adding…" : "Add"}</button>
      </form>
    </div>
  );
}
