import React, { useEffect, useState } from "react";
import {
  Box, Typography, TextField, InputAdornment, Button, IconButton, Chip,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Alert,
} from "@mui/material";
import { Search, Pencil } from "lucide-react";
import { productsApi } from "../api/resources";
import { money } from "../components/Shared";
import ProductModal from "../components/ProductModal";

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
    <Box className="view">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, gap: 1.5, flexWrap: "wrap" }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Products</Typography>
        <TextField
          size="small"
          placeholder="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={14} /></InputAdornment> }}
          sx={{ width: 220 }}
        />
        <Button variant="contained" onClick={() => setShowNew(true)}>New Product</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={5} align="center">Loading…</TableCell></TableRow>
            )}
            {!loading && rows.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">No products yet.</TableCell></TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.product_id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                <TableCell>{money(r.price)}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>
                  <Chip
                    label={r.is_active ? "Active" : "Inactive"}
                    size="small"
                    onClick={() => toggleActive(r)}
                    color={r.is_active ? "success" : "default"}
                    variant={r.is_active ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditingProduct(r)}>
                    <Pencil size={14} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showNew && <ProductModal onClose={() => setShowNew(false)} onSaved={handleSaved} />}
      {editingProduct && (
        <ProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={handleSaved} />
      )}
    </Box>
  );
}