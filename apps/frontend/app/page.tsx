'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Product, Stock } from '@/types';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<Record<string, number>>({});
  const [reserving, setReserving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get('/products')
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getAvailable = (stock: Stock[]) => {
    return stock.map((s) => ({
      ...s,
      available: s.total - s.reserved,
    }));
  };

  const handleReserve = async (productId: string) => {
    const warehouseId = selectedWarehouse[productId];
    const qty = quantity[productId] || 1;

    if (!warehouseId) {
      setMessage('Please select a warehouse');
      return;
    }

    setReserving(productId);
    setMessage(null);

    try {
      await api.post('/reservations', {
        productId,
        warehouseId,
        quantity: qty,
        idempotencyKey: `${productId}-${warehouseId}-${Date.now()}`,
      });
      setMessage('Reservation created successfully');
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    } finally {
      setReserving(null);
    }
  };

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/reservations">
          <Button variant="outline">View Reservations</Button>
        </Link>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded bg-slate-100 text-slate-800 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => {
          const stockWithAvailable = getAvailable(product.stock);
          return (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
                  </div>
                  <Badge variant="outline">Rs. {Number(product.price).toFixed(2)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Stock by warehouse:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {stockWithAvailable.map((s) => (
                      <div key={s.id} className="text-sm p-2 bg-slate-50 rounded">
                        <p className="font-medium">{s.warehouse.name}</p>
                        <p className="text-slate-500">
                          {s.available} available / {s.total} total
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Select
                    onValueChange={(val) =>
                      setSelectedWarehouse((prev) => ({ ...prev, [product.id]: val }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {stockWithAvailable.map((s) => (
                        <SelectItem key={s.warehouseId} value={s.warehouseId}>
                          {s.warehouse.name} ({s.available} left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="w-20 border rounded px-2 py-1 text-sm"
                    onChange={(e) =>
                      setQuantity((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))
                    }
                  />

                  <Button
                    onClick={() => handleReserve(product.id)}
                    disabled={reserving === product.id}
                  >
                    {reserving === product.id ? 'Reserving...' : 'Reserve'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}