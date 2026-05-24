'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Reservation, ReservationStatus } from '@/types';
import Link from 'next/link';

const statusColors: Record<ReservationStatus, 'default' | 'outline' | 'secondary' | 'destructive'> = {
  PENDING: 'default',
  CONFIRMED: 'secondary',
  RELEASED: 'outline',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/reservations')
      .then((res) => setReservations(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading reservations...</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Reservations</h1>
        <Link href="/">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>

      {reservations.length === 0 ? (
        <p className="text-slate-500">No reservations yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer hover:bg-slate-50"
                onClick={() => router.push(`/reservations/${r.id}`)}
              >
                <TableCell>{r.product.name}</TableCell>
                <TableCell>{r.warehouse.name}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[r.status]}>{r.status}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(r.expiresAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}