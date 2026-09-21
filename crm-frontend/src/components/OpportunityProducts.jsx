import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Alert, Box,
  Table, TableHead, TableBody, TableRow, TableCell,
  Select, MenuItem, TextField, Button, IconButton,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { oppProductsApi, productsApi } from "../api/resources";
import { money } from "../components/Shared";

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
        return exists
          ? prev.map((li) => (li.product_id === saved.product_id ? { ...li, ...saved } : li))
          : [...prev, { ...saved, name: catalog.find((c) => c.product_id === saved.product_id)?.name }];
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
    <Card>
      <CardContent>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Products</Typography>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

        {lineItems.length > 0 ? (
          <Table size="small" sx={{ mb: 1.5 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Unit price</TableCell>
                <TableCell>Line total</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {lineItems.map((li) => (
                <TableRow key={li.product_id}>
                  <TableCell>{li.name}</TableCell>
                  <TableCell>{li.quantity}</TableCell>
                  <TableCell>{money(li.unit_price)}</TableCell>
                  <TableCell>{money(li.unit_price * li.quantity)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => removeItem(li.product_id)} title="Remove">
                      <Trash2 size={13} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 600, border: 0 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, border: 0 }}>{money(total)}</TableCell>
                <TableCell sx={{ border: 0 }} />
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>No products added yet.</Typography>
        )}

        <Box component="form" onSubmit={addItem} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Select size="small" displayEmpty value={productId} onChange={onProductChange} sx={{ flex: 2 }}>
            <MenuItem value="">Select product…</MenuItem>
            {catalog.map((p) => (
              <MenuItem key={p.product_id} value={p.product_id}>{p.name}</MenuItem>
            ))}
          </Select>
          <TextField
            type="number" size="small" inputProps={{ min: 1 }} value={quantity}
            onChange={(e) => setQuantity(e.target.value)} placeholder="Qty" sx={{ flex: 1, minWidth: 70 }}
          />
          <TextField
            type="number" size="small" inputProps={{ min: 0, step: 0.01 }} value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)} placeholder="Unit price" sx={{ flex: 1, minWidth: 90 }}
          />
          <Button type="submit" variant="outlined" disabled={adding}>{adding ? "Adding…" : "Add"}</Button>
        </Box>
      </CardContent>
    </Card>
  );
}